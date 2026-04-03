(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime/runtime-types.d.ts" />
/// <reference path="../../../shared/runtime/dev-globals.d.ts" />
/// <reference path="../../../shared/runtime/dev-protocol.d.ts" />
/// <reference path="../../../shared/runtime/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateB.type === 'total') {
        // A total update replaces the entire chunk, so it supersedes any prior update.
        return updateB;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/health-tracker/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health-tracker/node_modules/next/head.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const MAKE_WEBHOOK = 'https://hook.us2.make.com/3ppntn8yxn2jwjo2xp6rm18ku5gl5x2g';
const TDEE = 1795;
const PROTEIN_TARGET = 110;
const ZapIcon = ({ size = 14, style = {} })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "currentColor",
        stroke: "none",
        style: style,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
            points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 10,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 9,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = ZapIcon;
const SmileIcon = ({ size = 14, style = {} })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        style: style,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 15,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M8 13s1.5 2 4 2 4-2 4-2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 15,
                columnNumber: 37
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "9",
                y1: "9",
                x2: "9.01",
                y2: "9"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 16,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "15",
                y1: "9",
                x2: "15.01",
                y2: "9"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 16,
                columnNumber: 43
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c1 = SmileIcon;
const CameraIcon = ({ size = 13 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 21,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "13",
                r: "4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 22,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 20,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c2 = CameraIcon;
const CheckIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
            points: "20 6 9 17 4 12"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 27,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 26,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = CheckIcon;
const DotIcon = ({ size = 8, color = '#00a165' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: color,
        stroke: "none",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            cx: "12",
            cy: "12",
            r: "8"
        }, void 0, false, {
            fileName: "[project]/health-tracker/pages/index.js",
            lineNumber: 32,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 31,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = DotIcon;
const ScaleIcon = ({ size = 14 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 3v19"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 37,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M5 21h14"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 37,
                columnNumber: 25
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 7l4-4 5 4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 38,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M21 7l-4-4-5 4"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 38,
                columnNumber: 29
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 7c0 3.3 2.7 6 6 6s6-2.7 6-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 39,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M21 7c0 3.3-2.7 6-6 6s-6-2.7-6-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 40,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 36,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c5 = ScaleIcon;
const PencilIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 45,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 46,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c6 = PencilIcon;
const ArrowUpIcon = ({ size = 16 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 51,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: "16 12 12 8 8 12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 52,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "16",
                x2: "12",
                y2: "8"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 52,
                columnNumber: 41
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 50,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c7 = ArrowUpIcon;
const PlusIcon = ({ size = 11 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "10"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 57,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "8",
                x2: "12",
                y2: "16"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 58,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "8",
                y1: "12",
                x2: "16",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 58,
                columnNumber: 43
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 56,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c8 = PlusIcon;
const SendIcon = ({ size = 10 })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "22",
                y1: "2",
                x2: "11",
                y2: "13"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 63,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "22 2 15 22 11 13 2 9 22 2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 64,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c9 = SendIcon;
const UtensilsIcon = ({ size = 15, color = '#00a165' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 69,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 2v20"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 69,
                columnNumber: 55
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 70,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 68,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c10 = UtensilsIcon;
const CupIcon = ({ size = 15, color = '#d080d0' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M8 2h8l1 10H7L8 2z"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 75,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 12c0 4 2 6 5 6s5-2 5-6"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 75,
                columnNumber: 35
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6 21h12"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 75,
                columnNumber: 72
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 74,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c11 = CupIcon;
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
`;
function SwipeMealRow({ children, onDelete }) {
    _s();
    const wrapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const itemRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const currentX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const isDragging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "meal-row-wrap",
        ref: wrapRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "meal-delete-bg",
                children: "Delete"
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "meal-item",
                ref: itemRef,
                onTouchStart: onTouchStart,
                onTouchMove: onTouchMove,
                onTouchEnd: onTouchEnd,
                onMouseDown: onMouseDown,
                children: children
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 279,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health-tracker/pages/index.js",
        lineNumber: 277,
        columnNumber: 5
    }, this);
}
_s(SwipeMealRow, "7+la+7Tp4mf3FabAUW36qg72z5c=");
_c12 = SwipeMealRow;
function Home() {
    _s1();
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('log');
    const [meals, setMeals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [totals, setTotals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });
    const [mealInput, setMealInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [mealType, setMealType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('Breakfast');
    const [photo, setPhoto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mealLoading, setMealLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mealStatus, setMealStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        text: '',
        type: ''
    });
    const [weight, setWeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [activeCalories, setActiveCalories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [syncLoading, setSyncLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [syncStatus, setSyncStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        text: '',
        type: ''
    });
    const [advisorMode, setAdvisorMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('suggest');
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [advisorInput, setAdvisorInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [advisorLoading, setAdvisorLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [advisorStatus, setAdvisorStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        text: '',
        type: ''
    });
    const [showSuggestions, setShowSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [prefillMeal, setPrefillMeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const photoInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [displayDate, setDisplayDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const _now = new Date();
    const localDate = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            setDisplayDate(new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }));
        }
    }["Home.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            async function loadToday() {
                setMealStatus({
                    text: "Loading today's data...",
                    type: 'loading'
                });
                try {
                    const res = await fetch(`/api/today?date=${localDate}`, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    });
                    const data = await res.json();
                    if (!data.found) {
                        setMealStatus({
                            text: '',
                            type: ''
                        });
                        return;
                    }
                    const restored = (data.meals || []).map({
                        "Home.useEffect.loadToday.restored": (m)=>({
                                ...m,
                                synced: true
                            })
                    }["Home.useEffect.loadToday.restored"]);
                    setMeals(restored);
                    setTotals({
                        calories: data.calories,
                        protein: data.protein,
                        carbs: data.carbs,
                        fat: data.fat
                    });
                    setMealStatus({
                        text: `✓ Restored today's data (${Math.round(data.calories)} kcal)`,
                        type: 'success'
                    });
                    setTimeout({
                        "Home.useEffect.loadToday": ()=>setMealStatus({
                                text: '',
                                type: ''
                            })
                    }["Home.useEffect.loadToday"], 3000);
                } catch  {
                    setMealStatus({
                        text: "⚠ Couldn't load today's data",
                        type: 'error'
                    });
                }
            }
            loadToday();
        }
    }["Home.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (meals.length === 0) return;
            const t = meals.reduce({
                "Home.useEffect.t": (acc, m)=>({
                        calories: acc.calories + m.calories,
                        protein: acc.protein + m.protein,
                        carbs: acc.carbs + m.carbs,
                        fat: acc.fat + m.fat
                    })
            }["Home.useEffect.t"], {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            });
            setTotals(t);
        }
    }["Home.useEffect"], [
        meals
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }["Home.useEffect"], [
        chatHistory
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (prefillMeal) {
                setTab('log');
                setMealInput(prefillMeal.name);
            }
        }
    }["Home.useEffect"], [
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
    async function syncToNotion() {
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
            text: 'Syncing to Notion...',
            type: 'loading'
        });
        try {
            const mealLogText = meals.map((m)=>`${m.type}: ${m.name} — ${m.calories} kcal | P${m.protein}g C${m.carbs}g F${m.fat}g`).join('\n');
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
                date: localDate,
                calories: Math.round(currentTotals.calories),
                protein: Math.round(currentTotals.protein),
                carbs: Math.round(currentTotals.carbs),
                fat: Math.round(currentTotals.fat),
                meal_log: mealLogText
            };
            if (weight) payload.weight = parseFloat(weight);
            if (activeCalories) payload.active_calories = parseInt(activeCalories);
            await fetch(MAKE_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            setMeals((prev)=>prev.map((m)=>({
                        ...m,
                        synced: true
                    })));
            setWeight('');
            setActiveCalories('');
            setSyncStatus({
                text: '✓ Synced to Notion',
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
    const modePlaceholders = {
        suggest: "What should I eat next?",
        pantry: "Tell me what ingredients you have...",
        checkin: "How's my day looking?",
        recipe: "Give me a recipe that fits my macros..."
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Body Log"
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 530,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                    }, void 0, false, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 531,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 529,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: styles
            }, void 0, false, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 533,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky-top",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "header-title",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ZapIcon, {
                                                size: 18,
                                                style: {
                                                    color: '#ff0838'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 538,
                                                columnNumber: 15
                                            }, this),
                                            "Body Log"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 537,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "header-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "header-date",
                                                children: displayDate
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 542,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "https://www.notion.so/ltng/Fitness-Tracker-2953044a1af9806c82a4dd71b72b72e2",
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: '#ffc0ff',
                                                    opacity: 0.85
                                                },
                                                title: "Open in Notion",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "16",
                                                    height: "16",
                                                    viewBox: "0 0 24 24",
                                                    fill: "currentColor",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 544,
                                                        columnNumber: 85
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 544,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 543,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SmileIcon, {
                                                size: 16,
                                                style: {
                                                    color: '#ffc0ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 546,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 541,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 536,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tabs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `tab ${tab === 'log' ? 'active' : ''}`,
                                        onClick: ()=>setTab('log'),
                                        children: "Log"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 550,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `tab ${tab === 'advisor' ? 'active' : ''}`,
                                        onClick: ()=>setTab('advisor'),
                                        children: "Advisor"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 551,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 549,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this),
                    tab === 'log' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "today-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "today-label",
                                        children: "Today's intake"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 558,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "macros-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-value big",
                                                        children: Math.round(totals.calories).toLocaleString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 561,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "kcal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 562,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 560,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.protein),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 565,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "protein"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 566,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 564,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.carbs),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 569,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "carbs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 570,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 568,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "macro-cell",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-value",
                                                        children: [
                                                            Math.round(totals.fat),
                                                            "g"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 573,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "macro-label",
                                                        children: "fat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 574,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 572,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 559,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bar-track",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bar-fill",
                                            style: {
                                                width: pct + '%'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 578,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 577,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bar-labels",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    Math.round(totals.calories).toLocaleString(),
                                                    " eaten"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 581,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: deficit >= 0 ? `${deficit} remaining of ${TDEE}` : `${Math.abs(deficit)} over`
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 582,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 580,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "weight-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "weight-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "weight-icon",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScaleIcon, {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 586,
                                                            columnNumber: 48
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 586,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "weight-label",
                                                        children: "Today's weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 587,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 585,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "weight-input-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        className: "weight-input",
                                                        type: "number",
                                                        placeholder: "—",
                                                        step: "0.1",
                                                        value: weight,
                                                        onChange: (e)=>setWeight(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 590,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "weight-unit",
                                                        children: [
                                                            "lbs ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PencilIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 598,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 598,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 589,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 584,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "weight-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "weight-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "weight-icon",
                                                        children: "🔥"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 603,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "weight-label",
                                                        children: "Active calories"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 604,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 602,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "weight-input-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        className: "weight-input",
                                                        type: "number",
                                                        placeholder: "—",
                                                        step: "1",
                                                        value: activeCalories,
                                                        onChange: (e)=>setActiveCalories(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 607,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "weight-unit",
                                                        children: [
                                                            "kcal ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PencilIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 615,
                                                                columnNumber: 54
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 615,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 606,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 601,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 557,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-header",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "card-title",
                                                children: "Meals"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 621,
                                                columnNumber: 17
                                            }, this),
                                            pendingCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pending-pill",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DotIcon, {
                                                        size: 5
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 623,
                                                        columnNumber: 49
                                                    }, this),
                                                    pendingCount,
                                                    " unsynced"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 623,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 620,
                                        columnNumber: 15
                                    }, this),
                                    meals.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "meal-empty",
                                        children: "No meals logged today"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 627,
                                        columnNumber: 19
                                    }, this) : meals.map((m, i)=>{
                                        const colors = mealTypeColors[m.type] || mealTypeColors.Lunch;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SwipeMealRow, {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "meal-icon",
                                                    style: {
                                                        background: colors.bg
                                                    },
                                                    children: m.type === 'Snack' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CupIcon, {
                                                        size: 15,
                                                        color: colors.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 641,
                                                        columnNumber: 31
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UtensilsIcon, {
                                                        size: 15,
                                                        color: colors.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 642,
                                                        columnNumber: 31
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 639,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "meal-body",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "meal-name",
                                                            children: m.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 645,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                            lineNumber: 646,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 644,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "meal-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "meal-kcal",
                                                            children: m.calories
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 649,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "meal-kcal-label",
                                                            children: "kcal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 650,
                                                            columnNumber: 27
                                                        }, this),
                                                        m.synced ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "synced-check",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckIcon, {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 652,
                                                                    columnNumber: 61
                                                                }, this),
                                                                " synced"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 652,
                                                            columnNumber: 31
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "pending-check",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DotIcon, {
                                                                    size: 7
                                                                }, void 0, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 653,
                                                                    columnNumber: 62
                                                                }, this),
                                                                " pending"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 653,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 648,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 631,
                                            columnNumber: 23
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 619,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-header",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "card-title",
                                            children: "Add a meal"
                                        }, void 0, false, {
                                            fileName: "[project]/health-tracker/pages/index.js",
                                            lineNumber: 663,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 662,
                                        columnNumber: 15
                                    }, this),
                                    photo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "photo-preview",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: photo.previewUrl,
                                                alt: "meal"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 667,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "remove-btn",
                                                onClick: ()=>setPhoto(null),
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 668,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 666,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "photo-zone",
                                        onDragOver: (e)=>e.preventDefault(),
                                        onDrop: handleDrop,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handlePhotoSelect,
                                                ref: photoInputRef
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 672,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "photo-zone-text",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraIcon, {
                                                        size: 13
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 674,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Attach a photo"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 675,
                                                        columnNumber: 21
                                                    }, this),
                                                    " or drag & drop"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 673,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 671,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: mealInput,
                                        onChange: (e)=>setMealInput(e.target.value),
                                        onKeyDown: (e)=>{
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) estimateMeal();
                                        },
                                        placeholder: prefillMeal ? `From advisor: ${prefillMeal.name}` : "Describe what you ate — or leave blank if photo is clear enough",
                                        rows: 2
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 679,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "input-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: mealType,
                                                onChange: (e)=>setMealType(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Breakfast"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 688,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Lunch"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 688,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Dinner"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 688,
                                                        columnNumber: 67
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Snack"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 688,
                                                        columnNumber: 90
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 687,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-estimate",
                                                disabled: mealLoading || !mealInput.trim() && !photo && !prefillMeal,
                                                onClick: estimateMeal,
                                                children: mealLoading ? 'Working...' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Estimate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 691,
                                                            columnNumber: 51
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ZapIcon, {
                                                            size: 11,
                                                            style: {
                                                                color: '#ff0838'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                            lineNumber: 691,
                                                            columnNumber: 72
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 690,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 686,
                                        columnNumber: 15
                                    }, this),
                                    mealStatus.text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `status status-${mealStatus.type}`,
                                        children: mealStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 694,
                                        columnNumber: 35
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "divider"
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 695,
                                        columnNumber: 15
                                    }, this),
                                    (pendingCount > 0 || weight || activeCalories) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sync-status",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DotIcon, {
                                                size: 7
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 698,
                                                columnNumber: 19
                                            }, this),
                                            pendingCount > 0 ? `${pendingCount} meal${pendingCount > 1 ? 's' : ''}` : '',
                                            pendingCount > 0 && (weight || activeCalories) ? ' + ' : '',
                                            weight ? 'weight' : '',
                                            weight && activeCalories ? ' + ' : '',
                                            activeCalories ? 'active cals' : '',
                                            " pending sync to Notion"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 697,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn-sync",
                                        disabled: syncLoading || pendingCount === 0 && !weight && !activeCalories,
                                        onClick: syncToNotion,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ArrowUpIcon, {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 703,
                                                columnNumber: 17
                                            }, this),
                                            syncLoading ? 'Syncing...' : 'Sync to Notion'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 702,
                                        columnNumber: 15
                                    }, this),
                                    syncStatus.text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `status status-${syncStatus.type}`,
                                        children: syncStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 706,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 661,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 556,
                        columnNumber: 11
                    }, this),
                    tab === 'advisor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ctx-bar",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Eaten"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 714,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    Math.round(totals.calories),
                                                    " kcal"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 714,
                                                columnNumber: 79
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 714,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Remaining"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 715,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    remaining,
                                                    " kcal"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 715,
                                                columnNumber: 83
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 715,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Protein"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 716,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    Math.round(totals.protein),
                                                    "g"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 716,
                                                columnNumber: 81
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 716,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ctx-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-label",
                                                children: "Protein left"
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 717,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ctx-value",
                                                children: [
                                                    proteinLeft,
                                                    "g"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 717,
                                                columnNumber: 86
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 717,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 713,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "chat",
                                        ref: chatRef,
                                        children: [
                                            chatHistory.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chat-empty",
                                                children: [
                                                    "Hey! Ask me what to eat next, what you can",
                                                    '\n',
                                                    "make from your kitchen, or how your macros look.",
                                                    '\n',
                                                    "You have ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            remaining,
                                                            " kcal"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 724,
                                                        columnNumber: 132
                                                    }, this),
                                                    " and ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            proteinLeft,
                                                            "g protein"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 724,
                                                        columnNumber: 170
                                                    }, this),
                                                    " left."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 723,
                                                columnNumber: 19
                                            }, this),
                                            chatHistory.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `msg-wrap ${m.role === 'user' ? 'user' : 'assistant'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`,
                                                        children: [
                                                            m.role === 'user' ? m.content : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                dangerouslySetInnerHTML: {
                                                                    __html: m.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 731,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.action === 'log_meal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckIcon, {
                                                                        size: 10
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                                        lineNumber: 740,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " Logged to your list"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 739,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.mealData && m.action !== 'log_meal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    className: "log-this-btn",
                                                                    onClick: ()=>{
                                                                        setPrefillMeal(m.mealData);
                                                                        setTab('log');
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlusIcon, {
                                                                            size: 11
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/health-tracker/pages/index.js",
                                                                            lineNumber: 746,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        " Log this meal"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 745,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 744,
                                                                columnNumber: 25
                                                            }, this),
                                                            m.role === 'assistant' && m.mealOptions && m.mealOptions.map((opt, oi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        className: "log-this-btn",
                                                                        onClick: ()=>{
                                                                            setPrefillMeal(opt);
                                                                            setTab('log');
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlusIcon, {
                                                                                size: 11
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                                lineNumber: 753,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            " Log: ",
                                                                            opt.name
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                                        lineNumber: 752,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, oi, false, {
                                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                                    lineNumber: 751,
                                                                    columnNumber: 25
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 729,
                                                        columnNumber: 21
                                                    }, this)
                                                }, i, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 728,
                                                    columnNumber: 19
                                                }, this)),
                                            advisorLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "msg-wrap assistant",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "chat-bubble assistant",
                                                    style: {
                                                        color: '#aaa',
                                                        fontStyle: 'italic'
                                                    },
                                                    children: "Thinking..."
                                                }, void 0, false, {
                                                    fileName: "[project]/health-tracker/pages/index.js",
                                                    lineNumber: 762,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 761,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 721,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "chat-input-area",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: advisorInput,
                                                onChange: (e)=>setAdvisorInput(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAdvisorMessage();
                                                },
                                                placeholder: modePlaceholders[advisorMode],
                                                rows: 2
                                            }, void 0, false, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 770,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chat-input-bottom",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        className: "mode-select",
                                                        value: advisorMode,
                                                        onChange: (e)=>setAdvisorMode(e.target.value),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "suggest",
                                                                children: "Suggest a meal"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 783,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "pantry",
                                                                children: "Pantry mode"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 784,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "checkin",
                                                                children: "Check-in"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 785,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "recipe",
                                                                children: "Recipe + macros"
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 786,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 778,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-send",
                                                        disabled: advisorLoading,
                                                        onClick: ()=>sendAdvisorMessage(),
                                                        children: [
                                                            "Send ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SendIcon, {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/health-tracker/pages/index.js",
                                                                lineNumber: 789,
                                                                columnNumber: 26
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health-tracker/pages/index.js",
                                                        lineNumber: 788,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health-tracker/pages/index.js",
                                                lineNumber: 777,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 769,
                                        columnNumber: 15
                                    }, this),
                                    advisorStatus.text && !advisorLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health$2d$tracker$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `status status-${advisorStatus.type}`,
                                        children: advisorStatus.text
                                    }, void 0, false, {
                                        fileName: "[project]/health-tracker/pages/index.js",
                                        lineNumber: 793,
                                        columnNumber: 57
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health-tracker/pages/index.js",
                                lineNumber: 720,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health-tracker/pages/index.js",
                        lineNumber: 712,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health-tracker/pages/index.js",
                lineNumber: 534,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s1(Home, "Fyzj8AT2UCHyj6NZYalm2O7sN2E=");
_c13 = Home;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13;
__turbopack_context__.k.register(_c, "ZapIcon");
__turbopack_context__.k.register(_c1, "SmileIcon");
__turbopack_context__.k.register(_c2, "CameraIcon");
__turbopack_context__.k.register(_c3, "CheckIcon");
__turbopack_context__.k.register(_c4, "DotIcon");
__turbopack_context__.k.register(_c5, "ScaleIcon");
__turbopack_context__.k.register(_c6, "PencilIcon");
__turbopack_context__.k.register(_c7, "ArrowUpIcon");
__turbopack_context__.k.register(_c8, "PlusIcon");
__turbopack_context__.k.register(_c9, "SendIcon");
__turbopack_context__.k.register(_c10, "UtensilsIcon");
__turbopack_context__.k.register(_c11, "CupIcon");
__turbopack_context__.k.register(_c12, "SwipeMealRow");
__turbopack_context__.k.register(_c13, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/health-tracker/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/health-tracker/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if ("TURBOPACK compile-time truthy", 1) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/health-tracker/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/health-tracker/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__04.6gxn._.js.map