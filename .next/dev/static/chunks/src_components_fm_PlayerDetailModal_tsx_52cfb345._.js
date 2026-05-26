(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/PlayerDetailModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerDetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useDraggableModal.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/footprints.js [app-client] (ecmascript) <export default as Footprints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dumbbell.js [app-client] (ecmascript) <export default as Dumbbell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scale$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scale.js [app-client] (ecmascript) <export default as Scale>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gavel.js [app-client] (ecmascript) <export default as Gavel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-pulse.js [app-client] (ecmascript) <export default as HeartPulse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Radar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Radar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$RadarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/RadarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/PolarGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarAngleAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/PolarAngleAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarRadiusAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/PolarRadiusAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/inflation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traits.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traitsData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playStyles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ui-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/injuryManager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerStatsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/PlayerStatsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerPositionMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/PlayerPositionMap.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// ──────────── Helpers ────────────
// ──────────── Stat Row Component (FM Grid Style) ────────────
function StatRow({ label, value, isObserved = true }) {
    const displayVal = isObserved ? value : '??';
    const valNum = typeof value === 'number' ? value : 50;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-between px-2 py-[3px] ${isObserved ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmStatBg"])(valNum) : 'bg-white/[0.02]'} rounded-sm`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] text-white/50 font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-[11px] font-bold font-mono ${isObserved ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmStatColor"])(valNum) : 'text-white/20'}`,
                children: displayVal
            }, void 0, false, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_c = StatRow;
// ──────────── Attribute Column Component ────────────
function AttrColumn({ title, icon, stats, isObserved = true }) {
    const avg = isObserved ? Math.round(stats.reduce((a, s)=>a + s.val, 0) / stats.length) : '??';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px",
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-black uppercase tracking-[0.2em] text-white/60",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-px bg-white/[0.06]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[11px] font-mono font-black ${isObserved && typeof avg === 'number' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmStatColor"])(avg) : 'text-white/20'}`,
                        children: avg
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-px",
                children: stats.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: s.label,
                        value: s.val,
                        isObserved: isObserved
                    }, s.label, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c1 = AttrColumn;
