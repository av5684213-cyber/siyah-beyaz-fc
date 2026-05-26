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
"[project]/src/lib/fm/supabaseRateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "cleanupRateLimits",
    ()=>cleanupRateLimits
]);
/**
 * Supabase-based Rate Limiter
 *
 * Persists rate limit state in the database so it works across serverless
 * instances and process restarts. Falls back to in-memory when Supabase is
 * unavailable.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
// ─── In-Memory Fallback ───────────────────────────────────────────
// Used when Supabase is not configured or unreachable.
const memoryFallback = new Map();
function memoryFallbackCheck(key, maxRequests, windowMs, now) {
    const entry = memoryFallback.get(key);
    const resetTime = now + windowMs;
    if (!entry || now > entry.reset_time) {
        memoryFallback.set(key, {
            key,
            count: 1,
            reset_time: resetTime
        });
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetIn: windowMs
        };
    }
    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.reset_time - now
        };
    }
    entry.count++;
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetIn: entry.reset_time - now
    };
}
async function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const resetTime = now + windowMs;
    // Fast path: if Supabase is not configured at all, use memory fallback
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) {
            return memoryFallbackCheck(key, maxRequests, windowMs, now);
        }
        // Fetch current entry
        const { data, error } = await supabase.from('rate_limits').select('count, reset_time').eq('key', key).maybeSingle();
        if (error) {
            console.warn('[RateLimit] Supabase error, falling back to memory:', error.message);
            return memoryFallbackCheck(key, maxRequests, windowMs, now);
        }
        // New window or expired entry — upsert fresh
        if (!data || now > data.reset_time) {
            await supabase.from('rate_limits').upsert({
                key,
                count: 1,
                reset_time: resetTime
            }, {
                onConflict: 'key'
            });
            return {
                allowed: true,
                remaining: maxRequests - 1,
                resetIn: windowMs
            };
        }
        // Rate limit exceeded
        if (data.count >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetIn: data.reset_time - now
            };
        }
        // Within limits — increment count
        await supabase.from('rate_limits').update({
            count: data.count + 1
        }).eq('key', key);
        return {
            allowed: true,
            remaining: maxRequests - data.count - 1,
            resetIn: data.reset_time - now
        };
    } catch (err) {
        console.warn('[RateLimit] Exception, falling back to memory:', err);
        return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }
}
async function cleanupRateLimits() {
    const now = Date.now();
    // Clean Supabase
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
            if (supabase) {
                await supabase.from('rate_limits').delete().lt('reset_time', now);
            }
        } catch  {
        // Silent — cleanup is best-effort
        }
    }
    // Clean memory fallback
    for (const [key, entry] of memoryFallback.entries()){
        if (now > entry.reset_time) {
            memoryFallback.delete(key);
        }
    }
}
}),
"[project]/src/lib/fm/security.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Security Utilities
 * Input sanitization, auth helpers, rate limiting, validation
 */ // ─── Input Sanitization ────────────────────────────────────────────
