import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) { res.status(400).send('Falta id'); return; }
  try {
    const data = await kv.get(KEY);
    const booking = (data?.bookings || []).find(b => b.id === id);
    if (!booking) { res.status(404).send('No encontrada'); return; }

    const start = booking.dateStart.replace(/-/g, '');
    const endDate = new Date(booking.dateEnd + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
    const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');
    const title = encodeURIComponent(`Evento letras — ${booking.client}`);
    const details = encodeURIComponent(
      `Cliente: ${booking.client}\nTel: ${booking.telefono||'—'}\nCobro: $${booking.income}${booking.direccion?'\nDirección: '+booking.direccion:''}`
    );
    const location = encodeURIComponent(booking.direccion || '');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

    res.redirect(302, gcalUrl);
  } catch (err) {
    res.status(500).send('Error: ' + String(err));
  }
}
