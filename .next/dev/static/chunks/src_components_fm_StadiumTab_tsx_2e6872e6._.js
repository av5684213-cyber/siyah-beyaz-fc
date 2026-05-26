(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/StadiumTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StadiumTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ticket.js [app-client] (ecmascript) <export default as Ticket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-client] (ecmascript) <export default as ArrowUpRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down-right.js [app-client] (ecmascript) <export default as ArrowDownRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coins.js [app-client] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$StaffSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/StaffSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$RefereeSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/RefereeSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/stadiumMatrix.ts [app-client] (ecmascript)");
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
const ACADEMY_STEPS = [
    {
        level: 1,
        name: "Mahalle Okulu",
        buff: "+1 Oyuncu",
        desc: "Yılda 1 kez düşük potansiyelli (Tier 1) oyuncu çıkar.",
        cost: 500000
    },
    {
        level: 2,
        name: "Toprak Saha",
        buff: "%5 Gelişim Hızı",
        desc: "Altyapı oyuncuları antrenmanlarda biraz daha hızlı gelişir.",
        cost: 1500000
    },
    {
        level: 3,
        name: "Yatılı Yurt",
        buff: "Moral Koruması",
        desc: "Çıkan oyuncular takıma daha bağlı (Loyalty) başlar.",
        cost: 3000000
    },
    {
        level: 4,
        name: "Bölge Gözlem Ağı",
        buff: "+2 Oyuncu",
        desc: "Her sezon 2 oyuncu seçme şansı verir.",
        cost: 7500000
    },
    {
        level: 5,
        name: "Sentetik Tesisler",
        buff: "Kondisyon +10",
        desc: "Gençler as kadroya çıktığında maç kondisyonları daha yüksek olur.",
        cost: 15000000
    },
    {
        level: 6,
        name: "Bilimsel Veri Merkezi",
        buff: "Mevki Odaklılık",
        desc: "Oyuncunun hangi mevkide çıkacağını seçme ihtimali doğar.",
        cost: 30000000
    },
    {
        level: 7,
        name: "Elit Kolej Sistemi",
        buff: "Potansiyel +15",
        desc: "Çıkan oyuncuların maksimum ulaşabileceği yetenek sınırı artar.",
        cost: 75000000
    },
    {
        level: 8,
        name: "Uluslararası Kamp",
        buff: "Pazar Değeri",
        desc: "Bu seviyeden çıkan oyuncuların başlangıç satış fiyatı %25 yüksektir.",
        cost: 150000000
    },
    {
        level: 9,
        name: "Yüksek Performans Lab.",
        buff: "Özel Yetenek",
        desc: "Oyuncuların '%15 şansla' wonderkid doğma şansı olur.",
        cost: 300000000
    },
    {
        level: 10,
        name: "Yıldız Fabrikası",
        buff: "Wonderkid Üssü",
        desc: "En yüksek seviye arketipli oyuncular üretilir, wonderkid şansı %20.",
        cost: 1000000000
    }
];
function getEffectCategory(effectKey) {
    if (effectKey.includes('Revenue') || effectKey.includes('Income') || effectKey.includes('income')) return 'income';
    if (effectKey.includes('Performance') || effectKey.includes('Accuracy') || effectKey.includes('Pass') || effectKey.includes('Night')) return 'performance';
    if (effectKey.includes('Recovery') || effectKey.includes('Protection') || effectKey.includes('Winter')) return 'recovery';
    if (effectKey.includes('Sponsor') || effectKey.includes('Multiplier') || effectKey.includes('Quality')) return 'training';
    return 'special';
}
function getEffectStyle(category) {
    const styles = {
        income: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/25',
            text: 'text-emerald-400',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                size: 10
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 87,
                columnNumber: 13
            }, this)
        },
        performance: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/25',
            text: 'text-amber-400',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                size: 10
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 93,
                columnNumber: 13
            }, this)
        },
        recovery: {
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/25',
            text: 'text-sky-400',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                size: 10
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 99,
                columnNumber: 13
            }, this)
        },
        training: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/25',
            text: 'text-purple-400',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                size: 10
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 105,
                columnNumber: 13
            }, this)
        },
        special: {
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/25',
            text: 'text-rose-400',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                size: 10
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this)
        }
    };
    return styles[category];
}
// ═══════════════════════════════════════════════════
// SEVİYE KARŞILAŞTIRMA KARTI
// ═══════════════════════════════════════════════════
function LevelComparisonPanel({ facilityId, currentLevel, targetLevel, maxLevel }) {
    const currentEffect = currentLevel > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(facilityId, currentLevel) : null;
    const targetEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(facilityId, targetLevel);
    const currentBenefit = currentLevel > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFacilityBenefit"])(facilityId, currentLevel) : 'Temel seviye — etki yok';
    const targetBenefit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFacilityBenefit"])(facilityId, targetLevel);
    const isUpgrade = targetLevel > currentLevel;
    const isDowngrade = targetLevel < currentLevel;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl border p-3 transition-all ${isUpgrade ? 'bg-amber-500/[0.06] border-amber-500/20' : isDowngrade ? 'bg-red-500/[0.04] border-red-500/15' : 'bg-black/40 border-white/[0.06]'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-black uppercase tracking-widest text-white/30",
                        children: "OYUN ETKİSİ"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    isUpgrade && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1 text-[7px] font-black text-amber-400 uppercase tracking-widest",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                size: 9
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 151,
                                columnNumber: 13
                            }, this),
                            "YÜKSELTME ÖNİZLEME"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    isDowngrade && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1 text-[7px] font-black text-red-400/60 uppercase tracking-widest",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownRight$3e$__["ArrowDownRight"], {
                                size: 9
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            "ÖNCEKİ SEVİYE"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            targetEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    currentEffect && currentLevel > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center justify-between px-2.5 py-1.5 rounded-lg ${isUpgrade ? 'bg-white/[0.03] border border-white/[0.06]' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    getEffectStyle(getEffectCategory(currentEffect.key)).icon,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[8px] font-bold text-white/40 uppercase tracking-wider",
                                        children: [
                                            "Lv.",
                                            currentLevel,
                                            " — ",
                                            currentEffect.label
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 173,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 171,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-black text-white/50 tabular-nums",
                                children: currentEffect.key.includes('Multiplier') || currentEffect.key.includes('Bonus') || currentEffect.key.includes('Speed') ? `×${currentEffect.value.toFixed(2)}` : currentEffect.key.includes('Revenue') || currentEffect.key.includes('Income') ? `${(currentEffect.value / 1000).toFixed(0)}K €` : `${(currentEffect.value * 100).toFixed(0)}%`
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 177,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 168,
                        columnNumber: 13
                    }, this),
                    isUpgrade && currentEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-8 h-px bg-amber-500/30"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 192,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                    size: 10,
                                    className: "text-amber-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 193,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-8 h-px bg-amber-500/30"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 194,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                            lineNumber: 191,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 190,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center justify-between px-2.5 py-2 rounded-lg ${isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).bg + ' ' + getEffectStyle(getEffectCategory(targetEffect.key)).border + ' border' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    getEffectStyle(getEffectCategory(targetEffect.key)).icon,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[8px] font-bold uppercase tracking-wider ${isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).text : 'text-white/40'}`,
                                        children: [
                                            "Lv.",
                                            targetLevel,
                                            " — ",
                                            targetEffect.label
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-[11px] font-black tabular-nums ${isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).text : 'text-white/50'}`,
                                children: targetEffect.key.includes('Multiplier') || targetEffect.key.includes('Bonus') || targetEffect.key.includes('Speed') ? `×${targetEffect.value.toFixed(2)}` : targetEffect.key.includes('Revenue') || targetEffect.key.includes('Income') ? `${(targetEffect.value / 1000).toFixed(0)}K €` : `${(targetEffect.value * 100).toFixed(0)}%`
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this),
                    isUpgrade && currentEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center pt-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                    size: 8,
                                    className: "text-emerald-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 227,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-black text-emerald-400 uppercase tracking-wider",
                                    children: [
                                        "+",
                                        ((targetEffect.value - currentEffect.value) * 100).toFixed(0),
                                        "% etki artışı"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 228,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                            lineNumber: 226,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 225,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 165,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2.5 pt-2 border-t border-white/[0.04]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `text-[9px] font-bold leading-relaxed uppercase ${isUpgrade ? 'text-amber-300/70' : isDowngrade ? 'text-red-300/40' : 'text-white/40'}`,
                    children: targetBenefit
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/StadiumTab.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_c = LevelComparisonPanel;
function StadiumTab() {
    _s();
    const { profile, setProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const { success, error, warning, info } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const stadiumUpgrades = profile?.stadium_upgrades || {};
    const [ticketPrice, setTicketPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(profile?.ticket_price || 20);
    const [stadiumNameInput, setStadiumNameInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(profile?.stadium_name || '');
    const [previewLevels, setPreviewLevels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [expandedFacility, setExpandedFacility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dbFacilityLevels, setDbFacilityLevels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const currentAcademyLevel = profile?.academy_level || 0;
    const nextAcademyStep = ACADEMY_STEPS[currentAcademyLevel];
    const isUpgrading = !!profile?.active_upgrade_type;
    const speedUpUsed = !!profile?.active_upgrade_speedup;
    const remainingDays = Math.max(0, (profile?.active_upgrade_finish_day || 0) - (profile?.current_day || 0));
    const canSpeedUp = isUpgrading && !speedUpUsed && remainingDays > 0 && (profile?.credits || 0) >= 5;
    // ── Real-time countdown for active upgrade ──
    const [countdown, setCountdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const computeCountdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StadiumTab.useCallback[computeCountdown]": ()=>{
            if (!profile?.active_upgrade_end_at) {
                setCountdown(null);
                return;
            }
            const endAt = new Date(profile.active_upgrade_end_at).getTime();
            const now = Date.now();
            const diff = endAt - now;
            if (diff <= 0) {
                setCountdown({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    totalMs: 0
                });
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
            const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
            const seconds = Math.floor(diff % (1000 * 60) / 1000);
            setCountdown({
                days,
                hours,
                minutes,
                seconds,
                totalMs: diff
            });
        }
    }["StadiumTab.useCallback[computeCountdown]"], [
        profile?.active_upgrade_end_at
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StadiumTab.useEffect": ()=>{
            computeCountdown();
            const interval = setInterval(computeCountdown, 1000);
            return ({
                "StadiumTab.useEffect": ()=>clearInterval(interval)
            })["StadiumTab.useEffect"];
        }
    }["StadiumTab.useEffect"], [
        computeCountdown
    ]);
    // ── user_facilities tablosundan mevcut tesis seviyelerini çek ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StadiumTab.useEffect": ()=>{
            if (!profile?.id) return;
            const fetchFacilities = {
                "StadiumTab.useEffect.fetchFacilities": async ()=>{
                    try {
                        const res = await fetch(`/api/facilities?profileId=${profile.id}`);
                        if (!res.ok) return;
                        const data = await res.json();
                        if (data.facilities && Array.isArray(data.facilities)) {
                            const levels = {};
                            for (const f of data.facilities){
                                // facility_type → facility_id eşleştirmesi
                                const key = f.facility_type || f.facility_id;
                                levels[key] = f.current_level || f.level || 0;
                            }
                            setDbFacilityLevels(levels);
                            // stadium_upgrades'ı DB verisiyle senkronize et
                            const mergedUpgrades = {
                                ...profile.stadium_upgrades,
                                ...levels
                            };
                            if (JSON.stringify(mergedUpgrades) !== JSON.stringify(profile.stadium_upgrades)) {
                                setProfile({
                                    ...profile,
                                    stadium_upgrades: mergedUpgrades
                                });
                            }
                        }
                    } catch (err) {
                        console.warn('[StadiumTab] Facilities fetch error:', err);
                    }
                }
            }["StadiumTab.useEffect.fetchFacilities"];
            fetchFacilities();
        }
    }["StadiumTab.useEffect"], [
        profile?.id
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    const getUpgradeDuration = (level)=>{
        if (level <= 2) return 2;
        return Math.floor(2 * Math.pow(1.5, level - 2));
    };
    const handleUpdateTicketPrice = (price)=>{
        if (!profile) return;
        const finalPrice = Math.min(90, Math.max(0, price));
        setTicketPrice(finalPrice);
        setProfile({
            ...profile,
            ticket_price: finalPrice
        });
    };
    const handleStartUpgrade = async (id, cost, currentLvl)=>{
        if (!profile) return;
        if (isUpgrading) {
            warning('Şu anda devam eden bir geliştirme var!');
            return;
        }
        const reqLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getManagerLevelRequirement"])(currentLvl + 1);
        if (profile.level < reqLevel) {
            warning(`Bu seviye için Menajer Seviyesi ${reqLevel} gerekiyor!`);
            return;
        }
        if (profile.money < cost) {
            error('Yetersiz bütçe!');
            return;
        }
        const duration = getUpgradeDuration(currentLvl + 1);
        const finishDay = profile.current_day + duration;
        const startedAt = new Date().toISOString();
        const endAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
        // Önce state'i güncelle (optimistic update)
        setProfile({
            ...profile,
            money: profile.money - cost,
            active_upgrade_type: id === 'academy' ? 'academy' : 'stadium_matrix',
            active_upgrade_id: id,
            active_upgrade_finish_day: finishDay,
            active_upgrade_speedup: false,
            active_upgrade_started_at: startedAt,
            active_upgrade_end_at: endAt
        });
        // Sonra API'ye de kaydet (user_facilities tablosuna)
        try {
            await fetch('/api/facilities/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profileId: profile.id,
                    facilityType: id,
                    action: 'start'
                })
            });
        } catch (err) {
            console.warn('[StadiumTab] Facilities API error (state güncellendi):', err);
        }
    };
    const handleCancelUpgrade = async ()=>{
        if (!profile) return;
        if (!confirm('İnşaatı iptal etmek istiyor musunuz? Harcanan bütçenin %50\'si iade edilir.')) return;
        let refundMoney = 0;
        if (profile.active_upgrade_type === 'stadium_matrix') {
            const currentLevel = stadiumUpgrades[profile.active_upgrade_id] || 0;
            const cost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateUpgradeCost"])(250000, currentLevel + 1);
            refundMoney = Math.floor(cost * 0.5);
        } else if (profile.active_upgrade_type === 'academy') {
            const nextStep = ACADEMY_STEPS[currentAcademyLevel];
            if (nextStep) refundMoney = Math.floor(nextStep.cost * 0.5);
        }
        setProfile({
            ...profile,
            money: (profile.money || 0) + refundMoney,
            active_upgrade_type: null,
            active_upgrade_id: null,
            active_upgrade_finish_day: null,
            active_upgrade_speedup: null,
            active_upgrade_started_at: null,
            active_upgrade_end_at: null
        });
        success(`İnşaat iptal edildi. ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(refundMoney)} iade edildi.`);
        // API'ye de bildir
        if (profile.active_upgrade_id) {
            try {
                await fetch('/api/facilities/upgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        profileId: profile.id,
                        facilityType: profile.active_upgrade_id,
                        action: 'cancel'
                    })
                });
            } catch (err) {
                console.warn('[StadiumTab] Cancel API error (state güncellendi):', err);
            }
        }
    };
    const handleSpeedUpUpgrade = async ()=>{
        if (!profile || !canSpeedUp) return;
        const speedUpCost = 5;
        if ((profile.credits || 0) < speedUpCost) {
            error(`Yetersiz kredi! ${speedUpCost} kredi gerekli.`);
            return;
        }
        if (!confirm(`Geliştirme süresini yarıya indirmek için ${speedUpCost} Kredi harcanacak. Onaylıyor musun?`)) return;
        // Half the remaining real-time
        let newEndAt = null;
        if (profile.active_upgrade_end_at) {
            const currentEnd = new Date(profile.active_upgrade_end_at).getTime();
            const now = Date.now();
            const remaining = currentEnd - now;
            newEndAt = new Date(now + remaining / 2).toISOString();
        }
        // Half the game-day remaining too
        const currentDay = profile.current_day || 0;
        const finishDay = profile.active_upgrade_finish_day || 0;
        const halfWay = currentDay + Math.ceil((finishDay - currentDay) / 2);
        setProfile({
            ...profile,
            credits: (profile.credits || 0) - speedUpCost,
            active_upgrade_finish_day: halfWay,
            active_upgrade_speedup: true,
            active_upgrade_end_at: newEndAt
        });
        // API'ye de bildir
        if (profile.active_upgrade_id) {
            try {
                await fetch('/api/facilities/upgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        profileId: profile.id,
                        facilityType: profile.active_upgrade_id,
                        action: 'speedup'
                    })
                });
            } catch (err) {
                console.warn('[StadiumTab] Speedup API error (state güncellendi):', err);
            }
        }
    };
    const calculateTotalStars = ()=>{
        const sum = Object.values(stadiumUpgrades).reduce((a, b)=>a + b, 0);
        return Math.min(5, Math.max(1, Math.ceil(sum / 20)));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-8 pb-24 relative",
        children: [
            isUpgrading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: -20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-lg border border-amber-500/20 backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    size: 22,
                                    className: "text-amber-400 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 505,
                                    columnNumber: 16
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 504,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] font-black uppercase tracking-[0.25em] text-white/40",
                                        children: "aktif yükseltme"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 508,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-lg font-black italic uppercase",
                                        children: [
                                            profile.active_upgrade_type === 'academy' ? 'Yetiştirme Merkezi' : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STADIUM_MATRIX"].find((m)=>m.id === profile.active_upgrade_id)?.originalName,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-3 text-amber-400 text-sm tracking-widest font-bold",
                                                children: [
                                                    "LV. ",
                                                    (stadiumUpgrades[profile.active_upgrade_id] || 0) + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 511,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 509,
                                        columnNumber: 17
                                    }, this),
                                    (()=>{
                                        const upgId = profile.active_upgrade_id;
                                        const nextLvl = (stadiumUpgrades[upgId] || 0) + 1;
                                        const effect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(upgId, nextLvl);
                                        if (effect) {
                                            const style = getEffectStyle(getEffectCategory(effect.key));
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full ${style.bg} border ${style.border}`,
                                                children: [
                                                    style.icon,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[8px] font-black uppercase tracking-wider ${style.text}`,
                                                        children: [
                                                            effect.label,
                                                            ": ",
                                                            effect.key.includes('Multiplier') || effect.key.includes('Bonus') || effect.key.includes('Speed') ? `×${effect.value.toFixed(2)}` : effect.key.includes('Revenue') || effect.key.includes('Income') ? `${(effect.value / 1000).toFixed(0)}K €` : `${(effect.value * 100).toFixed(0)}%`
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 523,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 521,
                                                columnNumber: 23
                                            }, this);
                                        }
                                        return null;
                                    })()
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 507,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 503,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] font-black uppercase tracking-widest text-white/30",
                                        children: "tamamlanmasına"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 541,
                                        columnNumber: 17
                                    }, this),
                                    countdown && countdown.totalMs > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 justify-end",
                                        children: [
                                            countdown.days > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-3xl font-black italic tracking-tighter text-white tabular-nums",
                                                children: [
                                                    countdown.days,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm opacity-40 not-italic uppercase font-bold ml-0.5",
                                                        children: "g"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 546,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 545,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-2xl font-black italic tracking-tighter text-white tabular-nums",
                                                children: [
                                                    String(countdown.hours).padStart(2, '0'),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm opacity-40 not-italic",
                                                        children: ":"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 65
                                                    }, this),
                                                    String(countdown.minutes).padStart(2, '0'),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm opacity-40 not-italic",
                                                        children: ":"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 551,
                                                        columnNumber: 67
                                                    }, this),
                                                    String(countdown.seconds).padStart(2, '0')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 549,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 543,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-3xl font-black italic tracking-tighter text-white",
                                        children: [
                                            remainingDays,
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm opacity-40 not-italic uppercase font-bold",
                                                children: "gün"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 556,
                                                columnNumber: 105
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 556,
                                        columnNumber: 19
                                    }, this),
                                    profile.active_upgrade_started_at && profile.active_upgrade_end_at && countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1.5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-1 bg-white/5 rounded-full overflow-hidden",
                                            children: (()=>{
                                                const total = new Date(profile.active_upgrade_end_at).getTime() - new Date(profile.active_upgrade_started_at).getTime();
                                                const elapsed = total - countdown.totalMs;
                                                const pct = total > 0 ? Math.min(100, Math.max(0, elapsed / total * 100)) : 0;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-amber-500 transition-all duration-1000",
                                                    style: {
                                                        width: `${pct}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 566,
                                                    columnNumber: 32
                                                }, this);
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 561,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 560,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 540,
                                columnNumber: 14
                            }, this),
                            canSpeedUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSpeedUpUpgrade,
                                className: "flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        size: 16,
                                        className: "fill-black"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 577,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col leading-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black uppercase tracking-wider",
                                                children: "Hızlandır"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 579,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[7px] font-bold opacity-70",
                                                children: "5 Kredi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 580,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 578,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 573,
                                columnNumber: 16
                            }, this),
                            isUpgrading && !speedUpUsed && remainingDays > 0 && !canSpeedUp && (profile?.credits || 0) < 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 px-4 py-3 bg-white/5 text-white/20 border border-white/10 rounded-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 586,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col leading-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black uppercase tracking-wider",
                                                children: "Hızlandır"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 588,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[7px] font-bold opacity-50",
                                                children: "Yetersiz Kredi (5 Kredi)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 589,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 587,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 585,
                                columnNumber: 16
                            }, this),
                            speedUpUsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 595,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-black uppercase tracking-wider",
                                        children: "Hızlandırıldı"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 596,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 594,
                                columnNumber: 16
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCancelUpgrade,
                                className: "bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all",
                                title: "İptal Et",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 18,
                                    className: "text-white/30"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 604,
                                    columnNumber: 16
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 599,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 539,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 498,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 612,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row justify-between items-center gap-8 relative z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center md:text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center md:justify-start gap-2 mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1",
                                            children: [
                                                [
                                                    ...Array(calculateTotalStars())
                                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                        size: 14,
                                                        className: "text-amber-500 fill-amber-500"
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 618,
                                                        columnNumber: 20
                                                    }, this)),
                                                [
                                                    ...Array(5 - calculateTotalStars())
                                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                        size: 14,
                                                        className: "text-white/10"
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 621,
                                                        columnNumber: 20
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 616,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2",
                                            children: [
                                                calculateTotalStars(),
                                                " YILDIZ"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 624,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 615,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-4xl font-black italic uppercase tracking-tighter text-white mb-2",
                                    children: "OPERASYONEL YERLEŞKE"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 626,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/40 max-w-lg mb-8 leading-relaxed",
                                    children: "Tesislerinizi geliştirerek hem pasif gelirlerinizi artırın hem de takımınıza sahada stratejik avantajlar kazandırın. Her seviye atlamada oyun içi etkileriniz artar."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 627,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center justify-center md:justify-start gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-black text-white/20 uppercase tracking-widest mb-1",
                                                    children: "Mevcut Kapasite"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 632,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xl font-black text-white italic",
                                                    children: [
                                                        5000 + (stadiumUpgrades['capacity'] || 0) * 10000,
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-white/40 not-italic uppercase font-bold",
                                                            children: "KİŞİ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 633,
                                                            columnNumber: 128
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 633,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 631,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-px h-8 bg-white/5 hidden md:block"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 635,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-black text-white/20 uppercase tracking-widest mb-1",
                                                    children: "Toplam Gelişim"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 637,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xl font-black text-amber-400 italic",
                                                    children: [
                                                        Object.values(stadiumUpgrades).reduce((a, b)=>a + b, 0),
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-white/40 not-italic uppercase font-bold",
                                                            children: "PUAN"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 638,
                                                            columnNumber: 158
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 638,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 636,
                                            columnNumber: 16
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 630,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                            lineNumber: 614,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 613,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 611,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-zinc-900 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between relative group overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__["Ticket"], {
                                            size: 28,
                                            className: "text-amber-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 651,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 650,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[9px] font-black text-white/20 uppercase tracking-widest",
                                        children: "Pricing"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 653,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 649,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-black italic uppercase tracking-tighter text-white mb-2",
                                        children: "Bilet Fiyatı"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 656,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-end gap-2 mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                value: ticketPrice,
                                                onChange: (e)=>handleUpdateTicketPrice(parseInt(e.target.value) || 0),
                                                className: "bg-transparent text-4xl font-black text-white w-20 focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 658,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xl font-bold text-white/20 mb-1",
                                                children: "€"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 664,
                                                columnNumber: 16
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 657,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-[8px] font-bold text-white/20 uppercase",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Talep Akışı"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 668,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            Math.round((90 - ticketPrice) / 90 * 100),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 669,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 667,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1 bg-white/5 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-amber-500 transition-all duration-500",
                                                    style: {
                                                        width: `${(1 - ticketPrice / 90) * 100}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 672,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 671,
                                                columnNumber: 16
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 666,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 655,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 648,
                        columnNumber: 9
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STADIUM_MATRIX"].map((item)=>{
                        const level = stadiumUpgrades[item.id] || 0;
                        const cost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateUpgradeCost"])(250000, level + 1);
                        const reqLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getManagerLevelRequirement"])(level + 1);
                        const isMax = level >= item.maxLevel;
                        const canAfford = (profile?.money || 0) >= cost;
                        const meetsLevel = (profile?.level || 1) >= reqLevel;
                        const isBeingUpgraded = profile.active_upgrade_id === item.id;
                        const previewLevel = previewLevels[item.id] ?? level;
                        const duration = getUpgradeDuration(level + 1);
                        const isExpanded = expandedFacility === item.id;
                        // Current and next level effects for the main card display
                        const nextLevelEffect = level < item.maxLevel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(item.id, level + 1) : null;
                        const currentLevelEffect = level > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(item.id, level) : null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `bg-zinc-900 border rounded-2xl p-5 transition-all group flex flex-col justify-between relative overflow-hidden ${isBeingUpgraded ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : isExpanded ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-white/5 hover:border-white/10'}`,
                            children: [
                                isBeingUpgraded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-spin mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                size: 24,
                                                className: "text-black"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 710,
                                                columnNumber: 22
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 709,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                            className: "text-xs font-black italic text-amber-400 uppercase tracking-widest mb-1",
                                            children: "YÜKSELTİLİYOR"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 712,
                                            columnNumber: 20
                                        }, this),
                                        countdown && countdown.totalMs > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-black italic text-white tabular-nums",
                                            children: [
                                                countdown.days > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        countdown.days,
                                                        "g "
                                                    ]
                                                }, void 0, true),
                                                String(countdown.hours).padStart(2, '0'),
                                                ":",
                                                String(countdown.minutes).padStart(2, '0'),
                                                ":",
                                                String(countdown.seconds).padStart(2, '0')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 715,
                                            columnNumber: 22
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-bold text-white uppercase italic",
                                            children: "İnşaat devam ediyor..."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 720,
                                            columnNumber: 22
                                        }, this),
                                        canSpeedUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                handleSpeedUpUpgrade();
                                            },
                                            className: "mt-3 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all hover:scale-105 active:scale-95 text-[8px] font-black uppercase tracking-wider",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    size: 12,
                                                    className: "fill-black"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 728,
                                                    columnNumber: 24
                                                }, this),
                                                "Kredi ile Hızlandır (5 Kredi)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 724,
                                            columnNumber: 22
                                        }, this),
                                        speedUpUsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mt-2 flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-wider",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    size: 10
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 734,
                                                    columnNumber: 24
                                                }, this),
                                                " Hızlandırıldı"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 733,
                                            columnNumber: 22
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 708,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: isBeingUpgraded ? 'opacity-30' : '',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${level > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/5 text-white/20'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                        size: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                        lineNumber: 744,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 743,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-end",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-mono font-bold text-white/40",
                                                            children: [
                                                                "LVL ",
                                                                level,
                                                                "/",
                                                                item.maxLevel
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 747,
                                                            columnNumber: 21
                                                        }, this),
                                                        meetsLevel === false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[7px] font-black text-red-500 uppercase mt-1 flex items-center gap-0.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                                    size: 7
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                    lineNumber: 750,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " REQ LVL ",
                                                                reqLevel
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 749,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 742,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5",
                                                    children: item.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 758,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-amber-400 transition-colors leading-tight",
                                                    children: item.originalName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 759,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 757,
                                            columnNumber: 17
                                        }, this),
                                        currentLevelEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center gap-1.5 px-2 py-1 rounded-lg mb-2.5 ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).bg} border ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).border}`,
                                            children: [
                                                getEffectStyle(getEffectCategory(currentLevelEffect.key)).icon,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[8px] font-black uppercase tracking-wider ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).text}`,
                                                    children: [
                                                        currentLevelEffect.label,
                                                        ": ",
                                                        currentLevelEffect.key.includes('Multiplier') || currentLevelEffect.key.includes('Bonus') || currentLevelEffect.key.includes('Speed') ? `×${currentLevelEffect.value.toFixed(2)}` : currentLevelEffect.key.includes('Revenue') || currentLevelEffect.key.includes('Income') ? `${(currentLevelEffect.value / 1000).toFixed(0)}K €` : `${(currentLevelEffect.value * 100).toFixed(0)}%`
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 768,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 766,
                                            columnNumber: 19
                                        }, this),
                                        nextLevelEffect && !isMax && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/10",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                                    size: 9,
                                                    className: "text-amber-400 shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 783,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-bold text-amber-400/60 uppercase tracking-wider",
                                                    children: [
                                                        "LV.",
                                                        level + 1,
                                                        ": ",
                                                        nextLevelEffect.label,
                                                        " → ",
                                                        nextLevelEffect.key.includes('Multiplier') || nextLevelEffect.key.includes('Bonus') || nextLevelEffect.key.includes('Speed') ? `×${nextLevelEffect.value.toFixed(2)}` : nextLevelEffect.key.includes('Revenue') || nextLevelEffect.key.includes('Income') ? `${(nextLevelEffect.value / 1000).toFixed(0)}K €` : `${(nextLevelEffect.value * 100).toFixed(0)}%`
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 784,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 782,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-0.5 mb-3",
                                            children: [
                                                ...Array(item.maxLevel)
                                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `h-1.5 flex-1 rounded-full transition-all ${i < level ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.3)]' : i < previewLevel && previewLevel > level ? 'bg-amber-500/20' : 'bg-white/5'}`
                                                }, i, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 799,
                                                    columnNumber: 22
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 797,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setExpandedFacility(isExpanded ? null : item.id),
                                            className: "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                    size: 9,
                                                    className: "text-white/20"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 815,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[7px] font-black text-white/25 uppercase tracking-widest",
                                                    children: isExpanded ? 'DETAYLARI GİZLE' : 'TÜM SEVİYE ETKİLERİ'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 816,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 811,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                            children: isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                                                transition: {
                                                    duration: 0.25
                                                },
                                                className: "overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5 mb-3",
                                                    children: Array.from({
                                                        length: item.maxLevel
                                                    }, (_, i)=>i + 1).map((lvl)=>{
                                                        const lvlEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLevelEffect"])(item.id, lvl);
                                                        const isCurrentLevel = lvl === level;
                                                        const isNextLevel = lvl === level + 1;
                                                        const lvlBenefit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFacilityBenefit"])(item.id, lvl);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all ${isCurrentLevel ? 'bg-amber-500/10 border border-amber-500/20' : isNextLevel ? 'bg-emerald-500/[0.06] border border-emerald-500/15' : 'bg-white/[0.02]'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-[9px] font-black font-mono w-5 shrink-0 text-center ${isCurrentLevel ? 'text-amber-400' : isNextLevel ? 'text-emerald-400' : 'text-white/25'}`,
                                                                    children: lvl
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                    lineNumber: 849,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-1.5",
                                                                            children: [
                                                                                lvlEffect && getEffectStyle(getEffectCategory(lvlEffect.key)).icon,
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: `text-[8px] font-bold leading-tight ${isCurrentLevel ? 'text-amber-300' : isNextLevel ? 'text-emerald-300' : 'text-white/35'}`,
                                                                                    children: lvlBenefit
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                                    lineNumber: 857,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                            lineNumber: 855,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        lvlEffect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: `text-[7px] font-mono mt-0.5 block ${isCurrentLevel ? 'text-amber-400/50' : 'text-white/20'}`,
                                                                            children: [
                                                                                lvlEffect.label,
                                                                                ": ",
                                                                                lvlEffect.key.includes('Multiplier') || lvlEffect.key.includes('Bonus') || lvlEffect.key.includes('Speed') ? `×${lvlEffect.value.toFixed(2)}` : lvlEffect.key.includes('Revenue') || lvlEffect.key.includes('Income') ? `${(lvlEffect.value / 1000).toFixed(0)}K €` : `${(lvlEffect.value * 100).toFixed(0)}%`
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                            lineNumber: 864,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                    lineNumber: 854,
                                                                    columnNumber: 31
                                                                }, this),
                                                                isCurrentLevel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[6px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0",
                                                                    children: "AKTİF"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                    lineNumber: 878,
                                                                    columnNumber: 33
                                                                }, this),
                                                                isNextLevel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[6px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0",
                                                                    children: "SONRAKİ"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                                    lineNumber: 883,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, lvl, true, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 839,
                                                            columnNumber: 29
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 831,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 824,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 822,
                                            columnNumber: 17
                                        }, this),
                                        !isMax && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 mb-3 px-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                            size: 9,
                                                            className: "text-white/20"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 899,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] font-bold text-white/25",
                                                            children: [
                                                                duration,
                                                                " gün"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 900,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 898,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-px h-3 bg-white/5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 902,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                            size: 9,
                                                            className: "text-white/20"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 904,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[8px] font-bold text-white/25",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(cost)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                            lineNumber: 905,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                    lineNumber: 903,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 897,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 740,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleStartUpgrade(item.id, cost, level),
                                    disabled: isMax || isUpgrading || !canAfford || !meetsLevel,
                                    className: `w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMax ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : isBeingUpgraded ? 'hidden' : 'bg-white text-black hover:bg-amber-500 hover:text-black disabled:opacity-10'}`,
                                    children: isMax ? 'MAKSİMUM SEVİYE' : `YÜKSELT: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(cost)}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 912,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                            lineNumber: 696,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 646,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-amber-500/[0.03] to-transparent pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 932,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row items-center gap-4 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                            size: 20,
                                            className: "text-amber-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                            lineNumber: 936,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 935,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-black italic uppercase tracking-tighter text-white",
                                                children: "Stadyum İsmi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 939,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[8px] font-black text-white/30 uppercase tracking-widest",
                                                children: "5 Kredi karşılığında değiştir"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 940,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 938,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 934,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 flex items-center gap-3 w-full md:w-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: stadiumNameInput,
                                        onChange: (e)=>setStadiumNameInput(e.target.value),
                                        placeholder: "Stadyum ismi girin...",
                                        className: "flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-amber-500 outline-none transition-all placeholder:text-white/20"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 944,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (!profile) return;
                                            if ((profile.credits || 0) < 5) {
                                                error('Yetersiz kredi! Stadyum ismi değiştirmek için 5 kredi gereklidir.');
                                                return;
                                            }
                                            if (!stadiumNameInput.trim()) {
                                                warning('Stadyum ismi boş olamaz!');
                                                return;
                                            }
                                            setProfile({
                                                ...profile,
                                                credits: (profile.credits || 0) - 5,
                                                stadium_name: stadiumNameInput.trim()
                                            });
                                            success(`Stadyum ismi "${stadiumNameInput.trim()}" olarak değiştirildi! 5 kredi harcandı.`);
                                        },
                                        className: "shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                size: 14,
                                                className: "fill-black"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                                lineNumber: 967,
                                                columnNumber: 15
                                            }, this),
                                            "Stadyum İsmini Değiştir (5 KR)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                        lineNumber: 951,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                lineNumber: 943,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 933,
                        columnNumber: 9
                    }, this),
                    profile?.stadium_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 pt-3 border-t border-white/5 relative z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[9px] font-black text-white/20 uppercase tracking-widest",
                            children: [
                                "Mevcut İsim: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-amber-400/80 normal-case tracking-normal",
                                    children: profile.stadium_name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/StadiumTab.tsx",
                                    lineNumber: 975,
                                    columnNumber: 28
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/StadiumTab.tsx",
                            lineNumber: 974,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/StadiumTab.tsx",
                        lineNumber: 973,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 931,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$StaffSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 982,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$RefereeSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/fm/StadiumTab.tsx",
                lineNumber: 983,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/StadiumTab.tsx",
        lineNumber: 491,
        columnNumber: 5
    }, this);
}
_s(StadiumTab, "zyU9zkOqlYhPAKBFAG/RZDB99IE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c1 = StadiumTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "LevelComparisonPanel");
__turbopack_context__.k.register(_c1, "StadiumTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_StadiumTab_tsx_2e6872e6._.js.map