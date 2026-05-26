(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/TacticLab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TacticLab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useDraggableModal.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.js [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wind.js [app-client] (ecmascript) <export default as Wind>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-rain.js [app-client] (ecmascript) <export default as CloudRain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.js [app-client] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-client] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$enhancedMatchEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/enhancedMatchEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/PlayerDetailModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
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
const WEATHER_ICONS = {
    Sunny: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
        size: 14,
        className: "text-yellow-400"
    }, void 0, false, {
        fileName: "[project]/src/components/fm/TacticLab.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    Rainy: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"], {
        size: 14,
        className: "text-blue-400"
    }, void 0, false, {
        fileName: "[project]/src/components/fm/TacticLab.tsx",
        lineNumber: 29,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    Snowy: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"], {
        size: 14,
        className: "text-white"
    }, void 0, false, {
        fileName: "[project]/src/components/fm/TacticLab.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0))
};
function PlayerMarker({ player, pos, team, onClick, isSelected }) {
    const efficiency = 70 + Math.random() * 30;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            scale: 0
        },
        animate: {
            scale: 1
        },
        style: {
            left: pos.x,
            top: pos.y
        },
        className: `absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 ${isSelected ? 'scale-125' : ''}`,
        onClick: onClick,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl transition-all group-hover:scale-125 border-2 ${isSelected ? 'border-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.5)]' : team === 'A' ? 'border-blue-400' : 'border-red-400'} ${(player.specificPosition || player.position) === 'GK' ? 'bg-[#7AB4E8]' : [
                        'CB',
                        'LB',
                        'RB',
                        'LWB',
                        'RWB',
                        'DEF'
                    ].includes(player.specificPosition || player.position) ? 'bg-[#7EDBC8]' : [
                        'CDM',
                        'CM',
                        'CAM',
                        'LM',
                        'RM',
                        'LW',
                        'RW',
                        'MID'
                    ].includes(player.specificPosition || player.position) ? 'bg-[#F0C87A]' : 'bg-[#E87878]'}`,
                    children: [
                        player.name.slice(0, 2).toUpperCase(),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black ${efficiency > 90 ? 'bg-emerald-400 text-zinc-950' : efficiency > 80 ? 'bg-yellow-400 text-zinc-950' : 'bg-red-400 text-white'}`,
                            children: efficiency.toFixed(0)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                            lineNumber: 50,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                    lineNumber: 44,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[8px] font-black uppercase text-white shadow-2xl",
                    children: [
                        player.name,
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white/40",
                            children: player.specificPosition || player.position
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                            lineNumber: 57,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                    lineNumber: 56,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/fm/TacticLab.tsx",
            lineNumber: 43,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fm/TacticLab.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c = PlayerMarker;
function TacticLab({ onClose, squad }) {
    _s();
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const medicalLvl = profile?.stadium_upgrades?.['medical'] || 0;
    const [teamA, setTeamA] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [teamB, setTeamB] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [insights, setInsights] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [simResults, setSimResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSimulating, setIsSimulating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedFormation, setSelectedFormation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('4-4-2');
    const [swapTarget, setSwapTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectingPlayerFor, setSelectingPlayerFor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detailPlayer, setDetailPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        weather: 'Sunny',
        ground: 'Normal',
        refereeStrictness: 'Medium',
        moraleMode: 'Standard',
        pressureMode: 'None',
        is9v9: squad.length < 22,
        scenario: undefined
    });
    const maxPerTeam = squad.length >= 22 ? 11 : 9;
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('control');
    // Loading state for Supabase session
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Load saved lab session from Supabase
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TacticLab.useEffect": ()=>{
            if (!user?.id || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                setIsLoaded(true);
                return;
            }
            const loadSession = {
                "TacticLab.useEffect.loadSession": async ()=>{
                    try {
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                        if (!supabase) {
                            setIsLoaded(true);
                            return;
                        }
                        const { data, error } = await supabase.from('lab_sessions').select('team_a, team_b, selected_formation, settings').eq('user_id', user.id).maybeSingle();
                        if (!error && data) {
                            if (data.team_a) setTeamA(data.team_a);
                            if (data.team_b) setTeamB(data.team_b);
                            if (data.selected_formation) setSelectedFormation(data.selected_formation);
                            if (data.settings) setSettings(data.settings);
                        }
                    } catch (err) {
                        console.error("Lab loading error:", err);
                    } finally{
                        setIsLoaded(true);
                    }
                }
            }["TacticLab.useEffect.loadSession"];
            loadSession();
        }
    }["TacticLab.useEffect"], [
        user?.id
    ]);
    // Auto-save lab session to Supabase every 2 seconds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TacticLab.useEffect": ()=>{
            if (!isLoaded || !user?.id || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
            const saveLab = {
                "TacticLab.useEffect.saveLab": async ()=>{
                    try {
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                        if (!supabase) return;
                        const { error } = await supabase.from('lab_sessions').upsert({
                            user_id: user.id,
                            team_a: teamA,
                            team_b: teamB,
                            selected_formation: selectedFormation,
                            settings: settings,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        });
                        if (error) {
                            console.error("Lab saving error:", error.message);
                        }
                    } catch (err) {
                        console.error("Lab saving error:", err);
                    }
                }
            }["TacticLab.useEffect.saveLab"];
            const timer = setTimeout(saveLab, 2000);
            return ({
                "TacticLab.useEffect": ()=>clearTimeout(timer)
            })["TacticLab.useEffect"];
        }
    }["TacticLab.useEffect"], [
        teamA,
        teamB,
        selectedFormation,
        settings,
        isLoaded,
        user?.id
    ]);
    const FORMATIONS = [
        '4-4-2',
        '4-3-3',
        '3-5-2',
        '5-4-1',
        '4-2-3-1',
        '3-4-3',
        '4-1-4-1',
        '4-3-2-1',
        '5-3-2',
        '4-3-1-2',
        '3-1-4-2',
        '4-4-1-1',
        '4-5-1',
        '3-3-3-1'
    ];
    // Modified to support up to 11 players
    const formationPositions = {
        '4-4-2': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '15%',
                y: '78%'
            },
            {
                x: '85%',
                y: '78%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '10%',
                y: '45%'
            },
            {
                x: '90%',
                y: '45%'
            },
            {
                x: '35%',
                y: '40%'
            },
            {
                x: '65%',
                y: '40%'
            },
            {
                x: '35%',
                y: '12%'
            },
            {
                x: '65%',
                y: '12%'
            }
        ],
        '4-3-3': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '10%',
                y: '75%'
            },
            {
                x: '90%',
                y: '75%'
            },
            {
                x: '35%',
                y: '70%'
            },
            {
                x: '65%',
                y: '70%'
            },
            {
                x: '50%',
                y: '45%'
            },
            {
                x: '30%',
                y: '45%'
            },
            {
                x: '70%',
                y: '45%'
            },
            {
                x: '15%',
                y: '15%'
            },
            {
                x: '85%',
                y: '15%'
            },
            {
                x: '50%',
                y: '10%'
            }
        ],
        '3-5-2': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '75%'
            },
            {
                x: '25%',
                y: '70%'
            },
            {
                x: '75%',
                y: '70%'
            },
            {
                x: '50%',
                y: '50%'
            },
            {
                x: '20%',
                y: '45%'
            },
            {
                x: '80%',
                y: '45%'
            },
            {
                x: '35%',
                y: '40%'
            },
            {
                x: '65%',
                y: '40%'
            },
            {
                x: '35%',
                y: '15%'
            },
            {
                x: '65%',
                y: '15%'
            }
        ],
        '5-4-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '82%'
            },
            {
                x: '10%',
                y: '70%'
            },
            {
                x: '90%',
                y: '70%'
            },
            {
                x: '30%',
                y: '75%'
            },
            {
                x: '70%',
                y: '75%'
            },
            {
                x: '25%',
                y: '45%'
            },
            {
                x: '75%',
                y: '45%'
            },
            {
                x: '40%',
                y: '50%'
            },
            {
                x: '60%',
                y: '50%'
            },
            {
                x: '50%',
                y: '20%'
            }
        ],
        '4-2-3-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '35%',
                y: '52%'
            },
            {
                x: '65%',
                y: '52%'
            },
            {
                x: '50%',
                y: '32%'
            },
            {
                x: '20%',
                y: '30%'
            },
            {
                x: '80%',
                y: '30%'
            },
            {
                x: '50%',
                y: '12%'
            }
        ],
        '3-4-3': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '75%'
            },
            {
                x: '25%',
                y: '75%'
            },
            {
                x: '75%',
                y: '75%'
            },
            {
                x: '15%',
                y: '48%'
            },
            {
                x: '85%',
                y: '48%'
            },
            {
                x: '40%',
                y: '50%'
            },
            {
                x: '60%',
                y: '50%'
            },
            {
                x: '50%',
                y: '18%'
            },
            {
                x: '25%',
                y: '10%'
            },
            {
                x: '75%',
                y: '10%'
            }
        ],
        '4-1-4-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '50%',
                y: '58%'
            },
            {
                x: '20%',
                y: '38%'
            },
            {
                x: '80%',
                y: '38%'
            },
            {
                x: '40%',
                y: '38%'
            },
            {
                x: '60%',
                y: '38%'
            },
            {
                x: '50%',
                y: '12%'
            }
        ],
        '4-3-2-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '50%',
                y: '52%'
            },
            {
                x: '35%',
                y: '52%'
            },
            {
                x: '65%',
                y: '52%'
            },
            {
                x: '35%',
                y: '28%'
            },
            {
                x: '65%',
                y: '28%'
            },
            {
                x: '50%',
                y: '12%'
            }
        ],
        '5-3-2': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '84%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '10%',
                y: '65%'
            },
            {
                x: '90%',
                y: '65%'
            },
            {
                x: '50%',
                y: '42%'
            },
            {
                x: '30%',
                y: '42%'
            },
            {
                x: '70%',
                y: '42%'
            },
            {
                x: '35%',
                y: '15%'
            },
            {
                x: '65%',
                y: '15%'
            }
        ],
        '4-3-1-2': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '50%',
                y: '52%'
            },
            {
                x: '30%',
                y: '52%'
            },
            {
                x: '70%',
                y: '52%'
            },
            {
                x: '50%',
                y: '32%'
            },
            {
                x: '35%',
                y: '12%'
            },
            {
                x: '65%',
                y: '12%'
            }
        ],
        '3-1-4-2': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '75%'
            },
            {
                x: '25%',
                y: '75%'
            },
            {
                x: '75%',
                y: '75%'
            },
            {
                x: '50%',
                y: '58%'
            },
            {
                x: '15%',
                y: '42%'
            },
            {
                x: '85%',
                y: '42%'
            },
            {
                x: '35%',
                y: '42%'
            },
            {
                x: '65%',
                y: '42%'
            },
            {
                x: '35%',
                y: '15%'
            },
            {
                x: '65%',
                y: '15%'
            }
        ],
        '4-4-1-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '15%',
                y: '48%'
            },
            {
                x: '85%',
                y: '48%'
            },
            {
                x: '35%',
                y: '48%'
            },
            {
                x: '65%',
                y: '48%'
            },
            {
                x: '50%',
                y: '32%'
            },
            {
                x: '50%',
                y: '12%'
            }
        ],
        '4-5-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '20%',
                y: '75%'
            },
            {
                x: '80%',
                y: '75%'
            },
            {
                x: '35%',
                y: '72%'
            },
            {
                x: '65%',
                y: '72%'
            },
            {
                x: '50%',
                y: '52%'
            },
            {
                x: '20%',
                y: '40%'
            },
            {
                x: '80%',
                y: '40%'
            },
            {
                x: '35%',
                y: '45%'
            },
            {
                x: '65%',
                y: '45%'
            },
            {
                x: '50%',
                y: '15%'
            }
        ],
        '3-3-3-1': [
            {
                x: '50%',
                y: '95%'
            },
            {
                x: '50%',
                y: '75%'
            },
            {
                x: '25%',
                y: '75%'
            },
            {
                x: '75%',
                y: '75%'
            },
            {
                x: '50%',
                y: '52%'
            },
            {
                x: '30%',
                y: '52%'
            },
            {
                x: '70%',
                y: '52%'
            },
            {
                x: '50%',
                y: '32%'
            },
            {
                x: '30%',
                y: '32%'
            },
            {
                x: '70%',
                y: '32%'
            },
            {
                x: '50%',
                y: '12%'
            }
        ]
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TacticLab.useEffect": ()=>{
            if (squad.length > 0 && teamA.length === 0 && teamB.length === 0) {
                const gks = squad.filter({
                    "TacticLab.useEffect.gks": (p)=>p.position === 'GK'
                }["TacticLab.useEffect.gks"]).sort({
                    "TacticLab.useEffect.gks": (a, b)=>b.rating - a.rating
                }["TacticLab.useEffect.gks"]);
                const others = squad.filter({
                    "TacticLab.useEffect.others": (p)=>p.position !== 'GK'
                }["TacticLab.useEffect.others"]).sort({
                    "TacticLab.useEffect.others": (a, b)=>b.rating - a.rating
                }["TacticLab.useEffect.others"]);
                const a = [];
                const b = [];
                if (gks.length >= 2) {
                    a.push(gks[0].id);
                    b.push(gks[1].id);
                } else if (gks.length === 1) {
                    a.push(gks[0].id);
                }
                others.forEach({
                    "TacticLab.useEffect": (p, i)=>{
                        if (a.length < maxPerTeam && b.length < maxPerTeam) {
                            if (i % 2 === 0) a.push(p.id);
                            else b.push(p.id);
                        } else if (a.length < maxPerTeam) {
                            a.push(p.id);
                        } else if (b.length < maxPerTeam) {
                            b.push(p.id);
                        }
                    }
                }["TacticLab.useEffect"]);
                setTeamA(a);
                setTeamB(b);
            }
        }
    }["TacticLab.useEffect"], [
        squad,
        teamA.length,
        teamB.length,
        maxPerTeam
    ]);
    const squadAMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TacticLab.useMemo[squadAMembers]": ()=>{
            return teamA.map({
                "TacticLab.useMemo[squadAMembers]": (id)=>squad.find({
                        "TacticLab.useMemo[squadAMembers]": (p)=>p.id === id
                    }["TacticLab.useMemo[squadAMembers]"])
            }["TacticLab.useMemo[squadAMembers]"]).filter(Boolean);
        }
    }["TacticLab.useMemo[squadAMembers]"], [
        squad,
        teamA
    ]);
    const squadBMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TacticLab.useMemo[squadBMembers]": ()=>{
            return teamB.map({
                "TacticLab.useMemo[squadBMembers]": (id)=>squad.find({
                        "TacticLab.useMemo[squadBMembers]": (p)=>p.id === id
                    }["TacticLab.useMemo[squadBMembers]"])
            }["TacticLab.useMemo[squadBMembers]"]).filter(Boolean);
        }
    }["TacticLab.useMemo[squadBMembers]"], [
        squad,
        teamB
    ]);
    const matchAccuracy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TacticLab.useMemo[matchAccuracy]": ()=>{
            if (squadAMembers.length === 0) return 0;
            // Position-based harmony
            const positions = selectedFormation.split('-').map(Number); // e.g. [4, 4, 2]
            const defCount = positions[0] || 0;
            const midCount = positions[1] || 0;
            const fwdCount = positions[2] || 0;
            const actualGKs = squadAMembers.filter({
                "TacticLab.useMemo[matchAccuracy]": (p)=>p.position === 'GK'
            }["TacticLab.useMemo[matchAccuracy]"]).length;
            const actualDefs = squadAMembers.filter({
                "TacticLab.useMemo[matchAccuracy]": (p)=>p.position === 'DEF'
            }["TacticLab.useMemo[matchAccuracy]"]).length;
            const actualMids = squadAMembers.filter({
                "TacticLab.useMemo[matchAccuracy]": (p)=>p.position === 'MID'
            }["TacticLab.useMemo[matchAccuracy]"]).length;
            const actualFwds = squadAMembers.filter({
                "TacticLab.useMemo[matchAccuracy]": (p)=>p.position === 'FWD'
            }["TacticLab.useMemo[matchAccuracy]"]).length;
            let harmonyScore = 0;
            harmonyScore += Math.min(actualGKs, 1) / 1 * 20;
            harmonyScore += Math.min(actualDefs, defCount) / (defCount || 1) * 30;
            harmonyScore += Math.min(actualMids, midCount) / (midCount || 1) * 30;
            harmonyScore += Math.min(actualFwds, fwdCount) / (fwdCount || 1) * 20;
            // Quality factor
            const avgRating = squadAMembers.reduce({
                "TacticLab.useMemo[matchAccuracy]": (acc, p)=>acc + p.rating
            }["TacticLab.useMemo[matchAccuracy]"], 0) / squadAMembers.length;
            const qualityMultiplier = Math.min(1.2, avgRating / 80);
            return Math.min(100, Math.floor(harmonyScore * qualityMultiplier));
        }
    }["TacticLab.useMemo[matchAccuracy]"], [
        squadAMembers,
        selectedFormation
    ]);
    const runBatchSim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TacticLab.useCallback[runBatchSim]": async (count = 5)=>{
            if (squadAMembers.length === 0 || squadBMembers.length === 0) {
                alert("HATA: Her iki takımda da en az 1 oyuncu olmalıdır.");
                return;
            }
            setIsSimulating(true);
            const results = [];
            for(let i = 0; i < count; i++){
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$enhancedMatchEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runUnifiedMatch"])(squadAMembers, squadBMembers, {
                    activeTactic: {
                        formation: selectedFormation,
                        mentality: 3,
                        pressing: true,
                        passingStyle: 'Karışık',
                        lineHeight: 50,
                        width: 50,
                        aggression: 50,
                        passingIntensity: 50,
                        screenKeeper: false,
                        wasteTime: false,
                        parkTheBus: false,
                        crossGame: false,
                        loneStrikerCounter: false
                    },
                    homeOperations: [],
                    labSettings: settings
                });
                results.push(res);
            }
            setSimResults(results);
            setIsSimulating(false);
            generateReport(results);
            generateInsights(results);
        }
    }["TacticLab.useCallback[runBatchSim]"], [
        squadAMembers,
        squadBMembers,
        settings,
        selectedFormation
    ]);
    const generateInsights = (results)=>{
        const insights = [];
        const activeResults = results || simResults;
        if (activeResults.length === 0) return;
        // Real xG calculation
        const avgGoalsA = activeResults.reduce((s, r)=>s + r.score.home, 0) / activeResults.length;
        const avgGoalsB = activeResults.reduce((s, r)=>s + r.score.away, 0) / activeResults.length;
        insights.push(`[İSTATİSTİK] ${activeResults.length} simülasyon sonucu: As Takım ort. ${avgGoalsA.toFixed(1)} gol, Yedek Takım ort. ${avgGoalsB.toFixed(1)} gol.`);
        // Find weakest and strongest players
        const sortedA = [
            ...squadAMembers
        ].sort((a, b)=>a.rating - b.rating);
        const sortedB = [
            ...squadBMembers
        ].sort((a, b)=>a.rating - b.rating);
        const strongestA = [
            ...squadAMembers
        ].sort((a, b)=>b.rating - a.rating)[0];
        if (sortedA[0]) {
            insights.push(`[AS TAKIM] En zayıf halka: ${sortedA[0].name} (${sortedA[0].specificPosition || sortedA[0].position}, GÜÇ: ${sortedA[0].rating}). Bu mevki kritik eksiğin oluşturuyor.`);
        }
        if (strongestA) {
            insights.push(`[AS TAKIM] Yıldız oyuncu: ${strongestA.name} (${strongestA.specificPosition || strongestA.position}, GÜÇ: ${strongestA.rating}). Takımın ana silahı.`);
        }
        // Position mismatch analysis
        const positionGroups = selectedFormation.split('-').map(Number);
        const defNeeded = positionGroups[0] || 0;
        const midNeeded = positionGroups[1] || 0;
        const actualDefs = squadAMembers.filter((p)=>p.position === 'DEF').length;
        const actualMids = squadAMembers.filter((p)=>p.position === 'MID').length;
        if (actualDefs < defNeeded) {
            insights.push(`[TAKTİK UYARISI] ${selectedFormation} dizilişi için ${defNeeded} defans oyuncusu gerekir, ancak sadece ${actualDefs} defans var. Mevki uyuşmazlığı taktiksel verimi düşürüyor.`);
        }
        if (actualMids < midNeeded) {
            insights.push(`[TAKTİK UYARISI] Orta saha eksikliği: ${midNeeded} orta saha gerekirken ${actualMids} oyuncu mevcut. Oyun kurma ve savunma dengesi bozulabilir.`);
        }
        // Archetype comparison
        const archetypesA = squadAMembers.map((p)=>p.archetype).filter(Boolean);
        const archetypesB = squadBMembers.map((p)=>p.archetype).filter(Boolean);
        if (archetypesA.length > 0 && archetypesB.length > 0) {
            const uniqueArchA = [
                ...new Set(archetypesA)
            ];
            const uniqueArchB = [
                ...new Set(archetypesB)
            ];
            insights.push(`[ARKETİP ANALİZİ] As Takım: ${uniqueArchA.join(', ')} | Yedek Takım: ${uniqueArchB.join(', ')}. Arketip çeşitliliği takımın duruma uyum sağlama kabiliyetini belirler.`);
        }
        // Speed analysis
        const fastPlayersA = squadAMembers.filter((p)=>(p.speed || 50) > 80);
        if (fastPlayersA.length > 0) {
            insights.push(`[HIZ ANALİZİ] As Takım'da ${fastPlayersA.length} hızlı oyuncu (${fastPlayersA.map((p)=>p.name).join(', ')}). Hızlı kontra atak potansiyeli yüksek.`);
        }
        // Form analysis
        const lowFormPlayers = squadAMembers.filter((p)=>(p.form || 50) < 60);
        if (lowFormPlayers.length > 0) {
            insights.push(`[FORM UYARISI] ${lowFormPlayers.map((p)=>`${p.name} (${p.form || 50}%)`).join(', ')} — düşük formdaki oyuncular performansı etkileyebilir.`);
        }
        // GK analysis
        const gkA = squadAMembers.find((p)=>p.position === 'GK');
        const gkB = squadBMembers.find((p)=>p.position === 'GK');
        if (gkA && gkB) {
            const diff = gkA.rating - gkB.rating;
            if (diff > 5) insights.push(`[KALECİ KARŞILAŞTIRMASI] ${gkA.name} (${gkA.rating}), ${gkB.name} (${gkB.rating})'ndan ${diff} puan üstün. Kaleci avantajı As Takım'da.`);
            else if (diff < -5) insights.push(`[KALECİ KARŞILAŞTIRMASI] ${gkB.name} (${gkB.rating}), ${gkA.name} (${gkA.rating})'ndan ${Math.abs(diff)} puan üstün. Kaleci riski As Takım için ciddi.`);
        }
        // Pressing efficiency from simulation
        if (settings.moraleMode === 'Hyper') {
            insights.push(`[MORAL ETKİSİ] HİPER moral modu aktif. Oyuncuların agresiflik ve hız istatistiklerine %15 bonus uygulanıyor, ancak kondisyon daha hızlı düşüyor.`);
        }
        // Team balance
        const avgRatingA = squadAMembers.reduce((s, p)=>s + p.rating, 0) / (squadAMembers.length || 1);
        const avgRatingB = squadBMembers.reduce((s, p)=>s + p.rating, 0) / (squadBMembers.length || 1);
        if (Math.abs(avgRatingA - avgRatingB) > 10) {
            const stronger = avgRatingA > avgRatingB ? 'As Takım' : 'Yedek Takım';
            insights.push(`[GÜÇ DENGESİ] ${stronger} ortalama ${Math.abs(avgRatingA - avgRatingB).toFixed(1)} puan üstün. Rekabet dengesiz olabilir, bu simülasyon sonuçlarını etkiler.`);
        }
        setInsights(insights.slice(0, 8));
    };
    const generateReport = (results)=>{
        const winsA = results.filter((r)=>r.score.home > r.score.away).length;
        const winsB = results.filter((r)=>r.score.away > r.score.home).length;
        const winRateA = winsA / results.length * 100;
        let text = `SCOUT GÖZLEMİ: Takım A vs Takım B arasında ${results.length} maç yapıldı. `;
        if (winRateA > 60) {
            text += `As takım bariz üstünlük kurdu. Özellikle orta saha geçişlerinde yedek takımı çaresiz bıraktılar. `;
        } else if (winRateA > 40) {
            text += `Kıyasıya bir rekabet var. Mevki bazlı eşleşmelerde yedek oyuncuların as takımı zorladığı (ve hatta kilitlediği) anlar oldu. `;
        } else {
            text += `İlginç bir sonuç! Yedek kadronun düşük reytingine rağmen as takımı durdurması, taktiğin zayıf noktalarını (özellikle pres karşısındaki direnci) açığa çıkardı. `;
        }
        setReport(text);
    };
    const handlePlayerClick = (playerId, team)=>{
        if (team === 'POOL') return;
        setSelectingPlayerFor({
            id: playerId,
            team
        });
    };
    const selectReplacement = (newPlayerId)=>{
        if (!selectingPlayerFor) return;
        const { id: oldId, team } = selectingPlayerFor;
        if (team === 'A') {
            if (teamB.includes(newPlayerId)) {
                // Swap between teams
                setTeamA((prev)=>prev.map((id)=>id === oldId ? newPlayerId : id));
                setTeamB((prev)=>prev.map((id)=>id === newPlayerId ? oldId : id));
            } else if (teamA.includes(newPlayerId)) {
                // Swap index within team A
                const newTeamA = [
                    ...teamA
                ];
                const idx1 = newTeamA.indexOf(oldId);
                const idx2 = newTeamA.indexOf(newPlayerId);
                if (idx1 > -1 && idx2 > -1) {
                    const temp = newTeamA[idx1];
                    newTeamA[idx1] = newTeamA[idx2];
                    newTeamA[idx2] = temp;
                    setTeamA(newTeamA);
                }
            } else {
                // Replace with pool player
                setTeamA((prev)=>prev.map((id)=>id === oldId ? newPlayerId : id));
            }
        } else {
            if (teamA.includes(newPlayerId)) {
                // Swap between teams
                setTeamB((prev)=>prev.map((id)=>id === oldId ? newPlayerId : id));
                setTeamA((prev)=>prev.map((id)=>id === newPlayerId ? oldId : id));
            } else if (teamB.includes(newPlayerId)) {
                // Swap index within team B
                const newTeamB = [
                    ...teamB
                ];
                const idx1 = newTeamB.indexOf(oldId);
                const idx2 = newTeamB.indexOf(newPlayerId);
                if (idx1 > -1 && idx2 > -1) {
                    const temp = newTeamB[idx1];
                    newTeamB[idx1] = newTeamB[idx2];
                    newTeamB[idx2] = temp;
                    setTeamB(newTeamB);
                }
            } else {
                // Replace with pool player
                setTeamB((prev)=>prev.map((id)=>id === oldId ? newPlayerId : id));
            }
        }
        setSelectingPlayerFor(null);
    };
    const { modalRef, handleRef, position, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggableModal"])();
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
        className: "fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: modalRef,
                style: {
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    userSelect: isDragging ? 'none' : 'auto'
                },
                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full h-full max-w-7xl bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: handleRef,
                        title: "Sürüklemek için tutun · Çift tıklayın: sıfırla",
                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center justify-center px-4 py-1 bg-gradient-to-r from-blue-950/20 to-transparent border-b border-white/[0.04] cursor-grab active:cursor-grabbing hover:bg-blue-950/30 transition-colors select-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-2 text-white/20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "w-10 h-1 rounded-full bg-white/15"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 541,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[7px] font-black uppercase tracking-[0.2em]",
                                    children: "sürükle"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 542,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "w-10 h-1 rounded-full bg-white/15"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 543,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                            lineNumber: 540,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-b3cd0a4f7c7a1709" + " " + "px-8 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-950/20 to-transparent",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                            className: "text-white",
                                            size: 24
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 550,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                children: "TACTIC LABORATORY"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 553,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 555,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-bold text-white/40 uppercase tracking-widest",
                                                        children: "9v9 SIMULATION ENVIRONMENT // v2.4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 556,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 554,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 552,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 548,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 564,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 560,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                        lineNumber: 547,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex-1 flex flex-col md:flex-row overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full md:w-80 border-r border-white/5 flex flex-col bg-black/20 overflow-y-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "p-6 space-y-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 574,
                                                            columnNumber: 23
                                                        }, this),
                                                        " TAKTİKSEL DİZİLİŞ"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 573,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "relative group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: selectedFormation,
                                                            onChange: (e)=>setSelectedFormation(e.target.value),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-blue-500/50 transition-all",
                                                            children: FORMATIONS.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: f,
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "bg-zinc-950 text-white",
                                                                    children: f
                                                                }, f, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 583,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 577,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                size: 14,
                                                                className: "rotate-90"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 587,
                                                                columnNumber: 26
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 586,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 576,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 572,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__["Wind"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 594,
                                                            columnNumber: 23
                                                        }, this),
                                                        " HAVA VE ZEMİN"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 593,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "grid grid-cols-3 gap-2",
                                                    children: [
                                                        'Sunny',
                                                        'Rainy',
                                                        'Snowy'
                                                    ].map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSettings((prev)=>({
                                                                        ...prev,
                                                                        weather: w
                                                                    })),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + `p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.weather === w ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`,
                                                            children: [
                                                                WEATHER_ICONS[w],
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] font-black uppercase",
                                                                    children: w === 'Sunny' ? 'Güneş' : w === 'Rainy' ? 'Yağmur' : 'Kar'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 606,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, w, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 598,
                                                            columnNumber: 26
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 596,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 592,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 614,
                                                            columnNumber: 23
                                                        }, this),
                                                        " MORAL VE BASKI"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 613,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-2",
                                                    children: [
                                                        'Standard',
                                                        'Collapsed',
                                                        'Hyper'
                                                    ].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSettings((prev)=>({
                                                                        ...prev,
                                                                        moraleMode: m
                                                                    })),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + `w-full p-3 rounded-xl border flex items-center justify-between transition-all ${settings.moraleMode === m ? 'bg-zinc-800 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-bold uppercase",
                                                                    children: m === 'Standard' ? 'STANDART' : m === 'Collapsed' ? 'ÇÖKMÜŞ (KRİZ)' : 'HİPER (GAZA GELMİŞ)'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 625,
                                                                    columnNumber: 29
                                                                }, this),
                                                                m === 'Hyper' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                    size: 12,
                                                                    className: "text-emerald-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 46
                                                                }, this) : m === 'Collapsed' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                    size: 12,
                                                                    className: "text-red-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 122
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-b3cd0a4f7c7a1709"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 175
                                                                }, this)
                                                            ]
                                                        }, m, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 618,
                                                            columnNumber: 26
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 612,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 634,
                                                            columnNumber: 23
                                                        }, this),
                                                        " HAKEM SERTLİĞİ"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 633,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "grid grid-cols-2 gap-2",
                                                    children: [
                                                        'Low',
                                                        'Medium',
                                                        'High',
                                                        'Extreme'
                                                    ].map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSettings((prev)=>({
                                                                        ...prev,
                                                                        refereeStrictness: ref
                                                                    })),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + `p-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${settings.refereeStrictness === ref ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`,
                                                            children: ref === 'Extreme' ? 'KASAP DOSTU' : ref === 'High' ? 'SERT' : ref === 'Medium' ? 'ORTA' : 'YUMUŞAK'
                                                        }, ref, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 638,
                                                            columnNumber: 26
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 636,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 632,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 653,
                                                            columnNumber: 23
                                                        }, this),
                                                        " SENARYO DÜZENLEYİCİ"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 652,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "grid grid-cols-2 gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSettings((prev)=>({
                                                                        ...prev,
                                                                        scenario: prev.scenario === 'RedCard' ? undefined : 'RedCard'
                                                                    })),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + `p-3 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all ${settings.scenario === 'RedCard' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`,
                                                            children: "10 Kişi Kalma"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 656,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSettings((prev)=>({
                                                                        ...prev,
                                                                        scenario: prev.scenario === 'LateGoal' ? undefined : 'LateGoal'
                                                                    })),
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + `p-3 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all ${settings.scenario === 'LateGoal' ? 'bg-red-600 border-red-500 text-white' : 'bg-red-500/10 border-red-500/20 text-red-400'}`,
                                                            children: "Son 5 Dakika"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 662,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 655,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 651,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 571,
                                    columnNumber: 14
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 570,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "flex-1 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.1)_0%,_transparent_70%)] relative overflow-hidden flex flex-col pt-20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 pointer-events-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-3 pointer-events-auto",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                            size: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 677,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute bottom-12 left-0 w-64 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all text-[10px] text-white/60 leading-relaxed font-bold uppercase tracking-wider scale-95 group-hover:scale-100 origin-bottom-left pointer-events-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-blue-400 block mb-2",
                                                                    children: "TACTIC LABORATORY // INFO"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 679,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Burada takımınızın taktiklerini çeşitli simülasyon ortamlarında test edebilirsiniz.",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                    className: "jsx-b3cd0a4f7c7a1709"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 681,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                    className: "jsx-b3cd0a4f7c7a1709"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 681,
                                                                    columnNumber: 32
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-white",
                                                                    children: "Kadro Mühendisi:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 682,
                                                                    columnNumber: 27
                                                                }, this),
                                                                " Takımınızı ikiye bölüp 9v9 maçlar planlayın.",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                    className: "jsx-b3cd0a4f7c7a1709"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 683,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-white",
                                                                    children: "Saha & Analiz:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 684,
                                                                    columnNumber: 27
                                                                }, this),
                                                                " Farklı dizilişlerin sahada nasıl göründüğünü ve taktiksel parametrelerin maç motoruna etkisini analiz edin."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 678,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 676,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 675,
                                                columnNumber: 18
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "bg-zinc-900/80 backdrop-blur border border-white/5 rounded-full p-1 flex gap-1 shadow-2xl pointer-events-auto",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('control'),
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + `px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'control' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`,
                                                        children: "SAHA"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 690,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('analysis'),
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + `px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`,
                                                        children: "ANALİZ"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 691,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 689,
                                                columnNumber: 18
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 674,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex-1 p-4 md:p-8 flex flex-col items-center justify-start overflow-hidden",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "relative w-full aspect-[4/3] max-h-[400px] md:max-h-[600px] border-4 border-white/5 rounded-3xl bg-emerald-950/20 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute inset-0 opacity-20 pointer-events-none",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute inset-0 border-[3px] border-white/10 m-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 698,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute top-1/2 left-0 right-0 h-px bg-white/10"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 699,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/10 rounded-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 700,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 697,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute inset-0 w-full h-full pointer-events-none z-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "20%",
                                                        y1: "50%",
                                                        x2: "40%",
                                                        y2: "50%",
                                                        stroke: "rgba(16,185,129,0.3)",
                                                        strokeWidth: "4",
                                                        strokeDasharray: "10 5",
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "animate-[dash_2s_linear_infinite]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 704,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 703,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '50%'
                                                    },
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute inset-0 border-r-2 border-white/5",
                                                    children: [
                                                        squadAMembers.slice(0, maxPerTeam).map((p, i)=>{
                                                            const formationPos = formationPositions[selectedFormation] || formationPositions['4-4-2'];
                                                            const rawPos = formationPos[i] || {
                                                                x: '50%',
                                                                y: '50%'
                                                            };
                                                            const x = `${(100 - parseFloat(rawPos.y)) / 100 * 86 + 7}%`;
                                                            const y = `${parseFloat(rawPos.x) / 100 * 86 + 7}%`;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerMarker, {
                                                                player: p,
                                                                pos: {
                                                                    x,
                                                                    y
                                                                },
                                                                team: "A",
                                                                onClick: ()=>handlePlayerClick(p.id, 'A'),
                                                                isSelected: swapTarget?.id === p.id
                                                            }, p.id, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 715,
                                                                columnNumber: 32
                                                            }, this);
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute top-4 left-4 flex flex-col gap-1 items-start z-30 pointer-events-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] font-black text-blue-400/50 uppercase tracking-widest",
                                                                    children: "AS TAKIM (A)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 726,
                                                                    columnNumber: 30
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 uppercase backdrop-blur-md",
                                                                    children: [
                                                                        "GÜÇ: ",
                                                                        Math.floor(squadAMembers.reduce((s, p)=>s + p.rating, 0) / (squadAMembers.length || 1))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 727,
                                                                    columnNumber: 30
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 725,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 707,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '50%',
                                                        left: '50%'
                                                    },
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute inset-0 border-l-2 border-white/5",
                                                    children: [
                                                        squadBMembers.slice(0, maxPerTeam).map((p, i)=>{
                                                            const formationPos = formationPositions[selectedFormation] || formationPositions['4-4-2'];
                                                            const rawPos = formationPos[i] || {
                                                                x: '50%',
                                                                y: '50%'
                                                            };
                                                            const x = `${parseFloat(rawPos.y) / 100 * 86 + 7}%`;
                                                            const y = `${parseFloat(rawPos.x) / 100 * 86 + 7}%`;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerMarker, {
                                                                player: p,
                                                                pos: {
                                                                    x,
                                                                    y
                                                                },
                                                                team: "B",
                                                                onClick: ()=>handlePlayerClick(p.id, 'B'),
                                                                isSelected: swapTarget?.id === p.id
                                                            }, p.id, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 740,
                                                                columnNumber: 32
                                                            }, this);
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "absolute top-4 right-4 flex flex-col gap-1 items-end z-30 pointer-events-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] font-black text-red-400/50 uppercase tracking-widest",
                                                                    children: "YEDEK TAKIM (B)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 751,
                                                                    columnNumber: 30
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20 uppercase backdrop-blur-md",
                                                                    children: [
                                                                        "GÜÇ: ",
                                                                        Math.floor(squadBMembers.reduce((s, p)=>s + p.rating, 0) / (squadBMembers.length || 1))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 752,
                                                                    columnNumber: 30
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 750,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 732,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 696,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 695,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "p-6 bg-blue-600/5 mt-auto border-t border-white/5 backdrop-blur-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "max-w-3xl mx-auto flex items-center gap-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 border border-blue-500/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                        className: "text-blue-400",
                                                        size: 18
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 763,
                                                        columnNumber: 24
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 762,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic",
                                                            children: "YAPAY ZEKA KOÇ ÖNERİSİ:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 766,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-xs text-white/70 font-medium",
                                                            children: report || "Analiz bekleniyor... Simülasyonu başlatarak taktiksel zayıf noktaları ve oyuncu kimyalarını görebilirsin."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 767,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 765,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 761,
                                            columnNumber: 18
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 760,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 673,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full md:w-96 border-l border-white/5 flex flex-col bg-zinc-950 overflow-y-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "p-8 space-y-8",
                                    children: [
                                        insights.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 780,
                                                            columnNumber: 26
                                                        }, this),
                                                        " YENİ EDİNİLEN BİLGİLER"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 779,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-2",
                                                    children: insights.map((insight, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            initial: {
                                                                x: 20,
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                x: 0,
                                                                opacity: 1
                                                            },
                                                            transition: {
                                                                delay: i * 0.1
                                                            },
                                                            className: "p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl flex gap-3 items-start",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                    size: 14,
                                                                    className: "text-blue-400 flex-shrink-0 mt-0.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 791,
                                                                    columnNumber: 32
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[9px] text-white/70 font-bold leading-relaxed",
                                                                    children: insight
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 792,
                                                                    columnNumber: 32
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 784,
                                                            columnNumber: 29
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 782,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 778,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "flex justify-between items-end",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em]",
                                                            children: "TAKTIKSEL UYUM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 801,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-2xl font-black italic text-blue-400 tracking-tighter",
                                                            children: [
                                                                "%",
                                                                matchAccuracy
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 802,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 800,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "h-2 w-full bg-white/5 rounded-full overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            width: 0
                                                        },
                                                        animate: {
                                                            width: `${matchAccuracy}%`
                                                        },
                                                        className: "h-full bg-gradient-to-r from-blue-600 to-indigo-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 805,
                                                        columnNumber: 24
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 804,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] text-white/40 uppercase font-black tracking-widest leading-relaxed",
                                                    children: [
                                                        "OYUNCULARIN %",
                                                        matchAccuracy,
                                                        "'Ü MEVCUT TAKTİĞE UYGUN TRAİTLERE SAHİP."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 807,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 799,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] font-black text-white/20 uppercase tracking-widest leading-none",
                                                            children: "XG POTANSİYELİ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 814,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-xl font-black italic tracking-tighter text-white",
                                                            children: simResults.length > 0 ? (simResults.reduce((s, r)=>s + r.score.home, 0) / simResults.length).toFixed(1) : '—'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 815,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 813,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[8px] font-black text-white/20 uppercase tracking-widest leading-none",
                                                            children: "GALİBİYET ORANI"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 822,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-xl font-black italic tracking-tighter text-emerald-400",
                                                            children: simResults.length > 0 ? `%${Math.round(simResults.filter((r)=>r.score.home > r.score.away).length / simResults.length * 100)}` : '—'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 823,
                                                            columnNumber: 24
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 821,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 812,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "pt-8 border-t border-white/5 space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "flex flex-col gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>runBatchSim(5),
                                                            disabled: isSimulating,
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 group font-black",
                                                            children: isSimulating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 839,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                        size: 20,
                                                                        fill: "black"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 842,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-sm uppercase tracking-[0.2em] italic",
                                                                        children: "LABORATUVARI ÇALIŞTIR (x5)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 843,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 833,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>runBatchSim(25),
                                                            disabled: isSimulating,
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full py-4 bg-zinc-900 border border-white/5 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 853,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " DERİN ANALİZ (x25 SIM)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 848,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 832,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + "space-y-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-black text-white/30 uppercase tracking-[0.2em]",
                                                            children: "ANTRENMAN MAÇLARI SONUÇLARI"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 858,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "flex gap-1 flex-wrap",
                                                            children: simResults.slice(0, 10).map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-b3cd0a4f7c7a1709" + " " + `w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${r.score.home > r.score.away ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : r.score.home < r.score.away ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-white/40'}`,
                                                                    children: [
                                                                        r.score.home,
                                                                        "-",
                                                                        r.score.away
                                                                    ]
                                                                }, i, true, {
                                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                    lineNumber: 861,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                            lineNumber: 859,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 857,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 831,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-b3cd0a4f7c7a1709" + " " + "mt-auto pt-8",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alert("Taktik başarıyla ana taktik paneline kopyalandı!"),
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-full flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl group hover:bg-blue-600/20 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                                                size: 18,
                                                                className: "text-blue-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 879,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "text-left",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[9px] font-black text-blue-400 uppercase tracking-widest",
                                                                        children: "ANALİZ TAMAMLANDI"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 881,
                                                                        columnNumber: 30
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[7px] text-white/40 uppercase font-bold",
                                                                        children: "BU TAKTİĞİ ANA TAKTİĞİN YAP"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 882,
                                                                        columnNumber: 30
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 880,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 878,
                                                        columnNumber: 24
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        size: 16,
                                                        className: "text-white/20 group-hover:text-blue-400 transition-all"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 885,
                                                        columnNumber: 24
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 874,
                                                columnNumber: 20
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 873,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                    lineNumber: 776,
                                    columnNumber: 14
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 775,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                        lineNumber: 568,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/TacticLab.tsx",
                lineNumber: 529,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: selectingPlayerFor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        className: "w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-800/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "text-xl font-black italic text-white uppercase tracking-tighter",
                                                children: "OYUNCU SEÇİMİ"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 908,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-bold text-white/40 uppercase",
                                                children: [
                                                    "DEĞİŞTİRİLECEK: ",
                                                    squad.find((p)=>p.id === selectingPlayerFor.id)?.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 909,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 907,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectingPlayerFor(null),
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/TacticLab.tsx",
                                            lineNumber: 912,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 911,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 906,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b3cd0a4f7c7a1709" + " " + "flex-1 overflow-y-auto p-6 space-y-2 max-h-[60vh] scrollbar-hide",
                                children: squad.sort((a, b)=>b.rating - a.rating).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex gap-2 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>selectReplacement(p.id),
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + `flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between group-hover:border-blue-400 ${p.id === selectingPlayerFor.id ? 'bg-blue-600 border-blue-500' : teamA.includes(p.id) ? 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20' : teamB.includes(p.id) ? 'bg-red-600/10 border-red-500/20 hover:bg-red-600/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "flex items-center gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-b3cd0a4f7c7a1709" + " " + `w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black shadow-lg ${(p.specificPosition || p.position) === 'GK' ? 'bg-[#7AB4E8]' : [
                                                                    'CB',
                                                                    'LB',
                                                                    'RB',
                                                                    'LWB',
                                                                    'RWB',
                                                                    'DEF'
                                                                ].includes(p.specificPosition || p.position) ? 'bg-[#7EDBC8]' : [
                                                                    'CDM',
                                                                    'CM',
                                                                    'CAM',
                                                                    'LM',
                                                                    'RM',
                                                                    'LW',
                                                                    'RW',
                                                                    'MID'
                                                                ].includes(p.specificPosition || p.position) ? 'bg-[#F0C87A]' : 'bg-[#E87878]'}`,
                                                                children: p.specificPosition || p.position
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 929,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "text-left",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-sm font-black text-white uppercase",
                                                                        children: p.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 935,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-b3cd0a4f7c7a1709" + " " + "text-[10px] font-bold text-white/40 uppercase tracking-widest",
                                                                        children: [
                                                                            "GÜÇ: ",
                                                                            p.rating,
                                                                            " ",
                                                                            '//',
                                                                            " ",
                                                                            teamA.includes(p.id) ? 'AS TAKIM' : teamB.includes(p.id) ? 'YEDEK' : 'BOŞTA'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                        lineNumber: 936,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                                lineNumber: 934,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 928,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        size: 18,
                                                        className: "text-white/20 group-hover:text-white transition-all"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                        lineNumber: 939,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 919,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setDetailPlayer(p),
                                                className: "jsx-b3cd0a4f7c7a1709" + " " + "w-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl group-hover:border-blue-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                    lineNumber: 945,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                                lineNumber: 941,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, p.id, true, {
                                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                                        lineNumber: 918,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticLab.tsx",
                                lineNumber: 916,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                        lineNumber: 901,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                    lineNumber: 895,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticLab.tsx",
                lineNumber: 893,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: detailPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-b3cd0a4f7c7a1709" + " " + "fixed inset-0 z-[250]",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$PlayerDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        player: detailPlayer,
                        onClose: ()=>setDetailPlayer(null),
                        teamStats: {}
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/TacticLab.tsx",
                        lineNumber: 958,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/TacticLab.tsx",
                    lineNumber: 957,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticLab.tsx",
                lineNumber: 955,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "b3cd0a4f7c7a1709",
                children: "@keyframes dash{to{stroke-dashoffset:-20px}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/TacticLab.tsx",
        lineNumber: 523,
        columnNumber: 5
    }, this);
}
_s(TacticLab, "qPSHRI5T+XqsdZ445QsgZezSlMc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDraggableModal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggableModal"]
    ];
});
_c1 = TacticLab;
var _c, _c1;
__turbopack_context__.k.register(_c, "PlayerMarker");
__turbopack_context__.k.register(_c1, "TacticLab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_TacticLab_tsx_bcfd6c59._.js.map