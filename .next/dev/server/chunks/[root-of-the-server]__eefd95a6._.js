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
"[project]/src/app/api/facilities/upgrade/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * Facilities Upgrade API — Tesis yükseltme başlat / hızlandır / iptal et
 * POST /api/facilities/upgrade
 *
 * Body: { profileId, facilityType, action: 'start' | 'speedup' | 'cancel' }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/fm/security.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
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
        const body = await request.json();
        const { profileId, facilityType, action } = body;
        if (!profileId || !facilityType || !action) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Eksik parametreler.'
            }, {
                status: 400
            });
        }
        // Get current facility status
        const { data: facility, error: facilityError } = await supabase.from('user_facilities').select('*').eq('profile_id', profileId).eq('facility_type', facilityType).maybeSingle();
        const currentLevel = facility?.current_level || 0;
        // Verify profile exists
        const { valid, profile, error: profileError, status: profileStatus } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["verifyProfileExists"])(supabase, profileId);
        if (!valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: profileError || 'Profil bulunamadı.'
            }, {
                status: profileStatus || 404
            });
        }
        if (action === 'start') {
            // Check if any facility is already upgrading
            const { data: activeUpgrades } = await supabase.from('user_facilities').select('*').eq('profile_id', profileId).not('upgrade_end_at', 'is', null).gt('upgrade_end_at', new Date().toISOString());
            if (activeUpgrades && activeUpgrades.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Zaten devam eden bir yükseltme var.'
                }, {
                    status: 400
                });
            }
            const targetLevel = currentLevel + 1;
            // Max level 10 (stadiumMatrix STADIUM_MATRIX maxLevel: 10)
            if (targetLevel > 10) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Maksimum seviyeye ulaşıldı.'
                }, {
                    status: 400
                });
            }
            // Get upgrade cost
            const { data: costData } = await supabase.from('facility_upgrade_costs').select('*').eq('facility_type', facilityType).eq('target_level', targetLevel).maybeSingle();
            if (!costData) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Yükseltme maliyeti bulunamadı.'
                }, {
                    status: 404
                });
            }
            // Check credits
            if ((profile.credits || 0) < costData.credits_cost) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: `Yetersiz kredi. ${costData.credits_cost} kredi gerekli.`
                }, {
                    status: 400
                });
            }
            // Deduct credits
            const newCredits = (profile.credits || 0) - costData.credits_cost;
            await supabase.from('profiles').update({
                credits: newCredits
            }).eq('id', profileId);
            // Calculate upgrade end time
            const upgradeEnd = new Date(Date.now() + costData.upgrade_days * 24 * 60 * 60 * 1000).toISOString();
            // Upsert facility
            if (facility) {
                await supabase.from('user_facilities').update({
                    upgrade_started_at: new Date().toISOString(),
                    upgrade_end_at: upgradeEnd,
                    speed_up_used: false,
                    updated_at: new Date().toISOString()
                }).eq('id', facility.id);
            } else {
                await supabase.from('user_facilities').insert({
                    profile_id: profileId,
                    facility_type: facilityType,
                    current_level: 0,
                    upgrade_started_at: new Date().toISOString(),
                    upgrade_end_at: upgradeEnd,
                    speed_up_used: false
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `${facilityType} seviye ${targetLevel} yükseltmesi başlatıldı.`,
                credits_spent: costData.credits_cost,
                credits_remaining: newCredits,
                upgrade_end_at: upgradeEnd,
                upgrade_days: costData.upgrade_days
            });
        } else if (action === 'speedup') {
            if (!facility || !facility.upgrade_end_at || facility.speed_up_used) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Hızlandırma yapılamaz.'
                }, {
                    status: 400
                });
            }
            const targetLevel = currentLevel + 1;
            // Get speedup cost
            const { data: costData } = await supabase.from('facility_upgrade_costs').select('*').eq('facility_type', facilityType).eq('target_level', targetLevel).maybeSingle();
            const speedupCost = costData?.instant_half_credits || 5;
            if ((profile.credits || 0) < speedupCost) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: `Yetersiz kredi. ${speedupCost} kredi gerekli.`
                }, {
                    status: 400
                });
            }
            // Deduct credits
            const newCredits = (profile.credits || 0) - speedupCost;
            await supabase.from('profiles').update({
                credits: newCredits
            }).eq('id', profileId);
            // Halve the remaining time
            const currentEnd = new Date(facility.upgrade_end_at).getTime();
            const now = Date.now();
            const remaining = currentEnd - now;
            const newEnd = new Date(now + remaining / 2).toISOString();
            await supabase.from('user_facilities').update({
                upgrade_end_at: newEnd,
                speed_up_used: true,
                updated_at: new Date().toISOString()
            }).eq('id', facility.id);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Yükseltme hızlandırıldı!',
                credits_spent: speedupCost,
                credits_remaining: newCredits,
                new_upgrade_end_at: newEnd
            });
        } else if (action === 'cancel') {
            if (!facility || !facility.upgrade_end_at) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: true,
                    message: 'Aktif yükseltme yok.'
                }, {
                    status: 400
                });
            }
            const targetLevel = currentLevel + 1;
            // Refund 50% of credits
            const { data: costData } = await supabase.from('facility_upgrade_costs').select('credits_cost').eq('facility_type', facilityType).eq('target_level', targetLevel).maybeSingle();
            const refund = costData ? Math.floor(costData.credits_cost * 0.5) : 0;
            const newCredits = (profile.credits || 0) + refund;
            await supabase.from('profiles').update({
                credits: newCredits
            }).eq('id', profileId);
            await supabase.from('user_facilities').update({
                upgrade_started_at: null,
                upgrade_end_at: null,
                speed_up_used: false,
                updated_at: new Date().toISOString()
            }).eq('id', facility.id);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Yükseltme iptal edildi.',
                credits_refunded: refund,
                credits_remaining: newCredits
            });
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: 'Geçersiz action.'
            }, {
                status: 400
            });
        }
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(err, {
            route: '/api/facilities/upgrade',
            method: 'POST'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eefd95a6._.js.map