// Cleans up meals that come back from the AI so the rest of the app can trust them:
// numbers are whole, non-negative numbers (never strings or decimals) and the name is one tidy line.
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

export function normalizeMeal(m) {
  if (!m || typeof m !== 'object') return null;
  const name = String(m.name || '').replace(/\s+—\s+/g, ' - ').replace(/\s+/g, ' ').trim().slice(0, 120);
  const meal = {
    name: name || 'Meal',
    calories: toInt(m.calories),
    protein: toInt(m.protein),
    carbs: toInt(m.carbs),
    fat: toInt(m.fat),
    fiber: toInt(m.fiber),
  };
  if (m.confidence) meal.confidence = ['High', 'Medium', 'Low'].includes(m.confidence) ? m.confidence : 'Medium';
  return meal;
}

// Accepts only the dates the database can store, so a bad value is a clear 400 instead of a database error.
export const isYmd = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
