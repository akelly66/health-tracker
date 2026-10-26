import { sql } from '@vercel/postgres';

const DEFAULTS = {
  onboarded: false,
  start_weight: null,
  start_date: null,
  goal_weight: null,
  goal_date: null,
  weigh_in_mode: 'weekly',
  weigh_in_day: 1,
  calorie_target: 1600,
  protein_target: 110,
  fiber_target: 25,
  carb_target: 170,
  fat_target: 53,
  diet_prefs: '',
  fitness_goal: '',
  age: null,
  height_in: null,
  sex: 'unspecified',
  activity: 'light',
};
const GOALS = ['lose_fat', 'build_muscle', 'maintain', 'health'];
const SEXES = ['female', 'male', 'unspecified'];
const ACTIVITIES = ['sedentary', 'light', 'moderate', 'very'];

const num = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const int = (v, fallback) => {
  const n = num(v);
  return n === null ? fallback : Math.round(n);
};
const ymd = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT onboarded, start_weight, to_char(start_date, 'YYYY-MM-DD') AS start_date,
               goal_weight, to_char(goal_date, 'YYYY-MM-DD') AS goal_date,
               weigh_in_mode, weigh_in_day, calorie_target, protein_target, fiber_target,
               carb_target, fat_target, diet_prefs, fitness_goal, age, height_in, sex, activity
        FROM profile WHERE id = 1
      `;
      if (!rows.length) return res.status(200).json(DEFAULTS);
      const r = rows[0];
      res.status(200).json({
        ...DEFAULTS,
        ...r,
        start_weight: r.start_weight != null ? Number(r.start_weight) : null,
        goal_weight: r.goal_weight != null ? Number(r.goal_weight) : null,
        height_in: r.height_in != null ? Number(r.height_in) : null,
        fitness_goal: r.fitness_goal || '',
        sex: r.sex || DEFAULTS.sex,
        activity: r.activity || DEFAULTS.activity,
        diet_prefs: r.diet_prefs || '',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = req.body || {};
  const mode = b.weigh_in_mode === 'anytime' ? 'anytime' : 'weekly';
  const day = Math.min(Math.max(int(b.weigh_in_day, 1), 0), 6);
  const startWeight = num(b.start_weight);
  const goalWeight = num(b.goal_weight);
  const startDate = ymd(b.start_date);
  const goalDate = ymd(b.goal_date);
  const calories = int(b.calorie_target, DEFAULTS.calorie_target);
  const protein = int(b.protein_target, DEFAULTS.protein_target);
  const fiber = int(b.fiber_target, DEFAULTS.fiber_target);
  const carbs = int(b.carb_target, DEFAULTS.carb_target);
  const fat = int(b.fat_target, DEFAULTS.fat_target);
  const goalKind = GOALS.includes(b.fitness_goal) ? b.fitness_goal : null;
  const age = num(b.age) === null ? null : Math.min(Math.max(Math.round(num(b.age)), 13), 110);
  const heightIn = num(b.height_in);
  const sex = SEXES.includes(b.sex) ? b.sex : 'unspecified';
  const activity = ACTIVITIES.includes(b.activity) ? b.activity : 'light';
  const prefs = typeof b.diet_prefs === 'string' ? b.diet_prefs.slice(0, 4000) : '';

  try {
    await sql`
      INSERT INTO profile (id, onboarded, start_weight, start_date, goal_weight, goal_date,
                           weigh_in_mode, weigh_in_day, calorie_target, protein_target,
                           fiber_target, carb_target, fat_target, diet_prefs,
                           fitness_goal, age, height_in, sex, activity, updated_at)
      VALUES (1, TRUE, ${startWeight}, ${startDate}::date, ${goalWeight}, ${goalDate}::date,
              ${mode}, ${day}, ${calories}, ${protein}, ${fiber}, ${carbs}, ${fat}, ${prefs},
              ${goalKind}, ${age}, ${heightIn}, ${sex}, ${activity}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        onboarded = TRUE,
        start_weight = EXCLUDED.start_weight,
        start_date = EXCLUDED.start_date,
        goal_weight = EXCLUDED.goal_weight,
        goal_date = EXCLUDED.goal_date,
        weigh_in_mode = EXCLUDED.weigh_in_mode,
        weigh_in_day = EXCLUDED.weigh_in_day,
        calorie_target = EXCLUDED.calorie_target,
        protein_target = EXCLUDED.protein_target,
        fiber_target = EXCLUDED.fiber_target,
        carb_target = EXCLUDED.carb_target,
        fat_target = EXCLUDED.fat_target,
        diet_prefs = EXCLUDED.diet_prefs,
        fitness_goal = EXCLUDED.fitness_goal,
        age = EXCLUDED.age,
        height_in = EXCLUDED.height_in,
        sex = EXCLUDED.sex,
        activity = EXCLUDED.activity,
        updated_at = NOW()
    `;
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
