export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, totals, meals, advisorMode, chatHistory } = req.body;
  const TDEE = 1795;
  const PROTEIN_TARGET = 130;

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

IMPORTANT: When you recommend a single specific meal (especially in suggest, pantry, or recipe mode), end your response with a JSON block on its own line in this exact format so the user can log it directly:
MEAL_DATA:{"name":"Meal name","calories":400,"protein":35,"carbs":20,"fat":15}

Only include MEAL_DATA if you are recommending one clear, specific meal. Do not include it for check-ins or when listing multiple options. The JSON must be valid and on a single line.`;

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
        messages: [...chatHistory, { role: 'user', content: message }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.content[0].text.trim();

    // Extract MEAL_DATA if present
    let reply = raw;
    let mealData = null;
    const mealDataMatch = raw.match(/MEAL_DATA:(\{.+\})/);
    if (mealDataMatch) {
      try {
        mealData = JSON.parse(mealDataMatch[1]);
        // Remove the MEAL_DATA line from the visible reply
        reply = raw.replace(/\nMEAL_DATA:\{.+\}/, '').replace(/MEAL_DATA:\{.+\}/, '').trim();
      } catch {
        // If parsing fails, just show the full reply
        reply = raw;
      }
    }

    res.status(200).json({ reply, mealData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
