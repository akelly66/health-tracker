module.exports = [
"[project]/health-tracker/lib/mealLog.js [ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/health-tracker/pages/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/node_modules/next/dynamic.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/lib/mealLog.js [ssr] (ecmascript)");
;
;
;
;
;
;
const HistoryCharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/health-tracker/components/HistoryCharts.js [ssr] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/health-tracker/components/HistoryCharts.js [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const TDEE = 1600;
const PROTEIN_TARGET = 110;
const GREETINGS = [
    'Rise and log. The scale is waiting and it has no chill.',
    'Still committed to the bit? How much do you weigh today?',
    'Another day, another opportunity to demolish your protein goal.',
    "Your future self is watching. She looks great, btw. Weight check?",
    'Hot girl walk starts with knowing your starting weight.',
    "The data doesn't lie. Unfortunately. How are we looking today?",
    'Abs are made in the kitchen, logged in this app.',
    "You showed up. That's already a win. Now step on the scale.",
    'New day, new macros. How much do you weigh right now?'
];
function getLocalDateString(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDaysToYMD(ymd, delta) {
    const [y, m, day] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, day);
    dt.setDate(dt.getDate() + delta);
    return getLocalDateString(dt);
}
function lastNDatesFrom(ymd, n) {
    const out = [];
    for(let i = n - 1; i >= 0; i--)out.push(addDaysToYMD(ymd, -i));
    return out;
}
function normalizeRowDate(d) {
    if (!d) return '';
    if (typeof d === 'string') return d.slice(0, 10);
    try {
        return d.toISOString().slice(0, 10);
    } catch  {
        return String(d).slice(0, 10);
    }
}
function editDayLabel(viewDateStr, todayStr) {
    if (viewDateStr === todayStr) return 'Today';
    if (viewDateStr === addDaysToYMD(todayStr, -1)) return 'Yesterday';
    const [y, m, day] = viewDateStr.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}
const ZapIcon = ({ size = 14, style = {} })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "currentColor",
        stroke: "none",
        style: style,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polygon", {
            points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 63,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const SmileIcon = ({ size = 14, style = {} })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        style: style,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 68,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M8 13s1.5 2 4 2 4-2 4-2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 68,
                columnNumber: 37
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "9",
                y1: "9",
                x2: "9.01",
                y2: "9"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 69,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "15",
                y1: "9",
                x2: "15.01",
                y2: "9"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 69,
                columnNumber: 43
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 67,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const CameraIcon = ({ size = 13 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 74,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "13",
                r: "4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 75,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 73,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const CheckIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
            points: "20 6 9 17 4 12"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 80,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 79,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const DotIcon = ({ size = 8, color = '#00a165' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: color,
        stroke: "none",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
            cx: "12",
            cy: "12",
            r: "8"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 85,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 84,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const ScaleIcon = ({ size = 14 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M12 3v19"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 90,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M5 21h14"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 90,
                columnNumber: 25
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M3 7l4-4 5 4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 91,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M21 7l-4-4-5 4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 91,
                columnNumber: 29
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M3 7c0 3.3 2.7 6 6 6s6-2.7 6-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 92,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M21 7c0 3.3-2.7 6-6 6s-6-2.7-6-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 93,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 89,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const PencilIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 98,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 99,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 97,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const ArrowUpIcon = ({ size = 16 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 104,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                points: "16 12 12 8 8 12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 105,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "16",
                x2: "12",
                y2: "8"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 105,
                columnNumber: 41
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 103,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const PlusIcon = ({ size = 11 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 110,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "8",
                x2: "12",
                y2: "16"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 111,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "8",
                y1: "12",
                x2: "16",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 111,
                columnNumber: 43
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 109,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const SendIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                x1: "22",
                y1: "2",
                x2: "11",
                y2: "13"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 116,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polygon", {
                points: "22 2 15 22 11 13 2 9 22 2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 117,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 115,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const UtensilsIcon = ({ size = 15, color = '#00a165' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 122,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M7 2v20"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 122,
                columnNumber: 55
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 123,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 121,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const CupIcon = ({ size = 15, color = '#d080d0' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M8 2h8l1 10H7L8 2z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 128,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M7 12c0 4 2 6 5 6s5-2 5-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 128,
                columnNumber: 35
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M6 21h12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 128,
                columnNumber: 72
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 127,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const mealTypeColors = {
    Breakfast: {
        bg: '#e6f4ec',
        icon: '#00a165'
    },
    Lunch: {
        bg: '#e6f4ec',
        icon: '#00a165'
    },
    Dinner: {
        bg: '#fde8f1',
        icon: '#d080d0'
    },
    Snack: {
        bg: '#ffe0e4',
        icon: '#ff0838'
    }
};
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #fbf1f5; --white: #ffffff; --green: #00a165; --pink: #ffc0ff;
    --red: #ff0838; --black: #111111; --muted: #888; --border: #d9d4c8;
    --serif: 'Playfair Display', Georgia, serif;
    --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;
  }
  body { background: var(--cream); font-family: var(--sans); color: var(--black); min-height: 100vh; padding-bottom: env(safe-area-inset-bottom); }
  .wrap { display: flex; flex-direction: column; align-items: center; padding: 0 0 60px; }
  .header { width: 100%; background: var(--green); padding: calc(env(safe-area-inset-top) + 18px) 24px 14px; display: flex; justify-content: space-between; align-items: center; }
  .header-title { font-family: var(--serif); font-size: 26px; font-weight: 900; color: var(--pink); display: flex; align-items: center; gap: 8px; }
  .header-right { display: flex; align-items: center; gap: 8px; }
  .header-date { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 0.1em; text-transform: uppercase; }
  .sticky-top { position: sticky; top: 0; z-index: 100; width: 100%; }
  .tabs { width: 100%; max-width: 560px; display: flex; margin: 0 auto; padding: 0 20px; background: var(--cream); }
  .tab { flex: 1; font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 10px 0; text-align: center; background: transparent; color: var(--muted); cursor: pointer; border: none; border-bottom: 2px solid var(--border); transition: all 0.15s; }
  .tab.active { color: var(--red); border-bottom: 2px solid var(--red); }
  .panel { width: 100%; max-width: 560px; padding: 20px 20px 0; display: flex; flex-direction: column; gap: 14px; }
  .today-card { background: var(--green); border-radius: 8px; padding: 20px 20px 16px; margin-bottom: 14px; }
  .today-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
  .macros-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0; margin-bottom: 12px; align-items: flex-end; }
  .macro-cell { padding: 0 12px 0 0; }
  .macro-value { font-family: var(--serif); font-size: 30px; font-weight: 900; color: var(--white); line-height: 1; }
  .macro-value.big { font-size: 40px; }
  .macro-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 3px; }
  .bar-track { height: 4px; background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
  .bar-fill { height: 100%; background: var(--pink); border-radius: 4px; transition: width 0.4s ease; }
  .bar-labels { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; }
  .weight-row { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.12); margin-top: 14px; }
  .weight-left { display: flex; align-items: center; gap: 10px; }
  .weight-icon { width: 28px; height: 28px; background: var(--pink); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--green); }
  .weight-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
  .weight-input-wrap { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 6px 14px; }
  .weight-input { font-family: var(--serif); font-size: 18px; font-weight: 700; color: #ffffff; background: transparent; border: none; outline: none; width: 64px; text-align: right; -moz-appearance: textfield; }
  .weight-input::-webkit-outer-spin-button, .weight-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .weight-input::placeholder { color: rgba(255,255,255,0.4); }
  .weight-unit { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.8); letter-spacing: 0.08em; display: flex; align-items: center; gap: 4px; }
  .card { background: var(--white); border-radius: 8px; padding: 20px; margin-bottom: 14px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .card-title { font-family: var(--serif); font-size: 20px; font-weight: 700; color: var(--black); }
  .pending-pill { display: flex; align-items: center; gap: 5px; background: #f0ede8; border-radius: 20px; padding: 4px 10px; font-family: var(--mono); font-size: 9px; color: var(--green); letter-spacing: 0.08em; }
  .meal-row-wrap { position: relative; overflow: hidden; border-bottom: 1px solid var(--border); }
  .meal-row-wrap:last-child { border-bottom: none; }
  .meal-delete-bg { position: absolute; right: 0; top: 0; bottom: 0; width: 80px; background: var(--red); display: flex; align-items: center; justify-content: center; color: white; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; pointer-events: none; }
  .meal-item { display: flex; gap: 12px; padding: 12px 0; align-items: flex-start; background: var(--white); position: relative; transform: translateX(0); will-change: transform; touch-action: pan-y; }
  .meal-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .meal-body { flex: 1; min-width: 0; }
  .meal-name { font-size: 14px; font-weight: 500; line-height: 1.3; margin-bottom: 3px; }
  .meal-meta { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 0.04em; }
  .meal-right { text-align: right; flex-shrink: 0; }
  .meal-kcal { font-family: var(--serif); font-size: 18px; font-weight: 700; color: var(--black); }
  .meal-kcal-label { font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: 0.06em; }
  .synced-check { font-size: 10px; color: var(--green); font-family: var(--mono); margin-top: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
  .pending-check { font-size: 10px; color: var(--green); font-family: var(--mono); margin-top: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
  .meal-empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 20px 0; }
  .photo-zone { border: 1.5px dashed #e8c5d4; border-radius: 8px; padding: 16px; text-align: center; background: #fbf0f5; margin-bottom: 10px; cursor: pointer; position: relative; transition: border-color 0.15s; }
  .photo-zone:hover { border-color: var(--red); }
  .photo-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .photo-zone-text { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.06em; display: flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none; }
  .photo-zone-text span { color: var(--red); }
  .photo-preview { position: relative; margin-bottom: 10px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
  .photo-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; }
  .remove-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.55); color: white; border: none; border-radius: 20px; font-size: 10px; padding: 4px 10px; cursor: pointer; font-family: var(--mono); letter-spacing: 0.05em; text-transform: uppercase; }
  textarea { width: 100%; border: 1px solid #fbf1f5; border-radius: 8px; padding: 12px; font-family: var(--sans); font-size: 14px; color: var(--black); background: #fbf0f5; resize: none; line-height: 1.5; outline: none; }
  textarea:focus { border-color: var(--pink); }
  textarea::placeholder { color: var(--muted); }
  .input-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
  select { font-family: var(--mono); font-size: 11px; border: 1px solid #e8c5d4; border-radius: 20px; padding: 8px 14px; background: #fbf0f5; color: var(--black); outline: none; letter-spacing: 0.06em; cursor: pointer; }
  .btn-estimate { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--red); background: transparent; color: var(--red); cursor: pointer; margin-left: auto; display: flex; align-items: center; gap: 5px; }
  .btn-estimate:disabled { opacity: 0.5; cursor: not-allowed; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .sync-status { font-family: var(--mono); font-size: 10px; color: var(--green); letter-spacing: 0.06em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .btn-sync { width: 100%; font-family: var(--serif); font-size: 16px; font-weight: 700; padding: 14px; border-radius: 8px; border: none; background: var(--green); color: var(--pink); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-sync:hover { background: #008a55; }
  .btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }
  .status { font-family: var(--mono); font-size: 11px; margin-top: 10px; min-height: 16px; }
  .status-success { color: var(--green); }
  .status-error { color: var(--red); }
  .status-loading { color: var(--muted); }
  .ctx-bar { background: #e6f4ec; border: 1px solid #b8dfc8; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
  .ctx-item { text-align: center; }
  .ctx-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); margin-bottom: 3px; }
  .ctx-value { font-family: var(--serif); font-size: 18px; font-weight: 900; color: var(--black); }
  .pills { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .pill { font-family: var(--mono); font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; padding: 7px 13px; border-radius: 20px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .pill.active { border-color: var(--green); background: #e6f4ec; color: var(--green); font-weight: 600; }
  .chat { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; min-height: 120px; max-height: 400px; overflow-y: auto; padding-right: 2px; }
  .chat::-webkit-scrollbar { width: 3px; }
  .chat::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .msg-wrap { display: flex; flex-direction: column; max-width: 88%; }
  .msg-wrap.user { align-items: flex-end; margin-left: auto; }
  .msg-wrap.assistant { align-items: flex-start; margin-right: auto; }
  .chat-bubble { padding: 13px 16px; border-radius: 18px; font-size: 14px; line-height: 1.65; }
  .chat-bubble.assistant { background: var(--white); border: 1px solid var(--border); border-bottom-left-radius: 4px; white-space: pre-wrap; color: var(--black); }
  .chat-bubble.user { background: var(--green); color: var(--white); border-bottom-right-radius: 4px; font-size: 14px; }
  .log-this-btn { display: inline-flex; width: fit-content; align-items: center; gap: 6px; margin-top: 10px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--red); border: 1.5px solid var(--red); border-radius: 20px; padding: 7px 13px; cursor: pointer; background: transparent; transition: background 0.15s; }
  .log-this-btn:hover { background: #fff0f2; }
  .chat-empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 32px 16px; line-height: 2; }
  .suggestions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .sug-btn { font-family: var(--sans); font-size: 13.5px; text-align: left; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--white); color: var(--black); cursor: pointer; transition: all 0.15s; line-height: 1.4; }
  .sug-btn:hover { border-color: var(--green); background: #f0faf5; }
  .chat-input-area { background: #fbf0f5; border: 1.5px solid #f0dde8; border-radius: 12px; padding: 10px 12px; margin-bottom: 0; }
  .chat-input-area textarea { width: 100%; min-height: 52px; margin: 0; background: transparent; border: none; outline: none; font-family: var(--sans); font-size: 14px; color: var(--black); resize: none; padding: 0; }
  .chat-input-area textarea::placeholder { color: #b0a0aa; }
  .chat-input-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .mode-select { font-family: var(--mono); font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; background: transparent; border: 1.5px solid var(--border); border-radius: 20px; padding: 6px 10px; color: var(--muted); cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px; }
  .btn-send { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 18px; border-radius: 20px; border: none; background: var(--green); color: var(--pink); cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .btn-send:hover { background: #008a55; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
  .edit-banner { font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; background: #fff8e1; color: #b45309; text-align: center; }
  .date-nav { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; font-family: var(--mono); font-size: 11px; color: var(--black); }
  .date-nav-btn { background: var(--white); border: 1px solid var(--border); border-radius: 8px; width: 36px; height: 36px; font-size: 16px; cursor: pointer; color: var(--black); line-height: 1; }
  .date-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .date-nav-label { min-width: 120px; text-align: center; letter-spacing: 0.08em; text-transform: uppercase; }
  .greeting-overlay { position: fixed; inset: 0; z-index: 200; background: var(--cream); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 24px calc(28px + env(safe-area-inset-bottom)); }
  .greeting-text { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--black); text-align: center; line-height: 1.45; max-width: 340px; margin-bottom: 28px; }
  .greeting-field { width: 100%; max-width: 320px; margin-bottom: 16px; }
  .greeting-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .greeting-input { width: 100%; font-family: var(--serif); font-size: 20px; font-weight: 700; padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--white); }
  .greeting-go { margin-top: 20px; font-family: var(--mono); font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 28px; border-radius: 8px; border: none; background: var(--green); color: var(--pink); cursor: pointer; }
  .history-acc { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; margin-bottom: 16px; }
  .history-row { border-radius: 8px; border: 1px solid var(--border); background: var(--white); overflow: hidden; }
  .history-row.muted { opacity: 0.45; pointer-events: none; }
  .history-row-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; font-family: var(--mono); font-size: 11px; }
  .history-row-head span.chev { transition: transform 0.2s; display: inline-block; margin-left: 8px; }
  .history-row-head.open span.chev { transform: rotate(90deg); }
  .history-row-body { padding: 0 14px 14px; border-top: 1px solid var(--border); font-size: 13px; }
  .history-meal-line { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 6px; }
  .history-summary-card { background: var(--white); border-radius: 8px; padding: 16px; border: 1px solid var(--border); margin-bottom: 16px; font-family: var(--mono); font-size: 11px; line-height: 1.7; color: var(--black); }
  .history-summary-card h3 { font-family: var(--serif); font-size: 18px; margin-bottom: 10px; }
`;
function SwipeMealRow({ children, onDelete }) {
    const wrapRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const itemRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const startX = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const currentX = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const isDragging = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const THRESHOLD = 80;
    function collapse() {
        const wrap = wrapRef.current;
        if (!wrap) return;
        // Slide item fully out first
        itemRef.current.style.transition = 'transform 0.2s ease';
        itemRef.current.style.transform = 'translateX(-100%)';
        // Then collapse height to 0
        wrap.style.transition = 'max-height 0.25s ease 0.15s, opacity 0.2s ease 0.15s';
        wrap.style.overflow = 'hidden';
        wrap.style.maxHeight = wrap.offsetHeight + 'px';
        requestAnimationFrame(()=>{
            wrap.style.maxHeight = '0';
            wrap.style.opacity = '0';
        });
        setTimeout(onDelete, 400);
    }
    // Touch handlers
    function onTouchStart(e) {
        startX.current = e.touches[0].clientX;
        currentX.current = 0;
        isDragging.current = true;
        itemRef.current.style.transition = 'none';
    }
    function onTouchMove(e) {
        if (!isDragging.current) return;
        const dx = Math.min(0, e.touches[0].clientX - startX.current);
        currentX.current = dx;
        itemRef.current.style.transform = `translateX(${dx}px)`;
    }
    function onTouchEnd() {
        isDragging.current = false;
        if (currentX.current <= -THRESHOLD) {
            collapse();
        } else {
            itemRef.current.style.transition = 'transform 0.2s ease';
            itemRef.current.style.transform = 'translateX(0)';
        }
        currentX.current = 0;
    }
    // Mouse handlers for desktop
    function onMouseDown(e) {
        startX.current = e.clientX;
        currentX.current = 0;
        isDragging.current = true;
        itemRef.current.style.transition = 'none';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    function onMouseMove(e) {
        if (!isDragging.current) return;
        const dx = Math.min(0, e.clientX - startX.current);
        currentX.current = dx;
        itemRef.current.style.transform = `translateX(${dx}px)`;
    }
    function onMouseUp() {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (currentX.current <= -THRESHOLD) {
            collapse();
        } else {
            itemRef.current.style.transition = 'transform 0.2s ease';
            itemRef.current.style.transform = 'translateX(0)';
        }
        currentX.current = 0;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "meal-row-wrap",
        ref: wrapRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "meal-delete-bg",
                children: "Delete"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 352,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "meal-item",
                ref: itemRef,
                onTouchStart: onTouchStart,
                onTouchMove: onTouchMove,
                onTouchEnd: onTouchEnd,
                onMouseDown: onMouseDown,
                children: children
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 353,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 351,
        columnNumber: 5
    }, this);
}
function Home() {
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('log');
    const [meals, setMeals] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [totals, setTotals] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });
    const [mealInput, setMealInput] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [mealType, setMealType] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('Breakfast');
    const [photo, setPhoto] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [mealLoading, setMealLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [mealStatus, setMealStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        text: '',
        type: ''
    });
    const [weight, setWeight] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [activeCalories, setActiveCalories] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [syncLoading, setSyncLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [syncStatus, setSyncStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        text: '',
        type: ''
    });
    const [advisorMode, setAdvisorMode] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('suggest');
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [advisorInput, setAdvisorInput] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [advisorLoading, setAdvisorLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [advisorStatus, setAdvisorStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        text: '',
        type: ''
    });
    const [showSuggestions, setShowSuggestions] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [prefillMeal, setPrefillMeal] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const chatRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const photoInputRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [displayDate, setDisplayDate] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [viewDate, setViewDate] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>getLocalDateString());
    const todayDate = getLocalDateString();
    const [historyEntries, setHistoryEntries] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [historyExpanded, setHistoryExpanded] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [greetingOpen, setGreetingOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [greetingLine, setGreetingLine] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [greetingWeightInput, setGreetingWeightInput] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [greetingYesterdayBurn, setGreetingYesterdayBurn] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [greetingShowYesterdayBurn, setGreetingShowYesterdayBurn] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [greetingBusy, setGreetingBusy] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setDisplayDate(new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }));
    }, []);
    const loadDay = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async (dateStr)=>{
        setMealStatus({
            text: 'Loading day…',
            type: 'loading'
        });
        try {
            const res = await fetch(`/api/today?date=${dateStr}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache'
                }
            });
            const data = await res.json();
            if (!data.found) {
                setMeals([]);
                setTotals({
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0
                });
                setWeight('');
                setActiveCalories('');
                setMealStatus({
                    text: '',
                    type: ''
                });
                return;
            }
            const restored = (data.meals || []).map((m)=>({
                    ...m,
                    synced: true
                }));
            setMeals(restored);
            if (restored.length === 0) {
                setTotals({
                    calories: data.calories || 0,
                    protein: data.protein || 0,
                    carbs: data.carbs || 0,
                    fat: data.fat || 0
                });
            }
            setWeight(data.weight != null ? String(data.weight) : '');
            setActiveCalories(data.active_calories != null ? String(data.active_calories) : '');
            setMealStatus({
                text: `✓ Loaded (${Math.round(data.calories)} kcal)`,
                type: 'success'
            });
            setTimeout(()=>setMealStatus({
                    text: '',
                    type: ''
                }), 2500);
        } catch  {
            setMealStatus({
                text: "⚠ Couldn't load data",
                type: 'error'
            });
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        loadDay(viewDate);
    }, [
        viewDate,
        loadDay
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const t = undefined;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (tab !== 'history') return;
        (async ()=>{
            try {
                const r = await fetch('/api/history?days=60');
                const j = await r.json();
                setHistoryEntries(j.entries || []);
            } catch  {
                setHistoryEntries([]);
            }
        })();
    }, [
        tab
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (meals.length === 0) return;
        const t = meals.reduce((acc, m)=>({
                calories: acc.calories + m.calories,
                protein: acc.protein + m.protein,
                carbs: acc.carbs + m.carbs,
                fat: acc.fat + m.fat
            }), {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        });
        setTotals(t);
    }, [
        meals
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [
        chatHistory
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (prefillMeal) {
            setTab('log');
            setMealInput(prefillMeal.name);
        }
    }, [
        prefillMeal
    ]);
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        loadPhoto(file);
    }
    function handleDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadPhoto(file);
    }
    function loadPhoto(file) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (ev)=>{
            img.onload = ()=>{
                const MAX = 800;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) {
                        height = Math.round(height * MAX / width);
                        width = MAX;
                    } else {
                        width = Math.round(width * MAX / height);
                        height = MAX;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                setPhoto({
                    base64: dataUrl.split(',')[1],
                    mediaType: 'image/jpeg',
                    previewUrl: dataUrl
                });
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
    async function estimateMeal() {
        if (!mealInput.trim() && !photo && !prefillMeal) return;
        setMealLoading(true);
        setMealStatus({
            text: 'Estimating macros...',
            type: 'loading'
        });
        try {
            let macros;
            if (prefillMeal) {
                macros = {
                    ...prefillMeal,
                    confidence: prefillMeal.confidence || 'Medium'
                };
            } else {
                const estRes = await fetch('/api/estimate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        description: mealInput.trim(),
                        mealType,
                        photo: photo ? {
                            base64: photo.base64,
                            mediaType: photo.mediaType
                        } : null
                    })
                });
                macros = await estRes.json();
                if (macros.error) throw new Error(macros.error);
            }
            setMeals((prev)=>[
                    ...prev,
                    {
                        ...macros,
                        type: mealType,
                        synced: false
                    }
                ]);
            setMealStatus({
                text: `✓ Added: ${macros.name} (${macros.calories} kcal)`,
                type: 'success'
            });
            setMealInput('');
            setPhoto(null);
            setPrefillMeal(null);
            setTimeout(()=>setMealStatus({
                    text: '',
                    type: ''
                }), 3000);
        } catch (err) {
            setMealStatus({
                text: `Error: ${err.message}`,
                type: 'error'
            });
        }
        setMealLoading(false);
    }
    async function completeGreeting() {
        const t = getLocalDateString();
        setGreetingBusy(true);
        try {
            const tr = await fetch(`/api/today?date=${t}`);
            const td = await tr.json();
            const payloadToday = {
                date: t,
                calories: td.found ? Math.round(td.calories) : 0,
                protein: td.found ? Math.round(td.protein) : 0,
                carbs: td.found ? Math.round(td.carbs) : 0,
                fat: td.found ? Math.round(td.fat) : 0,
                meal_log: td.found && td.meal_log != null ? td.meal_log : ''
            };
            if (greetingWeightInput) payloadToday.weight = parseFloat(greetingWeightInput);
            await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadToday)
            });
            if (greetingShowYesterdayBurn && greetingYesterdayBurn) {
                const y = addDaysToYMD(t, -1);
                const yr = await fetch(`/api/today?date=${y}`);
                const yd = await yr.json();
                if (yd.found) {
                    await fetch('/api/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date: y,
                            calories: Math.round(yd.calories),
                            protein: Math.round(yd.protein),
                            carbs: Math.round(yd.carbs),
                            fat: Math.round(yd.fat),
                            meal_log: yd.meal_log || '',
                            active_calories: parseInt(greetingYesterdayBurn, 10)
                        })
                    });
                }
            }
            localStorage.setItem('last_greeted', t);
            setGreetingOpen(false);
            await loadDay(viewDate);
        } catch (e) {
            console.error(e);
        }
        setGreetingBusy(false);
    }
    async function syncToServer() {
        if (meals.length === 0 && !weight && !activeCalories) {
            setSyncStatus({
                text: 'Nothing to sync',
                type: 'error'
            });
            setTimeout(()=>setSyncStatus({
                    text: '',
                    type: ''
                }), 2000);
            return;
        }
        setSyncLoading(true);
        setSyncStatus({
            text: 'Saving…',
            type: 'loading'
        });
        try {
            const mealLogText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["mealsToMealLogText"])(meals);
            const currentTotals = meals.reduce((acc, m)=>({
                    calories: acc.calories + m.calories,
                    protein: acc.protein + m.protein,
                    carbs: acc.carbs + m.carbs,
                    fat: acc.fat + m.fat
                }), {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            });
            const payload = {
                date: viewDate,
                calories: Math.round(currentTotals.calories),
                protein: Math.round(currentTotals.protein),
                carbs: Math.round(currentTotals.carbs),
                fat: Math.round(currentTotals.fat),
                meal_log: mealLogText
            };
            if (weight) payload.weight = parseFloat(weight);
            if (activeCalories) payload.active_calories = parseInt(activeCalories, 10);
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Sync failed');
            setMeals((prev)=>prev.map((m)=>({
                        ...m,
                        synced: true
                    })));
            setWeight('');
            setActiveCalories('');
            setSyncStatus({
                text: '✓ Saved',
                type: 'success'
            });
            setTimeout(()=>setSyncStatus({
                    text: '',
                    type: ''
                }), 3000);
        } catch (err) {
            setSyncStatus({
                text: `Error: ${err.message}`,
                type: 'error'
            });
        }
        setSyncLoading(false);
    }
    async function sendAdvisorMessage(msg) {
        const message = msg || advisorInput.trim();
        if (!message) return;
        setAdvisorLoading(true);
        setAdvisorInput('');
        setShowSuggestions(false);
        setChatHistory((h)=>[
                ...h,
                {
                    role: 'user',
                    content: message
                }
            ]);
        setAdvisorStatus({
            text: 'Thinking...',
            type: 'loading'
        });
        try {
            const res = await fetch('/api/advisor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    totals,
                    meals,
                    advisorMode,
                    chatHistory
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            // If advisor wants to log a meal directly, add it to meals
            if (data.action === 'log_meal' && data.mealData) {
                const mealToLog = {
                    ...data.mealData,
                    type: mealType,
                    synced: false
                };
                setMeals((prev)=>[
                        ...prev,
                        mealToLog
                    ]);
            }
            setChatHistory((h)=>[
                    ...h,
                    {
                        role: 'assistant',
                        content: data.reply,
                        mealData: data.mealData || null,
                        mealOptions: data.mealOptions || null,
                        action: data.action || null
                    }
                ]);
            setAdvisorStatus({
                text: '',
                type: ''
            });
        } catch (err) {
            setAdvisorStatus({
                text: `Error: ${err.message}`,
                type: 'error'
            });
        }
        setAdvisorLoading(false);
    }
    const pct = Math.min(totals.calories / TDEE * 100, 100);
    const deficit = TDEE - Math.round(totals.calories);
    const remaining = Math.max(0, deficit);
    const proteinLeft = Math.max(0, PROTEIN_TARGET - Math.round(totals.protein));
    const pendingCount = meals.filter((m)=>!m.synced).length;
    const historyByDate = Object.fromEntries(historyEntries.map((e)=>[
            normalizeRowDate(e.date),
            e
        ]));
    const last7 = lastNDatesFrom(todayDate, 7);
    const weekSlots = last7.map((d)=>({
            date: d,
            row: historyByDate[d] || null
        }));
    const withData = weekSlots.filter((s)=>s.row);
    const avgWeekCal = withData.length > 0 ? Math.round(withData.reduce((a, s)=>a + (Number(s.row.calories) || 0), 0) / withData.length) : 0;
    const avgWeekProt = withData.length > 0 ? Math.round(withData.reduce((a, s)=>a + (Number(s.row.protein) || 0), 0) / withData.length) : 0;
    const totalDeficit = withData.reduce((a, s)=>{
        const net = (Number(s.row.calories) || 0) - (Number(s.row.active_calories) || 0);
        return a + (TDEE - net);
    }, 0);
    const daysProteinHit = withData.filter((s)=>(Number(s.row.protein) || 0) >= PROTEIN_TARGET).length;
    const daysUnderTdee = withData.filter((s)=>{
        const net = (Number(s.row.calories) || 0) - (Number(s.row.active_calories) || 0);
        return net <= TDEE;
    }).length;
    const modePlaceholders = {
        suggest: "What should I eat next?",
        pantry: "Tell me what ingredients you have...",
        checkin: "How's my day looking?",
        recipe: "Give me a recipe that fits my macros..."
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        children: "Body Log"
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 752,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 753,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 751,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("style", {
                children: styles
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 755,
                columnNumber: 7
            }, this),
            greetingOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "greeting-overlay",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "greeting-text",
                        children: greetingLine
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 758,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "greeting-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "greeting-label",
                                children: "Weight (lbs)"
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 760,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                className: "greeting-input",
                                type: "number",
                                step: "0.1",
                                placeholder: "—",
                                value: greetingWeightInput,
                                onChange: (e)=>setGreetingWeightInput(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 761,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 759,
                        columnNumber: 11
                    }, this),
                    greetingShowYesterdayBurn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "greeting-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "greeting-label",
                                children: "Yesterday's active calories / Forgot to log your burn? 🔥"
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 772,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                className: "greeting-input",
                                type: "number",
                                step: "1",
                                placeholder: "kcal",
                                value: greetingYesterdayBurn,
                                onChange: (e)=>setGreetingYesterdayBurn(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 773,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 771,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "greeting-go",
                        disabled: greetingBusy,
                        onClick: completeGreeting,
                        children: greetingBusy ? 'Saving…' : "Let's go →"
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 783,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 757,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "sticky-top",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "header-title",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ZapIcon, {
                                                size: 18,
                                                style: {
                                                    color: '#ff0838'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 792,
                                                columnNumber: 15
                                            }, this),
                                            "Body Log"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 791,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "header-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "header-date",
                                                children: displayDate
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 796,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SmileIcon, {
                                                size: 16,
                                                style: {
                                                    color: '#ffc0ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 797,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 795,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 790,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "tabs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        className: `tab ${tab === 'log' ? 'active' : ''}`,
                                        onClick: ()=>setTab('log'),
                                        children: "Log"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 801,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        className: `tab ${tab === 'advisor' ? 'active' : ''}`,
                                        onClick: ()=>setTab('advisor'),
                                        children: "Advisor"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 802,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        className: `tab ${tab === 'history' ? 'active' : ''}`,
                                        onClick: ()=>setTab('history'),
                                        children: "History"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 803,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 800,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 789,
                        columnNumber: 9
                    }, this),
                    tab === 'log' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            viewDate !== todayDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "edit-banner",
                                children: [
                                    "Editing ",
                                    new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    }),
                                    " — not today"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 810,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "date-nav",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "date-nav-btn",
                                        "aria-label": "Previous day",
                                        onClick: ()=>setViewDate((d)=>addDaysToYMD(d, -1)),
                                        children: "‹"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 815,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "date-nav-label",
                                        children: editDayLabel(viewDate, todayDate)
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 823,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "date-nav-btn",
                                        "aria-label": "Next day",
                                        disabled: viewDate >= todayDate,
                                        onClick: ()=>setViewDate((d)=>addDaysToYMD(d, 1)),
                                        children: "›"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 824,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 814,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "today-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "today-label",
                                        children: viewDate === todayDate ? "Today's intake" : "This day's intake"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 835,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "macros-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-value big",
                                                        children: Math.round(totals.calories).toLocaleString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 838,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "kcal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 839,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 837,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.protein),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 842,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "protein"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 843,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 841,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.carbs),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 846,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "carbs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 847,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 845,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.fat),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 850,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "fat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 851,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 849,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 836,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bar-track",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "bar-fill",
                                            style: {
                                                width: pct + '%'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 855,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 854,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bar-labels",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                children: [
                                                    Math.round(totals.calories).toLocaleString(),
                                                    " eaten"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 858,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                children: deficit >= 0 ? `${deficit} remaining of ${TDEE}` : `${Math.abs(deficit)} over`
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 859,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 857,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "weight-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "weight-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "weight-icon",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ScaleIcon, {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 863,
                                                            columnNumber: 48
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 863,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "weight-label",
                                                        children: "Today's weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 864,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 862,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "weight-input-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        className: "weight-input",
                                                        type: "number",
                                                        placeholder: "—",
                                                        step: "0.1",
                                                        value: weight,
                                                        onChange: (e)=>setWeight(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 867,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "weight-unit",
                                                        children: [
                                                            "lbs ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PencilIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 875,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 875,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 866,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 861,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "weight-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "weight-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "weight-icon",
                                                        children: "🔥"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 880,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "weight-label",
                                                        children: "Active calories"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 881,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 879,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "weight-input-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        className: "weight-input",
                                                        type: "number",
                                                        placeholder: "—",
                                                        step: "1",
                                                        value: activeCalories,
                                                        onChange: (e)=>setActiveCalories(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 884,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "weight-unit",
                                                        children: [
                                                            "kcal ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PencilIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 892,
                                                                columnNumber: 54
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 892,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 883,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 878,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 834,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "card-header",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "card-title",
                                                children: "Meals"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 898,
                                                columnNumber: 17
                                            }, this),
                                            pendingCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "pending-pill",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(DotIcon, {
                                                        size: 5
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 900,
                                                        columnNumber: 49
                                                    }, this),
                                                    pendingCount,
                                                    " unsynced"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 900,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 897,
                                        columnNumber: 15
                                    }, this),
                                    meals.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "meal-empty",
                                        children: "No meals logged today"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 904,
                                        columnNumber: 19
                                    }, this) : meals.map((m, i)=>{
                                        const colors = mealTypeColors[m.type] || mealTypeColors.Lunch;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SwipeMealRow, {
                                            onDelete: ()=>{
                                                const wasSynced = m.synced;
                                                setMeals((prev)=>{
                                                    const updated = prev.filter((_, j)=>j !== i);
                                                    if (wasSynced) return updated.map((m)=>({
                                                            ...m,
                                                            synced: false
                                                        }));
                                                    return updated;
                                                });
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "meal-icon",
                                                    style: {
                                                        background: colors.bg
                                                    },
                                                    children: m.type === 'Snack' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CupIcon, {
                                                        size: 15,
                                                        color: colors.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 918,
                                                        columnNumber: 31
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(UtensilsIcon, {
                                                        size: 15,
                                                        color: colors.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 919,
                                                        columnNumber: 31
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 916,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "meal-body",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "meal-name",
                                                            children: m.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 922,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "meal-meta",
                                                            children: [
                                                                "P ",
                                                                m.protein,
                                                                "g · C ",
                                                                m.carbs,
                                                                "g · F ",
                                                                m.fat,
                                                                "g · ",
                                                                m.type
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 923,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 921,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "meal-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "meal-kcal",
                                                            children: m.calories
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 926,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "meal-kcal-label",
                                                            children: "kcal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 927,
                                                            columnNumber: 27
                                                        }, this),
                                                        m.synced ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "synced-check",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CheckIcon, {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 929,
                                                                    columnNumber: 61
                                                                }, this),
                                                                " synced"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 929,
                                                            columnNumber: 31
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "pending-check",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(DotIcon, {
                                                                    size: 7
                                                                }, void 0, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 930,
                                                                    columnNumber: 62
                                                                }, this),
                                                                " pending"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 930,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 925,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 908,
                                            columnNumber: 23
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 896,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "card-header",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "card-title",
                                            children: "Add a meal"
                                        }, void 0, false, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 940,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 939,
                                        columnNumber: 15
                                    }, this),
                                    photo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "photo-preview",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                src: photo.previewUrl,
                                                alt: "meal"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 944,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                className: "remove-btn",
                                                onClick: ()=>setPhoto(null),
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 945,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 943,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "photo-zone",
                                        onDragOver: (e)=>e.preventDefault(),
                                        onDrop: handleDrop,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handlePhotoSelect,
                                                ref: photoInputRef
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 949,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "photo-zone-text",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CameraIcon, {
                                                        size: 13
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 951,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        children: "Attach a photo"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 952,
                                                        columnNumber: 21
                                                    }, this),
                                                    " or drag & drop"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 950,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 948,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                        value: mealInput,
                                        onChange: (e)=>setMealInput(e.target.value),
                                        onKeyDown: (e)=>{
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) estimateMeal();
                                        },
                                        placeholder: prefillMeal ? `From advisor: ${prefillMeal.name}` : "Describe what you ate — or leave blank if photo is clear enough",
                                        rows: 2
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 956,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "input-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                value: mealType,
                                                onChange: (e)=>setMealType(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                        children: "Breakfast"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 965,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                        children: "Lunch"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 965,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                        children: "Dinner"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 965,
                                                        columnNumber: 67
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                        children: "Snack"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 965,
                                                        columnNumber: 90
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 964,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                className: "btn-estimate",
                                                disabled: mealLoading || !mealInput.trim() && !photo && !prefillMeal,
                                                onClick: estimateMeal,
                                                children: mealLoading ? 'Working...' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            children: "Estimate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 968,
                                                            columnNumber: 51
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ZapIcon, {
                                                            size: 11,
                                                            style: {
                                                                color: '#ff0838'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 968,
                                                            columnNumber: 72
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 967,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 963,
                                        columnNumber: 15
                                    }, this),
                                    mealStatus.text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `status status-${mealStatus.type}`,
                                        children: mealStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 971,
                                        columnNumber: 35
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "divider"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 972,
                                        columnNumber: 15
                                    }, this),
                                    (pendingCount > 0 || weight || activeCalories) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "sync-status",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(DotIcon, {
                                                size: 7
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 975,
                                                columnNumber: 19
                                            }, this),
                                            pendingCount > 0 ? `${pendingCount} meal${pendingCount > 1 ? 's' : ''}` : '',
                                            pendingCount > 0 && (weight || activeCalories) ? ' + ' : '',
                                            weight ? 'weight' : '',
                                            weight && activeCalories ? ' + ' : '',
                                            activeCalories ? 'active cals' : '',
                                            " pending save"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 974,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        className: "btn-sync",
                                        disabled: syncLoading || pendingCount === 0 && !weight && !activeCalories,
                                        onClick: syncToServer,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArrowUpIcon, {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 980,
                                                columnNumber: 17
                                            }, this),
                                            syncLoading ? 'Saving…' : 'Save'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 979,
                                        columnNumber: 15
                                    }, this),
                                    syncStatus.text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `status status-${syncStatus.type}`,
                                        children: syncStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 983,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 938,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 808,
                        columnNumber: 11
                    }, this),
                    tab === 'advisor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "ctx-bar",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Eaten"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 991,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    Math.round(totals.calories),
                                                    " kcal"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 991,
                                                columnNumber: 79
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 991,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Remaining"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 992,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    remaining,
                                                    " kcal"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 992,
                                                columnNumber: 83
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 992,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Protein"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 993,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    Math.round(totals.protein),
                                                    "g"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 993,
                                                columnNumber: 81
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 993,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Protein left"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 994,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    proteinLeft,
                                                    "g"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 994,
                                                columnNumber: 86
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 994,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 990,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "chat",
                                        ref: chatRef,
                                        children: [
                                            chatHistory.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "chat-empty",
                                                children: [
                                                    "Hey! Ask me what to eat next, what you can",
                                                    '\n',
                                                    "make from your kitchen, or how your macros look.",
                                                    '\n',
                                                    "You have ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            remaining,
                                                            " kcal"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1001,
                                                        columnNumber: 132
                                                    }, this),
                                                    " and ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            proteinLeft,
                                                            "g protein"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1001,
                                                        columnNumber: 170
                                                    }, this),
                                                    " left."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1000,
                                                columnNumber: 19
                                            }, this),
                                            chatHistory.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `msg-wrap ${m.role === 'user' ? 'user' : 'assistant'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`,
                                                        children: [
                                                            m.role === 'user' ? m.content : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                dangerouslySetInnerHTML: {
                                                                    __html: m.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1008,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.action === 'log_meal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: 10,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 6,
                                                                    fontFamily: 'var(--mono)',
                                                                    fontSize: 10,
                                                                    letterSpacing: '0.08em',
                                                                    textTransform: 'uppercase',
                                                                    color: 'var(--green)'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CheckIcon, {
                                                                        size: 10
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                                        lineNumber: 1017,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " Logged to your list"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1016,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.mealData && m.action !== 'log_meal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                    className: "log-this-btn",
                                                                    onClick: ()=>{
                                                                        setPrefillMeal(m.mealData);
                                                                        setTab('log');
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PlusIcon, {
                                                                            size: 11
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                                            lineNumber: 1023,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        " Log this meal"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 1022,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1021,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.mealOptions && m.mealOptions.map((opt, oi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                        className: "log-this-btn",
                                                                        onClick: ()=>{
                                                                            setPrefillMeal(opt);
                                                                            setTab('log');
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PlusIcon, {
                                                                                size: 11
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                                lineNumber: 1030,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            " Log: ",
                                                                            opt.name
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                                        lineNumber: 1029,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, oi, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 1028,
                                                                    columnNumber: 25
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1006,
                                                        columnNumber: 21
                                                    }, this)
                                                }, i, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 1005,
                                                    columnNumber: 19
                                                }, this)),
                                            advisorLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "msg-wrap assistant",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "chat-bubble assistant",
                                                    style: {
                                                        color: '#aaa',
                                                        fontStyle: 'italic'
                                                    },
                                                    children: "Thinking..."
                                                }, void 0, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 1039,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1038,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 998,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "chat-input-area",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                value: advisorInput,
                                                onChange: (e)=>setAdvisorInput(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAdvisorMessage();
                                                },
                                                placeholder: modePlaceholders[advisorMode],
                                                rows: 2
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1047,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "chat-input-bottom",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                        className: "mode-select",
                                                        value: advisorMode,
                                                        onChange: (e)=>setAdvisorMode(e.target.value),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "suggest",
                                                                children: "Suggest a meal"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1060,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "pantry",
                                                                children: "Pantry mode"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1061,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "checkin",
                                                                children: "Check-in"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1062,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "recipe",
                                                                children: "Recipe + macros"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1063,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1055,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        className: "btn-send",
                                                        disabled: advisorLoading,
                                                        onClick: ()=>sendAdvisorMessage(),
                                                        children: [
                                                            "Send ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SendIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 1066,
                                                                columnNumber: 26
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1065,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1054,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1046,
                                        columnNumber: 15
                                    }, this),
                                    advisorStatus.text && !advisorLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `status status-${advisorStatus.type}`,
                                        children: advisorStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1070,
                                        columnNumber: 57
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 997,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 989,
                        columnNumber: 11
                    }, this),
                    tab === 'history' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "card-title",
                                style: {
                                    fontFamily: 'var(--serif)',
                                    fontSize: 22,
                                    marginBottom: 14
                                },
                                children: "History"
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 1077,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "history-acc",
                                children: weekSlots.map(({ date: d, row })=>{
                                    const open = historyExpanded === d;
                                    const muted = !row;
                                    const cal = row ? Number(row.calories) || 0 : 0;
                                    const prot = row ? Number(row.protein) || 0 : 0;
                                    const label = editDayLabel(d, todayDate);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `history-row${muted ? ' muted' : ''}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                role: muted ? undefined : 'button',
                                                className: `history-row-head${open ? ' open' : ''}`,
                                                onClick: ()=>{
                                                    if (muted) return;
                                                    setHistoryExpanded(open ? null : d);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            label,
                                                            " · ",
                                                            row ? `${cal} kcal · P${prot}g` : '—'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1097,
                                                        columnNumber: 23
                                                    }, this),
                                                    !muted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "chev",
                                                        children: "›"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1100,
                                                        columnNumber: 34
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1089,
                                                columnNumber: 21
                                            }, this),
                                            open && row && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "history-row-body",
                                                children: [
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["parseMealLogText"])(row.meal_log || '').map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "history-meal-line",
                                                            children: [
                                                                m.type,
                                                                ": ",
                                                                m.name,
                                                                " — ",
                                                                m.calories,
                                                                " kcal (P",
                                                                m.protein,
                                                                " C",
                                                                m.carbs,
                                                                " F",
                                                                m.fat,
                                                                ")"
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 1105,
                                                            columnNumber: 27
                                                        }, this)),
                                                    (!row.meal_log || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$lib$2f$mealLog$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["parseMealLogText"])(row.meal_log).length) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "history-meal-line",
                                                        children: "No meals logged"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1110,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 10,
                                                            fontFamily: 'var(--sans)',
                                                            fontSize: 13
                                                        },
                                                        children: [
                                                            "Weight: ",
                                                            row.weight != null ? `${row.weight} lbs` : '—',
                                                            " · Active:",
                                                            ' ',
                                                            row.active_calories != null ? `${row.active_calories} kcal` : '—'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1112,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 6,
                                                            fontFamily: 'var(--mono)',
                                                            fontSize: 11
                                                        },
                                                        children: [
                                                            "Net ",
                                                            (Number(row.calories) || 0) - (Number(row.active_calories) || 0),
                                                            " kcal vs TDEE",
                                                            ' ',
                                                            TDEE,
                                                            ' ',
                                                            (()=>{
                                                                const net = (Number(row.calories) || 0) - (Number(row.active_calories) || 0);
                                                                const diff = TDEE - net;
                                                                return diff >= 0 ? `(deficit ${diff})` : `(surplus ${Math.abs(diff)})`;
                                                            })()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1116,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "log-this-btn",
                                                        style: {
                                                            marginTop: 12
                                                        },
                                                        onClick: ()=>{
                                                            setViewDate(d);
                                                            setTab('log');
                                                        },
                                                        children: "Edit this day →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 1125,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 1103,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, d, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1088,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 1080,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "history-summary-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        children: "This week"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1143,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Avg daily calories: ",
                                            avgWeekCal || '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Avg daily protein: ",
                                            avgWeekProt ? `${avgWeekProt}g` : '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1145,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Total deficit vs TDEE (net): ",
                                            totalDeficit >= 0 ? `+${totalDeficit}` : totalDeficit,
                                            " kcal"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1146,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Days ≥ ",
                                            PROTEIN_TARGET,
                                            "g protein: ",
                                            daysProteinHit
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1147,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Days net at or under TDEE: ",
                                            daysUnderTdee
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 1148,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 1142,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(HistoryCharts, {
                                entriesChrono: historyEntries,
                                tdee: TDEE
                            }, void 0, false, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 1150,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 1076,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 788,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_un1e~._.js.map