function PlayerDetailModal({ player: initialPlayer, onClose, teamStats, onSell, marketListing, onBuy, onBid, onSign, trainingState, onTrainingStateChange, profileMoney, profileTeamName, profileId, isAdmin }) {
    _s();
    const { scoutPlayer, watchlist, toggleWatchlist } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const { success: toastSuccess, error: toastError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [player, setPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialPlayer);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(marketListing ? 'market' : 'genel');
    // Keep local state in sync
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "PlayerDetailModal.useEffect": ()=>{
            setPlayer(initialPlayer);
        }
    }["PlayerDetailModal.useEffect"], [
        initialPlayer
    ]);
    const isOwned = profileTeamName && player.club === profileTeamName;
    const isScouted = player.scouted || isAdmin || isOwned;
    const [showActions, setShowActions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sellPrice, setSellPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isSelling, setIsSelling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBuying, setIsBuying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isRenewingContract, setIsRenewingContract] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Sözleşme uzatma slider display güncelleme ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerDetailModal.useEffect": ()=>{
            if (!isRenewingContract) return;
            const slider = document.getElementById('contract-renew-weeks');
            const display = document.getElementById('contract-renew-weeks-display');
            if (!slider || !display) return;
            const update = {
                "PlayerDetailModal.useEffect.update": ()=>{
                    display.textContent = slider.value;
                }
            }["PlayerDetailModal.useEffect.update"];
            slider.addEventListener('input', update);
            return ({
                "PlayerDetailModal.useEffect": ()=>slider.removeEventListener('input', update)
            })["PlayerDetailModal.useEffect"];
        }
    }["PlayerDetailModal.useEffect"], [
        isRenewingContract
    ]);
    // ── Fizyoterapist tedavi state ──
    const [isPhysioTreating, setIsPhysioTreating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [physioInfo, setPhysioInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Sakat oyuncunun fizyoterapist bilgilerini çek ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerDetailModal.useEffect": ()=>{
            if (player.is_injured && isOwned && profileId) {
                const fetchPhysios = {
                    "PlayerDetailModal.useEffect.fetchPhysios": async ()=>{
                        try {
                            const res = await fetch(`/api/staff?userId=${profileId}`);
                            const data = await res.json();
                            if (data.staff && Array.isArray(data.staff)) {
                                const physios = data.staff.filter({
                                    "PlayerDetailModal.useEffect.fetchPhysios.physios": (s)=>s.type === 'physio'
                                }["PlayerDetailModal.useEffect.fetchPhysios.physios"]);
                                if (physios.length > 0) {
                                    const stars = physios.map({
                                        "PlayerDetailModal.useEffect.fetchPhysios.stars": (p)=>p.stars
                                    }["PlayerDetailModal.useEffect.fetchPhysios.stars"]);
                                    const totalHealing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePhysioHealing"])(stars);
                                    setPhysioInfo({
                                        stars,
                                        totalHealing
                                    });
                                }
                            }
                        } catch (err) {
                            console.error('[PlayerDetailModal] Physio fetch error:', err);
                        }
                    }
                }["PlayerDetailModal.useEffect.fetchPhysios"];
                fetchPhysios();
            }
        }
    }["PlayerDetailModal.useEffect"], [
        player.is_injured,
        isOwned,
        profileId
    ]);
    // ── Kiralama form state ──
    const [showLoanForm, setShowLoanForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loanWeeks, setLoanWeeks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(17);
    const [loanFeeEuro, setLoanFeeEuro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Math.round((player.market_value || 500000) * 0.15));
    const [isSendingLoan, setIsSendingLoan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Auction countdown timer ──
    const [auctionTimeLeft, setAuctionTimeLeft] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "PlayerDetailModal.useEffect": ()=>{
            if (!marketListing?.expires_at) return;
            const update = {
                "PlayerDetailModal.useEffect.update": ()=>{
                    const diff = new Date(marketListing.expires_at).getTime() - Date.now();
                    if (diff <= 0) {
                        setAuctionTimeLeft('Sona Erdi');
                        return;
                    }
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor(diff % 3600000 / 60000);
                    const s = Math.floor(diff % 60000 / 1000);
                    setAuctionTimeLeft(h > 0 ? `${h}s ${m}dk ${s}sn` : `${m}dk ${s}sn`);
                }
            }["PlayerDetailModal.useEffect.update"];
            update();
            const interval = setInterval(update, 1000);
            return ({
                "PlayerDetailModal.useEffect": ()=>clearInterval(interval)
            })["PlayerDetailModal.useEffect"];
        }
    }["PlayerDetailModal.useEffect"], [
        marketListing?.expires_at
    ]);
    const isSeller = !!profileTeamName && !!marketListing && marketListing.seller_id === profileTeamName;
    const isHighestBidder = !!profileTeamName && !!marketListing && marketListing.highest_bidder_id === profileTeamName;
    const rating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player?.rating || 65);
    const potential = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player?.potential || 70);
    const playStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayStyleEffect"])(player?.playStyle || '');
    const marketValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMarketValue"])(player);
    const corridor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTransferCorridor"])(marketValue);
    const potentialDiff = potential - rating;
    const isWatched = watchlist?.includes(player.id);
    // Auto-set min price when entering market tab, and reset tab if not owned
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "PlayerDetailModal.useEffect": ()=>{
            if (activeTab === 'market' && sellPrice === 0) {
                setSellPrice(corridor.min);
            }
            if (activeTab === 'antrenman' && !isOwned) {
                setActiveTab('genel');
            }
        }
    }["PlayerDetailModal.useEffect"], [
        activeTab,
        corridor.min,
        sellPrice,
        isOwned
    ]);
    const handlePhotoUpload = (e)=>{
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = ()=>{
                const base64String = reader.result;
                // In a real app we'd upload to storage. Here we update state.
                // We'll need a way to notify parent if we want persistence.
                player.photo_url = base64String;
                // Trigger a re-render or notify context if possible
                // For now, it will work in this session.
                e.target.value = null; // Reset input
                window.dispatchEvent(new CustomEvent('player-photo-updated', {
                    detail: {
                        playerId: player.id,
                        photoUrl: base64String
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    // Spesifik mevki bilgisini al
    const sp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerPos"])(player);
    const isGK = player.position === 'GK' || sp === 'GK';
    // Technical or Goalkeeping — Doğrudan player attribute'leri, yoksa varsayılan 50
    const technicalStats = isGK ? [
        {
            label: 'Refleksler',
            val: player.goalkeeping ?? 50
        },
        {
            label: 'Top Tutma',
            val: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])((player.goalkeeping ?? 50) * 0.95)
        },
        {
            label: 'Bire Bir',
            val: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])((player.goalkeeping ?? 50) * 1.05)
        },
        {
            label: 'Hava Hakimiyeti',
            val: player.jumping ?? 50
        },
        {
            label: 'Alan Hakimiyeti',
            val: player.positioning ?? 50
        },
        {
            label: 'Degaj',
            val: player.passing ?? 50
        },
        {
            label: 'Elle Oyun',
            val: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])((player.passing ?? 50) * 1.1)
        },
        {
            label: 'İletişim',
            val: player.leadership ?? 50
        },
        {
            label: 'Konsantrasyon',
            val: player.concentration ?? 50
        },
        {
            label: 'Çeviklik',
            val: player.agility ?? 50
        }
    ] : [
        {
            label: 'Bitiricilik',
            val: player.finishing ?? player.shooting ?? 50
        },
        {
            label: 'Dribbling',
            val: player.dribbling ?? 50
        },
        {
            label: 'İlk Kontrol',
            val: player.firstTouch ?? player.control ?? 50
        },
        {
            label: 'Kafa Vuruşu',
            val: player.heading ?? player.power ?? 50
        },
        {
            label: 'Markaj',
            val: player.marking ?? player.defending ?? 50
        },
        {
            label: 'Orta Yapma',
            val: player.crossing ?? player.passing ?? 50
        },
        {
            label: 'Pas',
            val: player.passing ?? 50
        },
        {
            label: 'Teknik',
            val: player.technique ?? player.control ?? 50
        },
        {
            label: 'Top Kapma',
            val: player.tackling ?? player.defending ?? 50
        },
        {
            label: 'Uzaktan Şut',
            val: player.longShots ?? player.shooting ?? 50
        }
    ];
    // ── Özet Skorları: Doğrudan player attribute'lerinden, yoksa varsayılan 50 ──
    // Özel Yetenek: traits/personalityTraits sayısından türetilir (0-100)
    const traitScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.flair || Math.min(100, 30 + (player.traits?.length || 0) * 12 + (player.personalityTraits?.length || 0) * 8));
    // Mental — Her stat doğrudan kendi attribute'ünden, derived stats kullanılmaz
    const mentalStats = [
        {
            label: 'Agresiflik',
            val: player.aggression ?? 50
        },
        {
            label: 'Cesaret',
            val: player.bravery ?? 50
        },
        {
            label: 'Çalışkanlık',
            val: player.workRate ?? 50
        },
        {
            label: 'Karar Alma',
            val: player.decisions ?? 50
        },
        {
            label: 'Kararlılık',
            val: player.determination ?? 50
        },
        {
            label: 'Konsantrasyon',
            val: player.concentration ?? 50
        },
        {
            label: 'Liderlik',
            val: player.leadership ?? 50
        },
        {
            label: 'Önsez',
            val: player.anticipation ?? 50
        },
        {
            label: 'Özel Yetenek',
            val: traitScore
        },
        {
            label: 'Pozisyon Alma',
            val: player.positioning ?? player.offTheBall ?? 50
        },
        {
            label: 'Soğukkanlılık',
            val: player.composure ?? 50
        },
        {
            label: 'Takım Oyunu',
            val: player.teamwork ?? 50
        },
        {
            label: 'Vizyon',
            val: player.vision ?? 50
        }
    ];
    // Physical — Doğrudan player attribute'leri, yoksa varsayılan 50
    const physicalStats = [
        {
            label: 'Çeviklik',
            val: player.agility ?? 50
        },
        {
            label: 'Dayanıklılık',
            val: player.stamina ?? player.cond ?? 50
        },
        {
            label: 'Denge',
            val: player.balance ?? 50
        },
        {
            label: 'Güç',
            val: player.strength ?? player.power ?? 50
        },
        {
            label: 'Hız',
            val: player.speed ?? 50
        },
        {
            label: 'Hızlanma',
            val: player.acceleration ?? player.speed ?? 50
        },
        {
            label: 'Zıplama',
            val: player.jumping ?? player.power ?? 50
        },
        {
            label: 'Sol Ayak',
            val: player.leftFoot ?? (player.preferred_foot === 'Left' ? 80 : 50)
        },
        {
            label: 'Sağ Ayak',
            val: player.rightFoot ?? (player.preferred_foot === 'Right' ? 80 : 50)
        }
    ];
    // ── Radar — Evrensel 6 eksen (oyuncunun gerçek attribute'leri) ──
    // Her eksen doğrudan player objesindeki değerden alınır, derived stats kullanılmaz
    const chartData = [
        {
            subject: 'Şut',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.shooting || 0)
        },
        {
            subject: 'Pas',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.passing || 0)
        },
        {
            subject: 'Dribling',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.dribbling || 0)
        },
        {
            subject: 'Savunma',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.defending || 0)
        },
        {
            subject: 'Fizik',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.power || 0)
        },
        {
            subject: 'Hız',
            A: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.speed || 0)
        }
    ];
    // ── Position colors (spesifik mevki bazlı) ──
    const getGroup = (p)=>{
        if (p === 'GK') return 'GK';
        if ([
            'CB',
            'LB',
            'RB',
            'LWB',
            'RWB'
        ].includes(p)) return 'DEF';
        if ([
            'CDM',
            'CM',
            'CAM',
            'LM',
            'RM',
            'LW',
            'RW'
        ].includes(p)) return 'MID';
        return 'FWD';
    };
    const posGroup = getGroup(sp);
    const posBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosBadgeStyle"])(posGroup);
    const posColor = posBadge.split(' ').find((c)=>c.startsWith('text-')) || 'text-[#9B9B9B]';
    const posBg = posBadge.split(' ').filter((c)=>!c.startsWith('text-')).join(' ');
    const tabs = [
        {
            id: 'genel',
            label: 'Genel Bakış'
        },
        {
            id: 'bilgi',
            label: 'Kişisel Bilgi'
        },
        {
            id: 'performans',
            label: 'Performans'
        },
        {
            id: 'istatistikler',
            label: 'İstatistikler'
        },
        ...isOwned ? [
            {
                id: 'antrenman',
                label: 'Antrenman'
            }
        ] : [],
        {
            id: 'market',
            label: marketListing ? 'Satın Al' : 'Global Transfer'
        }
    ];
    const { modalRef, handleRef, position, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggableModal"])();
    // ── Memoized heavy tab sections ──
    const istatistiklerSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerDetailModal.useMemo[istatistiklerSection]": ()=>{
            if (activeTab !== 'istatistikler') return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerStatsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                player: player
            }, void 0, false, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 310,
                columnNumber: 12
            }, this);
        }
    }["PlayerDetailModal.useMemo[istatistiklerSection]"], [
        player,
        activeTab
    ]);
    const performansSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerDetailModal.useMemo[performansSection]": ()=>{
            if (activeTab !== 'performans') return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 md:p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[600px] mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-4 gap-2 md:gap-3 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[22px] font-black text-white/90",
                                            children: player.goals ?? 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 320,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5",
                                            children: "Gol"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 319,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[22px] font-black text-white/90",
                                            children: player.assists ?? 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 324,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5",
                                            children: "Asist"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 325,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[22px] font-black text-amber-400",
                                            children: player.last_match_rating?.toFixed(1) ?? '—'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 328,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5",
                                            children: "Son Maç RT"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 329,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 327,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `text-[22px] font-black ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.form || 50) >= 70 ? 'text-emerald-400' : 'text-red-400'}`,
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.form || 50),
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 332,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5",
                                            children: "Form"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 335,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 331,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 318,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2",
                            children: "Tüm Özellikler"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 340,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: [
                                ...technicalStats.map({
                                    "PlayerDetailModal.useMemo[performansSection]": (s)=>({
                                            ...s,
                                            group: 'Teknik'
                                        })
                                }["PlayerDetailModal.useMemo[performansSection]"]),
                                ...mentalStats.map({
                                    "PlayerDetailModal.useMemo[performansSection]": (s)=>({
                                            ...s,
                                            group: 'Zihinsel'
                                        })
                                }["PlayerDetailModal.useMemo[performansSection]"]),
                                ...physicalStats.map({
                                    "PlayerDetailModal.useMemo[performansSection]": (s)=>({
                                            ...s,
                                            group: 'Fiziksel'
                                        })
                                }["PlayerDetailModal.useMemo[performansSection]"])
                            ].map({
                                "PlayerDetailModal.useMemo[performansSection]": (s, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 py-[2px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-[100px] shrink-0 text-[9px] font-medium text-white/40",
                                                children: s.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 348,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-[5px] bg-white/[0.03] rounded-sm overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        width: 0
                                                    },
                                                    animate: {
                                                        width: `${s.val / 99 * 100}%`
                                                    },
                                                    transition: {
                                                        duration: 0.6,
                                                        ease: 'easeOut',
                                                        delay: idx * 0.02
                                                    },
                                                    className: `h-full rounded-sm ${s.val >= 80 ? 'bg-green-500' : s.val >= 65 ? 'bg-emerald-500' : s.val >= 50 ? 'bg-yellow-500' : s.val >= 35 ? 'bg-orange-500' : 'bg-red-500'}`,
                                                    style: {
                                                        opacity: 0.8
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 349,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-7 text-right text-[10px] font-mono font-bold ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmStatColor"])(s.val)}`,
                                                children: s.val
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 363,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, `${s.group}-${s.label}`, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 347,
                                        columnNumber: 15
                                    }, this)
                            }["PlayerDetailModal.useMemo[performansSection]"])
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 341,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 317,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this);
        }
    }["PlayerDetailModal.useMemo[performansSection]"], [
        player,
        activeTab,
        technicalStats,
        mentalStats,
        physicalStats
    ]);
    const genelSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerDetailModal.useMemo[genelSection]": ()=>{
            if (activeTab !== 'genel') return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full md:w-[200px] md:shrink-0 md:border-r border-b md:border-b-0 border-white/[0.05] bg-[#0a0f15]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-4 border-b border-white/[0.05] text-center bg-gradient-to-b from-amber-500/[0.03] to-transparent",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "group relative w-24 h-24 mx-auto mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-full rounded-2xl bg-[#0d1218] border-2 border-amber-500/20 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative",
                                            children: [
                                                player.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: player.photo_url,
                                                    alt: player.name,
                                                    fill: true,
                                                    className: "object-cover",
                                                    referrerPolicy: "no-referrer"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                            size: 32,
                                                            className: "text-white/10 mb-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 392,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[28px] font-display font-black italic text-amber-400 leading-none",
                                                            children: rating
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 393,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] font-black text-amber-500/50 uppercase mt-1",
                                                            children: "GENEL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                            size: 18,
                                                            className: "text-white mb-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] font-black text-white uppercase tracking-wider",
                                                            children: "FOTOĞRAF YÜKLE"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "file",
                                                            className: "hidden",
                                                            accept: "image/*",
                                                            onChange: handlePhotoUpload
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 402,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 381,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 380,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 flex flex-col items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `px-4 py-1.5 rounded-sm border text-[12px] font-black uppercase tracking-[0.1em] ${posBg} ${posColor}`,
                                                children: sp
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 408,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-white/35 font-bold",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizePosFull"])(sp)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 411,
                                                columnNumber: 17
                                            }, this),
                                            player.secondaryPositions && player.secondaryPositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap justify-center gap-1",
                                                children: [
                                                    player.secondaryPositions.map({
                                                        "PlayerDetailModal.useMemo[genelSection]": (sec, si)=>{
                                                            const secG = getGroup(sec);
                                                            const secBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosBadgeStyle"])(secG);
                                                            const secColor = secBadge.split(' ').find({
                                                                "PlayerDetailModal.useMemo[genelSection]": (c)=>c.startsWith('text-')
                                                            }["PlayerDetailModal.useMemo[genelSection]"]) || 'text-[#9B9B9B]';
                                                            const secBg = secBadge.split(' ').filter({
                                                                "PlayerDetailModal.useMemo[genelSection].secBg": (c)=>!c.startsWith('text-')
                                                            }["PlayerDetailModal.useMemo[genelSection].secBg"]).join(' ');
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `px-1.5 py-px rounded-full border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`,
                                                                children: [
                                                                    sec,
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[6px] opacity-50",
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizePosFull"])(sec)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 419,
                                                                        columnNumber: 165
                                                                    }, this)
                                                                ]
                                                            }, si, true, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 419,
                                                                columnNumber: 30
                                                            }, this);
                                                        }
                                                    }["PlayerDetailModal.useMemo[genelSection]"]),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[7px] text-white/15 font-bold uppercase w-full text-center",
                                                        children: "yan mevki"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 413,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 407,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerPositionMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        specificPosition: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerPos"])(player),
                                        secondaryPositions: player.secondaryPositions,
                                        size: "sm"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 427,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2 border-b border-white/[0.05]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[8px] font-black uppercase tracking-[0.2em] text-white/25",
                                                children: "Profesyonel Stiller & Yetenekler"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 437,
                                                columnNumber: 15
                                            }, this),
                                            (!isScouted || (player.scouting_count || 0) < 3) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: {
                                                    "PlayerDetailModal.useMemo[genelSection]": async ()=>{
                                                        const res = await scoutPlayer(player.id, player);
                                                        if (res.success && res.player) {
                                                            setPlayer(res.player);
                                                        } else if (!res.success) {
                                                            alert(res.reason);
                                                        }
                                                    }
                                                }["PlayerDetailModal.useMemo[genelSection]"],
                                                className: "text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors uppercase font-bold",
                                                children: player.scouted ? 'Yeniden Gözlem (150K)' : 'Gözlemle (150K)'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 439,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 436,
                                        columnNumber: 13
                                    }, this),
                                    isScouted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] text-white/40",
                                                        children: "Arketip"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 19
                                                    }, this),
                                                    isScouted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-400",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-black uppercase tracking-wider",
                                                            children: player.archetype || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POS_LABELS"][sp] || sp
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 462,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 461,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-bold text-white/20",
                                                        children: "???"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 465,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 458,
                                                columnNumber: 17
                                            }, this),
                                            playStyle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[12px]",
                                                        children: playStyle.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 472,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[9px] font-bold text-white/70 truncate",
                                                                children: playStyle.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 474,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[7px] text-white/30 truncate",
                                                                children: playStyle.short
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 475,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 471,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[9px] text-white/10 italic px-2",
                                                children: "Stil Yok"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 479,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1.5 mt-2",
                                                children: [
                                                    player.traits && player.traits.map({
                                                        "PlayerDetailModal.useMemo[genelSection]": (tk, idx)=>{
                                                            const levelKey = player.traitLevels?.[tk] || 'BEYAZ';
                                                            const levelInfo = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRAIT_LEVELS"][levelKey] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRAIT_LEVELS"].BEYAZ;
                                                            const t = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["traitDescriptions"][tk] || {
                                                                name: tk,
                                                                short: 'Özel yetenek.',
                                                                type: 'pozitif'
                                                            };
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                whileHover: {
                                                                    scale: 1.05
                                                                },
                                                                className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold shadow-lg ${levelInfo.color} cursor-default group relative`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "filter drop-shadow-sm",
                                                                        children: levelInfo.icon
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 495,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "tracking-tight",
                                                                        children: t.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 496,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute top-full left-0 mt-3 w-64 p-3 bg-zinc-950 border border-white/20 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[10px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-2 mb-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-sm",
                                                                                        children: levelInfo.icon
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                        lineNumber: 501,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "font-black text-white uppercase tracking-tighter text-xs",
                                                                                        children: t.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                        lineNumber: 502,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                lineNumber: 500,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "mb-2 leading-relaxed text-white/50",
                                                                                children: t.short
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                lineNumber: 504,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            t.engineEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "space-y-1 mb-2 py-2 border-y border-white/5",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex justify-between items-center text-emerald-400 font-bold",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: "ETKİ ORANI:"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                                lineNumber: 509,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: [
                                                                                                    "%",
                                                                                                    Math.round(t.engineEffect.successRate * 100)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                                lineNumber: 510,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                        lineNumber: 508,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex justify-between items-center text-blue-400 font-bold",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: "MOTOR ETKİSİ:"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                                lineNumber: 513,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: [
                                                                                                    "%",
                                                                                                    Math.round(t.engineEffect.engineWeight * 100)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                                lineNumber: 514,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                        lineNumber: 512,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                lineNumber: 507,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            t.counterFor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-amber-500/10 text-amber-500 px-2 py-1.5 rounded border border-amber-500/20 text-[9px] font-black uppercase tracking-tighter text-center",
                                                                                children: [
                                                                                    "🚀 ANTİ: ",
                                                                                    t.counterFor
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                lineNumber: 520,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 499,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, idx, true, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 490,
                                                                columnNumber: 23
                                                            }, this);
                                                        }
                                                    }["PlayerDetailModal.useMemo[genelSection]"]),
                                                    player.negTraits && player.negTraits.map({
                                                        "PlayerDetailModal.useMemo[genelSection]": (nt, idx)=>{
                                                            const t = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["traitDescriptions"][nt] || {
                                                                name: nt,
                                                                short: 'Negatif özellik.',
                                                                type: 'negatif'
                                                            };
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                whileHover: {
                                                                    scale: 1.05
                                                                },
                                                                className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-100 text-[10px] font-black shadow-lg cursor-default group relative",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "🚩"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 536,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "tracking-tight",
                                                                        children: t.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 537,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute top-full left-0 mt-3 w-48 p-2 bg-zinc-950 border border-red-500/20 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[8px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl",
                                                                        children: t.short
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 540,
                                                                        columnNumber: 26
                                                                    }, this)
                                                                ]
                                                            }, `neg-${idx}`, true, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 531,
                                                                columnNumber: 23
                                                            }, this);
                                                        }
                                                    }["PlayerDetailModal.useMemo[genelSection]"])
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 483,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2 pt-2",
                                                children: player.personalityTraits && player.personalityTraits.map({
                                                    "PlayerDetailModal.useMemo[genelSection]": (ptr, pidx)=>{
                                                        const info = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["traitDescriptions"][ptr] || {
                                                            name: ptr,
                                                            type: 'pozitif'
                                                        };
                                                        const isNeg = info.type === 'negatif';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            whileHover: {
                                                                scale: 1.05
                                                            },
                                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black shadow-xl cursor-default transition-all ${isNeg ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[12px]",
                                                                    children: isNeg ? '🚩' : '💠'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 563,
                                                                    columnNumber: 26
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "tracking-tight uppercase",
                                                                    children: info.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 564,
                                                                    columnNumber: 26
                                                                }, this)
                                                            ]
                                                        }, `ptr-cap-${pidx}`, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 554,
                                                            columnNumber: 24
                                                        }, this);
                                                    }
                                                }["PlayerDetailModal.useMemo[genelSection]"])
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 549,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 456,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    size: 20,
                                                    className: "text-white/20"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 573,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 572,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-white/20 font-bold uppercase tracking-widest text-center",
                                                children: "Özel Karakter Özelliği Bulunmuyor"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 575,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 571,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 435,
                                columnNumber: 11
                            }, this),
                            player.is_injured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2 border-b border-white/[0.05]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2",
                                        children: "Sakatlık Durumu"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 583,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-red-500/[0.08] border border-red-500/20 rounded-sm p-2 space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__["HeartPulse"], {
                                                        size: 12,
                                                        className: "text-red-400 animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-bold text-red-300 uppercase tracking-wider",
                                                        children: "Sakat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 587,
                                                        columnNumber: 19
                                                    }, this),
                                                    player.injury?.severity !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `px-1.5 py-px rounded-sm text-[7px] font-black uppercase tracking-wider ${player.injury.severity <= 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : player.injury.severity <= 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`,
                                                        children: player.injury_severity === 'light' ? 'Hafif' : player.injury_severity === 'medium' ? 'Orta' : player.injury_severity === 'heavy' ? 'Ağır' : 'Belirsiz'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 589,
                                                        columnNumber: 21
                                                    }, this),
                                                    player.injury_severity && !player.injury?.severity && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `px-1.5 py-px rounded-sm text-[7px] font-black uppercase tracking-wider ${player.injury_severity === 'light' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : player.injury_severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`,
                                                        children: player.injury_severity === 'light' ? 'Hafif' : player.injury_severity === 'medium' ? 'Orta' : 'Ağır'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 585,
                                                columnNumber: 17
                                            }, this),
                                            player.injury_end_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] text-white/40",
                                                        children: "Tahmini İyileşme"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 609,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-bold text-red-300/80",
                                                        children: new Date(player.injury_end_date).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long'
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 610,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 608,
                                                columnNumber: 19
                                            }, this),
                                            player.injury?.remaining_days !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] text-white/40",
                                                        children: "Kalan Gün"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 617,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-bold text-red-300/80",
                                                        children: [
                                                            player.injury.remaining_days,
                                                            " gün"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 618,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 616,
                                                columnNumber: 19
                                            }, this),
                                            isOwned && physioInfo && physioInfo.totalHealing > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-1.5 border-t border-red-500/10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] text-white/30",
                                                                children: "Fizyoterapist Gücü"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 625,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                children: [
                                                                    physioInfo.stars.map({
                                                                        "PlayerDetailModal.useMemo[genelSection]": (s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-px",
                                                                                children: Array.from({
                                                                                    length: s
                                                                                }).map({
                                                                                    "PlayerDetailModal.useMemo[genelSection]": (_, si)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                                            size: 6,
                                                                                            className: "text-amber-400 fill-amber-400"
                                                                                        }, si, false, {
                                                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                            lineNumber: 630,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                }["PlayerDetailModal.useMemo[genelSection]"])
                                                                            }, i, false, {
                                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                                lineNumber: 628,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                    }["PlayerDetailModal.useMemo[genelSection]"]),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[8px] font-bold text-emerald-400 ml-1",
                                                                        children: [
                                                                            "-",
                                                                            physioInfo.totalHealing,
                                                                            " gün"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 634,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 626,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 624,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: {
                                                            "PlayerDetailModal.useMemo[genelSection]": async ()=>{
                                                                if (!profileId) return;
                                                                setIsPhysioTreating(true);
                                                                try {
                                                                    const res = await fetch('/api/physio-treat', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({
                                                                            playerId: player.id,
                                                                            profileId
                                                                        })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        if (data.injuryCleared) {
                                                                            toastSuccess(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)} tamamen iyileşti! Sakatlık sona erdi.`);
                                                                            setPlayer({
                                                                                "PlayerDetailModal.useMemo[genelSection]": (prev)=>({
                                                                                        ...prev,
                                                                                        is_injured: false,
                                                                                        injury_end_date: undefined,
                                                                                        injury_severity: undefined,
                                                                                        injury: undefined
                                                                                    })
                                                                            }["PlayerDetailModal.useMemo[genelSection]"]);
                                                                        } else {
                                                                            toastSuccess(`Fizyoterapist tedavisi uygulandı! Sakatlık ${data.daysReduced} gün kısaldı.`);
                                                                            setPlayer({
                                                                                "PlayerDetailModal.useMemo[genelSection]": (prev)=>({
                                                                                        ...prev,
                                                                                        injury_end_date: data.newEndDate || prev.injury_end_date
                                                                                    })
                                                                            }["PlayerDetailModal.useMemo[genelSection]"]);
                                                                        }
                                                                        // Refresh physio info
                                                                        setPhysioInfo(null);
                                                                    } else {
                                                                        toastError(data.userMessage || data.message || 'Tedavi uygulanamadı.');
                                                                    }
                                                                } catch (err) {
                                                                    console.error('[PhysioTreat] Exception:', err);
                                                                    toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                                                                } finally{
                                                                    setIsPhysioTreating(false);
                                                                }
                                                            }
                                                        }["PlayerDetailModal.useMemo[genelSection]"],
                                                        disabled: isPhysioTreating,
                                                        className: "w-full py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-sm text-[8px] font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5",
                                                        children: isPhysioTreating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-2.5 h-2.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 682,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Tedavi Uygulanıyor..."
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 687,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Fizyoterapist Kullan"
                                                            ]
                                                        }, void 0, true)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 637,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 623,
                                                columnNumber: 19
                                            }, this),
                                            isOwned && (!physioInfo || physioInfo.totalHealing === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-1.5 border-t border-red-500/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1.5 text-[7px] text-white/20 italic",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                            size: 8,
                                                            className: "text-amber-500/50"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 697,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Fizyoterapist yok — Personel sekmesinden işe alabilirsiniz"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 698,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 696,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 695,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 584,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 582,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 377,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0 p-2 border-r border-white/[0.04]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrColumn, {
                                        title: player.position === 'GK' ? "Kalecilik" : "Teknik",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                            size: 10,
                                            className: "text-cyan-400/70"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 714,
                                            columnNumber: 23
                                        }, void 0),
                                        stats: technicalStats,
                                        isObserved: isScouted
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 712,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 711,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0 p-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrColumn, {
                                        title: "Zihinsel",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            size: 10,
                                            className: "text-purple-400/70"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 724,
                                            columnNumber: 23
                                        }, void 0),
                                        stats: mentalStats,
                                        isObserved: isScouted
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 722,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 721,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 710,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 709,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full md:w-[200px] md:shrink-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-[#0a0f15]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrColumn, {
                                    title: "Fiziksel",
                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__["Footprints"], {
                                        size: 10,
                                        className: "text-red-400/70"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 737,
                                        columnNumber: 21
                                    }, void 0),
                                    stats: physicalStats,
                                    isObserved: isScouted
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 735,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 734,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                size: 10,
                                                className: "text-amber-400/70"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 746,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black uppercase tracking-[0.2em] text-white/60",
                                                children: "Özet"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 747,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 745,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-[160px] bg-white/[0.02] border border-white/[0.05] rounded-b-sm p-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                            width: "100%",
                                            height: "100%",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$RadarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadarChart"], {
                                                cx: "50%",
                                                cy: "50%",
                                                outerRadius: "70%",
                                                data: chartData,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PolarGrid"], {
                                                        stroke: "#ffffff10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 752,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarAngleAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PolarAngleAxis"], {
                                                        dataKey: "subject",
                                                        tick: {
                                                            fill: '#ffffff40',
                                                            fontSize: 8,
                                                            fontWeight: 700
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 753,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarRadiusAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PolarRadiusAxis"], {
                                                        angle: 90,
                                                        domain: [
                                                            0,
                                                            100
                                                        ],
                                                        tick: {
                                                            fill: '#ffffff20',
                                                            fontSize: 6
                                                        },
                                                        axisLine: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 754,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Radar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Radar"], {
                                                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name),
                                                        dataKey: "A",
                                                        stroke: "#f59e0b",
                                                        fill: "#f59e0b",
                                                        fillOpacity: 0.10,
                                                        strokeWidth: 1.5
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 755,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 751,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 750,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 749,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 744,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 733,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                lineNumber: 375,
                columnNumber: 7
            }, this);
        }
    }["PlayerDetailModal.useMemo[genelSection]"], [
        player,
        activeTab,
        isScouted,
        isOwned,
        rating,
        sp,
        posBg,
        posColor,
        playStyle,
        isWatched,
        handlePhotoUpload,
        technicalStats,
        mentalStats,
        physicalStats,
        chartData,
        physioInfo,
        isPhysioTreating,
        profileId,
        scoutPlayer,
        setPlayer,
        toastSuccess,
        toastError,
        setPhysioInfo
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        exit: {
            opacity: 0
        },
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-2",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            ref: modalRef,
            initial: {
                scale: 0.95,
                y: 10
            },
            animate: {
                scale: 1,
                y: 0
            },
            transition: {
                type: 'spring',
                damping: 28,
                stiffness: 320
            },
            className: "bg-[#111820] w-full max-w-full md:max-w-[960px] max-h-[90vh] md:max-h-[90vh] md:rounded-sm rounded-none overflow-y-auto border border-white/[0.08] shadow-[0_0_120px_rgba(0,0,0,0.9)] font-sans text-white relative",
            onClick: (e)=>e.stopPropagation(),
            style: {
                transform: `translate(${position.x}px, ${position.y}px)`,
                scrollbarWidth: 'thin',
                scrollbarColor: '#ffffff15 transparent',
                userSelect: isDragging ? 'none' : 'auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute top-3 right-3 md:top-3 md:right-3 z-[220] p-2.5 md:p-3 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl backdrop-blur-md border border-red-500/30",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 787,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 783,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: handleRef,
                    className: "flex items-center justify-center px-4 py-1.5 bg-[#0d1218] border-b border-white/[0.04] cursor-grab active:cursor-grabbing hover:bg-[#0d1218]/80 transition-colors select-none",
                    title: "Sürüklemek için tutun · Çift tıklayın: sıfırla",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-white/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-1 rounded-full bg-white/15"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 799,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[7px] font-black uppercase tracking-[0.2em]",
                                children: "sürükle"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 800,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-1 rounded-full bg-white/15"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 801,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 798,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 793,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-3 md:px-4 py-2.5 bg-[#0d1218] border-b border-white/[0.06]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 md:gap-3 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[22px] font-display font-black italic text-amber-400 leading-none",
                                        children: rating
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 813,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 812,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        player.club && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center mb-0.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold uppercase tracking-widest text-amber-400/80",
                                                children: player.club
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 819,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 818,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-[15px] font-bold text-white tracking-tight leading-tight",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 825,
                                                    columnNumber: 17
                                                }, this),
                                                player.is_retiring && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "px-1.5 py-0.5 rounded-sm bg-red-500/20 border border-red-500/30 text-[8px] font-bold uppercase tracking-wider text-red-400 animate-pulse",
                                                    children: "Emekli Olacak"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 827,
                                                    columnNumber: 19
                                                }, this),
                                                onSign && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "px-1.5 py-0.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-bold uppercase tracking-wider text-emerald-400",
                                                    children: "Keşfedilmiş Oyuncu"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 832,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 824,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mt-0.5 flex-wrap",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `px-1.5 py-px rounded-sm border text-[9px] font-bold uppercase tracking-wider ${posBg} ${posColor}`,
                                                    children: sp
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 838,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] text-white/30 font-semibold",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizePosFull"])(sp)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 841,
                                                    columnNumber: 17
                                                }, this),
                                                player.secondaryPositions && player.secondaryPositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        player.secondaryPositions.map((sec, si)=>{
                                                            const secG = getGroup(sec);
                                                            const secBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosBadgeStyle"])(secG);
                                                            const secColor = secBadge.split(' ').find((c)=>c.startsWith('text-')) || 'text-[#9B9B9B]';
                                                            const secBg = secBadge.split(' ').filter((c)=>!c.startsWith('text-')).join(' ');
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `px-1 py-px rounded-sm border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`,
                                                                children: [
                                                                    sec,
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[7px] opacity-50",
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizePosFull"])(sec)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                        lineNumber: 849,
                                                                        columnNumber: 161
                                                                    }, this)
                                                                ]
                                                            }, si, true, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 849,
                                                                columnNumber: 30
                                                            }, this);
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[7px] text-white/20 font-bold uppercase",
                                                            children: "yan"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 851,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 843,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/35 font-bold",
                                                    children: [
                                                        player.age || '—',
                                                        " yaş"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 854,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/40 hidden md:inline",
                                                    children: "|"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                            size: 10,
                                                            className: "text-amber-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 857,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-amber-500/80 font-bold",
                                                            children: [
                                                                player.height || '—',
                                                                " cm"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 858,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 856,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/40 hidden md:inline",
                                                    children: "|"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 860,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1 hidden md:flex",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-zinc-400 font-bold uppercase tracking-widest",
                                                        children: player.preferred_foot === 'Both' ? 'Her İki Ayak' : player.preferred_foot === 'Left' ? 'Sol Ayak' : 'Sağ Ayak'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 862,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 861,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/40 hidden md:inline",
                                                    children: "|"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 864,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scale$3e$__["Scale"], {
                                                            size: 10,
                                                            className: "text-amber-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 866,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-amber-500/80 font-bold",
                                                            children: [
                                                                player.weight || '—',
                                                                " kg"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 867,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 865,
                                                    columnNumber: 17
                                                }, this),
                                                player.preferredFoot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/25 hidden md:inline",
                                                    children: [
                                                        "| ",
                                                        player.preferredFoot
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 870,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 837,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 815,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 810,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 md:gap-4 shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right hidden md:block",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5",
                                            children: "Piyasa Değeri"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 879,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[13px] font-black text-amber-400",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketValue)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 880,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 878,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right hidden md:block",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5",
                                            children: "Potansiyel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 883,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-0.5",
                                            children: [
                                                1,
                                                2,
                                                3,
                                                4,
                                                5
                                            ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                    size: 12,
                                                    className: star <= (player.scouting_stars || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"
                                                }, star, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 886,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 884,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 882,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right hidden md:block",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5",
                                            children: "Form"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 895,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[13px] font-black text-emerald-400",
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.form || 50),
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 896,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 894,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all ml-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 899,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 898,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 877,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 808,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-0 px-2 md:px-4 bg-[#0d1218] border-b border-white/[0.06] overflow-x-auto scrollbar-none flex-nowrap",
                    children: [
                        tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab(tab.id),
                                className: `px-3 md:px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-white border-amber-500' : 'text-white/30 border-transparent hover:text-white/50'}`,
                                children: tab.label
                            }, tab.id, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 909,
                                columnNumber: 13
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 922,
                            columnNumber: 11
                        }, this),
                        !marketListing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowActions(!showActions),
                                    className: "px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-[9px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all flex items-center gap-2",
                                    children: [
                                        "Eylemler ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            size: 12,
                                            className: showActions ? 'rotate-180' : ''
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 929,
                                            columnNumber: 26
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 925,
                                    columnNumber: 15
                                }, this),
                                showActions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute right-0 mt-1 w-48 bg-[#1a1e2a] border border-white/10 rounded-sm shadow-2xl z-[210] overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setActiveTab('market');
                                                setShowActions(false);
                                                if (isOwned) setSellPrice(corridor.min);
                                            },
                                            className: "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                    size: 14,
                                                    className: isOwned ? "text-emerald-400" : "text-amber-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 937,
                                                    columnNumber: 21
                                                }, this),
                                                isOwned ? 'Transfer Listesine Koy' : 'Transfer Teklifi Yap'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 933,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                toggleWatchlist(player);
                                                setShowActions(false);
                                            },
                                            className: "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2 border-t border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    size: 14,
                                                    className: isWatched ? "text-amber-400" : "text-white/40"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 947,
                                                    columnNumber: 21
                                                }, this),
                                                isWatched ? 'İzleme Listesinden Çıkar' : 'İzleme Listesine Ekle'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 940,
                                            columnNumber: 19
                                        }, this),
                                        isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setShowLoanForm(true);
                                                setShowActions(false);
                                            },
                                            className: "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-cyan-400/70 hover:text-cyan-300 transition-all flex items-center gap-2 border-t border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    size: 14,
                                                    className: "text-cyan-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 955,
                                                    columnNumber: 23
                                                }, this),
                                                "Kiralık Olarak Gönder"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 951,
                                            columnNumber: 21
                                        }, this),
                                        isOwned && player.contract_end_week && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setIsRenewingContract(true);
                                                setShowActions(false);
                                            },
                                            className: "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-emerald-400/70 hover:text-emerald-300 transition-all flex items-center gap-2 border-t border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                    size: 14,
                                                    className: "text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 964,
                                                    columnNumber: 23
                                                }, this),
                                                "Sözleşme Uzat"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 960,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 932,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 924,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 907,
                    columnNumber: 9
                }, this),
                genelSection,
                activeTab === 'bilgi' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 md:p-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-[600px] mx-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-2 md:gap-3",
                            children: [
                                {
                                    label: 'Piyasa Değeri',
                                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketValue),
                                    color: 'text-amber-400'
                                },
                                {
                                    label: 'Form',
                                    value: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.form || 50)}%`,
                                    color: 'text-emerald-400'
                                },
                                {
                                    label: 'Gelişim Potansiyeli',
                                    value: `${potentialDiff >= 10 ? 'Yüksek' : potentialDiff >= 3 ? 'Orta' : 'Plato'}`,
                                    color: potentialDiff >= 10 ? 'text-emerald-400' : potentialDiff >= 3 ? 'text-yellow-400' : 'text-red-400'
                                },
                                {
                                    label: 'Kişilik',
                                    value: player.personality || 'Bilinmiyor',
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Arketip',
                                    value: player.archetype || 'Bilinmiyor',
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Oyun Stili',
                                    value: playStyle?.name || 'Bilinmiyor',
                                    color: 'text-cyan-400'
                                },
                                {
                                    label: 'Boy',
                                    value: `${player.height || 180} cm`,
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Gol',
                                    value: `${player.goals ?? 0}`,
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Asist',
                                    value: `${player.assists ?? 0}`,
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Son Maç RT',
                                    value: player.last_match_rating?.toFixed(1) ?? '—',
                                    color: 'text-amber-400'
                                },
                                {
                                    label: 'Kondisyon',
                                    value: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.cond || 100)}%`,
                                    color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cap99"])(player.cond || 100) >= 70 ? 'text-emerald-400' : 'text-red-400'
                                }
                            ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-1",
                                            children: item.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1001,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `text-[12px] font-bold ${item.color}`,
                                            children: item.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1002,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, item.label, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1000,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 986,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 984,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 983,
                    columnNumber: 11
                }, this),
                performansSection,
                istatistiklerSection,
                activeTab === 'antrenman' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 md:p-8 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__["Dumbbell"], {
                                        className: "text-emerald-400",
                                        size: 24
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1027,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1026,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xl font-black italic uppercase tracking-tighter",
                                            children: "Bireysel Gelişim"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1030,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]",
                                            children: "Şahsi Antrenman Odak Noktası"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1031,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1029,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1025,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1",
                                            children: "Geliştirilecek Özellik Seç"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1038,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-2",
                                            children: [
                                                {
                                                    label: 'Hız',
                                                    key: 'speed'
                                                },
                                                {
                                                    label: 'Güç',
                                                    key: 'power'
                                                },
                                                {
                                                    label: 'Pas',
                                                    key: 'passing'
                                                },
                                                {
                                                    label: 'Şut',
                                                    key: 'shooting'
                                                },
                                                {
                                                    label: 'Savunma',
                                                    key: 'defending'
                                                },
                                                {
                                                    label: 'Vizyon',
                                                    key: 'vision'
                                                },
                                                {
                                                    label: 'Top Kontrolü',
                                                    key: 'control'
                                                },
                                                {
                                                    label: 'Kondisyon',
                                                    key: 'stamina'
                                                },
                                                {
                                                    label: 'Kafa Topu',
                                                    key: 'heading'
                                                },
                                                {
                                                    label: 'Kalecilik',
                                                    key: 'goalkeeping'
                                                }
                                            ].map((stat)=>{
                                                const assignment = trainingState?.assignments?.find((a)=>a.playerId === player.id);
                                                const isFocused = assignment?.focusedStat === stat.key;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        if (!trainingState || !onTrainingStateChange) return;
                                                        const assignments = trainingState.assignments || [];
                                                        const existing = assignments.find((a)=>a.playerId === player.id);
                                                        let newAssignments;
                                                        if (existing) {
                                                            newAssignments = assignments.map((a)=>a.playerId === player.id ? {
                                                                    ...a,
                                                                    focusedStat: isFocused ? undefined : stat.key
                                                                } : a);
                                                        } else {
                                                            // If no assignment, create a basic one (defaulting to physical if needed, but FM usually needs a program)
                                                            // For simplicity, we'll assign them to 'fiziksel_yukleme' if they have none but want a focus
                                                            newAssignments = [
                                                                ...assignments,
                                                                {
                                                                    playerId: player.id,
                                                                    programId: player.position === 'GK' ? 'kaleci_antrenmani' : 'fiziksel_yukleme',
                                                                    focusedStat: stat.key
                                                                }
                                                            ];
                                                        }
                                                        onTrainingStateChange({
                                                            ...trainingState,
                                                            assignments: newAssignments
                                                        });
                                                    },
                                                    className: `flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isFocused ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-bold uppercase",
                                                            children: stat.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1086,
                                                            columnNumber: 25
                                                        }, this),
                                                        isFocused && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1087,
                                                            columnNumber: 39
                                                        }, this)
                                                    ]
                                                }, stat.key, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1056,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1039,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1037,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 bg-emerald-950/20 border border-emerald-500/10 rounded-[2rem] space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/40",
                                            children: "Mevcut Durum"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1096,
                                            columnNumber: 17
                                        }, this),
                                        trainingState?.assignments?.find((a)=>a.playerId === player.id) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                                className: "text-emerald-400",
                                                                size: 16
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 1101,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1100,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[11px] font-bold text-white/90",
                                                                    children: "Programda Aktif"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 1104,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[9px] text-white/30 uppercase font-black",
                                                                    children: "Genel Gelişim Sürüyor"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                    lineNumber: 1105,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1103,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1099,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-white/50 leading-relaxed italic",
                                                    children: '"Bu oyuncu şu an takım antrenman programına dahil. Seçtiğiniz odak noktası, antrenmanlardaki verimliliğini %25 oranında bu özelliğe kaydıracaktır."'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1108,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1098,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3 text-amber-400/60",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                            className: "animate-pulse",
                                                            size: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1115,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[11px] font-bold",
                                                            children: "PROGRAM DIŞI"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1116,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1114,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-white/50 leading-relaxed italic",
                                                    children: '"Oyuncu herhangi bir antrenman programına dahil değil. Bireysel gelişim için önce bir program seçilmelidir."'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1118,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1113,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pt-4 border-t border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] font-black text-white/20 uppercase tracking-widest mb-2",
                                                    children: "Gelişim Oranı"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1125,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-2 bg-black/40 rounded-full overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full bg-emerald-500/40 w-[65%]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1127,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1126,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between mt-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] text-white/20 font-black uppercase",
                                                            children: "Fizik: 65%"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1130,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] text-white/20 font-black uppercase",
                                                            children: "Zihin: 40%"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1131,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1129,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1124,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1095,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1035,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 1024,
                    columnNumber: 11
                }, this),
                activeTab === 'market' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 md:p-10 space-y-8",
                    children: [
                        player.transferOffer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-xl mx-auto mb-10 p-8 bg-amber-500/10 border border-amber-500/30 rounded-[3rem] animate-pulse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                size: 32,
                                                className: "text-black"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1149,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1148,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                    children: "Gelen Transfer Teklifi!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1152,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]",
                                                    children: [
                                                        player.transferOffer.bidder,
                                                        " kulübünden resmi teklif."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1153,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1151,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1147,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-black/40 p-6 rounded-2xl border border-white/5 mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-white/20 mb-2",
                                            children: "Bonservis Bedeli"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1158,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-4xl font-black font-mono tracking-tighter italic text-amber-400",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(player.transferOffer.amount)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1159,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1157,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: async ()=>{
                                                alert('Teklif Kabul Edildi! Oyuncu transfer süreci başlatıldı.');
                                                // In a real app, we would update the DB here.
                                                onClose();
                                            },
                                            className: "flex-1 bg-emerald-500 text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl",
                                            children: "Kabul Et"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1165,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                alert('Teklif Reddedildi.');
                                            // Logic to clear offer could go here
                                            },
                                            className: "flex-1 bg-red-500/20 text-red-500 border border-red-500/30 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all",
                                            children: "Reddet"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1175,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1164,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1146,
                            columnNumber: 15
                        }, this),
                        onSign ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-xl mx-auto space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mx-auto w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 rotate-12 mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__["Footprints"], {
                                        className: "text-emerald-500",
                                        size: 48
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1191,
                                        columnNumber: 20
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1190,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-4xl font-black italic uppercase tracking-tighter",
                                    children: "Sözleşme Görüşmesi"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1193,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-bold text-white/30 uppercase tracking-[0.4em]",
                                    children: "Yeni Yetenek İmzala"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1194,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white/5 p-8 rounded-[3rem] border border-white/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-white/20 mb-2",
                                            children: "Talep Edilen İmza Parası"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1197,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-4xl font-black font-mono tracking-tighter italic text-emerald-400",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketValue * 0.5)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1198,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] mt-4",
                                            children: "Scout ekibimiz bu oyuncu ile ön görüşme yaptı ve makul bir imza parası karşılığında katılmaya hazır."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1201,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1196,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onSign(player),
                                    disabled: profileMoney !== undefined && profileMoney < marketValue * 0.5,
                                    className: "w-full bg-emerald-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3",
                                    children: profileMoney !== undefined && profileMoney < marketValue * 0.5 ? 'YETERSİZ BAKİYE' : 'SÖZLEŞMEYİ İMZALA'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1206,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1189,
                            columnNumber: 15
                        }, this) : marketListing ? /* BUYING CONTEXT */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center border rotate-12 mb-6 ${marketListing.is_auction ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`,
                                            children: marketListing.is_auction ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                                className: "text-amber-500",
                                                size: 48
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1219,
                                                columnNumber: 49
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                className: "text-emerald-500",
                                                size: 48
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1219,
                                                columnNumber: 98
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1218,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-4xl font-black italic uppercase tracking-tighter",
                                            children: marketListing.is_auction ? 'Açık Artırma' : 'Transfer Görüşmesi'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1221,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-bold text-white/30 uppercase tracking-[0.4em]",
                                            children: "Global Oyuncu Pazarı"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1224,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1217,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center gap-3",
                                    children: [
                                        isSeller && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1231,
                                                    columnNumber: 23
                                                }, this),
                                                " SENİN İLANIN"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1230,
                                            columnNumber: 21
                                        }, this),
                                        isHighestBidder && !isSeller && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                    size: 12,
                                                    className: "fill-emerald-300"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1236,
                                                    columnNumber: 23
                                                }, this),
                                                " EN YÜKSEK TEKLİF: SEN"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1235,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1228,
                                    columnNumber: 17
                                }, this),
                                marketListing.is_auction ? /* ═══ AUCTION UI ═══ */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-3 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-amber-500/10 p-5 rounded-[2rem] border border-amber-500/20 flex flex-col items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                                            size: 18,
                                                            className: "text-amber-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1246,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] font-black uppercase text-amber-500/50 tracking-widest",
                                                            children: "En Yüksek Teklif"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1247,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-2xl font-black font-mono tracking-tighter italic text-amber-400",
                                                            children: (marketListing.current_bid ?? marketListing.price) > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketListing.current_bid ?? marketListing.price) : '—'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1248,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/25 uppercase",
                                                            children: (marketListing.current_bid ?? 0) <= 0 ? 'Henüz teklif yok' : `Teklifçi: ${marketListing.highest_bidder_name || 'Anonim'}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1251,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1245,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/5 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                                            size: 18,
                                                            className: auctionTimeLeft === 'Sona Erdi' ? 'text-red-400' : 'text-white/40'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1256,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] font-black uppercase text-white/20 tracking-widest",
                                                            children: "Kalan Süre"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1257,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-2xl font-black font-mono tracking-tighter italic ${auctionTimeLeft === 'Sona Erdi' ? 'text-red-400' : 'text-white/90'}`,
                                                            children: auctionTimeLeft || '—'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1258,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/25 uppercase",
                                                            children: "Gerçek zamanlı"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1261,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1255,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/5 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                            size: 18,
                                                            className: "text-white/40"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1264,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] font-black uppercase text-white/20 tracking-widest",
                                                            children: "Teklif Sayısı"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1265,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-2xl font-black font-mono tracking-tighter italic text-white/90",
                                                            children: marketListing.bid_count ?? 0
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1266,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/25 uppercase",
                                                            children: "Kişi"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1269,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1263,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1244,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/30 uppercase",
                                                            children: "Başlangıç Fiyatı"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1275,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-black text-white/70 font-mono",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketListing.price)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1276,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1274,
                                                    columnNumber: 23
                                                }, this),
                                                marketListing.max_price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/30 uppercase",
                                                            children: "Hemen Al Bedeli"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1280,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-black text-amber-400 font-mono",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketListing.max_price)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1281,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1279,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1273,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-bold text-white/25 uppercase tracking-widest text-center",
                                            children: [
                                                "Satıcı: ",
                                                marketListing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : marketListing.seller_name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1287,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-4",
                                            children: [
                                                !isSeller && !isHighestBidder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: async ()=>{
                                                        setIsBuying(true);
                                                        try {
                                                            await onBid?.(marketListing);
                                                        } finally{
                                                            setIsBuying(false);
                                                        }
                                                    },
                                                    disabled: isBuying || auctionTimeLeft === 'Sona Erdi',
                                                    className: "flex-[2] bg-amber-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3",
                                                    children: isBuying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                        className: "animate-spin",
                                                        size: 18
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1306,
                                                        columnNumber: 39
                                                    }, this) : 'TEKLİF VER'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1294,
                                                    columnNumber: 25
                                                }, this),
                                                !isSeller && isHighestBidder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-[2] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                            size: 16,
                                                            className: "fill-emerald-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1311,
                                                            columnNumber: 27
                                                        }, this),
                                                        " EN YÜKSEK TEKLİF SAHİBİSİN"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1310,
                                                    columnNumber: 25
                                                }, this),
                                                isSeller && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: async ()=>{
                                                        setIsBuying(true);
                                                        try {
                                                            await onBuy?.(marketListing);
                                                        } finally{
                                                            setIsBuying(false);
                                                        }
                                                    },
                                                    disabled: isBuying,
                                                    className: "flex-[2] bg-red-500/20 border border-red-500/30 text-red-400 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center gap-3",
                                                    children: isBuying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                        className: "animate-spin",
                                                        size: 18
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1327,
                                                        columnNumber: 39
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                                size: 18
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                                lineNumber: 1327,
                                                                columnNumber: 91
                                                            }, this),
                                                            " İPTAL ET"
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1315,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1292,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center max-w-sm mx-auto leading-relaxed",
                                            children: "Teklif verdikten sonra en yüksek teklif sahibi olarak kalırsanız, açık artırma sonunda oyuncu kadronuza eklenir."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1332,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true) : /* ═══ DIRECT BUY UI (original) ═══ */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[10px] font-black uppercase tracking-widest text-white/20 mb-2",
                                                            children: "Satış Fiyatı"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1341,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-3xl font-black font-mono tracking-tighter italic text-white/90",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketListing.price)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1342,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/30 uppercase mt-2",
                                                            children: [
                                                                "Satıcı: ",
                                                                marketListing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : marketListing.seller_name
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1343,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1340,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-amber-500/10 p-6 rounded-[2rem] border border-amber-500/20 group hover:border-amber-500/30 transition-all",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[10px] font-black uppercase tracking-widest text-amber-500/40 mb-2",
                                                            children: "Maksimum Limit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1346,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-3xl font-black font-mono tracking-tighter italic text-amber-400",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketListing.max_price || marketListing.price * 1.5)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1347,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-amber-500/30 uppercase mt-2",
                                                            children: "Hemen Al Bedeli"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1348,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1345,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1339,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] font-black uppercase text-white/20 tracking-widest",
                                                            children: "Kondisyon"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1354,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xl font-black italic",
                                                            children: [
                                                                player.cond || 100,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1355,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1353,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] font-black uppercase text-white/20 tracking-widest",
                                                            children: "Yaş"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1358,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xl font-black italic",
                                                            children: player.age
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1359,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1357,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1352,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: async ()=>{
                                                    setIsBuying(true);
                                                    try {
                                                        await onBuy?.(marketListing);
                                                    } finally{
                                                        setIsBuying(false);
                                                    }
                                                },
                                                disabled: isBuying || profileMoney !== undefined && profileMoney < marketListing.price,
                                                className: "flex-[2] bg-emerald-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3",
                                                children: isBuying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                    className: "animate-spin",
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1376,
                                                    columnNumber: 37
                                                }, this) : profileMoney !== undefined && profileMoney < marketListing.price ? 'YETERSİZ BAKİYE' : 'HEMEN SATIN AL'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1364,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1363,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center max-w-sm mx-auto leading-relaxed",
                                            children: "Oyuncuyu satın aldığınızda bonservis bedeli anında hesabınızdan düşülür ve oyuncu kadronuza eklenir."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1380,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1216,
                            columnNumber: 15
                        }, this) : /* SELLING/OFFER CONTEXT */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center space-y-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `mx-auto w-24 h-24 rounded-2xl flex items-center justify-center border rotate-12 ${isOwned ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                        className: isOwned ? "text-emerald-500" : "text-amber-500",
                                        size: 48
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1390,
                                        columnNumber: 20
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1389,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-3xl font-black italic uppercase tracking-tighter",
                                            children: isOwned ? 'Global Transfer Listesi' : 'Resmi Transfer Teklifi'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1394,
                                            columnNumber: 20
                                        }, this),
                                        !isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-bold text-white/40 uppercase tracking-[0.2em]",
                                            children: [
                                                "Bu oyuncu şu an ",
                                                player.club || 'başka bir takım',
                                                " kadrosunda yer alıyor."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1396,
                                            columnNumber: 22
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap justify-center gap-4 max-w-2xl mx-auto",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "px-4 py-2 bg-white/5 rounded-xl border border-white/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-white/30 uppercase mb-1",
                                                            children: "Piyasa Değeri"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1400,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-black text-white/80",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketValue)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1401,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1399,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-emerald-500/50 uppercase mb-1",
                                                            children: isOwned ? 'Min. Satış (Baz)' : 'Önerilen Min. Teklif'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1404,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-black text-emerald-400",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.min)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1405,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1403,
                                                    columnNumber: 22
                                                }, this),
                                                !isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] font-bold text-amber-500/50 uppercase mb-1",
                                                            children: "Maks. Teklif"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1409,
                                                            columnNumber: 26
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-black text-amber-400",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.max)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1410,
                                                            columnNumber: 26
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1408,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1398,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed",
                                            children: isOwned ? 'Piyasa dengesini korumak için her oyuncunun bir "Koridor Fiyatı" vardır. Bu aralık dışındaki teklifler sistemsel olarak engellenir.' : 'Kulüp yönetimine sunacağınız teklif, oyuncunun mevcut piyasa değeri ve kulübün stratejik hedefleri doğrultusunda değerlendirilecektir.'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1414,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1393,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-xs mx-auto space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between items-center px-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-black uppercase tracking-widest text-white/40",
                                                            children: isOwned ? 'Talep Edilecek Bonservis' : 'Teklif Edilecek Tutar'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1424,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[9px] font-mono font-bold text-white/20",
                                                            children: [
                                                                "ARALIK: ",
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.min),
                                                                " - ",
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.max)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1425,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1423,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            value: sellPrice || '',
                                                            onChange: (e)=>setSellPrice(Number(e.target.value)),
                                                            placeholder: isOwned ? "Bedel giriniz..." : "Teklif giriniz...",
                                                            className: `w-full bg-black border ${sellPrice > corridor.max || sellPrice > 0 && sellPrice < corridor.min ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-4 px-6 text-center font-mono text-2xl font-black text-emerald-400 focus:border-emerald-500 transition-all outline-none`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1428,
                                                            columnNumber: 25
                                                        }, this),
                                                        sellPrice > corridor.max && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute -bottom-6 left-0 right-0 text-[9px] text-red-400 font-bold uppercase tracking-wider",
                                                            children: isOwned ? 'MAKSİMUM FİYAT LİMİTİ AŞILDI!' : 'KULÜP BU TUTARI KABUL ETMEYECEK KADAR YÜKSEK!'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1436,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1427,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1422,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] text-left space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[8px] font-black uppercase tracking-wider text-white/40",
                                                    children: isOwned ? 'AÇIK ARTIRMA ANALİZİ' : 'TEKLİF ANALİZİ'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1444,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] text-white/60 leading-relaxed italic",
                                                    children: isOwned ? `&quot;Bu oyuncu ${rating} KG ve ${player.traits?.length || 0} özel yeteneğe sahip. ${player.age < 23 ? 'Genç yetenek primi' : player.age >= 30 ? 'Tecrübe/Yaş dengesi' : 'Piyasa ortalaması'} dahilinde ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(sellPrice)} bedelle açık artırmaya çıkacak. Tahmini piyasa değeri: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(marketValue)} (Koridor: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.min)} – ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.max)}).&quot;` : `&quot;${player.name} için yapacağınız ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(sellPrice)} tutarındaki teklif, kulübünün beklentilerini ${sellPrice > marketValue * 1.2 ? 'fazlasıyla karşılıyor' : 'karşılayabilir'}. Onaylanması durumunda oyuncu en geç 24 saat içinde kadronuza katılır.&quot;`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1445,
                                                    columnNumber: 22
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1443,
                                            columnNumber: 20
                                        }, this),
                                        isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                                    size: 14,
                                                    className: "text-amber-500 shrink-0 mt-0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1455,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] text-amber-400/80 leading-relaxed",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-black uppercase tracking-wider",
                                                            children: "Açık Artırma Modu"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1457,
                                                            columnNumber: 26
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1457,
                                                            columnNumber: 104
                                                        }, this),
                                                        "Oyuncu açık artırmaya çıkacak. 4 saat sürecektir. En yüksek teklif sahibi oyuncuyu alır."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1456,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1454,
                                            columnNumber: 22
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: async ()=>{
                                                if (sellPrice < corridor.min || sellPrice > corridor.max) {
                                                    alert(`Lütfen ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.min)} ile ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(corridor.max)} arasında bir değer giriniz.`);
                                                    return;
                                                }
                                                if (!isOwned) {
                                                    alert(`Teklifiniz ${player.club} kulübüne iletilmiştir. Onur bey değerlendirme yapacak.`);
                                                    onClose();
                                                    return;
                                                }
                                                setIsSelling(true);
                                                try {
                                                    await onSell?.(player, sellPrice);
                                                } finally{
                                                    setIsSelling(false);
                                                }
                                            },
                                            disabled: !sellPrice || sellPrice < corridor.min || sellPrice > corridor.max || isSelling,
                                            className: `w-full py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${isOwned ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'} disabled:opacity-20 disabled:grayscale`,
                                            children: isSelling ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                className: "animate-spin",
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1491,
                                                columnNumber: 24
                                            }, this) : isOwned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1493,
                                                        columnNumber: 36
                                                    }, this),
                                                    " AÇIK ARTIRMAYA GÖNDER"
                                                ]
                                            }, void 0, true) : 'RESMİ TEKLİFİ İLET'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1463,
                                            columnNumber: 20
                                        }, this),
                                        isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pt-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3 mb-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-px bg-white/[0.06]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1501,
                                                            columnNumber: 26
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] font-black uppercase tracking-[0.3em] text-white/20",
                                                            children: "veya"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1502,
                                                            columnNumber: 26
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-px bg-white/[0.06]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1503,
                                                            columnNumber: 26
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1500,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setShowLoanForm(true),
                                                    className: "w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 bg-cyan-500/15 border-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/50 hover:text-cyan-300 shadow-cyan-500/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1509,
                                                            columnNumber: 26
                                                        }, this),
                                                        "KİRALIK LİSTESİNE GÖNDER"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1505,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] text-cyan-400/40 font-bold uppercase tracking-wider text-center mt-2",
                                                    children: "Oyuncuyu kiralık pazara çıkarın · 10 KR komisyon kiracıdan alınır"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1512,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1499,
                                            columnNumber: 22
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1421,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1388,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 1143,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-4 py-1.5 bg-[#080c12] border-t border-white/[0.06]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 text-[8px] text-white/20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-white/40 font-bold",
                                            children: player.goals ?? 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1528,
                                            columnNumber: 19
                                        }, this),
                                        " Gol"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1528,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-white/8",
                                    children: "|"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1529,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-white/40 font-bold",
                                            children: player.assists ?? 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1530,
                                            columnNumber: 19
                                        }, this),
                                        " Asist"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1530,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-white/8",
                                    children: "|"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1531,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Son RT: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-amber-400/70 font-bold",
                                            children: player.last_match_rating?.toFixed(1) ?? '—'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1532,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1532,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1527,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-sm text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all",
                            children: "Kapat"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                            lineNumber: 1534,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 1526,
                    columnNumber: 9
                }, this),
                showLoanForm && isOwned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4",
                    onClick: ()=>setShowLoanForm(false),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        transition: {
                            type: 'spring',
                            damping: 25,
                            stiffness: 300
                        },
                        className: "bg-[#111820] border border-cyan-500/20 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-[0_0_80px_rgba(0,200,255,0.08)]",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    size: 20,
                                                    className: "text-cyan-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1561,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1560,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-black uppercase tracking-widest text-cyan-400",
                                                        children: "Kiralık Pazarına Gönder"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1564,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/30 font-bold uppercase tracking-wider",
                                                        children: [
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name),
                                                            " • ",
                                                            sp,
                                                            " • ",
                                                            rating,
                                                            " OVR"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1565,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1563,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1559,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowLoanForm(false),
                                        className: "p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 18
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1569,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1568,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1558,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                            size: 14,
                                            className: "text-cyan-400 mt-0.5 shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1576,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-white/60 leading-relaxed",
                                            children: [
                                                "Oyuncunuz kiralık pazarına çıkacak. Diğer takımlar bu oyuncuyu kiralayabilir. Kiralama gerçekleştiğinde",
                                                ' ',
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-cyan-400 font-bold",
                                                    children: "10 Kredi"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1579,
                                                    columnNumber: 51
                                                }, this),
                                                ' ',
                                                "sistem komisyonu olarak kiracıdan düşülecek.",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-cyan-400 font-bold",
                                                    children: " Kiralık ücret (Euro)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1580,
                                                    columnNumber: 21
                                                }, this),
                                                ' ',
                                                "kiralanan takıma ödenecek."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1577,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1575,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1574,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[9px] font-black uppercase tracking-widest text-white/40 block",
                                        children: "Günlük Kiralık Ücret (Euro)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1587,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: loanFeeEuro,
                                        onChange: (e)=>setLoanFeeEuro(Number(e.target.value)),
                                        min: 0,
                                        className: "w-full bg-black/50 border border-white/10 rounded-xl p-3 text-base font-black text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10",
                                        placeholder: "Günlük ücret girin..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1590,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-1.5",
                                        children: [
                                            0.10,
                                            0.15,
                                            0.20,
                                            0.30
                                        ].map((pct)=>{
                                            const suggested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(marketValue, 1, pct);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setLoanFeeEuro(suggested),
                                                className: "flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/5 transition-all text-white/50 hover:text-white/80",
                                                children: [
                                                    "%",
                                                    Math.round(pct * 100)
                                                ]
                                            }, pct, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1602,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1598,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1586,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[9px] font-black uppercase tracking-widest text-white/40 block",
                                        children: "Süre (Hafta)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1616,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: 1,
                                                max: 34,
                                                value: loanWeeks,
                                                onChange: (e)=>setLoanWeeks(Number(e.target.value)),
                                                className: "flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1620,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5 min-w-[70px] justify-end",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 34,
                                                        value: loanWeeks,
                                                        onChange: (e)=>{
                                                            const v = Number(e.target.value);
                                                            if (v >= 1 && v <= 34) setLoanWeeks(v);
                                                        },
                                                        className: "w-12 bg-black/50 border border-white/10 rounded-lg p-1.5 text-center text-sm font-black text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1629,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] text-white/30 font-bold",
                                                        children: "hafta"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1640,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1628,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1619,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1615,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3 pt-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowLoanForm(false),
                                        className: "flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all",
                                        children: "İptal"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1647,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            if (!profileId) {
                                                toastError('Profil ID bulunamadı. Lütfen sayfayı yenileyin.');
                                                return;
                                            }
                                            if (!player.id) {
                                                toastError('Oyuncu ID bulunamadı.');
                                                return;
                                            }
                                            if (loanFeeEuro <= 0) {
                                                toastError('Kiralık ücret sıfırdan büyük olmalıdır.');
                                                return;
                                            }
                                            setIsSendingLoan(true);
                                            try {
                                                const res = await fetch('/api/rental/list', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        playerId: player.id,
                                                        ownerTeamId: profileId,
                                                        dailyCost: loanFeeEuro,
                                                        durationWeeks: loanWeeks
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    toastSuccess(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)} kiralık pazarına çıkarıldı!`);
                                                    setShowLoanForm(false);
                                                    // Refresh rental market data
                                                    window.dispatchEvent(new CustomEvent('rental-market-updated'));
                                                } else {
                                                    const debugInfo = data.debug ? ` (${data.debug})` : '';
                                                    toastError(data.userMessage || data.error || 'Kiralık pazara çıkarılamadı.' + debugInfo);
                                                }
                                            } catch (err) {
                                                console.error('[Loan] Exception:', err);
                                                toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                                            } finally{
                                                setIsSendingLoan(false);
                                            }
                                        },
                                        disabled: isSendingLoan,
                                        className: "flex-1 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                        children: isSendingLoan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1701,
                                                    columnNumber: 23
                                                }, this),
                                                "Gönderiliyor..."
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1706,
                                                    columnNumber: 23
                                                }, this),
                                                "Onayla"
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1653,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1646,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 1550,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 1543,
                    columnNumber: 11
                }, this),
                isRenewingContract && isOwned && player.contract_end_week && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4",
                    onClick: ()=>setIsRenewingContract(false),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        transition: {
                            type: 'spring',
                            damping: 25,
                            stiffness: 300
                        },
                        className: "bg-[#111820] border border-emerald-500/20 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-[0_0_80px_rgba(0,200,100,0.08)]",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                    size: 20,
                                                    className: "text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1736,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1735,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-black uppercase tracking-widest text-emerald-400",
                                                        children: "Sözleşme Uzat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1739,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/30 font-bold uppercase tracking-wider",
                                                        children: [
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name),
                                                            " • ",
                                                            sp,
                                                            " • ",
                                                            rating,
                                                            " OVR"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1740,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1738,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1734,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsRenewingContract(false),
                                        className: "p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 18
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1744,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1743,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1733,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                            size: 14,
                                            className: "text-emerald-400 mt-0.5 shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1751,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-white/60 leading-relaxed",
                                                    children: [
                                                        "Mevcut sözleşme: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-emerald-400 font-bold",
                                                            children: [
                                                                "Hafta ",
                                                                player.contract_end_week
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1754,
                                                            columnNumber: 40
                                                        }, this),
                                                        "'e kadar geçerli."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1753,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-white/40 leading-relaxed mt-1",
                                                    children: [
                                                        "Haftalık maaş: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white/70 font-bold",
                                                            children: [
                                                                ((player.salary || 0) / 1000).toFixed(0),
                                                                "K €"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                            lineNumber: 1757,
                                                            columnNumber: 38
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                    lineNumber: 1756,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                            lineNumber: 1752,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                    lineNumber: 1750,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1749,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[9px] font-black uppercase tracking-widest text-white/40 block",
                                        children: "Uzatma Süresi (Hafta)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1765,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: 1,
                                                max: 34,
                                                defaultValue: 17,
                                                id: "contract-renew-weeks",
                                                className: "flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1769,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5 min-w-[70px] justify-end",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-black text-emerald-400",
                                                        id: "contract-renew-weeks-display",
                                                        children: "17"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1778,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] text-white/30 font-bold",
                                                        children: "hafta"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                        lineNumber: 1779,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1777,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1768,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between text-[8px] text-white/20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "1 Hafta"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1783,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "17 Hafta (Yarım Sezon)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1784,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "34 Hafta (Tam Sezon)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1785,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1782,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1764,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3 pt-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsRenewingContract(false),
                                        className: "flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all",
                                        children: "İptal"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1791,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            const weeksInput = document.getElementById('contract-renew-weeks');
                                            const renewWeeks = Number(weeksInput?.value || 17);
                                            if (!profileId || !player.id) {
                                                toastError('Profil veya oyuncu ID bulunamadı.');
                                                return;
                                            }
                                            try {
                                                const supabaseModule = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-client] (ecmascript, async loader)");
                                                const { getSupabase } = supabaseModule;
                                                const supabase = getSupabase();
                                                if (!supabase) {
                                                    toastError('Veritabanı bağlantısı kurulamadı.');
                                                    return;
                                                }
                                                const newEndWeek = (player.contract_end_week || 0) + renewWeeks;
                                                const { error: updateErr } = await supabase.from('players').update({
                                                    contract_end_week: newEndWeek
                                                }).eq('id', player.id);
                                                if (updateErr) {
                                                    toastError('Sözleşme uzatma başarısız: ' + updateErr.message);
                                                } else {
                                                    setPlayer((prev)=>({
                                                            ...prev,
                                                            contract_end_week: newEndWeek
                                                        }));
                                                    toastSuccess(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)} sözleşmesi ${newEndWeek}. haftaya kadar uzatıldı!`);
                                                    setIsRenewingContract(false);
                                                }
                                            } catch (err) {
                                                console.error('[Contract Renew] Error:', err);
                                                toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                                            }
                                        },
                                        className: "flex-1 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                                lineNumber: 1832,
                                                columnNumber: 19
                                            }, this),
                                            "Sözleşmeyi Uzat"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                        lineNumber: 1797,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                                lineNumber: 1790,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                        lineNumber: 1725,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
                    lineNumber: 1718,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
            lineNumber: 773,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fm/PlayerDetailModal.tsx",
        lineNumber: 766,
        columnNumber: 5
    }, this);
}
_s(PlayerDetailModal, "k3+x0eg/w/F2BS//xVuEVg2Ciqw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggableModal"]
    ];
});
_c2 = PlayerDetailModal;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "StatRow");
__turbopack_context__.k.register(_c1, "AttrColumn");
__turbopack_context__.k.register(_c2, "PlayerDetailModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_PlayerDetailModal_tsx_52cfb345._.js.map