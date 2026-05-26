(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip,
    "TooltipContent",
    ()=>TooltipContent,
    "TooltipProvider",
    ()=>TooltipProvider,
    "TooltipTrigger",
    ()=>TooltipTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function TooltipProvider({ delayDuration = 0, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        "data-slot": "tooltip-provider",
        delayDuration: delayDuration,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = TooltipProvider;
function Tooltip({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TooltipProvider, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
            "data-slot": "tooltip",
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/tooltip.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c1 = Tooltip;
function TooltipTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "tooltip-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 34,
        columnNumber: 10
    }, this);
}
_c2 = TooltipTrigger;
function TooltipContent({ className, sideOffset = 0, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "tooltip-content",
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance", className),
            ...props,
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Arrow"], {
                    className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/tooltip.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ui/tooltip.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c3 = TooltipContent;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "TooltipProvider");
__turbopack_context__.k.register(_c1, "Tooltip");
__turbopack_context__.k.register(_c2, "TooltipTrigger");
__turbopack_context__.k.register(_c3, "TooltipContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/match/LiveStrategyPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STRATEGY_TACTICS",
    ()=>STRATEGY_TACTICS,
    "default",
    ()=>LiveStrategyPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const STRATEGY_FORMATIONS = [
    '4-4-2',
    '4-3-3',
    '3-5-2',
    '4-5-1',
    '4-2-3-1',
    '5-3-2',
    '3-4-3'
];
const STRATEGY_TACTICS = [
    {
        id: 'dengeli',
        label: 'Dengeli',
        desc: 'Standart oyun planı',
        icon: '⚖️',
        goalMod: 0,
        conceedMod: 0,
        counterMod: 0
    },
    {
        id: 'hucum',
        label: 'Hücum',
        desc: '+%12 Ofans, -%5 Defans',
        icon: '⚔️',
        goalMod: 0.12,
        conceedMod: 0.05,
        counterMod: 0
    },
    {
        id: 'savunma',
        label: 'Savunma',
        desc: '+%15 Defans, -%5 Ofans',
        icon: '🛡️',
        goalMod: -0.05,
        conceedMod: -0.15,
        counterMod: 0
    },
    {
        id: 'kontra',
        label: 'Kontra',
        desc: '+%10 Kontra Atak gücü',
        icon: '⚡',
        goalMod: 0.05,
        conceedMod: 0,
        counterMod: 0.10
    },
    {
        id: 'tikitaka',
        label: 'Tiki-Taka',
        desc: 'Yüksek pas ve oyun kontrolü',
        icon: '🔥',
        goalMod: 0.04,
        conceedMod: -0.02,
        counterMod: 0
    }
];
// ─── Taktik etki bilgi kutusu ─────────────────────────────
function TacticEffectInfo({ tacticId }) {
    const tactic = STRATEGY_TACTICS.find((t)=>t.id === tacticId);
    if (!tactic || tacticId === 'dengeli') return null;
    const effects = [];
    if (tactic.goalMod !== 0) {
        effects.push({
            label: 'Gol şansı',
            value: tactic.goalMod > 0 ? `+${(tactic.goalMod * 100).toFixed(0)}%` : `${(tactic.goalMod * 100).toFixed(0)}%`,
            color: tactic.goalMod > 0 ? 'text-emerald-400' : 'text-red-400'
        });
    }
    if (tactic.conceedMod !== 0) {
        effects.push({
            label: 'Gol yeme riski',
            value: tactic.conceedMod > 0 ? `+${(tactic.conceedMod * 100).toFixed(0)}%` : `${(tactic.conceedMod * 100).toFixed(0)}%`,
            color: tactic.conceedMod > 0 ? 'text-red-400' : 'text-emerald-400'
        });
    }
    if (tactic.counterMod !== 0) {
        effects.push({
            label: 'Kontra atak',
            value: `+${(tactic.counterMod * 100).toFixed(0)}%`,
            color: 'text-cyan-400'
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            height: 0
        },
        animate: {
            opacity: 1,
            height: 'auto'
        },
        exit: {
            opacity: 0,
            height: 0
        },
        className: "bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-3 space-y-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                        size: 10,
                        className: "text-amber-400"
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[8px] font-black uppercase tracking-widest text-amber-400/60",
                        children: [
                            tactic.label,
                            " Taktik Etkileri"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            effects.map((e, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between text-[10px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white/40 font-bold",
                            children: e.label
                        }, void 0, false, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `font-black ${e.color}`,
                            children: e.value
                        }, void 0, false, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_c = TacticEffectInfo;
function LiveStrategyPanel({ currentFormation, currentTactic, onApply, isApplying, lastApplied, changeCount, currentMinute }) {
    _s();
    const [draftFormation, setDraftFormation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentFormation);
    const [draftTactic, setDraftTactic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentTactic);
    const [showEffects, setShowEffects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [lastChangeMsg, setLastChangeMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveStrategyPanel.useEffect": ()=>{
            setDraftFormation(currentFormation);
        }
    }["LiveStrategyPanel.useEffect"], [
        currentFormation
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveStrategyPanel.useEffect": ()=>{
            setDraftTactic(currentTactic);
        }
    }["LiveStrategyPanel.useEffect"], [
        currentTactic
    ]);
    // 5 saniye sonra taktik mesajını kaldır
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveStrategyPanel.useEffect": ()=>{
            if (lastChangeMsg) {
                const timer = setTimeout({
                    "LiveStrategyPanel.useEffect.timer": ()=>setLastChangeMsg(null)
                }["LiveStrategyPanel.useEffect.timer"], 5000);
                return ({
                    "LiveStrategyPanel.useEffect": ()=>clearTimeout(timer)
                })["LiveStrategyPanel.useEffect"];
            }
        }
    }["LiveStrategyPanel.useEffect"], [
        lastChangeMsg
    ]);
    const hasChanges = draftFormation !== currentFormation || draftTactic !== currentTactic;
    const maxChanges = 5;
    const remaining = maxChanges - changeCount;
    const handleApply = ()=>{
        const prevLabel = STRATEGY_TACTICS.find((t)=>t.id === currentTactic)?.label || currentTactic;
        const nextLabel = STRATEGY_TACTICS.find((t)=>t.id === draftTactic)?.label || draftTactic;
        const formationChange = draftFormation !== currentFormation ? `${currentFormation} → ${draftFormation}` : '';
        const tacticChange = currentTactic !== draftTactic ? `${prevLabel} → ${nextLabel}` : '';
        const parts = [
            formationChange,
            tacticChange
        ].filter(Boolean).join(', ');
        const nextTactic = STRATEGY_TACTICS.find((t)=>t.id === draftTactic);
        let effectHint = '';
        if (nextTactic && draftTactic !== 'dengeli') {
            if (nextTactic.goalMod > 0) effectHint = ` Gol ihtimali +${(nextTactic.goalMod * 100).toFixed(0)}%`;
            else if (nextTactic.goalMod < 0) effectHint = ` Gol ihtimali ${(nextTactic.goalMod * 100).toFixed(0)}%`;
            if (nextTactic.conceedMod > 0) effectHint += `, gol yeme riski +${(nextTactic.conceedMod * 100).toFixed(0)}%`;
            else if (nextTactic.conceedMod < 0) effectHint += `, gol yeme riski ${(nextTactic.conceedMod * 100).toFixed(0)}%`;
        }
        setLastChangeMsg(`Taktik değişti: ${parts}.${effectHint}`);
        onApply(draftFormation, draftTactic);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: lastChangeMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: -10,
                        scale: 0.95
                    },
                    animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        y: -10,
                        scale: 0.95
                    },
                    transition: {
                        duration: 0.3
                    },
                    className: "bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                size: 16,
                                className: "text-amber-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 138,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 137,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] font-bold text-amber-300 leading-relaxed",
                            children: lastChangeMsg
                        }, void 0, false, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 140,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                    lineNumber: 130,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            remaining === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: -5
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "bg-red-500/[0.08] border border-red-500/25 rounded-xl px-4 py-3 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        size: 16,
                        className: "text-red-400 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-black text-red-400 uppercase tracking-widest",
                                children: "Müdahale Hakkı Doldu"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 154,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[9px] text-red-400/60 mt-0.5",
                                children: "Bu maç için kenardan müdahale hakkınız kalmamıştır. Taktik değişikliği yapamazsınız."
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this),
            remaining === 1 && changeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                className: "bg-amber-500/[0.06] border border-amber-500/15 rounded-xl px-4 py-2 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        size: 12,
                        className: "text-amber-400 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[9px] font-bold text-amber-400/70",
                        children: "Dikkat! Son müdahale hakkınız. Bu değişiklikten sonra taktik değiştiremezsiniz."
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-4 py-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[9px] font-black uppercase tracking-widest text-red-400",
                                children: "Aktif Taktik Planı"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-white/70 mt-0.5",
                                children: [
                                    currentFormation,
                                    " · ",
                                    STRATEGY_TACTICS.find((t)=>t.id === currentTactic)?.label || currentTactic
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[8px] text-white/20",
                                children: "Değişiklik Hakkı"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-sm font-black ${remaining > 1 ? 'text-amber-400' : remaining === 1 ? 'text-orange-400' : 'text-red-500'}`,
                                children: [
                                    remaining,
                                    "/",
                                    maxChanges
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            remaining > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2",
                                children: "Formasyonu Değiştir"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 193,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: STRATEGY_FORMATIONS.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setDraftFormation(f),
                                        className: `px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${draftFormation === f ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'}`,
                                        children: f
                                    }, f, false, {
                                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 192,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2",
                                children: "Oyun Stilini Değiştir"
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: STRATEGY_TACTICS.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setDraftTactic(t.id),
                                        className: `px-3 py-3 rounded-xl text-left transition-all border ${draftTactic === t.id ? 'bg-amber-500/15 border-amber-500/25' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-base",
                                                children: t.icon
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                                lineNumber: 227,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-[10px] font-black uppercase mt-1 ${draftTactic === t.id ? 'text-amber-300' : 'text-white/40'}`,
                                                children: t.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                                lineNumber: 228,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-[8px] mt-0.5 ${draftTactic === t.id ? 'text-amber-400/50' : 'text-white/20'}`,
                                                children: t.desc
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                                lineNumber: 229,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, t.id, true, {
                                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                        lineNumber: 217,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 215,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 213,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: showEffects && draftTactic !== 'dengeli' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TacticEffectInfo, {
                            tacticId: draftTactic
                        }, void 0, false, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 238,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setShowEffects((prev)=>!prev),
                        className: "w-full flex items-center justify-center gap-1.5 text-[8px] font-bold text-white/15 hover:text-white/30 transition-colors",
                        children: [
                            showEffects ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 247,
                                columnNumber: 28
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                                lineNumber: 247,
                                columnNumber: 54
                            }, this),
                            showEffects ? 'Etki bilgisini gizle' : 'Etki bilgisini göster'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleApply,
                        disabled: !hasChanges || isApplying,
                        className: `w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${hasChanges && !isApplying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-white/[0.02] text-white/20 border border-white/[0.06] cursor-not-allowed'}`,
                        children: isApplying ? '⏳ Taktiğe müdahale ediliyor...' : hasChanges ? '✅ Kulübeden Talimatı Ver' : '— Değişiklik Yok —'
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 252,
                        columnNumber: 11
                    }, this),
                    lastApplied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[8px] text-center text-white/15",
                        children: [
                            "Son talimat saati: ",
                            lastApplied
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 266,
                        columnNumber: 13
                    }, this),
                    currentMinute != null && currentMinute >= 75 && remaining > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 5
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[9px] font-bold text-red-400 text-center",
                            children: [
                                "⚠️ Son ",
                                90 - currentMinute,
                                " dakika kaldı!"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                            lineNumber: 276,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
                        lineNumber: 271,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/match/LiveStrategyPanel.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_s(LiveStrategyPanel, "p9G8R5twdtsPaw5vV57XrdPdCcQ=");
_c1 = LiveStrategyPanel;
var _c, _c1;
__turbopack_context__.k.register(_c, "TacticEffectInfo");
__turbopack_context__.k.register(_c1, "LiveStrategyPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ThemeToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contrast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contrast$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/contrast.js [app-client] (ecmascript) <export default as Contrast>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const THEME_LABELS = {
    dark: {
        label: 'Karanlık',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/ThemeToggle.tsx",
            lineNumber: 10,
            columnNumber: 36
        }, ("TURBOPACK compile-time value", void 0)),
        desc: 'Varsayılan koyu tema'
    },
    light: {
        label: 'Aydınlık',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/ThemeToggle.tsx",
            lineNumber: 11,
            columnNumber: 37
        }, ("TURBOPACK compile-time value", void 0)),
        desc: 'Açık arka planlı tema'
    },
    'high-contrast': {
        label: 'Yüksek Kontrast',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contrast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contrast$3e$__["Contrast"], {
            size: 14
        }, void 0, false, {
            fileName: "[project]/src/components/ThemeToggle.tsx",
            lineNumber: 12,
            columnNumber: 54
        }, ("TURBOPACK compile-time value", void 0)),
        desc: 'Parlak metin, koyu gri arka plan'
    }
};
const THEME_ORDER = [
    'dark',
    'light',
    'high-contrast'
];
function getStoredTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem('sb-fc-theme');
        if (stored && THEME_ORDER.includes(stored)) return stored;
    } catch  {}
    return 'dark';
}
function applyTheme(mode) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    // Remove all theme classes
    html.classList.remove('dark', 'light', 'high-contrast');
    // Add the selected theme class
    html.classList.add(mode);
    // Also set as data attribute for CSS selectors
    html.setAttribute('data-theme', mode);
    // Persist
    try {
        localStorage.setItem('sb-fc-theme', mode);
    } catch  {}
}
function ThemeToggle() {
    _s();
    const [currentTheme, setCurrentTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dark');
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Initialize theme from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeToggle.useEffect": ()=>{
            const stored = getStoredTheme();
            setCurrentTheme(stored);
            applyTheme(stored);
        }
    }["ThemeToggle.useEffect"], []);
    const cycleTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeToggle.useCallback[cycleTheme]": ()=>{
            const currentIndex = THEME_ORDER.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
            const nextTheme = THEME_ORDER[nextIndex];
            setCurrentTheme(nextTheme);
            applyTheme(nextTheme);
            setIsOpen(false);
        }
    }["ThemeToggle.useCallback[cycleTheme]"], [
        currentTheme
    ]);
    const setTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeToggle.useCallback[setTheme]": (theme)=>{
            setCurrentTheme(theme);
            applyTheme(theme);
            setIsOpen(false);
        }
    }["ThemeToggle.useCallback[setTheme]"], []);
    const currentInfo = THEME_LABELS[currentTheme];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: cycleTheme,
                onContextMenu: (e)=>{
                    e.preventDefault();
                    setIsOpen(!isOpen);
                },
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all",
                title: `Tema: ${currentInfo.label} (Değiştirmek için tıklayın, menü için sağ tıklayın)`,
                children: [
                    currentInfo.icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-bold uppercase tracking-widest hidden sm:inline",
                        children: currentInfo.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/ThemeToggle.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ThemeToggle.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "fixed inset-0 z-[200]",
                            onClick: ()=>setIsOpen(false)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 87,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: -8,
                                scale: 0.95
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: -8,
                                scale: 0.95
                            },
                            transition: {
                                duration: 0.15
                            },
                            className: "absolute right-0 top-full mt-2 z-[201] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-2 py-1.5 text-[8px] font-black text-white/25 uppercase tracking-widest",
                                        children: "Tema Seçimi"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ThemeToggle.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this),
                                    THEME_ORDER.map((theme)=>{
                                        const info = THEME_LABELS[theme];
                                        const isActive = theme === currentTheme;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setTheme(theme),
                                            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-8 h-8 rounded-lg flex items-center justify-center border ${isActive ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' : 'bg-white/5 border-white/10 text-white/40'}`,
                                                    children: info.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ThemeToggle.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-[11px] font-bold ${isActive ? 'text-amber-300' : 'text-white/70'}`,
                                                            children: info.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/ThemeToggle.tsx",
                                                            lineNumber: 123,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-white/30 leading-tight",
                                                            children: info.desc
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/ThemeToggle.tsx",
                                                            lineNumber: 126,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/ThemeToggle.tsx",
                                                    lineNumber: 122,
                                                    columnNumber: 23
                                                }, this),
                                                isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 rounded-full bg-amber-400 shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ThemeToggle.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, theme, true, {
                                            fileName: "[project]/src/components/ThemeToggle.tsx",
                                            lineNumber: 106,
                                            columnNumber: 21
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ThemeToggle.tsx",
                                lineNumber: 98,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 91,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/ThemeToggle.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ThemeToggle.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "9jLjrztrpbPyLnLl0/Yl9zggwRM=");
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/animations/Confetti.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Confetti,
    "fireConfetti",
    ()=>fireConfetti
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/canvas-confetti/dist/confetti.module.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$emotionalEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/emotionalEvents.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Confetti({ trigger = false, duration = 3000, particleCount = 150, autoListen = true, onComplete }) {
    _s();
    const [isActive, setIsActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Confetti.useCallback[fire]": ()=>{
            try {
                setIsActive(true);
                const end = Date.now() + duration;
                // İlk büyük patlama
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                    particleCount,
                    spread: 70,
                    origin: {
                        y: 0.6
                    },
                    colors: [
                        '#FFD700',
                        '#FF6347',
                        '#00CED1',
                        '#7FFF00',
                        '#FF69B4'
                    ]
                });
                // Sağdan
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                    particleCount: Math.floor(particleCount / 3),
                    angle: 60,
                    spread: 55,
                    origin: {
                        x: 0
                    },
                    colors: [
                        '#FFD700',
                        '#FF6347',
                        '#00CED1'
                    ]
                });
                // Soldan
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                    particleCount: Math.floor(particleCount / 3),
                    angle: 120,
                    spread: 55,
                    origin: {
                        x: 1
                    },
                    colors: [
                        '#7FFF00',
                        '#FF69B4',
                        '#FFD700'
                    ]
                });
                // Sürekli küçük patlamalar
                const interval = setInterval({
                    "Confetti.useCallback[fire].interval": ()=>{
                        if (Date.now() > end) {
                            clearInterval(interval);
                            setIsActive(false);
                            onComplete?.();
                            return;
                        }
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                            particleCount: 30,
                            angle: 60 + Math.random() * 60,
                            spread: 50,
                            origin: {
                                y: 0.6
                            },
                            colors: [
                                '#FFD700',
                                '#FF6347',
                                '#00CED1',
                                '#7FFF00',
                                '#FF69B4'
                            ]
                        });
                    }
                }["Confetti.useCallback[fire].interval"], 400);
            } catch (err) {
                console.error('[Confetti] fire error:', err);
                setIsActive(false);
            }
        }
    }["Confetti.useCallback[fire]"], [
        duration,
        particleCount,
        onComplete
    ]);
    // Dış tetikleme
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Confetti.useEffect": ()=>{
            if (trigger) {
                fire();
            }
        }
    }["Confetti.useEffect"], [
        trigger,
        fire
    ]);
    // Duygusal olay dinleyicisi
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Confetti.useEffect": ()=>{
            if (!autoListen) return;
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$emotionalEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onEmotionalEvent"])({
                "Confetti.useEffect.unsubscribe": (event)=>{
                    if (event.type === 'CHAMPION' || event.type === 'RECORD_TOP_SCORER' || event.type === 'RECORD_TOP_ASSIST' || event.type === 'CAREER_HAT_TRICK') {
                        fire();
                    }
                }
            }["Confetti.useEffect.unsubscribe"]);
            return unsubscribe;
        }
    }["Confetti.useEffect"], [
        autoListen,
        fire
    ]);
    // Bu bileşen görsel render etmez — canvas-confetti DOM'a doğrudan eklenir
    return isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-[9999]",
        "aria-hidden": "true"
    }, void 0, false, {
        fileName: "[project]/src/components/animations/Confetti.tsx",
        lineNumber: 116,
        columnNumber: 5
    }, this) : null;
}
_s(Confetti, "WjDD+1+LTlyFvos1yrOKaHomjSU=");
_c = Confetti;
function fireConfetti(particleCount = 100) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
            particleCount,
            spread: 70,
            origin: {
                y: 0.6
            },
            colors: [
                '#FFD700',
                '#FF6347',
                '#00CED1',
                '#7FFF00',
                '#FF69B4'
            ]
        });
    } catch (err) {
        console.error('[Confetti] fireConfetti error:', err);
    }
}
var _c;
__turbopack_context__.k.register(_c, "Confetti");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/animations/GoalCelebration.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoalCelebration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const CELEBRATION_MESSAGES = [
    'GOOOL!',
    'MUHTEŞEM GOL!',
    'İNANILMAZ!',
    'TRİBÜNLER AYAĞA KALKTI!',
    'HARİKA BİR VURUŞ!',
    'KALECİNİN YAPACAĞI BİR ŞEY YOK!',
    'FUTBOL BÖYLE BİR OYUN!',
    'İŞTE BU!'
];
const getRandomMessage = ()=>{
    try {
        return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
    } catch  {
        return 'GOOL!';
    }
};
function GoalCelebration({ scorer, minute, trigger = false, duration = 2500, onComplete, isHatTrick = false, isLateWinner = false }) {
    _s();
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('GOOL!');
    const celebrate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GoalCelebration.useCallback[celebrate]": ()=>{
            try {
                setMessage(getRandomMessage());
                setShow(true);
                const timer = setTimeout({
                    "GoalCelebration.useCallback[celebrate].timer": ()=>{
                        setShow(false);
                        onComplete?.();
                    }
                }["GoalCelebration.useCallback[celebrate].timer"], duration);
                return ({
                    "GoalCelebration.useCallback[celebrate]": ()=>clearTimeout(timer)
                })["GoalCelebration.useCallback[celebrate]"];
            } catch (err) {
                console.error('[GoalCelebration] celebrate error:', err);
                setShow(false);
            }
        }
    }["GoalCelebration.useCallback[celebrate]"], [
        duration,
        onComplete
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoalCelebration.useEffect": ()=>{
            if (trigger) {
                celebrate();
            }
        }
    }["GoalCelebration.useEffect"], [
        trigger,
        celebrate
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: show && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            className: "pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center",
            initial: {
                opacity: 0,
                scale: 0.3
            },
            animate: {
                opacity: 1,
                scale: 1
            },
            exit: {
                opacity: 0,
                scale: 1.5
            },
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 200
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "absolute inset-0",
                    initial: {
                        background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)'
                    },
                    animate: {
                        background: [
                            'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(255,99,71,0.5) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)'
                        ]
                    },
                    transition: {
                        duration: 0.8,
                        repeat: Infinity
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                    lineNumber: 92,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "relative text-center",
                    initial: {
                        y: 20
                    },
                    animate: {
                        y: [
                            20,
                            -10,
                            0
                        ]
                    },
                    transition: {
                        duration: 0.5
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "text-6xl font-black tracking-wider text-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] md:text-8xl",
                            animate: {
                                scale: [
                                    1,
                                    1.2,
                                    1
                                ],
                                textShadow: [
                                    '0 0 20px rgba(255,215,0,0.8)',
                                    '0 0 40px rgba(255,215,0,1)',
                                    '0 0 20px rgba(255,215,0,0.8)'
                                ]
                            },
                            transition: {
                                duration: 0.5,
                                repeat: 2
                            },
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this),
                        isHatTrick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "mt-2 text-3xl font-black tracking-wider text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] md:text-5xl",
                            initial: {
                                opacity: 0,
                                scale: 0.5
                            },
                            animate: {
                                opacity: 1,
                                scale: [
                                    1,
                                    1.3,
                                    1
                                ]
                            },
                            transition: {
                                delay: 0.2,
                                duration: 0.6,
                                repeat: 2
                            },
                            children: "HAT-TRICK! 🎩"
                        }, void 0, false, {
                            fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                            lineNumber: 128,
                            columnNumber: 15
                        }, this),
                        isLateWinner && !isHatTrick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "mt-2 text-3xl font-black tracking-wider text-red-400 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] md:text-5xl",
                            initial: {
                                opacity: 0,
                                scale: 0.5
                            },
                            animate: {
                                opacity: 1,
                                scale: [
                                    1,
                                    1.3,
                                    1
                                ]
                            },
                            transition: {
                                delay: 0.2,
                                duration: 0.6,
                                repeat: 2
                            },
                            children: "SON DAKİKA GOLÜ! 🔥"
                        }, void 0, false, {
                            fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                            lineNumber: 139,
                            columnNumber: 15
                        }, this),
                        scorer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "mt-4 text-2xl font-bold text-white md:text-3xl",
                            initial: {
                                opacity: 0,
                                y: 10
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                delay: 0.3
                            },
                            children: [
                                "⚽ ",
                                scorer,
                                minute !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 text-lg text-white/60",
                                    children: [
                                        minute,
                                        "'"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                                    lineNumber: 158,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                            lineNumber: 150,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/animations/GoalCelebration.tsx",
                    lineNumber: 106,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/animations/GoalCelebration.tsx",
            lineNumber: 84,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/animations/GoalCelebration.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(GoalCelebration, "LMsS8HpboDk49UTgAcWLsebP58s=");
_c = GoalCelebration;
var _c;
__turbopack_context__.k.register(_c, "GoalCelebration");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/animations/RecordBreak.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecordBreak
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$emotionalEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/emotionalEvents.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const SEVERITY_STYLES = {
    low: {
        bg: 'from-blue-900/90 to-blue-800/90',
        border: 'border-blue-500/50',
        glow: 'shadow-blue-500/30',
        icon: '📝'
    },
    medium: {
        bg: 'from-purple-900/90 to-purple-800/90',
        border: 'border-purple-500/50',
        glow: 'shadow-purple-500/30',
        icon: '⭐'
    },
    high: {
        bg: 'from-amber-900/90 to-amber-800/90',
        border: 'border-amber-500/50',
        glow: 'shadow-amber-500/40',
        icon: '🔥'
    },
    legendary: {
        bg: 'from-yellow-900/90 via-red-900/90 to-amber-900/90',
        border: 'border-yellow-400/60',
        glow: 'shadow-yellow-400/50',
        icon: '👑'
    }
};
function RecordBreak({ event: externalEvent, autoListen = true, duration = 4000, onComplete }) {
    _s();
    const [currentEvent, setCurrentEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const displayEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RecordBreak.useCallback[displayEvent]": (evt)=>{
            try {
                setCurrentEvent(evt);
                setShow(true);
                setTimeout({
                    "RecordBreak.useCallback[displayEvent]": ()=>{
                        setShow(false);
                        setTimeout({
                            "RecordBreak.useCallback[displayEvent]": ()=>{
                                setCurrentEvent(null);
                                onComplete?.();
                            }
                        }["RecordBreak.useCallback[displayEvent]"], 500);
                    }
                }["RecordBreak.useCallback[displayEvent]"], duration);
            } catch (err) {
                console.error('[RecordBreak] displayEvent error:', err);
                setShow(false);
            }
        }
    }["RecordBreak.useCallback[displayEvent]"], [
        duration,
        onComplete
    ]);
    // Dışarıdan gelen event
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RecordBreak.useEffect": ()=>{
            if (externalEvent) {
                displayEvent(externalEvent);
            }
        }
    }["RecordBreak.useEffect"], [
        externalEvent,
        displayEvent
    ]);
    // Duygusal olay dinleyicisi
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RecordBreak.useEffect": ()=>{
            if (!autoListen) return;
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$emotionalEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onEmotionalEvent"])({
                "RecordBreak.useEffect.unsubscribe": (evt)=>{
                    if (evt.type.startsWith('RECORD_') || evt.type === 'CAREER_FIRST_GOAL' || evt.type === 'CAREER_FIRST_ASSIST' || evt.type === 'CAREER_HAT_TRICK' || evt.type === 'BIG_TRANSFER') {
                        displayEvent(evt);
                    }
                }
            }["RecordBreak.useEffect.unsubscribe"]);
            return unsubscribe;
        }
    }["RecordBreak.useEffect"], [
        autoListen,
        displayEvent
    ]);
    const style = currentEvent ? SEVERITY_STYLES[currentEvent.severity] ?? SEVERITY_STYLES.medium : SEVERITY_STYLES.medium;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: show && currentEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            className: "fixed inset-0 z-[9997] flex items-center justify-center p-4",
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "absolute inset-0 bg-black/60",
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                    lineNumber: 120,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: `relative w-full max-w-md overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} shadow-2xl ${style.glow}`,
                    initial: {
                        scale: 0.5,
                        opacity: 0,
                        rotateY: -90
                    },
                    animate: {
                        scale: 1,
                        opacity: 1,
                        rotateY: 0
                    },
                    exit: {
                        scale: 0.8,
                        opacity: 0,
                        rotateY: 90
                    },
                    transition: {
                        type: 'spring',
                        damping: 15,
                        stiffness: 200
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent",
                            animate: {
                                opacity: [
                                    0.5,
                                    1,
                                    0.5
                                ]
                            },
                            transition: {
                                duration: 1.5,
                                repeat: Infinity
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/animations/RecordBreak.tsx",
                            lineNumber: 136,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "mb-3 text-5xl",
                                    animate: {
                                        scale: [
                                            1,
                                            1.3,
                                            1
                                        ]
                                    },
                                    transition: {
                                        duration: 0.8,
                                        repeat: 2
                                    },
                                    children: currentEvent.icon || style.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                                    lineNumber: 144,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h2, {
                                    className: "mb-2 text-2xl font-black tracking-wider text-white md:text-3xl",
                                    initial: {
                                        y: 10,
                                        opacity: 0
                                    },
                                    animate: {
                                        y: 0,
                                        opacity: 1
                                    },
                                    transition: {
                                        delay: 0.2
                                    },
                                    children: currentEvent.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                    className: "text-sm leading-relaxed text-white/80 md:text-base",
                                    initial: {
                                        y: 10,
                                        opacity: 0
                                    },
                                    animate: {
                                        y: 0,
                                        opacity: 1
                                    },
                                    transition: {
                                        delay: 0.4
                                    },
                                    children: currentEvent.description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this),
                                currentEvent.player && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "mt-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-yellow-300",
                                    initial: {
                                        scale: 0
                                    },
                                    animate: {
                                        scale: 1
                                    },
                                    transition: {
                                        delay: 0.6,
                                        type: 'spring'
                                    },
                                    children: currentEvent.player
                                }, void 0, false, {
                                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                                    lineNumber: 174,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/animations/RecordBreak.tsx",
                            lineNumber: 142,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent",
                            animate: {
                                opacity: [
                                    0.5,
                                    1,
                                    0.5
                                ]
                            },
                            transition: {
                                duration: 1.5,
                                repeat: Infinity
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/animations/RecordBreak.tsx",
                            lineNumber: 186,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/animations/RecordBreak.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/animations/RecordBreak.tsx",
            lineNumber: 113,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/animations/RecordBreak.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(RecordBreak, "B2XZpr67RuyVyzLLz6nG0kf5WzA=");
_c = RecordBreak;
var _c;
__turbopack_context__.k.register(_c, "RecordBreak");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/animations/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$Confetti$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/Confetti.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$GoalCelebration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/GoalCelebration.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$RecordBreak$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/RecordBreak.tsx [app-client] (ecmascript)");
'use client';
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/animations/Confetti.tsx [app-client] (ecmascript) <export default as Confetti>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Confetti",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$Confetti$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$Confetti$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/Confetti.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/animations/GoalCelebration.tsx [app-client] (ecmascript) <export default as GoalCelebration>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GoalCelebration",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$GoalCelebration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$GoalCelebration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/GoalCelebration.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/animations/RecordBreak.tsx [app-client] (ecmascript) <export default as RecordBreak>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecordBreak",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$RecordBreak$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$animations$2f$RecordBreak$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/animations/RecordBreak.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/OnboardingTutorial.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RestartOnboardingButton",
    ()=>RestartOnboardingButton,
    "default",
    ()=>OnboardingTutorial,
    "shouldShowOnboarding",
    ()=>shouldShowOnboarding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.js [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const ONBOARDING_STEPS = [
    {
        id: 1,
        title: 'Kadronu Tanı',
        description: 'Takımındaki oyuncuları incele! Her oyuncunun rating, pozisyon, yaş ve potansiyel değerleri var. Yıldız oyuncularını belirle ve kadro derinliğini kontrol et.',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
            size: 32,
            className: "text-blue-400"
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 22,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        action: 'Takımımı Gör',
        targetTab: 'tactics'
    },
    {
        id: 2,
        title: 'Transfer Yap',
        description: 'Transfer pazarından takımını güçlendir! Bütçene uygun oyuncuları bul, pazarlık yap ve kadronu eksi mevkilerle tamamla. Akıllı transferler şampiyonluk getirir.',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
            size: 32,
            className: "text-green-400"
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 31,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        action: 'Pazarı Aç',
        targetTab: 'multiplayer'
    },
    {
        id: 3,
        title: 'İlk Maçına Çık',
        description: 'Her şey hazır mı? Taktiklerini belirle, ilk 11\'i seç ve sahaya çık! Maç simülasyonu canlı olarak oynanır, taktik değişikliklerin skorun kaderini belirler.',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
            size: 32,
            className: "text-red-400"
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 40,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        action: 'Maç Günü',
        targetTab: 'matchday'
    },
    {
        id: 4,
        title: 'Ligde Yüksel',
        description: 'Süper Lig\'e çıkmak için her maç önemli! Fikstürü takip et, antrenmanlarla oyuncularını geliştir ve sezon sonunda şampiyonluk kupasını kaldır.',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
            size: 32,
            className: "text-amber-400"
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 49,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: 5,
        title: 'Tebrikler, Menajer!',
        description: 'Artık Siyah Beyaz FC\'nin teknik direktörüsün! Takımını yönet, genç yetenekleri keşfet, taktik değiştir ve efsane ol. İyi şanslar!',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-4xl",
            children: "🏆"
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 56,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function OnboardingTutorial({ onComplete, onDismiss, userId }) {
    _s();
    const [currentStep, setCurrentStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
    const isFirstStep = currentStep === 0;
    const handleNext = ()=>{
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep((prev)=>prev + 1);
        }
    };
    const handlePrev = ()=>{
        if (!isFirstStep) {
            setCurrentStep((prev)=>prev - 1);
        }
    };
    const handleComplete = ()=>{
        setIsVisible(false);
        // Supabase'e onboarding tamamlandığını kaydet
        try {
            const key = 'sbfc_onboarding_completed';
            localStorage.setItem(key, 'true');
            // Supabase'e de kaydet (mevcutsa)
            void (async ()=>{
                try {
                    const { getSupabase, isSupabaseConfigured } = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-client] (ecmascript, async loader)");
                    if (isSupabaseConfigured()) {
                        const supabase = getSupabase();
                        if (supabase && userId) {
                            await supabase.from('profiles').update({
                                onboarding_completed: true
                            }).eq('id', userId);
                            console.log('[Onboarding] Supabase\'e kaydedildi, userId:', userId);
                        }
                    }
                } catch (err) {
                    console.error('[Onboarding] Supabase kayıt hatası:', err);
                }
            })();
        } catch (err) {
            console.error('[Onboarding] localStorage hatası:', err);
        }
        setTimeout(()=>onComplete(), 300);
    };
    const handleActionClick = ()=>{
        setIsVisible(false);
        setTimeout(()=>onComplete(step.targetTab), 300);
    };
    if (!isVisible || !step) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4",
            onClick: (e)=>{
                if (e.target === e.currentTarget) onDismiss();
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    scale: 0.9,
                    opacity: 0,
                    y: 20
                },
                animate: {
                    scale: 1,
                    opacity: 1,
                    y: 0
                },
                exit: {
                    scale: 0.9,
                    opacity: 0,
                    y: 20
                },
                transition: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 300
                },
                className: "bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1 bg-white/5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "h-full bg-amber-500",
                            initial: {
                                width: 0
                            },
                            animate: {
                                width: `${(currentStep + 1) / ONBOARDING_STEPS.length * 100}%`
                            },
                            transition: {
                                duration: 0.3
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/OnboardingTutorial.tsx",
                            lineNumber: 147,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end p-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onDismiss,
                            className: "w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 14,
                                className: "text-white/50"
                            }, void 0, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 161,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/OnboardingTutorial.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-8 pb-6 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    scale: 0,
                                    rotate: -20
                                },
                                animate: {
                                    scale: 1,
                                    rotate: 0
                                },
                                transition: {
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 200,
                                    delay: 0.1
                                },
                                className: "w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6",
                                children: step.icon
                            }, `icon-${step.id}`, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 168,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2",
                                children: [
                                    "Adım ",
                                    step.id,
                                    " / ",
                                    ONBOARDING_STEPS.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 179,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h2, {
                                initial: {
                                    opacity: 0,
                                    y: 10
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.15
                                },
                                className: "text-xl font-black text-white uppercase tracking-tight mb-3",
                                children: step.title
                            }, `title-${step.id}`, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                initial: {
                                    opacity: 0,
                                    y: 10
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.2
                                },
                                className: "text-sm text-white/50 leading-relaxed mb-6",
                                children: step.description
                            }, `desc-${step.id}`, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            step.action && step.targetTab && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                initial: {
                                    opacity: 0,
                                    y: 10
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.25
                                },
                                onClick: handleActionClick,
                                className: "mb-4 px-6 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-500/20 transition-all",
                                children: step.action
                            }, `action-${step.id}`, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 207,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center gap-2 mb-4",
                                children: ONBOARDING_STEPS.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setCurrentStep(i),
                                        className: `w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-amber-500 w-6' : i < currentStep ? 'bg-amber-500/40' : 'bg-white/10'}`
                                    }, s.id, false, {
                                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 220,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handlePrev,
                                        disabled: isFirstStep,
                                        className: "flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors disabled:opacity-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                                lineNumber: 243,
                                                columnNumber: 17
                                            }, this),
                                            "Geri"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                        lineNumber: 238,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleNext,
                                        className: "flex items-center gap-1 px-6 py-2.5 bg-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 active:scale-95 transition-all",
                                        children: [
                                            isLastStep ? 'Başla!' : 'Devam',
                                            !isLastStep && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                                lineNumber: 252,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                                lineNumber: 237,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/OnboardingTutorial.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                lineNumber: 138,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/OnboardingTutorial.tsx",
            lineNumber: 129,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/OnboardingTutorial.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
_s(OnboardingTutorial, "MZAbNltVe8ocVBW3CrxKIliXOQw=");
_c = OnboardingTutorial;
async function shouldShowOnboarding(profileId) {
    try {
        // 1. Check localStorage first (fast)
        const completed = localStorage.getItem('sbfc_onboarding_completed');
        if (completed === 'true') return false;
        // 2. Check Supabase if profileId provided
        if (profileId) {
            try {
                const { getSupabase, isSupabaseConfigured } = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-client] (ecmascript, async loader)");
                if (isSupabaseConfigured()) {
                    const supabase = getSupabase();
                    if (supabase) {
                        const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', profileId).maybeSingle();
                        if (profile?.onboarding_completed === true) {
                            // Sync localStorage
                            localStorage.setItem('sbfc_onboarding_completed', 'true');
                            return false;
                        }
                    }
                }
            } catch (err) {
                console.warn('[shouldShowOnboarding] DB check failed:', err);
            }
        }
        return true;
    } catch  {
        return true;
    }
}
function RestartOnboardingButton({ onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/20 uppercase tracking-wider hover:text-amber-400 transition-colors",
        title: "Rehberi tekrar göster",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/OnboardingTutorial.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this),
            "Rehber"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/OnboardingTutorial.tsx",
        lineNumber: 307,
        columnNumber: 5
    }, this);
}
_c1 = RestartOnboardingButton;
var _c, _c1;
__turbopack_context__.k.register(_c, "OnboardingTutorial");
__turbopack_context__.k.register(_c1, "RestartOnboardingButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hints/HintBox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HintBox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const HINTS_POOL = [
    {
        id: 'hint-transfer-corr',
        category: 'Transfer',
        text: 'Transfer pazarında fiyat koridorları var. Piyasa değerinin çok altında veya üstünde teklif yapamazsın!'
    },
    {
        id: 'hint-scout',
        category: 'Keşif',
        text: 'Gözlemci işe almak 500.000 € ile 15.000.000 € arasında değişir. Seviyesi yükseldikçe daha detaylı arama yapabilirsin!'
    },
    {
        id: 'hint-training',
        category: 'Antrenman',
        text: 'Genç oyuncular (22 yaş altı) antrenmandan daha çok gelişir. Onlara şans ver!'
    },
    {
        id: 'hint-tactics',
        category: 'Taktik',
        text: 'Mentality ayarın maç sonucunu etkiler. Hücum daha çok gol ama daha çok yersin!'
    },
    {
        id: 'hint-stamina',
        category: 'Form',
        text: 'Form ratingi düşük oyuncular maçta daha az katkı sağlar. Antrenmanla formu yükselt!'
    },
    {
        id: 'hint-sell-tax',
        category: 'Finans',
        text: 'Oyuncu sattığında %2.5 transfer vergisi kesilir. Net kârını iyi hesapla!'
    },
    {
        id: 'hint-formation',
        category: 'Taktik',
        text: '4-3-3 hücum, 5-3-2 savunma için ideal. Rakibin gücüne göre formasyon değiştir!'
    },
    {
        id: 'hint-youth',
        category: 'Altyapı',
        text: 'Gençlik Akademisi her hafta yeni yetenekler üretebilir. Tesisleri yükseltme fırsatını kaçıma!'
    },
    {
        id: 'hint-pressing',
        category: 'Taktik',
        text: 'Tam saha pres topu daha çabuk kazandır ama staminaları hızla düşer. İkinci yarıda yorulursun!'
    },
    {
        id: 'hint-fixture',
        category: 'Fikstür',
        text: 'Fikstür sayfasından yaklaşan maçlarını takip et. Hazırlıklı olmak her zaman avantaj!'
    },
    {
        id: 'hint-market-value',
        category: 'Pazar',
        text: 'Oyuncuların piyasa değeri yaş, rating ve potansiyeline göre hesaplanır. Yıldızları erken yakala!'
    },
    {
        id: 'hint-friendly',
        category: 'Maç',
        text: 'Hazırlık maçlarını "Hazırlık Maçı" sekmesinden yapabilirsin. Ücretsiz veya öncelikli kuyruk seçenekleri var!'
    },
    {
        id: 'hint-traits',
        category: 'Oyuncu',
        text: 'Her oyuncunun özellikleri (traits) farklıdır. Bir "finisher" ile "playmaker" aynı şekilde kullanılmaz!'
    },
    {
        id: 'hint-position',
        category: 'Kadro',
        text: 'Oyuncular kendi pozisyonlarında daha iyi performans gösterir. Sol bek oynatan sağ kanat bekleneni vermez!'
    },
    {
        id: 'hint-cup',
        category: 'Kupa',
        text: 'Kupa maçları eleme usulü oynanır! Üst turlara yükseldikçe ödül ve kupa geliri artar. Kupalar sekmesinden takip et.'
    },
    {
        id: 'hint-sound',
        category: 'Ayarlar',
        text: 'Sağ alttaki ses butonundan gol ve kart ses efektlerini açabilirsin. Maçları daha heyecanlı yapar!'
    },
    {
        id: 'hint-wages',
        category: 'Finans',
        text: 'Haftalık gelir-gider dengeni iyi yönet. Sponsorluk ve TV gelirleri maaş giderlerini karşılamalı!'
    },
    {
        id: 'hint-sponsor',
        category: 'Finans',
        text: 'Sponsor anlaşmaları düzenli gelir sağlar. Stadyum tesislerini yükselttikçe daha iyi sponsor gelir!'
    },
    {
        id: 'hint-stadium',
        category: 'Yerleşke',
        text: 'Stadyum tesisleri maç performansını etkiler! Çim kalitesi pas isabetini, ısıtma kış kondisyonunu artırır.'
    },
    {
        id: 'hint-roles',
        category: 'Taktik',
        text: 'Oyunculara rol ata (Oyun Kurucu, Bitirici vb.). Rol uyumu taktik skorunu yükseltir!'
    },
    {
        id: 'hint-injury',
        category: 'Sağlık',
        text: 'Antrenman yoğunluğu arttıkça sakatlık riski de artar. Fizyoterapist işe alarak tedavi süresini kısalt!'
    }
];
const STORAGE_KEY = 'sbfc_hints_dismissed';
const HINT_INTERVAL_KEY = 'sbfc_hint_last_shown';
const DISMISS_DURATION = 5 * 60 * 1000; // 5 dakika sonra tekrar göster
function getDismissedIds() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw));
    } catch  {
        return new Set();
    }
}
function addDismissedId(id) {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const dismissed = getDismissedIds();
        dismissed.add(id);
        // En fazla 50 tut
        const arr = Array.from(dismissed).slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (err) {
        console.error('[HintBox] addDismissedId error:', err);
    }
}
function shouldShowHint() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const lastShown = localStorage.getItem(HINT_INTERVAL_KEY);
        if (!lastShown) return true;
        const elapsed = Date.now() - Number(lastShown);
        return elapsed >= DISMISS_DURATION;
    } catch  {
        return true;
    }
}
function markHintShown() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem(HINT_INTERVAL_KEY, String(Date.now()));
    } catch (err) {
        console.error('[HintBox] markHintShown error:', err);
    }
}
function getRandomHint(excludeId) {
    const dismissed = getDismissedIds();
    const available = HINTS_POOL.filter((h)=>!dismissed.has(h.id) && h.id !== excludeId);
    // Tüm ipuçları kapatıldıysa listeyi sıfırla
    if (available.length === 0) {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error('[HintBox] Reset dismissed error:', err);
        }
        const pool = HINTS_POOL.filter((h)=>h.id !== excludeId);
        return pool[Math.floor(Math.random() * pool.length)] ?? HINTS_POOL[0];
    }
    return available[Math.floor(Math.random() * available.length)];
}
const CATEGORY_COLORS = {
    'Transfer': 'text-green-400',
    'Keşif': 'text-purple-400',
    'Antrenman': 'text-blue-400',
    'Taktik': 'text-amber-400',
    'Form': 'text-emerald-400',
    'Finans': 'text-yellow-400',
    'Kadro': 'text-cyan-400',
    'Kupa': 'text-red-400',
    'Ayarlar': 'text-white/40',
    'Oyuncu': 'text-pink-400',
    'Pazar': 'text-orange-400',
    'Maç': 'text-red-300',
    'Altyapı': 'text-lime-400',
    'Fikstür': 'text-indigo-400',
    'Yerleşke': 'text-teal-400',
    'Sağlık': 'text-rose-400'
};
function HintBox() {
    _s();
    const [hint, setHint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const loadNewHint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HintBox.useCallback[loadNewHint]": ()=>{
            try {
                const newHint = getRandomHint(hint?.id);
                setHint(newHint);
                setShow(true);
                markHintShown();
            } catch (err) {
                console.error('[HintBox] loadNewHint error:', err);
            }
        }
    }["HintBox.useCallback[loadNewHint]"], [
        hint?.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HintBox.useEffect": ()=>{
            // İlk yükleme — gösterme koşulu sağlanıyorsa göster
            if (shouldShowHint()) {
                loadNewHint();
            }
        }
    }["HintBox.useEffect"], [
        loadNewHint
    ]);
    const handleDismiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HintBox.useCallback[handleDismiss]": ()=>{
            try {
                setShow(false);
                if (hint) {
                    addDismissedId(hint.id);
                }
            } catch (err) {
                console.error('[HintBox] handleDismiss error:', err);
                setShow(false);
            }
        }
    }["HintBox.useCallback[handleDismiss]"], [
        hint
    ]);
    const handleNext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HintBox.useCallback[handleNext]": ()=>{
            try {
                if (hint) {
                    addDismissedId(hint.id);
                }
                loadNewHint();
            } catch (err) {
                console.error('[HintBox] handleNext error:', err);
            }
        }
    }["HintBox.useCallback[handleNext]"], [
        hint,
        loadNewHint
    ]);
    if (!show || !hint) return null;
    const categoryColor = CATEGORY_COLORS[hint.category] ?? 'text-white/40';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: show && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                y: 20,
                x: 20
            },
            animate: {
                opacity: 1,
                y: 0,
                x: 0
            },
            exit: {
                opacity: 0,
                y: 10,
                x: 20
            },
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 200
            },
            className: "fixed bottom-20 right-4 lg:bottom-16 z-40 max-w-[320px]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-zinc-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDismiss,
                        className: "absolute top-2 right-2 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 10,
                            className: "text-white/40"
                        }, void 0, false, {
                            fileName: "[project]/src/components/hints/HintBox.tsx",
                            lineNumber: 195,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/hints/HintBox.tsx",
                        lineNumber: 191,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
                                size: 14,
                                className: "text-amber-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/hints/HintBox.tsx",
                                lineNumber: 200,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-[9px] font-black uppercase tracking-widest ${categoryColor}`,
                                children: hint.category
                            }, void 0, false, {
                                fileName: "[project]/src/components/hints/HintBox.tsx",
                                lineNumber: 201,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/hints/HintBox.tsx",
                        lineNumber: 199,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-white/60 leading-relaxed pr-4",
                        children: hint.text
                    }, void 0, false, {
                        fileName: "[project]/src/components/hints/HintBox.tsx",
                        lineNumber: 207,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleNext,
                        className: "mt-3 flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase tracking-wider hover:text-amber-400 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/src/components/hints/HintBox.tsx",
                                lineNumber: 216,
                                columnNumber: 15
                            }, this),
                            "Başka ipucu"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/hints/HintBox.tsx",
                        lineNumber: 212,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hints/HintBox.tsx",
                lineNumber: 189,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/hints/HintBox.tsx",
            lineNumber: 182,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/hints/HintBox.tsx",
        lineNumber: 180,
        columnNumber: 5
    }, this);
}
_s(HintBox, "/t2LbQ7mwLVQO01Gr689JbhuLHM=");
_c = HintBox;
var _c;
__turbopack_context__.k.register(_c, "HintBox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_c14ceb24._.js.map