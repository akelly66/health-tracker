import { sql } from '@vercel/postgres';
import { isYmd } from '../../lib/nutrition';

// Fields left out of the body keep their stored value, so a caller can log just
// a weight or just active calories without touching meals and macros.
const optInt = (v) => (v === undefined || v === null || v === '' ? null : Math.round(Number(v) || 0));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    date,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    meal_log,
    weight,
    active_calories,
  } = req.body || {};

  if (!isYmd(date)) return res.status(400).json({ error: 'A valid date (like 2026-01-31) is required' });

  const w = weight !== undefined && weight !== null && weight !== '' && Number.isFinite(Number(weight)) ? Number(weight) : null;
  const ac =
    active_calories !== undefined && active_calories !== null && active_calories !== ''
      ? parseInt(active_calories, 10)
      : null;
  const acSafe = Number.isFinite(ac) ? ac : null;
  const cal = optInt(calories);
  const pro = optInt(protein);
  const carb = optInt(carbs);
  const f = optInt(fat);
  const fib = optInt(fiber);
  const log = meal_log === undefined || meal_log === null ? null : String(meal_log);

  try {
    await sql`
      INSERT INTO entries (date, calories, protein, carbs, fat, fiber, meal_log, weight, active_calories)
      VALUES (
        ${date}::date,
        ${cal ?? 0},
        ${pro ?? 0},
        ${carb ?? 0},
        ${f ?? 0},
        ${fib ?? 0},
        ${log ?? ''},
        ${w},
        ${acSafe}
      )
      ON CONFLICT (date) DO UPDATE SET
        calories = COALESCE(${cal}::int, entries.calories),
        protein = COALESCE(${pro}::int, entries.protein),
        carbs = COALESCE(${carb}::int, entries.carbs),
        fat = COALESCE(${f}::int, entries.fat),
        fiber = COALESCE(${fib}::int, entries.fiber),
        meal_log = COALESCE(${log}::text, entries.meal_log),
        weight = COALESCE(EXCLUDED.weight, entries.weight),
        active_calories = COALESCE(EXCLUDED.active_calories, entries.active_calories),
        updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
