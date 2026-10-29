import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { palette, tokens } from '../lib/theme';

// Chart libraries need real color values, so they come from the same tokens as the CSS (lib/theme.js).
const SAGE = palette.greenSoft; // soft green: the calorie bar track on the Track tab
const GREEN = palette.green; // dense green: the calorie bar fill
const PURPLE = palette.purple; // goal
const BLUE = palette.blue; // burned calories
const BLUE_SOFT = palette.blueSoft;
const GRID = palette.line;
const TIP_STYLE = { borderRadius: 14, border: `1px solid ${palette.line}`, boxShadow: tokens['--shadow-tip'], fontFamily: 'DM Sans, sans-serif', fontSize: 13 };
const AXIS_TICK = { fontSize: 12, fontFamily: 'DM Sans, sans-serif', fill: palette.muted };
const DAY_MS = 86400000;

function ymdToMs(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

function formatMs(ms) {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatYMD(ymd) {
  return ymd ? formatMs(ymdToMs(ymd)) : '';
}

// Scale weight bounces a few pounds from day to day (water, salt, workouts), so the trend is fit through
// weekly averages once there are enough weeks, and a projected goal date is only trusted after ~3 weeks.
function weeklyAverages(points) {
  if (!points.length) return [];
  const x0 = ymdToMs(points[0].date);
  const buckets = new Map();
  for (const p of points) {
    const x = (ymdToMs(p.date) - x0) / DAY_MS;
    const key = Math.floor(x / 7);
    const bk = buckets.get(key) || { x: 0, y: 0, n: 0 };
    bk.x += x;
    bk.y += p.weight;
    bk.n += 1;
    buckets.set(key, bk);
  }
  return [...buckets.keys()].sort((p, q) => p - q).map((k) => ({ x: buckets.get(k).x / buckets.get(k).n, y: buckets.get(k).y / buckets.get(k).n }));
}

// Least-squares line through {x: days, y: lb}, with the standard error of its slope when there are 3+ points.
function fitLine(pts) {
  const n = pts.length;
  if (n < 2) return null;
  const mx = pts.reduce((acc, p) => acc + p.x, 0) / n;
  const my = pts.reduce((acc, p) => acc + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  const intercept = my - slope * mx;
  let se = null;
  if (n >= 3) {
    const rss = pts.reduce((acc, p) => acc + (p.y - (intercept + slope * p.x)) ** 2, 0);
    se = Math.sqrt(rss / (n - 2) / den);
  }
  return { slope, intercept, se };
}

function fitTrend(points) {
  if (points.length < 2) return null;
  const x0 = ymdToMs(points[0].date);
  const raw = points.map((p) => ({ x: (ymdToMs(p.date) - x0) / DAY_MS, y: p.weight }));
  const span = raw[raw.length - 1].x;
  // Need a real span of time, otherwise two weigh-ins a day apart would make a wild "trend".
  if (span < 6) return null;
  const weekly = weeklyAverages(points);
  const smooth = weekly.length >= 3;
  const line = fitLine(smooth ? weekly : raw);
  if (!line) return null;
  return {
    slope: line.slope,
    se: line.se,
    span,
    reliable: smooth && points.length >= 4 && span >= 21,
    at: (ms) => line.intercept + line.slope * ((ms - x0) / DAY_MS),
  };
}

export function WeightChart({ weighIns = [], profile }) {
  const goalW = profile?.goal_weight != null ? Number(profile.goal_weight) : null;
  const hasGoal = goalW != null && Boolean(profile?.goal_date);
  const goalMs = hasGoal ? ymdToMs(profile.goal_date) : null;
  const startMs = profile?.start_date ? ymdToMs(profile.start_date) : null;
  const startW = profile?.start_weight != null ? Number(profile.start_weight) : null;

  // The chart follows the journey since the start date; with no start date, the last 90 days.
  const latestAny = weighIns.length ? weighIns[weighIns.length - 1] : null;
  const points = weighIns.filter((w) =>
    startMs != null ? ymdToMs(w.date) >= startMs : latestAny && ymdToMs(w.date) >= ymdToMs(latestAny.date) - 90 * DAY_MS
  );
  const trend = fitTrend(points);
  const lastPoint = points.length ? points[points.length - 1] : null;
  const lastMs = lastPoint ? ymdToMs(lastPoint.date) : null;
  const firstMs = points.length ? ymdToMs(points[0].date) : null;

  const goalPaceAt =
    hasGoal && startMs != null && startW != null
      ? (ms) => (ms < startMs ? null : startW + (goalW - startW) * Math.min((ms - startMs) / Math.max(goalMs - startMs, 1), 1))
      : null;

  const times = new Set(points.map((p) => ymdToMs(p.date)));
  if (startMs != null && hasGoal) times.add(startMs);
  if (hasGoal) times.add(goalMs);
  const weighByMs = Object.fromEntries(points.map((p) => [ymdToMs(p.date), p.weight]));
  const r2 = (v) => Number(v.toFixed(2));
  const rows = [...times].sort((a, b) => a - b).map((t) => ({
    t,
    weight: weighByMs[t] ?? null,
    pace: goalPaceAt && goalPaceAt(t) != null ? r2(goalPaceAt(t)) : null,
    trend: trend && t >= firstMs && t <= lastMs ? r2(trend.at(t)) : null,
    projection: trend && trend.reliable && hasGoal && t >= lastMs && t <= goalMs ? r2(trend.at(t)) : null,
  }));

  const projEnd = trend && trend.reliable && hasGoal && goalMs > lastMs ? trend.at(goalMs) : null;
  const yVals = [...points.map((p) => p.weight)];
  if (hasGoal) yVals.push(goalW);
  if (startW != null) yVals.push(startW);
  if (projEnd != null && yVals.length) {
    const lo = Math.min(...yVals) - 6;
    const hi = Math.max(...yVals) + 6;
    if (projEnd > lo && projEnd < hi) yVals.push(projEnd);
  }
  const yMin = yVals.length ? Math.floor(Math.min(...yVals) - 2) : 0;
  const yMax = yVals.length ? Math.ceil(Math.max(...yVals) + 2) : 100;
  const tMin = rows.length ? rows[0].t : 0;
  const tMax = rows.length ? rows[rows.length - 1].t : 0;
  const ticks = rows.length > 1 ? [0, 1, 2, 3].map((i) => Math.round(tMin + ((tMax - tMin) * i) / 3)) : rows.map((r) => r.t);

  const perWeek = trend ? trend.slope * 7 : null;
  let story = 'Log a few weigh-ins over the next week or two and your trend line will appear.';
  if (trend && perWeek != null) {
    const current = trend.at(lastMs);
    const rate = Math.abs(perWeek).toFixed(1);
    const toward = hasGoal ? (goalW < current ? perWeek < 0 : perWeek > 0) : null;
    if (!trend.reliable) {
      story = `Early read from ${points.length} weigh-in${points.length === 1 ? '' : 's'} over ${Math.round(trend.span)} days. Weight bounces a few pounds day to day, so a projected date shows up after about 3 weeks of weigh-ins.`;
    } else if (Math.abs(perWeek) < 0.05) {
      story = 'Your weight is holding steady.';
    } else if (!hasGoal) {
      story = `Your trend is ${perWeek < 0 ? 'down' : 'up'} ${rate} lb per week.`;
    } else if (!toward) {
      story = `Your trend is ${perWeek < 0 ? 'down' : 'up'} ${rate} lb per week, which is moving away from your goal.`;
    } else if (Math.abs(goalW - current) < 0.5) {
      story = `Your average weight (${current.toFixed(1)} lb) is already at your goal.`;
    } else {
      // The range runs from "a bit faster than the trend" to "a bit slower", using the uncertainty in the trend itself.
      const dist = Math.abs(goalW - current);
      const slope = Math.abs(trend.slope);
      const se = trend.se || 0;
      const fastMs = lastMs + (dist / (slope + se)) * DAY_MS;
      const slowDays = slope - se > 0.005 ? dist / (slope - se) : null;
      const slowMs = slowDays != null && slowDays <= 730 ? lastMs + slowDays * DAY_MS : null;
      const range = slowMs ? `between ${formatMs(fastMs)} and ${formatMs(slowMs)}` : `no earlier than ${formatMs(fastMs)}, and it's too early to say how much later`;
      let vsGoal = '';
      if (goalMs != null) {
        if (slowMs && slowMs <= goalMs + 3 * DAY_MS) vsGoal = ' That is in time for your goal date.';
        else if (fastMs > goalMs + 3 * DAY_MS) vsGoal = ' That is after your goal date.';
        else vsGoal = ' Your goal date falls inside that range.';
      }
      story = `At about ${rate} lb per week you'd likely reach ${goalW} lb ${range}.${vsGoal} Based on weekly averages of ${points.length} weigh-ins.`;
    }
  }

  let paceStatus = null;
  if (goalPaceAt && lastMs != null && trend && trend.reliable) {
    const expected = goalPaceAt(lastMs);
    if (expected != null) {
      const diff = trend.at(lastMs) - expected;
      const losing = goalW < startW;
      const ahead = losing ? diff < 0 : diff > 0;
      paceStatus = Math.abs(diff) < 0.5 ? 'On pace' : ahead ? `${Math.abs(diff).toFixed(1)} lb ahead of pace` : `${Math.abs(diff).toFixed(1)} lb behind pace. Weight bounces, so the trend matters more than any one day.`;
    }
  }

  return (
    <div className="card">
      <div className="chart-title">Weight vs. goal</div>
      <div className="chart-tiles">
        <div className="chart-tile tile-now">
          <div className="chart-tile-val">{latestAny ? `${latestAny.weight} lb` : '—'}</div>
          <div className="chart-tile-label">Now</div>
        </div>
        <div className="chart-tile tile-goal">
          <div className="chart-tile-val">{goalW != null ? `${goalW} lb` : '—'}</div>
          <div className="chart-tile-label">{hasGoal ? `Goal · ${formatYMD(profile.goal_date)}` : 'Goal'}</div>
        </div>
        <div className="chart-tile tile-trend">
          <div className="chart-tile-val">{perWeek != null ? `${perWeek > 0 ? '+' : '−'}${Math.abs(perWeek).toFixed(1)} lb` : '—'}</div>
          <div className="chart-tile-label">{trend && !trend.reliable ? 'Early trend / wk' : 'Trend per week'}</div>
        </div>
      </div>
      {paceStatus && <div className="chart-sub">{paceStatus}</div>}
      <div className="chart-note">{weighIns.length ? story : 'No weigh-ins yet. Use Log weight on the Track tab.'}</div>
      {weighIns.length > 0 && (
        <>
          <div className="chart-legend">
            <span><i className="lg-dot" /> Weigh-ins</span>
            <span><i className="lg-line" /> Your trend</span>
            {hasGoal && <span><i className="lg-dash goal" /> Goal pace</span>}
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={rows} margin={{ top: 14, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis
                axisLine={false}
                tickLine={false}
                dataKey="t"
                type="number"
                scale="time"
                domain={[tMin, tMax]}
                ticks={ticks}
                tickFormatter={formatMs}
                tick={AXIS_TICK}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis domain={[yMin, yMax]} tick={AXIS_TICK} width={36} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={formatMs} formatter={(v, name) => [`${Number(v).toFixed(1)} lb`, name]} contentStyle={TIP_STYLE} />
              {goalPaceAt && (
                <Line type="linear" dataKey="pace" stroke={PURPLE} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 7" dot={false} name="Goal pace" connectNulls isAnimationActive={false} />
              )}
              {trend && trend.reliable && hasGoal && (
                <Line type="linear" dataKey="projection" stroke={GREEN} strokeOpacity={0.55} strokeWidth={2.5} strokeDasharray="2 5" strokeLinecap="round" dot={false} name="Projected" connectNulls isAnimationActive={false} />
              )}
              {trend && (
                <Line type="linear" dataKey="trend" stroke={GREEN} strokeWidth={3} strokeLinecap="round" dot={false} name="Your trend" connectNulls isAnimationActive={false} />
              )}
              <Line type="linear" dataKey="weight" stroke="none" dot={{ r: 4, fill: GREEN, stroke: palette.card, strokeWidth: 1.5 }} activeDot={{ r: 5 }} name="Weigh-in" connectNulls isAnimationActive={false} />
              {hasGoal && <ReferenceLine y={goalW} stroke={PURPLE} strokeOpacity={0.35} strokeDasharray="2 4" />}
              {hasGoal && (
                <ReferenceDot x={goalMs} y={goalW} r={6} fill={palette.card} stroke={PURPLE} strokeWidth={2.5} ifOverflow="extendDomain" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

const BAR_RADIUS = 9;

// One pill-shaped bar per day: the full height is calories eaten. The solid part is net
// (eaten minus burned) and the dotted part on top is what activity burned.
function CalorieBar({ x, y, width, height, payload, index }) {
  if (!height || height <= 0) return null;
  const clipId = `calbar-${index}`;
  const netHeight = payload.eaten > 0 ? height * (payload.net / payload.eaten) : 0;
  const r = Math.min(width / 2, BAR_RADIUS);
  return (
    <g>
      <clipPath id={clipId}>
        <rect x={x} y={y} width={width} height={height} rx={r} ry={r} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x={x} y={y} width={width} height={height} fill="url(#stipple)" />
        <rect x={x} y={y + height - netHeight} width={width} height={netHeight} fill={GREEN} />
      </g>
    </g>
  );
}

function CalorieTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tip">
      <div className="chart-tip-date">{formatYMD(d.date)}</div>
      <div>Eaten: <b>{d.eaten.toLocaleString()}</b> kcal</div>
      <div>Burned: <b>{d.burned ? d.burned.toLocaleString() : '—'}</b>{d.burned ? ' kcal' : ''}</div>
      <div>Net: <b>{(d.eaten - d.burned).toLocaleString()}</b> kcal</div>
    </div>
  );
}

// Short axis label for a 7-day chart: "Mon 19".
function dayTick(ymd) {
  const d = new Date(ymdToMs(ymd));
  return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`;
}

// `days` is the calendar window to show (oldest first), so the chart always covers those days,
// not "the last N days that happen to have food logged". Days with nothing logged stay empty.
export function CaloriesChart({ calorieEntries = [], days = [], tdee }) {
  const byDate = Object.fromEntries(calorieEntries.map((e) => [e.date, e]));
  const data = days.map((date) => {
    const e = byDate[date];
    const eaten = e ? Number(e.calories) || 0 : 0;
    const burned = e ? Number(e.active_calories) || 0 : 0;
    return { date, eaten, burned, net: Math.max(eaten - burned, 0) };
  });
  const logged = data.filter((d) => d.eaten > 0);
  const avg = (rows, key) => (rows.length ? Math.round(rows.reduce((a, r) => a + r[key], 0) / rows.length) : null);
  const avgEaten = avg(logged, 'eaten');
  const avgBurned = avg(logged.filter((d) => d.burned > 0), 'burned');
  const avgNet = logged.length ? Math.round(logged.reduce((a, d) => a + (d.eaten - d.burned), 0) / logged.length) : null;
  const fmt = (v) => (v == null ? '—' : v.toLocaleString());
  const yMax = Math.max(tdee, ...data.map((d) => d.eaten)) * 1.12;

  return (
    <div className="card">
      <div className="chart-title">Calories eaten &amp; burned</div>
      <div className="chart-note">Last 7 days. Each bar is what you ate; the solid part is your net after activity.</div>
      <div className="chart-tiles">
        <div className="chart-tile tile-eaten">
          <div className="chart-tile-val">{fmt(avgEaten)}</div>
          <div className="chart-tile-label">Avg eaten</div>
        </div>
        <div className="chart-tile tile-burned">
          <div className="chart-tile-val">{fmt(avgBurned)}</div>
          <div className="chart-tile-label">Avg burned</div>
        </div>
        <div className="chart-tile tile-net">
          <div className="chart-tile-val">{fmt(avgNet)}</div>
          <div className="chart-tile-label">Avg net</div>
        </div>
      </div>
      {logged.length === 0 ? (
        <div className="chart-empty">Nothing logged in the last 7 days.</div>
      ) : (
        <>
          <div className="chart-legend">
            <span><i className="lg-solid" /> Net</span>
            <span><i className="lg-dots" /> Burned</span>
            <span><i className="lg-dash" /> Daily target</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%">
              <defs>
                <pattern id="stipple" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="4" height="4" fill={BLUE_SOFT} />
                  <circle cx="2" cy="2" r="0.9" fill={BLUE} />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="date" tickFormatter={dayTick} tick={AXIS_TICK} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} width={40} domain={[0, Math.ceil(yMax / 100) * 100]} axisLine={false} tickLine={false} />
              <Tooltip content={<CalorieTip />} cursor={{ fill: SAGE, fillOpacity: 0.3, radius: 8 }} />
              <ReferenceLine y={tdee} stroke={GREEN} strokeOpacity={0.45} strokeDasharray="2 5" strokeLinecap="round" strokeWidth={2} />
              <Bar dataKey="eaten" name="Eaten" shape={<CalorieBar />} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
