import { sql } from '@vercel/postgres';
import { parseMealLogText } from '../../lib/mealLog';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');

  const now = new Date();
  const date =
    req.query.date ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  try {
    const { rows } = await sql`SELECT * FROM entries WHERE date = ${date}::date`;
    if (!rows.length) return res.status(200).json({ found: false });

    const row = rows[0];
    const mealLogText = row.meal_log || '';
    const meals = parseMealLogText(mealLogText);

    res.status(200).json({
      found: true,
      calories: row.calories ?? 0,
      protein: row.protein ?? 0,
      carbs: row.carbs ?? 0,
      fat: row.fat ?? 0,
      weight: row.weight != null ? Number(row.weight) : null,
      active_calories: row.active_calories != null ? Number(row.active_calories) : null,
      meal_log: mealLogText,
      meals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
