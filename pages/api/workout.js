import { sql } from '@vercel/postgres';
import { isYmd } from '../../lib/nutrition';

// Logs a finished interval-timer workout. Unlike /api/sync (which replaces active_calories for the day),
// this ADDS to it, so several workouts in one day accumulate. Requires WORKOUT_SECRET in the
// x-workout-secret header, and refuses every request when the secret isn't configured.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.WORKOUT_SECRET;
  if (!secret || req.headers['x-workout-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { date, name, seconds, est_calories } = req.body || {};
  if (!isYmd(date)) return res.status(400).json({ error: 'A valid date (like 2026-01-31) is required' });

  const secs = Math.round(Number(seconds));
  const cals = Math.round(Number(est_calories));
  if (!Number.isFinite(secs) || secs < 1 || secs > 86400) return res.status(400).json({ error: 'seconds must be 1 to 86400' });
  if (!Number.isFinite(cals) || cals < 0 || cals > 5000) return res.status(400).json({ error: 'est_calories must be 0 to 5000' });
  const label = (typeof name === 'string' && name.trim() ? name.trim() : 'Workout').slice(0, 60);

  try {
    // One statement, so the workout row and the day's burn can't get out of step.
    const { rows } = await sql`
      WITH w AS (
        INSERT INTO workouts (date, name, seconds, est_calories)
        VALUES (${date}::date, ${label}, ${secs}, ${cals})
        RETURNING id
      )
      INSERT INTO entries (date, active_calories)
      VALUES (${date}::date, ${cals})
      ON CONFLICT (date) DO UPDATE SET
        active_calories = COALESCE(entries.active_calories, 0) + EXCLUDED.active_calories,
        updated_at = NOW()
      RETURNING active_calories
    `;
    res.json({ ok: true, active_calories: Number(rows[0].active_calories) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
