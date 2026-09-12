import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';

const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const NUMEROS = '0123456789'.split('');
const esLetraONum = (id) => ALFABETO.includes(id) || NUMEROS.includes(id);

const fmtM = (n) =>
  '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function nombreItem(id, inventory) {
  const inv = (inventory || []).find((x) => x.id === id);
  return inv ? inv.name : id;
}

function esCorona(id, inventory) {
  return String(id).toLowerCase().includes('corona') ||
         String(nombreItem(id, inventory)).toLowerCase().includes('corona');
}

function tieneCorona(b, inventory) {
  if (b.corona === true) return true;
  return (b.items || []).some((i) => !esLetraONum(i.itemId) && esCorona(i.itemId, inventory));
}

function textoLetras(b) {
  if (b.texto && String(b.texto).trim()) return String(b.texto).trim().toUpperCase();
  const ls = (b.items || []).filter((i) => esLetraONum(i.itemId));
  if (!ls.length) return 'Renta';
  return ls.map((i) => i.itemId.repeat(i.qty)).join('');
}

function letrasDeReserva(b, inventory) {
  return textoLetras(b) + (tieneCorona(b, inventory) ? ' 👑' : '');
}

function extrasDeReserva(b, inventory) {
  return (b.items || [])
    .filter((i) => !esLetraONum(i.itemId) && !esCorona(i.itemId, inventory))
    .map((i) => (i.qty > 1 ? `${nombreItem(i.itemId, inventory)} ×${i.qty}` : nombreItem(i.itemId, inventory)))
    .join(', ');
}

// ─── ABONOS (misma lógica que index.html) ───────────────
function abonosDe(b) {
  if (b.abonos && b.abonos.length) return b.abonos;
  const legacy = [];
  if (Number(b.anticipo) > 0) {
    legacy.push({ id: 'legacy-ant', fecha: b.dateStart, monto: Number(b.anticipo), metodo: b.metodo || '' });
  }
  if (b.saldoPagado) {
    const rest = (Number(b.income) || 0) - (Number(b.anticipo) || 0);
    if (rest > 0) legacy.push({ id: 'legacy-saldo', fecha: b.dateStart, monto: rest, metodo: b.metodoSaldo || '' });
  }
  return legacy;
}
function totalAbonado(b) {
  return abonosDe(b).reduce((s, a) => s + (Number(a.monto) || 0), 0);
}
function restanteDe(b) {
  return Math.max(0, (Number(b.income) || 0) - totalAbonado(b));
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) { res.status(400).send('Falta id'); return; }
  try {
    const data = await kv.get(KEY);
    const booking = (data?.bookings || []).find(b => b.id === id);
    if (!booking) { res.status(404).send('No encontrada'); return; }

    const inventory = data?.inventory || [];
    const start = booking.dateStart.replace(/-/g, '');
    const endDate = new Date(booking.dateEnd + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
    const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');

    const total = Number(booking.income) || 0;
    const anticipo = totalAbonado(booking);
    const restante = restanteDe(booking);
    const extras = extrasDeReserva(booking, inventory);

    const title = encodeURIComponent(`${letrasDeReserva(booking, inventory)} — ${booking.client || 'Cliente'}`);
    const details = encodeURIComponent(
      [
        `Cliente: ${booking.client || '—'}`,
        `Letras: ${letrasDeReserva(booking, inventory)}`,
        extras ? `Extras: ${extras}` : null,
        `Ubicación: ${booking.direccion || '—'}`,
        `Teléfono: ${booking.telefono || '—'}`,
        `Costo total: ${fmtM(total)}`,
        `Anticipo: ${fmtM(anticipo)}`,
        `Restante: ${fmtM(restante)}`,
        (booking.horaEntrega || booking.horaRecoleccion)
          ? `Entrega: ${booking.horaEntrega || '—'} · Recolección: ${booking.horaRecoleccion || '—'}`
          : null,
        booking.notes ? `Notas: ${booking.notes}` : null,
      ].filter(Boolean).join('\n')
    );
    const location = encodeURIComponent(booking.direccion || '');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

    res.redirect(302, gcalUrl);
  } catch (err) {
    res.status(500).send('Error: ' + String(err));
  }
}
