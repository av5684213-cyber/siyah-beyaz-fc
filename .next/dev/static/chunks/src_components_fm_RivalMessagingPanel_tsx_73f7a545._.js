(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/RivalMessagingPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RivalMessagingPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-client] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/handshake.js [app-client] (ecmascript) <export default as Handshake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$party$2d$popper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PartyPopper$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/party-popper.js [app-client] (ecmascript) <export default as PartyPopper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check-check.js [app-client] (ecmascript) <export default as CheckCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/unifiedMessagingService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// ─── Message Category Icon Map ────────────────────────────────────
const CATEGORY_ICONS = {
    general: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 60,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0)),
    trash_talk: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 61,
        columnNumber: 15
    }, ("TURBOPACK compile-time value", void 0)),
    transfer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 62,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    alliance: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__["Handshake"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 63,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    friendly_invite: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 64,
        columnNumber: 20
    }, ("TURBOPACK compile-time value", void 0)),
    season_greeting: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$party$2d$popper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PartyPopper$3e$__["PartyPopper"], {
        size: 12
    }, void 0, false, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 65,
        columnNumber: 20
    }, ("TURBOPACK compile-time value", void 0))
};
// ─── Time Formatting ──────────────────────────────────────────────
function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'şimdi';
    if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
}
function RivalMessagingPanel({ userId, userName, teamName }) {
    _s();
    const { directMessageRecipient, setDirectMessageRecipient } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    // Panel state
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('conversations');
    // Data state
    const [conversations, setConversations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeConversation, setActiveConversation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [presences, setPresences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [totalUnread, setTotalUnread] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Input state
    const [inputText, setInputText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('general');
    const [showCategories, setShowCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showQuickReplies, setShowQuickReplies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSending, setIsSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingMore, setIsLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const messagesContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const convChannelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const msgChannelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ─── Load conversations ───────────────────────────────────────
    const loadConversations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[loadConversations]": async ()=>{
            if (!userId) return;
            const { conversations: convs } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMyConversations"])(userId);
            if (convs) {
                setConversations(convs);
                // Load presence for conversation partners
                const ids = convs.map({
                    "RivalMessagingPanel.useCallback[loadConversations].ids": (c)=>c.participant1 === userId ? c.participant2 : c.participant1
                }["RivalMessagingPanel.useCallback[loadConversations].ids"]);
                if (ids.length > 0) {
                    const { presences: pList } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMultiplePresence"])(ids);
                    if (pList) {
                        const map = new Map();
                        pList.forEach({
                            "RivalMessagingPanel.useCallback[loadConversations]": (p)=>map.set(p.profileId, p)
                        }["RivalMessagingPanel.useCallback[loadConversations]"]);
                        setPresences(map);
                    }
                }
            }
        }
    }["RivalMessagingPanel.useCallback[loadConversations]"], [
        userId
    ]);
    // ─── Load unread count ────────────────────────────────────────
    const loadUnreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[loadUnreadCount]": async ()=>{
            if (!userId) return;
            const { count } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTotalUnreadCount"])(userId);
            setTotalUnread(count);
        }
    }["RivalMessagingPanel.useCallback[loadUnreadCount]"], [
        userId
    ]);
    // ─── Open conversation ────────────────────────────────────────
    const openConversation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[openConversation]": async (conv)=>{
            setActiveConversation(conv);
            setView('chat');
            setMessages([]);
            setSelectedCategory('general');
            setShowCategories(false);
            setShowQuickReplies(false);
            // Load messages
            const { messages: msgs } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getConversationMessages"])(conv.id, userId);
            if (msgs) {
                setMessages(msgs);
            }
            // Subscribe to this conversation's messages
            if (msgChannelRef.current) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsubscribeFromChannel"])(msgChannelRef.current);
            }
            msgChannelRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToConversationMessages"])(conv.id, {
                "RivalMessagingPanel.useCallback[openConversation]": (msg)=>{
                    setMessages({
                        "RivalMessagingPanel.useCallback[openConversation]": (prev)=>{
                            if (prev.some({
                                "RivalMessagingPanel.useCallback[openConversation]": (m)=>m.id === msg.id
                            }["RivalMessagingPanel.useCallback[openConversation]"])) return prev;
                            return [
                                ...prev,
                                msg
                            ];
                        }
                    }["RivalMessagingPanel.useCallback[openConversation]"]);
                }
            }["RivalMessagingPanel.useCallback[openConversation]"]);
            // Mark as read
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markMessagesAsRead"])(conv.id, userId);
            await loadUnreadCount();
        }
    }["RivalMessagingPanel.useCallback[openConversation]"], [
        userId,
        loadUnreadCount
    ]);
    // ─── Handle direct message recipient from outside ─────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RivalMessagingPanel.useEffect": ()=>{
            if (directMessageRecipient) {
                setTimeout({
                    "RivalMessagingPanel.useEffect": async ()=>{
                        setIsOpen(true);
                        const otherId = directMessageRecipient.id;
                        const otherName = directMessageRecipient.team_name || directMessageRecipient.manager_name || '';
                        const { conversation } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOrCreateConversation"])(userId, otherId, otherName);
                        if (conversation) {
                            // Find or create conv in list
                            const existingConv = conversations.find({
                                "RivalMessagingPanel.useEffect.existingConv": (c)=>c.id === conversation.id
                            }["RivalMessagingPanel.useEffect.existingConv"]);
                            if (existingConv) {
                                await openConversation(existingConv);
                            } else {
                                const convWithMeta = {
                                    ...conversation,
                                    otherManagerName: otherName,
                                    otherManagerTeam: directMessageRecipient.team_name || '',
                                    unreadCount: 0
                                };
                                await openConversation(convWithMeta);
                            }
                        }
                        setDirectMessageRecipient(null);
                    }
                }["RivalMessagingPanel.useEffect"], 0);
            }
        }
    }["RivalMessagingPanel.useEffect"], [
        directMessageRecipient,
        setDirectMessageRecipient,
        userId,
        conversations,
        openConversation
    ]);
    // ─── Initialize ───────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RivalMessagingPanel.useEffect": ()=>{
            if (!userId || !isOpen) return;
            loadConversations();
            loadUnreadCount();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateMyPresence"])(userId, true, 'Çevrimiçi');
            // Subscribe to global conversation updates
            convChannelRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToDirectMessages"])(userId, {
                "RivalMessagingPanel.useEffect": (msg)=>{
                    // New message in any conversation
                    if (activeConversation && msg.conversationId === activeConversation.id) {
                        setMessages({
                            "RivalMessagingPanel.useEffect": (prev)=>{
                                if (prev.some({
                                    "RivalMessagingPanel.useEffect": (m)=>m.id === msg.id
                                }["RivalMessagingPanel.useEffect"])) return prev;
                                return [
                                    ...prev,
                                    msg
                                ];
                            }
                        }["RivalMessagingPanel.useEffect"]);
                    }
                    loadUnreadCount();
                    loadConversations();
                }
            }["RivalMessagingPanel.useEffect"], {
                "RivalMessagingPanel.useEffect": ()=>{
                    loadConversations();
                }
            }["RivalMessagingPanel.useEffect"]);
            return ({
                "RivalMessagingPanel.useEffect": ()=>{
                    if (convChannelRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsubscribeFromChannel"])(convChannelRef.current);
                    if (msgChannelRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsubscribeFromChannel"])(msgChannelRef.current);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateMyPresence"])(userId, false, 'Çevrimdışı');
                }
            })["RivalMessagingPanel.useEffect"];
        }
    }["RivalMessagingPanel.useEffect"], [
        userId,
        isOpen
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    // ─── Auto-scroll ──────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RivalMessagingPanel.useEffect": ()=>{
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["RivalMessagingPanel.useEffect"], [
        messages
    ]);
    // ─── Send message ─────────────────────────────────────────────
    const handleSend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[handleSend]": async ()=>{
            if (!inputText.trim() || !activeConversation || isSending) return;
            setIsSending(true);
            try {
                const { message } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendDirectMessage"])(activeConversation.id, userId, inputText, selectedCategory);
                if (message) {
                    setMessages({
                        "RivalMessagingPanel.useCallback[handleSend]": (prev)=>{
                            if (prev.some({
                                "RivalMessagingPanel.useCallback[handleSend]": (m)=>m.id === message.id
                            }["RivalMessagingPanel.useCallback[handleSend]"])) return prev;
                            return [
                                ...prev,
                                message
                            ];
                        }
                    }["RivalMessagingPanel.useCallback[handleSend]"]);
                    setInputText('');
                    loadConversations();
                    loadUnreadCount();
                }
            } catch (err) {
                console.error('Send error:', err);
            } finally{
                setIsSending(false);
            }
        }
    }["RivalMessagingPanel.useCallback[handleSend]"], [
        inputText,
        activeConversation,
        userId,
        selectedCategory,
        isSending,
        loadConversations,
        loadUnreadCount
    ]);
    // ─── Search rivals ────────────────────────────────────────────
    const handleSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[handleSearch]": async (query)=>{
            setSearchQuery(query);
            if (query.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            const { managers } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["searchRivalManagers"])(userId, query);
            if (managers) setSearchResults(managers);
        }
    }["RivalMessagingPanel.useCallback[handleSearch]"], [
        userId
    ]);
    // ─── Start new conversation ───────────────────────────────────
    const startNewConversation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[startNewConversation]": async (manager)=>{
            const { conversation } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOrCreateConversation"])(userId, manager.id, manager.managerName);
            if (conversation) {
                const convWithMeta = {
                    ...conversation,
                    otherManagerName: manager.teamName || manager.managerName,
                    otherManagerTeam: manager.teamName || '',
                    unreadCount: 0
                };
                await openConversation(convWithMeta);
                setSearchQuery('');
                setSearchResults([]);
            }
        }
    }["RivalMessagingPanel.useCallback[startNewConversation]"], [
        userId,
        openConversation
    ]);
    // ─── Delete message ───────────────────────────────────────────
    const handleDeleteMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[handleDeleteMessage]": async (msgId)=>{
            const { success } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteMessage"])(msgId, userId);
            if (success) {
                setMessages({
                    "RivalMessagingPanel.useCallback[handleDeleteMessage]": (prev)=>prev.filter({
                            "RivalMessagingPanel.useCallback[handleDeleteMessage]": (m)=>m.id !== msgId
                        }["RivalMessagingPanel.useCallback[handleDeleteMessage]"])
                }["RivalMessagingPanel.useCallback[handleDeleteMessage]"]);
            }
        }
    }["RivalMessagingPanel.useCallback[handleDeleteMessage]"], [
        userId
    ]);
    // ─── Get other participant info ───────────────────────────────
    const getOtherInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RivalMessagingPanel.useCallback[getOtherInfo]": (conv)=>{
            const isP1 = conv.participant1 === userId;
            const otherId = isP1 ? conv.participant2 : conv.participant1;
            const convWithMeta = conversations.find({
                "RivalMessagingPanel.useCallback[getOtherInfo].convWithMeta": (c)=>c.id === conv.id
            }["RivalMessagingPanel.useCallback[getOtherInfo].convWithMeta"]);
            return {
                otherId,
                name: convWithMeta?.otherManagerName || 'Bilinmeyen',
                team: convWithMeta?.otherManagerTeam || '',
                isOnline: presences.get(otherId)?.isOnline || false
            };
        }
    }["RivalMessagingPanel.useCallback[getOtherInfo]"], [
        userId,
        conversations,
        presences
    ]);
    // ─── Render: Conversation List Item ───────────────────────────
    const renderConversationItem = (conv)=>{
        const info = getOtherInfo(conv);
        const isActive = activeConversation?.id === conv.id;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
            onClick: ()=>openConversation(conv),
            className: `w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent'}`,
            whileTap: {
                scale: 0.98
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60",
                            children: info.name.charAt(0).toUpperCase()
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 340,
                            columnNumber: 11
                        }, this),
                        info.isOnline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 344,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                    lineNumber: 339,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-bold text-white truncate",
                                    children: info.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 351,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] text-white/30 shrink-0 ml-2",
                                    children: formatTimeAgo(conv.lastMessageAt)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 352,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 350,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mt-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-white/40 truncate pr-2",
                                    children: conv.lastMessageContent || 'Henüz mesaj yok'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 355,
                                    columnNumber: 13
                                }, this),
                                (conv.unreadCount || 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "shrink-0 min-w-[18px] h-[18px] bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center",
                                    children: conv.unreadCount
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 359,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 354,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                    lineNumber: 349,
                    columnNumber: 9
                }, this)
            ]
        }, conv.id, true, {
            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
            lineNumber: 330,
            columnNumber: 7
        }, this);
    };
    // ─── Render: Message Bubble ───────────────────────────────────
    const renderMessageBubble = (msg)=>{
        const isMine = msg.senderId === userId;
        const categoryMeta = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"][msg.messageType] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"].general;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                y: 8
            },
            animate: {
                opacity: 1,
                y: 0
            },
            className: `flex ${isMine ? 'justify-end' : 'justify-start'} group`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `max-w-[85%] relative ${isMine ? 'bg-red-600/20 border border-red-500/20 rounded-2xl rounded-br-sm' : 'bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm'}`,
                children: [
                    msg.messageType !== 'general' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1 px-2.5 pt-2 text-[8px] font-bold uppercase tracking-widest`,
                        style: {
                            color: categoryMeta.color
                        },
                        children: [
                            CATEGORY_ICONS[msg.messageType],
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: categoryMeta.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                lineNumber: 393,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 389,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] leading-relaxed text-white/90",
                            children: msg.content
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 399,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 398,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1.5 px-3 pb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[8px] text-white/20",
                                children: formatTimeAgo(msg.createdAt)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                lineNumber: 404,
                                columnNumber: 13
                            }, this),
                            isMine && (msg.isRead ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__["CheckCheck"], {
                                size: 10,
                                className: "text-blue-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                lineNumber: 407,
                                columnNumber: 19
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 10,
                                className: "text-white/20"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                lineNumber: 408,
                                columnNumber: 19
                            }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 403,
                        columnNumber: 11
                    }, this),
                    isMine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleDeleteMessage(msg.id),
                        className: "absolute -top-1 -right-1 w-5 h-5 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            size: 8,
                            className: "text-red-400"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 418,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 414,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                lineNumber: 382,
                columnNumber: 9
            }, this)
        }, msg.id, false, {
            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
            lineNumber: 376,
            columnNumber: 7
        }, this);
    };
    // ─── Main Render ──────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-6 right-6 z-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.9,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.9,
                        y: 20
                    },
                    className: "w-[360px] h-[540px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        view === 'chat' && activeConversation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setView('conversations');
                                                setActiveConversation(null);
                                                if (msgChannelRef.current) {
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsubscribeFromChannel"])(msgChannelRef.current);
                                                    msgChannelRef.current = null;
                                                }
                                            },
                                            className: "p-1 hover:bg-white/5 rounded-lg transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                size: 14,
                                                className: "text-white/40"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 443,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 442,
                                            columnNumber: 19
                                        }, this) : null,
                                        view === 'chat' && activeConversation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-7 h-7 rounded-lg bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/20 flex items-center justify-center text-[10px] font-black text-red-400",
                                                            children: getOtherInfo(activeConversation).name.charAt(0).toUpperCase()
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 23
                                                        }, this),
                                                        getOtherInfo(activeConversation).isOnline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-900"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 453,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] font-bold text-white leading-none",
                                                            children: getOtherInfo(activeConversation).name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 457,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[8px] text-white/30",
                                                            children: getOtherInfo(activeConversation).isOnline ? 'Çevrimiçi' : 'Çevrimdışı'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 458,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 447,
                                            columnNumber: 19
                                        }, this) : view === 'new' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setView('conversations'),
                                            className: "flex items-center gap-1 text-white/40 hover:text-white transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-black uppercase tracking-widest",
                                                    children: "Yeni Mesaj"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 466,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 464,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                    size: 14,
                                                    className: "text-red-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 470,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-black uppercase tracking-widest text-white/60",
                                                    children: "Mesajlar"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 471,
                                                    columnNumber: 21
                                                }, this),
                                                totalUnread > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "min-w-[16px] h-[16px] bg-red-600 rounded-full text-[8px] font-black text-white flex items-center justify-center px-1",
                                                    children: totalUnread
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 469,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 440,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        view === 'conversations' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setView('new'),
                                            className: "p-1.5 hover:bg-white/5 rounded-lg transition-colors",
                                            title: "Yeni mesaj",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                size: 12,
                                                className: "text-white/30 hover:text-red-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 487,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 482,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsOpen(false),
                                            className: "p-1.5 hover:bg-white/5 rounded-lg transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                size: 14,
                                                className: "text-white/30"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 491,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 490,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                    lineNumber: 480,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 439,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-hidden flex flex-col",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                mode: "wait",
                                children: [
                                    view === 'conversations' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: -20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        exit: {
                                            opacity: 0,
                                            x: -20
                                        },
                                        className: "flex-1 overflow-y-auto p-2 space-y-1",
                                        children: conversations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center justify-center h-full opacity-30 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                    size: 40
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 510,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] font-black uppercase",
                                                            children: "Henüz mesaj yok"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 512,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[9px] text-white/40 mt-1",
                                                            children: "Rakip menajerlere mesaj gönder"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 513,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                            lineNumber: 509,
                                            columnNumber: 23
                                        }, this) : conversations.map((conv)=>renderConversationItem(conv))
                                    }, "conversations", false, {
                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                        lineNumber: 501,
                                        columnNumber: 19
                                    }, this),
                                    view === 'new' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        exit: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        className: "flex-1 flex flex-col p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        size: 12,
                                                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 532,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: searchQuery,
                                                        onChange: (e)=>handleSearch(e.target.value),
                                                        placeholder: "Takım adı ile ara...",
                                                        className: "w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20",
                                                        autoFocus: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 533,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 531,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 overflow-y-auto space-y-1",
                                                children: [
                                                    searchResults.map((manager)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>startNewConversation(manager),
                                                            className: "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "relative shrink-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60",
                                                                            children: manager.teamName.charAt(0).toUpperCase()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                            lineNumber: 551,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        manager.isOnline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                            lineNumber: 555,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 550,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[11px] font-bold text-white truncate",
                                                                            children: manager.teamName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                            lineNumber: 559,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] text-white/30",
                                                                            children: manager.managerName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                            lineNumber: 560,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 558,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, manager.id, true, {
                                                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                            lineNumber: 545,
                                                            columnNumber: 25
                                                        }, this)),
                                                    searchQuery.length >= 2 && searchResults.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center justify-center py-8 opacity-30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                size: 24
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 566,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] mt-2",
                                                                children: "Sonuç bulunamadı"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 567,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 565,
                                                        columnNumber: 25
                                                    }, this),
                                                    searchQuery.length < 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center justify-center py-8 opacity-20",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                size: 24
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 572,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] mt-2",
                                                                children: "Aramak için en az 2 karakter"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 573,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 571,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 543,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, "new", true, {
                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                        lineNumber: 524,
                                        columnNumber: 19
                                    }, this),
                                    view === 'chat' && activeConversation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        exit: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        className: "flex-1 flex flex-col overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                ref: messagesContainerRef,
                                                className: "flex-1 overflow-y-auto p-3 space-y-2",
                                                children: [
                                                    messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center justify-center h-full opacity-20",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                                                size: 32
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 593,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] mt-2",
                                                                children: "Sohbeti başlat!"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 594,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 592,
                                                        columnNumber: 25
                                                    }, this),
                                                    messages.map((msg)=>renderMessageBubble(msg)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        ref: messagesEndRef
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 590,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                children: showQuickReplies && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        height: 0,
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        height: 'auto',
                                                        opacity: 1
                                                    },
                                                    exit: {
                                                        height: 0,
                                                        opacity: 0
                                                    },
                                                    className: "overflow-hidden border-t border-white/5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 flex flex-wrap gap-1",
                                                        children: (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QUICK_REPLIES"][selectedCategory] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QUICK_REPLIES"].general).map((reply, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setInputText(reply);
                                                                    setShowQuickReplies(false);
                                                                    inputRef.current?.focus();
                                                                },
                                                                className: "px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-white/60 hover:text-white transition-all",
                                                                children: reply
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 612,
                                                                columnNumber: 31
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 610,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 604,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 602,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                children: showCategories && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        height: 0,
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        height: 'auto',
                                                        opacity: 1
                                                    },
                                                    exit: {
                                                        height: 0,
                                                        opacity: 0
                                                    },
                                                    className: "overflow-hidden border-t border-white/5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 grid grid-cols-3 gap-1",
                                                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"]).map(([key, meta])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setSelectedCategory(key);
                                                                    setShowCategories(false);
                                                                    setShowQuickReplies(true);
                                                                },
                                                                className: `flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${selectedCategory === key ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-transparent text-white/40 hover:text-white hover:bg-white/10'}`,
                                                                children: [
                                                                    CATEGORY_ICONS[key],
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: meta.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                        lineNumber: 646,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, key, true, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 636,
                                                                columnNumber: 31
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 634,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                    lineNumber: 628,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 626,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2.5 bg-zinc-900/50 border-t border-white/5 shrink-0",
                                                children: [
                                                    selectedCategory !== 'general' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5 mb-2 px-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold",
                                                                style: {
                                                                    background: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"][selectedCategory].color}15`,
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"][selectedCategory].color,
                                                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"][selectedCategory].color}30`
                                                                },
                                                                children: [
                                                                    CATEGORY_ICONS[selectedCategory],
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$unifiedMessagingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MESSAGE_CATEGORIES"][selectedCategory].label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                        lineNumber: 663,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 659,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setSelectedCategory('general'),
                                                                className: "text-white/20 hover:text-white/60",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 658,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setShowCategories(!showCategories);
                                                                    setShowQuickReplies(false);
                                                                },
                                                                className: `shrink-0 p-2 rounded-lg transition-all ${showCategories ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`,
                                                                title: "Mesaj kategorisi",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 679,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 672,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                ref: inputRef,
                                                                type: "text",
                                                                value: inputText,
                                                                onChange: (e)=>setInputText(e.target.value),
                                                                onKeyDown: (e)=>{
                                                                    if (e.key === 'Enter') handleSend();
                                                                },
                                                                placeholder: "Mesaj yaz...",
                                                                maxLength: 500,
                                                                className: "flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 682,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setShowQuickReplies(!showQuickReplies);
                                                                    setShowCategories(false);
                                                                },
                                                                className: `shrink-0 p-2 rounded-lg transition-all ${showQuickReplies ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`,
                                                                title: "Hızlı cevaplar",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 700,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 693,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: handleSend,
                                                                disabled: !inputText.trim() || isSending,
                                                                className: "shrink-0 w-9 h-9 bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-white/10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                                    size: 14,
                                                                    className: "text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                    lineNumber: 708,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                                lineNumber: 703,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                        lineNumber: 671,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                                lineNumber: 655,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, "chat", true, {
                                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                        lineNumber: 582,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                                lineNumber: 498,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                            lineNumber: 497,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                    lineNumber: 432,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                lineNumber: 430,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl shadow-red-500/20 flex items-center justify-center group hover:scale-110 transition-all relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-white/20 translate-y-14 group-hover:translate-y-0 transition-transform duration-500"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 725,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                        className: "relative z-10",
                        size: 22
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 726,
                        columnNumber: 9
                    }, this),
                    totalUnread > 0 && !isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                        initial: {
                            scale: 0
                        },
                        animate: {
                            scale: 1
                        },
                        className: "absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-black border-2 border-red-600 text-[9px] font-black text-white flex items-center justify-center rounded-full px-1",
                        children: totalUnread > 99 ? '99+' : totalUnread
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                        lineNumber: 728,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
                lineNumber: 721,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/RivalMessagingPanel.tsx",
        lineNumber: 429,
        columnNumber: 5
    }, this);
}
_s(RivalMessagingPanel, "CSA4/s0zar+RzoHTCq4IGiLN1z4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"]
    ];
});
_c = RivalMessagingPanel;
var _c;
__turbopack_context__.k.register(_c, "RivalMessagingPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_RivalMessagingPanel_tsx_73f7a545._.js.map