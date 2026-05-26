(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/FriendlyMatchTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FriendlyMatchTab",
    ()=>FriendlyMatchTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.js [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$MatchContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/MatchContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/region-generator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$enhancedMatchEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/enhancedMatchEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
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
// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════
const QUEUE_DURATION_SECONDS = 300; // 5 minutes
const POLL_INTERVAL_MS = 4000; // Check every 4 seconds
const MATCH_START_DELAY_MS = 2500; // Delay before starting matched game
function FriendlyMatchTab() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { profile, setProfile, squad, setSquad, setActiveTab, activeTactic } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"])();
    const { setMatchState } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$MatchContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchContext"])();
    const toast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    // ── State ──
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [queue, setQueue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(QUEUE_DURATION_SECONDS);
    const [inQueue, setInQueue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMatched, setIsMatched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [matchedOpponent, setMatchedOpponent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [history, setHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [notification, setNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('queue');
    // Refs for cleanup
    const pollIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timerIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Cleanup expired queue entries ──
    const cleanupExpiredQueue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[cleanupExpiredQueue]": async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                const now = new Date().toISOString();
                await supabase.from('friendly_queue').delete().lt('expires_at', now);
            } catch (err) {
                console.error('[cleanupExpiredQueue] Error:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[cleanupExpiredQueue]"], []);
    // ── Fetch current queue ──
    const fetchQueue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[fetchQueue]": async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                // First cleanup expired
                await cleanupExpiredQueue();
                const { data, error } = await supabase.from('friendly_queue').select('*').gt('expires_at', new Date().toISOString()).order('is_priority', {
                    ascending: false
                }).order('joined_at', {
                    ascending: true
                }).limit(20);
                if (error) {
                    console.error('[fetchQueue] Error:', error.message);
                    return;
                }
                if (data) {
                    setQueue(data.map({
                        "FriendlyMatchTab.useCallback[fetchQueue]": (d)=>({
                                user_id: d.user_id,
                                team_name: d.team_name || 'Bilinmeyen Takım',
                                joined_at: d.joined_at,
                                expires_at: d.expires_at,
                                is_priority: d.is_priority || false
                            })
                    }["FriendlyMatchTab.useCallback[fetchQueue]"]));
                }
            } catch (err) {
                console.error('[fetchQueue] Exception:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[fetchQueue]"], [
        cleanupExpiredQueue
    ]);
    // ── Fetch match history ──
    const fetchHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[fetchHistory]": async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !profile) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                const { data, error } = await supabase.from('friendly_matches').select('*').or(`home_team_id.eq.${profile.id},away_team_id.eq.${profile.id}`).order('played_at', {
                    ascending: false
                }).limit(20);
                if (error) {
                    console.error('[fetchHistory] Error:', error.message);
                    return;
                }
                if (data) {
                    // Enrich with team names from profiles
                    const enriched = await Promise.all(data.map({
                        "FriendlyMatchTab.useCallback[fetchHistory]": async (m)=>{
                            if (m.home_team_name && m.away_team_name) return m;
                            let homeName = 'Bilinmeyen';
                            let awayName = 'Bilinmeyen';
                            try {
                                const { data: homeProfile } = await supabase.from('profiles').select('team_name').eq('id', m.home_team_id).maybeSingle();
                                if (homeProfile) homeName = homeProfile.team_name || homeName;
                                const { data: awayProfile } = await supabase.from('profiles').select('team_name').eq('id', m.away_team_id).maybeSingle();
                                if (awayProfile) awayName = awayProfile.team_name || awayName;
                            } catch  {
                            // Use fallback names
                            }
                            return {
                                ...m,
                                home_team_name: homeName,
                                away_team_name: awayName
                            };
                        }
                    }["FriendlyMatchTab.useCallback[fetchHistory]"]));
                    setHistory(enriched);
                }
            } catch (err) {
                console.error('[fetchHistory] Exception:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[fetchHistory]"], [
        profile
    ]);
    // ── Check my queue status on mount ──
    const checkMyQueueStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[checkMyQueueStatus]": async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !profile) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                const { data, error } = await supabase.from('friendly_queue').select('*').eq('user_id', profile.id).maybeSingle();
                if (error) {
                    console.error('[checkMyQueueStatus] Error:', error.message);
                    return;
                }
                if (data) {
                    const expires = new Date(data.expires_at).getTime();
                    const now = Date.now();
                    const diff = Math.max(0, Math.floor((expires - now) / 1000));
                    if (diff > 0) {
                        setInQueue(true);
                        setTimeLeft(diff);
                    } else {
                        // Entry expired, remove it
                        await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
                        setInQueue(false);
                        setTimeLeft(QUEUE_DURATION_SECONDS);
                    }
                } else {
                    setInQueue(false);
                    setTimeLeft(QUEUE_DURATION_SECONDS);
                }
            } catch (err) {
                console.error('[checkMyQueueStatus] Exception:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[checkMyQueueStatus]"], [
        profile
    ]);
    // ── Generate AI Opponent (FALLBACK ONLY — real user squads fetched from Supabase) ──
    const generateOpponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[generateOpponent]": (teamName)=>{
            const opponentSquad = [];
            const posCounts = {
                GK: 1,
                DEF: 4,
                MID: 4,
                FWD: 2
            };
            Object.entries(posCounts).forEach({
                "FriendlyMatchTab.useCallback[generateOpponent]": ([pos, count])=>{
                    for(let i = 0; i < count; i++){
                        const rating = 55 + Math.floor(Math.random() * 15);
                        const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateLocalizedPlayer"])('tr', teamName, 1, pos);
                        opponentSquad.push({
                            ...p,
                            rating
                        });
                    }
                }
            }["FriendlyMatchTab.useCallback[generateOpponent]"]);
            return {
                name: teamName,
                squad: opponentSquad
            };
        }
    }["FriendlyMatchTab.useCallback[generateOpponent]"], [
        profile
    ]);
    // ── Fetch real opponent squad from Supabase ──
    const fetchOpponentSquad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[fetchOpponentSquad]": async (opponentUserId, teamName)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return null;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return null;
                // Try fetching by profile_id first (real user players)
                const { data: players, error } = await supabase.from('players').select('*').eq('profile_id', opponentUserId).limit(20);
                if (error) {
                    console.error('[fetchOpponentSquad] Error:', error.message);
                    return null;
                }
                if (players && players.length >= 7) {
                    // Map DB columns to Player type
                    const squad = players.map({
                        "FriendlyMatchTab.useCallback[fetchOpponentSquad].squad": (p)=>({
                                id: p.id,
                                name: p.name || 'Bilinmeyen',
                                position: p.position || 'MID',
                                specificPosition: p.specific_position || p.specificPosition || p.position || 'CM',
                                rating: p.rating || 60,
                                age: p.age || 20,
                                potential: p.potential || p.rating || 60,
                                market_value: p.market_value || 0,
                                salary: p.salary || 0,
                                nation: p.nation || 'TR',
                                club: p.team_name || teamName,
                                defending: p.defending || 50,
                                passing: p.passing || 50,
                                shooting: p.shooting || 50,
                                speed: p.speed || 50,
                                power: p.power || 50,
                                cond: p.cond ?? p.form ?? 80,
                                form: p.form ?? 50,
                                morale: p.morale ?? 60,
                                confidence: p.confidence ?? 50,
                                hidden_potential: p.hidden_potential || p.potential || 60,
                                traits: typeof p.traits === 'string' ? JSON.parse(p.traits || '[]') : p.traits || [],
                                negTraits: typeof p.neg_traits === 'string' ? JSON.parse(p.neg_traits || '[]') : p.neg_traits || [],
                                is_injured: p.is_injured || false,
                                match_ratings: typeof p.match_ratings === 'string' ? JSON.parse(p.match_ratings || '[]') : p.match_ratings || []
                            })
                    }["FriendlyMatchTab.useCallback[fetchOpponentSquad].squad"]);
                    return {
                        name: teamName,
                        squad
                    };
                }
                // Not enough players found — fallback will be used
                console.warn(`[fetchOpponentSquad] Only ${players?.length || 0} players found for user ${opponentUserId}, using AI fallback`);
                return null;
            } catch (err) {
                console.error('[fetchOpponentSquad] Exception:', err);
                return null;
            }
        }
    }["FriendlyMatchTab.useCallback[fetchOpponentSquad]"], []);
    // ── Start match simulation ──
    const startMatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[startMatch]": async (opponent)=>{
            if (!squad.length) return;
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$enhancedMatchEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runUnifiedMatch"])(squad, opponent.squad, {
                    activeTactic,
                    homeTeamName: profile?.team_name || 'Benim Takımım',
                    awayTeamName: opponent.name
                });
                setMatchState({
                    minute: 0,
                    score: {
                        home: 0,
                        away: 0
                    },
                    result: result,
                    visibleEvents: [],
                    matchSummaryEvents: {
                        home: [],
                        away: []
                    },
                    isActive: true,
                    isFinished: false,
                    isPaused: false,
                    playerConditions: squad.reduce({
                        "FriendlyMatchTab.useCallback[startMatch]": (acc, p)=>({
                                ...acc,
                                [p.id]: p.cond || 100
                            })
                    }["FriendlyMatchTab.useCallback[startMatch]"], {}),
                    isFriendly: true
                });
                setActiveTab('matchday');
            } catch (err) {
                console.error('[startMatch] Error:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[startMatch]"], [
        squad,
        activeTactic,
        setMatchState,
        setActiveTab
    ]);
    // ── Save match to friendly_matches (insert OR update) ──
    const saveFriendlyMatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[saveFriendlyMatch]": async (opponentId, homeScore, awayScore, matchResult, matchId)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !profile) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                if (matchId) {
                    // UPDATE existing record with real score
                    const { error } = await supabase.from('friendly_matches').update({
                        home_score: homeScore,
                        away_score: awayScore,
                        match_data: matchResult ? JSON.stringify(matchResult) : null
                    }).eq('id', matchId);
                    if (error) {
                        console.error('[saveFriendlyMatch] Update error:', error.message);
                    }
                } else {
                    // INSERT new record
                    await supabase.from('friendly_matches').insert({
                        home_team_id: profile.id,
                        away_team_id: opponentId,
                        home_score: homeScore,
                        away_score: awayScore,
                        played_at: new Date().toISOString(),
                        match_data: matchResult ? JSON.stringify(matchResult) : null
                    });
                }
            } catch (err) {
                console.error('[saveFriendlyMatch] Error:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[saveFriendlyMatch]"], [
        profile
    ]);
    // ── Check for auto-match (2 teams in queue) ──
    const checkForMatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FriendlyMatchTab.useCallback[checkForMatch]": async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !profile || !inQueue) return;
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) return;
                // Get all valid queue entries
                const { data: allInQueue, error } = await supabase.from('friendly_queue').select('*').gt('expires_at', new Date().toISOString()).order('is_priority', {
                    ascending: false
                }).order('joined_at', {
                    ascending: true
                });
                if (error || !allInQueue || allInQueue.length < 2) return;
                // Find first two different users
                const first = allInQueue[0];
                const second = allInQueue.find({
                    "FriendlyMatchTab.useCallback[checkForMatch].second": (e)=>e.user_id !== first.user_id
                }["FriendlyMatchTab.useCallback[checkForMatch].second"]);
                if (!second) return;
                // Check if current user is one of the matched pair
                const isUserMatched = first.user_id === profile.id || second.user_id === profile.id;
                if (isUserMatched) {
                    // Remove both from queue
                    await supabase.from('friendly_queue').delete().eq('user_id', first.user_id);
                    await supabase.from('friendly_queue').delete().eq('user_id', second.user_id);
                    // Determine opponent
                    const opponentEntry = first.user_id === profile.id ? second : first;
                    const opponentTeamName = opponentEntry.team_name || 'Bilinmeyen Takım';
                    const opponentId = opponentEntry.user_id;
                    // Show match notification
                    setNotification({
                        type: 'matched',
                        opponentName: opponentTeamName,
                        opponentId
                    });
                    setIsMatched(true);
                    setMatchedOpponent(opponentTeamName);
                    setInQueue(false);
                    // Fetch real opponent squad from Supabase (fallback to AI-generated)
                    const realOpponent = await fetchOpponentSquad(opponentId, opponentTeamName);
                    const opponent = realOpponent || generateOpponent(opponentTeamName);
                    // Store opponent info for post-match save (do NOT save with 0-0 before match)
                    // Match record will be saved with real score after match ends
                    window._friendlyOpponentInfo = {
                        opponentId,
                        opponentTeamName
                    };
                    // Start match after brief delay
                    setTimeout({
                        "FriendlyMatchTab.useCallback[checkForMatch]": ()=>{
                            setIsMatched(false);
                            setNotification(null);
                            startMatch(opponent);
                        }
                    }["FriendlyMatchTab.useCallback[checkForMatch]"], MATCH_START_DELAY_MS);
                }
            } catch (err) {
                console.error('[checkForMatch] Error:', err);
            }
        }
    }["FriendlyMatchTab.useCallback[checkForMatch]"], [
        profile,
        inQueue,
        generateOpponent,
        saveFriendlyMatch,
        startMatch
    ]);
    // ── JOIN QUEUE (Main button - free) ──
    const handleJoinQueue = async ()=>{
        if (!profile) return;
        if (inQueue) {
            return; // Already in queue
        }
        if (isMatched) {
            return; // Match found, don't re-queue
        }
        setLoading(true);
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) {
                    setLoading(false);
                    return;
                }
                // Check if already in queue
                const { data: existing } = await supabase.from('friendly_queue').select('user_id').eq('user_id', profile.id).maybeSingle();
                if (existing) {
                    // Already in queue, just update state
                    setInQueue(true);
                    setLoading(false);
                    return;
                }
                const expiresAt = new Date(Date.now() + QUEUE_DURATION_SECONDS * 1000).toISOString();
                const { error } = await supabase.from('friendly_queue').insert({
                    user_id: profile.id,
                    team_name: profile.team_name || 'Bilinmeyen',
                    expires_at: expiresAt,
                    is_priority: false
                });
                if (error) {
                    console.error('[handleJoinQueue] Insert error:', error.message);
                    setLoading(false);
                    toast.error('Sıraya girilemedi. Tekrar deneyin.');
                    return;
                }
            }
            setInQueue(true);
            setTimeLeft(QUEUE_DURATION_SECONDS);
            fetchQueue();
            // Immediately check for match after joining
            setTimeout(()=>checkForMatch(), 500);
        } catch (err) {
            console.error('[handleJoinQueue] Exception:', err);
            toast.error('Bir hata oluştu. Tekrar deneyin.');
        } finally{
            setLoading(false);
        }
    };
    // ── JOIN PRIORITY QUEUE (1 Credit) ──
    const handleJoinPriorityQueue = async ()=>{
        if (!profile) return;
        if (inQueue || isMatched) return;
        if ((profile.credits || 0) < 1) {
            toast.error('Yetersiz kredi! Öncelikli eşleşme için 1 KR gereklidir.');
            return;
        }
        setLoading(true);
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (!supabase) {
                    setLoading(false);
                    return;
                }
                // Check if already in queue
                const { data: existing } = await supabase.from('friendly_queue').select('user_id').eq('user_id', profile.id).maybeSingle();
                if (existing) {
                    setInQueue(true);
                    setLoading(false);
                    return;
                }
                const expiresAt = new Date(Date.now() + QUEUE_DURATION_SECONDS * 1000).toISOString();
                const { error } = await supabase.from('friendly_queue').insert({
                    user_id: profile.id,
                    team_name: profile.team_name || 'Bilinmeyen',
                    expires_at: expiresAt,
                    is_priority: true
                });
                if (error) {
                    console.error('[handleJoinPriorityQueue] Insert error:', error.message);
                    setLoading(false);
                    toast.error('Sıraya girilemedi. Tekrar deneyin.');
                    return;
                }
                // Deduct 1 credit
                const newCredits = Math.max(0, (profile.credits || 0) - 1);
                await supabase.from('profiles').update({
                    credits: newCredits
                }).eq('id', profile.id);
                setProfile((prev)=>{
                    if (!prev) return prev;
                    return {
                        ...prev,
                        credits: newCredits
                    };
                });
            }
            setInQueue(true);
            setTimeLeft(QUEUE_DURATION_SECONDS);
            fetchQueue();
            // Immediately check for match after joining
            setTimeout(()=>checkForMatch(), 500);
        } catch (err) {
            console.error('[handleJoinPriorityQueue] Exception:', err);
            toast.error('Bir hata oluştu. Tekrar deneyin.');
        } finally{
            setLoading(false);
        }
    };
    // ── LEAVE QUEUE ──
    const handleLeaveQueue = async ()=>{
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && profile) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (supabase) {
                    await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
                }
            }
        } catch (err) {
            console.error('[handleLeaveQueue] Error:', err);
        }
        setInQueue(false);
        setIsMatched(false);
        setTimeLeft(QUEUE_DURATION_SECONDS);
        setNotification(null);
        fetchQueue();
    };
    // ── EFFECTS ──
    // Initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FriendlyMatchTab.useEffect": ()=>{
            const init = {
                "FriendlyMatchTab.useEffect.init": async ()=>{
                    await cleanupExpiredQueue();
                    await fetchQueue();
                    await fetchHistory();
                    await checkMyQueueStatus();
                }
            }["FriendlyMatchTab.useEffect.init"];
            init();
        }
    }["FriendlyMatchTab.useEffect"], [
        cleanupExpiredQueue,
        fetchQueue,
        fetchHistory,
        checkMyQueueStatus
    ]);
    // Timer countdown when in queue
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FriendlyMatchTab.useEffect": ()=>{
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            if (inQueue && timeLeft > 0) {
                timerIntervalRef.current = setInterval({
                    "FriendlyMatchTab.useEffect": ()=>{
                        setTimeLeft({
                            "FriendlyMatchTab.useEffect": (prev)=>{
                                if (prev <= 1) {
                                    // Time's up - leave queue automatically
                                    handleLeaveQueue();
                                    return 0;
                                }
                                return prev - 1;
                            }
                        }["FriendlyMatchTab.useEffect"]);
                    }
                }["FriendlyMatchTab.useEffect"], 1000);
            }
            return ({
                "FriendlyMatchTab.useEffect": ()=>{
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                    }
                }
            })["FriendlyMatchTab.useEffect"];
        }
    }["FriendlyMatchTab.useEffect"], [
        inQueue,
        timeLeft
    ]);
    // Polling for match while in queue
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FriendlyMatchTab.useEffect": ()=>{
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
            if (inQueue && profile) {
                pollIntervalRef.current = setInterval({
                    "FriendlyMatchTab.useEffect": ()=>{
                        checkForMatch();
                        fetchQueue();
                    }
                }["FriendlyMatchTab.useEffect"], POLL_INTERVAL_MS);
            }
            return ({
                "FriendlyMatchTab.useEffect": ()=>{
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                }
            })["FriendlyMatchTab.useEffect"];
        }
    }["FriendlyMatchTab.useEffect"], [
        inQueue,
        profile,
        checkForMatch,
        fetchQueue
    ]);
    // ── Helpers ──
    const formatTime = (seconds)=>{
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const timerPercent = timeLeft / QUEUE_DURATION_SECONDS * 100;
    const getMatchResult = (m)=>{
        if (!profile) return null;
        const isHome = m.home_team_id === profile.id;
        const myScore = isHome ? m.home_score : m.away_score;
        const oppScore = isHome ? m.away_score : m.home_score;
        if (myScore > oppScore) return 'W';
        if (myScore === oppScore) return 'D';
        return 'L';
    };
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                size: 18,
                                                className: "text-emerald-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                lineNumber: 691,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 690,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                    children: "Hazırlık Maçı Merkezi"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 694,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] text-white/30 uppercase tracking-[0.3em] font-black",
                                                    children: "Kadro Uyumu & Form Yönetimi"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 695,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 693,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 689,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-3 ml-11",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded-full",
                                            children: "+10% Pozisyon Uyumu"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 699,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider rounded-full",
                                            children: "2x Antrenman Puanı"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 700,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-wider rounded-full",
                                            children: "-5% Kondisyon"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 701,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 698,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 688,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row gap-3 w-full lg:w-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: inQueue ? handleLeaveQueue : handleJoinQueue,
                                    disabled: loading || isMatched,
                                    className: `flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${inQueue ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'} disabled:opacity-30 disabled:hover:scale-100`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 717,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `p-1.5 rounded-lg ${inQueue ? 'bg-red-500/20' : 'bg-black/20'}`,
                                                    children: inQueue ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 720,
                                                        columnNumber: 30
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 720,
                                                        columnNumber: 56
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 719,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col leading-none",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px]",
                                                            children: inQueue ? 'SIRADAN ÇIK' : 'SIRAYA GİR'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 723,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[7px] opacity-60 font-bold",
                                                            children: inQueue ? 'BEKLEMEYİ İPTAL ET' : 'ÜCRETSİZ — OTOMATİK EŞLEŞME'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 724,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 722,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 718,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 708,
                                    columnNumber: 13
                                }, this),
                                !inQueue && !isMatched && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleJoinPriorityQueue,
                                    disabled: loading || isMatched || (profile?.credits || 0) < 1,
                                    className: `flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${(profile?.credits || 0) < 1 ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(139,92,246,0.25)]'} disabled:opacity-30 disabled:hover:scale-100`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 742,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `p-1.5 rounded-lg ${(profile?.credits || 0) < 1 ? 'bg-white/10' : 'bg-white/20'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 745,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 744,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col leading-none",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px]",
                                                            children: "HAZIRLIK MAÇI TEKLİFİ VER"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 748,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[7px] opacity-60 font-bold",
                                                            children: (profile?.credits || 0) < 1 ? 'YETERSİZ KREDİ' : '⚡ 1 KREDİ — ÖNCELİKLİ EŞLEŞME'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 749,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 747,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 743,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 733,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 706,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                    lineNumber: 687,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                lineNumber: 686,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isMatched && notification?.type === 'matched' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.9,
                        y: -20
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.9,
                        y: -20
                    },
                    className: "bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[2rem] p-8 text-center relative overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-emerald-500/5 animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 769,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative z-10 space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        size: 36,
                                        className: "text-black fill-black"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 772,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 771,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-2xl font-black italic uppercase tracking-tighter text-emerald-300",
                                    children: "EŞLEŞME BULUNDU!"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 774,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/50 max-w-md mx-auto",
                                    children: [
                                        "Rakip: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-300 font-black",
                                            children: notification.opponentName
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 778,
                                            columnNumber: 24
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 777,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-white/30",
                                    children: "Maç otomatik olarak başlıyor..."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 780,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 770,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                    lineNumber: 763,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                lineNumber: 761,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: inQueue && !isMatched && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-zinc-900/60 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 bg-amber-500/10 rounded-xl border border-amber-500/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                                    size: 16,
                                                    className: "text-amber-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 798,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                lineNumber: 797,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xs font-black uppercase tracking-widest text-white/40",
                                                        children: "EŞLEŞME BEKLENİYOR"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 801,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[8px] text-white/20 uppercase tracking-wider font-bold",
                                                        children: "5 DAKİKA İÇİNDE RAKİP ARANIYOR"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                lineNumber: 800,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 796,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-4xl font-black font-mono text-amber-400 tracking-wider",
                                        children: formatTime(timeLeft)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 805,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 795,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-2 bg-black/40 rounded-full overflow-hidden mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full",
                                    animate: {
                                        width: `${timerPercent}%`
                                    },
                                    transition: {
                                        duration: 1,
                                        ease: 'linear'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 812,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 811,
                                columnNumber: 15
                            }, this),
                            queue.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] font-black uppercase tracking-widest text-white/20 mb-2",
                                        children: [
                                            "SIRA LİSTESİ (",
                                            queue.length,
                                            " TAKIM)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 822,
                                        columnNumber: 19
                                    }, this),
                                    queue.slice(0, 8).map((entry, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${entry.user_id === profile?.id ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-black/20'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[9px] font-black w-5 text-center ${idx === 0 ? 'text-emerald-400' : 'text-white/20'}`,
                                                    children: [
                                                        idx + 1,
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 834,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[10px] font-bold flex-1 ${entry.user_id === profile?.id ? 'text-amber-400' : 'text-white/50'}`,
                                                    children: [
                                                        entry.team_name || 'Bilinmeyen Takım',
                                                        entry.user_id === profile?.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-2 text-[7px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full",
                                                            children: "SİZ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 842,
                                                            columnNumber: 27
                                                        }, this),
                                                        entry.is_priority && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-1 text-[7px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full",
                                                            children: "ÖNCELİKLİ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 845,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 837,
                                                    columnNumber: 23
                                                }, this),
                                                idx < 2 && queue.length >= 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    size: 10,
                                                    className: "text-emerald-400 animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 849,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, entry.user_id, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 826,
                                            columnNumber: 21
                                        }, this)),
                                    queue.length > 8 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[8px] text-white/20 text-center mt-2",
                                        children: [
                                            "+",
                                            queue.length - 8,
                                            " takım daha bekliyor"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 854,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 821,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                        lineNumber: 794,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                    lineNumber: 789,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                lineNumber: 787,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveView('queue'),
                        className: `flex-1 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeView === 'queue' ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 875,
                                columnNumber: 11
                            }, this),
                            " Sıra Durumu"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                        lineNumber: 867,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveView('history'),
                        className: `flex-1 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeView === 'history' ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 885,
                                columnNumber: 11
                            }, this),
                            " Geçmiş Maçlar"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                        lineNumber: 877,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                lineNumber: 866,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: activeView === 'queue' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        x: 20
                    },
                    className: "space-y-6",
                    children: [
                        !inQueue && !isMatched && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16 h-16 bg-white/5 rounded-full flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                        size: 28,
                                        className: "text-emerald-500/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 903,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 902,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-base font-black italic uppercase text-white/80",
                                        children: "Nasıl Çalışır?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 906,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 905,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3 text-left w-full max-w-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-1 bg-emerald-500/10 rounded-lg mt-0.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                        size: 12,
                                                        className: "text-emerald-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 910,
                                                        columnNumber: 78
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 910,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-black text-white/60 uppercase",
                                                            children: "Hazırlık Maçı Teklifi Ver"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 912,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[9px] text-white/30",
                                                            children: "Sıraya girin, 5 dakika içinde rakip bulunca otomatik maç başlar."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 913,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 911,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 909,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-1 bg-amber-500/10 rounded-lg mt-0.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        size: 12,
                                                        className: "text-amber-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 917,
                                                        columnNumber: 76
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 917,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-black text-white/60 uppercase",
                                                            children: "Otomatik Eşleşme"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 919,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[9px] text-white/30",
                                                            children: "İlk 2 takım eşleşir. Kalanlar sıradaki eşleşmeyi bekler."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 920,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 918,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 916,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-1 bg-red-500/10 rounded-lg mt-0.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                                        size: 12,
                                                        className: "text-red-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                        lineNumber: 924,
                                                        columnNumber: 74
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 924,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-black text-white/60 uppercase",
                                                            children: "5 Dakika Kuralı"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 926,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[9px] text-white/30",
                                                            children: "Süre bittiğinde sıra temizlenir. Tekrar girmeniz gerekir."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 927,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 925,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 923,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 908,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 901,
                            columnNumber: 15
                        }, this),
                        queue.length > 0 && !inQueue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            size: 14,
                                            className: "text-amber-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 938,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xs font-black uppercase tracking-widest text-white/40",
                                            children: [
                                                "ŞU AN BEKLEYEN (",
                                                queue.length,
                                                " TAKIM)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 939,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 937,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: queue.slice(0, 6).map((entry, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-black w-5 text-center text-white/20",
                                                    children: [
                                                        idx + 1,
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 949,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold flex-1 text-white/50",
                                                    children: [
                                                        entry.team_name,
                                                        entry.is_priority && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-1 text-[7px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full",
                                                            children: "ÖNCELİKLİ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 953,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 950,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, entry.user_id, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 945,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 943,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                            lineNumber: 936,
                            columnNumber: 15
                        }, this)
                    ]
                }, "queue", true, {
                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                    lineNumber: 892,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        x: -20
                    },
                    className: "space-y-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-5 border-b border-white/5 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                size: 14,
                                                className: "text-white/30"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                lineNumber: 973,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-black uppercase tracking-widest text-white/40",
                                                children: "Geçmiş Hazırlık Maçları"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                lineNumber: 974,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 972,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] text-white/20 font-bold",
                                        children: [
                                            history.length,
                                            " MAÇ"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                        lineNumber: 976,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 971,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 max-h-[400px] overflow-y-auto",
                                children: history.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "py-12 text-center opacity-20 italic text-sm",
                                    children: "Henüz hazırlık maçı oynamadınız."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 980,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: history.map((m)=>{
                                        const result = getMatchResult(m);
                                        const isHome = m.home_team_id === profile?.id;
                                        const homeName = m.home_team_name || (isHome ? profile?.team_name : 'Rakip');
                                        const awayName = m.away_team_name || (!isHome ? profile?.team_name : 'Rakip');
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/[0.07] transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-1 w-12",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[8px] font-black uppercase tracking-widest ${isHome ? 'text-emerald-400' : 'text-sky-400'}`,
                                                            children: isHome ? 'EV' : 'DEP'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 996,
                                                            columnNumber: 29
                                                        }, this),
                                                        result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[9px] font-black px-2 py-0.5 rounded-full ${result === 'W' ? 'bg-emerald-500/20 text-emerald-400' : result === 'D' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`,
                                                            children: result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1002,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 995,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 px-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2 mb-1",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[11px] font-bold ${isHome ? 'text-amber-300' : 'text-white/50'}`,
                                                                children: homeName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                                lineNumber: 1015,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1014,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[11px] font-bold ${!isHome ? 'text-amber-300' : 'text-white/50'}`,
                                                                children: awayName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                                lineNumber: 1020,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1019,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 1013,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-lg font-black font-mono ${m.home_score > m.away_score ? isHome ? 'text-emerald-400' : 'text-white/60' : 'text-white/60'}`,
                                                            children: m.home_score
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1028,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white/20 text-xs",
                                                            children: "-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1033,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-lg font-black font-mono ${m.away_score > m.home_score ? !isHome ? 'text-emerald-400' : 'text-white/60' : 'text-white/60'}`,
                                                            children: m.away_score
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1034,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 1027,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-end gap-1 ml-3 w-20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[9px] text-white/30 font-bold",
                                                            children: new Date(m.played_at).toLocaleDateString('tr-TR', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1043,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>router.push(`/match/${m.id}`),
                                                            className: "flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-all",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    size: 8
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                                    lineNumber: 1050,
                                                                    columnNumber: 31
                                                                }, this),
                                                                " Tekrar İzle"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                            lineNumber: 1046,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                                    lineNumber: 1042,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, m.id, true, {
                                            fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                            lineNumber: 990,
                                            columnNumber: 25
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                    lineNumber: 982,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                                lineNumber: 978,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                        lineNumber: 970,
                        columnNumber: 13
                    }, this)
                }, "history", false, {
                    fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                    lineNumber: 963,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
                lineNumber: 890,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/FriendlyMatchTab.tsx",
        lineNumber: 680,
        columnNumber: 5
    }, this);
}
_s(FriendlyMatchTab, "eStNkHvxDLspWauOpH7+leh0btI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFM"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$MatchContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = FriendlyMatchTab;
var _c;
__turbopack_context__.k.register(_c, "FriendlyMatchTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_FriendlyMatchTab_tsx_5c7e84cb._.js.map