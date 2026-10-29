import { sql } from '@vercel/postgres';
import { isYmd } from '../../lib/nutrition';

// A plan for one day, written the evening before: how to move, when, how to set it up, and the meals.
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const dates = String(req.query.dates || '').split(',').map((d) => d.trim()).filter(isYmd).sort().slice(0, 7);
    if (!dates.length) return res.status(400).json({ error: 'dates is required, like 2026-01-31,2026-02-01' });
    try {
      const { rows } = await sql`
        SELECT to_char(date, 'YYYY-MM-DD') AS date, data FROM plans
        WHERE date >= ${dates[0]}::date AND date <= ${dates[dates.length - 1]}::date
      `;
      const plans = {};
      for (const r of rows) if (dates.includes(r.date)) plans[r.date] = r.data;
      res.status(200).json({ plans });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { date, plan } = req.body || {};
  if (!isYmd(date)) return res.status(400).json({ error: 'A valid date (like 2026-01-31) is required' });
  const p = plan && typeof plan === 'object' ? plan : {};
  const clean = {
    move: text(p.move, 160),
    when: /^\d{2}:\d{2}$/.test(p.when || '') ? p.when : '',
    setup: text(p.setup, 160),
    meals: text(p.meals, 1500),
    done: p.done === true,
  };

  try {
    if (!clean.move && !clean.setup && !clean.meals) {
      await sql`DELETE FROM plans WHERE date = ${date}::date`;
    } else {
      await sql`
        INSERT INTO plans (date, data) VALUES (${date}::date, ${JSON.stringify(clean)}::jsonb)
        ON CONFLICT (date) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
