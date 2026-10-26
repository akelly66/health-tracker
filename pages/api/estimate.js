import { MODEL, MODEL_PARAMS } from '../../lib/model';
import { normalizeMeal } from '../../lib/nutrition';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { photo } = req.body || {};
  const description = typeof req.body?.description === 'string' ? req.body.description.slice(0, 1000) : '';
  if (!description && !photo) return res.status(400).json({ error: 'Description or photo required' });
  if (photo && (typeof photo.base64 !== 'string' || !/^image\/(jpeg|png|webp|gif)$/.test(photo.mediaType || ''))) {
    return res.status(400).json({ error: 'That photo format is not supported' });
  }

  const systemPrompt = `You are a precise nutrition estimator. Return ONLY a JSON object with keys: name (string), calories (number), protein (number, grams), carbs (number, grams), fat (number, grams), fiber (number, grams), confidence ("High", "Medium", or "Low"). No markdown, no explanation, only JSON.`;

  let userContent;
  if (photo) {
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: photo.mediaType, data: photo.base64 } },
      { type: 'text', text: description ? `Additional context: ${description}` : 'Estimate macros from the photo.' }
    ];
  } else {
    userContent = `Description: ${description}`;
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
        model: MODEL,
        ...MODEL_PARAMS,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(502).json({ error: data.error.message });
    if (!Array.isArray(data.content)) return res.status(502).json({ error: "Couldn't read that estimate. Please try again." });
    // The model may lead with a thinking block, so take the first text block.
    const text = (data.content.find((b) => b.type === 'text')?.text || '').trim();
    if (!text) return res.status(500).json({ error: 'The estimator returned an empty response' });
    const raw = text.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "Couldn't read that estimate. Please try again." });
    }
    const macros = normalizeMeal(parsed);
    if (!macros) return res.status(502).json({ error: "Couldn't read that estimate. Please try again." });
    res.status(200).json(macros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
