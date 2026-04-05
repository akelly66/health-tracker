import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    date,
    calories,
    protein,
    carbs,
    fat,
    meal_log,
    weight,
    active_calories,
  } = req.body;

  if (!date) return res.status(400).json({ error: 'date required' });

  const w = weight !== undefined && weight !== null && weight !== '' ? Number(weight) : null;
  const ac =
    active_calories !== undefined && active_calories !== null && active_calories !== ''
      ? parseInt(active_calories, 10)
      : null;

  try {
    await sql`
      INSERT INTO entries (date, calories, protein, carbs, fat, meal_log, weight, active_calories)
      VALUES (
        ${date}::date,
        ${Math.round(Number(calories) || 0)},
        ${Math.round(Number(protein) || 0)},
        ${Math.round(Number(carbs) || 0)},
        ${Math.round(Number(fat) || 0)},
        ${meal_log ?? ''},
        ${w},
        ${ac}
      )
      ON CONFLICT (date) DO UPDATE SET
        calories = EXCLUDED.calories,
        protein = EXCLUDED.protein,
        carbs = EXCLUDED.carbs,
        fat = EXCLUDED.fat,
        meal_log = EXCLUDED.meal_log,
        weight = COALESCE(EXCLUDED.weight, entries.weight),
        active_calories = COALESCE(EXCLUDED.active_calories, entries.active_calories),
        updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
