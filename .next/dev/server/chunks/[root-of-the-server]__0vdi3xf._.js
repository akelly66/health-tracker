module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/health-tracker/pages/api/history.js [api] (ecmascript)", ((__turbopack_context__) => {
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
    if (req.method !== 'GET') return res.status(405).json({
        error: 'Method not allowed'
    });
    res.setHeader('Cache-Control', 'no-store');
    const raw = parseInt(req.query.days, 10);
    const days = Math.min(Math.max(Number.isFinite(raw) ? raw : 60, 1), 400);
    try {
        const { rows } = await __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$postgres__$5b$external$5d$__$2840$vercel$2f$postgres$2c$__esm_import$2c$__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f40$vercel$2f$postgres$29$__["sql"]`
      SELECT date, calories, protein, carbs, fat, weight, active_calories, meal_log
      FROM entries
      ORDER BY date DESC
      LIMIT ${days}
    `;
        res.status(200).json({
            entries: [
                ...rows
            ].reverse()
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0vdi3xf._.js.map