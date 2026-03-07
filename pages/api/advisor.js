export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, totals, meals, advisorMode, chatHistory } = req.body;
  const TDEE = 1795;
  const PROTEIN_TARGET = 110;

  const remaining = Math.max(0, TDEE - Math.round(totals.calories));
  const proteinLeft = Math.max(0, PROTEIN_TARGET - Math.round(totals.protein));
  const mealSummary = meals.length > 0
    ? meals.map(m => `${m.type}: ${m.name} (${m.calories} kcal, P${m.protein}g C${m.carbs}g F${m.fat}g)`).join('\n')
    : 'No meals logged yet today.';

  const system = `You are a precise, data-driven nutrition advisor helping a 35-year-old woman (5'2", 130 lbs, goal 118 lbs) tracking macros for fat loss with muscle preservation.

Her stats today:
- TDEE: ${TDEE} kcal | Protein target: ${PROTEIN_TARGET}g
- Eaten: ${Math.round(totals.calories)} kcal | P${Math.round(totals.protein)}g C${Math.round(totals.carbs)}g F${Math.round(totals.fat)}g
- Remaining: ${remaining} kcal | Protein still needed: ${proteinLeft}g
- Meals logged:
${mealSummary}

Current mode: ${advisorMode}
- suggest: Recommend 1-3 concrete meals fitting her remaining calories and protein. Include estimated macros.
- pantry: She'll list ingredients. Give 2-3 meal ideas with estimated macros.
- checkin: Analyze her day. Is she on track? What to prioritize? Be direct and data-based.
- recipe: Give a specific recipe with brief method and macros per serving.

Be direct and precise. Protein is always the top priority. No filler.

IMPORTANT: When you recommend meals, end your response with structured data on its own line so the user can log directly:
- If recommending ONE specific meal: MEAL_DATA:{"name":"Meal name","calories":400,"protein":35,"carbs":20,"fat":15}
- If recommending MULTIPLE meals (2-3 options): MEAL_OPTIONS:[{"name":"Meal 1","calories":400,"protein":35,"carbs":20,"fat":15},{"name":"Meal 2","calories":350,"protein":30,"carbs":25,"fat":12}]

Only include MEAL_DATA or MEAL_OPTIONS when recommending specific meals with macros. Do not include for check-ins or general advice. JSON must be valid and on a single line.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [...chatHistory.map(({ role, content }) => ({ role, content })), { role: 'user', content: message }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.content[0].text.trim();

    let reply = raw;
    let mealData = null;
    let mealOptions = null;

    // Extract MEAL_DATA (single meal)
    const mealDataMatch = raw.match(/MEAL_DATA:(\{.+?\})/);
    if (mealDataMatch) {
      try { mealData = JSON.parse(mealDataMatch[1]); } catch {}
      reply = raw.replace(/\nMEAL_DATA:\{.+?\}/, '').replace(/MEAL_DATA:\{.+?\}/, '').trim();
    }

    // Extract MEAL_OPTIONS (multiple meals)
    const mealOptionsMatch = raw.match(/MEAL_OPTIONS:(\[.+?\])/);
    if (mealOptionsMatch) {
      try { mealOptions = JSON.parse(mealOptionsMatch[1]); } catch {}
      reply = raw.replace(/\nMEAL_OPTIONS:\[.+?\]/, '').replace(/MEAL_OPTIONS:\[.+?\]/, '').trim();
    }

    res.status(200).json({ reply, mealData, mealOptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
