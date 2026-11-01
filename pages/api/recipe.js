import { MODEL, MODEL_PARAMS } from '../../lib/model';
import { normalizeMeal } from '../../lib/nutrition';

// Reads a recipe from screenshots and/or pasted text, so it only has to be entered once.
export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

const MAX_PHOTOS = 3;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const photos = (Array.isArray(req.body?.photos) ? req.body.photos : []).slice(0, MAX_PHOTOS);
  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 8000) : '';
  // When the text holds several recipes (a chat message with a few ideas), which one to read.
  const focus = typeof req.body?.focus === 'string' ? req.body.focus.trim().slice(0, 120) : '';
  if (!photos.length && !text) return res.status(400).json({ error: 'A photo or the recipe text is required' });
  for (const p of photos) {
    if (!p || typeof p.base64 !== 'string' || !/^image\/(jpeg|png|webp|gif)$/.test(p.mediaType || '')) {
      return res.status(400).json({ error: 'That photo format is not supported' });
    }
  }

  const system = `You read a recipe and return ONLY a JSON object with these keys: name (a short, plain meal name), servings (how many servings the recipe makes, a number, or null if it isn't stated), calories, protein, carbs, fat, fiber (whole numbers, all for ONE serving; protein, carbs, fat and fiber in grams), notes (the ingredients with amounts, then a short method of at most 4 lines, as plain text under 900 characters). If the recipe gives nutrition per serving, use those numbers. Otherwise estimate them from the ingredients and the number of servings. If the text is a message from a nutrition coach, ignore the conversation around it and read only the recipe. No markdown and no explanation, only the JSON.`;

  const content = [
    ...photos.map((p) => ({ type: 'image', source: { type: 'base64', media_type: p.mediaType, data: p.base64 } })),
    { type: 'text', text: text ? `Recipe text:\n${text}${focus ? `\n\nIf this has more than one recipe, read only this one: ${focus}` : ''}` : 'Read the recipe in the image(s).' },
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        ...MODEL_PARAMS,
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content }],
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(502).json({ error: data.error.message });
    if (!Array.isArray(data.content)) return res.status(502).json({ error: "Couldn't read that recipe. Please try again." });
    // The model may lead with a thinking block, so take the first text block.
    const raw = (data.content.find((b) => b.type === 'text')?.text || '').trim().replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
    if (!raw) return res.status(502).json({ error: 'The recipe reader returned an empty response' });
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "Couldn't read that recipe. Please try again." });
    }
    const meal = normalizeMeal(parsed);
    if (!meal) return res.status(502).json({ error: "Couldn't read that recipe. Please try again." });
    const servings = Number(parsed.servings);
    res.status(200).json({
      ...meal,
      servings: Number.isFinite(servings) && servings > 0 && servings <= 100 ? Math.round(servings * 2) / 2 : null,
      notes: typeof parsed.notes === 'string' ? parsed.notes.trim().slice(0, 1500) : '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
