// Fiber is an optional trailing "Fi{n}g" so rows logged before fiber existed still parse.
const MEAL_LINE =
  /^(.+?): (.+) — ([\d.]+) kcal \| P([\d.]+)g C([\d.]+)g F([\d.]+)g(?: Fi([\d.]+)g)?$/;

export function parseMealLogText(mealLogText) {
  const meals = [];
  if (!mealLogText) return meals;
  mealLogText.split('\n').filter(Boolean).forEach((line) => {
    const match = line.match(MEAL_LINE);
    if (match) {
      meals.push({
        type: match[1].trim(),
        name: match[2].trim(),
        calories: Math.round(parseFloat(match[3])),
        protein: Math.round(parseFloat(match[4])),
        carbs: Math.round(parseFloat(match[5])),
        fat: Math.round(parseFloat(match[6])),
        fiber: match[7] != null ? Math.round(parseFloat(match[7])) : 0,
        confidence: 'High',
      });
    }
  });
  return meals;
}

const whole = (v) => Math.max(0, Math.round(Number(v) || 0));

export function mealsToMealLogText(meals) {
  return meals
    .map(
      (m) =>
        `${m.type || 'Meal'}: ${String(m.name).replace(/[\r\n]+/g, ' ')} — ${whole(m.calories)} kcal | P${whole(m.protein)}g C${whole(m.carbs)}g F${whole(m.fat)}g Fi${whole(m.fiber)}g`
    )
    .join('\n');
}
