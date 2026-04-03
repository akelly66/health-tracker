import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');

  const raw = parseInt(req.query.days, 10);
  const days = Math.min(Math.max(Number.isFinite(raw) ? raw : 60, 1), 400);

  try {
    const { rows } = await sql`
      SELECT date, calories, protein, carbs, fat, weight, active_calories, meal_log
      FROM entries
      ORDER BY date DESC
      LIMIT ${days}
    `;
    res.status(200).json({ entries: [...rows].reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
