// Receives Apple Health exports and forwards a cleaned-up payload to a Make.com webhook.
// Set MAKE_HEALTH_WEBHOOK to turn it on. Optionally set HEALTH_SECRET and send it as the
// x-health-secret header, so only your own shortcut can use this endpoint.
export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.HEALTH_SECRET;
  if (secret && req.headers['x-health-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const makeWebhook = process.env.MAKE_HEALTH_WEBHOOK;
  if (!makeWebhook) return res.status(503).json({ error: 'Health webhook is not configured' });

  const { data } = req.body || {};
  if (!data || !Array.isArray(data.metrics)) return res.status(400).json({ error: 'No metrics data' });

  // Extract metrics from the array
  const metrics = {};
  data.metrics.forEach(metric => {
    const date = metric.data?.[0]?.date?.split(' ')[0]?.replace(/-/g, '/');
    if (!metrics.date && date) metrics.date = date;

    const qty = metric.data?.reduce((sum, d) => sum + (d.qty || 0), 0);

    if (metric.name === 'active_energy') metrics.active_calories = Math.round(qty);
    if (metric.name === 'resting_energy') metrics.resting_calories = Math.round(qty);
    if (metric.name === 'step_count') metrics.steps = Math.round(qty);
  });

  if (!metrics.date) return res.status(400).json({ error: 'No date found in payload' });

  // Forward clean payload to Make
  try {
    const response = await fetch(makeWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
    if (!response.ok) return res.status(502).json({ error: `Make responded with ${response.status}` });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the Make webhook" });
  }

  res.status(200).json({ ok: true, metrics });
}
