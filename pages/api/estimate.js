export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, mealType, photo } = req.body;
  if (!description && !photo) return res.status(400).json({ error: 'Description or photo required' });

  const systemPrompt = `You are a precise nutrition estimator. Return ONLY a JSON object with keys: name (string), calories (number), protein (number, grams), carbs (number, grams), fat (number, grams), confidence ("High", "Medium", or "Low"). No markdown, no explanation, only JSON.`;

  let userContent;
  if (photo) {
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: photo.mediaType, data: photo.base64 } },
      { type: 'text', text: `Meal type: ${mealType}\n${description ? 'Additional context: ' + description : 'Estimate macros from the photo.'}` }
    ];
  } else {
    userContent = `Meal type: ${mealType}\nDescription: ${description}`;
  }

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
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const raw = data.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
    const macros = JSON.parse(raw);
    res.status(200).json(macros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
