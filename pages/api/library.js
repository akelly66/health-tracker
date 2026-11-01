import { sql } from '@vercel/postgres';
import { isYmd, normalizeMeal } from '../../lib/nutrition';

// Saved meals and recipes. Macros are per one serving. servings_left is optional: portions left from a batch.
const clean = (r) => ({
  id: r.id,
  name: r.name,
  calories: r.calories,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
  fiber: r.fiber,
  notes: r.notes || '',
  servings_left: r.servings_left != null ? Number(r.servings_left) : null,
  use_count: r.use_count,
  last_used: r.last_used || null,
});

const optServings = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n * 100) / 100, 999) : null;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, name, calories, protein, carbs, fat, fiber, notes, servings_left, use_count,
               to_char(last_used, 'YYYY-MM-DD') AS last_used
        FROM library
        ORDER BY last_used DESC NULLS LAST, use_count DESC, name ASC
        LIMIT 300
      `;
      return res.status(200).json({ items: rows.map(clean) });
    }

    if (req.method === 'DELETE') {
      const id = parseInt(req.query.id, 10);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'An id is required' });
      await sql`DELETE FROM library WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const b = req.body || {};

    // Adding a serving to a day: remember it, and count down the leftovers if they're being tracked.
    if (b.action === 'use') {
      const id = parseInt(b.id, 10);
      const servings = Number(b.servings);
      if (!Number.isInteger(id) || !(servings > 0 && servings <= 20)) return res.status(400).json({ error: 'An id and servings are required' });
      const date = isYmd(b.date) ? b.date : null;
      const { rows } = await sql`
        UPDATE library SET
          use_count = use_count + 1,
          last_used = COALESCE(${date}::date, CURRENT_DATE),
          servings_left = CASE WHEN servings_left IS NULL THEN NULL ELSE GREATEST(servings_left - ${servings}, 0) END
        WHERE id = ${id}
        RETURNING id, name, calories, protein, carbs, fat, fiber, notes, servings_left, use_count, to_char(last_used, 'YYYY-MM-DD') AS last_used
      `;
      if (!rows.length) return res.status(404).json({ error: 'That meal is no longer in your library' });
      return res.status(200).json({ item: clean(rows[0]) });
    }

    // Create or update.
    if (typeof b.name !== 'string' || !b.name.trim()) return res.status(400).json({ error: 'A name is required' });
    const meal = normalizeMeal(b);
    const notes = typeof b.notes === 'string' ? b.notes.trim().slice(0, 3000) : '';
    const left = optServings(b.servings_left);
    const id = b.id !== undefined && b.id !== null && b.id !== '' ? parseInt(b.id, 10) : null;

    if (id !== null) {
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
      const { rows } = await sql`
        UPDATE library SET name = ${meal.name}, calories = ${meal.calories}, protein = ${meal.protein}, carbs = ${meal.carbs},
                           fat = ${meal.fat}, fiber = ${meal.fiber}, notes = ${notes}, servings_left = ${left}
        WHERE id = ${id}
        RETURNING id, name, calories, protein, carbs, fat, fiber, notes, servings_left, use_count, to_char(last_used, 'YYYY-MM-DD') AS last_used
      `;
      if (!rows.length) return res.status(404).json({ error: 'That meal is no longer in your library' });
      return res.status(200).json({ item: clean(rows[0]) });
    }

    const { rows } = await sql`
      INSERT INTO library (name, calories, protein, carbs, fat, fiber, notes, servings_left)
      VALUES (${meal.name}, ${meal.calories}, ${meal.protein}, ${meal.carbs}, ${meal.fat}, ${meal.fiber}, ${notes}, ${left})
      RETURNING id, name, calories, protein, carbs, fat, fiber, notes, servings_left, use_count, to_char(last_used, 'YYYY-MM-DD') AS last_used
    `;
    return res.status(200).json({ item: clean(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
