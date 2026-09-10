import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';

const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const NUMEROS = '0123456789'.split('');
const esLetraONum = (id) => ALFABETO.includes(id) || NUMEROS.includes(id);

const fmtM = (n) =>
  '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function letrasDeReserva(b) {
  if (b.texto && String(b.texto).trim()) return String(b.texto).trim().toUpperCase();
  const ls = (b.items || []).filter((i) => esLetraONum(i.itemId));
  if (!ls.length) return 'Renta';
  return ls.map((i) => (i.qty > 1 ? `${i.itemId}x${i.qty}` : i.itemId)).join('');
}

function ubicacionCorta(b) {
  return (b.lugar && String(b.lugar).trim()) || (b.direccion && String(b.direccion).trim()) || 'Sin ubicación';
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
    const anticipo = Number(booking.anticipo) || 0;
    const restante = total - anticipo;
    const extras = (booking.items || [])
      .filter((i) => !esLetraONum(i.itemId))
      .map((i) => {
        const inv = inventory.find((x) => x.id === i.itemId);
        return `${inv ? inv.name : i.itemId}×${i.qty}`;
      })
      .join(', ');

    const title = encodeURIComponent(`${letrasDeReserva(booking)} — ${ubicacionCorta(booking)}`);
    const details = encodeURIComponent(
      [
        `Cliente: ${booking.client || '—'}`,
        `Letras: ${letrasDeReserva(booking)}`,
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
