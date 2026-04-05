import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PINK = '#ffc0ff';
const GREEN = '#00a165';
export default function HistoryCharts({ entriesChrono, tdee }) {
  const last60 = entriesChrono.slice(-60);

  const weightWithAvg = [];
  for (let i = 0; i < last60.length; i++) {
    const e = last60[i];
    if (e.weight == null || e.weight === '') continue;
    const w = Number(e.weight);
    if (Number.isNaN(w)) continue;
    const start = Math.max(0, i - 6);
    const windowVals = last60
      .slice(start, i + 1)
      .filter((row) => row.weight != null && row.weight !== '')
      .map((row) => Number(row.weight));
    const avg = windowVals.reduce((a, b) => a + b, 0) / windowVals.length;
    weightWithAvg.push({ date: e.date, weight: w, avg });
  }

  const wVals = weightWithAvg.map((d) => d.weight);
  const wMin = wVals.length ? Math.min(...wVals) - 2 : 0;
  const wMax = wVals.length ? Math.max(...wVals) + 2 : 100;

  const last30 = entriesChrono.slice(-30);
  const barData = last30.map((e) => {
    const cal = Number(e.calories) || 0;
    const act = Number(e.active_calories) || 0;
    const net = cal - act;
    return {
      date: e.date,
      net,
      fill: net <= tdee ? GREEN : RED,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 10,
            color: 'var(--black)',
          }}
        >
          Weight (60 days)
        </div>
        {weightWithAvg.length === 0 ? (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>No weight data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightWithAvg} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'DM Mono, monospace' }} />
              <YAxis domain={[wMin, wMax]} tick={{ fontSize: 10, fontFamily: 'DM Mono, monospace' }} width={36} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke={PINK} strokeWidth={2} dot={{ r: 3, fill: PINK }} name="Weight" />
              <Line type="monotone" dataKey="avg" stroke={GREEN} strokeWidth={2} dot={false} name="7d avg" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 10,
            color: 'var(--black)',
          }}
        >
          Net calories (30 days)
        </div>
        {barData.length === 0 ? (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>No entries yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'DM Mono, monospace' }} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'DM Mono, monospace' }} width={36} />
              <Tooltip />
              <ReferenceLine y={tdee} stroke="#888" strokeDasharray="5 5" />
              <Bar dataKey="net" name="Net kcal">
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
