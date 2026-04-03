module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/health-tracker/pages/api/sync.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__ = __turbopack_context__.i("[externals]/@vercel/postgres [external] (@vercel/postgres, esm_import, [project]/health-tracker/node_modules/@vercel/postgres)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { date, calories, protein, carbs, fat, meal_log, weight, active_calories } = req.body;
    if (!date) return res.status(400).json({
        error: 'date required'
    });
    const w = weight !== undefined && weight !== null && weight !== '' ? Number(weight) : null;
    const ac = active_calories !== undefined && active_calories !== null && active_calories !== '' ? parseInt(active_calories, 10) : null;
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__["sql"]`
      INSERT INTO entries (date, calories, protein, carbs, fat, meal_log, weight, active_calories)
      VALUES (
        ${date}::date,
        ${Math.round(Number(calories) || 0)},
        ${Math.round(Number(protein) || 0)},
        ${Math.round(Number(carbs) || 0)},
        ${Math.round(Number(fat) || 0)},
        ${meal_log ?? ''},
        ${w},
        ${ac}
      )
      ON CONFLICT (date) DO UPDATE SET
        calories = EXCLUDED.calories,
        protein = EXCLUDED.protein,
        carbs = EXCLUDED.carbs,
        fat = EXCLUDED.fat,
        meal_log = EXCLUDED.meal_log,
        weight = COALESCE(EXCLUDED.weight, entries.weight),
        active_calories = COALESCE(EXCLUDED.active_calories, entries.active_calories),
        updated_at = NOW()
    `;
        res.json({
            ok: true
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

//# sourceMappingURL=%5Broot-of-the-server%5D__07tqxt7._.js.map