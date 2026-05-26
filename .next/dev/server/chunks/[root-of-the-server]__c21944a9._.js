module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REALTIME_TABLES",
    ()=>REALTIME_TABLES,
    "createBrowserClient",
    ()=>createBrowserClient,
    "createServerClient",
    ()=>createServerClient,
    "enableRealtime",
    ()=>enableRealtime,
    "getSupabase",
    ()=>getSupabase,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
function isSupabaseConfigured() {
    const url = ("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co");
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Placeholder/örnek değerleri tespit et — gerçek Supabase URL'leri .supabase.co ile biter ve key JWT formatındadır
    if (url === 'placeholder' || url.includes('placeholder')) return false;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!url.includes('.supabase.co')) return false;
    // Basit JWT formatı kontrolü (3 parça, base64)
    if (key.split('.').length < 3) return false;
    return true;
}
async function createServerClient() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    // Dynamic import: `next/headers` sadece server-side çalışır,
    // client component'lerden import edildiğinde build hatası vermemesi için
    // lazy loading kullanıyoruz.
    const { cookies } = await __turbopack_context__.A("[project]/node_modules/next/headers.js [app-route] (ecmascript, async loader)");
    const cookieStore = await cookies();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
                }
            }
        }
    });
}
// ─── Browser-side client (singleton pattern) ───────────────────────
// Tarayıcıda tek oturum olduğu için singleton kullanımı güvenlidir.
let browserInstance = null;
function createBrowserClient() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    if (!browserInstance) {
        browserInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"));
    }
    return browserInstance;
}
function getSupabase() {
    if (!isSupabaseConfigured()) return null;
    const isServer = ("TURBOPACK compile-time value", "undefined") === 'undefined';
    if ("TURBOPACK compile-time truthy", 1) {
        // Server-side: cookie entegrasyonu olmayan basit client.
        // Auth oturum izolasyonu için `await createServerClient()` kullanın.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"));
    }
    //TURBOPACK unreachable
    ;
}
function enableRealtime(tableNames) {
    // Bu fonksiyon bilgi amaçlıdır. Gerçek etkinleştirme SQL migration ile yapılır.
    // Aşağıdaki SQL'i Supabase Dashboard > SQL Editor'de çalıştırın:
    //
    // ALTER TABLE match_chat REPLICA IDENTITY FULL;
    // ALTER TABLE manager_messages REPLICA IDENTITY FULL;
    // ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
    // ALTER TABLE manager_presence REPLICA IDENTITY FULL;
    //
    // Ardından Dashboard > Database > Replication'da tabloları etkinleştirin.
    const note = [
        'Realtime etkinleştirme için şu SQL\'i Supabase Dashboard\'da çalıştırın:',
        ...tableNames.map((t)=>`ALTER TABLE ${t} REPLICA IDENTITY FULL;`),
        '',
        'Ardından Dashboard > Database > Replication\'da tabloları etkinleştirin.',
        'Client tarafında sadece .on("postgres_changes", ...) ile abone olun.'
    ].join('\n');
    return {
        enabled: tableNames,
        note
    };
}
const REALTIME_TABLES = [
    'match_chat',
    'manager_messages',
    'manager_conversations',
    'manager_presence'
];
}),
"[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createErrorResponse",
    ()=>createErrorResponse,
    "logErrorToSupabase",
    ()=>logErrorToSupabase,
    "withErrorHandler",
    ()=>withErrorHandler
]);
/**
 * API Hata Yakalama Yardımcısı
 *
 * Tüm API route'larında kullanılacak standart try/catch ve hata loglama.
 * Hata durumlarında kullanıcı dostu mesaj döndürür ve Supabase error_logs tablosuna kaydeder.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
;
// ═══════════════════════════════════════════════════════════════
// Kullanıcı dostu hata mesajı
// ═══════════════════════════════════════════════════════════════
const USER_FRIENDLY_ERROR = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
async function logErrorToSupabase(error, context) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        // Service role ile kaydet (anon key ile çalışmayabilir — sessizce devam et)
        await supabase.from('error_logs').insert({
            error_message: errorMessage.slice(0, 1000),
            error_stack: errorStack ? errorStack.slice(0, 5000) : null,
            route: context.route,
            method: context.method || 'GET',
            user_id: context.userId || null,
            request_body: context.requestBody ? context.requestBody.slice(0, 2000) : null,
            created_at: new Date().toISOString()
        });
    } catch (logErr) {
        // Logging hatası olursa sessizce devam et — ana akışı kesme
        console.error('[logErrorToSupabase] Logging error:', logErr);
    }
}
function createErrorResponse(error, context) {
    const statusCode = context.statusCode || 500;
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Sunucu tarafında logla
    console.error(`[${context.route}] Error (${context.method || 'GET'}):`, errorMessage);
    // Supabase'e kaydet (asenkron, bekleme)
    logErrorToSupabase(error, context).catch(()=>{
    // Hata loglama başarısız olursa sessizce devam et
    });
    // Kullanıcıya dostu mesaj döndür
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: true,
        message: statusCode === 500 ? USER_FRIENDLY_ERROR : errorMessage
    }, {
        status: statusCode
    });
}
function withErrorHandler(handler, route) {
    return async (...args)=>{
        try {
            return await handler(...args);
        } catch (error) {
            return createErrorResponse(error, {
                route
            });
        }
    };
}
}),
"[project]/src/app/api/fixture/[teamId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
/**
 * Fikstür API Route — Takımın sezon fikstürünü getirir
 *
 * GET /api/fixture/[teamId]?seasonId=xxx
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)");
;
;
;
async function GET(request, { params }) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Supabase yapılandırılmamış.'
            }, {
                status: 500
            });
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Supabase client null.'
            }, {
                status: 500
            });
        }
        const { teamId } = await params;
        if (!teamId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'teamId parametresi gerekli.'
            }, {
                status: 400
            });
        }
        const { searchParams } = new URL(request.url);
        const seasonId = searchParams.get('seasonId');
        // 1. teamId ile league_teams kaydını bul
        const { data: teamData } = await supabase.from('league_teams').select('id, name, league_id').eq('profile_id', teamId).maybeSingle();
        if (!teamData) {
            // Alternatif: profiles tablosundan team_name ile ara
            const { data: profile } = await supabase.from('profiles').select('id, team_name').eq('id', teamId).maybeSingle();
            if (!profile) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Takım bulunamadı.'
                }, {
                    status: 404
                });
            }
            const { data: altTeam } = await supabase.from('league_teams').select('id, name, league_id').eq('name', profile.team_name).maybeSingle();
            if (!altTeam) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    fixtures: [],
                    nextMatch: null
                });
            }
            return await fetchFixturesForTeam(supabase, altTeam.id, altTeam.league_id, seasonId);
        }
        return await fetchFixturesForTeam(supabase, teamData.id, teamData.league_id, seasonId);
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(err, {
            route: '/api/fixture/[teamId]',
            method: 'GET'
        });
    }
}
async function fetchFixturesForTeam(supabase, leagueTeamId, leagueId, seasonId) {
    try {
        let targetSeasonId = seasonId;
        if (!targetSeasonId && leagueId) {
            const { data: seasonData } = await supabase.from('seasons').select('id').eq('league_id', leagueId).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            targetSeasonId = seasonData?.id || null;
        }
        if (!targetSeasonId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                fixtures: [],
                nextMatch: null
            });
        }
        const { data: fixtures, error: fixturesError } = await supabase.from('fixtures').select(`
        id,
        tur,
        match_date,
        match_time,
        status,
        home_score,
        away_score,
        home_team_id,
        away_team_id,
        referee_name,
        home:league_teams!home_team_id (name, id),
        away:league_teams!away_team_id (name, id)
      `).eq('season_id', targetSeasonId).or(`home_team_id.eq.${leagueTeamId},away_team_id.eq.${leagueTeamId}`).order('tur', {
            ascending: true
        });
        if (fixturesError) {
            console.error('[GET /api/fixture] Fixtures error:', fixturesError.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Fikstür yüklenirken hata oluştu.'
            }, {
                status: 500
            });
        }
        // Sonraki maç (scheduled ve en yakın tarihli)
        const now = new Date().toISOString().split('T')[0];
        const nextMatch = (fixtures || []).filter((f)=>f.status === 'scheduled' && f.match_date >= now).sort((a, b)=>a.match_date.localeCompare(b.match_date))[0] || null;
        // Resolve team names for fixtures where join failed
        const unresolvedIds = new Set();
        (fixtures || []).forEach((f)=>{
            if (!f.home?.name && f.home_team_id) unresolvedIds.add(f.home_team_id);
            if (!f.away?.name && f.away_team_id) unresolvedIds.add(f.away_team_id);
        });
        let teamNameMap = new Map();
        if (unresolvedIds.size > 0) {
            const { data: missingTeams } = await supabase.from('league_teams').select('id, name').in('id', Array.from(unresolvedIds));
            (missingTeams || []).forEach((t)=>{
                teamNameMap.set(t.id, t.name);
            });
        }
        const cleanedFixtures = (fixtures || []).map((f)=>({
                id: f.id,
                tur: f.tur,
                match_date: f.match_date,
                match_time: f.match_time,
                status: f.status,
                home_score: f.home_score,
                away_score: f.away_score,
                home_team: f.home?.name || teamNameMap.get(f.home_team_id) || 'Bilinmiyor',
                away_team: f.away?.name || teamNameMap.get(f.away_team_id) || 'Bilinmiyor',
                home_team_id: f.home_team_id || f.home?.id || '',
                away_team_id: f.away_team_id || f.away?.id || '',
                is_home: f.home_team_id === leagueTeamId,
                referee_name: f.referee_name || null
            }));
        const cleanedNextMatch = nextMatch ? {
            id: nextMatch.id,
            tur: nextMatch.tur,
            match_date: nextMatch.match_date,
            match_time: nextMatch.match_time,
            opponent: nextMatch.home_team_id === leagueTeamId ? nextMatch.away?.name || 'Bilinmiyor' : nextMatch.home?.name || 'Bilinmiyor',
            is_home: nextMatch.home_team_id === leagueTeamId
        } : null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            fixtures: cleanedFixtures,
            nextMatch: cleanedNextMatch
        });
    } catch (err) {
        console.error('[fetchFixturesForTeam] Error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            fixtures: [],
            nextMatch: null
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c21944a9._.js.map