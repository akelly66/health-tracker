const MEAL_LINE =
  /^(.+?): (.+) — (\d+) kcal \| P(\d+)g C(\d+)g F(\d+)g$/;

export function parseMealLogText(mealLogText) {
  const meals = [];
  if (!mealLogText) return meals;
  mealLogText.split('\n').filter(Boolean).forEach((line) => {
    const match = line.match(MEAL_LINE);
    if (match) {
      meals.push({
        type: match[1].trim(),
        name: match[2].trim(),
        calories: parseInt(match[3], 10),
        protein: parseInt(match[4], 10),
        carbs: parseInt(match[5], 10),
        fat: parseInt(match[6], 10),
        confidence: 'High',
      });
    }
  });
  return meals;
}

export function mealsToMealLogText(meals) {
  return meals
    .map(
      (m) =>
        `${m.type}: ${m.name} — ${m.calories} kcal | P${m.protein}g C${m.carbs}g F${m.fat}g`
    )
    .join('\n');
}
