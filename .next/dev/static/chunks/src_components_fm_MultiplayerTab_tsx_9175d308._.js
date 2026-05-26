(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/MultiplayerTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MultiplayerTab",
    ()=>MultiplayerTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gavel.js [app-client] (ecmascript) <export default as Gavel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coins.js [app-client] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/handshake.js [app-client] (ecmascript) <export default as Handshake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$CreditPurchaseModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/CreditPurchaseModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/multiplayer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ui-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/inflation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ContractOfferModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/ContractOfferModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
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
function AttrFilter({ label, value, onChange }) {
    const attrs = [
        'Klc',
        'Tk',
        'Pas',
        'Sut',
        'Kfa',
        'Hız',
        'Güç',
        'Alg',
        'Top'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-[8px] font-black text-white/20 uppercase",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: value.key,
                        onChange: (e)=>onChange({
                                ...value,
                                key: e.target.value
                            }),
                        className: "w-[60%] bg-zinc-900 border border-white/10 rounded-lg p-2 text-[9px] font-black uppercase text-white outline-none",
                        children: attrs.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: a,
                                children: a
                            }, a, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 41,
                                columnNumber: 27
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        value: value.min,
                        onChange: (e)=>onChange({
                                ...value,
                                min: Number(e.target.value)
                            }),
                        placeholder: "Min",
                        className: "w-[40%] bg-zinc-900 border border-white/10 rounded-lg p-2 text-[9px] font-black text-white outline-none"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = AttrFilter;
function AuctionTimer({ expiresAt }) {
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isExpired, setIsExpired] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isUrgent, setIsUrgent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuctionTimer.useEffect": ()=>{
            if (!expiresAt) return;
            const update = {
                "AuctionTimer.useEffect.update": ()=>{
                    const now = Date.now();
                    const end = new Date(expiresAt).getTime();
                    const diff = end - now;
                    if (diff <= 0) {
                        setIsExpired(true);
                        setTimeLeft('Sona Erdi');
                        return;
                    }
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
                    const seconds = Math.floor(diff % (1000 * 60) / 1000);
                    if (hours > 0) setTimeLeft(`${hours}s ${minutes}dk`);
                    else setTimeLeft(`${minutes}dk ${seconds}sn`);
                    setIsUrgent(diff < 30 * 60 * 1000); // less than 30 min
                }
            }["AuctionTimer.useEffect.update"];
            update();
            const interval = setInterval(update, 1000);
            return ({
                "AuctionTimer.useEffect": ()=>clearInterval(interval)
            })["AuctionTimer.useEffect"];
        }
    }["AuctionTimer.useEffect"], [
        expiresAt
    ]);
    if (!expiresAt) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: timeLeft
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_s(AuctionTimer, "nRLz2IzhfrfXf3fZ1W27hltLp1Q=");
_c1 = AuctionTimer;
function MultiplayerTab({ userId, profile, squad, onSetSquad, onSetProfile, onPlayerClick, onListingClick, teamName, isAdmin }) {
    _s1();
    const { setDirectMessageRecipient, setSelectedTeamProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const [listings, setListings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [leaderboard, setLeaderboard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeSubTab, setActiveSubTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('market');
    const [myAuctions, setMyAuctions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loanPlayers, setLoanPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'price',
        direction: 'asc'
    });
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        position: 'ALL',
        minKlt: 0,
        maxKlt: 100,
        attr1: {
            key: 'Klc',
            min: 0,
            max: 100
        },
        attr2: {
            key: 'Tk',
            min: 0,
            max: 100
        },
        attr3: {
            key: 'Pas',
            min: 0,
            max: 100
        }
    });
    const [contractListing, setContractListing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [contractMode, setContractMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showCreditPurchase, setShowCreditPurchase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wonAuctions, setWonAuctions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loanModalPlayer, setLoanModalPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loanFeePercent, setLoanFeePercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(15);
    const [loanSubmitting, setLoanSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sortedAndFilteredListings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MultiplayerTab.useMemo[sortedAndFilteredListings]": ()=>{
            const filtered = listings.filter({
                "MultiplayerTab.useMemo[sortedAndFilteredListings].filtered": (l)=>{
                    const p = l.player_data;
                    if (!p) return false;
                    // Handle sub-positions in filtering — now supports specific_position
                    if (filter.position !== 'ALL') {
                        const bigPosMap = {
                            'GK': 'GK',
                            'CB': 'DEF',
                            'LB': 'DEF',
                            'RB': 'DEF',
                            'LWB': 'DEF',
                            'RWB': 'DEF',
                            'DEF': 'DEF',
                            'CDM': 'MID',
                            'CM': 'MID',
                            'CAM': 'MID',
                            'LM': 'MID',
                            'RM': 'MID',
                            'MID': 'MID',
                            'ST': 'FWD',
                            'LW': 'FWD',
                            'RW': 'FWD',
                            'CF': 'FWD',
                            'FWD': 'FWD'
                        };
                        // Use specific_position if available, fallback to position
                        const playerPos = p.specific_position || p.position;
                        // If filter is a group (GK/DEF/MID/FWD), match by group
                        const filterGroup = bigPosMap[filter.position];
                        if (filterGroup) {
                            const playerBigPos = bigPosMap[playerPos] || playerPos;
                            if (playerBigPos !== filterGroup) return false;
                        } else {
                            // Filter is a specific position (CB, CDM, LW etc.) — exact match
                            if (playerPos !== filter.position) return false;
                        }
                    }
                    const klt = p.Klt || p.rating;
                    if (klt < filter.minKlt || klt > filter.maxKlt) return false;
                    const checkAttr = {
                        "MultiplayerTab.useMemo[sortedAndFilteredListings].filtered.checkAttr": (attr)=>{
                            const val = p[attr.key] || 0;
                            return val >= attr.min && val <= attr.max;
                        }
                    }["MultiplayerTab.useMemo[sortedAndFilteredListings].filtered.checkAttr"];
                    if (!checkAttr(filter.attr1)) return false;
                    if (!checkAttr(filter.attr2)) return false;
                    if (!checkAttr(filter.attr3)) return false;
                    return true;
                }
            }["MultiplayerTab.useMemo[sortedAndFilteredListings].filtered"]);
            return [
                ...filtered
            ].sort({
                "MultiplayerTab.useMemo[sortedAndFilteredListings]": (a, b)=>{
                    const getVal = {
                        "MultiplayerTab.useMemo[sortedAndFilteredListings].getVal": (item)=>{
                            const p = item.player_data;
                            switch(sortConfig.key){
                                case 'Klt':
                                    return p.Klt || p.rating;
                                case 'Klc':
                                    return p.Klc || 0;
                                case 'Tk':
                                    return p.Tk || 0;
                                case 'Pas':
                                    return p.Pas || 0;
                                case 'Sut':
                                    return p.Sut || 0;
                                case 'Kfa':
                                    return p.Kfa || 0;
                                case 'Hız':
                                    return p.Hız || 0;
                                case 'Güç':
                                    return p.Güç || 0;
                                case 'Alg':
                                    return p.Alg || 0;
                                case 'Top':
                                    return p.Top || 0;
                                case 'Tplm':
                                    return (p.Klt || p.rating) + (p.Klc || 0) + (p.Tk || 0) + (p.Pas || 0) + (p.Sut || 0) + (p.Kfa || 0) + (p.Hız || 0) + (p.Güç || 0) + (p.Alg || 0) + (p.Top || 0);
                                case 'price':
                                    return item.price;
                                default:
                                    return 0;
                            }
                        }
                    }["MultiplayerTab.useMemo[sortedAndFilteredListings].getVal"];
                    const aVal = getVal(a);
                    const bVal = getVal(b);
                    return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
                }
            }["MultiplayerTab.useMemo[sortedAndFilteredListings]"]);
        }
    }["MultiplayerTab.useMemo[sortedAndFilteredListings]"], [
        listings,
        filter,
        sortConfig
    ]);
    const toggleSort = (key)=>{
        setSortConfig((current)=>({
                key,
                direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
            }));
    };
    const fetchData = async ()=>{
        setLoading(true);
        try {
            const [marketData, rankingData] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMarketListings"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalLeaderboard"])()
            ]);
            // Sync stats and prices for market players to handle legacy/missing data
            const syncedMarket = (await Promise.all((marketData || []).map(async (listing)=>{
                if (!listing.player_data) return null;
                const syncedPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["syncPlayerStats"])(listing.player_data);
                let price = listing.price;
                let maxPrice = listing.max_price;
                let minPrice = listing.min_price;
                let needsDbUpdate = false;
                // If it's a free agent and the price/corridor is legacy
                if (listing.seller_id === 'free-agent-system') {
                    const mVal = syncedPlayer.market_value || 0;
                    // Detect legacy (if max price is significantly lower than value, or just 200M hardcoded)
                    if (maxPrice < mVal || maxPrice === 200000000) {
                        price = Math.round(mVal * 0.92);
                        minPrice = Math.round(mVal * 0.85);
                        maxPrice = Math.round(mVal * 1.15);
                        needsDbUpdate = true;
                    }
                }
                const updatedListing = {
                    ...listing,
                    player_data: syncedPlayer,
                    price: price,
                    min_price: minPrice,
                    max_price: maxPrice || Math.round(price * 1.15)
                };
                // Proactively repair the database for this free agent
                if (needsDbUpdate && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    if (supabase) {
                        await supabase.from('transfer_market').update({
                            price: price,
                            min_price: minPrice,
                            max_price: maxPrice,
                            player_data: syncedPlayer
                        }).eq('id', listing.id);
                    }
                }
                return updatedListing;
            }))).filter((l)=>l !== null);
            setListings(syncedMarket);
            setLeaderboard(rankingData || []);
            if (userId) {
                const myData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMyAuctions"])(userId);
                setMyAuctions(myData || []);
                // Fetch won auctions (expired auctions where this user is the highest bidder)
                try {
                    const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    if (sb) {
                        const { data: expiredWins } = await sb.from('transfer_market').select('*').eq('highest_bidder_id', userId).eq('is_active', false).order('created_at', {
                            ascending: false
                        });
                        setWonAuctions(expiredWins || []);
                    }
                } catch (wonErr) {
                    console.error('Won auctions fetch error:', wonErr);
                }
            }
            // Fetch loan players
            try {
                const loanRes = await fetch('/api/loans/available?profileId=' + userId);
                if (loanRes.ok) {
                    const loanData = await loanRes.json();
                    setLoanPlayers(loanData.players || []);
                }
            } catch (loanErr) {
                console.error('Loan fetch error:', loanErr);
            }
        } catch (err) {
            console.error('Multiplayer fetch error:', err);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MultiplayerTab.useEffect": ()=>{
            fetchData();
            const interval = setInterval(fetchData, 10000); // 10s refresh for bidding
            return ({
                "MultiplayerTab.useEffect": ()=>clearInterval(interval)
            })["MultiplayerTab.useEffect"];
        }
    }["MultiplayerTab.useEffect"], []);
    const handleBuy = async (listing)=>{
        if (profile?.money < listing.price) {
            alert('Yetersiz bütçe!');
            return;
        }
        const playerName = listing.player_data?.name || 'Bilinmeyen Oyuncu';
        if (confirm(`${playerName} oyuncusunu ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.price)} bedelle hemen satın almak istiyor musunuz?`)) {
            setLoading(true);
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buyPlayerFromMarket"])(listing.id, userId, profile.team_name);
                if (result.success) {
                    // Update local squad
                    const newSquad = [
                        ...squad,
                        result.player
                    ];
                    onSetSquad(newSquad);
                    // Update local profile money
                    onSetProfile({
                        ...profile,
                        money: profile.money - result.price
                    });
                    alert('Transfer başarıyla tamamlandı! Oyuncu kadronuza katıldı.');
                    fetchData();
                } else {
                    alert(`Satın alma hatası: ${result.error}`);
                }
            } catch (err) {
                console.error('Buy error:', err);
                alert('İşlem sırasında bir hata oluştu.');
            } finally{
                setLoading(false);
            }
        }
    };
    const handleLoanPlayer = async (player)=>{
        setLoanModalPlayer(player);
        setLoanFeePercent(15);
    };
    const handleLoanSubmit = async ()=>{
        if (!loanModalPlayer || !userId) return;
        if (!loanModalPlayer.id) {
            alert('Oyuncu ID bulunamadı.');
            return;
        }
        const loanFee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000, profile?.current_day || 1);
        setLoanSubmitting(true);
        try {
            console.log('[MultiplayerTab Loan] Sending:', {
                playerId: loanModalPlayer.id,
                loanFee,
                profileId: userId
            });
            const res = await fetch('/api/loans/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerId: loanModalPlayer.id,
                    loanFee,
                    profileId: userId
                })
            });
            const data = await res.json();
            console.log('[MultiplayerTab Loan] Response:', data);
            if (data.success) {
                const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                alert(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(loanModalPlayer.name)} kiralık listesine çıkarıldı!\n\nKiralık ücret: ${feeStr}\n10 Kredi komisyon kiracıdan alınacak.`);
                setLoanModalPlayer(null);
                // Update squad to reflect loan status
                const updatedSquad = squad.map((p)=>p.id === loanModalPlayer.id ? {
                        ...p,
                        is_on_loan_market: true
                    } : p);
                onSetSquad(updatedSquad);
                fetchData();
            } else {
                const debugInfo = data.debug ? `\n\nHata Ayıklama: ${JSON.stringify(data.debug)}` : '';
                alert(data.error || 'Kiralık listesine çıkarılamadı.' + debugInfo);
            }
        } catch (err) {
            console.error('[MultiplayerTab Loan] Exception:', err);
            alert('Bir hata oluştu.');
        } finally{
            setLoanSubmitting(false);
        }
    };
    const handleBid = async (listing)=>{
        const currentPrice = listing.current_bid || listing.price;
        const bidIncrement = Math.round(listing.price * 0.02); // 2% increment
        let nextBid = currentPrice + bidIncrement;
        // Cap at max price
        if (nextBid >= listing.max_price) {
            nextBid = listing.max_price;
        }
        if (profile?.money < nextBid) {
            alert('Yetersiz bütçe!');
            return;
        }
        const playerName = listing.player_data?.name || 'Bilinmeyen Oyuncu';
        const confirmMsg = nextBid >= listing.max_price ? `${playerName} için ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(nextBid)} (MAKSİMUM BEDEL) ödeyip oyuncuyu hemen almak istiyor musunuz?` : `${playerName} için ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(nextBid)} teklif vermek istiyor musunuz?`;
        if (confirm(confirmMsg)) {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["placeBid"])(listing.id, userId, profile.team_name, nextBid);
            if (result.success) {
                if (result.autoWin) {
                    const newSquad = [
                        ...squad,
                        result.player
                    ];
                    onSetSquad(newSquad);
                    onSetProfile({
                        ...profile,
                        money: profile.money - result.price
                    });
                    alert('Maksimum bedel ödendi! Oyuncu kadronuza katıldı.');
                } else {
                    alert('Teklifiniz başarıyla iletildi!');
                }
                fetchData();
            } else {
                alert(result.error);
            }
        }
    };
    const handleCancelAuction = async (listingId)=>{
        if (!confirm('Bu açık artırmayı iptal etmek istediğinize emin misiniz? (Teklif yoksa iptal edilebilir)')) return;
        setLoading(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cancelAuction"])(listingId, userId);
            if (result.success) {
                alert('Artırma iptal edildi.');
                fetchData();
            } else {
                alert(result.error || 'İptal başarısız.');
            }
        } catch (err) {
            alert('Bir hata oluştu.');
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 10
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-6 pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-zinc-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/5 max-w-sm flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveSubTab('market'),
                                className: `flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'market' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`,
                                children: "Transfer Pazarı"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 445,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveSubTab('auctions'),
                                className: `flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'auctions' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white'}`,
                                children: "Artırmalarım"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 451,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveSubTab('rankings'),
                                className: `flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'rankings' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`,
                                children: "Sıralama"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveSubTab('loans'),
                                className: `flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'loans' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`,
                                children: "Kiralık"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 464,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                        lineNumber: 444,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/sql-download/free_agents.sql",
                        download: true,
                        className: "flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/60",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 477,
                                columnNumber: 11
                            }, this),
                            "SQL İNDİR"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                        lineNumber: 472,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 443,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: activeSubTab === 'market' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "space-y-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-white/5 flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "text-emerald-500",
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 494,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-black uppercase tracking-widest text-white/80",
                                                    children: "Aktif Transfer Listesi"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 495,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 493,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setShowCreditPurchase(true),
                                                    className: "flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-500/25 hover:text-amber-300 transition-all",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 502,
                                                            columnNumber: 23
                                                        }, this),
                                                        "Kredi Satın Al"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 498,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                                    children: [
                                                        sortedAndFilteredListings.length,
                                                        " OYUNCU BULUNDU"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 505,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 497,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 492,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-5 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[8px] font-black text-white/20 uppercase",
                                                    children: "MEVKİİ"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 514,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: filter.position,
                                                    onChange: (e)=>setFilter({
                                                            ...filter,
                                                            position: e.target.value
                                                        }),
                                                    className: "w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-500",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "ALL",
                                                            children: "HEPSİ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 520,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                                                            label: "🏆 Kaleci",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "GK",
                                                                children: "GK — Kaleci"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                lineNumber: 522,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 521,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                                                            label: "🛡️ Defans",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "DEF",
                                                                    children: "Tüm Defans"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 525,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "CB",
                                                                    children: "CB — Stoper"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 526,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "LB",
                                                                    children: "LB — Sol Bek"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 527,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "RB",
                                                                    children: "RB — Sağ Bek"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 528,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "LWB",
                                                                    children: "LWB — Sol Kanat Bek"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 529,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "RWB",
                                                                    children: "RWB — Sağ Kanat Bek"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 530,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 524,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                                                            label: "⚙️ Orta Saha",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "MID",
                                                                    children: "Tüm Orta Saha"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 533,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "CDM",
                                                                    children: "CDM — Defansif Orta Saha"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 534,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "CM",
                                                                    children: "CM — Merkez Orta Saha"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 535,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "CAM",
                                                                    children: "CAM — Ofansif Orta Saha"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 536,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "LM",
                                                                    children: "LM — Sol Açık"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "RM",
                                                                    children: "RM — Sağ Açık"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 538,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "LW",
                                                                    children: "LW — Sol Kanat"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 539,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "RW",
                                                                    children: "RW — Sağ Kanat"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 540,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 532,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                                                            label: "⚡ Forvet",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "FWD",
                                                                    children: "Tüm Forvet"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 543,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "CF",
                                                                    children: "CF — Göbek Forvet"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 544,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "ST",
                                                                    children: "ST — Santrfor"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 545,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 542,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 513,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[8px] font-black text-white/20 uppercase",
                                                    children: "KALİTE (Klt)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 552,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            value: filter.minKlt,
                                                            onChange: (e)=>setFilter({
                                                                    ...filter,
                                                                    minKlt: Number(e.target.value)
                                                                }),
                                                            placeholder: "Min",
                                                            className: "w-1/2 bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black text-white outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 554,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            value: filter.maxKlt,
                                                            onChange: (e)=>setFilter({
                                                                    ...filter,
                                                                    maxKlt: Number(e.target.value)
                                                                }),
                                                            placeholder: "Max",
                                                            className: "w-1/2 bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black text-white outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 561,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 553,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 551,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrFilter, {
                                            label: "ÖZELLİK 1",
                                            value: filter.attr1,
                                            onChange: (val)=>setFilter({
                                                    ...filter,
                                                    attr1: val
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 572,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrFilter, {
                                            label: "ÖZELLİK 2",
                                            value: filter.attr2,
                                            onChange: (val)=>setFilter({
                                                    ...filter,
                                                    attr2: val
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 578,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AttrFilter, {
                                            label: "ÖZELLİK 3",
                                            value: filter.attr3,
                                            onChange: (val)=>setFilter({
                                                    ...filter,
                                                    attr3: val
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 584,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 511,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 491,
                            columnNumber: 15
                        }, this),
                        sortedAndFilteredListings.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-20 text-center space-y-4 opacity-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                    size: 48,
                                    className: "mx-auto"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 594,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-black uppercase tracking-[.2em]",
                                    children: "Sonuç bulunamadı."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 595,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 593,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-x-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full border-collapse",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-4 px-6",
                                                    children: "OYUNCU"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Klt'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Klt ",
                                                        sortConfig.key === 'Klt' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 603,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Klc'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Klc ",
                                                        sortConfig.key === 'Klc' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 604,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Tk'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Tk ",
                                                        sortConfig.key === 'Tk' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 605,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Pas'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Pas ",
                                                        sortConfig.key === 'Pas' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 606,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Sut'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Şut ",
                                                        sortConfig.key === 'Sut' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 607,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Kfa'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Kfa ",
                                                        sortConfig.key === 'Kfa' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 608,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Hız'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Hız ",
                                                        sortConfig.key === 'Hız' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 609,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Güç'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Güç ",
                                                        sortConfig.key === 'Güç' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 610,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Alg'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Alg ",
                                                        sortConfig.key === 'Alg' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 611,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Top'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Top ",
                                                        sortConfig.key === 'Top' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 612,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('Tplm'),
                                                    className: "p-4 text-center cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "Tplm ",
                                                        sortConfig.key === 'Tplm' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 613,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    onClick: ()=>toggleSort('price'),
                                                    className: "p-4 text-right cursor-pointer hover:text-white transition-colors",
                                                    children: [
                                                        "BEDEL ",
                                                        sortConfig.key === 'price' && (sortConfig.direction === 'desc' ? '▼' : '▲')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 614,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "p-4 text-right",
                                                    children: "TEKLİF"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "p-4 text-center",
                                                    children: "SÜRE"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "p-4 text-center",
                                                    children: "DURUM"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 617,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 601,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 600,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        className: "divide-y divide-white/5",
                                        children: sortedAndFilteredListings.map((listing)=>{
                                            const p = listing.player_data;
                                            const totalStats = (p.Klt || p.rating) + (p.Klc || 0) + (p.Tk || 0) + (p.Pas || 0) + (p.Sut || 0) + (p.Kfa || 0) + (p.Hız || 0) + (p.Güç || 0) + (p.Alg || 0) + (p.Top || 0);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].tr, {
                                                layoutId: listing.id,
                                                onClick: ()=>onListingClick?.(listing),
                                                className: "group hover:bg-white/5 transition-colors cursor-pointer text-[11px] font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-4 px-6",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black italic border border-white/10 group-hover:bg-emerald-500 group-hover:text-black transition-colors",
                                                                    children: p?.specific_position || p?.position || '??'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 633,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[13px] font-black italic tracking-tighter truncate max-w-[120px]",
                                                                            children: [
                                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p?.name),
                                                                                listing.is_auction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "ml-1 px-1 py-px rounded text-[6px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/20",
                                                                                    children: "ARTIRMA"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                                    lineNumber: 639,
                                                                                    columnNumber: 39
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                            lineNumber: 637,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[8px] font-black text-white/30 uppercase tracking-widest truncate max-w-[120px]",
                                                                            children: listing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                children: [
                                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(listing.seller_name || ''),
                                                                                    listing.seller_name && listing.seller_name !== profile?.team_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "ml-1 text-cyan-400/50",
                                                                                        children: "🤖"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                                        lineNumber: 649,
                                                                                        columnNumber: 43
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                            lineNumber: 644,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 636,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 632,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 631,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-emerald-400 font-black",
                                                        children: p?.Klt || p?.rating || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 657,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Klc || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 658,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Tk || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 659,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Pas || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 660,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Sut || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 661,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Kfa || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 662,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Hız || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Güç || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 664,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Alg || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 665,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center text-white/60",
                                                        children: p?.Top || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 666,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center font-black",
                                                        children: totalStats
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 667,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-right text-emerald-500/80 font-mono text-[10px]",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.price)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 668,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-right font-mono text-[10px]",
                                                        children: listing.is_auction ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: listing.current_bid ? 'text-amber-400' : 'text-white/40',
                                                                    children: listing.current_bid ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.current_bid) : 'Henüz teklif yok'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 672,
                                                                    columnNumber: 35
                                                                }, this),
                                                                listing.bid_count && listing.bid_count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[8px] text-white/20",
                                                                    children: [
                                                                        listing.bid_count,
                                                                        " teklif"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 676,
                                                                    columnNumber: 37
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 671,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-emerald-500/80",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.price)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 680,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 669,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center",
                                                        children: listing.is_auction ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuctionTimer, {
                                                            expiresAt: listing.expires_at
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 684,
                                                            columnNumber: 53
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[9px] text-white/20",
                                                            children: "—"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 684,
                                                            columnNumber: 103
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 683,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 text-center",
                                                        children: listing.is_auction ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleBid(listing);
                                                            },
                                                            disabled: listing.seller_id === userId || loading,
                                                            className: `px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${listing.seller_id === userId ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                                                    size: 10,
                                                                    className: "inline mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 697,
                                                                    columnNumber: 35
                                                                }, this),
                                                                "Teklif Ver"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 688,
                                                            columnNumber: 33
                                                        }, this) : listing.seller_id === 'free-agent-system' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setContractListing(listing);
                                                                setContractMode('free-agent');
                                                            },
                                                            disabled: loading,
                                                            className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                    size: 10,
                                                                    className: "inline mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 706,
                                                                    columnNumber: 35
                                                                }, this),
                                                                "Sozlesme Teklifi"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 701,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleBuy(listing);
                                                            },
                                                            disabled: loading,
                                                            className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all",
                                                            children: "Satın Al"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 710,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 686,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, listing.id, true, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 625,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 620,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 599,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 598,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 border-t border-white/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "text-cyan-500",
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 731,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-[11px] font-black uppercase tracking-widest text-white/60",
                                                    children: "Kiralık Listesine Gönder"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 732,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 730,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[9px] text-white/25 uppercase tracking-widest",
                                            children: [
                                                squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).length,
                                                " UYGun OYUNCU"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 734,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 729,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-4 pb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10",
                                        children: [
                                            squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).map((player)=>{
                                                const loanFee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(player.market_value || (player.rating || 50) * 50000, profile?.current_day || 1);
                                                const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                                                const posColor = (()=>{
                                                    const pos = player.specificPosition || player.position;
                                                    if (pos === 'GK') return 'border-yellow-500/30 bg-yellow-500/5';
                                                    if ([
                                                        'CB',
                                                        'LB',
                                                        'RB',
                                                        'LWB',
                                                        'RWB'
                                                    ].includes(pos || '')) return 'border-blue-500/30 bg-blue-500/5';
                                                    if ([
                                                        'CDM',
                                                        'CM',
                                                        'CAM',
                                                        'LM',
                                                        'RM',
                                                        'LW',
                                                        'RW'
                                                    ].includes(pos || '')) return 'border-green-500/30 bg-green-500/5';
                                                    return 'border-red-500/30 bg-red-500/5';
                                                })();
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex items-center gap-2 p-2 rounded-lg border ${posColor} hover:border-cyan-500/50 transition-all group/loan`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 rounded-md flex items-center justify-center text-[8px] font-black bg-black/30 shrink-0",
                                                            children: player.specificPosition || player.position
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 760,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[10px] font-black truncate",
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 764,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[8px] text-white/30",
                                                                    children: [
                                                                        "Klt ",
                                                                        player.rating,
                                                                        " • ",
                                                                        feeStr
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 765,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 763,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleLoanPlayer(player);
                                                            },
                                                            className: "shrink-0 px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500 hover:text-white transition-all opacity-60 group-hover/loan:opacity-100",
                                                            title: "Kiralık Olarak Gönder",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                                    size: 10,
                                                                    className: "inline mr-0.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 775,
                                                                    columnNumber: 31
                                                                }, this),
                                                                "Kiralık"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 767,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, player.id, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 756,
                                                    columnNumber: 27
                                                }, this);
                                            }),
                                            squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "col-span-full py-6 text-center text-[10px] text-white/20 uppercase",
                                                children: "Kiralığa gönderilecek uygun oyuncu yok"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 782,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 739,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 738,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 728,
                            columnNumber: 15
                        }, this)
                    ]
                }, "market", true, {
                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                    lineNumber: 484,
                    columnNumber: 11
                }, this) : activeSubTab === 'auctions' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-white/5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                        className: "text-amber-500",
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 795,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-black uppercase tracking-widest text-white/80",
                                        children: "Açık Artırmalarım"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 796,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 794,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 793,
                            columnNumber: 13
                        }, this),
                        myAuctions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-20 text-center space-y-4 opacity-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                    size: 48,
                                    className: "mx-auto"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 801,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-black uppercase tracking-[.2em]",
                                    children: "Aktif artırmanız yok."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 802,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 800,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "divide-y divide-white/5",
                            children: myAuctions.map((listing)=>{
                                const p = listing.player_data;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-black border border-white/10",
                                            children: p?.specific_position || p?.position || '??'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 810,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[13px] font-black italic tracking-tighter truncate",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p?.name)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 814,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] text-white/30",
                                                    children: [
                                                        "Başlangıç: ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.starting_price || listing.price),
                                                        listing.current_bid && ` | En Yüksek: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(listing.current_bid)}`,
                                                        listing.bid_count && ` | ${listing.bid_count} teklif`
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 815,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 813,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuctionTimer, {
                                            expiresAt: listing.expires_at
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 821,
                                            columnNumber: 23
                                        }, this),
                                        !listing.bid_count && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleCancelAuction(listing.id),
                                            className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                    size: 10,
                                                    className: "inline mr-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 827,
                                                    columnNumber: 27
                                                }, this),
                                                "İptal"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 823,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, listing.id, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 809,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 805,
                            columnNumber: 15
                        }, this),
                        wonAuctions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 border-t border-white/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 border-b border-white/5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__["Handshake"], {
                                                className: "text-emerald-500",
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 842,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "text-sm font-black uppercase tracking-widest text-white/80",
                                                        children: "Kazanilan Artirmalar"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 844,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-white/30 uppercase tracking-widest",
                                                        children: "Sozlesme imzalamak icin tiklayin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                        lineNumber: 845,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 843,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 841,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 840,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "divide-y divide-white/5",
                                    children: wonAuctions.map((listing)=>{
                                        const p = listing.player_data;
                                        const bidAmount = listing.current_bid || listing.price;
                                        const penaltyAmount = Math.round(bidAmount * 0.05);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 flex items-center gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-[10px] font-black border border-emerald-500/20 text-emerald-400",
                                                    children: p?.specific_position || p?.position || '??'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 856,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[13px] font-black italic tracking-tighter truncate",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p?.name)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 860,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-white/30",
                                                            children: [
                                                                "Kazandiginiz Teklif: ",
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(bidAmount)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 861,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 859,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                setContractListing(listing);
                                                                setContractMode('auction-win');
                                                            },
                                                            className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 870,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Sozlesme Imzala"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 866,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: async ()=>{
                                                                if (!confirm(`Vazgecerseniz teklif bedelinin %5'i (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(penaltyAmount)}) saticiya tazminat olarak odenecektir. Emin misiniz?`)) return;
                                                                try {
                                                                    const res = await fetch('/api/contract-offer', {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({
                                                                            listingId: listing.id,
                                                                            playerId: listing.player_id,
                                                                            buyerId: userId,
                                                                            giveUp: true,
                                                                            auctionBidAmount: bidAmount
                                                                        })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.gaveUp) {
                                                                        alert(`Vazgecildi. ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(data.penalty)} tazminat odediniz.`);
                                                                        onSetProfile({
                                                                            ...profile,
                                                                            money: profile.money - data.penalty
                                                                        });
                                                                        fetchData();
                                                                    } else {
                                                                        alert(data.reason || 'Islem basarisiz.');
                                                                    }
                                                                } catch (err) {
                                                                    alert('Bir hata olustu.');
                                                                }
                                                            },
                                                            className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-all flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 902,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Vazgec"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 873,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 865,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, listing.id, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 855,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 849,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 839,
                            columnNumber: 15
                        }, this)
                    ]
                }, "auctions", true, {
                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                    lineNumber: 791,
                    columnNumber: 11
                }, this) : activeSubTab === 'rankings' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-white/5 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                className: "text-amber-500",
                                                size: 24
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 918,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 917,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-xl font-black italic uppercase tracking-tighter",
                                                    children: "Dünya Sıralaması"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 921,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] font-bold text-white/30 uppercase tracking-widest text-emerald-400",
                                                    children: "En Hazır Kulüpler"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 922,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 920,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 916,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg",
                                        children: [
                                            leaderboard.length,
                                            " AKTİF MENAJER"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 926,
                                        columnNumber: 20
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 925,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 915,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "divide-y divide-white/5",
                            children: leaderboard.map((user, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setSelectedTeamProfile(user.team_name),
                                    className: `flex items-center gap-4 p-5 hover:bg-white/5 transition-all cursor-pointer group ${user.id === userId ? 'bg-white/5' : ''}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 text-center text-xs font-black text-white/20 group-hover:text-amber-400 transition-colors",
                                            children: [
                                                "#",
                                                idx + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 937,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                className: idx < 3 ? 'text-amber-400' : 'text-white/40',
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 939,
                                                columnNumber: 26
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 938,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-black italic tracking-tighter",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(user.team_name)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 942,
                                                    columnNumber: 26
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] font-bold text-white/30 uppercase tracking-widest",
                                                    children: user.id === userId ? 'SENİN TAKIMIN' : 'RAKİP'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 943,
                                                    columnNumber: 26
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 941,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-black font-mono text-emerald-400",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(user.money)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 946,
                                                    columnNumber: 26
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] font-bold text-white/20 uppercase tracking-widest",
                                                    children: "BÜTÇE"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 947,
                                                    columnNumber: 26
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 945,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, user.id, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 932,
                                    columnNumber: 20
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 930,
                            columnNumber: 14
                        }, this)
                    ]
                }, "rankings", true, {
                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                    lineNumber: 914,
                    columnNumber: 11
                }, this) : activeSubTab === 'loans' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 border-b border-white/5 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "text-cyan-500",
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 961,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-black uppercase tracking-widest text-white/80",
                                                    children: "Kiralık Oyuncular"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 962,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 960,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-black text-white/40 uppercase tracking-widest",
                                            children: [
                                                loanPlayers.length,
                                                " OYUNCU MEVCUT"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 964,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 959,
                                    columnNumber: 15
                                }, this),
                                loanPlayers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "py-20 text-center space-y-4 opacity-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            size: 48,
                                            className: "mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 970,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-black uppercase tracking-[.2em]",
                                            children: "Kiralık oyuncu bulunmuyor."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 971,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-white/30",
                                            children: "Diğer takımlar oyuncularını kiralık pazara çıkardığında burada görünecek."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 972,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 969,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "divide-y divide-white/5",
                                    children: loanPlayers.map((lp)=>{
                                        const p = lp;
                                        const loanFee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(p.market_value || (p.rating || 50) * 50000, profile?.current_day || 1);
                                        const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 flex items-center gap-4 hover:bg-white/5 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-[10px] font-black border border-cyan-500/20 text-cyan-400",
                                                    children: p.specific_position || p.position || '??'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 982,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[13px] font-black italic tracking-tighter truncate",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p.name)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 986,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-white/30",
                                                            children: [
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p.team_name || 'Bilinmeyen'),
                                                                " • ",
                                                                p.age,
                                                                " YAŞ • Klt ",
                                                                p.klt || p.rating || 0
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 987,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 985,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[11px] font-black text-cyan-400",
                                                            children: feeStr
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 992,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[8px] text-white/20 uppercase",
                                                            children: "Kiralık Ücret (Euro)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 993,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 991,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: async ()=>{
                                                        if (!confirm(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(p.name)} oyuncusunu ${feeStr} + 10 Kredi karşılığında kiralamak istiyor musunuz?\n\n• ${feeStr} oyuncu sahibine ödenecek\n• 10 Kredi sistem komisyonu olarak düşülecek`)) return;
                                                        try {
                                                            const res = await fetch('/api/loans/request', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json'
                                                                },
                                                                body: JSON.stringify({
                                                                    playerId: lp.id,
                                                                    profileId: userId
                                                                })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                alert(`Oyuncu başarıyla kiralandı!\n• ${data.loanFeeEuroFormatted || ''} oyuncu sahibine ödendi\n• 10 Kredi sistem komisyonu düşüldü\nSezon sonunda oyuncu geri dönecek.`);
                                                                fetchData();
                                                            } else {
                                                                alert(data.error || 'Kiralama başarısız.');
                                                            }
                                                        } catch (err) {
                                                            alert('Bir hata oluştu.');
                                                        }
                                                    },
                                                    className: "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300 transition-all",
                                                    children: "Kirala (10 KR + Euro)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 995,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, lp.id, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 981,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 975,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 958,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 border-b border-white/5 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "text-cyan-400",
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 1030,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-[11px] font-black uppercase tracking-widest text-white/60",
                                                    children: "Kiralık Listesine Gönder"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 1031,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1029,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[9px] text-white/25 uppercase tracking-widest",
                                            children: [
                                                squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).length,
                                                " UYGUN OYUNCU"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1033,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1028,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10",
                                        children: [
                                            squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).map((player)=>{
                                                const loanFee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(player.market_value || (player.rating || 50) * 50000, profile?.current_day || 1);
                                                const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                                                const posColor = (()=>{
                                                    const pos = player.specificPosition || player.position;
                                                    if (pos === 'GK') return 'border-yellow-500/30 bg-yellow-500/5';
                                                    if ([
                                                        'CB',
                                                        'LB',
                                                        'RB',
                                                        'LWB',
                                                        'RWB'
                                                    ].includes(pos || '')) return 'border-blue-500/30 bg-blue-500/5';
                                                    if ([
                                                        'CDM',
                                                        'CM',
                                                        'CAM',
                                                        'LM',
                                                        'RM',
                                                        'LW',
                                                        'RW'
                                                    ].includes(pos || '')) return 'border-green-500/30 bg-green-500/5';
                                                    return 'border-red-500/30 bg-red-500/5';
                                                })();
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex items-center gap-2 p-2.5 rounded-lg border ${posColor} hover:border-cyan-500/50 transition-all group/loan`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-black bg-black/30 shrink-0",
                                                            children: player.specificPosition || player.position
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 1059,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[10px] font-black truncate",
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(player.name)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 1063,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[8px] text-white/30",
                                                                    children: [
                                                                        "Klt ",
                                                                        player.rating,
                                                                        " • ",
                                                                        feeStr
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 1064,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 1062,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleLoanPlayer(player);
                                                            },
                                                            className: "shrink-0 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500 hover:text-white transition-all",
                                                            title: "Kiralık Olarak Gönder",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                                    size: 10,
                                                                    className: "inline mr-0.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                                    lineNumber: 1074,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Kiralık Gönder"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                            lineNumber: 1066,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, player.id, true, {
                                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                    lineNumber: 1055,
                                                    columnNumber: 25
                                                }, this);
                                            }),
                                            squad.filter((p)=>!p.is_injured && !p.is_on_loan_market && !p.loan_status).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "col-span-full py-8 text-center text-[10px] text-white/20 uppercase",
                                                children: "Kiralığa gönderilecek uygun oyuncu yok"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                                lineNumber: 1081,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 1038,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1037,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 1027,
                            columnNumber: 13
                        }, this)
                    ]
                }, "loans", true, {
                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                    lineNumber: 955,
                    columnNumber: 11
                }, this) : null
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 482,
                columnNumber: 7
            }, this),
            contractListing && contractMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ContractOfferModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                listing: contractListing,
                profile: profile,
                isAuctionWin: contractMode === 'auction-win',
                auctionBidAmount: contractMode === 'auction-win' ? contractListing.current_bid || contractListing.price : undefined,
                onClose: ()=>{
                    setContractListing(null);
                    setContractMode(null);
                },
                onOfferResult: (result)=>{
                    if (result.accepted) {
                        const newSquad = [
                            ...squad,
                            result.player
                        ];
                        onSetSquad(newSquad);
                        // Update credits and money
                        const updatedProfile = {
                            ...profile
                        };
                        updatedProfile.credits = (profile.credits || 0) - (result.signingFee || 0);
                        if (contractMode === 'free-agent') {
                            updatedProfile.money = profile.money - contractListing.price;
                        }
                        onSetProfile(updatedProfile);
                        alert('Sozlesme basariyla imzalandi! Oyuncu kadronuza katildi.');
                        fetchData();
                    }
                    setContractListing(null);
                    setContractMode(null);
                }
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 1094,
                columnNumber: 9
            }, this),
            showCreditPurchase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$CreditPurchaseModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                currentCredits: profile?.credits || 0,
                userId: userId,
                onClose: ()=>setShowCreditPurchase(false),
                onPurchase: (credits)=>{
                    if (profile) {
                        const updatedProfile = {
                            ...profile,
                            credits: (profile.credits || 0) + credits
                        };
                        onSetProfile(updatedProfile);
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 1122,
                columnNumber: 9
            }, this),
            loanModalPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                exit: {
                    opacity: 0
                },
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm",
                onClick: ()=>setLoanModalPlayer(null),
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
                    className: "bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 bg-cyan-500/15 rounded-xl flex items-center justify-center text-sm font-black border border-cyan-500/30 text-cyan-400",
                                    children: loanModalPlayer.specificPosition || loanModalPlayer.position
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1152,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-black",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toTitleCase"])(loanModalPlayer.name)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1156,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-white/40",
                                            children: [
                                                "Klt ",
                                                loanModalPlayer.rating,
                                                " • ",
                                                loanModalPlayer.age,
                                                " YAŞ • ",
                                                loanModalPlayer.specificPosition || loanModalPlayer.position
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1157,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1155,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 1151,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3 mb-4 space-y-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-[10px] text-cyan-300/80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1166,
                                            columnNumber: 17
                                        }, this),
                                        "Kiralık ücret: Oyuncu piyasasına göre otomatik hesaplanır"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1165,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-[10px] text-cyan-300/80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1170,
                                            columnNumber: 17
                                        }, this),
                                        "10 Kredi komisyon kiracıdan alınır"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1169,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-[10px] text-cyan-300/80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1174,
                                            columnNumber: 17
                                        }, this),
                                        "Kiralık ücret (Euro) oyuncu sahibine ödenir"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1173,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-[10px] text-cyan-300/80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                            lineNumber: 1178,
                                            columnNumber: 17
                                        }, this),
                                        "Sezon sonunda oyuncu otomatik olarak geri döner"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1177,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 1164,
                            columnNumber: 13
                        }, this),
                        (()=>{
                            const fee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$inflation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLoanFeeEuro"])(loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000, profile?.current_day || 1);
                            const feeStr = fee >= 1_000_000 ? `${(fee / 1_000_000).toFixed(1)}M €` : fee >= 1_000 ? `${(fee / 1_000).toFixed(0)}K €` : `${fee} €`;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[8px] font-black text-white/30 uppercase tracking-widest mb-1",
                                        children: "Hesaplanan Kiralık Ücret"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 1192,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xl font-black text-cyan-400",
                                        children: feeStr
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 1193,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[8px] text-white/20 mt-1",
                                        children: [
                                            "Piyasa değeri: ",
                                            (()=>{
                                                const mv = loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000;
                                                return mv >= 1_000_000 ? `${(mv / 1_000_000).toFixed(1)}M €` : mv >= 1_000 ? `${(mv / 1_000).toFixed(0)}K €` : `${mv} €`;
                                            })(),
                                            " × 15% × enflasyon"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                        lineNumber: 1194,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                lineNumber: 1191,
                                columnNumber: 17
                            }, this);
                        })(),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setLoanModalPlayer(null),
                                    className: "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all",
                                    children: "İptal"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1206,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleLoanSubmit,
                                    disabled: loanSubmitting,
                                    className: "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    children: loanSubmitting ? 'Gönderiliyor...' : 'Kiralık Listesine Gönder'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                                    lineNumber: 1212,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                            lineNumber: 1205,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                    lineNumber: 1144,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
                lineNumber: 1137,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/MultiplayerTab.tsx",
        lineNumber: 438,
        columnNumber: 5
    }, this);
}
_s1(MultiplayerTab, "HClca6OouXLIavetJBEAa3qWfa4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"]
    ];
});
_c2 = MultiplayerTab;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AttrFilter");
__turbopack_context__.k.register(_c1, "AuctionTimer");
__turbopack_context__.k.register(_c2, "MultiplayerTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_MultiplayerTab_tsx_9175d308._.js.map