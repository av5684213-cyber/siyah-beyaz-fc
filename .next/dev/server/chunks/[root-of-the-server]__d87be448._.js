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
"[project]/src/lib/fm/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Antrenman Programları ─────────────────────────────────────────────────
// allowedPositions: hangi gruplar bu programı kullanabilir
//   'ALL' = hepsi, 'GK' = sadece kaleci, 'FIELD' = kaleci hariç
//   veya spesifik: ['DEF','MID'] vb.
// intensity: 1-100 arası antrenman yoğunluğu (gain çarpanı)
// condCost: antrenman sonrası kondisyon kaybı (negatif = kazanç)
__turbopack_context__.s([
    "ASSIST_CHANCE",
    ()=>ASSIST_CHANCE,
    "ATTACK_PROBS",
    ()=>ATTACK_PROBS,
    "BASE_ACADEMY_LEVEL",
    ()=>BASE_ACADEMY_LEVEL,
    "BASE_CREDITS",
    ()=>BASE_CREDITS,
    "BASE_MONEY",
    ()=>BASE_MONEY,
    "BASE_REPUTATION",
    ()=>BASE_REPUTATION,
    "CARD_RATES",
    ()=>CARD_RATES,
    "CONDITION_DRAIN",
    ()=>CONDITION_DRAIN,
    "DB_HEALTH_CHECK_INTERVAL",
    ()=>DB_HEALTH_CHECK_INTERVAL,
    "DEFEND_PROBS",
    ()=>DEFEND_PROBS,
    "EVENT_VISIBILITY",
    ()=>EVENT_VISIBILITY,
    "FATIGUE_COND_MODS",
    ()=>FATIGUE_COND_MODS,
    "FATIGUE_COND_THRESHOLDS",
    ()=>FATIGUE_COND_THRESHOLDS,
    "FATIGUE_MINUTE_MODS",
    ()=>FATIGUE_MINUTE_MODS,
    "FATIGUE_MINUTE_THRESHOLDS",
    ()=>FATIGUE_MINUTE_THRESHOLDS,
    "FORMATION_MODS",
    ()=>FORMATION_MODS,
    "GOAL_CHANCE",
    ()=>GOAL_CHANCE,
    "GOAL_TYPE",
    ()=>GOAL_TYPE,
    "HOME_ADVANTAGE",
    ()=>HOME_ADVANTAGE,
    "INITIAL_TEAM_NAME",
    ()=>INITIAL_TEAM_NAME,
    "INJURY_RISK",
    ()=>INJURY_RISK,
    "MATCH_STRUCTURE",
    ()=>MATCH_STRUCTURE,
    "MAX_WEEKS_PER_SEASON",
    ()=>MAX_WEEKS_PER_SEASON,
    "MOMENTUM_BIASES",
    ()=>MOMENTUM_BIASES,
    "OVERALL_WEIGHT_ATTACK",
    ()=>OVERALL_WEIGHT_ATTACK,
    "OVERALL_WEIGHT_DEFENSE",
    ()=>OVERALL_WEIGHT_DEFENSE,
    "OVERALL_WEIGHT_GK",
    ()=>OVERALL_WEIGHT_GK,
    "OVERALL_WEIGHT_MIDFIELD",
    ()=>OVERALL_WEIGHT_MIDFIELD,
    "PASS_SIMULATION",
    ()=>PASS_SIMULATION,
    "PHILOSOPHY_BONUSES",
    ()=>PHILOSOPHY_BONUSES,
    "PLAYER_RATING_WEIGHTS",
    ()=>PLAYER_RATING_WEIGHTS,
    "PLAYSTYLE_WEIGHTS",
    ()=>PLAYSTYLE_WEIGHTS,
    "PROB_CAPS",
    ()=>PROB_CAPS,
    "RATING_IMPACT",
    ()=>RATING_IMPACT,
    "RENTAL_COMMISSION_KR",
    ()=>RENTAL_COMMISSION_KR,
    "SET_PIECE_RATES",
    ()=>SET_PIECE_RATES,
    "STARTING_MONEY",
    ()=>STARTING_MONEY,
    "STAT_MOD_BASE",
    ()=>STAT_MOD_BASE,
    "STAT_MOD_VAR",
    ()=>STAT_MOD_VAR,
    "STRENGTH_RATIO",
    ()=>STRENGTH_RATIO,
    "TACTIC_AGGRESSION_BASELINE",
    ()=>TACTIC_AGGRESSION_BASELINE,
    "TACTIC_AGGRESSION_SCALE",
    ()=>TACTIC_AGGRESSION_SCALE,
    "TACTIC_HIGH_INTENSITY_BONUS",
    ()=>TACTIC_HIGH_INTENSITY_BONUS,
    "TACTIC_LOW_INTENSITY_PENALTY",
    ()=>TACTIC_LOW_INTENSITY_PENALTY,
    "TACTIC_MENTALITY_BONUS",
    ()=>TACTIC_MENTALITY_BONUS,
    "TACTIC_MENTALITY_PENALTY",
    ()=>TACTIC_MENTALITY_PENALTY,
    "TACTIC_PRESSING_BONUS",
    ()=>TACTIC_PRESSING_BONUS,
    "TEAMS_PER_LEAGUE",
    ()=>TEAMS_PER_LEAGUE,
    "TEAM_NAME_BANK",
    ()=>TEAM_NAME_BANK,
    "TIER_TEAM_NAMES",
    ()=>TIER_TEAM_NAMES,
    "TRAINING_PROGRAMS",
    ()=>TRAINING_PROGRAMS,
    "WEATHER_DISTRIBUTION",
    ()=>WEATHER_DISTRIBUTION,
    "WEATHER_MODIFIERS",
    ()=>WEATHER_MODIFIERS,
    "getRandomTeamNames",
    ()=>getRandomTeamNames,
    "getTeamNamesForDepartment",
    ()=>getTeamNamesForDepartment
]);
const TRAINING_PROGRAMS = [
    {
        id: 'fiziksel_yukleme',
        name: 'Fiziksel Yükleme',
        description: 'Dayanıklılık, güç ve hız odaklı kondisyon kampı.',
        targetStats: [
            'stamina',
            'power',
            'speed'
        ],
        allowedPositions: 'FIELD',
        intensity: 80,
        condCost: -12,
        color: 'red',
        icon: '💪'
    },
    {
        id: 'teknik_driller',
        name: 'Teknik Driller',
        description: 'Pas kalitesi, top kontrolü ve vizyon geliştirme.',
        targetStats: [
            'passing',
            'control',
            'vision'
        ],
        allowedPositions: 'FIELD',
        intensity: 70,
        condCost: -6,
        color: 'blue',
        icon: '🎯'
    },
    {
        id: 'savunma_okulu',
        name: 'Savunma Okulu',
        description: 'Pozisyon alma, markaj disiplini ve savunma.',
        targetStats: [
            'defending',
            'vision',
            'power'
        ],
        allowedPositions: [
            'DEF',
            'MID'
        ],
        intensity: 75,
        condCost: -8,
        color: 'green',
        icon: '🛡️'
    },
    {
        id: 'bitiricilik_kampi',
        name: 'Bitiricilik Kampı',
        description: 'Ceza sahası etkinliği, şut gücü ve hız.',
        targetStats: [
            'shooting',
            'control',
            'speed'
        ],
        allowedPositions: [
            'MID',
            'FWD'
        ],
        intensity: 85,
        condCost: -10,
        color: 'amber',
        icon: '⚽'
    },
    {
        id: 'kaleci_antrenmani',
        name: 'Kaleci Antrenmanı',
        description: 'Kalecilik, refleksler ve konsantrasyon. Sadece kaleciler.',
        targetStats: [
            'goalkeeping',
            'reflexes',
            'concentration'
        ],
        allowedPositions: 'GK',
        intensity: 80,
        condCost: -8,
        color: 'cyan',
        icon: '🧤'
    },
    {
        id: 'set_parcasi',
        name: 'Set Parçası Çalışması',
        description: 'Korner, frikik ve penaltı senaryoları. Kafa ve pas isabeti.',
        targetStats: [
            'vision',
            'passing',
            'heading'
        ],
        allowedPositions: 'FIELD',
        intensity: 55,
        condCost: -4,
        color: 'purple',
        icon: '📐'
    },
    {
        id: 'zihinsel_hazirlik',
        name: 'Zihinsel Hazırlık',
        description: 'Karar alma, soğukkanlılık ve konsantrasyon. Düşük kondisyon maliyeti.',
        targetStats: [
            'decisions',
            'composure',
            'concentration'
        ],
        allowedPositions: 'ALL',
        intensity: 45,
        condCost: -2,
        color: 'indigo',
        icon: '🧠'
    },
    {
        id: 'kondisyon_toparlanma',
        name: 'Kondisyon & Toparlanma',
        description: 'Aktif toparlanma. Sakatlık riski azalır, kondisyon hızla geri gelir.',
        targetStats: [
            'stamina'
        ],
        allowedPositions: 'ALL',
        intensity: 30,
        condCost: 20,
        color: 'emerald',
        icon: '🔋'
    },
    {
        id: 'takim_kimyasi',
        name: 'Takım Kimyası',
        description: 'Kombine çalışmalar, iletişim ve takım ruhu. Moral ve kimya artar.',
        targetStats: [
            'teamwork',
            'vision'
        ],
        allowedPositions: 'ALL',
        intensity: 50,
        condCost: -3,
        color: 'orange',
        icon: '🤝',
        specialEffect: 'chemistry_boost'
    },
    {
        id: 'pozisyon_adaptasyonu',
        name: 'Pozisyon Adaptasyonu',
        description: 'Yan pozisyon için özel çalışma. Yeni mevkiye alışma hızı artar.',
        targetStats: [
            'positioning',
            'decisions',
            'stamina'
        ],
        allowedPositions: 'FIELD',
        intensity: 60,
        condCost: -7,
        color: 'yellow',
        icon: '🔄',
        specialEffect: 'position_adapt'
    }
];
const INITIAL_TEAM_NAME = 'Siyahbeyazfc';
const STARTING_MONEY = 10_000_000;
const TEAM_NAME_BANK = [
    // ─── Şehir/Bölge Temalı ─────────────────────
    'Anadolu Gücü',
    'Ege Fırtınası',
    'Karadeniz Yıldızı',
    'Akdeniz Dalga',
    'İç Anadolu Kartalı',
    'Marmara Rüzgarı',
    'Doğu Anadolu Ateşi',
    'Güneydoğu Güneşi',
    'Trakya Birlik',
    'Boğaz Korelasi',
    // ─── FC / United / City Format ───────────────
    'FC Random 42',
    'Spor Kulübü 17',
    'United Anka',
    'City Perspektif',
    'FC Volkan',
    'United Çelik',
    'City Horizon',
    'FC Dayanışma',
    // ─── Doğa/Unsur Temalı ──────────────────────
    'Demir Fırtına',
    'Altın Ayak',
    'Gümüş Kanat',
    'Bakır Kale',
    'Volkan Spor',
    'Buz Kılıcı',
    'Ateş Çemberi',
    'Rüzgar Süpürücü',
    'Fırtına Kuşu',
    'Güneş Kulesi',
    'Yıldırım Ordu',
    'Şimşek Gücü',
    // ─── Hayvan Sembol ──────────────────────────
    'Kartal Yuvası',
    'Aslan Yüreği',
    'Bozkurt FK',
    'Çita Hızı',
    'Panter Spor',
    'Doğan Akademi',
    'Atmaca Birlik',
    'Karga Şaşkınlık',
    // ─── Soyut/Kavram ──────────────────────────
    'Zirve Peşinde',
    'Ufuk Ötesi',
    'Vadi Yıldızı',
    'Ova Birliği',
    'Tepe Kuşatı',
    'Sahil Güvenliği',
    'Liman Feneri',
    'Adalet FK',
    // ─── Renk Temalı ───────────────────────────
    'Siyah Şimşek',
    'Beyaz Fırtına',
    'Kırmızı Kale',
    'Yeşilova SK',
    'Mavi Cephane',
    'Turuncu Güç',
    'Mor Yıldız',
    'Gri Duvar',
    // ─── Rakamlı / Retro ───────────────────────
    'Spor 1923',
    'FK 57',
    'United 38',
    'City 74',
    'FC 91',
    'Birlik 1905',
    'Güç 1961',
    'Yıldız 2010',
    // ─── Yedek (genişletilebilir) ──────────────
    'Yeni Ufuklar',
    'Işık Yolu',
    'Gelecek FK',
    'Kömür Madeni',
    'Çelik Fabrikası',
    'İpek Yolu SK',
    'Bahar Canlılığı',
    'Son Kale'
];
function getRandomTeamNames(count, excludeNames = []) {
    const available = TEAM_NAME_BANK.filter((n)=>!excludeNames.includes(n));
    const selected = [];
    const used = new Set(excludeNames);
    for(let i = 0; i < count && available.length > 0; i++){
        const idx = Math.floor(Math.random() * available.length);
        const name = available[idx];
        if (!used.has(name)) {
            selected.push(name);
            used.add(name);
        }
        available.splice(idx, 1);
    }
    // Havuz yetersizse fallback: "FC Random XXX" formatı
    while(selected.length < count){
        const fallback = `FC Random ${Math.floor(Math.random() * 900) + 100}`;
        if (!used.has(fallback)) {
            selected.push(fallback);
            used.add(fallback);
        }
    }
    return selected;
}
const TIER_TEAM_NAMES = {
    1: [
        'Anadolu Gücü',
        'Kartal Yuvası',
        'Aslan Yüreği',
        'Demir Fırtına',
        'Altın Ayak',
        'Şimşek Gücü',
        'Zirve Peşinde',
        'Volkan Spor',
        'Bozkurt FK',
        'Güneş Kulesi',
        'Fırtına Kuşu',
        'Siyah Şimşek',
        'Yıldırım Ordu',
        'Spor 1923',
        'Çelik Fabrikası',
        'Mavi Cephane',
        'Sahil Güvenliği',
        'Ateş Çemberi'
    ],
    2: [
        'Ege Fırtınası',
        'Gümüş Kanat',
        'Çita Hızı',
        'Bakır Kale',
        'Buz Kılıcı',
        'Doğan Akademi',
        'Ufuk Ötesi',
        'Yeşilova SK',
        'Liman Feneri',
        'FK 57',
        'İpek Yolu SK',
        'Panter Spor',
        'Kırmızı Kale',
        'Vadi Yıldızı',
        'Atmaca Birlik',
        'Rüzgar Süpürücü',
        'Adalet FK',
        'Ova Birliği'
    ],
    3: [
        'Karadeniz Yıldızı',
        'Akdeniz Dalga',
        'İç Anadolu Kartalı',
        'Marmara Rüzgarı',
        'Doğu Anadolu Ateşi',
        'Güneydoğu Güneşi',
        'Trakya Birlik',
        'Boğaz Korelasi',
        'FC Random 42',
        'Spor Kulübü 17',
        'United Anka',
        'City Perspektif',
        'Karga Şaşkınlık',
        'Turuncu Güç',
        'Mor Yıldız',
        'Gri Duvar',
        'United 38',
        'City 74'
    ],
    4: [
        // Departman 1
        'FC Volkan',
        'United Çelik',
        'City Horizon',
        'FC Dayanışma',
        'Tepe Kuşatı',
        'Son Kale',
        'Yeni Ufuklar',
        'Işık Yolu',
        'Gelecek FK',
        'Kömür Madeni',
        'Bahar Canlılık',
        'FC 91',
        'Birlik 1905',
        'Güç 1961',
        'Yıldız 2010',
        'Beyaz Fırtına',
        'Kale Duvarı',
        'Savunma Hattı',
        // Departman 2
        'Savun Kalesi',
        'Atak Birlik',
        'Kontra FC',
        'Pres Gücü',
        'Orta Saha HK',
        'Kanat Açılımı',
        'Derin Koşu SK',
        'Baskı United',
        'Çevik FK',
        'Dayanıklı Spor',
        'Hızlı Counter',
        'Sabit Pozisyon',
        'Geniş Alan',
        'Dar Alan City',
        'Serbest Vuruş FK',
        'Penaltı Ustası',
        'Taç Atışı SK',
        'Korner Birliği',
        // Departman 3
        'Akademi 1',
        'Akademi 2',
        'Akademi 3',
        'Akademi 4',
        'Akademi 5',
        'Akademi 6',
        'Akademi 7',
        'Akademi 8',
        'Akademi 9',
        'Akademi 10',
        'Akademi 11',
        'Akademi 12',
        'Akademi 13',
        'Akademi 14',
        'Akademi 15',
        'Akademi 16',
        'Akademi 17',
        'Akademi 18',
        // Departman 4
        'Stadyum 1',
        'Stadyum 2',
        'Stadyum 3',
        'Stadyum 4',
        'Stadyum 5',
        'Stadyum 6',
        'Stadyum 7',
        'Stadyum 8',
        'Stadyum 9',
        'Stadyum 10',
        'Stadyum 11',
        'Stadyum 12',
        'Stadyum 13',
        'Stadyum 14',
        'Stadyum 15',
        'Stadyum 16',
        'Stadyum 17',
        'Stadyum 18',
        // Departman 5
        'Yedek 1',
        'Yedek 2',
        'Yedek 3',
        'Yedek 4',
        'Yedek 5',
        'Yedek 6',
        'Yedek 7',
        'Yedek 8',
        'Yedek 9',
        'Yedek 10',
        'Yedek 11',
        'Yedek 12',
        'Yedek 13',
        'Yedek 14',
        'Yedek 15',
        'Yedek 16',
        'Yedek 17',
        'Yedek 18'
    ]
};
function getTeamNamesForDepartment(tier, departmentIndex) {
    // 1-3. liglerde sadece 1 bölüm var
    if (tier >= 1 && tier <= 3 && departmentIndex > 1) {
        console.warn(`[getTeamNamesForDepartment] ${tier}. Lig tek gruplu — departmentIndex=1 olarak düzeltildi`);
        departmentIndex = 1;
    }
    const pool = TIER_TEAM_NAMES[tier] || TIER_TEAM_NAMES[4] || [];
    const start = (departmentIndex - 1) * 18; // departmentIndex 1-based
    let names = pool.slice(start, start + 18);
    // Havuz yetersizse TEAM_NAME_BANK'tan rastgele tamamla
    if (names.length < 18) {
        const existingNames = [
            ...names
        ];
        const randomExtra = getRandomTeamNames(18 - names.length, existingNames);
        names = [
            ...names,
            ...randomExtra
        ];
    }
    return names;
}
const RENTAL_COMMISSION_KR = 10;
const BASE_MONEY = 100_000_000; // 100M €
const BASE_CREDITS = 250;
const BASE_REPUTATION = 30;
const BASE_ACADEMY_LEVEL = 1;
const PHILOSOPHY_BONUSES = {
    financial: {
        moneyBonus: 50_000_000
    },
    legend: {
        creditsBonus: 250
    },
    youth: {
        academyLevel: 3
    },
    squad: {
        qualityMod: 1.1
    },
    reputation: {
        reputationBonus: 20
    },
    balanced: {}
};
const TEAMS_PER_LEAGUE = 18;
const MAX_WEEKS_PER_SEASON = 34;
const DB_HEALTH_CHECK_INTERVAL = 300_000;
const FORMATION_MODS = {
    '4-4-2': {
        attack: 1.0,
        midfield: 1.0,
        defense: 1.0
    },
    '4-3-3': {
        attack: 1.12,
        midfield: 0.95,
        defense: 0.97
    },
    '4-5-1': {
        attack: 0.90,
        midfield: 1.12,
        defense: 1.02
    },
    '4-2-3-1': {
        attack: 1.05,
        midfield: 1.06,
        defense: 0.96
    },
    '3-5-2': {
        attack: 1.05,
        midfield: 1.08,
        defense: 0.94
    },
    '3-4-3': {
        attack: 1.15,
        midfield: 0.96,
        defense: 0.88
    },
    '5-3-2': {
        attack: 0.97,
        midfield: 0.96,
        defense: 1.14
    },
    '5-4-1': {
        attack: 0.85,
        midfield: 1.0,
        defense: 1.18
    },
    '4-1-4-1': {
        attack: 0.95,
        midfield: 1.10,
        defense: 1.00
    },
    '4-4-1-1': {
        attack: 1.04,
        midfield: 1.02,
        defense: 0.98
    }
};
const STAT_MOD_BASE = 0.7;
const STAT_MOD_VAR = 0.3;
const OVERALL_WEIGHT_ATTACK = 0.3;
const OVERALL_WEIGHT_MIDFIELD = 0.3;
const OVERALL_WEIGHT_DEFENSE = 0.25;
const OVERALL_WEIGHT_GK = 0.15;
const TACTIC_MENTALITY_BONUS = 0.05; // Mentality >= 4 bonus per point above 3
const TACTIC_MENTALITY_PENALTY = 0.03; // Mentality <= 2 penalty per point below 3
const TACTIC_PRESSING_BONUS = 0.04; // Pressing bonus
const TACTIC_HIGH_INTENSITY_BONUS = 0.06; // High intensity bonus
const TACTIC_LOW_INTENSITY_PENALTY = 0.04; // Low intensity penalty
const TACTIC_AGGRESSION_SCALE = 0.0004; // Aggression scaling factor
const TACTIC_AGGRESSION_BASELINE = 50; // Aggression baseline
const WEATHER_MODIFIERS = {
    rainy: {
        passingMod: 0.95,
        speedMod: 0.97,
        shootingMod: 0.96,
        tacklingMod: 0.98
    },
    snowy: {
        passingMod: 0.93,
        speedMod: 0.90,
        shootingMod: 0.92,
        tacklingMod: 0.95
    },
    windy: {
        passingMod: 0.96,
        speedMod: 0.98,
        shootingMod: 0.94,
        tacklingMod: 1.0
    },
    sunny: {
        passingMod: 1.0,
        speedMod: 1.0,
        shootingMod: 1.0,
        tacklingMod: 1.0
    }
};
const WEATHER_DISTRIBUTION = [
    'sunny',
    'sunny',
    'sunny',
    'rainy',
    'snowy',
    'windy'
];
const HOME_ADVANTAGE = {
    overall: 1.10,
    attack: 1.10,
    midfield: 1.08,
    defense: 1.05
};
const FATIGUE_COND_THRESHOLDS = {
    low: 50,
    mid: 70
};
const FATIGUE_COND_MODS = {
    low: 0.6,
    mid: 0.8,
    full: 1.0
};
const FATIGUE_MINUTE_THRESHOLDS = {
    late: 75,
    mid: 60
};
const FATIGUE_MINUTE_MODS = {
    late: 0.85,
    mid: 0.92,
    fresh: 1.0
};
const ATTACK_PROBS = {
    FWD: {
        shotMultiplier: 0.18,
        shotMin: 0.02,
        shotMax: 0.25,
        chanceMultiplier: 0.12,
        chanceMin: 0.02,
        chanceMax: 0.18,
        foul: 0.03
    },
    MID: {
        shotMultiplier: 0.08,
        shotMin: 0.01,
        shotMax: 0.12,
        chanceMultiplier: 0.10,
        chanceMin: 0.01,
        chanceMax: 0.15,
        interceptionMultiplier: 0.08,
        interceptionMin: 0.01,
        interceptionMax: 0.12,
        foul: 0.04
    },
    DEF: {
        tackleMultiplier: 0.07,
        tackleMin: 0.01,
        tackleMax: 0.10,
        interceptionMultiplier: 0.06,
        interceptionMin: 0.01,
        interceptionMax: 0.09,
        foul: 0.05
    },
    GK: {
        saveMultiplier: 0.04,
        saveMin: 0.01,
        saveMax: 0.06
    }
};
const DEFEND_PROBS = {
    DEF: {
        tackleMultiplier: 0.12,
        tackleMin: 0.02,
        tackleMax: 0.18,
        interceptionMultiplier: 0.09,
        interceptionMin: 0.01,
        interceptionMax: 0.14,
        foul: 0.06
    },
    MID: {
        tackleMultiplier: 0.07,
        tackleMin: 0.01,
        tackleMax: 0.11,
        interceptionMultiplier: 0.08,
        interceptionMin: 0.01,
        interceptionMax: 0.12,
        foul: 0.04
    },
    GK: {
        saveMultiplier: 0.10,
        saveMin: 0.02,
        saveMax: 0.15
    },
    FWD: {
        interceptionMultiplier: 0.04,
        interceptionMin: 0.01,
        interceptionMax: 0.06,
        foul: 0.03
    }
};
const STRENGTH_RATIO = {
    attackShot: 1.5,
    attackChance: 1.3,
    defendTackle: 1.3,
    defendSave: 1.5
};
const PROB_CAPS = {
    shot: 0.35,
    tackle: 0.25,
    interception: 0.20,
    foul: 0.15,
    chance: 0.25,
    save: 0.20
};
const GOAL_CHANCE = {
    base: 0.03,
    gkWeight: 0.5,
    qualityGapBonus: 0.3,
    qualityGapPenalty: 0.2,
    mentalityBonus: 0.12,
    mentalityPenalty: 0.08,
    counterTriggerProb: 0.3,
    pressingGoalBoost: 0.3,
    lateGameDesperation: 1.25,
    clampMin: 0.005,
    clampMax: 0.12
};
const ASSIST_CHANCE = 0.65;
const GOAL_TYPE = {
    headerChance: 0.15,
    longShotChance: 0.10,
    longShotThreshold: 70,
    lateGoalMinute: 85
};
const RATING_IMPACT = {
    goal: 1.2,
    assist: 0.7,
    shotSaved: 0.15,
    gkSave: 0.4,
    shotWide: -0.1,
    shotPost: 0.05,
    chanceCreated: 0.05,
    assistOnChance: 0.1,
    tackle: 0.15,
    interception: 0.12,
    foulCommitted: -0.15,
    yellowCard: -0.35,
    redCard: -2.0,
    penalty: 0.3,
    freeKick: 0.1,
    offside: -0.05,
    corner: 0.02,
    gkReactionarySave: 0.3
};
const CARD_RATES = {
    yellow: 0.15,
    red: 0.03,
    penalty: 0.1,
    foulVisibility: 0.4
};
const SET_PIECE_RATES = {
    offside: 0.02,
    corner: 0.015
};
const EVENT_VISIBILITY = {
    tackle: 0.3,
    interception: 0.25,
    gkSaveScaling: 0.5,
    gkSave: 0.35
};
const INJURY_RISK = {
    low: 0.015,
    mid: 0.005,
    base: 0.001,
    condThresholdLow: 40,
    condThresholdMid: 60,
    ratingImpactHeavy: -1.5,
    ratingImpactMedium: -1.0,
    ratingImpactLight: -0.5
};
const CONDITION_DRAIN = {
    base: 0.15,
    staminaDivisor: 1000,
    fallbackDrain: 0.2
};
const MATCH_STRUCTURE = {
    duration: 90,
    halftime: 45,
    substitutionSlots: 3,
    autoSubMinutes: [
        60,
        75
    ],
    tiredPlayerCondThreshold: 50
};
const MOMENTUM_BIASES = {
    earlyHomeBias: 1.15,
    earlyHomeCutoff: 15,
    awayRallyBias: 1.08,
    awayRallyStart: 45,
    awayRallyEnd: 60,
    leadSitBack: 0.85,
    leadSitBackCutoff: 75,
    losingTeamPush: 1.2,
    losingPushCutoff: 60,
    redCardPenalty: 0.75
};
const PASS_SIMULATION = {
    minPasses: 1,
    maxPasses: 4,
    keyPassChance: 0.12,
    longBallShortPassPenalty: 0.1
};
const PLAYSTYLE_WEIGHTS = {
    combinationWeight: 0.5,
    defenseWeight: 0.3,
    pressingTackleBoost: 0.5
};
const PLAYER_RATING_WEIGHTS = {
    baseRating: 6.0,
    GK: {
        perSave: 0.15,
        perGoalConceded: -0.3
    },
    DEF: {
        perTackle: 0.08,
        perInterception: 0.06,
        perAssist: 0.25,
        perGoal: 0.5
    },
    MID: {
        perKeyPass: 0.12,
        perPass: 0.003,
        perTackle: 0.04,
        perGoal: 0.4,
        perAssist: 0.3
    },
    FWD: {
        perGoal: 0.5,
        perAssist: 0.3,
        perShotOnTarget: 0.05,
        perMissedShot: -0.02
    },
    yellowCardPenalty: -0.2,
    redCardPenalty: -1.0,
    foulPenalty: -0.03,
    playingTimeFactors: {
        full85: 1.0,
        mid60: 0.9,
        low30: 0.8,
        sub30: 0.7
    },
    ratingShiftBase: 5.0,
    mentalModifierStrength: 0.5,
    ratingClamp: {
        min: 3.0,
        max: 10.0
    }
};
}),
"[project]/src/lib/fm/league.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateRoundRobin",
    ()=>generateRoundRobin,
    "generateSeasonFixtures",
    ()=>generateSeasonFixtures,
    "getTomorrowNoon",
    ()=>getTomorrowNoon,
    "updateLeagueStandingsAfterClientMatch",
    ()=>updateLeagueStandingsAfterClientMatch
]);
async function updateLeagueStandingsAfterClientMatch(supabase, profileId, userScore, opponentScore) {
    try {
        // ── 1. Kullanıcının league_teams kaydını bul ──
        const { data: userTeam, error: userTeamErr } = await supabase.from('league_teams').select('id, name, league_id').eq('profile_id', profileId).maybeSingle();
        if (userTeamErr || !userTeam) {
            console.warn('[updateLeagueStandingsAfterClientMatch] User team not found in league_teams:', userTeamErr?.message);
            return {
                success: false,
                error: 'Kullanıcının lig takımı bulunamadı'
            };
        }
        // ── 2. Aktif sezonu bul ──
        const { data: currentSeason, error: seasonErr } = await supabase.from('seasons').select('id').eq('league_id', userTeam.league_id).eq('is_finished', false).order('created_at', {
            ascending: false
        }).limit(1).maybeSingle();
        if (seasonErr || !currentSeason) {
            console.warn('[updateLeagueStandingsAfterClientMatch] No active season found:', seasonErr?.message);
            return {
                success: false,
                error: 'Aktif sezon bulunamadı'
            };
        }
        const seasonId = currentSeason.id;
        // ── 3. Kullanıcının bir sonraki programlanmış fikstürünü bul ──
        const { data: nextFixture, error: fixtureErr } = await supabase.from('fixtures').select('id, home_team_id, away_team_id, tur, season_id').eq('status', 'scheduled').eq('season_id', seasonId).or(`home_team_id.eq.${userTeam.id},away_team_id.eq.${userTeam.id}`).order('match_date', {
            ascending: true
        }).limit(1).maybeSingle();
        if (fixtureErr) {
            console.warn('[updateLeagueStandingsAfterClientMatch] Fixture query error:', fixtureErr.message);
            return {
                success: false,
                error: 'Fikstür sorgulama hatası'
            };
        }
        // Fikstür yoksa sadece kullanıcının standings'ini güncelle (rakip belli değilse)
        let homeTeamId = userTeam.id;
        let awayTeamId = null;
        let fixtureUpdated = false;
        if (nextFixture) {
            // Fikstürde kullanıcı ev sahibi mi deplasman mı?
            const isUserHome = nextFixture.home_team_id === userTeam.id;
            homeTeamId = nextFixture.home_team_id;
            awayTeamId = nextFixture.away_team_id;
            // Skoru fikstüre göre eşleştir
            // MatchDay'de kullanıcı her zaman "home" olarak oynar,
            // ama gerçek fikstürde deplasmanda olabilir
            const fixtureHomeScore = isUserHome ? userScore : opponentScore;
            const fixtureAwayScore = isUserHome ? opponentScore : userScore;
            // ── 3a. Fikstürü completed olarak güncelle ──
            const { error: fixUpdateErr } = await supabase.from('fixtures').update({
                status: 'completed',
                home_score: fixtureHomeScore,
                away_score: fixtureAwayScore
            }).eq('id', nextFixture.id);
            if (fixUpdateErr) {
                console.warn('[updateLeagueStandingsAfterClientMatch] Fixture update failed:', fixUpdateErr.message);
            } else {
                fixtureUpdated = true;
                console.log(`[updateLeagueStandingsAfterClientMatch] Fixture ${nextFixture.id} completed: ${fixtureHomeScore}-${fixtureAwayScore}`);
            }
            // ── 4. Her iki takım için standings güncelle ──
            await upsertStanding(supabase, seasonId, userTeam.league_id, homeTeamId, fixtureHomeScore, fixtureAwayScore);
            if (awayTeamId) {
                await upsertStanding(supabase, seasonId, userTeam.league_id, awayTeamId, fixtureAwayScore, fixtureHomeScore);
            }
        } else {
            // Fikstür bulunamadı — sadece kullanıcının standings'ini güncelle
            console.log('[updateLeagueStandingsAfterClientMatch] No scheduled fixture found, updating user standings only');
            await upsertStanding(supabase, seasonId, userTeam.league_id, userTeam.id, userScore, opponentScore);
        }
        console.log(`[updateLeagueStandingsAfterClientMatch] Standings updated: user=${userTeam.name} (${userScore}-${opponentScore})`);
        return {
            success: true,
            fixtureUpdated
        };
    } catch (err) {
        console.error('[updateLeagueStandingsAfterClientMatch] Error:', err);
        return {
            success: false,
            error: String(err)
        };
    }
}
/**
 * Bir takımın league_standings satırını günceller veya yoksa oluşturur.
 * Cron'daki updateLeagueStandings ile aynı hesaplama mantığı.
 */ async function upsertStanding(supabase, seasonId, leagueId, teamId, goalsFor, goalsAgainst) {
    // Mevcut standing satırını bul
    const { data: existing, error: selectErr } = await supabase.from('league_standings').select('*').eq('team_id', teamId).eq('season_id', seasonId).maybeSingle();
    if (selectErr) {
        console.warn('[upsertStanding] Select error:', selectErr.message);
    }
    const isWin = goalsFor > goalsAgainst;
    const isDraw = goalsFor === goalsAgainst;
    const isLoss = goalsFor < goalsAgainst;
    const pointsGained = isWin ? 3 : isDraw ? 1 : 0;
    if (existing) {
        // Mevcut satırı güncelle
        const updated = {
            played: (existing.played || 0) + 1,
            won: (existing.won || 0) + (isWin ? 1 : 0),
            drawn: (existing.drawn || 0) + (isDraw ? 1 : 0),
            lost: (existing.lost || 0) + (isLoss ? 1 : 0),
            gf: (existing.gf || 0) + goalsFor,
            ga: (existing.ga || 0) + goalsAgainst,
            gd: (existing.gf || 0) + goalsFor - ((existing.ga || 0) + goalsAgainst),
            points: (existing.points || 0) + pointsGained
        };
        const { error: updateErr } = await supabase.from('league_standings').update(updated).eq('id', existing.id);
        if (updateErr) {
            console.error(`[upsertStanding] Update failed for team ${teamId}:`, updateErr.message);
        }
    } else {
        // Satır yoksa oluştur
        const newRow = {
            season_id: seasonId,
            league_id: leagueId,
            team_id: teamId,
            played: 1,
            won: isWin ? 1 : 0,
            drawn: isDraw ? 1 : 0,
            lost: isLoss ? 1 : 0,
            gf: goalsFor,
            ga: goalsAgainst,
            gd: goalsFor - goalsAgainst,
            points: pointsGained
        };
        const { error: insertErr } = await supabase.from('league_standings').insert(newRow);
        if (insertErr) {
            console.error(`[upsertStanding] Insert failed for team ${teamId}:`, insertErr.message);
        }
    }
}
function getTomorrowNoon() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow;
}
function generateRoundRobin(teams, startDate) {
    const n = teams.length;
    if (n < 2) return [];
    // Takım sayısı tekse "bye" ekle
    const teamList = [
        ...teams
    ];
    if (teamList.length % 2 !== 0) {
        teamList.push('BYE');
    }
    const totalRounds = teamList.length - 1;
    const halfSize = teamList.length / 2;
    const fixed = teamList[0];
    const rotating = teamList.slice(1);
    const weeks = [];
    for(let round = 0; round < totalRounds; round++){
        const roundTeams = [
            fixed,
            ...rotating
        ];
        const matches = [];
        for(let i = 0; i < halfSize; i++){
            const home = roundTeams[i];
            const away = roundTeams[roundTeams.length - 1 - i];
            if (home !== 'BYE' && away !== 'BYE') {
                matches.push({
                    home,
                    away
                });
            }
        }
        weeks.push({
            week: round + 1,
            matches
        });
        // Rotating dizisini döndür
        rotating.push(rotating.shift());
    }
    // İkinci yarışma (deplasmanlı) — home/away ters çevrilir
    const reverseWeeks = weeks.map((w)=>({
            week: w.week + totalRounds,
            matches: w.matches.map((m)=>({
                    home: m.away,
                    away: m.home
                }))
        }));
    return [
        ...weeks,
        ...reverseWeeks
    ];
}
const generateSeasonFixtures = (league, userTeamId, seasonId, startDate)=>{
    try {
        const fixtures = [];
        let week = 1;
        let currentDate = new Date(startDate || getTomorrowNoon());
        // Takım listesi yoksa varsayılan isimler kullan
        const teamNames = league?.teams || [
            'Anadolu Gücü',
            'Demir Fırtına',
            'Altın Ayak',
            'Şimşek Gücü',
            'Bozkurt FK',
            'Güneş Kulesi',
            'Fırtına Kuşu',
            'Siyah Şimşek',
            'Yıldırım Ordu',
            'Spor 1923',
            'Çelik Fabrikası',
            'Mavi Cephane',
            'Sahil Güvenliği',
            'Ateş Çemberi',
            'Volkan Spor',
            'Buz Kılıcı',
            'Kartal Yuvası',
            'Aslan Yüreği'
        ];
        // Round-robin üret
        const rr = generateRoundRobin(teamNames, currentDate);
        // Her hafta için 2 maç günü ata (Pazartesi 12:00, Çarşamba 18:00 gibi)
        for (const weekData of rr){
            if (week > 34) break; // 34 hafta limit
            const matchDate1 = new Date(currentDate.getTime());
            matchDate1.setHours(12, 0, 0, 0);
            const matchDate2 = new Date(currentDate.getTime());
            matchDate2.setDate(matchDate2.getDate() + 2);
            matchDate2.setHours(18, 0, 0, 0);
            // Her maç gününe en fazla 1 maç ata
            let matchIndex = 0;
            for (const match of weekData.matches){
                const isUserMatch = match.home === userTeamId || match.away === userTeamId;
                const matchDate = matchIndex % 2 === 0 ? matchDate1 : matchDate2;
                fixtures.push({
                    id: `fix-${fixtures.length + 1}`,
                    week,
                    homeTeam: match.home,
                    awayTeam: match.away,
                    isFinished: false,
                    isUserMatch,
                    importance: isUserMatch ? 'high' : 'medium',
                    stadium: 'Stadyum',
                    date: matchDate
                });
                matchIndex++;
            }
            // Sonraki hafta Pazartesi
            currentDate.setDate(currentDate.getDate() + 7);
            week++;
        }
        return fixtures;
    } catch (err) {
        console.error('[generateSeasonFixtures] Error:', err);
        return [];
    }
};
}),
"[project]/src/lib/fm/referee.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Siyah Beyaz FC — Referee System
// =============================================================================
// 6 hakem/lig, kişilik tipleri, maç motoru entegrasyonu.
// Hakemler faul, kart, penaltı, ofsayt kararlarını etkiler.
// =============================================================================
// ─── Referee Personality Types ─────────────────────────────────────────────
__turbopack_context__.s([
    "REFEREE_PERSONALITIES",
    ()=>REFEREE_PERSONALITIES,
    "assignRefereesToSeason",
    ()=>assignRefereesToSeason,
    "checkVARForGoal",
    ()=>checkVARForGoal,
    "createRefereeMatchContext",
    ()=>createRefereeMatchContext,
    "generateLeagueReferees",
    ()=>generateLeagueReferees,
    "getOffsideMultiplier",
    ()=>getOffsideMultiplier,
    "getRefereeDisplayInfo",
    ()=>getRefereeDisplayInfo,
    "pickRefereeForMatch",
    ()=>pickRefereeForMatch,
    "shouldCallFoul",
    ()=>shouldCallFoul,
    "shouldGivePenalty",
    ()=>shouldGivePenalty,
    "shouldGiveRedCard",
    ()=>shouldGiveRedCard,
    "shouldGiveYellowCard",
    ()=>shouldGiveYellowCard
]);
const REFEREE_PERSONALITIES = {
    katil: {
        key: 'katil',
        label_tr: 'Katılcı',
        description_tr: 'Sahada otorite kurar, her türlü ihlali faul çalar, kartları cömertçe dağıtır. Oyuncular ondan korkar.',
        foulMultiplier: 1.5,
        yellowCardMultiplier: 1.8,
        redCardMultiplier: 2.0,
        penaltyMultiplier: 1.1,
        offsideMultiplier: 1.2,
        varReviewChance: 0.15,
        homeBias: 0.0,
        consistency: 0.9,
        emoji: '🟥'
    },
    dengeci: {
        key: 'dengeci',
        label_tr: 'Dengeci',
        description_tr: 'Adil ve tutarlı. Ne çok sert ne çok yumuşak. FIFA\'nın aradığı ideal hakem profili.',
        foulMultiplier: 1.0,
        yellowCardMultiplier: 1.0,
        redCardMultiplier: 1.0,
        penaltyMultiplier: 1.0,
        offsideMultiplier: 1.0,
        varReviewChance: 0.10,
        homeBias: 0.0,
        consistency: 0.95,
        emoji: '⚖️'
    },
    hoşgörülü: {
        key: 'hoşgörülü',
        label_tr: 'Hoşgörülü',
        description_tr: 'Oyunun akmasını ister, küçük faullere göz yumar. Kart yerine uyarıyı tercih eder. Seyirciler sever.',
        foulMultiplier: 0.6,
        yellowCardMultiplier: 0.5,
        redCardMultiplier: 0.4,
        penaltyMultiplier: 0.8,
        offsideMultiplier: 0.7,
        varReviewChance: 0.05,
        homeBias: 0.0,
        consistency: 0.85,
        emoji: '🤝'
    },
    ev_sahibi: {
        key: 'ev_sahibi',
        label_tr: 'Ev Sahibi Taraftarı',
        description_tr: 'Deplasman takımına karşı daha sert, ev sahibine yakın. Kritik kararlar genelde ev sahibi lehine.',
        foulMultiplier: 1.1,
        yellowCardMultiplier: 1.2,
        redCardMultiplier: 1.1,
        penaltyMultiplier: 1.3,
        offsideMultiplier: 1.1,
        varReviewChance: 0.10,
        homeBias: 0.12,
        consistency: 0.7,
        emoji: '🏠'
    },
    değişken: {
        key: 'değişken',
        label_tr: 'Değişken',
        description_tr: 'Bir maç çok sert, diğer maç çok yumuşak. İlk 15 dakikadaki kararı tüm maça yansıtır. Öngörülemez.',
        foulMultiplier: 1.0,
        yellowCardMultiplier: 1.0,
        redCardMultiplier: 1.0,
        penaltyMultiplier: 1.0,
        offsideMultiplier: 1.0,
        varReviewChance: 0.12,
        homeBias: 0.0,
        consistency: 0.4,
        emoji: '🎲'
    },
    var_sever: {
        key: 'var_sever',
        label_tr: 'VAR Meraklısı',
        description_tr: 'Her şüpheli pozisyonda VAR\'a gider, bol penaltı çalar, şüpheli golleri iptal edebilir. Uzun maçlar.',
        foulMultiplier: 0.9,
        yellowCardMultiplier: 0.8,
        redCardMultiplier: 0.9,
        penaltyMultiplier: 1.6,
        offsideMultiplier: 1.3,
        varReviewChance: 0.35,
        homeBias: 0.0,
        consistency: 0.8,
        emoji: '📺'
    }
};
// ─── Procedural Turkish Referee Name Pools ─────────────────────────────────
// Gerçek hakem isimleri kaldırıldı — her lig için rastgele 18 benzersiz hakem üretilir
const FIRST_NAMES = [
    'Mete',
    'Alper',
    'Halil',
    'Arda',
    'Zorbay',
    'Volkan',
    'Atilla',
    'Cihan',
    'Bahattin',
    'Kadir',
    'Ümit',
    'Burak',
    'Sarper',
    'Tugay',
    'Oğuzhan',
    'Yasin',
    'Erkan',
    'Yiğit'
];
const LAST_NAMES = [
    'Tunç',
    'Karakuş',
    'Özbek',
    'Batur',
    'Akduman',
    'Kılınçer',
    'Gültekin',
    'Bozkurt',
    'Bilgin',
    'Ünal',
    'Dağdeviren',
    'Akansel',
    'Erbay',
    'Kılavuz',
    'Sazak',
    'Demirel',
    'Yörükoğlu',
    'Akça',
    'Koçyiğit',
    'Badem'
];
function generateLeagueReferees(leagueId, count = 18) {
    const personalities = [
        'katil',
        'dengeci',
        'hoşgörülü',
        'ev_sahibi',
        'değişken',
        'var_sever'
    ];
    const referees = [];
    for(let i = 0; i < count; i++){
        const personality = personalities[i % personalities.length];
        const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`;
        const experience = Math.floor(Math.random() * 5) + 3; // 3-8
        // Strictness = personality-based baseline + experience modifier
        const baseStrictness = {
            katil: 75,
            dengeci: 50,
            hoşgörülü: 25,
            ev_sahibi: 55,
            değişken: 45,
            var_sever: 40
        };
        const strictness = Math.min(80, Math.max(40, baseStrictness[personality] + (experience - 5) * 3 + (Math.random() * 10 - 5)));
        referees.push({
            id: `ref-${leagueId}-${i}`,
            name,
            personality,
            experience,
            league_id: leagueId,
            strictness: Math.round(strictness),
            totalMatches: 0,
            totalYellows: 0,
            totalReds: 0,
            totalPenalties: 0
        });
    }
    return referees;
}
function createRefereeMatchContext(referee) {
    const config = REFEREE_PERSONALITIES[referee.personality];
    // "Değişken" hakem için runtime random modları
    let runtimeFoulMod = 1.0;
    let runtimeCardMod = 1.0;
    let runtimePenaltyMod = 1.0;
    if (referee.personality === 'değişken') {
        // İlk 15 dakikadaki davranış tüm maça yansır
        const roll = Math.random();
        if (roll < 0.3) {
            // Sert maç
            runtimeFoulMod = 1.4;
            runtimeCardMod = 1.5;
            runtimePenaltyMod = 1.2;
        } else if (roll < 0.6) {
            // Yumuşak maç
            runtimeFoulMod = 0.6;
            runtimeCardMod = 0.5;
            runtimePenaltyMod = 0.8;
        }
    // else: ortalama (1.0)
    }
    // Deneyim modifier: tecrübeli hakem daha tutarlı
    const experienceMod = 0.9 + referee.experience / 10 * 0.1; // 0.93 - 1.0
    return {
        referee,
        personalityConfig: config,
        runtimeFoulMod,
        runtimeCardMod,
        runtimePenaltyMod,
        yellowsGiven: 0,
        redsGiven: 0,
        penaltiesGiven: 0,
        varReviews: 0,
        goalsOverturned: 0
    };
}
function shouldCallFoul(ctx, baseFoulProb, isHomeTeamFouling) {
    let prob = baseFoulProb * ctx.personalityConfig.foulMultiplier * ctx.runtimeFoulMod;
    // Ev sahibi bias: ev sahibinin faulini daha az çalar
    if (isHomeTeamFouling && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 - ctx.personalityConfig.homeBias;
    }
    // Deplasmanın faulünü daha çok çalar
    if (!isHomeTeamFouling && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 + ctx.personalityConfig.homeBias;
    }
    // Tutarlılık: düşük tutarlılık = rastgele varyans
    if (ctx.personalityConfig.consistency < 0.8) {
        const variance = (1 - ctx.personalityConfig.consistency) * 0.5;
        prob *= 1 + (Math.random() * 2 - 1) * variance;
    }
    return Math.random() < prob;
}
function shouldGiveYellowCard(ctx, baseYellowProb, isHomeTeam, minute) {
    let prob = baseYellowProb * ctx.personalityConfig.yellowCardMultiplier * ctx.runtimeCardMod;
    // Ev sahibi bias
    if (isHomeTeam && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 - ctx.personalityConfig.homeBias * 0.5;
    } else if (!isHomeTeam && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 + ctx.personalityConfig.homeBias * 0.5;
    }
    // Geç dakika: kart artar (gerginlik)
    if (minute > 75) prob *= 1.2;
    // İlk 15 dakika: daha az kart
    if (minute < 15) prob *= 0.7;
    // Zaten çok kart verdiyse biraz yavaşlar (gerçekçi)
    if (ctx.yellowsGiven > 5) prob *= 0.8;
    return Math.random() < prob;
}
function shouldGiveRedCard(ctx, baseRedProb, isHomeTeam) {
    let prob = baseRedProb * ctx.personalityConfig.redCardMultiplier * ctx.runtimeCardMod;
    // Ev sahibi bias (daha az kırmızı)
    if (isHomeTeam && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 - ctx.personalityConfig.homeBias;
    } else if (!isHomeTeam && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 + ctx.personalityConfig.homeBias;
    }
    return Math.random() < prob;
}
function shouldGivePenalty(ctx, basePenaltyProb, isHomeTeamAttacking, minute) {
    let prob = basePenaltyProb * ctx.personalityConfig.penaltyMultiplier * ctx.runtimePenaltyMod;
    // Ev sahibi bias
    if (isHomeTeamAttacking && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 + ctx.personalityConfig.homeBias;
    } else if (!isHomeTeamAttacking && ctx.personalityConfig.homeBias > 0) {
        prob *= 1 - ctx.personalityConfig.homeBias * 0.5;
    }
    const penalty = Math.random() < prob;
    if (!penalty) {
        return {
            penalty: false,
            varReview: false,
            overturned: false
        };
    }
    // VAR review chance
    let varReview = false;
    let overturned = false;
    if (Math.random() < ctx.personalityConfig.varReviewChance) {
        varReview = true;
        ctx.varReviews++;
        // VAR overturn chance: ~20% of reviews overturn
        if (Math.random() < 0.2) {
            overturned = true;
            ctx.goalsOverturned++;
        }
    }
    if (penalty && !overturned) {
        ctx.penaltiesGiven++;
    }
    return {
        penalty,
        varReview,
        overturned
    };
}
function getOffsideMultiplier(ctx, isHomeTeamOffside) {
    let mod = ctx.personalityConfig.offsideMultiplier;
    // Ev sahibi bias: ev sahibinin ofsaydını daha az çalar
    if (isHomeTeamOffside && ctx.personalityConfig.homeBias > 0) {
        mod *= 1 - ctx.personalityConfig.homeBias * 0.5;
    } else if (!isHomeTeamOffside && ctx.personalityConfig.homeBias > 0) {
        mod *= 1 + ctx.personalityConfig.homeBias * 0.5;
    }
    return mod;
}
function checkVARForGoal(ctx, isHomeTeamScoring) {
    let reviewChance = ctx.personalityConfig.varReviewChance;
    // Ev sahibi bias: ev sahibinin golünü daha az kontrol eder
    if (isHomeTeamScoring && ctx.personalityConfig.homeBias > 0) {
        reviewChance *= 1 - ctx.personalityConfig.homeBias * 0.5;
    } else if (!isHomeTeamScoring && ctx.personalityConfig.homeBias > 0) {
        reviewChance *= 1 + ctx.personalityConfig.homeBias * 0.3;
    }
    const varReview = Math.random() < reviewChance;
    if (!varReview) {
        return {
            varReview: false,
            overturned: false
        };
    }
    ctx.varReviews++;
    // Gol iptali şansı: ~15%
    const overturned = Math.random() < 0.15;
    if (overturned) ctx.goalsOverturned++;
    return {
        varReview,
        overturned
    };
}
function pickRefereeForMatch(referees, matchWeek) {
    if (referees.length === 0) {
        // Fallback: generate a default balanced referee
        return {
            id: 'ref-default',
            name: 'Varsayılan Hakem',
            personality: 'dengeci',
            experience: 5,
            league_id: 'default',
            strictness: 50,
            totalMatches: 0,
            totalYellows: 0,
            totalReds: 0,
            totalPenalties: 0
        };
    }
    // Rotating assignment based on week number
    const index = (matchWeek - 1) % referees.length;
    return referees[index];
}
async function assignRefereesToSeason(supabase, leagueId, seasonId) {
    // 1. Bu lig için 18 hakem üret
    const referees = generateLeagueReferees(leagueId, 18);
    // 2. Hakemleri referees tablosuna kaydet (upsert)
    const refereeRows = referees.map((r)=>({
            id: r.id,
            name: r.name,
            personality: r.personality,
            experience: r.experience,
            league_id: r.league_id,
            strictness: r.strictness,
            total_matches: r.totalMatches,
            total_yellows: r.totalYellows,
            total_reds: r.totalReds,
            total_penalties: r.totalPenalties
        }));
    try {
        await supabase.from('referees').upsert(refereeRows, {
            onConflict: 'id'
        });
    } catch (err) {
        console.warn('[assignRefereesToSeason] referees tablosuna yazma başarısız (tablo yoksa devam):', err);
    }
    // 3. Bu sezondaki tüm fikstürleri çek
    const { data: fixtures, error: fixturesError } = await supabase.from('fixtures').select('id, tur').eq('season_id', seasonId);
    if (fixturesError || !fixtures || fixtures.length === 0) {
        console.warn('[assignRefereesToSeason] Fikstür bulunamadı:', fixturesError?.message);
        return {
            assigned: 0,
            referees
        };
    }
    // 4. Her fikstüre döndürümlü hakem ata
    // Aynı turdaki maçlara farklı hakemler, farklı turlardaki maçlara döngüsel atama
    let assigned = 0;
    // Tur bazında grupla — aynı turdaki maçlara arka arkaya farklı hakemler ver
    const turMap = new Map();
    for (const f of fixtures){
        const tur = f.tur;
        if (!turMap.has(tur)) turMap.set(tur, []);
        turMap.get(tur).push(f.id);
    }
    for (const [tur, fixtureIds] of turMap){
        for(let fi = 0; fi < fixtureIds.length; fi++){
            const refIndex = ((tur - 1) * 3 + fi) % referees.length; // Her turda 3 hakem döndür
            const ref = referees[refIndex];
            const { error: updateErr } = await supabase.from('fixtures').update({
                referee_id: ref.id,
                referee_name: ref.name,
                referee_personality: ref.personality,
                referee_strictness: ref.strictness
            }).eq('id', fixtureIds[fi]);
            if (!updateErr) assigned++;
            else console.warn(`[assignRefereesToSeason] Fikstür ${fixtureIds[fi]} güncellenemedi:`, updateErr.message);
        }
    }
    console.log(`[assignRefereesToSeason] ${assigned}/${fixtures.length} fikstüre hakem atandı (Lig: ${leagueId})`);
    return {
        assigned,
        referees
    };
}
function getRefereeDisplayInfo(referee) {
    const config = REFEREE_PERSONALITIES[referee.personality];
    let strictnessLabel;
    let strictnessColor;
    if (referee.strictness >= 75) {
        strictnessLabel = 'Çok Sert';
        strictnessColor = 'text-red-500';
    } else if (referee.strictness >= 55) {
        strictnessLabel = 'Sert';
        strictnessColor = 'text-orange-500';
    } else if (referee.strictness >= 40) {
        strictnessLabel = 'Dengeli';
        strictnessColor = 'text-yellow-500';
    } else if (referee.strictness >= 25) {
        strictnessLabel = 'Yumuşak';
        strictnessColor = 'text-green-500';
    } else {
        strictnessLabel = 'Çok Yumuşak';
        strictnessColor = 'text-emerald-400';
    }
    return {
        name: referee.name,
        personalityLabel: config.label_tr,
        personalityEmoji: config.emoji,
        strictnessLabel,
        strictnessColor
    };
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
"[project]/src/app/api/league/maintenance/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$league$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/league.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/referee.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-error-handler.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// Takım ismini güvenli şekilde temizle - NULL/undefined/boş isimleri yakala
function sanitizeTeamName(raw) {
    if (raw === null || raw === undefined) return '';
    if (typeof raw !== 'string') return '';
    const cleaned = raw.trim();
    if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null') return '';
    if (cleaned.toLowerCase().includes('undefined')) return '';
    return cleaned;
}
async function GET(request) {
    // Admin-only: Authorization Bearer check
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Supabase not configured'
        }, {
            status: 500
        });
    }
    try {
        console.log('League maintenance triggered');
        // 0. Ensure leagues exist
        const defaultLeagues = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                name: '1. Lig',
                tier: 1
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                name: '2. Lig',
                tier: 2
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                name: '3. Lig',
                tier: 3
            },
            {
                id: '44444444-4444-4444-4444-444444444444',
                name: '4. Lig',
                tier: 4
            }
        ];
        for (const dl of defaultLeagues){
            await supabase.from('leagues').upsert(dl, {
                onConflict: 'id'
            });
        }
        // 1. Get all leagues
        const { data: leagues, error: leagueError } = await supabase.from('leagues').select('*');
        if (leagueError) throw leagueError;
        const maintenanceResults = [];
        for (const league of leagues || []){
            // 1. Check current season progress
            const { data: currentSeason } = await supabase.from('seasons').select('*').eq('league_id', league.id).eq('is_finished', false).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            if (currentSeason) {
                // Check if all rounds are finished (34 fixtures expected for 18 teams)
                const { count: pendingFixtures } = await supabase.from('fixtures').select('*', {
                    count: 'exact',
                    head: true
                }).eq('season_id', currentSeason.id).eq('status', 'scheduled');
                // If today is Sunday and no more fixtures, or if it's the weekend after 34 rounds
                const todayDay = new Date().getDay(); // 0 is Sunday
                if (pendingFixtures === 0 && todayDay === 0) {
                    console.log(`Season ${currentSeason.id} finished for ${league.name}. Finalizing...`);
                    await supabase.rpc('finalize_season', {
                        p_season_id: currentSeason.id
                    });
                    maintenanceResults.push({
                        league: league.name,
                        status: 'Finalized'
                    });
                // If we finalized, we might want to start the check again to create new season
                }
            }
            // Ensure teams exist for this league
            const { count: teamCount } = await supabase.from('league_teams').select('*', {
                count: 'exact',
                head: true
            }).eq('league_id', league.id);
            if (teamCount === 0) {
                // Tier ve departman sırasını hesapla
                const tier = league.tier || 4;
                const sameTierLeagues = (leagues || []).filter((l)=>l.tier === tier).sort((a, b)=>(a.created_at || '').localeCompare(b.created_at || ''));
                const deptIndex = sameTierLeagues.findIndex((l)=>l.id === league.id) + 1;
                // getTeamNamesForDepartment her zaman 18 isim döndürür
                const names = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTeamNamesForDepartment"])(tier, deptIndex);
                const teamsToInsert = names.map((name, idx)=>({
                        league_id: league.id,
                        name: name || `${league.name} SK ${idx + 1}`,
                        strength: 85 - (tier - 1) * 10 - idx,
                        is_npc: true
                    }));
                await supabase.from('league_teams').insert(teamsToInsert);
            } else {
                // Takımlar var ama isimleri bozuk olabilir - NULL/undefined isimleri düzelt
                const { data: existingTeams } = await supabase.from('league_teams').select('id, name, is_npc').eq('league_id', league.id);
                if (existingTeams) {
                    const tier = league.tier || 4;
                    const sameTierLeagues = (leagues || []).filter((l)=>l.tier === tier).sort((a, b)=>(a.created_at || '').localeCompare(b.created_at || ''));
                    const deptIndex = sameTierLeagues.findIndex((l)=>l.id === league.id) + 1;
                    const deptNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTeamNamesForDepartment"])(tier, deptIndex);
                    for(let i = 0; i < existingTeams.length; i++){
                        const team = existingTeams[i];
                        // Kullanıcı takımlarını atla (kullanıcı kendi ismini belirler)
                        if (!team.is_npc) continue;
                        const cleanName = sanitizeTeamName(team.name);
                        // İsim geçerliyse atla
                        if (cleanName) continue;
                        // Bozuk isim → doğru isimle düzelt
                        const correctName = deptNames[i];
                        if (correctName) {
                            await supabase.from('league_teams').update({
                                name: correctName
                            }).eq('id', team.id);
                            console.log(`[MAINTENANCE] Bozuk isim düzeltildi: "${team.name || '(NULL)'}" → "${correctName}" (${league.name})`);
                        }
                    }
                }
            }
            // Also ensure league_standings exist for active season
            const { data: activeSeasonForStandings } = await supabase.from('seasons').select('id').eq('league_id', league.id).eq('is_finished', false).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            if (activeSeasonForStandings) {
                const { count: standingsCount } = await supabase.from('league_standings').select('*', {
                    count: 'exact',
                    head: true
                }).eq('season_id', activeSeasonForStandings.id);
                if (!standingsCount || standingsCount === 0) {
                    const { data: seasonTeams } = await supabase.from('league_teams').select('id').eq('league_id', league.id);
                    if (seasonTeams && seasonTeams.length > 0) {
                        const standingsRows = seasonTeams.map((t)=>({
                                season_id: activeSeasonForStandings.id,
                                team_id: t.id,
                                played: 0,
                                won: 0,
                                drawn: 0,
                                lost: 0,
                                gf: 0,
                                ga: 0,
                                gd: 0,
                                points: 0
                            }));
                        const { error: standingsError } = await supabase.from('league_standings').insert(standingsRows);
                        if (standingsError) {
                            console.error(`Error creating standings for league ${league.name}:`, standingsError);
                        } else {
                            console.log(`Created ${standingsRows.length} standings rows for league ${league.name}`);
                            maintenanceResults.push({
                                league: league.name,
                                status: 'Standings created'
                            });
                        }
                    }
                }
            }
            // 2. Check if active season exists for this year (e.g. 2025/26)
            const year = '2025/26';
            const { data: existingSeason, error: seasonCheckError } = await supabase.from('seasons').select('id, is_finished').eq('league_id', league.id).eq('year', year).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            let seasonId = existingSeason?.id;
            if (!existingSeason || existingSeason.is_finished) {
                console.log(`Creating new season for league ${league.name}`);
                // 3. Create new season (Starting tomorrow at 12:00)
                const seasonStartDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$league$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTomorrowNoon"])();
                const { data: newSeason, error: createSeasonError } = await supabase.from('seasons').insert({
                    league_id: league.id,
                    year: year,
                    start_date: seasonStartDate.toISOString().split('T')[0],
                    current_tur: 1,
                    is_finished: false
                }).select().single();
                if (createSeasonError) {
                    console.error(`Error creating season for league ${league.name}:`, createSeasonError);
                    continue;
                }
                seasonId = newSeason.id;
                // 4. Generate fixtures for the new season
                const { error: fixtureError } = await supabase.rpc('generate_league_fixtures', {
                    p_season_id: seasonId
                });
                if (fixtureError) {
                    console.error(`Error generating fixtures for league ${league.name}:`, fixtureError);
                } else {
                    console.log(`Fixtures generated for ${league.name}`);
                    // Hakemleri üret ve fikstürlere ata
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assignRefereesToSeason"])(supabase, league.id, seasonId);
                }
            }
            maintenanceResults.push({
                league: league.name,
                seasonId,
                status: existingSeason ? 'Existing' : 'Created'
            });
        }
        // 5. Update user team names in league_teams if profile changed
        const { data: profiles } = await supabase.from('profiles').select('id, team_name');
        for (const prof of profiles || []){
            if (prof.team_name) {
                await supabase.from('league_teams').update({
                    name: prof.team_name
                }).eq('profile_id', prof.id);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Maintenance completed successfully',
            results: maintenanceResults
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])(error, {
            route: '/api/league/maintenance',
            method: 'GET'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d87be448._.js.map