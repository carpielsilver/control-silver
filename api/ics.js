import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) { res.status(400).send('Falta id'); return; }
  try {
    const data = await kv.get(KEY);
    const booking = (data?.bookings || []).find(b => b.id === id);
    if (!booking) { res.status(404).send('No encontrada'); return; }
    const inventory = data?.inventory || [];
    const dtStart = booking.dateStart.replace(/-/g, '');
    const endDate = new Date(booking.dateEnd + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
    const dtEnd = endDate.toISOString().slice(0, 10).replace(/-/g, '');
    const itemNames = (booking.items || []).map(i => {
      const inv = inventory.find(x => x.id === i.itemId);
      return `${inv ? inv.name : i.itemId}×${i.qty}`;
    }).join(', ');
    const desc = [`Cliente: ${booking.client}`,`Tel: ${booking.telefono||'—'}`,`Letras: ${itemNames}`,`Cobro: $${booking.income}`,booking.horaEntrega?`Entrega: ${booking.horaEntrega}`:'',booking.notas?`Notas: ${booking.notas}`:''].filter(Boolean).join('\\n');
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Control Silver//ES','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${booking.id}@controlsilver`,`DTSTART;VALUE=DATE:${dtStart}`,`DTEND;VALUE=DATE:${dtEnd}`,`SUMMARY:Evento letras — ${booking.client}`,`DESCRIPTION:${desc}`,`LOCATION:${booking.direccion||''}`, 'END:VEVENT','END:VCALENDAR'].join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="evento.ics"`);
    res.status(200).send(ics);
  } catch (err) {
    res.status(500).send('Error: ' + String(err));
  }
}
