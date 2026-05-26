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
"[project]/src/app/api/staff/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
/**
 * Staff API — Kullanıcının personel listesini getir
 * GET /api/staff?userId=xxx
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'userId gerekli.'
            }, {
                status: 400
            });
        }
        // Fetch all staff for the user, joined with staff_types
        let staffList = [];
        let staffError = null;
        try {
            const result = await supabase.from('staff').select('*, staff_types(name_tr, max_count, base_salary)').eq('user_id', userId).order('hired_at', {
                ascending: true
            });
            staffList = result.data || [];
            staffError = result.error;
        } catch (err) {
            console.warn('[GET /api/staff] Table might not exist yet:', err.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                staff: [],
                currentWeek: 0,
                remainingWeeks: 34
            });
        }
        if (staffError) {
            console.error('[GET /api/staff] Error:', staffError.message);
            // If table doesn't exist yet, return empty gracefully
            if (staffError.message?.includes('does not exist') || staffError.message?.includes('schema cache')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    staff: [],
                    currentWeek: 0,
                    remainingWeeks: 34
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Personel listesi yüklenirken hata oluştu.'
            }, {
                status: 500
            });
        }
        // Get the user's profile to find their league_name
        const { data: profile } = await supabase.from('profiles').select('league_name').eq('id', userId).maybeSingle();
        // Get current season week from seasons table
        let currentWeek = 0;
        if (profile?.league_name) {
            // Find the user's league via league_teams
            const { data: leagueTeam } = await supabase.from('league_teams').select('league_id').eq('profile_id', userId).maybeSingle();
            if (leagueTeam?.league_id) {
                const { data: season } = await supabase.from('seasons').select('current_tur').eq('league_id', leagueTeam.league_id).order('created_at', {
                    ascending: false
                }).limit(1).maybeSingle();
                currentWeek = season?.current_tur || 0;
            }
        }
        const remainingWeeks = currentWeek > 0 ? Math.max(1, 34 - currentWeek) : 34;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            staff: staffList || [],
            currentWeek,
            remainingWeeks
        });
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(err, {
            route: '/api/staff',
            method: 'GET'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1245ce70._.js.map