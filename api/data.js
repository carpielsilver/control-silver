import { kv } from '@vercel/kv';

const KEY = 'silver-app-data';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await kv.get(KEY);
      res.status(200).json(data || { inventory:[], bookings:[], expenses:[], expCategories:[], projects:[], cotizaciones:[], materials:[], photos:{}, repairs:[] });
      return;
    }
    if (req.method === 'POST') {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: 'Cuerpo inválido' });
        return;
      }
      await kv.set(KEY, body);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor', detail: String(err) });
  }
}
