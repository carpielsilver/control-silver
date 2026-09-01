import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await kv.get(KEY);
      res.status(200).json(data || { inventory:[], bookings:[], expenses:[], expCategories:[], projects:[] });
      return;
    }
    if (req.method === 'POST') {
      const body = req.body;
      if (!body || typeof body !== 'object') { res.status(400).json({ error: 'Inválido' }); return; }
      await kv.set(KEY, body);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    res.status(500).json({ error: 'Error', detail: String(err) });
  }
}
