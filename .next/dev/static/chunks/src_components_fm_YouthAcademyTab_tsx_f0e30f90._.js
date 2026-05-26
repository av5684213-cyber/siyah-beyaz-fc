(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/YouthAcademyTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>YouthAcademyTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-client] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-arrow-up.js [app-client] (ecmascript) <export default as ArrowUpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fast$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FastForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/fast-forward.js [app-client] (ecmascript) <export default as FastForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/youthAcademy.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademySeasonSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/youthAcademySeasonSync.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function formatCurrency(value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K €`;
    return `${Math.round(value)} €`;
}
function getFacilityLevel(state, facilityId) {
    if (Array.isArray(state)) {
        const found = state.find((f)=>f.facilityId === facilityId);
        return found?.currentLevel ?? 1;
    }
    if (state && typeof state === 'object') {
        // Handle FacilityState single object
        if ('facilityId' in state) {
            return state.facilityId === facilityId ? state.currentLevel : 1;
        }
        // Handle Record<string, number> (key-value map from parent)
        if (facilityId in state) {
            return state[facilityId] ?? 1;
        }
    }
    return 1;
}
function getAllFacilityLevels(state) {
    const levels = {};
    if (Array.isArray(state)) {
        state.forEach((f)=>{
            levels[f.facilityId] = f.currentLevel;
        });
    } else if (state && typeof state === 'object') {
        if ('facilityId' in state) {
            // Single FacilityState object
            levels[state.facilityId] = state.currentLevel;
        } else {
            // Record<string, number> (key-value map from parent)
            Object.entries(state).forEach(([key, val])=>{
                if (typeof val === 'number') {
                    levels[key] = val;
                }
            });
        }
    }
    return levels;
}
const POSITION_COLORS = {
    GK: {
        bg: 'bg-[#7AB4E8]/10',
        text: 'text-[#7AB4E8]',
        border: 'border-[#7AB4E8]/20',
        badge: 'bg-[#7AB4E8]/15 text-[#7AB4E8] border-[#7AB4E8]/30'
    },
    DEF: {
        bg: 'bg-[#7EDBC8]/10',
        text: 'text-[#7EDBC8]',
        border: 'border-[#7EDBC8]/20',
        badge: 'bg-[#7EDBC8]/15 text-[#7EDBC8] border-[#7EDBC8]/30'
    },
    MID: {
        bg: 'bg-[#F0C87A]/10',
        text: 'text-[#F0C87A]',
        border: 'border-[#F0C87A]/20',
        badge: 'bg-[#F0C87A]/15 text-[#F0C87A] border-[#F0C87A]/30'
    },
    FWD: {
        bg: 'bg-[#E87878]/10',
        text: 'text-[#E87878]',
        border: 'border-[#E87878]/20',
        badge: 'bg-[#E87878]/15 text-[#E87878] border-[#E87878]/30'
    }
};
const POTENTIAL_LABELS = {
    low: {
        label: 'Düşük',
        color: 'text-white/40',
        bg: 'bg-white/5 border-white/10'
    },
    medium: {
        label: 'Orta',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20'
    },
    high: {
        label: 'Yüksek',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    world_class: {
        label: 'Dünya Sınıfı',
        color: 'text-amber-300',
        bg: 'bg-amber-500/15 border-amber-500/30'
    }
};
const CATEGORY_TABS = [
    {
        id: 'ALL',
        label: 'TÜMÜ'
    },
    {
        id: 'U17',
        label: 'U17'
    },
    {
        id: 'U19',
        label: 'U19'
    },
    {
        id: 'U21',
        label: 'U21'
    }
];
const STAT_LABELS = {
    speed: 'Hız',
    passing: 'Pas',
    shooting: 'Şut',
    defending: 'Tk',
    power: 'Güç',
    goalkeeping: 'Klc',
    finishing: 'Bit',
    dribbling: 'Drb',
    firstTouch: '1. Kont',
    crossing: 'Ort',
    marking: 'Mrk',
    tackling: 'Müd',
    technique: 'Tekn',
    longShots: 'U.Şut',
    offTheBall: 'Bşlk',
    heading: 'Kfa',
    anticipation: 'Öng',
    workRate: 'Çbş',
    composure: 'Skkn',
    decisions: 'Krar',
    determination: 'Krl',
    concentration: 'Kns',
    leadership: 'Ldr',
    flair: 'Flr',
    teamwork: 'Tkm',
    vision: 'Gz',
    stamina: 'Knd',
    agility: 'Çvk',
    balance: 'Dng',
    strength: 'Fzk',
    acceleration: 'Fır',
    jumping: 'Zpl'
};
function getKeyStatsForPosition(pos) {
    const keyMap = {
        GK: [
            'goalkeeping',
            'reflexes',
            'positioning',
            'jumping',
            'composure',
            'concentration'
        ],
        CB: [
            'marking',
            'tackling',
            'heading',
            'positioning',
            'strength',
            'anticipation'
        ],
        LB: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        RB: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        LWB: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        RWB: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        CDM: [
            'tackling',
            'positioning',
            'passing',
            'strength',
            'anticipation',
            'workRate'
        ],
        CM: [
            'passing',
            'vision',
            'stamina',
            'workRate',
            'teamwork',
            'firstTouch'
        ],
        CAM: [
            'passing',
            'vision',
            'dribbling',
            'technique',
            'flair',
            'offTheBall'
        ],
        LM: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        RM: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        LW: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        RW: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        CF: [
            'shooting',
            'finishing',
            'passing',
            'vision',
            'dribbling',
            'offTheBall'
        ],
        ST: [
            'shooting',
            'finishing',
            'heading',
            'speed',
            'offTheBall',
            'strength'
        ]
    };
    return keyMap[pos] || [
        'speed',
        'passing',
        'shooting'
    ];
}
function getDevelopmentCurveColor(curve) {
    switch(curve){
        case 'early':
            return {
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/15'
            };
        case 'normal':
            return {
                text: 'text-blue-400',
                bg: 'bg-blue-500/15'
            };
        case 'late':
            return {
                text: 'text-amber-400',
                bg: 'bg-amber-500/15'
            };
        case 'injury_prone':
            return {
                text: 'text-red-400',
                bg: 'bg-red-500/15'
            };
        default:
            return {
                text: 'text-white/40',
                bg: 'bg-white/5'
            };
    }
}
function YouthAcademyTab({ academyLevel, facilities, onUpgradeFacility, onPromotePlayer, budget, youthPlayers: externalYouthPlayers, onYouthPlayersChange, upgradeEndAt, speedUpUsed: speedUpUsedProp, credits, onStartUpgrade, onSpeedUp, onDeductCredits, currentWeek = 0, seasonIntakeUsed = false }) {
    _s();
    // ─── State: External (controlled) or Internal ──────────────────────
    // Eğer parent bileşen youthPlayers prop'u veriyorsa, onu kullan; yoksa internal state
    const [internalYouthPlayers, setInternalYouthPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const youthPlayers = externalYouthPlayers !== undefined ? externalYouthPlayers : internalYouthPlayers;
    const setYouthPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[setYouthPlayers]": (update)=>{
            if (onYouthPlayersChange) {
                // Parent kontrollü: yeni listeyi parent'a bildir
                const newList = typeof update === 'function' ? update(youthPlayers) : update;
                onYouthPlayersChange(newList);
            } else {
                setInternalYouthPlayers(update);
            }
        }
    }["YouthAcademyTab.useCallback[setYouthPlayers]"], [
        onYouthPlayersChange,
        youthPlayers
    ]);
    const [selectedPlayer, setSelectedPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeCategory, setActiveCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const [showIntakeConfirm, setShowIntakeConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [countdownMs, setCountdownMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isUpgradingAcademy, setIsUpgradingAcademy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Geri sayım sayacı
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "YouthAcademyTab.useEffect": ()=>{
            if (!upgradeEndAt) {
                setCountdownMs(0);
                return;
            }
            const updateCountdown = {
                "YouthAcademyTab.useEffect.updateCountdown": ()=>{
                    const remaining = new Date(upgradeEndAt).getTime() - Date.now();
                    setCountdownMs(Math.max(0, remaining));
                }
            }["YouthAcademyTab.useEffect.updateCountdown"];
            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return ({
                "YouthAcademyTab.useEffect": ()=>clearInterval(interval)
            })["YouthAcademyTab.useEffect"];
        }
    }["YouthAcademyTab.useEffect"], [
        upgradeEndAt
    ]);
    // Format geri sayım
    const formatCountdown = (ms)=>{
        if (ms <= 0) return 'Tamamlandı!';
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor(ms % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        const minutes = Math.floor(ms % (1000 * 60 * 60) / (1000 * 60));
        const seconds = Math.floor(ms % (1000 * 60) / 1000);
        if (days > 0) return `${days}g ${hours}s ${minutes}dk`;
        if (hours > 0) return `${hours}s ${minutes}dk ${seconds}sn`;
        return `${minutes}dk ${seconds}sn`;
    };
    const isUpgradeActive = !!upgradeEndAt && countdownMs > 0;
    const canSpeedUp = isUpgradeActive && !speedUpUsedProp && (credits || 0) >= 5;
    // Facility levels helper
    const facilityLevels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "YouthAcademyTab.useMemo[facilityLevels]": ()=>getAllFacilityLevels(facilities)
    }["YouthAcademyTab.useMemo[facilityLevels]"], [
        facilities
    ]);
    // Calculate weekly upkeep
    const weeklyUpkeep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "YouthAcademyTab.useMemo[weeklyUpkeep]": ()=>{
            let total = 0;
            for (const fac of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YOUTH_FACILITIES"]){
                const lvl = facilityLevels[fac.id] ?? 1;
                total += fac.upgradeCost[0] * lvl * 0.01;
            }
            return Math.round(total + youthPlayers.length * 15_000);
        }
    }["YouthAcademyTab.useMemo[weeklyUpkeep]"], [
        facilityLevels,
        youthPlayers.length
    ]);
    // ─── Filtered Players ───────────────────────────────────────────────
    const filteredPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "YouthAcademyTab.useMemo[filteredPlayers]": ()=>{
            let list = [
                ...youthPlayers
            ];
            if (activeCategory !== 'ALL') {
                list = list.filter({
                    "YouthAcademyTab.useMemo[filteredPlayers]": (p)=>p.category === activeCategory
                }["YouthAcademyTab.useMemo[filteredPlayers]"]);
            }
            return list.sort({
                "YouthAcademyTab.useMemo[filteredPlayers]": (a, b)=>{
                    if (a.isWonderkid !== b.isWonderkid) return a.isWonderkid ? -1 : 1;
                    return b.rating - a.rating;
                }
            }["YouthAcademyTab.useMemo[filteredPlayers]"]);
        }
    }["YouthAcademyTab.useMemo[filteredPlayers]"], [
        youthPlayers,
        activeCategory
    ]);
    // ─── Actions ────────────────────────────────────────────────────────
    const handleIntake = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[handleIntake]": ()=>{
            // Sezon sonu kontrolü — 34 hafta tamamlanmamışsa uyarı ver (manuel tetikleme hala mümkün)
            const { canIntake, reason } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademySeasonSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canDoSeasonIntake"])(currentWeek, seasonIntakeUsed);
            if (!canIntake && currentWeek > 0) {
                // Sezon bitmemişse uyarı göster ama engelleme (manual override)
                const proceed = confirm(`${reason}\n\nYine de alım yapmak istiyor musunuz? (Önerilmez)`);
                if (!proceed) {
                    setShowIntakeConfirm(false);
                    return;
                }
            }
            if (seasonIntakeUsed) {
                alert('Bu sezonun alımı zaten yapıldı!');
                setShowIntakeConfirm(false);
                return;
            }
            // Check if user has enough credits (10 KR required)
            const currentCredits = credits || 0;
            if (currentCredits < 10) {
                alert('Yetersiz kredi! 10 Kredi gerekli.');
                setShowIntakeConfirm(false);
                return;
            }
            // Deduct 10 credits
            if (onDeductCredits) {
                onDeductCredits(10);
            }
            const newPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateYouthIntake"])(academyLevel);
            // Generate scout reports for each
            const playersWithReports = newPlayers.map({
                "YouthAcademyTab.useCallback[handleIntake].playersWithReports": (p)=>({
                        ...p,
                        scoutReport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateScoutReport"])(p)
                    })
            }["YouthAcademyTab.useCallback[handleIntake].playersWithReports"]);
            setYouthPlayers({
                "YouthAcademyTab.useCallback[handleIntake]": (prev)=>[
                        ...prev,
                        ...playersWithReports
                    ]
            }["YouthAcademyTab.useCallback[handleIntake]"]);
            setShowIntakeConfirm(false);
        }
    }["YouthAcademyTab.useCallback[handleIntake]"], [
        academyLevel,
        credits,
        onDeductCredits,
        currentWeek,
        seasonIntakeUsed
    ]);
    const handleScoutPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[handleScoutPlayer]": (player)=>{
            const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateScoutReport"])(player);
            const updated = youthPlayers.map({
                "YouthAcademyTab.useCallback[handleScoutPlayer].updated": (p)=>p.id === player.id ? {
                        ...p,
                        scoutReport: report
                    } : p
            }["YouthAcademyTab.useCallback[handleScoutPlayer].updated"]);
            setYouthPlayers(updated);
            setSelectedPlayer({
                ...player,
                scoutReport: report
            });
        }
    }["YouthAcademyTab.useCallback[handleScoutPlayer]"], [
        youthPlayers
    ]);
    const handlePromote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[handlePromote]": (player)=>{
            setYouthPlayers({
                "YouthAcademyTab.useCallback[handlePromote]": (prev)=>prev.filter({
                        "YouthAcademyTab.useCallback[handlePromote]": (p)=>p.id !== player.id
                    }["YouthAcademyTab.useCallback[handlePromote]"])
            }["YouthAcademyTab.useCallback[handlePromote]"]);
            setSelectedPlayer(null);
            onPromotePlayer(player);
        }
    }["YouthAcademyTab.useCallback[handlePromote]"], [
        onPromotePlayer
    ]);
    const handleUpgrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[handleUpgrade]": (facilityId, cost)=>{
            onUpgradeFacility(facilityId, cost);
        }
    }["YouthAcademyTab.useCallback[handleUpgrade]"], [
        onUpgradeFacility
    ]);
    const handleCloseReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "YouthAcademyTab.useCallback[handleCloseReport]": ()=>{
            setSelectedPlayer(null);
        }
    }["YouthAcademyTab.useCallback[handleCloseReport]"], []);
    // ─── Aggregate Facility Effects ─────────────────────────────────────
    const aggregateEffects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "YouthAcademyTab.useMemo[aggregateEffects]": ()=>{
            let trainingSpeed = 0;
            let scoutQuality = 0;
            let injuryPrevention = 0;
            for (const fac of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YOUTH_FACILITIES"]){
                const lvl = facilityLevels[fac.id] ?? 1;
                trainingSpeed += fac.effects.trainingSpeed * lvl;
                scoutQuality += fac.effects.scoutQuality * lvl;
                injuryPrevention += fac.effects.injuryPrevention * lvl;
            }
            return {
                trainingSpeed,
                scoutQuality,
                injuryPrevention
            };
        }
    }["YouthAcademyTab.useMemo[aggregateEffects]"], [
        facilityLevels
    ]);
    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════
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
                className: "bg-gradient-to-br from-[#0d1117] to-[#111820] border border-white/[0.06] rounded-[2rem] p-6 relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 opacity-[0.03]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                            size: 180
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                            lineNumber: 348,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 347,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                            size: 28,
                                            className: "text-amber-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 354,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                children: "Gençlik Akademisi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 357,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 mt-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-0.5",
                                                        children: [
                                                            ...Array(5)
                                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                size: 12,
                                                                className: i < academyLevel ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 363,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-black text-white/30 uppercase tracking-[0.3em]",
                                                        children: [
                                                            "Seviye ",
                                                            academyLevel
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 372,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 360,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 356,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 352,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-2.5 bg-black/40 border border-white/[0.06] rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/20 uppercase block leading-none mb-1",
                                                children: "Genç Oyuncu"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 382,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-mono font-bold text-white leading-none",
                                                children: youthPlayers.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 385,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 381,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-2.5 bg-black/40 border border-white/[0.06] rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/20 uppercase block leading-none mb-1",
                                                children: "Haftalık Masraf"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 390,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-mono font-bold text-amber-400 leading-none",
                                                children: formatCurrency(weeklyUpkeep)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 393,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 389,
                                        columnNumber: 13
                                    }, this),
                                    isUpgradeActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-amber-400/60 uppercase block leading-none mb-1 flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                                        size: 8
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 19
                                                    }, this),
                                                    " YÜKSELTME"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 401,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-mono font-bold text-amber-400 leading-none",
                                                children: formatCountdown(countdownMs)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 404,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 400,
                                        columnNumber: 15
                                    }, this),
                                    isUpgradeActive && canSpeedUp && onSpeedUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            setIsUpgradingAcademy(true);
                                            try {
                                                await onSpeedUp();
                                            } finally{
                                                setIsUpgradingAcademy(false);
                                            }
                                        },
                                        disabled: isUpgradingAcademy,
                                        className: "px-4 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fast$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FastForward$3e$__["FastForward"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 422,
                                                columnNumber: 17
                                            }, this),
                                            "Hızlandır (5 Kredi)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 412,
                                        columnNumber: 15
                                    }, this),
                                    isUpgradeActive && !speedUpUsedProp && !canSpeedUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/30 uppercase block leading-none mb-1 flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fast$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FastForward$3e$__["FastForward"], {
                                                        size: 8
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 429,
                                                        columnNumber: 19
                                                    }, this),
                                                    " HIZLANDIR"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 428,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold text-white/20",
                                                children: "5 Kredi gerekli"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 431,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 427,
                                        columnNumber: 15
                                    }, this),
                                    speedUpUsedProp && isUpgradeActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold text-emerald-400 flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    size: 10
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 19
                                                }, this),
                                                " Hızlandırıldı"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 436,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 435,
                                        columnNumber: 15
                                    }, this),
                                    !isUpgradeActive && academyLevel < 10 && onStartUpgrade && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            setIsUpgradingAcademy(true);
                                            try {
                                                await onStartUpgrade();
                                            } finally{
                                                setIsUpgradingAcademy(false);
                                            }
                                        },
                                        disabled: isUpgradingAcademy,
                                        className: "px-4 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 454,
                                                columnNumber: 17
                                            }, this),
                                            "Seviye ",
                                            academyLevel + 1
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 444,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowIntakeConfirm(true),
                                        disabled: (credits || 0) < 10 || seasonIntakeUsed,
                                        className: `px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider
                flex items-center gap-2 transition-all ${seasonIntakeUsed ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed' : (credits || 0) >= 10 && currentWeek >= 34 ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : (credits || 0) >= 10 ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 473,
                                                columnNumber: 15
                                            }, this),
                                            seasonIntakeUsed ? 'Alım Yapıldı' : 'Yeni Sezon Alımı',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-mono opacity-70",
                                                children: "(10 KR)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 475,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 459,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 380,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 351,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                lineNumber: 345,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                size: 18,
                                className: "text-white/40"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 486,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-black italic uppercase tracking-tighter text-white",
                                children: "Tesisler"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 487,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 border-b border-white/[0.06]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 490,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                size: 10,
                                                className: "text-emerald-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 494,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-emerald-400",
                                                children: [
                                                    "+",
                                                    (aggregateEffects.trainingSpeed * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 495,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-emerald-400/50",
                                                children: "Ant"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 496,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 493,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/15 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                size: 10,
                                                className: "text-blue-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 499,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-blue-400",
                                                children: [
                                                    "+",
                                                    (aggregateEffects.scoutQuality * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 500,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-blue-400/50",
                                                children: "Göz"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 501,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 498,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/15 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                size: 10,
                                                className: "text-red-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 504,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-red-400",
                                                children: [
                                                    "-",
                                                    (aggregateEffects.injuryPrevention * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 505,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-red-400/50",
                                                children: "Skt"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 506,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 503,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 492,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 485,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YOUTH_FACILITIES"].map((facility)=>{
                            const currentLevel = facilityLevels[facility.id] ?? 1;
                            const isMaxLevel = currentLevel >= facility.maxLevel;
                            const upgradeCost = isMaxLevel ? 0 : facility.upgradeCost[currentLevel];
                            const canAfford = budget >= upgradeCost;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#111820] border border-white/[0.06] rounded-2xl p-5 group hover:border-white/10 transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center text-lg",
                                                        children: facility.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 525,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-[13px] font-black text-white leading-tight",
                                                                children: facility.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 529,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-white/40 mt-0.5 leading-relaxed line-clamp-2",
                                                                children: facility.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 532,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 524,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-0.5 shrink-0",
                                                children: [
                                                    ...Array(facility.maxLevel)
                                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-1.5 h-5 rounded-full transition-colors ${i < currentLevel ? 'bg-amber-400' : 'bg-white/[0.06]'}`
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 539,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 537,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 523,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                width: 0
                                            },
                                            animate: {
                                                width: `${currentLevel / facility.maxLevel * 100}%`
                                            },
                                            transition: {
                                                duration: 0.6,
                                                ease: 'easeOut'
                                            },
                                            className: "h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 551,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 550,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 mb-4",
                                        children: [
                                            facility.effects.trainingSpeed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-bold text-emerald-400/60",
                                                children: [
                                                    "Ant: +",
                                                    (facility.effects.trainingSpeed * currentLevel * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 562,
                                                columnNumber: 21
                                            }, this),
                                            facility.effects.scoutQuality > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-bold text-blue-400/60",
                                                children: [
                                                    "Göz: +",
                                                    (facility.effects.scoutQuality * currentLevel * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 567,
                                                columnNumber: 21
                                            }, this),
                                            facility.effects.injuryPrevention > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-bold text-red-400/60",
                                                children: [
                                                    "Skt: -",
                                                    (facility.effects.injuryPrevention * currentLevel * 100).toFixed(0),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 572,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 560,
                                        columnNumber: 17
                                    }, this),
                                    !isMaxLevel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleUpgrade(facility.id, upgradeCost),
                                        disabled: !canAfford,
                                        className: `w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 active:scale-[0.98]' : 'bg-white/[0.02] border border-white/[0.06] text-white/20 cursor-not-allowed'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 589,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Seviye ",
                                                    currentLevel + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 590,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono",
                                                children: [
                                                    "(",
                                                    formatCurrency(upgradeCost),
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 591,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 580,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center text-emerald-400/50 bg-emerald-500/5 border border-emerald-500/10",
                                        children: "Maksimum Seviye"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 594,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, facility.id, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 519,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 511,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                lineNumber: 484,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0d1117] border border-white/[0.06] rounded-[2rem] overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 pb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            size: 18,
                                            className: "text-amber-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 612,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-black italic uppercase tracking-tighter text-white",
                                                    children: "Genç Kadro"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 614,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-white/30 uppercase tracking-[0.3em] mt-0.5",
                                                    children: [
                                                        filteredPlayers.length,
                                                        " Oyuncu"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 617,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 613,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 611,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex bg-black/40 border border-white/[0.06] rounded-xl p-1",
                                    children: CATEGORY_TABS.map((tab)=>{
                                        const count = tab.id === 'ALL' ? youthPlayers.length : youthPlayers.filter((p)=>p.category === tab.id).length;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveCategory(tab.id),
                                            className: `px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeCategory === tab.id ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-white/40 hover:text-white/60'}`,
                                            children: [
                                                tab.label,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[8px] font-mono ${activeCategory === tab.id ? 'text-black/40' : 'text-white/20'}`,
                                                    children: count
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 640,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, tab.id, true, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 630,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 624,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                            lineNumber: 610,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 609,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full min-w-[900px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-t border-b border-white/[0.04]",
                                        children: [
                                            {
                                                label: 'İsim',
                                                w: 'w-44'
                                            },
                                            {
                                                label: 'Yaş',
                                                w: 'w-12'
                                            },
                                            {
                                                label: 'Pozisyon',
                                                w: 'w-20'
                                            },
                                            {
                                                label: 'Rating',
                                                w: 'w-16'
                                            },
                                            {
                                                label: 'Potansiyel',
                                                w: 'w-28'
                                            },
                                            {
                                                label: 'Gelişim',
                                                w: 'w-28'
                                            },
                                            {
                                                label: 'Scout',
                                                w: 'w-16'
                                            },
                                            {
                                                label: 'Değer',
                                                w: 'w-20'
                                            },
                                            {
                                                label: 'Aksiyon',
                                                w: 'w-32'
                                            }
                                        ].map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${col.w} px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/25`,
                                                children: col.label
                                            }, col.label, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 668,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 656,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 655,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: filteredPlayers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: 9,
                                            className: "text-center py-16",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        size: 32,
                                                        className: "text-white/[0.06]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 682,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] font-bold text-white/15 uppercase tracking-widest",
                                                        children: "Henüz genç oyuncu yok"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 683,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setShowIntakeConfirm(true),
                                                        disabled: (credits || 0) < 10,
                                                        className: `mt-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${(credits || 0) >= 10 ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}`,
                                                        children: "İlk Alımı Yap (10 KR)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 686,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 681,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 680,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 679,
                                        columnNumber: 17
                                    }, this) : filteredPlayers.map((player)=>{
                                        const posColors = POSITION_COLORS[player.specificPosition || player.position] || POSITION_COLORS.MID;
                                        const stars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getYouthPotentialStars"])(player);
                                        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateYouthValue"])(player);
                                        const promotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkYouthPromotion"])(player);
                                        const devColor = getDevelopmentCurveColor(player.developmentCurve);
                                        const keyStats = getKeyStatsForPosition(player.specificPosition);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            onClick: ()=>setSelectedPlayer(player),
                                            className: "border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black ${posColors.badge}`,
                                                                children: player.specificPosition
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 718,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1.5",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[11px] font-black text-white truncate group-hover:text-amber-400 transition-colors",
                                                                                children: player.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                                lineNumber: 723,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            player.isWonderkid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400/15 border border-amber-400/25 rounded text-[8px] font-black text-amber-400 shrink-0",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                                        size: 8,
                                                                                        fill: "currentColor"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                                        lineNumber: 728,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    "WK"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                                lineNumber: 727,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                        lineNumber: 722,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1.5 mt-0.5",
                                                                        children: player.injured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "flex items-center gap-0.5 text-[8px] text-red-400 font-bold",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                                    size: 8
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                                    lineNumber: 736,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                player.injuryWeeksRemaining,
                                                                                "h"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                            lineNumber: 735,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                        lineNumber: 733,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 721,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 717,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 716,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[11px] font-mono font-bold ${player.age <= 17 ? 'text-amber-400' : player.age <= 19 ? 'text-white/60' : 'text-white/40'}`,
                                                        children: player.age
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 747,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[10px] font-black px-2 py-0.5 rounded-md ${posColors.bg} ${posColors.text} border ${posColors.border}`,
                                                        children: player.specificPosition || player.position
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 754,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 753,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-[12px] font-mono font-black ${player.rating >= 65 ? 'text-amber-400' : player.rating >= 55 ? 'text-white' : 'text-white/50'}`,
                                                        children: player.rating
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 761,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 760,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-0.5",
                                                        children: [
                                                            [
                                                                ...Array(5)
                                                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                    size: 10,
                                                                    className: i < stars ? 'text-amber-400 fill-amber-400' : 'text-white/[0.06]'
                                                                }, i, false, {
                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                    lineNumber: 772,
                                                                    columnNumber: 29
                                                                }, this)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-mono text-white/30 ml-1.5",
                                                                children: player.potential
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 781,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 769,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[9px] font-bold px-2 py-0.5 rounded-md ${devColor.bg} ${devColor.text}`,
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDevelopmentCurveLabel"])(player.developmentCurve)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 789,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 788,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: player.scoutReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            setSelectedPlayer(player);
                                                        },
                                                        className: "flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 801,
                                                                columnNumber: 29
                                                            }, this),
                                                            "Rapor"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 797,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            handleScoutPlayer(player);
                                                        },
                                                        className: "flex items-center gap-1 text-[9px] font-bold text-white/25 hover:text-blue-400 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 809,
                                                                columnNumber: 29
                                                            }, this),
                                                            "Tara"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 805,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 795,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-mono font-bold text-white/50",
                                                        children: formatCurrency(value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 817,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 816,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            promotion.ready ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: (e)=>{
                                                                    e.stopPropagation();
                                                                    handlePromote(player);
                                                                },
                                                                className: "px-3 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]",
                                                                children: "A Takımına Al"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 826,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] text-white/15 font-bold uppercase tracking-wider",
                                                                children: player.age < 17 ? 'Çok Genç' : `↑${95 - promotion.confidence}%`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 834,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: (e)=>{
                                                                    e.stopPropagation();
                                                                    setSelectedPlayer(player);
                                                                },
                                                                className: "p-1.5 rounded-md text-white/20 hover:text-white/60 hover:bg-white/5 transition-all",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                    lineNumber: 842,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 838,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 824,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                    lineNumber: 823,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, player.id, true, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 710,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 677,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                            lineNumber: 654,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 653,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                lineNumber: 607,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: selectedPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[100] flex items-start justify-center pt-8 px-4 pb-4 backdrop-blur-xl bg-black/80 overflow-y-auto",
                    onClick: handleCloseReport,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.95,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        exit: {
                            scale: 0.95,
                            y: 20
                        },
                        className: "bg-[#0d1117] border border-white/[0.06] rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden my-auto",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCloseReport,
                                className: "absolute top-4 right-4 p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-all z-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 879,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 875,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-0 opacity-[0.02]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                    size: 200
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 884,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 883,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-5 mb-6 relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black italic",
                                        style: {
                                            borderColor: POSITION_COLORS[selectedPlayer.position]?.border || 'rgba(255,255,255,0.1)',
                                            background: POSITION_COLORS[selectedPlayer.position]?.bg || 'rgba(255,255,255,0.03)',
                                            color: POSITION_COLORS[selectedPlayer.position]?.text || 'rgba(255,255,255,0.5)'
                                        },
                                        children: selectedPlayer.specificPosition
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 889,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-black italic uppercase tracking-tighter text-white",
                                                        children: selectedPlayer.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 900,
                                                        columnNumber: 21
                                                    }, this),
                                                    selectedPlayer.isWonderkid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1 px-2 py-0.5 bg-amber-400/15 border border-amber-400/25 rounded-lg text-[10px] font-black text-amber-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                size: 10,
                                                                fill: "currentColor"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 905,
                                                                columnNumber: 25
                                                            }, this),
                                                            "WONDERKID"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 904,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 899,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 mt-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] text-white/50 font-bold",
                                                        children: [
                                                            selectedPlayer.age,
                                                            " Yaş"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 911,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/10",
                                                        children: "•"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 912,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[11px] font-bold ${POSITION_COLORS[selectedPlayer.position]?.text}`,
                                                        children: selectedPlayer.position
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 913,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/10",
                                                        children: "•"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 916,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] text-white/50 font-bold",
                                                        children: selectedPlayer.category
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 917,
                                                        columnNumber: 21
                                                    }, this),
                                                    selectedPlayer.injured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-white/10",
                                                                children: "•"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 920,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[11px] text-red-400 font-bold flex items-center gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                        size: 11
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                        lineNumber: 922,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Sakat (",
                                                                    selectedPlayer.injuryWeeksRemaining,
                                                                    "h)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 921,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 910,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 898,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3 shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center px-4 py-2 bg-black/40 border border-white/[0.06] rounded-xl",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] font-black text-white/20 uppercase block mb-1",
                                                        children: "Rating"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 933,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-lg font-mono font-black ${selectedPlayer.rating >= 65 ? 'text-amber-400' : selectedPlayer.rating >= 55 ? 'text-white' : 'text-white/50'}`,
                                                        children: selectedPlayer.rating
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 934,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 932,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center px-4 py-2 bg-black/40 border border-white/[0.06] rounded-xl",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] font-black text-white/20 uppercase block mb-1",
                                                        children: "Potansiyel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 941,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-0.5",
                                                        children: [
                                                            ...Array(5)
                                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                size: 12,
                                                                className: i < (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getYouthPotentialStars"])(selectedPlayer) ? 'text-amber-400 fill-amber-400' : 'text-white/[0.06]'
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 944,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 942,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 940,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 931,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 888,
                                columnNumber: 15
                            }, this),
                            selectedPlayer.scoutReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-5 relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/[0.04] rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                size: 12,
                                                className: "text-blue-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 962,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-bold text-blue-400",
                                                children: selectedPlayer.scoutReport.scoutName
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 963,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] text-white/15",
                                                children: "•"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 964,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] text-white/20 font-mono",
                                                children: new Date(selectedPlayer.scoutReport.date).toLocaleDateString('tr-TR')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 965,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-auto text-[9px] text-white/15",
                                                children: [
                                                    "Önerilen: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/40 font-bold",
                                                        children: selectedPlayer.scoutReport.recommendedRole
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 969,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 968,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 961,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 bg-black/30 border border-white/[0.04] rounded-xl",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-white/70 leading-relaxed italic",
                                            children: [
                                                "“",
                                                selectedPlayer.scoutReport.overallAssessment,
                                                "”"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 975,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 974,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-black text-white/25 uppercase tracking-widest shrink-0",
                                                children: "Potansiyel Değerlendirme"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 982,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.bg || 'bg-white/5 border-white/10'} ${POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.color || 'text-white/40'}`,
                                                children: POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.label || selectedPlayer.scoutReport.potentialRating
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 985,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 981,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2",
                                                        children: "Güçlü Yönleri"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 998,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1.5",
                                                        children: [
                                                            selectedPlayer.scoutReport.keyStrengths.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-[10px] font-bold text-emerald-400",
                                                                    children: s
                                                                }, i, false, {
                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                    lineNumber: 1003,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            selectedPlayer.scoutReport.keyStrengths.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-white/15 italic",
                                                                children: "Belirlenemedi"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1011,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1001,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 997,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-black text-red-400/60 uppercase tracking-widest block mb-2",
                                                        children: "Zayıf Yönleri"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1017,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1.5",
                                                        children: [
                                                            selectedPlayer.scoutReport.keyWeaknesses.map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "px-2.5 py-1 bg-red-500/10 border border-red-500/15 rounded-lg text-[10px] font-bold text-red-400",
                                                                    children: w
                                                                }, i, false, {
                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                    lineNumber: 1022,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            selectedPlayer.scoutReport.keyWeaknesses.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-white/15 italic",
                                                                children: "Belirlenemedi"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1030,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1020,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1016,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 995,
                                        columnNumber: 19
                                    }, this),
                                    selectedPlayer.scoutReport.comparisonPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                size: 14,
                                                className: "text-amber-400 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1039,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-amber-200/70 italic",
                                                children: selectedPlayer.scoutReport.comparisonPlayer
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1040,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1038,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-black text-white/25 uppercase tracking-widest shrink-0",
                                                children: "Gelişim Eğrisi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1048,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getDevelopmentCurveColor(selectedPlayer.developmentCurve).bg} border-white/[0.06]`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                        size: 12,
                                                        className: getDevelopmentCurveColor(selectedPlayer.developmentCurve).text
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1054,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[10px] font-bold ${getDevelopmentCurveColor(selectedPlayer.developmentCurve).text}`,
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDevelopmentCurveLabel"])(selectedPlayer.developmentCurve)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1055,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1051,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] text-white/15 font-mono",
                                                children: [
                                                    selectedPlayer.totalTrainingWeeks,
                                                    " hafta eğitim"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1061,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1047,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/25 uppercase tracking-widest block mb-3",
                                                children: "Temel İstatistikler"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1068,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
                                                children: getKeyStatsForPosition(selectedPlayer.specificPosition).map((statKey)=>{
                                                    const statValue = selectedPlayer[statKey] ?? 50;
                                                    const gained = selectedPlayer.statsGainedThisSeason[statKey] ?? 0;
                                                    const label = STAT_LABELS[statKey] || statKey;
                                                    const barColor = statValue >= 70 ? 'bg-amber-400' : statValue >= 55 ? 'bg-emerald-400' : statValue >= 40 ? 'bg-blue-400' : 'bg-white/20';
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2.5 py-1.5 px-3 bg-black/20 rounded-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-bold text-white/30 w-12 shrink-0 uppercase",
                                                                children: label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1079,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                    initial: {
                                                                        width: 0
                                                                    },
                                                                    animate: {
                                                                        width: `${statValue}%`
                                                                    },
                                                                    transition: {
                                                                        duration: 0.8,
                                                                        ease: 'easeOut',
                                                                        delay: 0.05
                                                                    },
                                                                    className: `h-full rounded-full ${barColor}`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                    lineNumber: 1083,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1082,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[10px] font-mono font-bold w-6 text-right ${statValue >= 70 ? 'text-amber-400' : statValue >= 55 ? 'text-emerald-400' : 'text-white/40'}`,
                                                                children: statValue
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1090,
                                                                columnNumber: 29
                                                            }, this),
                                                            gained > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-mono text-emerald-400/60 shrink-0",
                                                                children: [
                                                                    "+",
                                                                    gained
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1096,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, statKey, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1078,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1071,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1067,
                                        columnNumber: 19
                                    }, this),
                                    selectedPlayer.personalityTraits.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/25 uppercase tracking-widest block mb-2",
                                                children: "Kişilik Özellikleri"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1109,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: selectedPlayer.personalityTraits.map((trait, i)=>{
                                                    const isPositive = [
                                                        'Profesyonel',
                                                        'Disiplinli',
                                                        'Çalışkan',
                                                        'Hırslı',
                                                        'Kazanan karakter',
                                                        'Takım oyuncusu',
                                                        'Sessiz lider',
                                                        'Sadık',
                                                        'Büyük maç oyuncusu',
                                                        'Soğukkanlı',
                                                        'Baskı sever'
                                                    ].includes(trait);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `px-2 py-0.5 rounded text-[9px] font-bold border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400/70' : 'bg-red-500/10 border-red-500/15 text-red-400/70'}`,
                                                        children: trait
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1116,
                                                        columnNumber: 29
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1112,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1108,
                                        columnNumber: 21
                                    }, this),
                                    selectedPlayer.traits.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/25 uppercase tracking-widest block mb-2",
                                                children: "Yetenek Özellikleri"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1135,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: selectedPlayer.traits.map((trait, i)=>{
                                                    const level = selectedPlayer.traitLevels?.[trait];
                                                    const levelColor = level === 'MOR' ? 'text-red-400 border-red-400/25 bg-red-500/10' : level === 'ALTIN' ? 'text-amber-300 border-amber-300/25 bg-amber-500/10' : level === 'LACIVERT' ? 'text-blue-400 border-blue-400/25 bg-blue-500/10' : 'text-white/40 border-white/10 bg-white/5';
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `px-2 py-0.5 rounded text-[9px] font-bold border ${levelColor}`,
                                                        children: [
                                                            trait,
                                                            level && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-1 opacity-60",
                                                                children: [
                                                                    "[",
                                                                    level,
                                                                    "]"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1148,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1146,
                                                        columnNumber: 29
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1138,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1134,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between pt-4 border-t border-white/[0.04]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1",
                                                        children: "Tahmini Değer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1159,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-lg font-mono font-black text-amber-400",
                                                        children: formatCurrency((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateYouthValue"])(selectedPlayer))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1162,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1158,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    !selectedPlayer.scoutReport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleScoutPlayer(selectedPlayer),
                                                        className: "px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-500/20 transition-all flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1172,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Scout Raporu Al"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1168,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            const updated = youthPlayers.map((p)=>p.id === selectedPlayer.id ? {
                                                                    ...p,
                                                                    scoutReport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateScoutReport"])(p)
                                                                } : p);
                                                            setYouthPlayers(updated);
                                                            setSelectedPlayer({
                                                                ...selectedPlayer,
                                                                scoutReport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateScoutReport"])(selectedPlayer)
                                                            });
                                                        },
                                                        className: "px-4 py-2 bg-white/5 border border-white/[0.06] text-white/40 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1188,
                                                                columnNumber: 25
                                                            }, this),
                                                            "Raporu Yenile"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1176,
                                                        columnNumber: 23
                                                    }, this),
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkYouthPromotion"])(selectedPlayer).ready && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handlePromote(selectedPlayer),
                                                        className: "px-5 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpCircle$3e$__["ArrowUpCircle"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1196,
                                                                columnNumber: 27
                                                            }, this),
                                                            "A Takımına Al"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1192,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1166,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1157,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 959,
                                columnNumber: 17
                            }, this) : /* No scout report yet */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-12 space-y-4 relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                        size: 40,
                                        className: "text-white/[0.06] mx-auto"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1206,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] font-bold text-white/20 uppercase tracking-widest",
                                                children: "Scout Raporu Yok"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1208,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-white/10 mt-1",
                                                children: "Bu oyuncu hakkında detaylı bilgi almak için scout görevi gönderin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1211,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1207,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleScoutPlayer(selectedPlayer),
                                        className: "px-6 py-2.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-400 transition-all flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1219,
                                                columnNumber: 21
                                            }, this),
                                            "Scout Raporu Oluştur"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1215,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 pt-6 border-t border-white/[0.04]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-white/20 uppercase tracking-widest block mb-3",
                                                children: "Temel İstatistikler"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1225,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto",
                                                children: [
                                                    {
                                                        key: 'speed',
                                                        label: 'Hız'
                                                    },
                                                    {
                                                        key: 'passing',
                                                        label: 'Pas'
                                                    },
                                                    {
                                                        key: 'shooting',
                                                        label: 'Şut'
                                                    },
                                                    {
                                                        key: 'defending',
                                                        label: 'Savunma'
                                                    },
                                                    {
                                                        key: 'power',
                                                        label: 'Güç'
                                                    },
                                                    {
                                                        key: 'dribbling',
                                                        label: 'Dribling'
                                                    },
                                                    {
                                                        key: 'stamina',
                                                        label: 'Kondisyon'
                                                    },
                                                    {
                                                        key: 'vision',
                                                        label: 'Görüş'
                                                    }
                                                ].map((stat)=>{
                                                    const val = selectedPlayer[stat.key] ?? 50;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center py-2 bg-black/20 rounded-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] text-white/20 block mb-0.5",
                                                                children: stat.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1242,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[12px] font-mono font-bold ${val >= 65 ? 'text-amber-400' : val >= 55 ? 'text-white/60' : 'text-white/30'}`,
                                                                children: val
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1243,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, stat.key, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1241,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1228,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1224,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 1205,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 867,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                    lineNumber: 860,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                lineNumber: 858,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showIntakeConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80",
                    onClick: ()=>setShowIntakeConfirm(false),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            scale: 1,
                            y: 0
                        },
                        exit: {
                            scale: 0.9,
                            y: 20
                        },
                        className: "bg-[#0d1117] border border-white/[0.06] rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-0 opacity-[0.03]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 150
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                    lineNumber: 1280,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 1279,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            size: 28,
                                            className: "text-amber-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                            lineNumber: 1285,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1284,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-black italic uppercase tracking-tighter text-white text-center mb-2",
                                        children: "Yeni Sezon Alımı"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1288,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-white/40 text-center mb-6 leading-relaxed",
                                        children: "Akademi seviyenize uygun yeni genç oyuncular keşfedilecek. Her oyuncuya otomatik scout raporu oluşturulacak."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1291,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-black/30 border border-white/[0.04] rounded-xl p-4 mb-6 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-white/30 font-bold uppercase",
                                                        children: "Beklenen Oyuncu"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1297,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[12px] font-mono font-bold text-white",
                                                        children: "1-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1298,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1296,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-white/30 font-bold uppercase",
                                                        children: "Yaş Aralığı"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1301,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[12px] font-mono font-bold text-white",
                                                        children: "15-21"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1302,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1300,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-white/30 font-bold uppercase",
                                                        children: "Akademi Seviyesi"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1305,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-0.5",
                                                        children: [
                                                            ...Array(5)
                                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                size: 12,
                                                                className: i < academyLevel ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                                lineNumber: 1308,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1306,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1304,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-white/[0.04] pt-3 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-amber-400/60 font-bold uppercase",
                                                        children: "Kredi Maliyeti"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1313,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[12px] font-mono font-bold text-amber-400",
                                                        children: "10 KR"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1314,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1312,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-white/30 font-bold uppercase",
                                                        children: "Mevcut Kredi"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1319,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[12px] font-mono font-bold ${(credits || 0) >= 10 ? 'text-emerald-400' : 'text-red-400'}`,
                                                        children: [
                                                            credits || 0,
                                                            " KR"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1320,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1318,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1295,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowIntakeConfirm(false),
                                                className: "flex-1 py-3 bg-white/5 border border-white/[0.06] text-white/30 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all",
                                                children: "İptal"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1327,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleIntake,
                                                disabled: (credits || 0) < 10,
                                                className: `flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${(credits || 0) >= 10 ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                        lineNumber: 1342,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Alımı Gerçekleştir (10 KR)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                                lineNumber: 1333,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                        lineNumber: 1326,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                                lineNumber: 1283,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                        lineNumber: 1272,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                    lineNumber: 1265,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
                lineNumber: 1263,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/YouthAcademyTab.tsx",
        lineNumber: 337,
        columnNumber: 5
    }, this);
}
_s(YouthAcademyTab, "OMOOnCJ/M0S2dD4GdpOXZn0JnlI=");
_c = YouthAcademyTab;
var _c;
__turbopack_context__.k.register(_c, "YouthAcademyTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_YouthAcademyTab_tsx_f0e30f90._.js.map