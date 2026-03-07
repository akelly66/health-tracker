export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const now = new Date();
  const today = (req.query.date) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'Name', title: { equals: today } }
      })
    });

    const data = await response.json();
    const page = data.results?.[0];

    if (!page) return res.status(200).json({ found: false });

    const props = page.properties;
    const mealLogText = props['Meal Log']?.rich_text?.[0]?.plain_text || '';

    // Parse meal log lines back into meal objects
    // Format: "Type: Name — calories kcal | PXg CXg FXg"
    const meals = [];
    if (mealLogText) {
      mealLogText.split('\n').filter(Boolean).forEach(line => {
        const match = line.match(/^(.+?): (.+) — (\d+) kcal \| P(\d+)g C(\d+)g F(\d+)g$/);
        if (match) {
          meals.push({
            type: match[1].trim(),
            name: match[2].trim(),
            calories: parseInt(match[3]),
            protein: parseInt(match[4]),
            carbs: parseInt(match[5]),
            fat: parseInt(match[6]),
            confidence: 'High'
          });
        }
      });
    }

    res.status(200).json({
      found: true,
      pageId: page.id,
      calories: props.Calories?.number || 0,
      protein: props.Protein?.number || 0,
      carbs: props.Carbs?.number || 0,
      fat: props.Fat?.number || 0,
      meals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
