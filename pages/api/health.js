export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { data } = req.body;
  if (!data || !data.metrics) return res.status(400).json({ error: 'No metrics data' });

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
  const makeWebhook = process.env.MAKE_HEALTH_WEBHOOK;
  await fetch(makeWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });

  res.status(200).json({ ok: true, metrics });
}
