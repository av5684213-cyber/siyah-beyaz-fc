(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/ScoutingTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScoutingTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ban$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ban.js [app-client] (ecmascript) <export default as Ban>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ui-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const getDefaultFilters = ()=>({
        name: '',
        position: '',
        ageMin: 0,
        ageMax: 0,
        ovrMin: 0,
        ovrMax: 0,
        rarity: '',
        archetypes: [],
        Klt: 0,
        Klc: 0,
        Sav: 0,
        Pas: 0,
        Sut: 0,
        Kfa: 0,
        Hiz: 0,
        Guc: 0,
        Alg: 0,
        Top: 0,
        Tplm: 0
    });
// ─── Scout Level Descriptors ──────────────────────────────────────
const SCOUT_LEVEL_INFO = {
    1: {
        label: 'Temel Arama',
        desc: 'İsim, pozisyon, yaş',
        color: 'text-white/40'
    },
    2: {
        label: 'Genişletilmiş',
        desc: '+ OVR aralığı, nadirlik filtreleri',
        color: 'text-amber-400'
    },
    3: {
        label: 'Detaylı Arama',
        desc: '+ Arketip, yetenekler',
        color: 'text-emerald-400'
    }
};
// ─── Archetype Options (from playerGenerator.ts traitBoosts) ──────
const ARCHETYPE_OPTIONS = [
    // Kaleci
    'Refleks canavarı',
    'Güvenli eller',
    '1v1 ustası',
    'Hava hakimiyeti',
    // Defans
    'Kale gibi',
    'Lider stoper',
    'Topla çıkan stoper',
    'Hızlı stoper',
    'Markajcı',
    'Gölge Markajcı',
    'Kanat bekçisi',
    'Uzun pas ustası',
    'Süpürücü (libero)',
    'Top saklayan',
    // Orta Saha
    'Pres ustası',
    'Tempo kontrolcüsü',
    'Regista',
    'Oyun Bozan',
    'Oyun kurucu',
    'Box-to-box',
    'Top dağıtıcı',
    'Uzaktan şutçu',
    'Pas arası ustası',
    '10 numara',
    'Boşluk bulucu',
    'Oyun görüşü yüksek',
    'Koşu ustası',
    // Forvet
    'Hızlı forvet',
    'Boşluk avcısı',
    'Kontra canavarı',
    'Bitirici',
    'Sahte 9',
    'Pozisyoncu',
    'Fırsatçı',
    'Gol makinesi',
    'Fiziksel santrafor',
    'Kafacı (forvet)'
];
// ─── Archetype Multi-Select Component ─────────────────────────────
function ArchetypeMultiSelect({ selected, onChange, scoutLevel }) {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleArchetype = (name)=>{
        if (selected.includes(name)) {
            onChange(selected.filter((a)=>a !== name));
        } else {
            onChange([
                ...selected,
                name
            ]);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1.5 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                children: "Arketip"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>{
                    if (scoutLevel >= 3) setIsOpen(!isOpen);
                },
                className: `w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all flex items-center justify-between ${scoutLevel < 3 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.07]'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: selected.length > 0 ? 'text-white' : 'text-white/30',
                        children: selected.length > 0 ? `${selected.length} arketip seçili` : 'Arketip Seç'
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        size: 14,
                        className: `text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isOpen && scoutLevel >= 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: -4
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        y: -4
                    },
                    transition: {
                        duration: 0.15
                    },
                    className: "absolute z-50 top-full mt-1 left-0 right-0 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 space-y-0.5",
                        children: [
                            selected.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onChange([]),
                                className: "w-full text-left px-2 py-1.5 text-[9px] font-bold text-red-400/60 uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors",
                                children: "Seçimleri Temizle"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 121,
                                columnNumber: 17
                            }, this),
                            ARCHETYPE_OPTIONS.map((name)=>{
                                const isSelected = selected.includes(name);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>toggleArchetype(name),
                                    className: `w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSelected ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`,
                                            children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                size: 10,
                                                className: "text-black"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 147,
                                                columnNumber: 38
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 142,
                                            columnNumber: 21
                                        }, this),
                                        name
                                    ]
                                }, name, true, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 132,
                                    columnNumber: 19
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 119,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                    lineNumber: 112,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
_s(ArchetypeMultiSelect, "+sus0Lb0ewKHdwiUhiTAJFoFyQ0=");
_c = ArchetypeMultiSelect;
function ScoutingTab({ onPlayerClick, isAdmin }) {
    _s1();
    const { profile, setProfile, squad, trainingState, setTrainingState, setSelectedTeamProfile, watchlist, toggleWatchlist, league, setActiveTab } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const scouting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ScoutingTab.useMemo[scouting]": ()=>trainingState?.scouting || {
                scouts: [],
                foundPlayersPool: [],
                history: [],
                watchlist: []
            }
    }["ScoutingTab.useMemo[scouting]"], [
        trainingState?.scouting
    ]);
    const [showRecruitModal, setShowRecruitModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedScoutSlot, setSelectedScoutSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [advancedFilters, setAdvancedFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(getDefaultFilters());
    const [advancedResults, setAdvancedResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [watchlistPlayers, setWatchlistPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // ── Determine active scout count from multiple sources ──
    const [staffScoutCount, setStaffScoutCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ScoutingTab.useEffect": ()=>{
            // Supabase staff tablosundan aktif gözlemci sayısını çek
            const fetchStaffScouts = {
                "ScoutingTab.useEffect.fetchStaffScouts": async ()=>{
                    if (!profile?.id || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    if (!supabase) return;
                    try {
                        // staff tablosu user_id kullanır (profile_id değil)
                        const { count } = await supabase.from('staff').select('*', {
                            count: 'exact',
                            head: true
                        }).eq('user_id', profile.id).eq('type', 'scout');
                        if (count && count > 0) setStaffScoutCount(count);
                    } catch  {
                    // Tablo yoksa sessizce devam et
                    }
                }
            }["ScoutingTab.useEffect.fetchStaffScouts"];
            fetchStaffScouts();
        }
    }["ScoutingTab.useEffect"], [
        profile?.id
    ]);
    // En yüksek değeri al: profile.scout_slots, yerel scouting.scouts, veya staff tablosu
    const activeScoutSlots = Math.max(profile?.scout_slots ?? 0, scouting.scouts.length ?? 0, staffScoutCount);
    const scoutLevel = Math.min(3, activeScoutSlots); // 1-3
    // Fetch watchlist details
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ScoutingTab.useEffect": ()=>{
            const fetchWatchlistDetails = {
                "ScoutingTab.useEffect.fetchWatchlistDetails": async ()=>{
                    if (watchlist?.length > 0) {
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                            const { data } = await supabase.from('players').select('*').in('id', watchlist);
                            if (data && data.length > 0) {
                                setWatchlistPlayers(data.map({
                                    "ScoutingTab.useEffect.fetchWatchlistDetails": (p)=>({
                                            ...p,
                                            rating: p.rating ?? p.klt ?? 60,
                                            potential: p.potential ?? p.klt ?? 70,
                                            passing: p.passing ?? p.pas ?? 50,
                                            shooting: p.shooting ?? p.sut ?? 50,
                                            defending: p.defending ?? p.tk ?? 50,
                                            speed: p.speed ?? p.hiz ?? 50,
                                            power: p.power ?? p.guc ?? 50,
                                            vision: p.vision ?? p.alg ?? 50,
                                            control: p.control ?? p.top ?? 50
                                        })
                                }["ScoutingTab.useEffect.fetchWatchlistDetails"]));
                                return;
                            }
                        }
                        const squadPlayers = Array.isArray(squad) ? squad : [];
                        const leaguePlayers = Array.isArray(league) ? league : [];
                        const allPossiblePlayers = [
                            ...squadPlayers,
                            ...leaguePlayers,
                            ...scouting.foundPlayersPool || [],
                            ...scouting.history || [],
                            ...advancedResults
                        ];
                        const uniquePool = Array.from(new Map(allPossiblePlayers.map({
                            "ScoutingTab.useEffect.fetchWatchlistDetails.uniquePool": (p)=>[
                                    p.id,
                                    p
                                ]
                        }["ScoutingTab.useEffect.fetchWatchlistDetails.uniquePool"])).values());
                        const matching = uniquePool.filter({
                            "ScoutingTab.useEffect.fetchWatchlistDetails.matching": (p)=>watchlist.includes(p.id)
                        }["ScoutingTab.useEffect.fetchWatchlistDetails.matching"]);
                        setWatchlistPlayers(matching);
                    } else {
                        setWatchlistPlayers([]);
                    }
                }
            }["ScoutingTab.useEffect.fetchWatchlistDetails"];
            fetchWatchlistDetails();
        }
    }["ScoutingTab.useEffect"], [
        watchlist,
        league,
        scouting.foundPlayersPool,
        scouting.history,
        advancedResults,
        scouting,
        squad
    ]);
    const [userTier, setUserTier] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(4);
    // Fetch user tier 
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ScoutingTab.useEffect": ()=>{
            async function fetchTier() {
                if (!profile?.id) return;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    const { data: teamData } = await supabase.from('league_teams').select('league_id').eq('profile_id', profile.id).single();
                    if (teamData) {
                        const { data: leagueData } = await supabase.from('leagues').select('tier').eq('id', teamData.league_id).single();
                        if (leagueData) setUserTier(leagueData.tier);
                    }
                }
            }
            fetchTier();
        }
    }["ScoutingTab.useEffect"], [
        profile?.id
    ]);
    const continents = [
        {
            id: 'EUROPE',
            name: 'AVRUPA',
            icon: '🌍',
            minStars: 1,
            duration: 3
        },
        {
            id: 'SOUTH_AMERICA',
            name: 'GÜNEY AMERİKA',
            icon: '🌎',
            minStars: 3,
            duration: 5
        },
        {
            id: 'AFRICA',
            name: 'AFRİKA',
            icon: '🌍',
            minStars: 2,
            duration: 4
        },
        {
            id: 'ASIA',
            name: 'ASYA',
            icon: '🌏',
            minStars: 2,
            duration: 4
        },
        {
            id: 'NORTH_AMERICA',
            name: 'KUZEY AMERİKA',
            icon: '🌎',
            minStars: 3,
            duration: 5
        }
    ];
    const scoutPrices = [
        {
            stars: 1,
            minTier: 4,
            price: 500000,
            name: 'Çırak Gözlemci'
        },
        {
            stars: 2,
            minTier: 3,
            price: 1500000,
            name: 'Deneyimli Gözlemci'
        },
        {
            stars: 3,
            minTier: 2,
            price: 3500000,
            name: 'Uzman Gözlemci'
        },
        {
            stars: 4,
            minTier: 1,
            price: 7500000,
            name: 'Elit Gözlemci'
        },
        {
            stars: 5,
            minTier: 1,
            price: 15000000,
            name: 'Efsanevi Gözlemci'
        }
    ];
    const handleHireScout = (stars, price, minTier)=>{
        if (userTier > minTier) {
            alert(`Bu gözlemciyi işe almak için ${minTier}. Lig'de olmalısınız! Şu an ${userTier}. Lig'desiniz.`);
            return;
        }
        if (!profile || profile.money < price) {
            alert('Yetersiz bütçe!');
            return;
        }
        const newScout = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Gözlemci #${scouting.scouts.length + 1}`,
            stars,
            status: 'IDLE',
            remainingDays: 0
        };
        const newScouting = {
            ...scouting,
            scouts: [
                ...scouting.scouts,
                newScout
            ]
        };
        // Update profile scout_slots count
        const newScoutSlots = (profile.scout_slots ?? scouting.scouts.length) + 1;
        setProfile({
            ...profile,
            money: profile.money - price,
            scout_slots: newScoutSlots
        });
        setTrainingState({
            ...trainingState,
            scouting: newScouting
        });
        setShowRecruitModal(false);
    };
    const handleSendScout = (scoutId, continentId)=>{
        const continent = continents.find((c)=>c.id === continentId);
        const scout = scouting.scouts.find((s)=>s.id === scoutId);
        if (!continent || !scout) return;
        const newScouting = {
            ...scouting,
            scouts: scouting.scouts.map((s)=>s.id === scoutId ? {
                    ...s,
                    status: 'SCOUTING',
                    location: continent.name,
                    remainingDays: continent.duration
                } : s)
        };
        setTrainingState({
            ...trainingState,
            scouting: newScouting
        });
        setSelectedContinentId(null);
    };
    const [selectedContinentId, setSelectedContinentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Arama hatası mesajı state'i
    const [searchError, setSearchError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleAdvancedSearch = async ()=>{
        if (!profile) return;
        // ── CHECK: Must have at least 1 scout slot ──
        if (activeScoutSlots < 1) {
            setSearchError('Gözlemciniz bulunmuyor. Personel sekmesinden gözlemci satın alabilirsiniz.');
            return;
        }
        setIsSearching(true);
        setSearchError('');
        try {
            const isConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])();
            if (!isConfigured) {
                setSearchError('Supabase yapılandırılmamış. Bu özellik şu an kullanılamıyor.');
                setIsSearching(false);
                return;
            }
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            if (!supabase) {
                setSearchError('Supabase bağlantısı kurulamadı.');
                setIsSearching(false);
                return;
            }
            // ── TÜM OYUNCULARI ARAYAN SORGU ──
            let query = supabase.from('players').select('*');
            // ── LEVEL 1: Basic filters (name, position, age) — always available ──
            if (advancedFilters.name && advancedFilters.name.trim().length > 0) {
                query = query.ilike('name', `%${advancedFilters.name.trim()}%`);
            }
            if (advancedFilters.position && advancedFilters.position.trim().length > 0) {
                query = query.eq('position', advancedFilters.position.toUpperCase());
            }
            if (advancedFilters.ageMin > 0) {
                query = query.gte('age', advancedFilters.ageMin);
            }
            if (advancedFilters.ageMax > 0) {
                query = query.lte('age', advancedFilters.ageMax);
            }
            // ── LEVEL 2: OVR range, rarity — requires 2+ scouts ──
            if (scoutLevel >= 2) {
                if (advancedFilters.ovrMin > 0) query = query.gte('rating', advancedFilters.ovrMin);
                if (advancedFilters.ovrMax > 0) query = query.lte('rating', advancedFilters.ovrMax);
            }
            // ── LEVEL 2: Detailed stat filters ──
            if (scoutLevel >= 2) {
                if (advancedFilters.Klt > 0) query = query.gte('rating', advancedFilters.Klt);
                if (advancedFilters.Klc > 0) query = query.gte('klc', advancedFilters.Klc);
                if (advancedFilters.Sav > 0) query = query.gte('tk', advancedFilters.Sav);
                if (advancedFilters.Pas > 0) query = query.gte('pas', advancedFilters.Pas);
                if (advancedFilters.Sut > 0) query = query.gte('sut', advancedFilters.Sut);
                if (advancedFilters.Kfa > 0) query = query.gte('kfa', advancedFilters.Kfa);
                if (advancedFilters.Hiz > 0) query = query.gte('hiz', advancedFilters.Hiz);
                if (advancedFilters.Guc > 0) query = query.gte('guc', advancedFilters.Guc);
                if (advancedFilters.Alg > 0) query = query.gte('alg', advancedFilters.Alg);
                if (advancedFilters.Top > 0) query = query.gte('top', advancedFilters.Top);
            }
            query = query.order('rating', {
                ascending: false
            }).limit(2000);
            const { data, error } = await query;
            if (error) throw error;
            if (!data || data.length === 0) {
                setAdvancedResults([]);
                setSearchError('Hiç oyuncu bulunamadı. Filtrelerinizi genişletmeyi deneyin.');
                return;
            }
            const results = data.filter((p)=>{
                const kltValue = p.rating ?? p.klt ?? 0;
                const klcValue = p.goalkeeping ?? p.klc ?? 0;
                const savValue = p.defending ?? p.tk ?? 0;
                const pasValue = p.passing ?? p.pas ?? 0;
                const sutValue = p.shooting ?? p.sut ?? 0;
                const kfaValue = p.heading ?? p.kfa ?? 0;
                const hizValue = p.speed ?? p.hiz ?? 0;
                const gucValue = p.power ?? p.guc ?? 0;
                const algValue = p.vision ?? p.alg ?? 0;
                const topValue = p.control ?? p.top ?? 0;
                const total = kltValue + klcValue + savValue + pasValue + sutValue + kfaValue + hizValue + gucValue + algValue + topValue;
                if (advancedFilters.Tplm > 0 && total < advancedFilters.Tplm) return false;
                // ── LEVEL 3: Archetype filter (multi-select OR logic) ──
                if (scoutLevel >= 3 && advancedFilters.archetypes && advancedFilters.archetypes.length > 0) {
                    const archetypeId = p.archetype_id ?? '';
                    const playerArchetype = p.archetype ?? p.play_style ?? '';
                    const matchesAny = advancedFilters.archetypes.some((a)=>{
                        // First try archetype_id if available
                        if (archetypeId && archetypeId.toLowerCase() === a.toLowerCase()) return true;
                        // Then exact case-insensitive match on archetype/play_style
                        return playerArchetype.toLowerCase() === a.toLowerCase();
                    });
                    if (!matchesAny) return false;
                }
                // ── LEVEL 2: Rarity filter ──
                if (scoutLevel >= 2 && advancedFilters.rarity && advancedFilters.rarity !== 'all') {
                    const ratingVal = p.rating ?? p.klt ?? 60;
                    const rarityMap = {
                        'common': [
                            0,
                            64
                        ],
                        'uncommon': [
                            65,
                            74
                        ],
                        'rare': [
                            75,
                            84
                        ],
                        'epic': [
                            85,
                            89
                        ],
                        'legendary': [
                            90,
                            100
                        ]
                    };
                    const range = rarityMap[advancedFilters.rarity];
                    if (range && (ratingVal < range[0] || ratingVal > range[1])) return false;
                }
                return true;
            });
            // Sort results
            results.sort((a, b)=>(b.rating || b.klt) - (a.rating || a.klt));
            const limitedResults = results.slice(0, 50).map((p)=>{
                const ratingVal = p.rating ?? p.klt ?? 60;
                const passingVal = p.passing ?? p.pas ?? 50;
                const shootingVal = p.shooting ?? p.sut ?? 50;
                const defendingVal = p.defending ?? p.tk ?? 50;
                const speedVal = p.speed ?? p.hiz ?? 50;
                const powerVal = p.power ?? p.guc ?? 50;
                const visionVal = p.vision ?? p.alg ?? 50;
                const controlVal = p.control ?? p.top ?? 50;
                const headingVal = p.heading ?? p.kfa ?? 50;
                const goalkeepingVal = p.goalkeeping ?? p.klc ?? 10;
                const resolvedTeamName = p.team_name || 'Serbest';
                return {
                    ...p,
                    scouted: true,
                    team_name: resolvedTeamName,
                    rating: ratingVal,
                    klt: ratingVal,
                    passing: passingVal,
                    pas: passingVal,
                    shooting: shootingVal,
                    sut: shootingVal,
                    defending: defendingVal,
                    tk: defendingVal,
                    speed: speedVal,
                    hiz: speedVal,
                    power: powerVal,
                    guc: powerVal,
                    vision: visionVal,
                    alg: visionVal,
                    control: controlVal,
                    top: controlVal,
                    heading: headingVal,
                    kfa: headingVal,
                    goalkeeping: goalkeepingVal,
                    klc: goalkeepingVal
                };
            });
            setAdvancedResults(limitedResults);
            if (limitedResults.length === 0) {
                setSearchError('Kriterlerinize uygun oyuncu bulunamadı. Filtre değerlerini düşürmeyi deneyin.');
            }
        } catch (e) {
            console.error('Advanced Search Error:', e);
            setSearchError('Arama sırasında bir hata oluştu: ' + (e instanceof Error ? e.message : 'Bilinmeyen hata'));
        } finally{
            setIsSearching(false);
        }
    };
    const idleScouts = scouting.scouts.filter((s)=>s.status === 'IDLE');
    const handleDismissPlayer = (playerId)=>{
        const player = scouting.foundPlayersPool.find((p)=>p.id === playerId);
        const newScouting = {
            ...scouting,
            foundPlayersPool: scouting.foundPlayersPool.filter((p)=>p.id !== playerId),
            history: player ? [
                player,
                ...scouting.history || []
            ].slice(0, 20) : scouting.history
        };
        setTrainingState({
            ...trainingState,
            scouting: newScouting
        });
    };
    // ── Helper: Get rarity label from rating ──
    const getRarityFromRating = (rating)=>{
        if (rating >= 90) return {
            label: 'Efsanevi',
            color: 'text-amber-400'
        };
        if (rating >= 85) return {
            label: 'Epik',
            color: 'text-purple-400'
        };
        if (rating >= 75) return {
            label: 'Nadir',
            color: 'text-blue-400'
        };
        if (rating >= 65) return {
            label: 'Sıra Dışı',
            color: 'text-emerald-400'
        };
        return {
            label: 'Yaygın',
            color: 'text-white/40'
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        className: "space-y-6 pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-3xl font-black italic uppercase tracking-tighter text-white",
                                children: "Gözlemcilik Ağı"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 554,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-white/30 uppercase tracking-[0.4em] mt-1",
                                children: "Yetenek Avı ve Keşif"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 555,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 553,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 py-2 bg-black/40 border border-white/10 rounded-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/20 uppercase block leading-none mb-1",
                                        children: "Bütçe"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 559,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-mono font-bold text-emerald-400 leading-none",
                                        children: [
                                            "€",
                                            (profile?.money || 0).toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 560,
                                        columnNumber: 14
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 558,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 py-2 bg-black/40 border border-white/10 rounded-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/20 uppercase block leading-none mb-1",
                                        children: "Gözlemci"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 565,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-sm font-mono font-bold leading-none ${activeScoutSlots > 0 ? 'text-amber-400' : 'text-red-400'}`,
                                        children: [
                                            activeScoutSlots,
                                            "/3"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 566,
                                        columnNumber: 14
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 564,
                                columnNumber: 12
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 557,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 552,
                columnNumber: 7
            }, this),
            activeScoutSlots < 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: -10
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ban$3e$__["Ban"], {
                            size: 28,
                            className: "text-red-400"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                            lineNumber: 581,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 580,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-black uppercase tracking-wider text-red-400 mb-1",
                                children: "Gözlemci Yok"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 584,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-300/70 leading-relaxed",
                                children: [
                                    "Gözlemciniz bulunmuyor. Yerleşke ",
                                    '>',
                                    " Personel sekmesinden gözlemci satın alabilirsiniz."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 585,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('stadium'),
                                className: "inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        size: 12
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 592,
                                        columnNumber: 15
                                    }, this),
                                    "Yerleşke Sekmesine Git"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 588,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 583,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 575,
                columnNumber: 9
            }, this),
            activeScoutSlots > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white/5 border border-white/5 rounded-[2rem] p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                size: 16,
                                className: "text-white/40"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 603,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-black uppercase tracking-wider text-white/70",
                                children: "Arama Yetkinliği"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 604,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 602,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-3",
                        children: [
                            1,
                            2,
                            3
                        ].map((level)=>{
                            const info = SCOUT_LEVEL_INFO[level];
                            const isActive = scoutLevel >= level;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `p-4 rounded-2xl border transition-all ${isActive ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.02] border-white/5 opacity-40'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-lg font-black ${isActive ? 'text-amber-400' : 'text-white/20'}`,
                                                children: level
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 620,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-0.5",
                                                children: [
                                                    ...Array(level)
                                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                        size: 8,
                                                        className: isActive ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 623,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 621,
                                                columnNumber: 21
                                            }, this),
                                            !isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                size: 10,
                                                className: "text-white/20 ml-auto"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 626,
                                                columnNumber: 35
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 619,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-[10px] font-black uppercase tracking-widest ${isActive ? info.color : 'text-white/20'}`,
                                        children: info.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 628,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5",
                                        children: info.desc
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 631,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, level, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 611,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 606,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 601,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "group",
                open: activeScoutSlots > 0,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "cursor-pointer flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 hover:bg-white/[0.07] transition-all list-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "text-white/40",
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 645,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-black uppercase tracking-wider text-white/70",
                                                children: "Gözlemci Slotları"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 647,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-bold text-white/20 uppercase tracking-widest",
                                                children: activeScoutSlots > 0 ? `${activeScoutSlots}/3 aktif — Seviye ${scoutLevel} arama` : 'Gözlemci yok — Arama devre dışı'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 648,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 646,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 644,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 14,
                                className: "text-white/20 group-open:rotate-90 transition-transform"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 655,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 643,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: scouting.scouts.length > 0 ? scouting.scouts.map((scout)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white/5 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col min-h-[160px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-start mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-base font-black italic uppercase tracking-tighter text-white",
                                                        children: scout.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 662,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-1 mt-1",
                                                        children: [
                                                            ...Array(scout.stars)
                                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                size: 10,
                                                                className: "text-amber-400 fill-amber-400"
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 661,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${scout.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500 animate-pulse'}`,
                                                children: scout.status === 'IDLE' ? 'BOŞTA' : 'GÖREVDE'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 669,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 660,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 flex flex-col justify-center",
                                        children: scout.status === 'IDLE' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center space-y-1 opacity-40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                    className: "mx-auto",
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 678,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] font-black uppercase tracking-widest",
                                                    children: "Görev bekliyor"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 679,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 677,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                                    className: "mx-auto text-amber-500/40",
                                                    size: 24
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 683,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[8px] font-black uppercase tracking-widest text-white/40",
                                                            children: scout.location
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 685,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-base font-mono font-bold text-white tracking-widest",
                                                            children: [
                                                                scout.remainingDays,
                                                                " GÜN"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 686,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 684,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 682,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 675,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, scout.id, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 659,
                                columnNumber: 15
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-full text-center py-8 text-white/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 24,
                                    className: "mx-auto mb-2 opacity-40"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 694,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[9px] font-black uppercase tracking-widest",
                                    children: "Henüz gözlemci yok — Personel sekmesinden işe alabilirsiniz"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 695,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                            lineNumber: 693,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 657,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 642,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-black italic uppercase tracking-tighter text-white",
                                        children: "Advanced Search & Keşif Merkezi"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 705,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1",
                                        children: "Oyuncu Özelliklerine Göre Detaylı Arama"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 706,
                                        columnNumber: 16
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 704,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-2 px-4 py-2 rounded-full ${activeScoutSlots < 1 ? 'bg-red-500/10 border border-red-500/20' : scoutLevel === 3 ? 'bg-emerald-500/10 border border-emerald-500/20' : scoutLevel === 2 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/10'}`,
                                children: activeScoutSlots < 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ban$3e$__["Ban"], {
                                            size: 12,
                                            className: "text-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 719,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black text-red-500",
                                            children: "GÖZLEMCİ GEREKLİ"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 720,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                            size: 12,
                                            className: scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 724,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-[10px] font-black ${scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'}`,
                                            children: [
                                                "SEVİYE ",
                                                scoutLevel,
                                                " ARAMA"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 725,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 708,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 703,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-black text-white",
                                            children: "1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 737,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 736,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                        children: "Temel Arama — İsim, Pozisyon, Yaş"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 739,
                                        columnNumber: 16
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 735,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                children: "Oyuncu İsmi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 743,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: advancedFilters.name || '',
                                                onChange: (e)=>setAdvancedFilters({
                                                        ...advancedFilters,
                                                        name: e.target.value
                                                    }),
                                                placeholder: "İsim ile ara...",
                                                disabled: activeScoutSlots < 1,
                                                className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 744,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 742,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                children: "Pozisyon"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 754,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: advancedFilters.position,
                                                onChange: (e)=>setAdvancedFilters({
                                                        ...advancedFilters,
                                                        position: e.target.value
                                                    }),
                                                disabled: activeScoutSlots < 1,
                                                className: "w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Tümü"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 761,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "GK",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Kaleci (GK)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 762,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "DEF",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Defans (DEF)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 763,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "MID",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Orta Saha (MID)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 764,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "FWD",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Forvet (FWD)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 765,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 755,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 753,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                        children: "Min Yaş"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: advancedFilters.ageMin || '',
                                                        onChange: (e)=>setAdvancedFilters({
                                                                ...advancedFilters,
                                                                ageMin: parseInt(e.target.value) || 0
                                                            }),
                                                        placeholder: "16",
                                                        disabled: activeScoutSlots < 1,
                                                        className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 771,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 769,
                                                columnNumber: 18
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                        children: "Max Yaş"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 781,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: advancedFilters.ageMax || '',
                                                        onChange: (e)=>setAdvancedFilters({
                                                                ...advancedFilters,
                                                                ageMax: parseInt(e.target.value) || 0
                                                            }),
                                                        placeholder: "40",
                                                        disabled: activeScoutSlots < 1,
                                                        className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 782,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 780,
                                                columnNumber: 18
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 768,
                                        columnNumber: 16
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 741,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 734,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `space-y-4 mb-6 ${scoutLevel < 2 ? 'opacity-30 pointer-events-none' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-6 h-6 rounded-lg flex items-center justify-center ${scoutLevel >= 2 ? 'bg-amber-500/20' : 'bg-white/5'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-[9px] font-black ${scoutLevel >= 2 ? 'text-amber-400' : 'text-white/30'}`,
                                            children: "2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 799,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 798,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                        children: "Genişletilmiş — OVR, Nadirlik, İstatikler"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 801,
                                        columnNumber: 16
                                    }, this),
                                    scoutLevel < 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                        size: 10,
                                        className: "text-white/20 ml-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 802,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 797,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                        children: "Min OVR"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 807,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: advancedFilters.ovrMin || '',
                                                        onChange: (e)=>setAdvancedFilters({
                                                                ...advancedFilters,
                                                                ovrMin: parseInt(e.target.value) || 0
                                                            }),
                                                        placeholder: "0",
                                                        className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 808,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 806,
                                                columnNumber: 18
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                        children: "Max OVR"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 817,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: advancedFilters.ovrMax || '',
                                                        onChange: (e)=>setAdvancedFilters({
                                                                ...advancedFilters,
                                                                ovrMax: parseInt(e.target.value) || 0
                                                            }),
                                                        placeholder: "99",
                                                        className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 818,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 816,
                                                columnNumber: 18
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 805,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                children: "Nadirlik"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 828,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: advancedFilters.rarity,
                                                onChange: (e)=>setAdvancedFilters({
                                                        ...advancedFilters,
                                                        rarity: e.target.value
                                                    }),
                                                className: "w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:border-amber-500 outline-none transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "all",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Tümü"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 834,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "common",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Yaygın (0-64)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 835,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "uncommon",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Sıra Dışı (65-74)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 836,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "rare",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Nadir (75-84)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 837,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "epic",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Epik (85-89)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 838,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "legendary",
                                                        className: "bg-zinc-800 text-gray-200",
                                                        children: "Efsanevi (90+)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 839,
                                                        columnNumber: 22
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 829,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 827,
                                        columnNumber: 16
                                    }, this),
                                    [
                                        {
                                            id: 'Klt',
                                            label: 'Klt'
                                        },
                                        {
                                            id: 'Klc',
                                            label: 'Klc'
                                        },
                                        {
                                            id: 'Sav',
                                            label: 'Sav'
                                        },
                                        {
                                            id: 'Pas',
                                            label: 'Pas'
                                        },
                                        {
                                            id: 'Sut',
                                            label: 'Şut'
                                        },
                                        {
                                            id: 'Kfa',
                                            label: 'Kfa'
                                        },
                                        {
                                            id: 'Hiz',
                                            label: 'Hız'
                                        },
                                        {
                                            id: 'Guc',
                                            label: 'Güç'
                                        },
                                        {
                                            id: 'Alg',
                                            label: 'Alg'
                                        },
                                        {
                                            id: 'Top',
                                            label: 'Top'
                                        },
                                        {
                                            id: 'Tplm',
                                            label: 'Tplm'
                                        }
                                    ].map((attr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                    children: attr.label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 856,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    value: advancedFilters[attr.id] || '',
                                                    onChange: (e)=>setAdvancedFilters({
                                                            ...advancedFilters,
                                                            [attr.id]: parseInt(e.target.value) || 0
                                                        }),
                                                    placeholder: "Min",
                                                    className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 857,
                                                    columnNumber: 20
                                                }, this)
                                            ]
                                        }, attr.id, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 855,
                                            columnNumber: 18
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 804,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 796,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `space-y-4 mb-8 ${scoutLevel < 3 ? 'opacity-30 pointer-events-none' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-6 h-6 rounded-lg flex items-center justify-center ${scoutLevel >= 3 ? 'bg-emerald-500/20' : 'bg-white/5'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-[9px] font-black ${scoutLevel >= 3 ? 'text-emerald-400' : 'text-white/30'}`,
                                            children: "3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 873,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 872,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                        children: "Detaylı — Arketip, Yetenekler"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 875,
                                        columnNumber: 16
                                    }, this),
                                    scoutLevel < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                        size: 10,
                                        className: "text-white/20 ml-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 876,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 871,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ArchetypeMultiSelect, {
                                    selected: advancedFilters.archetypes,
                                    onChange: (val)=>setAdvancedFilters({
                                            ...advancedFilters,
                                            archetypes: val
                                        }),
                                    scoutLevel: scoutLevel
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 879,
                                    columnNumber: 16
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 878,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 870,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-end gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAdvancedSearch,
                                disabled: isSearching || activeScoutSlots < 1,
                                className: `px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeScoutSlots < 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50'}`,
                                children: [
                                    isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        size: 14,
                                        className: "animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 898,
                                        columnNumber: 30
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 898,
                                        columnNumber: 80
                                    }, this),
                                    activeScoutSlots < 1 ? 'GÖZLEMCİ GEREKLİ' : 'ARA'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 889,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setAdvancedFilters(getDefaultFilters());
                                    setAdvancedResults([]);
                                    setSearchError('');
                                },
                                className: "px-4 py-3 bg-white/5 text-white/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all",
                                children: "SIFIRLA"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 901,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 888,
                        columnNumber: 10
                    }, this),
                    searchError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                className: "text-red-400 shrink-0",
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 912,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-red-300 uppercase tracking-widest",
                                children: searchError
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 913,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSearchError(''),
                                className: "ml-auto text-white/30 hover:text-white",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 915,
                                    columnNumber: 16
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 914,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 911,
                        columnNumber: 12
                    }, this),
                    advancedResults.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-in fade-in slide-in-from-top-4 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 border-b border-white/5 pb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black text-white/20 uppercase tracking-widest",
                                        children: [
                                            "BULUNAN SONUÇLAR (",
                                            advancedResults.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 923,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setAdvancedResults([]);
                                            setSearchError('');
                                        },
                                        className: "ml-auto text-[8px] font-black text-white/20 hover:text-white uppercase",
                                        children: "TEMİZLE"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 924,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 922,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
                                children: advancedResults.map((p)=>{
                                    const rarity = getRarityFromRating(p.klt || p.rating);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer",
                                        onClick: ()=>onPlayerClick?.(p),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-sm font-black italic",
                                                        children: p.klt || p.rating
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 941,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-black uppercase italic leading-none mb-1 group-hover:text-amber-400 transition-colors",
                                                                children: p && p.name || 'Bilinmeyen'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 945,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[8px] font-black text-white/30 uppercase tracking-widest",
                                                                children: [
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerPos"])(p),
                                                                    " • ",
                                                                    p.age,
                                                                    " YAŞ"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 946,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 mt-0.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[7px] font-bold text-emerald-400/60 uppercase tracking-widest",
                                                                        children: p.team_name || 'SERBEST'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                        lineNumber: 948,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    scoutLevel >= 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `text-[7px] font-black uppercase ${rarity.color}`,
                                                                        children: rarity.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                        lineNumber: 950,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 947,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 944,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 940,
                                                columnNumber: 22
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[6px] text-white/40 uppercase",
                                                                children: "PAS"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 957,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] font-mono font-bold",
                                                                children: p.pas || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 958,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 956,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[6px] text-white/40 uppercase",
                                                                children: "ŞUT"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 961,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] font-mono font-bold",
                                                                children: p.sut || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 962,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 960,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[6px] text-white/40 uppercase",
                                                                children: "HIZ"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 965,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] font-mono font-bold",
                                                                children: p.hiz || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 966,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 964,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 955,
                                                columnNumber: 22
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: async (e)=>{
                                                    e.stopPropagation();
                                                    if (!profile?.id) return;
                                                    try {
                                                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                                                        if (!supabase) return;
                                                        await supabase.from('scouted_players').upsert({
                                                            profile_id: profile.id,
                                                            player_id: p.id,
                                                            player_name: p.name,
                                                            position: p.position,
                                                            rating: p.rating,
                                                            potential: p.potential,
                                                            discovered_at: new Date().toISOString()
                                                        });
                                                    } catch (err) {
                                                        console.warn('Keşfet kaydı başarısız:', err);
                                                    }
                                                },
                                                className: "px-2 py-1 bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-500/30 transition-all",
                                                children: "Keşfet"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 969,
                                                columnNumber: 22
                                            }, this)
                                        ]
                                    }, p.id, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 935,
                                        columnNumber: 20
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 931,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 921,
                        columnNumber: 12
                    }, this),
                    advancedResults.length === 0 && !searchError && !isSearching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-12 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "mx-auto text-white/10 mb-3",
                                size: 32
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1003,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-white/20 uppercase tracking-widest",
                                children: "Filtreleri ayarlayın ve ARA butonuna tıklayın"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1004,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[9px] text-white/10 mt-1 uppercase",
                                children: activeScoutSlots < 1 ? 'Arama için en az 1 gözlemci gereklidir' : `Seviye ${scoutLevel} arama aktif — ${SCOUT_LEVEL_INFO[scoutLevel].desc}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1005,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1002,
                        columnNumber: 12
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 702,
                columnNumber: 7
            }, this),
            scouting.foundPlayersPool.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                className: "text-red-500"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1018,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-black italic uppercase tracking-tighter text-white",
                                children: "BULUNAN OYUNCULAR"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1019,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 border-b border-white/10"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1020,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1017,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
                        children: scouting.foundPlayersPool.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                layout: true,
                                className: "bg-white/5 border border-white/5 rounded-3xl p-5 group hover:border-white/20 transition-all relative overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-black font-black italic",
                                                    children: p.rating
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1032,
                                                    columnNumber: 22
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1031,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/40",
                                                children: p.position
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1034,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1030,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-black uppercase italic text-white mb-4 line-clamp-1",
                                        children: p.name || 'Bilinmeyen'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1036,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>toggleWatchlist(p),
                                                className: `p-2 border rounded-xl transition-all ${watchlist?.includes(p.id) ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white hover:text-black'}`,
                                                title: "İzleme Listesine Ekle",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1043,
                                                    columnNumber: 22
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1038,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDismissPlayer(p.id),
                                                className: "flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase text-white/40 hover:bg-red-500/20 hover:text-red-500 transition-all",
                                                children: "REDDET"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1045,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onPlayerClick?.(p),
                                                className: "flex-1 py-2 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-xl hover:scale-105 transition-all",
                                                children: "TEKLİF YAP"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1051,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1037,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, p.id, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1025,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1023,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 1016,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/5 border border-white/5 rounded-[2rem] p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                className: "text-white/40",
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1070,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-black italic uppercase tracking-tighter text-white",
                                                children: "Geçmiş Aramalar"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1071,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1069,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-black text-white/20 uppercase tracking-widest",
                                        children: [
                                            scouting.history?.length || 0,
                                            " KAYIT"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1073,
                                        columnNumber: 14
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1068,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar",
                                children: [
                                    (scouting.history || []).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-black italic text-white/40",
                                                            children: p.rating
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1080,
                                                            columnNumber: 20
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[11px] font-black uppercase italic text-white/60",
                                                                    children: p.name || 'Bilinmeyen'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                    lineNumber: 1084,
                                                                    columnNumber: 22
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[8px] font-bold text-white/20 uppercase tracking-widest",
                                                                    children: [
                                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerPos"])(p),
                                                                        " • ",
                                                                        p.age,
                                                                        " Yaş"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                    lineNumber: 1085,
                                                                    columnNumber: 22
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1083,
                                                            columnNumber: 20
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1079,
                                                    columnNumber: 18
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>onPlayerClick?.(p),
                                                    className: "p-2 text-white/20 hover:text-white transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1092,
                                                        columnNumber: 20
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1088,
                                                    columnNumber: 18
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 1078,
                                            columnNumber: 16
                                        }, this)),
                                    (!scouting.history || scouting.history.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-white/10 italic text-[10px] uppercase tracking-widest",
                                        children: "Henüz geçmiş araması bulunmuyor."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1097,
                                        columnNumber: 16
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1076,
                                columnNumber: 12
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1067,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/5 border border-white/5 rounded-[2rem] p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                className: "text-amber-500",
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1108,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-black italic uppercase tracking-tighter text-white",
                                                children: "İzleme Listesi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1109,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1107,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-black text-white/20 uppercase tracking-widest",
                                        children: [
                                            watchlistPlayers.length,
                                            " OYUNCU"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1111,
                                        columnNumber: 14
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1106,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar",
                                children: [
                                    (watchlistPlayers || []).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-amber-500/20 transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-[10px] font-black italic text-amber-500",
                                                            children: p.rating
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1118,
                                                            columnNumber: 20
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[11px] font-black uppercase italic text-white",
                                                                    children: p.name || 'Bilinmeyen'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                    lineNumber: 1122,
                                                                    columnNumber: 22
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[8px] font-bold text-white/40 uppercase tracking-widest",
                                                                    children: [
                                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerPos"])(p),
                                                                        " • ",
                                                                        p.age,
                                                                        " Yaş"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                    lineNumber: 1123,
                                                                    columnNumber: 22
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1121,
                                                            columnNumber: 20
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1117,
                                                    columnNumber: 18
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>onPlayerClick?.(p),
                                                            className: "p-2 text-white/20 hover:text-white transition-colors",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1131,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1127,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>toggleWatchlist(p),
                                                            className: "p-2 text-white/10 hover:text-red-500 transition-colors",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1137,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1133,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                    lineNumber: 1126,
                                                    columnNumber: 18
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                            lineNumber: 1116,
                                            columnNumber: 16
                                        }, this)),
                                    watchlistPlayers.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-white/10 italic text-[10px] uppercase tracking-widest",
                                        children: "İzleme listesi boş."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1143,
                                        columnNumber: 16
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1114,
                                columnNumber: 12
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 1065,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showRecruitModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        className: "bg-[#111] border border-white/10 rounded-[3rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-0 p-8 opacity-5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 120
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                    lineNumber: 1166,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1165,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-3xl font-black italic uppercase tracking-tighter text-white",
                                        children: "GÖZLEMCİ İŞE AL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1170,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-2",
                                        children: "Ağına Yeni Bir Uzman Kat"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1171,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1169,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: scoutPrices.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleHireScout(s.stars, s.price, s.minTier),
                                        disabled: userTier > s.minTier,
                                        className: `w-full flex items-center justify-between p-4 border rounded-2xl transition-all group ${userTier > s.minTier ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5' : 'bg-white/5 border-white/5 hover:bg-white hover:text-black'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-black/10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-lg",
                                                            children: [
                                                                s.stars,
                                                                "★"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                            lineNumber: 1184,
                                                            columnNumber: 26
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1183,
                                                        columnNumber: 24
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-black uppercase",
                                                                children: s.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1187,
                                                                columnNumber: 26
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-0.5",
                                                                children: [
                                                                    ...Array(5)
                                                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                        size: 8,
                                                                        className: i < s.stars ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                                                                    }, i, false, {
                                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                        lineNumber: 1190,
                                                                        columnNumber: 30
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1188,
                                                                columnNumber: 26
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1186,
                                                        columnNumber: 24
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1182,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[7px] font-black uppercase text-white/40 group-hover:text-black/40",
                                                                children: "GEREKLİ LİG"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1197,
                                                                columnNumber: 26
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: `text-[9px] font-black ${userTier <= s.minTier ? 'text-emerald-500' : 'text-red-500'}`,
                                                                children: [
                                                                    s.minTier,
                                                                    ". LİG"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                                lineNumber: 1198,
                                                                columnNumber: 26
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1196,
                                                        columnNumber: 24
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[8px] font-black uppercase text-white/40 group-hover:text-black/40",
                                                        children: "MALİYET"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1200,
                                                        columnNumber: 24
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-mono font-bold text-xs",
                                                        children: [
                                                            "$",
                                                            s.price.toLocaleString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                        lineNumber: 1201,
                                                        columnNumber: 24
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                                lineNumber: 1195,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, s.stars, true, {
                                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                        lineNumber: 1176,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1174,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowRecruitModal(false),
                                className: "w-full mt-6 py-3 text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors",
                                children: "İPTAL ET"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                                lineNumber: 1207,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                        lineNumber: 1160,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                    lineNumber: 1154,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/ScoutingTab.tsx",
                lineNumber: 1152,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/ScoutingTab.tsx",
        lineNumber: 546,
        columnNumber: 5
    }, this);
}
_s1(ScoutingTab, "T4NuacHQ/o26CilyBxxCxiPmXs4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"]
    ];
});
_c1 = ScoutingTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "ArchetypeMultiSelect");
__turbopack_context__.k.register(_c1, "ScoutingTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_ScoutingTab_tsx_08844bd3._.js.map