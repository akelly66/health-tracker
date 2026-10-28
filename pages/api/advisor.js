import { sql } from '@vercel/postgres';
import { MODEL, MODEL_PARAMS } from '../../lib/model';
import { normalizeMeal } from '../../lib/nutrition';

const GOAL_LABELS = {
  lose_fat: 'lose fat while keeping muscle',
  build_muscle: 'build muscle and get stronger',
  maintain: 'maintain current weight',
  health: 'feel healthier and have more energy',
};

const MAX_HISTORY_MESSAGES = 10;

// Photos arrive as base64 in the request body, so allow more than the 1mb default.
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const DEFAULT_TARGETS = { calorie_target: 1600, protein_target: 110, fiber_target: 25 };

async function loadProfile() {
  try {
    const { rows } = await sql`
      SELECT start_weight, goal_weight, to_char(goal_date, 'YYYY-MM-DD') AS goal_date,
             calorie_target, protein_target, fiber_target, diet_prefs,
             fitness_goal, age, height_in, sex
      FROM profile WHERE id = 1
    `;
    return rows[0] || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
  if (!message) return res.status(400).json({ error: 'Message required' });

  const photo = body.photo;
  if (photo && (typeof photo.base64 !== 'string' || !/^image\/(jpeg|png|webp|gif)$/.test(photo.mediaType || ''))) {
    return res.status(400).json({ error: 'That photo format is not supported' });
  }

  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const totals = { calories: num(body.totals?.calories), protein: num(body.totals?.protein), carbs: num(body.totals?.carbs), fat: num(body.totals?.fat), fiber: num(body.totals?.fiber) };
  const meals = (Array.isArray(body.meals) ? body.meals.slice(0, 40) : [])
    .map((m) => (m && typeof m === 'object' ? { ...normalizeMeal(m), type: m.type } : null))
    .filter(Boolean);

  // Only the recent turns go to the model: sending the whole chat every time makes each message cost more than the last.
  let chatHistory = (Array.isArray(body.chatHistory) ? body.chatHistory : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-MAX_HISTORY_MESSAGES);
  while (chatHistory.length && chatHistory[0].role !== 'user') chatHistory = chatHistory.slice(1);
  const profile = await loadProfile();
  const TDEE = profile?.calorie_target || DEFAULT_TARGETS.calorie_target;
  const PROTEIN_TARGET = profile?.protein_target || DEFAULT_TARGETS.protein_target;
  const FIBER_TARGET = profile?.fiber_target || DEFAULT_TARGETS.fiber_target;

  const remaining = Math.max(0, TDEE - Math.round(totals.calories));
  const proteinLeft = Math.max(0, PROTEIN_TARGET - Math.round(totals.protein));
  const fiberLeft = Math.max(0, FIBER_TARGET - Math.round(totals.fiber || 0));
  const mealSummary = meals.length > 0
    ? meals.map(m => `${m.type && m.type !== 'Meal' ? m.type + ': ' : ''}${m.name} (${m.calories} kcal, P${m.protein}g C${m.carbs}g F${m.fat}g Fiber${Math.round(Number(m.fiber) || 0)}g)`).join('\n')
    : 'No meals logged yet today.';

  const aboutBits = [];
  if (profile?.age) aboutBits.push(`${profile.age} years old`);
  if (profile?.height_in) aboutBits.push(`${Math.floor(Number(profile.height_in) / 12)}'${Math.round(Number(profile.height_in) % 12)}\"`);
  if (profile?.sex && profile.sex !== 'unspecified') aboutBits.push(profile.sex);
  const aboutLine = aboutBits.length ? `About them: ${aboutBits.join(', ')}.` : '';
  const fitnessGoal = GOAL_LABELS[profile?.fitness_goal] || 'sustainable progress toward better health';
  const weightGoal = profile?.goal_weight
    ? ` Target weight: ${Number(profile.goal_weight)} lbs${profile.goal_date ? ` by ${profile.goal_date}` : ''}${profile.start_weight ? ` (starting from ${Number(profile.start_weight)} lbs)` : ''}.`
    : '';
  const goalLine = `Their fitness goal: ${fitnessGoal}.${weightGoal} ${aboutLine}`.trim();
  const prefsBlock = profile?.diet_prefs?.trim()
    ? `\nTheir dietary preferences, in their own words (likes, dislikes, allergies, pantry staples, what they usually buy). Respect allergies strictly and lean on these when suggesting food:\n${profile.diet_prefs.trim()}\n`
    : '';

  const system = `You are a precise, data-driven nutrition advisor in an ongoing conversation with someone tracking macros for their health. ${goalLine}
${prefsBlock}
Their stats today:
- Calorie target: ${TDEE} kcal | Protein target: ${PROTEIN_TARGET}g | Fiber target: ${FIBER_TARGET}g
- Eaten: ${Math.round(totals.calories)} kcal | P${Math.round(totals.protein)}g C${Math.round(totals.carbs)}g F${Math.round(totals.fat)}g Fiber${Math.round(totals.fiber || 0)}g
- Remaining: ${remaining} kcal | Protein still needed: ${proteinLeft}g | Fiber still needed: ${fiberLeft}g
- Meals logged:
${mealSummary}

There are no modes. Work out what they want from their message and answer it naturally:
- Asking what to eat: recommend 1-3 concrete meals that fit their remaining calories, protein and fiber, with estimated macros.
- Listing ingredients or pantry items: give 2-3 meal ideas with estimated macros.
- Asking how their day is going: analyze it directly and say what to prioritize.
- Asking for a recipe: give a specific recipe with a brief method and macros per serving.
- Sending a photo of food or a meal: say what you see, estimate the macros, and say how it fits their day. Include MEAL_DATA for what's in the photo so they can log it.
- Anything else about food or nutrition: just talk to them.

Be direct and precise. Protein is the top priority, fiber second. No filler.

IMPORTANT: End your response with structured data on its own line when relevant:
- Recommending ONE meal: MEAL_DATA:{"name":"Meal name","calories":400,"protein":35,"carbs":20,"fat":15,"fiber":6}
- Recommending MULTIPLE meals: MEAL_OPTIONS:[{"name":"Meal 1","calories":400,"protein":35,"carbs":20,"fat":15,"fiber":6},{"name":"Meal 2","calories":350,"protein":30,"carbs":25,"fat":12,"fiber":8}]
- User asks to log a meal (e.g. "log it", "add that", "log it but change calories to X", "actually it was 2 servings"): LOG_MEAL:{"name":"Meal name","calories":400,"protein":35,"carbs":20,"fat":15,"fiber":6}

For LOG_MEAL: use the corrected values the user specifies. If they say "it was 2 servings", multiply the macros accordingly. Confirm what you logged in your reply text.
Only include one of these tags per response. JSON must be valid and on a single line.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        ...MODEL_PARAMS,
        max_tokens: 1000,
        system,
        messages: [
          ...chatHistory,
          {
            role: 'user',
            content: photo
              ? [{ type: 'image', source: { type: 'base64', media_type: photo.mediaType, data: photo.base64 } }, { type: 'text', text: message }]
              : message
          }
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    // The model may lead with a thinking block, so take the first text block.
    const raw = (data.content.find((b) => b.type === 'text')?.text || '').trim();
    if (!raw) {
      const blocks = data.content.map((b) => b.type).join(',') || 'none';
      return res.status(500).json({ error: `The advisor returned no text (stop_reason: ${data.stop_reason}, blocks: ${blocks})` });
    }

    let reply = raw;
    let mealData = null;
    let mealOptions = null;
    let action = null;

    // Extract LOG_MEAL (user asked to log with corrections)
    const logMealMatch = raw.match(/LOG_MEAL:(\{.+?\})/);
    if (logMealMatch) {
      try { mealData = normalizeMeal(JSON.parse(logMealMatch[1])); if (mealData) action = 'log_meal'; } catch {}
      reply = raw.replace(/\nLOG_MEAL:\{.+?\}/, '').replace(/LOG_MEAL:\{.+?\}/, '').trim();
    }

    // Extract MEAL_DATA (single meal suggestion)
    const mealDataMatch = raw.match(/MEAL_DATA:(\{.+?\})/);
    if (mealDataMatch) {
      try { mealData = normalizeMeal(JSON.parse(mealDataMatch[1])); } catch {}
      reply = raw.replace(/\nMEAL_DATA:\{.+?\}/, '').replace(/MEAL_DATA:\{.+?\}/, '').trim();
    }

    // Extract MEAL_OPTIONS (multiple meal suggestions)
    const mealOptionsMatch = raw.match(/MEAL_OPTIONS:(\[.+?\])/);
    if (mealOptionsMatch) {
      try { const opts = JSON.parse(mealOptionsMatch[1]); mealOptions = Array.isArray(opts) ? opts.map(normalizeMeal).filter(Boolean) : null; } catch {}
      reply = raw.replace(/\nMEAL_OPTIONS:\[.+?\]/, '').replace(/MEAL_OPTIONS:\[.+?\]/, '').trim();
    }

    res.status(200).json({ reply, mealData, mealOptions, action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