/**
 * Strip HTML tags and dangerous characters from user input
 * Prevents XSS by removing <, >, &, ", ' and script-like patterns
 */ __turbopack_context__.s([
    "isAdminRole",
    ()=>isAdminRole,
    "isResourceOwner",
    ()=>isResourceOwner,
    "isValidId",
    ()=>isValidId,
    "isValidMatchEventType",
    ()=>isValidMatchEventType,
    "isValidMessageType",
    ()=>isValidMessageType,
    "isValidMonetaryAmount",
    ()=>isValidMonetaryAmount,
    "isValidNumber",
    ()=>isValidNumber,
    "isValidPlayerRating",
    ()=>isValidPlayerRating,
    "isValidUserId",
    ()=>isValidUserId,
    "sanitizeError",
    ()=>sanitizeError,
    "sanitizeInput",
    ()=>sanitizeInput,
    "sanitizeLikePattern",
    ()=>sanitizeLikePattern,
    "verifyProfileExists",
    ()=>verifyProfileExists,
    "verifyProfileOwnership",
    ()=>verifyProfileOwnership,
    "whitelistColumns",
    ()=>whitelistColumns
]);
// ─── Rate Limiting (Supabase-backed, with in-memory fallback) ─────
// The implementation lives in supabaseRateLimit.ts so it can use the
// Supabase client directly. It is re-exported here for backward-
// compatible imports (e.g. `import { checkRateLimit } from '@/lib/fm/security'`).
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$supabaseRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/supabaseRateLimit.ts [app-route] (ecmascript)");
function sanitizeInput(input, maxLength = 500) {
    if (!input || typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength)// Remove HTML tags
    .replace(/<[^>]*>/g, '')// Encode dangerous characters
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')// Remove null bytes
    .replace(/\0/g, '')// Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '');
}
function sanitizeLikePattern(input) {
    if (!input) return '';
    return input.replace(/%/g, '\\%').replace(/_/g, '\\_');
}
function isValidId(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[a-zA-Z0-9_-]+$/.test(id);
}
function isValidUserId(id) {
    if (!id || typeof id !== 'string') return false;
    // Allow UUID format or our custom text IDs (alphanumeric + dash + underscore + dot)
    return /^[a-zA-Z0-9._-]+$/.test(id) && id.length <= 128;
}
function isValidNumber(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
}
/**
 * Validate message type is one of the allowed categories
 */ const VALID_MESSAGE_TYPES = [
    'general',
    'trash_talk',
    'transfer',
    'alliance',
    'friendly_invite',
    'season_greeting'
];
function isValidMessageType(type) {
    return VALID_MESSAGE_TYPES.includes(type);
}
/**
 * Validate match event type
 */ const VALID_MATCH_EVENT_TYPES = [
    'goal',
    'yellow_card',
    'red_card',
    'injury',
    'substitution',
    'penalty',
    'own_goal',
    'var_check',
    'half_time',
    'full_time'
];
function isValidMatchEventType(type) {
    return VALID_MATCH_EVENT_TYPES.includes(type);
}
function isResourceOwner(resourceOwnerId, authenticatedUserId) {
    return resourceOwnerId === authenticatedUserId;
}
function isAdminRole(profileRole) {
    return profileRole === 'admin';
}
async function verifyProfileOwnership(supabase, profileId, options) {
    // 1. Validate profileId format
    if (!isValidUserId(profileId)) {
        return {
            valid: false,
            profile: null,
            error: 'Geçersiz profil ID formatı',
            status: 400
        };
    }
    // 2. Check that the profile exists in the profiles table
    const { data: profile, error: profileError } = await supabase.from('profiles').select('id, team_name, money, role').eq('id', profileId).maybeSingle();
    if (profileError || !profile) {
        console.warn('[SECURITY] verifyProfileOwnership: Profile not found for id:', profileId);
        return {
            valid: false,
            profile: null,
            error: 'Profil bulunamadı',
            status: 404
        };
    }
    // 3. If resource ownership check is requested
    if (options?.resourceTable && options?.resourceId) {
        const ownerCol = options.resourceOwnerColumn || 'profile_id';
        const { data: resource, error: resourceError } = await supabase.from(options.resourceTable).select(ownerCol).eq('id', options.resourceId).maybeSingle();
        if (resourceError || !resource) {
            return {
                valid: false,
                profile: null,
                error: 'Kaynak bulunamadı',
                status: 404
            };
        }
        if (resource[ownerCol] !== profileId) {
            console.warn('[SECURITY] verifyProfileOwnership: Resource ownership mismatch. Expected:', profileId, 'Got:', resource[ownerCol]);
            return {
                valid: false,
                profile: null,
                error: 'Bu kaynak üzerinde yetkiniz yok',
                status: 403
            };
        }
    }
    return {
        valid: true,
        profile
    };
}
async function verifyProfileExists(supabase, profileId) {
    if (!isValidUserId(profileId)) {
        return {
            valid: false,
            profile: null,
            error: 'Geçersiz profil ID formatı',
            status: 400
        };
    }
    const { data: profile, error } = await supabase.from('profiles').select('id, team_name, money, credits, role').eq('id', profileId).maybeSingle();
    if (error || !profile) {
        return {
            valid: false,
            profile: null,
            error: 'Profil bulunamadı',
            status: 404
        };
    }
    return {
        valid: true,
        profile
    };
}
;
// Run periodic cleanup every 5 minutes (fire-and-forget — the function
// is async but we intentionally don't await the result in setInterval).
if (typeof setInterval !== 'undefined') {
    setInterval(()=>{
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        __turbopack_context__.A("[project]/src/lib/fm/supabaseRateLimit.ts [app-route] (ecmascript, async loader)").then(({ cleanupRateLimits })=>cleanupRateLimits());
    }, 5 * 60 * 1000);
}
function sanitizeError(err) {
    // Log the full error server-side
    if (typeof console !== 'undefined') {
        console.error('[Server Error]', err);
    }
    // Return generic message to client
    return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
}
function isValidMonetaryAmount(amount, maxAmount = 10_000_000_000) {
    return isValidNumber(amount, 0, maxAmount);
}
function isValidPlayerRating(rating) {
    return isValidNumber(rating, 1, 99);
}
function whitelistColumns(obj, allowedKeys) {
    const result = {};
    for (const key of allowedKeys){
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
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
"[project]/src/app/api/staff/hire/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * Staff Hire API - Yeni personel ise al
 * POST /api/staff/hire
 * Body: { userId, type, stars }
 *
 * Yeni fiyatlandirma: Her personel tipi/icin yildiza gore sabit Kredi + Euro ucreti.
 * Kredi: profile.credits uzerinden dusulur
 * Euro:  profile.money uzerinden dusulur
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/fm/security.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)");
;
;
;
;
// -- Pricing Constants (Kredi + Euro per star level) --
const STAFF_PRICING = {
    scout: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 400000,
            2: 600000,
            3: 800000,
            4: 1000000,
            5: 1200000
        }
    },
    coach: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 650000,
            2: 800000,
            3: 950000,
            4: 1100000,
            5: 1250000
        }
    },
    physio: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 200000,
            2: 280000,
            3: 360000,
            4: 440000,
            5: 520000
        }
    },
    youth_coordinator: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 450000,
            2: 600000,
            3: 750000,
            4: 900000,
            5: 1050000
        }
    },
    sporting_director: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 350000,
            2: 500000,
            3: 650000,
            4: 800000,
            5: 950000
        }
    },
    analyst: {
        kredi: {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        },
        euro: {
            1: 150000,
            2: 250000,
            3: 350000,
            4: 450000,
            5: 550000
        }
    }
};
// Turkish first names for random name generation
const TURKISH_FIRST_NAMES = [
    'Ahmet',
    'Mehmet',
    'Mustafa',
    'Ali',
    'Hasan',
    'Ibrahim',
    'Ismail',
    'Yusuf',
    'Murat',
    'Ozgur',
    'Emre',
    'Burak',
    'Serkan',
    'Hakan',
    'Tolga',
    'Erkan',
    'Kemal',
    'Cemal',
    'Selim',
    'Kadir',
    'Osman',
    'Suleyman',
    'Fatih',
    'Oguz',
    'Deniz',
    'Ercan',
    'Ugur',
    'Ayhan',
    'Nuri',
    'Cengiz',
    'Mert',
    'Baris'
];
async function POST(request) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Supabase yapilandirilmamis.'
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
        const body = await request.json();
        const { userId, type, stars } = body;
        // -- Validate inputs --
        if (!userId || !type || !stars) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'userId, type ve stars zorunlu.'
            }, {
                status: 400
            });
        }
        if (stars < 1 || stars > 5) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Stars 1-5 arasi olmali.'
            }, {
                status: 400
            });
        }
        // -- Validate staff type and get pricing --
        const pricing = STAFF_PRICING[type];
        if (!pricing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: `Gecersiz personel tipi: ${type}`
            }, {
                status: 400
            });
        }
        const hireFeeKredi = pricing.kredi[stars] || 0;
        const hireFeeEuro = pricing.euro[stars] || 0;
        // -- Also validate against staff_types table for max_count --
        const { data: staffType, error: typeError } = await supabase.from('staff_types').select('*').eq('type', type).maybeSingle();
        if (typeError || !staffType) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Gecersiz personel tipi (veritabani).'
            }, {
                status: 400
            });
        }
        // -- Check max count --
        const { count: existingCount, error: countError } = await supabase.from('staff').select('*', {
            count: 'exact',
            head: true
        }).eq('user_id', userId).eq('type', type);
        if (countError) {
            console.error('[POST /api/staff/hire] Count error:', countError.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Personel sayisi kontrol edilemedi.'
            }, {
                status: 500
            });
        }
        if ((existingCount || 0) >= staffType.max_count) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: `${staffType.name_tr} icin maksimum ${staffType.max_count} kisi ise alabilirsiniz.`
            }, {
                status: 400
            });
        }
        // -- Verify profile exists --
        const { valid, profile, error: profileError, status: profileStatus } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["verifyProfileExists"])(supabase, userId);
        if (!valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: profileError || 'Profil bulunamadi.'
            }, {
                status: profileStatus || 404
            });
        }
        // -- Check balances --
        if ((profile.credits || 0) < hireFeeKredi) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: `Yetersiz kredi! ${hireFeeKredi} Kredi gerekli, mevcut: ${profile.credits || 0}`
            }, {
                status: 400
            });
        }
        if ((profile.money || 0) < hireFeeEuro) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: `Yetersiz Euro! ${hireFeeEuro.toLocaleString('tr-TR')} € gerekli, mevcut: ${(profile.money || 0).toLocaleString('tr-TR')} €`
            }, {
                status: 400
            });
        }
        // -- Get current season week --
        let currentWeek = 0;
        const { data: leagueTeam } = await supabase.from('league_teams').select('league_id').eq('profile_id', userId).maybeSingle();
        if (leagueTeam?.league_id) {
            const { data: season } = await supabase.from('seasons').select('current_tur').eq('league_id', leagueTeam.league_id).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            currentWeek = season?.current_tur || 0;
        }
        // -- Generate random Turkish name --
        const randomName = TURKISH_FIRST_NAMES[Math.floor(Math.random() * TURKISH_FIRST_NAMES.length)];
        const staffName = `${staffType.name_tr} ${randomName}`;
        // -- Deduct Kredi from profile --
        const newCredits = (profile.credits || 0) - hireFeeKredi;
        const newMoney = (profile.money || 0) - hireFeeEuro;
        const { error: updateError } = await supabase.from('profiles').update({
            credits: newCredits,
            money: newMoney
        }).eq('id', userId);
        if (updateError) {
            console.error('[POST /api/staff/hire] Balance deduction error:', updateError.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Bakiye dusulemedi.'
            }, {
                status: 500
            });
        }
        // -- Insert staff record --
        const totalCostForRecord = hireFeeKredi; // Store kredi portion as total_cost for backward compat
        const { data: newStaff, error: insertError } = await supabase.from('staff').insert({
            user_id: userId,
            type,
            stars,
            name: staffName,
            contract_start_week: currentWeek > 0 ? currentWeek : 1,
            contract_end_week: 34,
            total_cost: totalCostForRecord
        }).select('*, staff_types(name_tr, max_count, base_salary)').single();
        if (insertError) {
            console.error('[POST /api/staff/hire] Insert error:', insertError.message);
            // Refund on failure
            await supabase.from('profiles').update({
                credits: profile.credits,
                money: profile.money
            }).eq('id', userId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Personel kaydedilemedi.'
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            staff: newStaff,
            costKredi: hireFeeKredi,
            costEuro: hireFeeEuro,
            remainingCredits: newCredits,
            remainingMoney: newMoney
        });
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(err, {
            route: '/api/staff/hire',
            method: 'POST'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9a925be1._.js.map