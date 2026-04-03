module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/health-tracker/lib/mealLog.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mealsToMealLogText",
    ()=>mealsToMealLogText,
    "parseMealLogText",
    ()=>parseMealLogText
]);
const MEAL_LINE = /^(.+?): (.+) — (\d+) kcal \| P(\d+)g C(\d+)g F(\d+)g$/;
function parseMealLogText(mealLogText) {
    const meals = [];
    if (!mealLogText) return meals;
    mealLogText.split('\n').filter(Boolean).forEach((line)=>{
        const match = line.match(MEAL_LINE);
        if (match) {
            meals.push({
                type: match[1].trim(),
                name: match[2].trim(),
                calories: parseInt(match[3], 10),
                protein: parseInt(match[4], 10),
                carbs: parseInt(match[5], 10),
                fat: parseInt(match[6], 10),
                confidence: 'High'
            });
        }
    });
    return meals;
}
function mealsToMealLogText(meals) {
    return meals.map((m)=>`${m.type}: ${m.name} — ${m.calories} kcal | P${m.protein}g C${m.carbs}g F${m.fat}g`).join('\n');
}
}),
"[project]/health-tracker/pages/api/today.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__ = __turbopack_context__.i("[externals]/@vercel/postgres [external] (@vercel/postgres, esm_import, [project]/health-tracker/node_modules/@vercel/postgres)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/lib/mealLog.js [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({
        error: 'Method not allowed'
    });
    res.setHeader('Cache-Control', 'no-store');
    const now = new Date();
    const date = req.query.date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
        const { rows } = await __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__["sql"]`SELECT * FROM entries WHERE date = ${date}::date`;
        if (!rows.length) return res.status(200).json({
            found: false
        });
        const row = rows[0];
        const mealLogText = row.meal_log || '';
        const meals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$api$5d$__$28$ecmascript$29$__["parseMealLogText"])(mealLogText);
        res.status(200).json({
            found: true,
            calories: row.calories ?? 0,
            protein: row.protein ?? 0,
            carbs: row.carbs ?? 0,
            fat: row.fat ?? 0,
            weight: row.weight != null ? Number(row.weight) : null,
            active_calories: row.active_calories != null ? Number(row.active_calories) : null,
            meal_log: mealLogText,
            meals
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__02qg5ly._.js.map