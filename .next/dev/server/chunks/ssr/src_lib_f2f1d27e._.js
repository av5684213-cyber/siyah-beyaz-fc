module.exports = [
"[project]/src/lib/fm/teamStats.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_SLOTS",
    ()=>INITIAL_SLOTS,
    "INITIAL_TEAM_STATS",
    ()=>INITIAL_TEAM_STATS,
    "calculateAverageRating",
    ()=>calculateAverageRating
]);
function calculateAverageRating(squad) {
    if (!squad.length) return 0;
    return squad.reduce((acc, p)=>acc + p.rating, 0) / squad.length;
}
const INITIAL_TEAM_STATS = {
    attack: 50,
    defense: 50,
    stamina: 50,
    chemistry: 50
};
const INITIAL_SLOTS = [
    'general_433'
];
}),
"[project]/src/lib/fm/tacticsEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "processTacticalDecay",
    ()=>processTacticalDecay,
    "processTacticalGrowth",
    ()=>processTacticalGrowth
]);
// =============================================================================
// Tactics Engine — Büyüme / Bozulma Sistemi
// =============================================================================
// Aktif taktik slotlarına göre teamStats değerlerinin gelişimi ve çürümesi.
// Kullanılmayan özellikler zamanla azalır, aktif olanlar hafif artar.
// ─── Slot → Stats Eşleşme Haritası ──────────────────────────────────────────
// Her taktik slot ID'si, teamStats üzerinde hangi key'leri etkilediğini belirtir.
// Prompt'ta tanımlanan eşleşmeler:
//   pressing    → stats.pressing veya stats.pressIntensity
//   offsideTrap → stats.defenseLine
//   crossGame   → stats.width
//   parkTheBus  → stats.defenseSolidity
// Ek olarak mevcut sistemle uyumlu eşleşmeler de eklenmiştir:
//   attacking        → stats.attack
//   defending        → stats.defense
//   passing          → stats.chemistry
//   fitness          → stats.stamina
//   goalkeeping      → stats.defense (kaleci de defans katkısı yapar)
//   setPieces        → stats.attack
//   mentality        → stats.chemistry
//   general_433      → stats.attack, stats.chemistry
//   loneStrikerCounter → stats.attack, stats.defense
//   screenKeeper     → stats.defense
//   wasteTime        → stats.chemistry
const SLOT_TO_STATS = {
    // Prompt'ta belirtilen eşleşmeler
    pressing: [
        'pressing',
        'pressIntensity'
    ],
    offsideTrap: [
        'defenseLine'
    ],
    crossGame: [
        'width'
    ],
    parkTheBus: [
        'defenseSolidity'
    ],
    // Mevcut sistemle geriye uyumlu eşleşmeler
    attacking: [
        'attack'
    ],
    defending: [
        'defense'
    ],
    passing: [
        'chemistry'
    ],
    fitness: [
        'stamina'
    ],
    goalkeeping: [
        'defense'
    ],
    setPieces: [
        'attack'
    ],
    mentality: [
        'chemistry'
    ],
    general_433: [
        'attack',
        'chemistry'
    ],
    loneStrikerCounter: [
        'attack',
        'defense'
    ],
    screenKeeper: [
        'defense'
    ],
    wasteTime: [
        'chemistry'
    ]
};
// ─── Büyüme Sabitleri ────────────────────────────────────────────────────────
const GROWTH_INCREMENT = 0.5; // Aktif slot başına artış
const GROWTH_MAX = 100; // Maksimum stat değeri
// ─── Bozulma Sabitleri ────────────────────────────────────────────────────────
const DECAY_DECREMENT = 0.2; // Kullanılmayan stat başına azalış
const DECAY_MIN = 0; // Minimum stat değeri
function processTacticalGrowth(stats, slots) {
    if (!stats || !slots || slots.length === 0) return {
        newStats: stats
    };
    const newStats = {
        ...stats
    };
    for (const slot of slots){
        const affectedKeys = SLOT_TO_STATS[slot];
        if (!affectedKeys) continue; // Eşleşme yoksa atla
        for (const key of affectedKeys){
            if (typeof newStats[key] === 'number') {
                // +0.5 artış, maksimum 100
                newStats[key] = Math.min(GROWTH_MAX, newStats[key] + GROWTH_INCREMENT);
            }
        }
    }
    return {
        newStats
    };
}
function processTacticalDecay(stats, slots) {
    if (!stats || !slots || slots.length === 0) return {
        newStats: stats
    };
    const newStats = {
        ...stats
    };
    // Aktif slotların etkilediği tüm stat key'lerini topla
    const activeStatKeys = new Set();
    for (const slot of slots){
        const affectedKeys = SLOT_TO_STATS[slot];
        if (affectedKeys) {
            for (const key of affectedKeys){
                activeStatKeys.add(key);
            }
        }
    }
    // Tüm tanımlı stat key'lerini topla (sadece SLOT_TO_STATS'ta olanlar çürür)
    const allDefinedStatKeys = new Set();
    for (const keys of Object.values(SLOT_TO_STATS)){
        for (const key of keys){
            allDefinedStatKeys.add(key);
        }
    }
    // Aktif olmayan ve tanımlı olan stat'lerde −0.2 düşüş
    for (const key of allDefinedStatKeys){
        if (!activeStatKeys.has(key) && typeof newStats[key] === 'number') {
            newStats[key] = Math.max(DECAY_MIN, newStats[key] - DECAY_DECREMENT);
        }
    }
    return {
        newStats
    };
}
}),
"[project]/src/lib/fm/tacticsRoles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FORMATION_TEMPLATES",
    ()=>FORMATION_TEMPLATES,
    "ROLES",
    ()=>ROLES,
    "TACTICAL_INSTRUCTIONS",
    ()=>TACTICAL_INSTRUCTIONS,
    "calculateTacticalScore",
    ()=>calculateTacticalScore,
    "getCompatibleRoles",
    ()=>getCompatibleRoles,
    "getFormationByName",
    ()=>getFormationByName,
    "getInstructionsByCategory",
    ()=>getInstructionsByCategory,
    "getRoleAttributeBonuses",
    ()=>getRoleAttributeBonuses,
    "getRoleById",
    ()=>getRoleById,
    "getRolesByCategory",
    ()=>getRolesByCategory
]);
const ROLES = [
    // ── GOALKEEPER ────────────────────────────────────────────────────────────
    {
        id: 'sweeper_keeper',
        name: 'Terzi Kaleci',
        nameEn: 'Sweeper Keeper',
        description: 'Ceza sahası dışına çıkarak savunma arkasını kapatır. Pas oyununa katkı sağlar.',
        category: 'goalkeeper',
        compatiblePositions: [
            'GK'
        ],
        primaryAttributes: [
            'goalkeeping',
            'reflexes',
            'positioning',
            'composure'
        ],
        secondaryAttributes: [
            'passing',
            'acceleration',
            'decisions',
            'anticipation'
        ],
        mentalWeight: 0.4,
        attackingContribution: 15,
        defensiveContribution: 70,
        playStyleAffinity: {
            'Tiki-Taka': 0.7,
            'Gegenpressing': 0.5,
            'Catenaccio': -0.2
        },
        icon: '🧤'
    },
    {
        id: 'shot_stopper',
        name: 'Refleks Kaleci',
        nameEn: 'Shot Stopper',
        description: 'Müthiş refleksleri ve uzanışıyla şutları kurtarır. Ceza sahasında asandır.',
        category: 'goalkeeper',
        compatiblePositions: [
            'GK'
        ],
        primaryAttributes: [
            'goalkeeping',
            'reflexes',
            'handling',
            'concentration'
        ],
        secondaryAttributes: [
            'command_of_area',
            'positioning',
            'bravery',
            'composure'
        ],
        mentalWeight: 0.3,
        attackingContribution: 5,
        defensiveContribution: 85,
        playStyleAffinity: {
            'Catenaccio': 0.6,
            'Gegenpressing': 0.2,
            'Tiki-Taka': -0.2
        },
        icon: '🛡️'
    },
    // ── DEFENDERS ─────────────────────────────────────────────────────────────
    {
        id: 'ball_playing_defender',
        name: 'Top Çıkan Stoper',
        nameEn: 'Ball Playing Defender',
        description: 'Topu ayağına alıp oyun kurarak savunmadan öne pas verir. Modern stoper tipi.',
        category: 'defensive',
        compatiblePositions: [
            'CB'
        ],
        primaryAttributes: [
            'passing',
            'tackling',
            'positioning',
            'technique'
        ],
        secondaryAttributes: [
            'vision',
            'composure',
            'decisions',
            'heading'
        ],
        mentalWeight: 0.5,
        attackingContribution: 20,
        defensiveContribution: 85,
        playStyleAffinity: {
            'Tiki-Taka': 0.9,
            'Gegenpressing': 0.4,
            'Catenaccio': 0.1
        },
        icon: '🎯'
    },
    {
        id: 'no_nonsense_cb',
        name: 'Kale Gibi Stoper',
        nameEn: 'No-Nonsense Centre-Back',
        description: 'Basit ve etkili oynar. Topu tehlikeli olmayan yerlere clearance yapar, havada üstündür.',
        category: 'defensive',
        compatiblePositions: [
            'CB'
        ],
        primaryAttributes: [
            'tackling',
            'marking',
            'heading',
            'strength'
        ],
        secondaryAttributes: [
            'positioning',
            'concentration',
            'aggression',
            'bravery'
        ],
        mentalWeight: 0.35,
        attackingContribution: 5,
        defensiveContribution: 95,
        playStyleAffinity: {
            'Catenaccio': 0.8,
            'Gegenpressing': 0.3,
            'Tiki-Taka': -0.4
        },
        icon: '🧱'
    },
    {
        id: 'offside_trap_cb',
        name: 'Ofsayt Tuzağı Stoperi',
        nameEn: 'Offside Trap Centre-Back',
        description: 'Ofsayt çizgisini yöneterek rakip forvetleri tuzağa düşürür. İletişim ve zamanlama kritik.',
        category: 'defensive',
        compatiblePositions: [
            'CB'
        ],
        primaryAttributes: [
            'anticipation',
            'positioning',
            'decisions',
            'concentration'
        ],
        secondaryAttributes: [
            'acceleration',
            'teamwork',
            'composure',
            'marking'
        ],
        mentalWeight: 0.65,
        attackingContribution: 5,
        defensiveContribution: 80,
        playStyleAffinity: {
            'Catenaccio': 0.7,
            'Gegenpressing': 0.5,
            'Tiki-Taka': 0.0
        },
        icon: '🪤'
    },
    {
        id: 'wing_back',
        name: 'Kanat Bek',
        nameEn: 'Wing Back',
        description: 'Kanadın boyunca sürekli ileri-geri koşar. Hem savunma hem de hücum katkısı sağlar.',
        category: 'defensive',
        compatiblePositions: [
            'LB',
            'RB',
            'LWB',
            'RWB'
        ],
        primaryAttributes: [
            'stamina',
            'crossing',
            'speed',
            'tackling'
        ],
        secondaryAttributes: [
            'workRate',
            'acceleration',
            'dribbling',
            'positioning'
        ],
        mentalWeight: 0.35,
        attackingContribution: 45,
        defensiveContribution: 70,
        playStyleAffinity: {
            'Gegenpressing': 0.6,
            'Tiki-Taka': 0.3,
            'Catenaccio': 0.2
        },
        icon: '🏃'
    },
    {
        id: 'inverted_fullback',
        name: 'Ters Bek',
        nameEn: 'Inverted Fullback',
        description: 'Topla ileride orta sahaya girer, kale arkası boşluğunu bir orta saha oyuncusu gibi kullanır.',
        category: 'defensive',
        compatiblePositions: [
            'LB',
            'RB'
        ],
        primaryAttributes: [
            'passing',
            'vision',
            'tackling',
            'composure'
        ],
        secondaryAttributes: [
            'technique',
            'decisions',
            'stamina',
            'workRate'
        ],
        mentalWeight: 0.55,
        attackingContribution: 35,
        defensiveContribution: 65,
        playStyleAffinity: {
            'Tiki-Taka': 0.9,
            'Gegenpressing': 0.4,
            'Catenaccio': -0.3
        },
        icon: '🔄'
    },
    {
        id: 'libero',
        name: 'Süpürücü',
        nameEn: 'Libero / Sweeper',
        description: 'Stoperlerin arkasında boşta gezerek topu çalar ve oyun kurar. Nadir ama etkili rol.',
        category: 'defensive',
        compatiblePositions: [
            'CB'
        ],
        primaryAttributes: [
            'positioning',
            'passing',
            'tackling',
            'vision'
        ],
        secondaryAttributes: [
            'composure',
            'anticipation',
            'technique',
            'acceleration'
        ],
        mentalWeight: 0.6,
        attackingContribution: 30,
        defensiveContribution: 80,
        playStyleAffinity: {
            'Tiki-Taka': 0.6,
            'Catenaccio': 0.5,
            'Gegenpressing': 0.1
        },
        icon: '🧹'
    },
    // ── MIDFIELDERS ───────────────────────────────────────────────────────────
    {
        id: 'deep_lying_playmaker',
        name: 'Regista',
        nameEn: 'Deep Lying Playmaker',
        description: 'Savunma önünde derin paslarla oyun kurar. Takımın beyni ve tempo belirleyicisi.',
        category: 'midfield',
        compatiblePositions: [
            'CDM',
            'CM'
        ],
        primaryAttributes: [
            'passing',
            'vision',
            'composure',
            'technique'
        ],
        secondaryAttributes: [
            'decisions',
            'anticipation',
            'firstTouch',
            'positioning'
        ],
        mentalWeight: 0.7,
        attackingContribution: 40,
        defensiveContribution: 50,
        playStyleAffinity: {
            'Tiki-Taka': 1.0,
            'Catenaccio': 0.6,
            'Gegenpressing': -0.1
        },
        icon: '🧠'
    },
    {
        id: 'box_to_box',
        name: 'Koşan Orta Saha',
        nameEn: 'Box-to-Box Midfielder',
        description: 'Ceza sahasından ceza sahasına koşar. Hem savunma hem hücumda her alanda etkilidir.',
        category: 'midfield',
        compatiblePositions: [
            'CM',
            'CDM'
        ],
        primaryAttributes: [
            'stamina',
            'tackling',
            'passing',
            'shooting'
        ],
        secondaryAttributes: [
            'workRate',
            'acceleration',
            'strength',
            'positioning'
        ],
        mentalWeight: 0.4,
        attackingContribution: 55,
        defensiveContribution: 65,
        playStyleAffinity: {
            'Gegenpressing': 0.8,
            'Tiki-Taka': 0.3,
            'Catenaccio': 0.3
        },
        icon: '🔋'
    },
    {
        id: 'mezzala',
        name: 'Mezzala',
        nameEn: 'Mezzala',
        description: 'Orta saha ile kanat arasına drift ederek hücuma katılır. Merkezi boşlukları doldurur.',
        category: 'midfield',
        compatiblePositions: [
            'CM',
            'CAM',
            'LM',
            'RM'
        ],
        primaryAttributes: [
            'dribbling',
            'passing',
            'shooting',
            'offTheBall'
        ],
        secondaryAttributes: [
            'stamina',
            'vision',
            'workRate',
            'technique'
        ],
        mentalWeight: 0.45,
        attackingContribution: 65,
        defensiveContribution: 40,
        playStyleAffinity: {
            'Gegenpressing': 0.6,
            'Tiki-Taka': 0.5,
            'Catenaccio': -0.2
        },
        icon: '🌀'
    },
    {
        id: 'defensive_midfielder',
        name: 'Defansif Orta Saha',
        nameEn: 'Defensive Midfielder / Anchor',
        description: 'Savunma önünde duvar örer, top çalar ve basit paslarla güvenli oyun sağlar.',
        category: 'midfield',
        compatiblePositions: [
            'CDM',
            'CM'
        ],
        primaryAttributes: [
            'tackling',
            'marking',
            'positioning',
            'strength'
        ],
        secondaryAttributes: [
            'anticipation',
            'concentration',
            'decisions',
            'workRate'
        ],
        mentalWeight: 0.5,
        attackingContribution: 15,
        defensiveContribution: 90,
        playStyleAffinity: {
            'Catenaccio': 0.9,
            'Gegenpressing': 0.6,
            'Tiki-Taka': 0.1
        },
        icon: '⚓'
    },
    {
        id: 'advanced_playmaker',
        name: 'Ofansif Oyun Kurucu',
        nameEn: 'Advanced Playmaker',
        description: 'Hücum hattının arkasında yaratıcı paslar ve şutlarla skora doğrudan etki eder.',
        category: 'midfield',
        compatiblePositions: [
            'CAM',
            'CM',
            'CF'
        ],
        primaryAttributes: [
            'passing',
            'vision',
            'technique',
            'dribbling'
        ],
        secondaryAttributes: [
            'creativity',
            'composure',
            'decisions',
            'longShots'
        ],
        mentalWeight: 0.65,
        attackingContribution: 75,
        defensiveContribution: 15,
        playStyleAffinity: {
            'Tiki-Taka': 0.9,
            'Gegenpressing': 0.2,
            'Catenaccio': 0.0
        },
        icon: '🎭'
    },
    {
        id: 'half_winger',
        name: 'Yarı Kanat',
        nameEn: 'Half-Winger',
        description: 'Kanat ile orta saha arasına yerleşir, içeri keserek şut atar ve asist yapar.',
        category: 'midfield',
        compatiblePositions: [
            'LM',
            'RM',
            'LW',
            'RW'
        ],
        primaryAttributes: [
            'dribbling',
            'crossing',
            'passing',
            'acceleration'
        ],
        secondaryAttributes: [
            'offTheBall',
            'workRate',
            'technique',
            'stamina'
        ],
        mentalWeight: 0.35,
        attackingContribution: 65,
        defensiveContribution: 35,
        playStyleAffinity: {
            'Gegenpressing': 0.7,
            'Tiki-Taka': 0.4,
            'Catenaccio': 0.0
        },
        icon: '↗️'
    },
    {
        id: 'carrilero',
        name: 'Sığ Orta Saha',
        nameEn: 'Carrilero',
        description: 'Yan kanat boşluklarını doldurur, genişlik sağlar ve kanat oyuncusunun pozisyon almasına olanak tanır.',
        category: 'midfield',
        compatiblePositions: [
            'CM',
            'LM',
            'RM',
            'CDM'
        ],
        primaryAttributes: [
            'stamina',
            'passing',
            'tackling',
            'positioning'
        ],
        secondaryAttributes: [
            'workRate',
            'teamwork',
            'decisions',
            'acceleration'
        ],
        mentalWeight: 0.4,
        attackingContribution: 35,
        defensiveContribution: 60,
        playStyleAffinity: {
            'Tiki-Taka': 0.5,
            'Gegenpressing': 0.5,
            'Catenaccio': 0.3
        },
        icon: ' ↔️'
    },
    // ── FORWARDS ──────────────────────────────────────────────────────────────
    {
        id: 'target_man',
        name: 'Hedef Forvet',
        nameEn: 'Target Man',
        description: 'Fiziksel üstünlüğüyle topu tutar, takım arkadaşlarına dağıtır. Havadaki duruşlarıyla etkili.',
        category: 'attacking',
        compatiblePositions: [
            'ST',
            'CF'
        ],
        primaryAttributes: [
            'heading',
            'strength',
            'offTheBall',
            'finishing'
        ],
        secondaryAttributes: [
            'firstTouch',
            'passing',
            'balance',
            'jumping'
        ],
        mentalWeight: 0.35,
        attackingContribution: 85,
        defensiveContribution: 10,
        playStyleAffinity: {
            'Catenaccio': 0.6,
            'Gegenpressing': 0.3,
            'Tiki-Taka': -0.2
        },
        icon: '💪'
    },
    {
        id: 'poacher',
        name: 'Fırsatçı',
        nameEn: 'Poacher',
        description: 'Ceza sahasında bekler, en ufak fırsatı gole çevirir. Pozisyon bilgisi mükemmeldir.',
        category: 'attacking',
        compatiblePositions: [
            'ST',
            'CF'
        ],
        primaryAttributes: [
            'finishing',
            'offTheBall',
            'composure',
            'acceleration'
        ],
        secondaryAttributes: [
            'positioning',
            'decisions',
            'dribbling',
            'reflexes'
        ],
        mentalWeight: 0.55,
        attackingContribution: 95,
        defensiveContribution: 5,
        playStyleAffinity: {
            'Catenaccio': 0.8,
            'Tiki-Taka': 0.2,
            'Gegenpressing': 0.0
        },
        icon: '🦅'
    },
    {
        id: 'complete_forward',
        name: 'Tam Forvet',
        nameEn: 'Complete Forward',
        description: 'Şut, pas, dripling, kafa… Her şeye sahiptir. Her yönü tehdit oluşturan efsanevi rol.',
        category: 'attacking',
        compatiblePositions: [
            'ST',
            'CF'
        ],
        primaryAttributes: [
            'finishing',
            'dribbling',
            'passing',
            'heading'
        ],
        secondaryAttributes: [
            'strength',
            'speed',
            'offTheBall',
            'technique'
        ],
        mentalWeight: 0.45,
        attackingContribution: 90,
        defensiveContribution: 15,
        playStyleAffinity: {
            'Tiki-Taka': 0.6,
            'Gegenpressing': 0.5,
            'Catenaccio': 0.3
        },
        icon: '⭐'
    },
    {
        id: 'false_nine',
        name: 'Sahte 9',
        nameEn: 'False Nine',
        description: 'Gol pozisyonuna girmez, orta sahaya çekilerek rakip stoperleri yanlış pozisyona iter.',
        category: 'attacking',
        compatiblePositions: [
            'ST',
            'CF',
            'CAM'
        ],
        primaryAttributes: [
            'dribbling',
            'passing',
            'vision',
            'offTheBall'
        ],
        secondaryAttributes: [
            'technique',
            'composure',
            'creativity',
            'firstTouch'
        ],
        mentalWeight: 0.7,
        attackingContribution: 70,
        defensiveContribution: 10,
        playStyleAffinity: {
            'Tiki-Taka': 1.0,
            'Gegenpressing': 0.4,
            'Catenaccio': -0.5
        },
        icon: '👻'
    },
    {
        id: 'inside_forward',
        name: 'İç Kanat Forvet',
        nameEn: 'Inside Forward',
        description: 'Kanattan içeri keserek şut atar. Forvet gibi bitirici, kanat gibi hızlıdır.',
        category: 'attacking',
        compatiblePositions: [
            'LW',
            'RW',
            'LM',
            'RM'
        ],
        primaryAttributes: [
            'dribbling',
            'finishing',
            'speed',
            'acceleration'
        ],
        secondaryAttributes: [
            'offTheBall',
            'technique',
            'composure',
            'longShots'
        ],
        mentalWeight: 0.4,
        attackingContribution: 85,
        defensiveContribution: 20,
        playStyleAffinity: {
            'Gegenpressing': 0.7,
            'Tiki-Taka': 0.3,
            'Catenaccio': 0.1
        },
        icon: '🔪'
    },
    {
        id: 'winger',
        name: 'Kanat',
        nameEn: 'Winger',
        description: 'Kanadın boyunca koşarak defence arkasına sarkar ve orta açar. Hız ve çapraz pas ustası.',
        category: 'attacking',
        compatiblePositions: [
            'LW',
            'RW',
            'LM',
            'RM',
            'LWB',
            'RWB'
        ],
        primaryAttributes: [
            'speed',
            'crossing',
            'dribbling',
            'acceleration'
        ],
        secondaryAttributes: [
            'technique',
            'stamina',
            'offTheBall',
            'workRate'
        ],
        mentalWeight: 0.3,
        attackingContribution: 80,
        defensiveContribution: 25,
        playStyleAffinity: {
            'Gegenpressing': 0.5,
            'Tiki-Taka': 0.4,
            'Catenaccio': 0.1
        },
        icon: '🦅'
    },
    {
        id: 'advanced_playmaker_fwd',
        name: 'Forvet Oyun Kurucu',
        nameEn: 'Advanced Forward Playmaker',
        description: 'Forvet pozisyonunda oynayan oyun kurucu. Hem gol atar hem asist yapar, takımın ana yaratıcı halkası.',
        category: 'attacking',
        compatiblePositions: [
            'CF',
            'CAM',
            'ST'
        ],
        primaryAttributes: [
            'passing',
            'vision',
            'finishing',
            'dribbling'
        ],
        secondaryAttributes: [
            'technique',
            'composure',
            'decisions',
            'offTheBall'
        ],
        mentalWeight: 0.6,
        attackingContribution: 85,
        defensiveContribution: 10,
        playStyleAffinity: {
            'Tiki-Taka': 0.8,
            'Gegenpressing': 0.3,
            'Catenaccio': 0.0
        },
        icon: '🎯'
    }
];
function getCompatibleRoles(position) {
    return ROLES.filter((r)=>r.compatiblePositions.includes(position));
}
const ATTRIBUTE_BONUSES = {
    sweeper_keeper: {
        passing: 4,
        goalkeeping: 3,
        positioning: 3,
        composure: 2,
        acceleration: 2,
        decisions: 2
    },
    shot_stopper: {
        goalkeeping: 5,
        reflexes: 5,
        concentration: 3,
        positioning: 2,
        bravery: 2,
        composure: 2
    },
    ball_playing_defender: {
        passing: 5,
        tackling: 3,
        positioning: 2,
        technique: 3,
        vision: 2,
        composure: 2
    },
    no_nonsense_cb: {
        tackling: 5,
        marking: 5,
        heading: 4,
        strength: 4,
        positioning: 2,
        concentration: 2
    },
    offside_trap_cb: {
        anticipation: 5,
        positioning: 5,
        decisions: 3,
        concentration: 3,
        acceleration: 2,
        teamwork: 2
    },
    wing_back: {
        stamina: 5,
        crossing: 5,
        speed: 3,
        tackling: 3,
        acceleration: 2,
        workRate: 2
    },
    inverted_fullback: {
        passing: 5,
        vision: 4,
        tackling: 3,
        composure: 3,
        technique: 2,
        stamina: 2
    },
    libero: {
        positioning: 5,
        passing: 4,
        tackling: 3,
        vision: 3,
        composure: 2,
        anticipation: 2
    },
    deep_lying_playmaker: {
        passing: 6,
        vision: 5,
        composure: 4,
        technique: 3,
        decisions: 2,
        anticipation: 2
    },
    box_to_box: {
        stamina: 6,
        tackling: 3,
        passing: 3,
        shooting: 3,
        acceleration: 2,
        workRate: 2
    },
    mezzala: {
        dribbling: 4,
        passing: 4,
        shooting: 4,
        offTheBall: 3,
        vision: 2,
        stamina: 2
    },
    defensive_midfielder: {
        tackling: 5,
        marking: 5,
        positioning: 4,
        strength: 3,
        anticipation: 2,
        workRate: 2
    },
    advanced_playmaker: {
        passing: 5,
        vision: 5,
        technique: 4,
        dribbling: 3,
        composure: 2,
        longShots: 2
    },
    half_winger: {
        dribbling: 4,
        crossing: 5,
        passing: 3,
        acceleration: 3,
        offTheBall: 2,
        stamina: 2
    },
    carrilero: {
        stamina: 5,
        passing: 4,
        tackling: 3,
        positioning: 3,
        workRate: 3,
        teamwork: 2
    },
    target_man: {
        heading: 5,
        strength: 5,
        offTheBall: 3,
        finishing: 3,
        firstTouch: 2,
        balance: 2
    },
    poacher: {
        finishing: 6,
        offTheBall: 5,
        composure: 4,
        acceleration: 3,
        positioning: 2,
        decisions: 2
    },
    complete_forward: {
        finishing: 4,
        dribbling: 4,
        passing: 3,
        heading: 4,
        strength: 3,
        speed: 2
    },
    false_nine: {
        dribbling: 5,
        passing: 5,
        vision: 4,
        offTheBall: 3,
        technique: 3,
        firstTouch: 2
    },
    inside_forward: {
        dribbling: 5,
        finishing: 5,
        speed: 4,
        acceleration: 3,
        longShots: 3,
        composure: 2
    },
    winger: {
        speed: 5,
        crossing: 6,
        dribbling: 4,
        acceleration: 3,
        technique: 2,
        stamina: 2
    },
    advanced_playmaker_fwd: {
        passing: 5,
        vision: 5,
        finishing: 3,
        dribbling: 4,
        technique: 3,
        offTheBall: 2
    }
};
function getRoleAttributeBonuses(roleId) {
    return {
        ...ATTRIBUTE_BONUSES[roleId] ?? {}
    };
}
const FORMATION_TEMPLATES = [
    {
        name: '4-4-2',
        description: 'Klasik İngiliz dizilişi. İki forvet, dört orta saha, dört savunmacı. Dengeli ve güvenilir.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 35,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 65,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'LM',
                x: 15,
                y: 45,
                defaultRole: 'winger'
            },
            {
                pos: 'CM',
                x: 38,
                y: 42,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CM',
                x: 62,
                y: 42,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RM',
                x: 85,
                y: 45,
                defaultRole: 'winger'
            },
            {
                pos: 'ST',
                x: 38,
                y: 80,
                defaultRole: 'target_man'
            },
            {
                pos: 'ST',
                x: 62,
                y: 80,
                defaultRole: 'poacher'
            }
        ]
    },
    {
        name: '4-3-3',
        description: 'Hücum odaklı diziliş. Üç forvet, üç orta saha, dört savunmacı. Kanat hücumları güçlü.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'sweeper_keeper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 35,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 65,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 38,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 30,
                y: 40,
                defaultRole: 'mezzala'
            },
            {
                pos: 'CM',
                x: 70,
                y: 40,
                defaultRole: 'mezzala'
            },
            {
                pos: 'LW',
                x: 18,
                y: 72,
                defaultRole: 'inside_forward'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'complete_forward'
            },
            {
                pos: 'RW',
                x: 82,
                y: 72,
                defaultRole: 'inside_forward'
            }
        ]
    },
    {
        name: '4-2-3-1',
        description: 'Modern diziliş. Çift ön libero, arkalarında üç ofansif oyuncu, tek forvet. Çok yönlü.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'inverted_fullback'
            },
            {
                pos: 'CB',
                x: 37,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 63,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CDM',
                x: 40,
                y: 35,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CDM',
                x: 60,
                y: 35,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'LW',
                x: 18,
                y: 55,
                defaultRole: 'winger'
            },
            {
                pos: 'CAM',
                x: 50,
                y: 58,
                defaultRole: 'advanced_playmaker'
            },
            {
                pos: 'RW',
                x: 82,
                y: 55,
                defaultRole: 'inside_forward'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'complete_forward'
            }
        ]
    },
    {
        name: '3-5-2',
        description: 'Üç stoper ve beş orta saha. Kanat beklerle genişlik sağlanır, iki forvet hücumda güçlü.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'CB',
                x: 25,
                y: 17,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 50,
                y: 15,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 75,
                y: 17,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'LWB',
                x: 10,
                y: 40,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CM',
                x: 32,
                y: 38,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 35,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 68,
                y: 38,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RWB',
                x: 90,
                y: 40,
                defaultRole: 'wing_back'
            },
            {
                pos: 'ST',
                x: 38,
                y: 80,
                defaultRole: 'target_man'
            },
            {
                pos: 'ST',
                x: 62,
                y: 80,
                defaultRole: 'poacher'
            }
        ]
    },
    {
        name: '3-4-3',
        description: 'Üç stoper, dört orta saha ve üç forvet. Hücum ağırlıklı, kanat forvetleri önde.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'sweeper_keeper'
            },
            {
                pos: 'CB',
                x: 25,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 50,
                y: 15,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 75,
                y: 17,
                defaultRole: 'offside_trap_cb'
            },
            {
                pos: 'LM',
                x: 15,
                y: 42,
                defaultRole: 'carrilero'
            },
            {
                pos: 'CM',
                x: 38,
                y: 38,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CM',
                x: 62,
                y: 38,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RM',
                x: 85,
                y: 42,
                defaultRole: 'carrilero'
            },
            {
                pos: 'LW',
                x: 18,
                y: 72,
                defaultRole: 'inside_forward'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'complete_forward'
            },
            {
                pos: 'RW',
                x: 82,
                y: 72,
                defaultRole: 'inside_forward'
            }
        ]
    },
    {
        name: '4-1-4-1',
        description: 'Tek ön libero, dört orta saha ve tek forvet. Savunma güçlü, kontrollü oyun.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 35,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 65,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 32,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'LM',
                x: 15,
                y: 50,
                defaultRole: 'half_winger'
            },
            {
                pos: 'CM',
                x: 38,
                y: 48,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'CM',
                x: 62,
                y: 48,
                defaultRole: 'mezzala'
            },
            {
                pos: 'RM',
                x: 85,
                y: 50,
                defaultRole: 'half_winger'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'complete_forward'
            }
        ]
    },
    {
        name: '4-5-1',
        description: 'Dört savunma, beş orta saha, tek forvet. Orta saha hakimiyeti sağlar.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 35,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 65,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'LM',
                x: 12,
                y: 48,
                defaultRole: 'winger'
            },
            {
                pos: 'CM',
                x: 35,
                y: 42,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 36,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 65,
                y: 42,
                defaultRole: 'advanced_playmaker'
            },
            {
                pos: 'RM',
                x: 88,
                y: 48,
                defaultRole: 'winger'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'target_man'
            }
        ]
    },
    {
        name: '5-3-2',
        description: 'Beş savunma hattı, üç orta saha, iki forvet. Savunma ağırlıklı, kontratak için ideal.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LWB',
                x: 8,
                y: 30,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 28,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 50,
                y: 15,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 72,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RWB',
                x: 92,
                y: 30,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CM',
                x: 30,
                y: 42,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 38,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 70,
                y: 42,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'ST',
                x: 38,
                y: 80,
                defaultRole: 'target_man'
            },
            {
                pos: 'ST',
                x: 62,
                y: 80,
                defaultRole: 'poacher'
            }
        ]
    },
    {
        name: '5-4-1',
        description: 'Beş savunma, dört orta saha, tek forvet. En katı savunma dizilişi.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LWB',
                x: 8,
                y: 28,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 28,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 50,
                y: 15,
                defaultRole: 'offside_trap_cb'
            },
            {
                pos: 'CB',
                x: 72,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RWB',
                x: 92,
                y: 28,
                defaultRole: 'wing_back'
            },
            {
                pos: 'LM',
                x: 15,
                y: 48,
                defaultRole: 'carrilero'
            },
            {
                pos: 'CM',
                x: 38,
                y: 42,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 62,
                y: 42,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RM',
                x: 85,
                y: 48,
                defaultRole: 'carrilero'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'poacher'
            }
        ]
    },
    {
        name: '4-3-2-1',
        description: 'Christmas tree dizilişi. Dar orta saha, üç forvet hattı arkasında iki oyuncu. Yaratıcı ve kompakt.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'sweeper_keeper'
            },
            {
                pos: 'LB',
                x: 18,
                y: 20,
                defaultRole: 'inverted_fullback'
            },
            {
                pos: 'CB',
                x: 37,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 63,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RB',
                x: 82,
                y: 20,
                defaultRole: 'inverted_fullback'
            },
            {
                pos: 'CDM',
                x: 50,
                y: 35,
                defaultRole: 'defensive_midfielder'
            },
            {
                pos: 'CM',
                x: 38,
                y: 40,
                defaultRole: 'mezzala'
            },
            {
                pos: 'CM',
                x: 62,
                y: 40,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CAM',
                x: 38,
                y: 58,
                defaultRole: 'advanced_playmaker'
            },
            {
                pos: 'CAM',
                x: 62,
                y: 58,
                defaultRole: 'advanced_playmaker_fwd'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'false_nine'
            }
        ]
    },
    {
        name: '3-4-1-2',
        description: 'Üç stoper, dört orta saha, bir oyun kurucu ve iki forvet. İtalyan tarzı hücum varyantı.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'CB',
                x: 25,
                y: 17,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'CB',
                x: 50,
                y: 15,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 75,
                y: 17,
                defaultRole: 'offside_trap_cb'
            },
            {
                pos: 'LM',
                x: 12,
                y: 42,
                defaultRole: 'carrilero'
            },
            {
                pos: 'CM',
                x: 38,
                y: 38,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CM',
                x: 62,
                y: 38,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RM',
                x: 88,
                y: 42,
                defaultRole: 'carrilero'
            },
            {
                pos: 'CAM',
                x: 50,
                y: 58,
                defaultRole: 'advanced_playmaker'
            },
            {
                pos: 'ST',
                x: 38,
                y: 80,
                defaultRole: 'target_man'
            },
            {
                pos: 'ST',
                x: 62,
                y: 80,
                defaultRole: 'complete_forward'
            }
        ]
    },
    {
        name: '4-4-1-1',
        description: 'Dört savunma, dört orta saha, arkasında tek forvet olan bir oyun kurucu. Dengeli ve organizeli.',
        positions: [
            {
                pos: 'GK',
                x: 50,
                y: 5,
                defaultRole: 'shot_stopper'
            },
            {
                pos: 'LB',
                x: 15,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'CB',
                x: 35,
                y: 18,
                defaultRole: 'ball_playing_defender'
            },
            {
                pos: 'CB',
                x: 65,
                y: 18,
                defaultRole: 'no_nonsense_cb'
            },
            {
                pos: 'RB',
                x: 85,
                y: 20,
                defaultRole: 'wing_back'
            },
            {
                pos: 'LM',
                x: 15,
                y: 48,
                defaultRole: 'winger'
            },
            {
                pos: 'CM',
                x: 38,
                y: 42,
                defaultRole: 'box_to_box'
            },
            {
                pos: 'CM',
                x: 62,
                y: 42,
                defaultRole: 'deep_lying_playmaker'
            },
            {
                pos: 'RM',
                x: 85,
                y: 48,
                defaultRole: 'winger'
            },
            {
                pos: 'CAM',
                x: 50,
                y: 62,
                defaultRole: 'advanced_playmaker'
            },
            {
                pos: 'ST',
                x: 50,
                y: 82,
                defaultRole: 'complete_forward'
            }
        ]
    }
];
const TACTICAL_INSTRUCTIONS = [
    // ── TEAM ──────────────────────────────────────────────────────────────────
    {
        name: 'Tempo',
        nameEn: 'Tempo',
        category: 'team',
        options: [
            'Yüksek',
            'Normal',
            'Düşük'
        ],
        effects: {
            tempo_modifier: 15,
            stamina_drain: 10,
            pass_completion: -5
        },
        description: 'Oyun hızını belirler. Yüksek tempo daha hızlı hücumlar ama daha fazla yorgunluk.'
    },
    {
        name: 'Pas Doğruluğu',
        nameEn: 'Passing Directness',
        category: 'team',
        options: [
            'Direkt',
            'Karışık',
            'Kısa'
        ],
        effects: {
            passing_risk: 10,
            pass_completion: 8,
            counter_attack: -5
        },
        description: 'Pas uzunluğunu belirler. Direkt paslar riskli ama hızlı hücum sağlar.'
    },
    {
        name: 'Genişlik',
        nameEn: 'Width',
        category: 'team',
        options: [
            'Geniş',
            'Normal',
            'Dar'
        ],
        effects: {
            width_spread: 20,
            central_density: -10,
            crossing_chance: 8
        },
        description: 'Takımın sahayı ne kadar geniş kullandığını belirler.'
    },
    {
        name: 'Baskı Yoğunluğu',
        nameEn: 'Pressing Intensity',
        category: 'team',
        options: [
            'Yüksek',
            'Normal',
            'Düşük'
        ],
        effects: {
            pressing_success: 15,
            stamina_drain: 15,
            defensive_shape: -10
        },
        description: 'Rakibe top kazandırdığınızda ne kadar yoğun baskı yapılacağını belirler.'
    },
    {
        name: 'Savunma Hattı',
        nameEn: 'Defensive Line',
        category: 'team',
        options: [
            'Yüksek',
            'Normal',
            'Düşük'
        ],
        effects: {
            offside_trap: 10,
            through_ball_vuln: 12,
            pressing_efficiency: 8
        },
        description: 'Savunma hattının ne kadar yukarıda kalacağını belirler.'
    },
    {
        name: 'Ofsayt Tuzağı',
        nameEn: 'Offside Trap',
        category: 'team',
        options: [
            'Açık',
            'Normal',
            'Kapalı'
        ],
        effects: {
            offside_success: 15,
            defensive_risk: 12,
            concentration_demand: 10
        },
        description: 'Savunma hattının birlikte hareket ederek ofsayt tuzağı kurmasını sağlar.'
    },
    // ── ATTACKING ─────────────────────────────────────────────────────────────
    {
        name: 'Overlap Koşuları',
        nameEn: 'Overlap Runs',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            crossing_chance: 12,
            wide_attack: 10,
            wing_back_stamina: 8
        },
        description: 'Kanat oyuncularının arkasından beklerin koşmasına izin verir.'
    },
    {
        name: 'Underlap Koşuları',
        nameEn: 'Underlap Runs',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            central_attack: 10,
            cutback_chance: 8,
            fullback_shooting: 6
        },
        description: 'Kanat oyuncularının içinden beklerin koşmasına izin verir.'
    },
    {
        name: 'Yüzen Orta Açma',
        nameEn: 'Float Crosses',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            crossing_accuracy: 8,
            heading_opportunity: 12,
            ariel_duel: 6
        },
        description: 'Ortaları yüksek ve yüzer şekilde açarak havada güçlü forvetleri hedefler.'
    },
    {
        name: 'Sert Orta Açma',
        nameEn: 'Drilled Crosses',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            crossing_speed: 12,
            first_time_shot: 8,
            interception_risk: 6
        },
        description: 'Ortaları yere sert ve hızlı açarak ceza sahası içinde vuruş fırsatı yaratır.'
    },
    {
        name: 'Savunmaya Rağmen',
        nameEn: 'Run at Defense',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            dribbling_success: 10,
            foul_won: 8,
            turnover_risk: 6
        },
        description: 'Oyuncuların topla karşılaşmaya girerek savunmayı zorlamasını sağlar.'
    },
    {
        name: 'Görünen Şut',
        nameEn: 'Shoot on Sight',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            long_shot_chance: 15,
            shot_volume: 12,
            shot_accuracy: -5
        },
        description: 'Oyuncuların şut açısı bulduğunda tereddüt etmeden vurmasını sağlar.'
    },
    {
        name: 'Kutu İçine Sok',
        nameEn: 'Work Ball into Box',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            pass_completion: 10,
            clear_cut_chance: 8,
            patient_buildup: 6
        },
        description: 'Uzaktan şut yerine topu ceza sahasına taşıyan pas hücumu tercih eder.'
    },
    {
        name: 'Erken Orta',
        nameEn: 'Early Crosses',
        category: 'attacking',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            early_cross_chance: 15,
            fast_break: 8,
            crossing_accuracy: -5
        },
        description: 'Kanat oyuncularının kale çizgisine kadar gelmeden erken orta açmasını sağlar.'
    },
    // ── DEFENSIVE ─────────────────────────────────────────────────────────────
    {
        name: 'Geriye Çekil',
        nameEn: 'Sit Back',
        category: 'defensive',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            defensive_depth: 15,
            counter_vuln: -8,
            possession_regain: 8
        },
        description: 'Takımın kendi yarı alanına çekilerek derin savunma yapmasını sağlar.'
    },
    {
        name: 'Mücadeleye Gir',
        nameEn: 'Get Stuck In',
        category: 'defensive',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            tackle_intensity: 15,
            foul_risk: 12,
            ball_recovery: 10
        },
        description: 'Oyuncuların sert mücadele ederek topu geri kazanmasını sağlar.'
    },
    {
        name: 'Zaman Kaybet',
        nameEn: 'Time Wasting',
        category: 'defensive',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            time_control: 20,
            possession_retention: 10,
            crowd_frustration: 8
        },
        description: 'Önde olduğunuzda topu tutarak zaman kaybetmeyi ve skoru korumayı sağlar.'
    },
    {
        name: 'Daha Derin İn',
        nameEn: 'Drop Deeper',
        category: 'defensive',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            space_behind_defense: -15,
            compact_defense: 12,
            pressing_range: -10
        },
        description: 'Savunma hattının daha geriye inerek aradaki boşlukları kapatmasını sağlar.'
    },
    {
        name: 'Pozisyonu Koru',
        nameEn: 'Hold Position',
        category: 'defensive',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            defensive_shape: 15,
            creative_freedom: -10,
            formation_integrity: 12
        },
        description: 'Oyuncuların kendi pozisyonlarını koruyarak dizilişin bozulmasını engeller.'
    },
    // ── SET PIECES ────────────────────────────────────────────────────────────
    {
        name: 'Kısa Serbest Vuruş',
        nameEn: 'Short Free Kicks',
        category: 'set_piece',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            short_freekick: 15,
            possession_retention: 8,
            goal_from_freekick: -8
        },
        description: 'Serbest vuruşları kısa paslarla oynayarak topun elinde kalmasını sağlar.'
    },
    {
        name: 'Uzun Oyuncular Öne',
        nameEn: 'Tall Players Up',
        category: 'set_piece',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            ariel_duel: 15,
            goal_from_corner: 10,
            defensive_vuln: 8
        },
        description: 'Korner ve serbest vuruşlarda uzun oyuncuları öne çıkarır.'
    },
    {
        name: 'Ön Direk Koşusu',
        nameEn: 'Near Post Runs',
        category: 'set_piece',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            near_post_goal: 12,
            quick_goal_chance: 8,
            defender_confusion: 5
        },
        description: 'Kornerlerde ön direğe koşarak kalecinin görüşünü engeller.'
    },
    {
        name: 'Bölge Markajı',
        nameEn: 'Zonal Marking',
        category: 'set_piece',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            zonal_coverage: 15,
            set_piece_defense: 10,
            man_marking: -8
        },
        description: 'Duran toplarda bölge savunması yaparak alanı korur.'
    },
    {
        name: 'Adam Markajı',
        nameEn: 'Man Marking',
        category: 'set_piece',
        options: [
            'Evet',
            'Hayır'
        ],
        effects: {
            man_marking_tightness: 15,
            set_piece_defense: 8,
            zonal_coverage: -10
        },
        description: 'Duran toplarda her oyuncunun bir rakibi birebir takip etmesini sağlar.'
    }
];
/**
 * Get a player attribute value safely. Returns 0 if undefined.
 */ function getAttr(player, attr) {
    const key = attr;
    const val = player[key];
    return typeof val === 'number' ? val : 0;
}
/**
 * Calculate how well a player fits a role based on primary and secondary attributes.
 */ function calculatePlayerRoleFit(player, roleId) {
    const role = ROLES.find((r)=>r.id === roleId);
    if (!role) return 50; // unknown role → neutral
    const bonuses = getRoleAttributeBonuses(roleId);
    // Primary attributes weight 60%
    let primaryScore = 0;
    let primaryCount = 0;
    for (const attr of role.primaryAttributes){
        const val = getAttr(player, attr);
        const bonus = bonuses[attr] ?? 0;
        primaryScore += Math.min(100, val + bonus);
        primaryCount++;
    }
    const primaryAvg = primaryCount > 0 ? primaryScore / primaryCount : 70;
    // Secondary attributes weight 30%
    let secondaryScore = 0;
    let secondaryCount = 0;
    for (const attr of role.secondaryAttributes){
        const val = getAttr(player, attr);
        const bonus = bonuses[attr] ?? 0;
        secondaryScore += Math.min(100, val + bonus);
        secondaryCount++;
    }
    const secondaryAvg = secondaryCount > 0 ? secondaryScore / secondaryCount : 60;
    // Mental weight for mental-style roles → remaining 10%
    let mentalScore = 70;
    if (role.mentalWeight > 0) {
        const mentalAttrs = [
            'decisions',
            'composure',
            'concentration',
            'anticipation',
            'workRate',
            'teamwork',
            'leadership',
            'determination'
        ];
        let mScore = 0;
        for (const attr of mentalAttrs){
            mScore += getAttr(player, attr);
        }
        mentalScore = mScore / mentalAttrs.length;
    }
    const fit = primaryAvg * 0.6 + secondaryAvg * 0.3 + mentalScore * 0.1;
    return Math.round(Math.min(100, fit));
}
/**
 * Calculate instruction synergy — how well the selected instructions work together
 * and how well they complement the assigned roles.
 */ function calculateInstructionSynergy(squad, instructions, playStyle) {
    let synergy = 50; // base
    // Instruction consistency bonuses
    const instructionMap = new Map(instructions.map((i)=>[
            i.instructionName,
            i.option
        ]));
    // Tempo + Pressing should align
    const tempo = instructionMap.get('Tempo');
    const pressing = instructionMap.get('Baskı Yoğunluğu');
    if (tempo === 'Yüksek' && pressing === 'Yüksek') synergy += 8;
    if (tempo === 'Düşük' && pressing === 'Düşük') synergy += 6;
    // Width + Cross type alignment
    const width = instructionMap.get('Genişlik');
    if (width === 'Geniş' && instructionMap.get('Yüzen Orta Açma') === 'Evet') synergy += 5;
    if (width === 'Dar' && instructionMap.get('Savunmaya Rağmen') === 'Evet') synergy += 5;
    // Defensive line + offside trap
    const defLine = instructionMap.get('Savunma Hattı');
    const offsideTrap = instructionMap.get('Ofsayt Tuzağı');
    if (defLine === 'Yüksek' && offsideTrap === 'Açık') synergy += 8;
    if (defLine === 'Düşük' && offsideTrap === 'Kapalı') synergy += 6;
    // Attacking instructions consistency
    const shootOnSight = instructionMap.get('Görünen Şut');
    const workBall = instructionMap.get('Kutu İçine Sok');
    if (shootOnSight === 'Evet' && workBall === 'Hayır') synergy += 5;
    if (shootOnSight === 'Hayır' && workBall === 'Evet') synergy += 5;
    // Contradiction penalties
    if (instructionMap.get('Geriye Çekil') === 'Evet' && instructionMap.get('Baskı Yoğunluğu') === 'Yüksek') {
        synergy -= 10;
    }
    if (instructionMap.get('Bölge Markajı') === 'Evet' && instructionMap.get('Adam Markajı') === 'Evet') {
        synergy -= 8;
    }
    if (instructionMap.get('Zaman Kaybet') === 'Evet' && instructionMap.get('Tempo') === 'Yüksek') {
        synergy -= 8;
    }
    // Role-specific instruction bonuses
    for (const slot of squad){
        const role = ROLES.find((r)=>r.id === slot.roleId);
        if (!role) continue;
        // Play style affinity
        if (playStyle && role.playStyleAffinity[playStyle] !== undefined) {
            synergy += role.playStyleAffinity[playStyle] * 5;
        }
        // Instruction-role synergy
        if (role.attackingContribution > 70 && instructionMap.get('Görünen Şut') === 'Evet') synergy += 3;
        if (role.defensiveContribution > 70 && instructionMap.get('Mücadeleye Gir') === 'Evet') synergy += 3;
        if (role.id === 'false_nine' && instructionMap.get('Kutu İçine Sok') === 'Evet') synergy += 4;
        if (role.id === 'target_man' && instructionMap.get('Yüzen Orta Açma') === 'Evet') synergy += 4;
        if (role.id === 'poacher' && instructionMap.get('Genişlik') === 'Dar') synergy += 3;
        if (role.id === 'winger' && instructionMap.get('Overlap Koşuları') === 'Evet') synergy += 3;
        if (role.id === 'deep_lying_playmaker' && instructionMap.get('Pas Doğruluğu') === 'Kısa') synergy += 3;
        if (role.id === 'box_to_box' && instructionMap.get('Baskı Yoğunluğu') === 'Yüksek') synergy += 3;
    }
    return Math.round(Math.max(0, Math.min(100, synergy)));
}
function calculateTacticalScore(squad, tactic) {
    if (squad.length === 0) {
        return {
            overall: 0,
            roleCompatibility: 0,
            instructionSynergy: 0,
            attributeFit: 0,
            breakdown: {
                slotScores: [],
                instructionEffects: {},
                weaknesses: [
                    'Takım kadrosu boş'
                ],
                strengths: []
            }
        };
    }
    // ── 1. Role Compatibility (position ↔ role match) ──────────────────────
    let totalCompatibility = 0;
    const slotScores = [];
    for (const slot of squad){
        const compatibleRoles = getCompatibleRoles(slot.position);
        const isCompatible = compatibleRoles.some((r)=>r.id === slot.roleId);
        // Role compatibility: 70 base if compatible, 30 penalty if not
        let compatScore = isCompatible ? 70 : 30;
        // Player role fit bonus (attributes)
        const fit = calculatePlayerRoleFit(slot.player, slot.roleId);
        compatScore += fit * 0.3; // up to 30 bonus points from attribute fit
        compatScore = Math.round(Math.min(100, compatScore));
        totalCompatibility += compatScore;
        slotScores.push({
            position: slot.position,
            roleId: slot.roleId,
            score: compatScore
        });
    }
    const roleCompatibility = Math.round(totalCompatibility / squad.length);
    // ── 2. Attribute Fit (overall player quality weighted by role) ──────────
    let totalAttributeFit = 0;
    for (const slot of squad){
        totalAttributeFit += calculatePlayerRoleFit(slot.player, slot.roleId);
    }
    const attributeFit = Math.round(totalAttributeFit / squad.length);
    // ── 3. Instruction Synergy ─────────────────────────────────────────────
    const instructionSynergy = calculateInstructionSynergy(squad, tactic.instructions, tactic.playStyle);
    // ── 4. Combined Effects Map ────────────────────────────────────────────
    const instructionEffects = {};
    for (const inst of tactic.instructions){
        const instructionDef = TACTICAL_INSTRUCTIONS.find((t)=>t.name === inst.instructionName || t.nameEn === inst.instructionName);
        if (instructionDef) {
            for (const [key, val] of Object.entries(instructionDef.effects)){
                instructionEffects[key] = (instructionEffects[key] ?? 0) + val;
            }
        }
    }
    // ── 5. Identify Strengths & Weaknesses ─────────────────────────────────
    const strengths = [];
    const weaknesses = [];
    // Find best and worst slots
    const sorted = [
        ...slotScores
    ].sort((a, b)=>b.score - a.score);
    if (sorted.length > 0 && sorted[0].score >= 80) {
        const role = ROLES.find((r)=>r.id === sorted[0].roleId);
        strengths.push(`${sorted[0].position} - ${role?.nameEn ?? sorted[0].roleId} mükemmel uyum`);
    }
    if (sorted.length > 0 && sorted[sorted.length - 1].score < 50) {
        const role = ROLES.find((r)=>r.id === sorted[sorted.length - 1].roleId);
        weaknesses.push(`${sorted[sorted.length - 1].position} - ${role?.nameEn ?? sorted[sorted.length - 1].roleId} zayıf uyum`);
    }
    // Role coverage analysis
    const hasPlaymaker = squad.some((s)=>[
            'deep_lying_playmaker',
            'advanced_playmaker',
            'advanced_playmaker_fwd'
        ].includes(s.roleId));
    const hasDefender = squad.some((s)=>[
            'no_nonsense_cb',
            'offside_trap_cb',
            'ball_playing_defender',
            'defensive_midfielder'
        ].includes(s.roleId));
    const hasAttacker = squad.some((s)=>[
            'poacher',
            'complete_forward',
            'target_man',
            'false_nine',
            'inside_forward'
        ].includes(s.roleId));
    if (hasPlaymaker) strengths.push('Oyun kurucu rolü mevcut');
    if (hasDefender) strengths.push('Savunma odaklı rol mevcut');
    if (hasAttacker) strengths.push('Hücum odaklı rol mevcut');
    if (!hasPlaymaker) weaknesses.push('Oyun kurucu rolü eksik');
    if (!hasDefender && squad.length > 3) weaknesses.push('Savunma odaklı rol eksik');
    // Instruction balance
    const attackingInsts = tactic.instructions.filter((i)=>TACTICAL_INSTRUCTIONS.find((t)=>(t.name === i.instructionName || t.nameEn === i.instructionName) && t.category === 'attacking'));
    const defensiveInsts = tactic.instructions.filter((i)=>TACTICAL_INSTRUCTIONS.find((t)=>(t.name === i.instructionName || t.nameEn === i.instructionName) && t.category === 'defensive'));
    if (attackingInsts.length > 4) weaknesses.push('Aşırı hücum talimatı, savunma riski artıyor');
    if (defensiveInsts.length > 4) weaknesses.push('Aşırı savunma talimatı, hücum etkinliği azalıyor');
    if (attackingInsts.length >= 1 && defensiveInsts.length >= 1) {
        strengths.push('Dengeli hücum-savunma talimatları');
    }
    // ── 6. Overall Score ───────────────────────────────────────────────────
    const overall = Math.round(roleCompatibility * 0.40 + attributeFit * 0.30 + instructionSynergy * 0.30);
    return {
        overall: Math.max(0, Math.min(100, overall)),
        roleCompatibility: Math.max(0, Math.min(100, roleCompatibility)),
        instructionSynergy: Math.max(0, Math.min(100, instructionSynergy)),
        attributeFit: Math.max(0, Math.min(100, attributeFit)),
        breakdown: {
            slotScores,
            instructionEffects,
            weaknesses,
            strengths
        }
    };
}
function getRoleById(id) {
    return ROLES.find((r)=>r.id === id);
}
function getRolesByCategory(category) {
    return ROLES.filter((r)=>r.category === category);
}
function getFormationByName(name) {
    return FORMATION_TEMPLATES.find((f)=>f.name === name);
}
function getInstructionsByCategory(category) {
    return TACTICAL_INSTRUCTIONS.filter((t)=>t.category === category);
}
}),
"[project]/src/lib/fm/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/fm/trainingEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRAINING_GROUND_XP_MULTIPLIER_BASE",
    ()=>TRAINING_GROUND_XP_MULTIPLIER_BASE,
    "TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL",
    ()=>TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL,
    "getRecommendedProgram",
    ()=>getRecommendedProgram,
    "getTrainingGroundMultiplier",
    ()=>getTrainingGroundMultiplier,
    "isProgramCompatible",
    ()=>isProgramCompatible,
    "runTrainingSession",
    ()=>runTrainingSession,
    "saveTrainingResults",
    ()=>saveTrainingResults,
    "tryMatchTraitGrowth",
    ()=>tryMatchTraitGrowth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/constants.ts [app-ssr] (ecmascript)");
;
const TRAINING_GROUND_XP_MULTIPLIER_BASE = 1.0;
const TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL = 0.1;
function getTrainingGroundMultiplier(trainingGroundLevel) {
    return TRAINING_GROUND_XP_MULTIPLIER_BASE + trainingGroundLevel * TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL;
}
function isProgramCompatible(player, programId) {
    const program = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRAINING_PROGRAMS"].find((p)=>p.id === programId);
    if (!program) return false;
    const allowed = program.allowedPositions;
    if (allowed === 'ALL') return true;
    if (allowed === 'GK') return player.position === 'GK';
    if (allowed === 'FIELD') return player.position !== 'GK';
    if (Array.isArray(allowed)) return allowed.includes(player.position);
    return true;
}
function getRecommendedProgram(player) {
    if (player.position === 'GK') return 'kaleci_antrenmani';
    if (player.position === 'DEF') return 'savunma_okulu';
    if (player.position === 'MID') return 'teknik_driller';
    return 'bitiricilik_kampi';
}
const runTrainingSession = (squad, state, multiplier = 1.0, options)=>{
    const results = {};
    // ── Mentor etkisi: Takımda Mentor trait'li oyuncu varsa 24 yaş altı oyuncular bonus alır ──
    const hasMentor = squad.some((p)=>p.personalityTraits?.includes('Mentor') || p.personalityTraits?.includes('mentor'));
    const updatedSquad = squad.map((player)=>{
        const assignment = state.assignments.find((a)=>a.playerId === player.id);
        if (!assignment) return player;
        const program = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRAINING_PROGRAMS"].find((p)=>p.id === assignment.programId);
        if (!program) return player;
        // ── Pozisyon kısıtlaması ────────────────────────────────────────────────
        if (!isProgramCompatible(player, assignment.programId)) {
            results[player.id] = {
                statsGained: {},
                traitsGained: [],
                injuryRisk: false,
                staminaLost: 0,
                message: `${player.name} bu antrenman programına uygun değil (pozisyon: ${player.position}).`,
                skipped: true
            };
            return player;
        }
        // ── Sakatlık kontrolü ──────────────────────────────────────────────────
        if (player.injury && player.injury.remaining_days > 0) {
            const condGain = assignment.programId === 'kondisyon_toparlanma' ? 15 : 5;
            results[player.id] = {
                statsGained: {},
                traitsGained: [],
                injuryRisk: false,
                staminaLost: -condGain,
                message: 'Sakat. Aktif toparlanma modunda.'
            };
            return {
                ...player,
                cond: Math.min(100, (player.cond || 100) + condGain)
            };
        }
        // ── Kondisyon & Toparlanma programı ───────────────────────────────────
        if (assignment.programId === 'kondisyon_toparlanma') {
            const condGain = 20;
            results[player.id] = {
                statsGained: {},
                traitsGained: [],
                injuryRisk: false,
                staminaLost: -condGain,
                message: `+${condGain} kondisyon. Aktif toparlanma.`
            };
            return {
                ...player,
                cond: Math.min(100, (player.cond || 100) + condGain),
                isResting: false
            };
        }
        // ── Dinlenme ──────────────────────────────────────────────────────────
        if (player.isResting) {
            results[player.id] = {
                statsGained: {},
                traitsGained: [],
                injuryRisk: false,
                staminaLost: -20
            };
            return {
                ...player,
                cond: Math.min(100, (player.cond || 100) + 20),
                isResting: false
            };
        }
        // ── Temel çarpanlar ───────────────────────────────────────────────────
        const intensityFactor = (program.intensity ?? 70) / 100;
        const coachFactor = state.coachQuality ?? 1.0;
        const ageFactor = player.age <= 21 ? 1.5 : player.age >= 30 ? 0.75 : 1.0;
        // Kişilik özellikleri
        let personalityFactor = 1.0;
        if (player.personalityTraits) {
            if (player.personalityTraits.includes('Profesyonel')) personalityFactor *= 1.25;
            if (player.personalityTraits.includes('Antrenman yıldızı')) personalityFactor *= 1.5;
            if (player.personalityTraits.includes('Tembel')) personalityFactor *= 0.75;
            if (player.personalityTraits.includes('Çalışkan')) personalityFactor *= 1.2;
            if (player.personalityTraits.includes('Disiplinsiz')) personalityFactor *= 0.9;
        }
        // Mentor etkisi: 24 yaş altı oyuncular için %25 gelişim bonusu
        if (hasMentor && player.age <= 24) {
            personalityFactor *= 1.25;
        }
        // ── Antrenman tesisi çarpanı ──
        // Seviye başına +0.1 (1.0 başlangıç, level 10 → 2.0)
        let facilityMult = 1.0;
        if (options?.trainingFacilityLevel && options.trainingFacilityLevel > 0) {
            facilityMult = 1.0 + options.trainingFacilityLevel * 0.1;
        }
        // ── Stat kazanımları ─────────────────────────────────────────────────
        const statsGained = {};
        const baseStats = [
            ...program.targetStats
        ];
        if (assignment.focusedStat) baseStats.push(assignment.focusedStat);
        const allUniqueStats = Array.from(new Set(baseStats.filter(Boolean)));
        allUniqueStats.forEach((stat)=>{
            const currentVal = player[stat] ?? 50;
            const potential = player.potential ?? 75;
            let gain;
            if (assignment.focusedStat === stat) {
                // Odaklanılan stat: potansiyele doğru açığın %10'u
                const gap = Math.max(0, potential - currentVal);
                gain = gap * 0.1 * coachFactor * ageFactor * personalityFactor * multiplier * facilityMult;
            } else {
                // Genel stat: rastgele küçük kazanım, stat ne kadar yüksekse o kadar yavaş
                const ceilingFactor = Math.max(0.05, (100 - currentVal) / 100);
                gain = Math.random() * 0.15 * intensityFactor * coachFactor * ageFactor * personalityFactor * multiplier * ceilingFactor * facilityMult;
            }
            // Potansiyel tavanı
            const maxStat = Math.min(99, potential + 5);
            if (currentVal < maxStat) {
                statsGained[stat] = Math.max(0, gain);
            }
        });
        // ── Özel program etkileri ─────────────────────────────────────────────
        const specialEffect = program.specialEffect;
        let moralGain = 0;
        let chemGain = 0;
        if (specialEffect === 'chemistry_boost') {
            // Takım kimyası: moral +5, chemistry +3
            moralGain = 5;
            chemGain = 3;
        }
        // ── Sakatlık riski ────────────────────────────────────────────────────
        // Yüksek yoğunluk + düşük kondisyon + yüksek antrenman yoğunluğu = risk
        const cond = player.cond ?? 100;
        const intensitySliderFactor = (coachFactor - 1.0) * 0.5; // coachQuality 0.5-2.0 → -0.25 to +0.50
        const baseRisk = intensityFactor * 0.03 + Math.max(0, intensitySliderFactor * 0.04);
        const condPenalty = cond < 40 ? 0.08 : cond < 60 ? 0.03 : 0;
        const injuryRisk = Math.random() < baseRisk + condPenalty;
        // ── Kondisyon değişimi ────────────────────────────────────────────────
        const condChange = program.condCost ?? -8; // negatif = kayıp, pozitif = kazanç
        results[player.id] = {
            statsGained,
            traitsGained: [],
            injuryRisk,
            staminaLost: condChange
        };
        // ── Oyuncuyu güncelle ─────────────────────────────────────────────────
        const updated = {
            ...player
        };
        Object.entries(statsGained).forEach(([stat, gain])=>{
            const cur = updated[stat] ?? 50;
            updated[stat] = Math.min(99, cur + gain);
        });
        // Rating etkisi (küçük)
        const totalGain = Object.values(statsGained).reduce((a, b)=>a + b, 0);
        updated.rating = Math.min(player.potential ?? 75, updated.rating + totalGain / 10);
        updated.cond = Math.min(100, Math.max(0, cond + condChange));
        updated.morale = Math.min(100, (updated.morale ?? 70) + moralGain);
        updated.chemistry = Math.min(100, (updated.chemistry ?? 70) + chemGain);
        updated.isResting = false;
        return updated;
    });
    return {
        updatedSquad,
        results
    };
};
async function saveTrainingResults(results, updatedSquad, profileId, sessionType = 'morning', teamName = '') {
    const errors = [];
    let saved = 0;
    try {
        const { getSupabase } = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-ssr] (ecmascript, async loader)");
        const supabase = getSupabase();
        if (!supabase) return {
            saved: 0,
            errors: [
                'Supabase not configured'
            ]
        };
        // ── Katılan oyuncu ID'lerini topla ──
        const participatingPlayerIds = [];
        const playerResults = [];
        let totalCondChange = 0;
        let totalMoraleChange = 0;
        // Sadece stat kazancı olan oyuncuları güncelle
        for (const player of updatedSquad){
            const result = results[player.id];
            if (!result || !result.statsGained || Object.keys(result.statsGained).length === 0) continue;
            participatingPlayerIds.push(player.id);
            const condChange = result.staminaLost || 0;
            const moraleChange = 0; // morale change tracking not in result
            totalCondChange += condChange;
            totalMoraleChange += moraleChange;
            playerResults.push({
                player_id: player.id,
                player_name: player.name,
                position: player.position,
                stats_gained: result.statsGained,
                cond_change: condChange,
                morale_change: moraleChange
            });
            // DB'deki güncel değerleri oku (race condition önleme)
            const { data: currentData } = await supabase.from('players').select('id, shooting, passing, defending, speed, power, heading, goalkeeping, control, vision, rating, cond, morale, form_rating').eq('id', player.id).single();
            if (!currentData) {
                errors.push(`Player ${player.id} not found in DB`);
                continue;
            }
            // Stat artışlarını mevcut DB değerlerine uygula
            const updates = {};
            const statToColumn = {
                'shooting': 'shooting',
                'passing': 'passing',
                'defending': 'defending',
                'speed': 'speed',
                'power': 'power',
                'heading': 'heading',
                'goalkeeping': 'goalkeeping',
                'control': 'control',
                'vision': 'vision',
                'finishing': 'finishing',
                'dribbling': 'dribbling',
                'first_touch': 'first_touch',
                'crossing': 'crossing',
                'marking': 'marking',
                'tackling': 'tackling',
                'technique': 'technique',
                'long_shots': 'long_shots',
                'acceleration': 'acceleration',
                'agility': 'agility',
                'balance': 'balance',
                'strength': 'strength',
                'stamina': 'stamina'
            };
            for (const [stat, gain] of Object.entries(result.statsGained)){
                const column = statToColumn[stat];
                if (column && gain > 0) {
                    const currentVal = currentData[column] ?? 50;
                    updates[column] = Math.min(99, Math.round(currentVal + gain));
                }
            }
            // Kondisyon ve moral güncelle
            if (player.cond !== undefined) updates['cond'] = Math.round(player.cond);
            if (player.morale !== undefined) updates['morale'] = Math.round(player.morale);
            // Rating güncelle (küçük artış)
            const totalGain = Object.values(result.statsGained).reduce((a, b)=>a + b, 0);
            if (totalGain > 0 && currentData.rating) {
                updates['rating'] = Math.min(99, Math.round(currentData.rating + totalGain / 10));
            }
            if (Object.keys(updates).length > 0) {
                const { error } = await supabase.from('players').update(updates).eq('id', player.id);
                if (error) {
                    errors.push(`Update error for ${player.id}: ${error.message}`);
                } else {
                    saved++;
                }
            }
        }
        // ═══════════════════════════════════════════════════════════
        // ANTRENMAN KAYITLARINI SUPABASE'E YAZ
        // ═══════════════════════════════════════════════════════════
        // 1. trainings tablosuna seans kaydı ekle (player_ids dahil)
        if (participatingPlayerIds.length > 0 && profileId) {
            try {
                const trainingTime = sessionType === 'morning' ? '15:00' : '21:00';
                const trainingDate = new Date().toISOString().split('T')[0];
                const avgCond = participatingPlayerIds.length > 0 ? Math.round(totalCondChange / participatingPlayerIds.length * 10) / 10 : 0;
                const avgMorale = participatingPlayerIds.length > 0 ? Math.round(totalMoraleChange / participatingPlayerIds.length * 10) / 10 : 0;
                const { error: trainingErr } = await supabase.from('trainings').insert({
                    profile_id: profileId,
                    team_name: teamName,
                    session_type: sessionType,
                    training_date: trainingDate,
                    training_time: trainingTime,
                    player_results: JSON.stringify(playerResults),
                    player_ids: participatingPlayerIds,
                    avg_cond_change: avgCond,
                    avg_morale_change: avgMorale,
                    total_players: participatingPlayerIds.length
                });
                if (trainingErr) {
                    console.warn('[saveTrainingResults] Training record insert error:', trainingErr.message);
                } else {
                    console.log(`[saveTrainingResults] Training record saved: ${sessionType} session, ${participatingPlayerIds.length} players`);
                }
            } catch (trainingInsertErr) {
                console.warn('[saveTrainingResults] Training record insert exception:', trainingInsertErr);
            }
            // 2. training_attendances tablosuna bireysel katılım kayıtları ekle
            try {
                const attendanceRecords = participatingPlayerIds.map((playerId)=>({
                        player_id: playerId,
                        profile_id: profileId,
                        training_date: new Date().toISOString().split('T')[0],
                        training_type: sessionType
                    }));
                const { error: attErr } = await supabase.from('training_attendances').insert(attendanceRecords);
                if (attErr) {
                    console.warn('[saveTrainingResults] Attendance insert error (table may not exist yet):', attErr.message);
                } else {
                    console.log(`[saveTrainingResults] Attendance records saved for ${attendanceRecords.length} players`);
                }
            } catch (attInsertErr) {
                console.warn('[saveTrainingResults] Attendance insert exception:', attInsertErr);
            }
        }
    } catch (err) {
        errors.push(`Exception: ${String(err)}`);
    }
    return {
        saved,
        errors
    };
}
const tryMatchTraitGrowth = (player, performance)=>{
    return {
        ...player
    };
};
}),
"[project]/src/lib/fm/ui-helpers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cap99",
    ()=>cap99,
    "fmStatBg",
    ()=>fmStatBg,
    "fmStatColor",
    ()=>fmStatColor,
    "formatMoney",
    ()=>formatMoney,
    "formatPosBadge",
    ()=>formatPosBadge,
    "getPlayerPos",
    ()=>getPlayerPos,
    "getPlayerSecondaryPos",
    ()=>getPlayerSecondaryPos,
    "getPosBadgeStyle",
    ()=>getPosBadgeStyle,
    "getPosColor",
    ()=>getPosColor,
    "getPosDotColor",
    ()=>getPosDotColor,
    "getPosGroup",
    ()=>getPosGroup,
    "getPosRowStyle",
    ()=>getPosRowStyle,
    "localizePos",
    ()=>localizePos,
    "localizePosFull",
    ()=>localizePosFull,
    "toTitleCase",
    ()=>toTitleCase
]);
function fmStatColor(value) {
    if (value >= 80) return 'text-green-500';
    if (value >= 65) return 'text-emerald-400';
    if (value >= 50) return 'text-yellow-400';
    if (value >= 35) return 'text-orange-500';
    return 'text-red-500';
}
function fmStatBg(value) {
    if (value >= 80) return 'bg-green-500/10';
    if (value >= 65) return 'bg-emerald-500/10';
    if (value >= 50) return 'bg-yellow-500/10';
    if (value >= 35) return 'bg-orange-500/10';
    return 'bg-red-500/10';
}
function formatMoney(amount) {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M €`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K €`;
    return `${Math.round(amount).toLocaleString('tr-TR')} €`;
}
function cap99(value) {
    return Math.min(99, Math.max(0, Math.round(value)));
}
function toTitleCase(str) {
    if (typeof str !== 'string' || !str) return '';
    return str.toLocaleLowerCase('tr-TR').split(' ').map((word)=>{
        if (!word) return '';
        return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1);
    }).join(' ');
}
function localizePos(pos) {
    if (!pos) return '---';
    const mapping = {
        'GK': 'KL',
        'DEF': 'DF',
        'MID': 'OS',
        'FWD': 'FV',
        'CB': 'STP',
        'LB': 'SolB',
        'RB': 'SağB',
        'LWB': 'SolK',
        'RWB': 'SağK',
        'CDM': 'DOS',
        'CM': 'MOS',
        'CAM': 'OOS',
        'LM': 'SolA',
        'RM': 'SağA',
        'ST': 'SNT',
        'LW': 'SolA',
        'RW': 'SağA',
        'CF': '2.FV'
    };
    return mapping[pos] || pos;
}
function localizePosFull(pos) {
    if (!pos) return '---';
    const mapping = {
        'GK': 'Kaleci',
        'DEF': 'Defans',
        'MID': 'Orta Saha',
        'FWD': 'Forvet',
        'CB': 'Stoper',
        'LB': 'Sol Bek',
        'RB': 'Sağ Bek',
        'LWB': 'Sol Kanat Bek',
        'RWB': 'Sağ Kanat Bek',
        'CDM': 'Defansif Orta Saha',
        'CM': 'Merkez Orta Saha',
        'CAM': 'Ofansif Orta Saha',
        'LM': 'Sol Açık',
        'RM': 'Sağ Açık',
        'ST': 'Forvet',
        'LW': 'Sol Kanat',
        'RW': 'Sağ Kanat',
        'CF': 'İkinci Forvet'
    };
    return mapping[pos] || pos;
}
function formatPosBadge(player) {
    const primary = player.specificPosition || player.position;
    if (player.secondaryPositions && player.secondaryPositions.length > 0) {
        return `${primary}/${player.secondaryPositions[0]}`;
    }
    return primary;
}
function getPosGroup(pos) {
    if (!pos) return 'SUB';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'GK';
    if ([
        'DEF',
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ].includes(p)) return 'DEF';
    // LW/RW: positions tablosunda MID grubundalar (kanat açık/orta saha)
    if ([
        'MID',
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ].includes(p)) return 'MID';
    if ([
        'FWD',
        'ST',
        'CF',
        'LF',
        'RF'
    ].includes(p)) return 'FWD';
    return 'SUB';
}
function getPosColor(pos) {
    if (!pos) return 'text-[#9B9B9B]';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'text-[#7AB4E8]';
    if ([
        'DEF',
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ].includes(p)) return 'text-[#7EDBC8]';
    if ([
        'MID',
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ].includes(p)) return 'text-[#F0C87A]';
    if ([
        'FWD',
        'ST',
        'CF',
        'LF',
        'RF'
    ].includes(p)) return 'text-[#E87878]';
    return 'text-[#9B9B9B]';
}
function getPosRowStyle(pos) {
    if (!pos) return '';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'bg-[#7AB4E8]/10 border-l-4 border-l-[#7AB4E8]';
    if ([
        'DEF',
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ].includes(p)) return 'bg-[#7EDBC8]/10 border-l-4 border-l-[#7EDBC8]';
    if ([
        'MID',
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ].includes(p)) return 'bg-[#F0C87A]/10 border-l-4 border-l-[#F0C87A]';
    if ([
        'FWD',
        'ST',
        'CF',
        'LF',
        'RF'
    ].includes(p)) return 'bg-[#E87878]/10 border-l-4 border-l-[#E87878]';
    return 'bg-[#9B9B9B]/10 border-l-4 border-l-[#9B9B9B]';
}
function getPosBadgeStyle(pos) {
    const p = pos.toUpperCase();
    const group = getPosGroup(p);
    switch(group){
        case 'GK':
            return 'bg-[#7AB4E8]/10 border-[#7AB4E8]/20 text-[#7AB4E8]';
        case 'DEF':
            return 'bg-[#7EDBC8]/10 border-[#7EDBC8]/20 text-[#7EDBC8]';
        case 'MID':
            return 'bg-[#F0C87A]/10 border-[#F0C87A]/20 text-[#F0C87A]';
        case 'FWD':
            return 'bg-[#E87878]/10 border-[#E87878]/20 text-[#E87878]';
        default:
            return 'bg-[#9B9B9B]/10 border-[#9B9B9B]/20 text-[#9B9B9B]';
    }
}
function getPlayerPos(player) {
    return player.specificPosition || player.specific_position || player.position || 'MID';
}
function getPlayerSecondaryPos(player) {
    const sp = player.secondaryPositions || player.secondary_positions;
    if (Array.isArray(sp)) return sp;
    return [];
}
function getPosDotColor(pos) {
    const group = getPosGroup(pos);
    switch(group){
        case 'GK':
            return 'bg-[#7AB4E8]';
        case 'DEF':
            return 'bg-[#7EDBC8]';
        case 'MID':
            return 'bg-[#F0C87A]';
        case 'FWD':
            return 'bg-[#E87878]';
        default:
            return 'bg-[#9B9B9B]';
    }
}
}),
"[project]/src/lib/fm/positionWeights.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Position Weights — Spesifik mevki bazlı yetenek ağırlıkları
// =============================================================================
// Her spesifik pozisyon (CB, CDM, CAM, ST vb.) için hangi yeteneklerin
// daha önemli olduğunu tanımlar. Maç motoru bu ağırlıkları kullanarak
// oyuncuların mevkilerindeki etkinlik puanını hesaplar.
//
// Ağırlık değerleri 0.0–1.0 arasındadır:
//   1.0 = en kritik yetenek (pozisyonun tanımlayıcı özelliği)
//   0.7–0.9 = çok önemli
//   0.4–0.6 = orta önem
//   0.1–0.3 = az önemli
//   0.0 = irrelevant
// =============================================================================
__turbopack_context__.s([
    "POSITION_WEIGHTS",
    ()=>POSITION_WEIGHTS,
    "getAllPositionProfiles",
    ()=>getAllPositionProfiles,
    "getPositionContributions",
    ()=>getPositionContributions,
    "getPositionWeights",
    ()=>getPositionWeights
]);
// ─── Kaleci ──────────────────────────────────────────────────────────────────
const GK_WEIGHTS = {
    label: 'Kaleci',
    weights: {
        goalkeeping: 1.0,
        positioning: 0.8,
        composure: 0.7,
        concentration: 0.7,
        jumping: 0.6,
        bravery: 0.6,
        agility: 0.6,
        reflexes: 0.9,
        strength: 0.4,
        anticipation: 0.5,
        decisions: 0.5,
        balance: 0.4,
        speed: 0.2,
        passing: 0.2
    },
    defensiveContribution: 1.0,
    attackingContribution: 0.0,
    midfieldContribution: 0.0
};
// ─── Defans ──────────────────────────────────────────────────────────────────
const CB_WEIGHTS = {
    label: 'Merkez Defans',
    weights: {
        tackling: 1.0,
        marking: 0.9,
        heading: 0.8,
        positioning: 0.8,
        anticipation: 0.7,
        strength: 0.7,
        concentration: 0.7,
        composure: 0.6,
        jumping: 0.6,
        aggression: 0.5,
        bravery: 0.5,
        decisions: 0.5,
        passing: 0.4,
        speed: 0.4,
        workRate: 0.3
    },
    defensiveContribution: 0.95,
    attackingContribution: 0.05,
    midfieldContribution: 0.1
};
const LB_WEIGHTS = {
    label: 'Sol Bek',
    weights: {
        speed: 0.9,
        stamina: 0.8,
        crossing: 0.8,
        tackling: 0.7,
        positioning: 0.7,
        workRate: 0.7,
        acceleration: 0.7,
        marking: 0.6,
        agility: 0.6,
        dribbling: 0.5,
        passing: 0.5,
        anticipation: 0.5,
        teamwork: 0.5,
        strength: 0.3,
        heading: 0.3
    },
    defensiveContribution: 0.65,
    attackingContribution: 0.25,
    midfieldContribution: 0.2
};
const RB_WEIGHTS = {
    label: 'Sağ Bek',
    weights: {
        speed: 0.9,
        stamina: 0.8,
        crossing: 0.8,
        tackling: 0.7,
        positioning: 0.7,
        workRate: 0.7,
        acceleration: 0.7,
        marking: 0.6,
        agility: 0.6,
        dribbling: 0.5,
        passing: 0.5,
        anticipation: 0.5,
        teamwork: 0.5,
        strength: 0.3,
        heading: 0.3
    },
    defensiveContribution: 0.65,
    attackingContribution: 0.25,
    midfieldContribution: 0.2
};
const LWB_WEIGHTS = {
    label: 'Sol Kanat Bek',
    weights: {
        speed: 0.9,
        crossing: 0.9,
        stamina: 0.85,
        dribbling: 0.7,
        acceleration: 0.8,
        workRate: 0.8,
        tackling: 0.5,
        passing: 0.6,
        agility: 0.6,
        firstTouch: 0.5,
        positioning: 0.5,
        marking: 0.4,
        teamwork: 0.5,
        strength: 0.2,
        heading: 0.2
    },
    defensiveContribution: 0.45,
    attackingContribution: 0.4,
    midfieldContribution: 0.3
};
const RWB_WEIGHTS = {
    label: 'Sağ Kanat Bek',
    weights: {
        speed: 0.9,
        crossing: 0.9,
        stamina: 0.85,
        dribbling: 0.7,
        acceleration: 0.8,
        workRate: 0.8,
        tackling: 0.5,
        passing: 0.6,
        agility: 0.6,
        firstTouch: 0.5,
        positioning: 0.5,
        marking: 0.4,
        teamwork: 0.5,
        strength: 0.2,
        heading: 0.2
    },
    defensiveContribution: 0.45,
    attackingContribution: 0.4,
    midfieldContribution: 0.3
};
// ─── Orta Saha ───────────────────────────────────────────────────────────────
const CDM_WEIGHTS = {
    label: 'Defansif Orta Saha',
    weights: {
        tackling: 0.9,
        positioning: 0.85,
        anticipation: 0.8,
        stamina: 0.8,
        passing: 0.7,
        workRate: 0.8,
        marking: 0.7,
        concentration: 0.7,
        decisions: 0.7,
        composure: 0.6,
        strength: 0.6,
        aggression: 0.5,
        vision: 0.5,
        teamwork: 0.6,
        heading: 0.4
    },
    defensiveContribution: 0.7,
    attackingContribution: 0.1,
    midfieldContribution: 0.6
};
const CM_WEIGHTS = {
    label: 'Merkez Orta Saha',
    weights: {
        passing: 0.9,
        vision: 0.8,
        stamina: 0.8,
        technique: 0.7,
        workRate: 0.7,
        decisions: 0.7,
        firstTouch: 0.7,
        tackling: 0.6,
        composure: 0.6,
        teamwork: 0.6,
        longShots: 0.5,
        positioning: 0.5,
        strength: 0.4,
        dribbling: 0.4,
        anticipation: 0.5
    },
    defensiveContribution: 0.3,
    attackingContribution: 0.3,
    midfieldContribution: 0.8
};
const CAM_WEIGHTS = {
    label: 'Ofansif Orta Saha',
    weights: {
        passing: 1.0,
        vision: 0.9,
        dribbling: 0.7,
        technique: 0.7,
        firstTouch: 0.7,
        shooting: 0.7,
        flair: 0.7,
        longShots: 0.6,
        composure: 0.6,
        offTheBall: 0.6,
        decisions: 0.5,
        creativity: 0.7,
        finishing: 0.5,
        agility: 0.5,
        strength: 0.2
    },
    defensiveContribution: 0.05,
    attackingContribution: 0.65,
    midfieldContribution: 0.5
};
const LM_WEIGHTS = {
    label: 'Sol Açık',
    weights: {
        crossing: 0.9,
        dribbling: 0.8,
        speed: 0.8,
        stamina: 0.7,
        acceleration: 0.7,
        firstTouch: 0.6,
        passing: 0.6,
        technique: 0.6,
        agility: 0.6,
        workRate: 0.5,
        vision: 0.5,
        finishing: 0.4,
        longShots: 0.4,
        strength: 0.2,
        tackling: 0.2
    },
    defensiveContribution: 0.1,
    attackingContribution: 0.55,
    midfieldContribution: 0.5
};
const RM_WEIGHTS = {
    label: 'Sağ Açık',
    weights: {
        crossing: 0.9,
        dribbling: 0.8,
        speed: 0.8,
        stamina: 0.7,
        acceleration: 0.7,
        firstTouch: 0.6,
        passing: 0.6,
        technique: 0.6,
        agility: 0.6,
        workRate: 0.5,
        vision: 0.5,
        finishing: 0.4,
        longShots: 0.4,
        strength: 0.2,
        tackling: 0.2
    },
    defensiveContribution: 0.1,
    attackingContribution: 0.55,
    midfieldContribution: 0.5
};
const LW_WEIGHTS = {
    label: 'Sol Kanat',
    weights: {
        dribbling: 0.9,
        speed: 0.9,
        crossing: 0.8,
        acceleration: 0.85,
        agility: 0.7,
        finishing: 0.6,
        firstTouch: 0.7,
        technique: 0.6,
        flair: 0.6,
        shooting: 0.6,
        offTheBall: 0.5,
        longShots: 0.5,
        vision: 0.4,
        strength: 0.2,
        tackling: 0.1
    },
    defensiveContribution: 0.05,
    attackingContribution: 0.7,
    midfieldContribution: 0.35
};
const RW_WEIGHTS = {
    label: 'Sağ Kanat',
    weights: {
        dribbling: 0.9,
        speed: 0.9,
        crossing: 0.8,
        acceleration: 0.85,
        agility: 0.7,
        finishing: 0.6,
        firstTouch: 0.7,
        technique: 0.6,
        flair: 0.6,
        shooting: 0.6,
        offTheBall: 0.5,
        longShots: 0.5,
        vision: 0.4,
        strength: 0.2,
        tackling: 0.1
    },
    defensiveContribution: 0.05,
    attackingContribution: 0.7,
    midfieldContribution: 0.35
};
// ─── Forvet ──────────────────────────────────────────────────────────────────
const ST_WEIGHTS = {
    label: 'Santrfor',
    weights: {
        finishing: 1.0,
        shooting: 0.9,
        heading: 0.7,
        offTheBall: 0.7,
        speed: 0.7,
        composure: 0.7,
        strength: 0.6,
        acceleration: 0.6,
        jumping: 0.5,
        aggression: 0.5,
        determination: 0.5,
        technique: 0.4,
        positioning: 0.5,
        firstTouch: 0.5,
        passing: 0.3
    },
    defensiveContribution: 0.0,
    attackingContribution: 0.95,
    midfieldContribution: 0.05
};
const CF_WEIGHTS = {
    label: 'Göbek Forvet',
    weights: {
        finishing: 0.8,
        passing: 0.7,
        vision: 0.7,
        dribbling: 0.7,
        technique: 0.7,
        shooting: 0.7,
        firstTouch: 0.7,
        composure: 0.6,
        offTheBall: 0.6,
        flair: 0.5,
        longShots: 0.5,
        decisions: 0.5,
        heading: 0.4,
        strength: 0.4,
        speed: 0.4
    },
    defensiveContribution: 0.0,
    attackingContribution: 0.8,
    midfieldContribution: 0.15
};
const POSITION_WEIGHTS = {
    GK: GK_WEIGHTS,
    CB: CB_WEIGHTS,
    LB: LB_WEIGHTS,
    RB: RB_WEIGHTS,
    LWB: LWB_WEIGHTS,
    RWB: RWB_WEIGHTS,
    CDM: CDM_WEIGHTS,
    CM: CM_WEIGHTS,
    CAM: CAM_WEIGHTS,
    LM: LM_WEIGHTS,
    RM: RM_WEIGHTS,
    LW: LW_WEIGHTS,
    RW: RW_WEIGHTS,
    ST: ST_WEIGHTS,
    CF: CF_WEIGHTS
};
function getPositionWeights(position) {
    const profile = POSITION_WEIGHTS[position];
    return profile?.weights ?? {};
}
function getPositionContributions(position) {
    const profile = POSITION_WEIGHTS[position];
    return {
        defensive: profile?.defensiveContribution ?? 0.33,
        attacking: profile?.attackingContribution ?? 0.33,
        midfield: profile?.midfieldContribution ?? 0.33
    };
}
function getAllPositionProfiles() {
    return Object.entries(POSITION_WEIGHTS).map(([pos, profile])=>({
            position: pos,
            label: profile.label,
            weights: profile.weights,
            defensiveContribution: profile.defensiveContribution,
            attackingContribution: profile.attackingContribution,
            midfieldContribution: profile.midfieldContribution
        }));
}
}),
"[project]/src/lib/fm/positionEffectiveness.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Position Effectiveness — Pozisyon etkinlik puanı hesaplama motoru
// =============================================================================
// Bir oyuncunun belirli bir spesifik pozisyonda ne kadar etkili olduğunu
// positionWeights.ts'deki ağırlık haritasını kullanarak hesaplar.
//
// Kullanım:
//   const eff = getPositionEffectiveness(player, 'CDM');
//   const effectiveRating = player.rating * (0.7 + 0.3 * eff);
//
// Cache: Her maç öncesi hesaplanan etkinlik puanları cache'lenir,
// maç sırasında tekrar hesaplama yapmaz.
// =============================================================================
__turbopack_context__.s([
    "calculatePositionWeightedStrength",
    ()=>calculatePositionWeightedStrength,
    "calculatePositionalTeamStrength",
    ()=>calculatePositionalTeamStrength,
    "clearEffectivenessCache",
    ()=>clearEffectivenessCache,
    "getEffectiveRating",
    ()=>getEffectiveRating,
    "getNativePositionEffectiveness",
    ()=>getNativePositionEffectiveness,
    "getPositionEffectiveness",
    ()=>getPositionEffectiveness,
    "getSecondaryPositionEffectiveness",
    ()=>getSecondaryPositionEffectiveness
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionWeights$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/positionWeights.ts [app-ssr] (ecmascript)");
;
// ─── Etkinlik puanı cache'i ──────────────────────────────────────────────────
const effectivenessCache = new Map();
function cacheKey(playerId, position) {
    return `${playerId}:${position}`;
}
function clearEffectivenessCache() {
    effectivenessCache.clear();
}
function getPositionEffectiveness(player, targetPosition) {
    // Cache kontrolü
    const key = cacheKey(player.id, targetPosition);
    const cached = effectivenessCache.get(key);
    if (cached !== undefined) return cached;
    const weightProfile = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionWeights$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["POSITION_WEIGHTS"][targetPosition];
    // Fallback: Ağırlık profili yoksa rating bazlı etkinlik
    if (!weightProfile) {
        const fallback = (player.rating || 50) / 100;
        effectivenessCache.set(key, fallback);
        return fallback;
    }
    const weights = weightProfile.weights;
    let weightedSum = 0;
    let weightSum = 0;
    for (const [attr, weight] of Object.entries(weights)){
        if (weight <= 0) continue;
        // Oyuncunun o yeteneğini al (dynamic property access)
        const playerValue = getPlayerAttribute(player, attr);
        weightedSum += playerValue * weight;
        weightSum += weight;
    }
    // Normalize: 0–100 → 0.0–1.0
    const effectiveness = weightSum > 0 ? weightedSum / weightSum / 100 : (player.rating || 50) / 100;
    // 0.0–1.0 arasına sıkıştır
    const clampedEffectiveness = Math.max(0, Math.min(1, effectiveness));
    effectivenessCache.set(key, clampedEffectiveness);
    return clampedEffectiveness;
}
function getNativePositionEffectiveness(player) {
    const targetPos = player.specificPosition || positionToSpecificFallback(player.position);
    return getPositionEffectiveness(player, targetPos);
}
function getSecondaryPositionEffectiveness(player, targetPosition) {
    const isNative = player.specificPosition === targetPosition;
    const isSecondary = player.secondaryPositions?.includes(targetPosition) ?? false;
    if (isNative) {
        return getPositionEffectiveness(player, targetPosition);
    }
    if (isSecondary) {
        // Yan mevki penalty'si: doğal mevkinin %85'i
        return getPositionEffectiveness(player, targetPosition) * 0.85;
    }
    // Uyumsuz pozisyon: ciddi penalty (%50)
    return getPositionEffectiveness(player, targetPosition) * 0.5;
}
function getEffectiveRating(player, targetPosition) {
    const pos = targetPosition || player.specificPosition || positionToSpecificFallback(player.position);
    const effectiveness = getPositionEffectiveness(player, pos);
    const baseRating = player.rating || 50;
    return baseRating * (0.7 + 0.3 * effectiveness);
}
function calculatePositionWeightedStrength(players, ...attrs) {
    if (players.length === 0) return 0;
    return players.reduce((sum, p)=>{
        const effectiveRating = getEffectiveRating(p);
        // İstenen niteliklerin ortalaması
        let attrSum = 0;
        for (const a of attrs){
            attrSum += getPlayerAttribute(p, a);
        }
        const avgAttr = attrs.length > 0 ? attrSum / attrs.length : effectiveRating;
        // Moral/form/kondisyon modları
        const moraleMod = 0.85 + p.morale / 100 * 0.3;
        const formMod = 0.85 + p.form / 100 * 0.3;
        const condMod = 0.85 + p.cond / 100 * 0.3;
        // effectiveRating ile nitelik ortalamasını harmanla
        // Eğer özel nitelikler verilmişse %60 nitelik + %40 effectiveRating
        // Verilmemişse tamamen effectiveRating
        const blended = attrs.length > 0 ? avgAttr * 0.6 + effectiveRating * 0.4 : effectiveRating;
        return sum + blended * moraleMod * formMod * condMod;
    }, 0) / players.length;
}
function calculatePositionalTeamStrength(players) {
    let defense = 0;
    let attack = 0;
    let midfield = 0;
    let gk = 0;
    let defCount = 0;
    let atkCount = 0;
    let midCount = 0;
    let gkCount = 0;
    for (const p of players){
        const effectiveRating = getEffectiveRating(p);
        const pos = p.specificPosition || positionToSpecificFallback(p.position);
        const contributions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionWeights$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionContributions"])(pos);
        // Moral/form/kondisyon modları
        const moraleMod = 0.85 + p.morale / 100 * 0.3;
        const formMod = 0.85 + p.form / 100 * 0.3;
        const condMod = 0.85 + p.cond / 100 * 0.3;
        const mod = moraleMod * formMod * condMod;
        const modRating = effectiveRating * mod;
        if (contributions.defensive > 0.5) {
            defense += modRating * contributions.defensive;
            defCount++;
        }
        if (contributions.attacking > 0.5) {
            attack += modRating * contributions.attacking;
            atkCount++;
        }
        if (contributions.midfield > 0.3) {
            midfield += modRating * contributions.midfield;
            midCount++;
        }
        if (p.position === 'GK') {
            gk += modRating;
            gkCount++;
        }
    }
    return {
        defense: defCount > 0 ? defense / defCount : 0,
        attack: atkCount > 0 ? attack / atkCount : 0,
        midfield: midCount > 0 ? midfield / midCount : 0,
        gk: gkCount > 0 ? gk / gkCount : 0
    };
}
// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────
/**
 * Player objesinden dinamik olarak nitelik değerini alır.
 * Eğer nitelik tanımlı değilse veya sayı değilse fallback döner.
 */ function getPlayerAttribute(player, attr, fallback = 50) {
    const val = player[attr];
    return typeof val === 'number' ? val : fallback;
}
/**
 * Geniş pozisyon grubunu spesifik pozisyona dönüştürür (fallback).
 * specificPosition tanımlı olmadığında kullanılır.
 */ function positionToSpecificFallback(position) {
    const fallbackMap = {
        GK: 'GK',
        DEF: 'CB',
        MID: 'CM',
        FWD: 'ST'
    };
    return fallbackMap[position] || 'CM';
}
}),
"[project]/src/lib/fm/referee.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/fm/matchCommentaryGenerator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * matchCommentaryGenerator.ts
 *
 * Trait tabanlı, bağlama duyarlı maç yorumu üretim motoru.
 *
 * Olay tipi, dakika, skor durumu, maç önemi (derbi/kupa/hazırlık),
 * oyuncu trait'leri ve diğer bağlamsal faktörlere göre zengin,
 * çeşitli, hikaye anlatımı tarzında yorum metinleri üretir.
 *
 * Her çağrıda rastgele varyasyon seçer; böylece aynı olay bile
 * farklı anlatımlarla sunulabilir.
 */ // ═══════════════════════════════════════════════════════════════════
// TİPLER
// ═══════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "generateCommentary",
    ()=>generateCommentary,
    "generatePreMatchCommentary",
    ()=>generatePreMatchCommentary,
    "generateScoreContextCommentary",
    ()=>generateScoreContextCommentary,
    "getAnimationDuration",
    ()=>getAnimationDuration,
    "getIntensityScale",
    ()=>getIntensityScale,
    "getMatchTypeLabel",
    ()=>getMatchTypeLabel
]);
// ═══════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function hasTrait(traits, trait) {
    if (!traits) return false;
    return traits.some((t)=>t.toLowerCase().replace(/\s+/g, '_') === trait.toLowerCase().replace(/\s+/g, '_'));
}
function hasAnyTrait(traits, ...traitNames) {
    if (!traits) return false;
    return traitNames.some((tn)=>hasTrait(traits, tn));
}
/** Skor farkını hesapla (pozitif = ev sahibi önde) */ function scoreDiff(ctx) {
    return (ctx.homeScore ?? 0) - (ctx.awayScore ?? 0);
}
/** Eşitlik mi? */ function isDraw(ctx) {
    return (ctx.homeScore ?? 0) === (ctx.awayScore ?? 0);
}
/** Takım önde mi? */ function isLeading(ctx, team) {
    const diff = scoreDiff(ctx);
    if (team === 'HOME') return diff > 0;
    if (team === 'AWAY') return diff < 0;
    return diff !== 0;
}
/** Son dakika mı? (80+) */ function isLate(ctx) {
    return ctx.minute >= 80;
}
/** Çok geç mi? (88+) */ function isVeryLate(ctx) {
    return ctx.minute >= 88;
}
/** Erken dakika mı? (0-20) */ function isEarly(ctx) {
    return ctx.minute <= 20;
}
/** Maçın kritik anı mı? */ function isCrunchTime(ctx) {
    if (ctx.matchType === 'cup_final' || ctx.matchType === 'derby') return ctx.minute >= 70;
    return ctx.minute >= 80;
}
/** Derbi mi? */ function isDerby(ctx) {
    return ctx.matchType === 'derby';
}
/** Kupa maçı mı? */ function isCup(ctx) {
    return ctx.matchType === 'cup' || ctx.matchType === 'cup_final';
}
/** Kupa finali mi? */ function isCupFinal(ctx) {
    return ctx.matchType === 'cup_final';
}
/** Hat-trick yapıldı mı? */ function isHatTrick(ctx) {
    return (ctx.playerGoalCount ?? 0) >= 3;
}
/** Skor farkı büyük mü? (3+) */ function isBigWinMargin(ctx) {
    return Math.abs(scoreDiff(ctx)) >= 3;
}
/** Takım adını al */ function teamName(ctx) {
    if (ctx.team === 'HOME') return ctx.homeTeamName || 'Ev Sahibi';
    if (ctx.team === 'AWAY') return ctx.awayTeamName || 'Deplasman';
    return '';
}
/** Rakip takım adını al */ function opponentName(ctx) {
    if (ctx.team === 'HOME') return ctx.awayTeamName || 'Rakip';
    if (ctx.team === 'AWAY') return ctx.homeTeamName || 'Rakip';
    return '';
}
// ═══════════════════════════════════════════════════════════════════
// GOL YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const GOAL_NORMAL = [
    '{player}, {minute}. dakikada harika bir vuruşla takımını öne geçirdi!',
    'GOOOL! {player} kalecinin yapacağı hiçbir şey yoktu!',
    'Ne bir vuruş! {player} topu adeta ağlara yapıştırdı!',
    '{player} yine yaptı yapacağını! Klas bir bitiriş!',
    'Rakip savunma çaresiz! {player} kendine güvenle vurdu ve gol!',
    'Harika bir gol! {player} {teamName} adına skoru değiştirdi!',
    'Mükemmel bir bitiriş! {player} topu ağlara gönderdi, {opponent} savunması izledi!',
    '{player} soğukkanlılıkla topu ağlara yolladı. Profesyonel bir bitiriş!',
    'Uzun süredir gelen baskı sonunda gol oldu! {player} cezayı kesti!',
    '{player} için bu gol çok kolaydı, neredeyse antrenman çalışması!',
    'Top ağlarla buluştu! {player} takımını sevindirdi!',
    '{player} bu pozisyonda hata yapmazdı ve yapmadı da! Gol!'
];
const GOAL_LATE = [
    'SON DAKİKA GOLÜ! {player} tribünleri yıktı! İnanılmaz bir an!',
    'Dakikalar azalıyordu ki {player} patladı! Muhteşem bir son dakika golü!',
    'Bu filmi yazamazsın! {player} {minute}. dakikada her şeyi değiştirdi!',
    'İNANILMAZ! {player} son saniyede golü attı! Tribünler çıldırdı!',
    'Maç bitmek üzereydi ama {player} farklı bir şey söyledi! GOL!',
    'Tribünlerdekiler ayağa kalktı! {player} {minute}. dakikada takımına hayat verdi!',
    'Ne bir dram! {player} maçın son anında patladı ve skoru değiştirdi!',
    'Süre doluyordu... Ama {player} var ya, o asla pes etmez! GOL!'
];
const GOAL_DERBY = [
    'DERBİ GOLÜ! {player} rakip taraftarları susturdu! Muhteşem!',
    'Ezeli rekabette {player} sahneye çıktı! Bu gol taraftarlara unutulmaz bir an!',
    'Derbinin kaderini {player} belirliyor! Rakip tribünleri sessiz!',
    '{player} derbi golünü attı! Şehrin hakimi kim, belli oluyor!',
    'Bu gol sadece 3 puan değil, gurur golü! {player} tarihe geçti!',
    'Derbiler unutulmaz anlar doğurur ve {player} tam da bunu yaptı! GOL!',
    'Taraftarlar bu golü yıllarca konuşacak! {player} derbinin adamı!'
];
const GOAL_CUP_FINAL = [
    'FİNAL GOLÜ! {player} tarihe altın harflerle adını yazdırıyor!',
    'Kupa finalinde {player} sahneye çıktı! Bu gol şampiyonluk getirebilir!',
    'Finalin adamı {player}! Top ağlara gitti, kupaya bir adım daha yaklaştılar!',
    '{player} final gecesinin yıldızı oluyor! Bu gol kaderi belirleyebilir!',
    'Kupa için mücadele eden {player} en kritik anda golü attı! Muhteşem!',
    'Final maçında {player} soğukkanlılığını korudu ve topu ağlara gönderdi!'
];
const GOAL_HEADER = [
    'KAFAYLA GOL! {player} havada rakibinden yüksekti! Mükemmel bir kafa!',
    'Ne bir kafa vuruşu! {player} topu havadan ağlara yönlendirdi!',
    '{player} hava topunu değerlendirdi! Kalecinin müdahale şansı yoktu!',
    'Mükemmel ortayı kafa ile tamamlayan {player}, skoru değiştirdi!',
    'Hava hakimiyeti {player}\'den yana! Kafayı koydu ve gol!'
];
const GOAL_LONG_SHOT = [
    'UZAKTAN FUZE! {player} ceza sahası dışından müthiş bir şut çıkardı!',
    'Ne bir şut! {player}\'nin uzaktan vuruşu topu ağlara yapıştırdı!',
    'Kaleci uçtu ama yetmedi! {player}\'nin şutu yılın golü adayı!',
    '30 metreden {player} vurdu ve top mermi gibi ağlara gitti!',
    '{player} uzaktan şutunu kullanmayı bildi! Kalecinin yapacağı hiçbir şey yok!'
];
const GOAL_PLASE = [
    'ŞIK BİR PLASE! {player} kalecinin sağına usulca yerleştirdi!',
    '{player} plaseyle topu ağlara yolladı! Ne bir zarafet!',
    'Plase vuruşunda {player} mükemmel bir açı yakaladı! Gol!',
    'Kalecinin yanından {player} topu usulca içeri sürdü! Klas!'
];
const GOAL_ONE_TOUCH = [
    'TEK VURUŞTA GOL! {player} topu ilk dokunuşta ağlara gönderdi!',
    '{player} topu kontrol etmeye bile gerek görmedi! Tek vuruş, gol!',
    'Ne bir refleks! {player} topu ilk temasla değerlendirdi!',
    'Tek vuruşla bitiren {player}, savunmayı dondurdu!'
];
const GOAL_SPRINT_FINISH = [
    'Hızlı hücumda {player} koşusunu tamamladı ve topu ağlara yolladı!',
    'Kontra atakta {player} rakiplere fark attı! Bitiriş kusursuz!',
    '{player}\'nin hızına kim yetişebilir? Koştu, vurdu, gol!',
    'Rüzgar gibi koşan {player}, kalecinin üstünden topu geçirdi!'
];
const GOAL_PENALTY = [
    'PENALTI GOLÜ! {player} topu soğukkanlılıkla ağlara gönderdi!',
    'Beyaz noktadan {player} golü attı! Kaleci doğru köşeye gitmedi!',
    'Penaltıda {player} asla ısırır mı? Isırmadı! Gol!',
    '{player} penaltıyı gole çevirdi! Soğukkanlı bir uygulama!'
];
const GOAL_FREEKICK = [
    'FRİKİK GOLÜ! {player} topu duvarın üzerinden aşırttı! Sanat!',
    'Ne bir frikik! {player} topu mermi gibi ağlara gönderdi!',
    '{player} frikik konusunda uzmanlığını gösterdi! Muhteşem bir vuruş!',
    'Frikikten gol! {player} duvarı aşarak kalecinin ulaşamayacağı köşeye vurdu!'
];
const GOAL_OWN = [
    'KENDİ KALESİNE! {player} topu yanlışlığla ağlara gönderdi! Facia!',
    'Ne bir talihsizlik! {player} kendi kalesine gol attı! Yüzü ellerinde!',
    'Olmaz olmaz! {player}\'nin müdahalesi topu kendi ağlarına yolladı!',
    'Kendi kalesine gol! {player} bu anı silmek ister! Acı bir an!'
];
const GOAL_HAT_TRICK = [
    'HAT-TRICK! {player} üçüncü golü attı! Tribünler onu ayakta alkışlıyor!',
    'İNANILMAZ! {player} maçtaki 3. golünü attı! Bu bir hat-trick!',
    '{player} üç kelebeği masaya koydu! Hat-trick yaparak maça damga vurdu!',
    'Maçın yıldızı tartışmasız {player}! Hat-trick ile tarihe geçti!',
    'Üç gol, bir efsane! {player} bu maçta unutulmaz bir performans sergiledi!'
];
// Trait bazlı gol yorumları
const GOAL_TRAIT_BIG_MATCH = [
    'İşte büyük oyuncu farkı! {player} sahneye çıktı ve takımına galibiyeti getirdi!',
    'Büyük maçların adamı {player} yine iş başında! Kritik anlarda soğukkanlı!',
    '{player} büyük sahnede parlıyor! Bu gol, bu oyuncunun kalitesini kanıtlıyor!',
    'Kalite konuşur! {player} büyük maçta büyük gol attı!',
    'Baskı mı? Ne baskısı? {player} için böyle anlar çerez!'
];
const GOAL_TRAIT_DERBY_BEAST = [
    'DERBİ CANAVARI UYANDI! {player} ezeli rekabette yine fark yarattı!',
    '{player} derbilerde başka bir yaratığa dönüşüyor! Bu gol tarihe geçecek!',
    'Derbinin adamı belli! {player} rakip taraftarları susturdu!',
    '{player} için derbi demek, sahne demek! Yine golünü attı!'
];
const GOAL_TRAIT_FINISHER = [
    'Bitirici forvet fırsatı kaçırmaz! {player} ağları titretti!',
    '{player}\'nin bitiriciliği konuşuyor! Bu pozisyonda hata yapmaz!',
    'Soğukkanlı bitirici {player} topu usulca ağlara yerleştirdi!',
    '{player} için bu pozisyon sınav değil, sadece formalite!'
];
const GOAL_TRAIT_GOAL_MACHINE = [
    'GOL MAKİNESİ çalışıyor! {player} yine tabela yaptı!',
    '{player} gol atmaya doymuyor! Bu sezonki gol sayısı artıyor!',
    'Gol makinesi durdurulamaz! {player} bir kez daha ağları buldu!',
    'Ne bir istikrar! {player} her maç gol atıyor, bu da bir diğeri!'
];
const GOAL_TRAIT_SILENT_ASSASSIN = [
    'Sessiz suikastçı sahneye çıktı! {player} kimse beklemezken golü attı!',
    'Gölgeden gelen gol! {player} fark edilmeden pozisyon aldı ve bitirdi!',
    '{player} sessizce pozisyonunu aldı ve soğukkanlılıkla vurdu! Gol!',
    'Kimse {player}\'i görmedi ama top ağlardaydı! Sessiz suikast!'
];
const GOAL_TRAIT_OPPORTUNIST = [
    'Fırsatçı {player} dönen topu kaçırmadı! Aç gözlü bir bitiriş!',
    '{player} için top nerede, gol orada! Fırsatı değerlendirdi!',
    'Dönen topu takip eden {player}, ağları bulmakta gecikmedi!',
    'Fırsatçı forvet iş başında! {player} boş topu gole çevirdi!'
];
const GOAL_TRAIT_COUNTER_BEAST = [
    'KONTRA CANAVARI! {player} hızlı hücumu soğukkanlılıkla tamamladı!',
    'Kontra atakta {player} rakibe yetişilmez bir hızla koştu ve bitirdi!',
    '{player} kontra atağın adamı! Savunma arkasına sızdı ve golü attı!',
    'Hızlı hücum, {player}\'nin bitiriciliği, gol! Kontra canavarı!'
];
const GOAL_TRAIT_COMEBACK = [
    'Geri dönüş lideri {player}! Takım gerideyken o sorumluluğu aldı!',
    '{player} geri dönüşün simgesi! Takım zor durumdayken o golü attı!',
    'Takım zor anında {player}\'ye ihtiyaç duydu ve o cevap verdi!',
    '{player} zor anlarda yüklenir! Bu gol takıma yeni bir nefes verdi!'
];
const GOAL_FORMER_PLAYER = [
    '{player}, eski takımına karşı suskunluğunu bozdu! Golünü kutlamıyor, büyük saygı.',
    'Eski takımına karşı gol! {player} duygusal anlar yaşıyor, kutlama yapmıyor.',
    '{player} eski renklere karşı gol attı! Yüzünde buruk bir gülümseme...',
    'Ne bir hikaye! {player} eski takımına karşı skoru değiştirdi! Duygusal bir an!',
    '{player} için bu gol özel! Eski takımına karşı skor tabelasını değiştirdi!'
];
// ═══════════════════════════════════════════════════════════════════
// KART YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const YELLOW_NORMAL = [
    'Hakem sarı kartı gösterdi! {player} uyarılıyor.',
    'Sert bir müdahale ve hakem cezayı kesiyor. {player} sarı kart görüyor.',
    '{player} sarı kart gördü. Bu faulun bedeli ağır olabilir.',
    'Taktiksel bir faul ve hakem sarı kartını çıkarıyor. {player} uyarıldı.',
    'Hakemin sabrı taştı! {player} sarı kartla cezalandırılıyor.',
    'Hakem cezayı kesti! {player} sarı kart görüyor, bir sonraki faulda riskli!',
    '{player} bu müdahale için sarı kartını hak etti. Hakem kararlı.',
    'Şiddetli bir giriş! {player} sarı kartla cezalandırıldı.'
];
const YELLOW_AGGRESSIVE = [
    '{player} yine sert oynadı! Agresif müdahalesi sarı kartla sonuçlandı.',
    'Agresif {player} sınırları aştı! Sarı kart hakemin elinde.',
    '{player}\'nin agresif tarzı bu kez bedel ödetiyor. Sarı kart!',
    'Sertliğin bedeli! {player} sarı kart görüyor, oyuna dikkatli devam etmeli.'
];
const YELLOW_CARD_MAGGOT = [
    '{player} yine kart gördü! Bu sezonki kart sayısı artıyor, disiplin sorunu var.',
    'Kart manyağı {player} bir kez daha sarı kartla cezalandırıldı!',
    '{player} kart görmeye devam ediyor! Teknik direktör bu duruma ne diyecek?'
];
const YELLOW_TACTICAL = [
    'Taktiksel faul! {player} rakibin hızını kesmek için faul yaptı, sarı kart.',
    '{player} bilinçli bir faul yaparak tehlikeyi önledi ama sarı kartı da aldı.',
    'Akıllı ama cesur! {player} taktik faul yaptı, sarı kart görüyor.'
];
const RED_NORMAL = [
    'KIRMIZI KART! {player} oyundan atıldı! Takım 10 kişi kaldı!',
    'Hakem kırmızı kartı gösterdi! {player} soyunma odasına yolcu!',
    'Maçın kaderi değişti! {player} kırmızı kart gördü ve takım eksik kaldı!',
    'Şok eden bir an! {player} kırmızı kartla sahayı terk ediyor!',
    'Kırmızı kart! {player} hakemin sabrını taşırdı! Takım çok zor durumda!',
    '{player} için maç bitti! Kırmızı kart ve takım 10 kişi!'
];
const RED_AGGRESSIVE = [
    '{player} yine sert bir müdahale yaptı ve doğrudan kırmızı kart gördü! Takımını 10 kişi bıraktı!',
    'Agresif {player} sınırı aştı! Doğrudan kırmızı kart, takım perişan!',
    'Sert giriş, kırmızı kart! {player} takımını 10 kişi bırakarak sahayı terk etti!'
];
const RED_SECOND_YELLOW = [
    'İKİNCİ SARI KARTTAN KIRMIZI! {player} maçı tamamladı!',
    '{player} ikinci sarı kartını gördü ve kırmızı kartla sahayı terk ediyor!',
    'Bir sarı daha ve kırmızı! {player} için maç bitti!',
    'İkinci sarı kart! {player} hakeme itiraz ediyor ama karar kesin!'
];
const RED_PANICKER = [
    'Panik anında felaket! {player} kritik pozisyonda hata yaptı ve kırmızı kart gördü!',
    '{player} baskı altında çöktü! Panik halinde yaptığı müdahale kırmızı kartla sonuçlandı!',
    'Panikçi oyuncu felaketi! {player} stres altında yanlış karar verdi, kırmızı kart!'
];
// ═══════════════════════════════════════════════════════════════════
// SAKATLIK YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const INJURY_NORMAL = [
    'Kötü bir görüntü! {player} yerde kaldı. Sağlık ekibi sahaya giriyor.',
    '{player} sakatlandı! Bu takım için büyük bir kayıp olabilir.',
    'Endişelendiren bir sahne... {player} tedavi ediliyor.',
    'Maçın gidişatı değişebilir! {player} sakatlık geçirdi.',
    'Umutlar kırıldı! {player} oyuna devam edemeyecek gibi görünüyor.',
    '{player} yerde acı içinde kıvranıyor... Sağlık ekibi koşarak geliyor.',
    'Sakatlık! {player} topu bıraktı ve yere düştü. Bu kötü görünüyor.'
];
const INJURY_SERIOUS = [
    '{player} yerde acı içinde kıvranıyor... Bu ciddi görünüyor. Maçtan çıkıyor.',
    'Acı verici bir sahne! {player}\'nin yüzü acıdan çarpıldı. Sedye bekleniyor.',
    'Bu sakatlık sezonu bitirebilir! {player} göz yaşları içinde sahayı terk ediyor.',
    'Ciddi bir sakatlık! {player}\'nin sezonu tehlikede. Sedye sahaya giriyor.',
    'Felaket bir an! {player} ağır bir şekilde sakatlandı. Sağlık ekibi müdahale ediyor.'
];
const INJURY_FRAGILE = [
    'Yine {player}! Bu oyuncu sakatlıklara çok meyilli. Kırılgan yapısı işte burada ortaya çıkıyor.',
    'Kırılgan mental ve kırılgan fizik! {player} yine sakatlandı.',
    '{player} bir kez daha sakatlık geçiriyor! Bu oyuncunun dayanıklılığı sorgulanır.'
];
// ═══════════════════════════════════════════════════════════════════
// DEĞİŞİKLİK YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const SUB_NORMAL = [
    'Teknik direktör değişikliğe gidiyor. {player} oyuna giriyor.',
    'Taktik bir hamle! {player} sahaya giriyor, takıma yeni bir nefes!',
    'Değişiklik zamanı! {player} oyuna dahil oluyor.',
    '{player} oyuna giriyor! Teknik direktör taktiksel bir hamle yapıyor.',
    'Yeni bir kan! {player} sahanın içine adım atıyor.',
    'Değişiklik geldi! {player} kenar çizgisinde hazır, oyuna girecek.'
];
const SUB_INJURY = [
    'Sakatlık nedeniyle zorunlu değişiklik! {player} oyuna giriyor.',
    '{player} sakatlanan takım arkadaşının yerine oyuna dahil oluyor.',
    'Zorunlu değişiklik! Sakatlık sonrası {player} devreye giriyor.'
];
const SUB_TACTICAL_LATE = [
    'Son dakika taktik değişikliği! {player} oyuna giriyor, zaman kazanmak istiyorlar.',
    '{player} devreye giriyor! Teknik direktör zamanı yönetmek istiyor.',
    'Kritik dakikalarda değişiklik! {player} taze kan olarak sahaya giriyor.'
];
// ═══════════════════════════════════════════════════════════════════
// DEVRE ARASI / MAÇ SONU YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const HALFTIME_NORMAL = [
    'İlk yarı sona erdi! Her iki takım da soyunma odasına dönüyor.',
    'Hakem ilk yarıyı bitirdi. İki teknik direktör için kritik bir ara!',
    'İlk 45 dakika geride kaldı. Şimdi taktik değişiklikleri zamanı!',
    'İlk yarı bitti! Taraftarlar ikinci yarıyı sabırsızlıkla bekliyor.',
    'Devre arası! Teknik direktörler taktik tahtasının başında.'
];
const HALFTIME_DERBY = [
    'Derbinin ilk yarısı bitti! İki takım da soyunma odasında şarj oluyor!',
    'Heyecanlı bir derbi ilk yarısı geride kaldı! İkinci yarı daha da çetin geçecek!',
    'Derbinin ilk 45 dakikası nefes kesti! Devre arası, ama heyecan devam edecek!'
];
const HALFTIME_CUP_FINAL = [
    'Kupa finalinin ilk yarısı bitti! Tarihi bir maçın ikinci yarısı başlamak üzere!',
    'Finalin ilk yarısı geride! Kupa için savaş devam edecek!',
    'İlk yarıda kupayı kimin alacağı belli değil! İkinci yarı kader anı!'
];
const FULLTIME_NORMAL = [
    'MAÇ BİTTİ! Hakem son düdüğü çaldı!',
    'Son dakika geride kaldı! Hakem maçı bitirdi.',
    '90 dakika dolu dolu geçti! Karşılaşma sona erdi.',
    'Maç sona erdi! Hakem düdüğünü çaldı ve oyuncular sahayı terk ediyor.',
    'Karşılaşma tamamlandı! Her iki takım da emeklerini verdi.'
];
const FULLTIME_DERBY = [
    'DERBİ BİTTİ! Şehirde bu gece sessizlik yok! Kazanan belli!',
    'Ezeli rekabetin bu bölümü sona erdi! Kazanan taraftar neşeyle kutluyor!',
    'Derbi tamamlandı! Bu akşam şehrin hakimi kim, artık belli!',
    'Derbinin son düdüğü! Kazanan mutlu, kaybeden daha çok çalışacak!'
];
const FULLTIME_CUP_FINAL = [
    'FİNAL BİTTİ! Yeni şampiyon belli! Kupayı kaldıran takım tarihe geçiyor!',
    'Kupa finali sona erdi! Zafer çığlıkları stadyumu inletiyor!',
    'Tarihi an! Maç bitti ve kupanın sahibi belli oldu!',
    'Şampiyonluk düdüğü! Bu akşam bir efsane daha doğuyor!'
];
const FULLTIME_DRAW = [
    'MAÇ BİTTİ! Beraberlikle sona eren bir karşılaşma! İki takım da puan paylaştı.',
    'Son düdük ve beraberlik! İki takım da kazanamadı ama kaybetmedi de.',
    'Karşılaşma berabere bitti! Puanlar bölündü, kimse tam mutlu değil.'
];
// ═══════════════════════════════════════════════════════════════════
// OFSAYT / KORNER YORUM HAVUZLARI
// ═══════════════════════════════════════════════════════════════════
const OFFSIDE_NORMAL = [
    'Ofsayt! Hakem bayrağını kaldırdı.',
    'Savunma hattı tuzağı çalıştı! Ofsayt kararı.',
    'Hakem ofsayt bayrağını gösterdi. Pozisyon golle sonuçlanmadı.',
    'Çizgide bir adım önde! Ofsayt kararı, pozisyon iptal.',
    'Ofsayt! {player} savunma hattını aşamadı.'
];
const OFFSIDE_TRAP_MASTER = [
    'Ofsayt ustası savunma yine iş başında! Tuzak kusursuz çalıştı!',
    'Savunma hattı {player}\'nin ofsayt tuzağıyla rakip forveti tuzağa düşürdü!',
    'Kusursuz ofsayt tuzağı! Savunma bir vücut gibi hareket etti!'
];
const CORNER_NORMAL = [
    'Korner atışı! Tehlikeli bir pozisyon olabilir.',
    'Kaleci topu kornere çevirdi! Kalabalık ceza sahası...',
    'Korner vuruşu kullanılacak. Takım hücum için pozisyon alıyor.',
    'Korner! {teamName} için set piece fırsatı.',
    'Top köşe bayrağının yanında. Korner atışı gelecek!'
];
// ═══════════════════════════════════════════════════════════════════
// GENEL YORUM HAVUZLARI (Maç akışı)
// ═══════════════════════════════════════════════════════════════════
const COMMENTARY_EARLY = [
    'Maçın temposu henüz düşük. İki takım da birbirini tartıyor.',
    'İlk dakikalarında pas hataları göze çarpıyor. Henüz ısınmadılar.',
    'Taraftarlar heyecanla bekliyor, ama oyun daha orta sahada geçiyor.',
    '{teamName} maça konsantre başlamış görünüyor.',
    'Maç başladı! Her iki takım da ilk fırsatı arıyor.',
    'İlk 20 dakika genellikle temkinli geçer. Bugün de farklı değil.'
];
const COMMENTARY_MID = [
    'Orta sahada kıran kırana bir mücadele izliyoruz.',
    'Top bir o kalede bir bu kalede, tempo iyice yükseldi.',
    'Müthiş bir pres var sahada! Oyuncular nefes almıyor.',
    'Fiziksel güç bugün maçın belirleyici faktörü olabilir.',
    'Kanatlardan gelen bindirmeler etkili olmaya başladı.',
    'Oyunun kontrolü tamamen orta sahadaki mücadeleye bağlı.',
    'Pas trafiği çok akıcı, {teamName} top paylaşımında etkili.',
    'Savunma oyuncuları birbirlerine çok yakın oynuyor, geçit vermiyor.'
];
const COMMENTARY_LATE = [
    'Oyuncuların yorgunluk belirtileri göstermeye başladığını görüyoruz.',
    'Maçın bitimine yaklaştıkça heyecan daha da artıyor.',
    'Maçın en kritik dakikalarına giriyoruz.',
    'Yorgunluktan dolayı pas hataları artmaya başladı.',
    'Teknik direktörler her topun can alıcı olduğunun farkında.',
    'Konsantrasyon kaybı yaşanabilir, bu hatalar golle sonuçlanabilir!',
    'Sonsuz bir enerjiyle koşmaya devam ediyorlar, ama bacaklar ağırlaşıyor.'
];
const COMMENTARY_DERBY = [
    'Derbinin heyecanı sahada hissediliyor! Her top için kıran kırana mücadele!',
    'Ezeli rekabetin ağırlığı oyuncuların üzerinde! Her hata bedel ödetecek!',
    'Taraftarlar çıldırmış durumda! Derbinin atmosferi farklı!',
    'Bu maçta kimse geri adım atmıyor! Derbiler için oynanır!',
    'Sahada dostluk yok, sadece rekabet! Derbinin ateşi yüksek!'
];
const COMMENTARY_CUP = [
    'Kupa maçı demek, her maç final demek! Kaybetmeye tahammül yok!',
    'Eliminasyon maçlarında hata affedilmez! Her top altın değerinde!',
    'Kupa için oynanan maçlarda yürekler ağza gelir!',
    'Bu maçta kaybeden gider! Oyuncular bunun bilincinde!'
];
function generateCommentary(ctx) {
    try {
        const player = ctx.playerName || 'Bilinmeyen';
        const minute = ctx.minute;
        const team = ctx.team;
        const traits = ctx.playerTraits || [];
        const negTraits = ctx.playerNegTraits || [];
        const personality = ctx.playerPersonality || [];
        // Template yer değiştirme fonksiyonu
        const fill = (tpl)=>tpl.replace(/\{player\}/g, player).replace(/\{minute\}/g, String(minute)).replace(/\{team\}/g, team === 'HOME' ? 'ev sahibi' : team === 'AWAY' ? 'deplasman' : '').replace(/\{teamName\}/g, teamName(ctx)).replace(/\{opponent\}/g, opponentName(ctx)).replace(/\{homeTeam\}/g, ctx.homeTeamName || 'Ev Sahibi').replace(/\{awayTeam\}/g, ctx.awayTeamName || 'Deplasman');
        // ─── GOL ───────────────────────────────────────────────────
        if (ctx.eventType === 'GOAL' || ctx.eventType === 'PENALTY_GOAL') {
            let pool = [];
            // 1. Trait bazlı yorumlar (en yüksek öncelik)
            if (isHatTrick(ctx) && GOAL_HAT_TRICK.length > 0) {
                pool = [
                    ...GOAL_HAT_TRICK
                ];
            } else if (hasAnyTrait(traits, 'derbi_canavari', 'Derbi canavarı') && isDerby(ctx)) {
                pool = [
                    ...GOAL_TRAIT_DERBY_BEAST
                ];
            } else if (hasAnyTrait(traits, 'buyuk_mac_oyuncusu', 'Büyük maç oyuncusu') && (isDerby(ctx) || isCup(ctx) || isCrunchTime(ctx))) {
                pool = [
                    ...GOAL_TRAIT_BIG_MATCH
                ];
            } else if (hasAnyTrait(traits, 'bitirici', 'Bitirici')) {
                pool = [
                    ...GOAL_TRAIT_FINISHER
                ];
            } else if (hasAnyTrait(traits, 'gol_makinesi', 'Gol makinesi')) {
                pool = [
                    ...GOAL_TRAIT_GOAL_MACHINE
                ];
            } else if (hasAnyTrait(traits, 'sessiz_suikastci', 'Sessiz suikastçı')) {
                pool = [
                    ...GOAL_TRAIT_SILENT_ASSASSIN
                ];
            } else if (hasAnyTrait(traits, 'firsatci', 'Fırsatçı')) {
                pool = [
                    ...GOAL_TRAIT_OPPORTUNIST
                ];
            } else if (hasAnyTrait(traits, 'kontra_canavari', 'Kontra canavarı') && ctx.goalType === 'sprint_finish') {
                pool = [
                    ...GOAL_TRAIT_COUNTER_BEAST
                ];
            } else if (hasAnyTrait(personality, 'geri_donus_lideri', 'Geri dönüş lideri') && isDraw(ctx) === false && !isLeading(ctx, team)) {
                pool = [
                    ...GOAL_TRAIT_COMEBACK
                ];
            } else if (ctx.isFormerPlayer) {
                pool = [
                    ...GOAL_FORMER_PLAYER
                ];
            } else if (ctx.goalType === 'header') {
                pool = [
                    ...GOAL_HEADER
                ];
            } else if (ctx.goalType === 'long_shot') {
                pool = [
                    ...GOAL_LONG_SHOT
                ];
            } else if (ctx.goalType === 'plase') {
                pool = [
                    ...GOAL_PLASE
                ];
            } else if (ctx.goalType === 'one_touch') {
                pool = [
                    ...GOAL_ONE_TOUCH
                ];
            } else if (ctx.goalType === 'sprint_finish') {
                pool = [
                    ...GOAL_SPRINT_FINISH
                ];
            } else if (ctx.goalType === 'penalty' || ctx.eventType === 'PENALTY_GOAL') {
                pool = [
                    ...GOAL_PENALTY
                ];
            } else if (ctx.goalType === 'freekick') {
                pool = [
                    ...GOAL_FREEKICK
                ];
            } else if (ctx.goalType === 'own_goal') {
                pool = [
                    ...GOAL_OWN
                ];
            } else if (isCupFinal(ctx)) {
                pool = [
                    ...GOAL_CUP_FINAL
                ];
            } else if (isDerby(ctx)) {
                pool = [
                    ...GOAL_DERBY
                ];
            } else if (isVeryLate(ctx)) {
                pool = [
                    ...GOAL_LATE
                ];
            } else if (isLate(ctx)) {
                pool = [
                    ...GOAL_LATE,
                    ...GOAL_NORMAL
                ];
            } else {
                pool = [
                    ...GOAL_NORMAL
                ];
            }
            // Ekstra: Büyük maç oyuncusu + derbi/kupa → trait yorumu ile birleştir
            if (hasAnyTrait(traits, 'buyuk_mac_oyuncusu', 'Büyük maç oyuncusu') && (isDerby(ctx) || isCup(ctx)) && pool !== GOAL_TRAIT_BIG_MATCH) {
                // %40 ihtimalle trait vurgusunu ekle
                if (Math.random() < 0.4) {
                    const traitSuffix = pick(GOAL_TRAIT_BIG_MATCH);
                    return {
                        text: fill(pick(pool)) + ' ' + fill(traitSuffix).replace(/^.*?!\s*/, '').toLowerCase(),
                        intensity: isVeryLate(ctx) ? 5 : isLate(ctx) ? 4 : isDerby(ctx) || isCupFinal(ctx) ? 4 : 3,
                        category: 'goal'
                    };
                }
            }
            return {
                text: fill(pick(pool)),
                intensity: isVeryLate(ctx) ? 5 : isLate(ctx) ? 4 : isDerby(ctx) || isCupFinal(ctx) ? 4 : isHatTrick(ctx) ? 5 : 3,
                category: 'goal'
            };
        }
        // ─── KENDİ KALESİNE GOL ────────────────────────────────────
        if (ctx.eventType === 'OWN_GOAL') {
            return {
                text: fill(pick(GOAL_OWN)),
                intensity: 4,
                category: 'goal'
            };
        }
        // ─── SARI KART ─────────────────────────────────────────────
        if (ctx.eventType === 'YELLOW') {
            let pool = [];
            if (hasAnyTrait(negTraits, 'kart_manyagi', 'Kart manyağı')) {
                pool = [
                    ...YELLOW_CARD_MAGGOT
                ];
            } else if (hasAnyTrait(traits, 'agresif', 'Agresif')) {
                pool = [
                    ...YELLOW_AGGRESSIVE,
                    ...YELLOW_NORMAL
                ];
            } else if (ctx.detail?.toLowerCase().includes('taktik') || ctx.detail?.toLowerCase().includes('tactical')) {
                pool = [
                    ...YELLOW_TACTICAL,
                    ...YELLOW_NORMAL
                ];
            } else {
                pool = [
                    ...YELLOW_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 2,
                category: 'card'
            };
        }
        // ─── KIRMIZI KART ──────────────────────────────────────────
        if (ctx.eventType === 'RED') {
            let pool = [];
            if (hasAnyTrait(personality, 'panikci', 'Panikçi')) {
                pool = [
                    ...RED_PANICKER,
                    ...RED_NORMAL
                ];
            } else if (hasAnyTrait(traits, 'agresif', 'Agresif')) {
                pool = [
                    ...RED_AGGRESSIVE,
                    ...RED_NORMAL
                ];
            } else {
                pool = [
                    ...RED_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 5,
                category: 'card'
            };
        }
        // ─── İKİNCİ SARI → KIRMIZI ────────────────────────────────
        if (ctx.eventType === 'SECOND_YELLOW') {
            return {
                text: fill(pick(RED_SECOND_YELLOW)),
                intensity: 4,
                category: 'card'
            };
        }
        // ─── SAKATLIK ──────────────────────────────────────────────
        if (ctx.eventType === 'INJURY') {
            let pool = [];
            if (hasAnyTrait(personality, 'kirilgan_mental', 'Kırılgan mental') || hasAnyTrait(negTraits, 'kirilgan', 'Kırılgan')) {
                pool = [
                    ...INJURY_FRAGILE,
                    ...INJURY_NORMAL
                ];
            } else if (ctx.detail?.toLowerCase().includes('ciddi') || ctx.detail?.toLowerCase().includes('serious')) {
                pool = [
                    ...INJURY_SERIOUS,
                    ...INJURY_NORMAL
                ];
            } else {
                pool = [
                    ...INJURY_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 3,
                category: 'injury'
            };
        }
        // ─── DEĞİŞİKLİK ────────────────────────────────────────────
        if (ctx.eventType === 'SUB') {
            let pool = [];
            if (ctx.detail?.toLowerCase().includes('sakat') || ctx.detail?.toLowerCase().includes('injury')) {
                pool = [
                    ...SUB_INJURY,
                    ...SUB_NORMAL
                ];
            } else if (isLate(ctx)) {
                pool = [
                    ...SUB_TACTICAL_LATE,
                    ...SUB_NORMAL
                ];
            } else {
                pool = [
                    ...SUB_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 1,
                category: 'sub'
            };
        }
        // ─── DEVRE ARASI ───────────────────────────────────────────
        if (ctx.eventType === 'HALFTIME') {
            let pool = [];
            if (isCupFinal(ctx)) {
                pool = [
                    ...HALFTIME_CUP_FINAL,
                    ...HALFTIME_NORMAL
                ];
            } else if (isDerby(ctx)) {
                pool = [
                    ...HALFTIME_DERBY,
                    ...HALFTIME_NORMAL
                ];
            } else {
                pool = [
                    ...HALFTIME_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 2,
                category: 'halftime'
            };
        }
        // ─── MAÇ SONU ──────────────────────────────────────────────
        if (ctx.eventType === 'FULLTIME') {
            let pool = [];
            if (isCupFinal(ctx)) {
                pool = [
                    ...FULLTIME_CUP_FINAL,
                    ...FULLTIME_NORMAL
                ];
            } else if (isDerby(ctx)) {
                pool = [
                    ...FULLTIME_DERBY,
                    ...FULLTIME_NORMAL
                ];
            } else if (isDraw(ctx)) {
                pool = [
                    ...FULLTIME_DRAW,
                    ...FULLTIME_NORMAL
                ];
            } else {
                pool = [
                    ...FULLTIME_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: isCupFinal(ctx) ? 5 : isDerby(ctx) ? 4 : 2,
                category: 'fulltime'
            };
        }
        // ─── OFSAYT ────────────────────────────────────────────────
        if (ctx.eventType === 'OFFSIDE') {
            let pool = [];
            if (hasAnyTrait(traits, 'ofsayt_ustasi', 'Ofsayt ustası')) {
                pool = [
                    ...OFFSIDE_TRAP_MASTER,
                    ...OFFSIDE_NORMAL
                ];
            } else {
                pool = [
                    ...OFFSIDE_NORMAL
                ];
            }
            return {
                text: fill(pick(pool)),
                intensity: 1,
                category: 'commentary'
            };
        }
        // ─── KORNER ────────────────────────────────────────────────
        if (ctx.eventType === 'CORNER') {
            return {
                text: fill(pick(CORNER_NORMAL)),
                intensity: 1,
                category: 'commentary'
            };
        }
        // ─── GENEL YORUM (COMMENTARY) ──────────────────────────────
        if (ctx.eventType === 'COMMENTARY') {
            let pool = [];
            if (isDerby(ctx)) {
                pool = [
                    ...COMMENTARY_DERBY
                ];
            } else if (isCup(ctx)) {
                pool = [
                    ...COMMENTARY_CUP
                ];
            }
            // Zaman bazlı
            if (isEarly(ctx)) {
                pool = [
                    ...pool,
                    ...COMMENTARY_EARLY
                ];
            } else if (isLate(ctx)) {
                pool = [
                    ...pool,
                    ...COMMENTARY_LATE
                ];
            } else {
                pool = [
                    ...pool,
                    ...COMMENTARY_MID
                ];
            }
            // Eğer motor tarafından metin geldiyse, onu zenginleştir
            if (ctx.detail && ctx.detail.trim().length > 10) {
                // Motor yorumunu olduğu gibi döndür ama matchType vurgusu ekle
                if (isDerby(ctx) && Math.random() < 0.3) {
                    return {
                        text: fill(pick(COMMENTARY_DERBY)) + ' ' + ctx.detail,
                        intensity: 2,
                        category: 'commentary'
                    };
                }
                return {
                    text: ctx.detail,
                    intensity: 1,
                    category: 'commentary'
                };
            }
            return {
                text: fill(pick(pool.length > 0 ? pool : COMMENTARY_MID)),
                intensity: 1,
                category: 'commentary'
            };
        }
        // ─── FALLBACK ──────────────────────────────────────────────
        return {
            text: ctx.detail || fill('{minute}. dakika - maç devam ediyor.'),
            intensity: 1,
            category: 'commentary'
        };
    } catch (err) {
        console.error('[matchCommentaryGenerator] generateCommentary error:', err);
        return {
            text: ctx.detail || `${ctx.minute}' - maç devam ediyor.`,
            intensity: 1,
            category: 'commentary'
        };
    }
}
// ═══════════════════════════════════════════════════════════════════
// MAÇ ÖNCESİ / SONRASI YORUM ÜRETİCİLERİ
// ═══════════════════════════════════════════════════════════════════
const PRE_MATCH_DERBY = [
    'Derbi günü geldi! Şehir ikiye bölündü, taraftarlar saatlerdir stadyumda!',
    'Ezeli rekabetin yeni bölümü! Bugün kimin şehri olduğunu göreceğiz!',
    'Derbi heyecanı dorukta! Formalar, bayraklar, çalgılar... Atmosfer muazzam!',
    'Derbinin ağırlığı oyuncuların omuzlarında! Bu maç sadece 3 puan değil!'
];
const PRE_MATCH_CUP = [
    'Kupa maçı! Kaybeden gider, kazanan yürür! Oyuncular bunun bilincinde!',
    'Eliminasyon gecesi! Her top altın değerinde, her hata bedel ödetecek!',
    'Kupa için mücadele başlıyor! Bu maçta geri dönüş yok!'
];
const PRE_MATCH_CUP_FINAL = [
    'FİNAL GÜNÜ! Kupa için son adım! Tarihi bir akşam bizi bekliyor!',
    'Şampiyonluk maçı! 90 dakika ya da uzatmalar sonunda kupayı kaldıran belli olacak!',
    'Final heyecanı! Tüm sezon bu maç için! Oyuncular tarihe yazılmak için sahaya çıkıyor!',
    'Bütün sezonun emeği bu 90 dakikaya sığdı! Kupa finali başlıyor!'
];
const PRE_MATCH_NORMAL = [
    'Maç başlamak üzere! Taraftarlar tribünlerde yerini aldı.',
    'İki takım da sahaya çıkıyor! Heyecanlı bir 90 dakika bizi bekliyor.',
    'Hakem düdüğü çalmak üzere! Maçın temposu nasıl olacak, göreceğiz.',
    'Saha hazır, oyuncular hazır! Maç başlıyor!'
];
function generatePreMatchCommentary(ctx) {
    const fill = (tpl)=>tpl.replace(/\{homeTeam\}/g, ctx.homeTeamName || 'Ev Sahibi').replace(/\{awayTeam\}/g, ctx.awayTeamName || 'Deplasman');
    let pool = PRE_MATCH_NORMAL;
    if (isCupFinal(ctx)) pool = [
        ...PRE_MATCH_CUP_FINAL,
        ...PRE_MATCH_NORMAL
    ];
    else if (isDerby(ctx)) pool = [
        ...PRE_MATCH_DERBY,
        ...PRE_MATCH_NORMAL
    ];
    else if (isCup(ctx)) pool = [
        ...PRE_MATCH_CUP,
        ...PRE_MATCH_NORMAL
    ];
    return {
        text: fill(pick(pool)),
        intensity: isCupFinal(ctx) ? 3 : isDerby(ctx) ? 3 : 2,
        category: 'special'
    };
}
function generateScoreContextCommentary(homeScore, awayScore, minute, matchType, homeTeamName, awayTeamName) {
    const diff = homeScore - awayScore;
    const isDerbyMatch = matchType === 'derby';
    const isCupMatch = matchType === 'cup' || matchType === 'cup_final';
    const home = homeTeamName || 'Ev Sahibi';
    const away = awayTeamName || 'Deplasman';
    if (Math.abs(diff) >= 3) {
        const leading = diff > 0 ? home : away;
        const templates = [
            `Fark gittikçe açılıyor! ${leading} rahat bir avantajla önde.`,
            `Skor tablosu ${leading} lehine döndü! Rakip çaresiz görünüyor.`,
            `${leading} adeta maçtan kopmuş durumda! Bu fark kapanır mı?`,
            `Taraftarlar sevinçten çıldırıyor! ${leading} maçın hakimi!`
        ];
        return {
            text: pick(templates),
            intensity: 3,
            category: 'commentary'
        };
    }
    if (Math.abs(diff) === 2 && minute >= 70) {
        const leading = diff > 0 ? home : away;
        const trailing = diff > 0 ? away : home;
        const templates = [
            `${leading} iki gol önde ama ${trailing} pes etmiyor! Hâlâ şans var.`,
            `İki gol fark var! ${trailing} geri dönüş için mücadele ediyor.`,
            `${leading} rahat değil, ${trailing} gol arıyor! Maç bitmedi daha!`
        ];
        return {
            text: pick(templates),
            intensity: 2,
            category: 'commentary'
        };
    }
    if (diff === 0 && minute >= 60) {
        const templates = [
            'Beraberlik! İki takım da galibiyet golünü arıyor.',
            'Skor eşit! Kim önce atarsa maçı alabilir!',
            isDerbyMatch ? 'Derbide beraberlik! Her an bir gol gelebilir!' : '',
            isCupMatch ? 'Kupada beraberlik! Uzatma ihtimali gündemde!' : ''
        ].filter(Boolean);
        return {
            text: pick(templates),
            intensity: 2,
            category: 'commentary'
        };
    }
    if (Math.abs(diff) === 1 && minute >= 75) {
        const leading = diff > 0 ? home : away;
        const templates = [
            `Tek gol fark! ${leading} maçı korumaya çalışıyor.`,
            'Bir gol farkla oynanıyor! Her pozisyon altın değerinde!',
            isDerbyMatch ? 'Derbide tek gol fark! Her şey olabilir!' : ''
        ].filter(Boolean);
        return {
            text: pick(templates),
            intensity: 2,
            category: 'commentary'
        };
    }
    return {
        text: pick(COMMENTARY_MID),
        intensity: 1,
        category: 'commentary'
    };
}
function getMatchTypeLabel(matchType) {
    switch(matchType){
        case 'derby':
            return 'Derbi';
        case 'cup':
            return 'Kupa Maçı';
        case 'cup_final':
            return 'Kupa Finali';
        case 'friendly':
            return 'Hazırlık Maçı';
        case 'normal':
            return 'Lig Maçı';
        default:
            return 'Maç';
    }
}
function getAnimationDuration(intensity) {
    switch(intensity){
        case 5:
            return 0.6;
        case 4:
            return 0.5;
        case 3:
            return 0.4;
        case 2:
            return 0.3;
        default:
            return 0.25;
    }
}
function getIntensityScale(intensity) {
    switch(intensity){
        case 5:
            return 1.02;
        case 4:
            return 1.01;
        default:
            return 1.0;
    }
}
}),
"[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FACILITY_LEVEL_BENEFITS",
    ()=>FACILITY_LEVEL_BENEFITS,
    "STADIUM_MATRIX",
    ()=>STADIUM_MATRIX,
    "applyStadiumEffects",
    ()=>applyStadiumEffects,
    "calculateUpgradeCost",
    ()=>calculateUpgradeCost,
    "computeStadiumEffects",
    ()=>computeStadiumEffects,
    "detectMatchConditions",
    ()=>detectMatchConditions,
    "fetchStadiumLevels",
    ()=>fetchStadiumLevels,
    "getAcademyQualityMultiplier",
    ()=>getAcademyQualityMultiplier,
    "getFacilityBenefit",
    ()=>getFacilityBenefit,
    "getHeatingWinterProtection",
    ()=>getHeatingWinterProtection,
    "getInjuryRecoverySpeed",
    ()=>getInjuryRecoverySpeed,
    "getLevelEffect",
    ()=>getLevelEffect,
    "getLightingNightBonus",
    ()=>getLightingNightBonus,
    "getManagerLevelRequirement",
    ()=>getManagerLevelRequirement,
    "getMediaSponsorMultiplier",
    ()=>getMediaSponsorMultiplier,
    "getPitchPassAccuracyBonus",
    ()=>getPitchPassAccuracyBonus,
    "getScoreboardFanBonus",
    ()=>getScoreboardFanBonus,
    "getScoutSlotCount",
    ()=>getScoutSlotCount,
    "getStadiumCapacity",
    ()=>getStadiumCapacity,
    "getStadiumTicketRevenueMultiplier",
    ()=>getStadiumTicketRevenueMultiplier,
    "getStoreDailyRevenue",
    ()=>getStoreDailyRevenue,
    "getTrainingXPMultiplier",
    ()=>getTrainingXPMultiplier,
    "getVIPRevenuePerMatch",
    ()=>getVIPRevenuePerMatch,
    "getWeatherForDate",
    ()=>getWeatherForDate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/landmark.js [app-ssr] (ecmascript) <export default as Landmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-ssr] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thermometer.js [app-ssr] (ecmascript) <export default as Thermometer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-ssr] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$school$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__School$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/school.js [app-ssr] (ecmascript) <export default as School>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dumbbell.js [app-ssr] (ecmascript) <export default as Dumbbell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plane$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plane$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plane.js [app-ssr] (ecmascript) <export default as Plane>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-ssr] (ecmascript) <export default as Wifi>");
;
const STADIUM_MATRIX = [
    {
        id: 'capacity',
        name: 'Seyirci Hacmi (Kapasite)',
        originalName: 'Kolezyum Ölçeği',
        description: 'Mahalle tribünlerinden dikey mimarili arenalara uzanan yolculuk.',
        effect: 'Bilet geliri ve Atmosfer Baskısı artar. Lvl 10: Rakip Karar Verme -5.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__["Landmark"]
    },
    {
        id: 'lighting',
        name: 'Optik Aydınlatma (Işıklandırma)',
        originalName: 'Lümen Operasyonu',
        description: 'Eski projektörlerden gölge bırakmayan akıllı lazer sitemlere.',
        effect: 'Gece maçları performansı ve yayın geliri. Lvl 10: GK Refleks +%10.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"]
    },
    {
        id: 'scoreboards',
        name: 'Veri Panoları (Skor Tabelası)',
        originalName: 'Analitik Ekranlar',
        description: 'Tribünü saran panoramik dijital paneller.',
        effect: 'Taraftar etkileşimi ve sponsorluk. Lvl 10: xG Verileriyle rakip moral bozma.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
    },
    {
        id: 'heating',
        name: 'İklim Kalkanı (Isıtma)',
        originalName: 'Termal Kubbe',
        description: 'Alttan ısıtma borularından akıllı sensörlü yüzey yönetimine.',
        effect: 'Kış şartlarında performans koruma. Lvl 10: Kar/Don etkileri sıfırlanır.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__["Thermometer"]
    },
    {
        id: 'vip',
        name: 'VIP Localar',
        originalName: 'Heli-Port',
        description: 'Standart locadan gökyüzü erişimli ultra-lüks alanlara.',
        effect: 'Devasa VIP geliri ve lobi gücü. Lvl 10: Her maç başı +500.000 € VIP fonu.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plane$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plane$3e$__["Plane"]
    },
    {
        id: 'store',
        name: 'Merchandising',
        originalName: 'Arma Pazarı',
        description: 'Konteyner satış noktalarından devasa deneyim mağazalarına.',
        effect: 'Maç günü dışı pasif gelir. Lvl 10: Global forma satış çarpanı.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"]
    },
    {
        id: 'pitch',
        name: 'Hibrit Çim',
        originalName: 'Nano-Çim',
        description: 'Doğal çimden aşınmayan nano-teknolojik yüzeye.',
        effect: 'Pas isabeti ve hız bonusu. Lvl 10: Takım Pas statı +%15 isabet.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
    },
    {
        id: 'media',
        name: 'Basın ve Multimedya',
        originalName: 'Prestige Hub',
        description: 'Küçük basın odalarından global yayın üslerine.',
        effect: 'Kulüp itibarı ve sponsorluk. Lvl 10: Yayın geliri +%100 artış.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"]
    },
    {
        id: 'academy',
        name: 'Akademi Konutları',
        originalName: 'Gelecek Vizyonu',
        description: 'Beton sahalardan biyometrik tarama merkezlerine.',
        effect: 'Genç yetenek ihtimali. Lvl 10: Her sezon 1 Elit Wonderkid garantisi.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$school$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__School$3e$__["School"]
    },
    {
        id: 'medical',
        name: 'Sağlık ve Rejenerasyon',
        originalName: 'Gladyatör Kampı',
        description: 'Basit revirlerden DNA bazlı rejenerasyon merkezine.',
        effect: 'Sakatlık iyileşme hızı. Lvl 10: Sakatlık ihtimali -%50 azalır.',
        maxLevel: 10,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__["Dumbbell"]
    }
];
const FACILITY_LEVEL_BENEFITS = {
    capacity: {
        1: 'Kapasite 15.000 — Bilet geliri +%5',
        2: 'Kapasite 25.000 — Bilet geliri +%10, Atmosfer +1',
        3: 'Kapasite 35.000 — Bilet geliri +%15, Atmosfer +2',
        4: 'Kapasite 45.000 — Bilet geliri +%20, Atmosfer +3',
        5: 'Kapasite 55.000 — Bilet geliri +%25, Atmosfer +4',
        6: 'Kapasite 65.000 — Bilet geliri +%30, Atmosfer +5',
        7: 'Kapasite 75.000 — Bilet geliri +%35, Atmosfer +6',
        8: 'Kapasite 85.000 — Bilet geliri +%40, Atmosfer +7',
        9: 'Kapasite 95.000 — Bilet geliri +%45, Atmosfer +8',
        10: 'Kapasite 105.000 — Rakip Karar Verme -5, Atmosfer +10'
    },
    lighting: {
        1: 'Gece maçı performansı +%3',
        2: 'Gece maçı performansı +%5, Yayın geliri +%5',
        3: 'Gece maçı performansı +%8, Yayın geliri +%10',
        4: 'Gece maçı performansı +%10, Yayın geliri +%15',
        5: 'Gece maçı performansı +%12, Yayın geliri +%20',
        6: 'Gece maçı performansı +%14, Yayın geliri +%25',
        7: 'Gece maçı performansı +%16, Yayın geliri +%30',
        8: 'Gece maçı performansı +%18, Yayın geliri +%35',
        9: 'Gece maçı performansı +%20, Yayın geliri +%40',
        10: 'GK Refleks +%10, Yayın geliri +%50'
    },
    scoreboards: {
        1: 'Taraftar etkileşimi +%3',
        2: 'Taraftar etkileşimi +%5, Sponsorluk +%3',
        3: 'Taraftar etkileşimi +%8, Sponsorluk +%5',
        4: 'Taraftar etkileşimi +%10, Sponsorluk +%8',
        5: 'Taraftar etkileşimi +%12, Sponsorluk +%10',
        6: 'Taraftar etkileşimi +%14, Sponsorluk +%13',
        7: 'Taraftar etkileşimi +%16, Sponsorluk +%16',
        8: 'Taraftar etkileşimi +%18, Sponsorluk +%19',
        9: 'Taraftar etkileşimi +%20, Sponsorluk +%22',
        10: 'xG Verileriyle rakip moral bozma, Sponsorluk +%25'
    },
    heating: {
        1: 'Kış performans kaybı -%5',
        2: 'Kış performans kaybı -%10',
        3: 'Kış performans kaybı -%15',
        4: 'Kış performans kaybı -%20',
        5: 'Kış performans kaybı -%25',
        6: 'Kış performans kaybı -%30',
        7: 'Kış performans kaybı -%35',
        8: 'Kış performans kaybı -%40',
        9: 'Kış performans kaybı -%45',
        10: 'Kar/Don etkileri tamamen sıfırlanır'
    },
    vip: {
        1: 'VIP gelir: +50.000 €/maç',
        2: 'VIP gelir: +100.000 €/maç',
        3: 'VIP gelir: +150.000 €/maç',
        4: 'VIP gelir: +200.000 €/maç',
        5: 'VIP gelir: +250.000 €/maç',
        6: 'VIP gelir: +300.000 €/maç',
        7: 'VIP gelir: +350.000 €/maç',
        8: 'VIP gelir: +400.000 €/maç',
        9: 'VIP gelir: +450.000 €/maç',
        10: 'Her maç başı +500.000 € VIP fonu'
    },
    store: {
        1: 'Pasif gelir: +20.000 €/gün',
        2: 'Pasif gelir: +40.000 €/gün',
        3: 'Pasif gelir: +60.000 €/gün',
        4: 'Pasif gelir: +80.000 €/gün',
        5: 'Pasif gelir: +100.000 €/gün',
        6: 'Pasif gelir: +130.000 €/gün',
        7: 'Pasif gelir: +160.000 €/gün',
        8: 'Pasif gelir: +200.000 €/gün',
        9: 'Pasif gelir: +250.000 €/gün',
        10: 'Global forma satış çarpanı aktif'
    },
    pitch: {
        1: 'Pas isabeti +%2',
        2: 'Pas isabeti +%3, Hız +1',
        3: 'Pas isabeti +%5, Hız +2',
        4: 'Pas isabeti +%6, Hız +3',
        5: 'Pas isabeti +%8, Hız +4',
        6: 'Pas isabeti +%9, Hız +5',
        7: 'Pas isabeti +%10, Hız +6',
        8: 'Pas isabeti +%11, Hız +7',
        9: 'Pas isabeti +%13, Hız +8',
        10: 'Takım Pas statı +%15 isabet'
    },
    media: {
        1: 'Kulüp itibarı +2',
        2: 'Kulüp itibarı +4, Sponsorluk +%3',
        3: 'Kulüp itibarı +6, Sponsorluk +%5',
        4: 'Kulüp itibarı +8, Sponsorluk +%8',
        5: 'Kulüp itibarı +10, Sponsorluk +%12',
        6: 'Kulüp itibarı +12, Sponsorluk +%16',
        7: 'Kulüp itibarı +14, Sponsorluk +%20',
        8: 'Kulüb itibarı +16, Sponsorluk +%25',
        9: 'Kulüp itibarı +18, Sponsorluk +%30',
        10: 'Yayın geliri +%100 artış'
    },
    academy: {
        1: 'Genç yetenek ihtimali +%5',
        2: 'Genç yetenek ihtimali +%8',
        3: 'Genç yetenek ihtimali +%12, Akademi kapasitesi +1',
        4: 'Genç yetenek ihtimali +%15, Akademi kapasitesi +2',
        5: 'Genç yetenek ihtimali +%18, Akademi kapasitesi +2',
        6: 'Genç yetenek ihtimali +%20, Akademi kapasitesi +3',
        7: 'Genç yetenek ihtimali +%22, Akademi kapasitesi +3',
        8: 'Genç yetenek ihtimali +%25, Akademi kapasitesi +4',
        9: 'Genç yetenek ihtimali +%28, Akademi kapasitesi +4',
        10: 'Her sezon 1 Elit Wonderkid garantisi'
    },
    medical: {
        1: 'Sakatlık iyileşme hızı +%5',
        2: 'Sakatlık iyileşme hızı +%10',
        3: 'Sakatlık iyileşme hızı +%15',
        4: 'Sakatlık iyileşme hızı +%20',
        5: 'Sakatlık iyileşme hızı +%25',
        6: 'Sakatlık iyileşme hızı +%30',
        7: 'Sakatlık iyileşme hızı +%35',
        8: 'Sakatlık iyileşme hızı +%40',
        9: 'Sakatlık iyileşme hızı +%45',
        10: 'Sakatlık ihtimali -%50 azalır'
    }
};
function getFacilityBenefit(facilityId, level) {
    return FACILITY_LEVEL_BENEFITS[facilityId]?.[level] || `Seviye ${level} — Geliştirme aktif`;
}
const getStadiumCapacity = (level)=>{
    return 5000 + level * 10000;
};
const calculateUpgradeCost = (baseCost, level)=>{
    // Exponential scaling as requested
    return Math.floor(baseCost * Math.pow(2.2, level - 1));
};
const getManagerLevelRequirement = (level)=>{
    if (level <= 3) return 0;
    if (level <= 6) return level * 2;
    return level * 3;
};
function getStadiumTicketRevenueMultiplier(stadiumLevel) {
    return 1.0 + stadiumLevel * 0.1;
}
function getTrainingXPMultiplier(trainingLevel) {
    return 1.0 + trainingLevel * 0.1;
}
function getAcademyQualityMultiplier(academyLevel) {
    return 1.0 + academyLevel * 0.15;
}
function getInjuryRecoverySpeed(medicalLevel) {
    return 1.0 + medicalLevel * 0.1;
}
function getScoutSlotCount(scoutLevel) {
    return 1 + scoutLevel;
}
function getVIPRevenuePerMatch(vipLevel) {
    return vipLevel * 50000;
}
function getStoreDailyRevenue(storeLevel) {
    return storeLevel * 20000;
}
function getPitchPassAccuracyBonus(pitchLevel) {
    return pitchLevel * 0.02;
}
function getMediaSponsorMultiplier(mediaLevel) {
    return 1.0 + mediaLevel * 0.03;
}
function getLightingNightBonus(lightingLevel) {
    return 1.0 + lightingLevel * 0.03;
}
function getHeatingWinterProtection(heatingLevel) {
    return Math.min(0.5, heatingLevel * 0.05);
}
function getScoreboardFanBonus(scoreboardLevel) {
    return 1.0 + scoreboardLevel * 0.02;
}
function computeStadiumEffects(facilityLevels, isNightMatch = false, isWinterMatch = false) {
    const lightingLevel = facilityLevels['lighting'] ?? 0;
    const heatingLevel = facilityLevels['heating'] ?? 0;
    const capacityLevel = facilityLevels['capacity'] ?? 0;
    const scoreboardLevel = facilityLevels['scoreboards'] ?? 0;
    const pitchLevel = facilityLevels['pitch'] ?? 0;
    const medicalLevel = facilityLevels['medical'] ?? 0;
    const mediaLevel = facilityLevels['media'] ?? 0;
    // Gece maçı + aydınlatma seviyesi 10 → ev sahibine +%8 şut isabeti
    const homeShootingBonus = isNightMatch && lightingLevel >= 10 ? 0.08 : isNightMatch ? lightingLevel * 0.005 : 0;
    // Gece maçı + aydınlatma seviyesi 10 → deplasmana -%5 pas isabeti
    const awayPassingPenalty = isNightMatch && lightingLevel >= 10 ? -0.05 : isNightMatch ? -(lightingLevel * 0.003) : 0;
    // Kış maçı + ısıtma sistemi 8+ → ev sahibi kondisyon koruma
    const homeConditionPreservation = isWinterMatch && heatingLevel >= 8 ? 0.10 + (heatingLevel - 8) * 0.025 : isWinterMatch ? heatingLevel * 0.005 : 0;
    // Seyirci baskısı → ev sahibi moral bonusu
    const homeMoraleBonus = capacityLevel * 0.3 + // Kapasite → moral
    scoreboardLevel * 0.2 + // Skor tabelası → baskı
    pitchLevel * 0.1 + // Çim → özgüven
    mediaLevel * 0.15; // Medya → prestij
    // Deplasman moral cezası (kapasite + skor tabelası)
    const awayMoralePenalty = -(capacityLevel * 0.2 + scoreboardLevel * 0.15);
    // Pas isabeti bonusu (pitch seviyesi)
    const passingAccuracyBonus = getPitchPassAccuracyBonus(pitchLevel);
    // GK refleks bonusu (lighting=10)
    const gkReflexBonus = lightingLevel >= 10 ? 0.10 : lightingLevel * 0.008;
    // Sakatlık riski azaltma (medical seviyesi)
    const injuryRiskReduction = medicalLevel * 0.005;
    return {
        lightingLevel,
        heatingLevel,
        capacityLevel,
        scoreboardLevel,
        pitchLevel,
        medicalLevel,
        mediaLevel,
        isNightMatch,
        isWinterMatch,
        effects: {
            homeShootingBonus,
            awayPassingPenalty,
            homeConditionPreservation,
            homeMoraleBonus,
            awayMoralePenalty,
            passingAccuracyBonus,
            gkReflexBonus,
            injuryRiskReduction
        }
    };
}
function applyStadiumEffects(homeSquad, awaySquad, stadiumEffects) {
    const eff = stadiumEffects.effects;
    const modifiedHomeSquad = homeSquad.map((p)=>{
        const updated = {
            ...p
        };
        // Ev sahibi şut isabeti bonusu
        if (updated.shooting !== undefined) {
            updated.shooting = Math.min(99, updated.shooting + Math.round(updated.shooting * eff.homeShootingBonus));
        }
        if (updated.finishing !== undefined) {
            updated.finishing = Math.min(99, updated.finishing + Math.round(updated.finishing * eff.homeShootingBonus));
        }
        // Pas isabeti bonusu (çim kalitesi)
        if (updated.passing !== undefined) {
            updated.passing = Math.min(99, updated.passing + Math.round(updated.passing * eff.passingAccuracyBonus));
        }
        // Moral bonusu
        if (updated.morale !== undefined) {
            updated.morale = Math.min(100, updated.morale + eff.homeMoraleBonus);
        }
        // GK refleks bonusu
        if (updated.position === 'GK' && updated.goalkeeping !== undefined) {
            updated.goalkeeping = Math.min(99, updated.goalkeeping + Math.round(updated.goalkeeping * eff.gkReflexBonus));
        }
        return updated;
    });
    const modifiedAwaySquad = awaySquad.map((p)=>{
        const updated = {
            ...p
        };
        // Deplasman pas isabeti cezası
        if (updated.passing !== undefined) {
            updated.passing = Math.max(1, updated.passing + Math.round(updated.passing * eff.awayPassingPenalty));
        }
        // Deplasman moral cezası
        if (updated.morale !== undefined) {
            updated.morale = Math.max(1, updated.morale + eff.awayMoralePenalty);
        }
        return updated;
    });
    return {
        modifiedHomeSquad,
        modifiedAwaySquad
    };
}
async function fetchStadiumLevels(profileId) {
    try {
        const { getSupabase } = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-ssr] (ecmascript, async loader)");
        const supabase = getSupabase();
        if (!supabase) return {};
        // user_facilities tablosunu dene
        const { data: facilities } = await supabase.from('user_facilities').select('facility_id, level').eq('profile_id', profileId);
        if (facilities && facilities.length > 0) {
            const levels = {};
            for (const f of facilities){
                levels[f.facility_id] = f.level;
            }
            return levels;
        }
        // Fallback: profiles.stadium_upgrades JSON
        const { data: profile } = await supabase.from('profiles').select('stadium_upgrades').eq('id', profileId).single();
        if (profile?.stadium_upgrades) {
            if (typeof profile.stadium_upgrades === 'string') {
                return JSON.parse(profile.stadium_upgrades);
            }
            return profile.stadium_upgrades;
        }
        return {};
    } catch  {
        return {};
    }
}
function getWeatherForDate(dateStr) {
    const d = new Date(dateStr);
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const roll = (seed * 9301 + 49297) % 233280 / 233280;
    const month = d.getMonth() + 1;
    // Yaz (Haz-Tem-Ağu): çoğunlukla güneşli
    if (month >= 6 && month <= 8) {
        return roll < 0.85 ? 'sunny' : 'rainy';
    }
    // Kış (Ara-Oca-Şub): kar, yağmur, rüzgar olasılıkları yüksek
    if (month === 12 || month <= 2) {
        if (roll < 0.3) return 'snowy';
        if (roll < 0.6) return 'rainy';
        return 'windy';
    }
    // Geçiş mevsimleri (İlkbahar/Sonbahar)
    if (roll < 0.50) return 'sunny';
    if (roll < 0.70) return 'rainy';
    if (roll < 0.85) return 'windy';
    return 'snowy';
}
function detectMatchConditions(matchDate, matchTime) {
    const date = matchDate ? new Date(matchDate) : new Date();
    const hour = matchTime ? parseInt(matchTime.split(':')[0]) : date.getHours();
    const month = date.getMonth(); // 0-indexed: Dec=11, Jan=0, Feb=1
    // Gece maçı: 18:00 ve sonrası
    const isNightMatch = hour >= 18;
    // Kış maçı: Aralık, Ocak, Şubat
    const isWinterMatch = month === 11 || month === 0 || month === 1;
    return {
        isNightMatch,
        isWinterMatch
    };
}
function getLevelEffect(facilityId, level) {
    try {
        switch(facilityId){
            case 'capacity':
                return {
                    key: 'ticketRevenueMultiplier',
                    label: 'Bilet Geliri Çarpanı',
                    value: getStadiumTicketRevenueMultiplier(level)
                };
            case 'lighting':
                return {
                    key: 'nightPerformanceMultiplier',
                    label: 'Gece Maçı Performans Çarpanı',
                    value: getLightingNightBonus(level)
                };
            case 'scoreboards':
                return {
                    key: 'fanEngagementMultiplier',
                    label: 'Taraftar Etkileşimi Çarpanı',
                    value: getScoreboardFanBonus(level)
                };
            case 'heating':
                return {
                    key: 'winterProtection',
                    label: 'Kış Performans Koruması',
                    value: getHeatingWinterProtection(level)
                };
            case 'vip':
                return {
                    key: 'vipRevenuePerMatch',
                    label: 'VIP Gelir / Maç (€)',
                    value: getVIPRevenuePerMatch(level)
                };
            case 'store':
                return {
                    key: 'dailyPassiveIncome',
                    label: 'Günlük Pasif Gelir (€)',
                    value: getStoreDailyRevenue(level)
                };
            case 'pitch':
                return {
                    key: 'passAccuracyBonus',
                    label: 'Pas İsabeti Bonusu',
                    value: getPitchPassAccuracyBonus(level)
                };
            case 'media':
                return {
                    key: 'sponsorMultiplier',
                    label: 'Sponsorluk Çarpanı',
                    value: getMediaSponsorMultiplier(level)
                };
            case 'academy':
                return {
                    key: 'academyQualityMultiplier',
                    label: 'Akademi Kalite Çarpanı',
                    value: getAcademyQualityMultiplier(level)
                };
            case 'medical':
                return {
                    key: 'injuryRecoverySpeed',
                    label: 'Sakatlık İyileşme Hızı',
                    value: getInjuryRecoverySpeed(level)
                };
            default:
                return null;
        }
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/fm/playStyles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Managerium — Play Style System
// =============================================================================
// Defines team tactical play styles, their match engine modifiers, and
// assignment logic. Each style has concrete effects on match simulation:
// pressing, passing, stamina drain, tackling, counter-attacks, etc.
// =============================================================================
__turbopack_context__.s([
    "PLAY_STYLE_DEFS",
    ()=>PLAY_STYLE_DEFS,
    "assignRandomPlayStyle",
    ()=>assignRandomPlayStyle,
    "calculateTeamPlayStyleModifiers",
    ()=>calculateTeamPlayStyleModifiers,
    "getAllPlayStyleNames",
    ()=>getAllPlayStyleNames,
    "getPlayStyleEffect",
    ()=>getPlayStyleEffect,
    "getPlayStyleMatchModifiers",
    ()=>getPlayStyleMatchModifiers
]);
const PLAY_STYLE_DEFS = [
    {
        id: 'gegenpressing',
        name: 'Gegenpressing',
        short: 'Yüksek baskı ve hızlı geri kazanım',
        icon: '⚡',
        description: 'Top kaybından sonra anında baskı ile topu hızla geri kazanır. Yüksek enerji gerektirir, kondisyon kaybı artar.',
        modifiers: {
            pressingBonus: 0.10,
            passAccuracyBonus: 0.02,
            staminaDrain: 0.15,
            tackleBonus: 0.05,
            possessionBonus: 0.05,
            counterBonus: 0.03,
            crossingBonus: 0.00,
            longBallBonus: -0.05,
            defenseBonus: 0.00,
            shotFrequencyBonus: 0.05,
            shotAccuracyBonus: 0.02
        }
    },
    {
        id: 'tiki_taka',
        name: 'Tiki-Taka',
        short: 'Kısa pas ve oyun kontrolü',
        icon: '⚽',
        description: 'Kısa paslarla topun rakibe verilmemesi ve yavaş yavaş rakip yarı sahaya ilerlenmesi. Pas isabeti artar ama şut sayısı düşer.',
        modifiers: {
            pressingBonus: 0.02,
            passAccuracyBonus: 0.08,
            staminaDrain: 0.03,
            tackleBonus: 0.00,
            possessionBonus: 0.08,
            counterBonus: -0.05,
            crossingBonus: 0.00,
            longBallBonus: -0.12,
            defenseBonus: -0.02,
            shotFrequencyBonus: -0.05,
            shotAccuracyBonus: 0.04
        }
    },
    {
        id: 'catenaccio',
        name: 'Catenaccio',
        short: 'Katı savunma ve kontratak',
        icon: '🛡️',
        description: 'Defansı kalın tutar, rakibin atağını göğüsler ve hızlı kontra atakla gol arar. Az şut, az top kaybı.',
        modifiers: {
            pressingBonus: 0.00,
            passAccuracyBonus: 0.02,
            staminaDrain: -0.05,
            tackleBonus: 0.08,
            possessionBonus: -0.08,
            counterBonus: 0.10,
            crossingBonus: -0.03,
            longBallBonus: 0.05,
            defenseBonus: 0.10,
            shotFrequencyBonus: -0.08,
            shotAccuracyBonus: 0.02
        }
    },
    {
        id: 'direct_play',
        name: 'Direct Play',
        short: 'Uzun top ve hızlı hücum',
        icon: '🚀',
        description: 'Topu hızlı ileri taşır, uzun toplar ve doğrudan hücum ile gol arar. Pas isabeti düşer ama gol şansı artar.',
        modifiers: {
            pressingBonus: 0.03,
            passAccuracyBonus: -0.05,
            staminaDrain: 0.05,
            tackleBonus: 0.00,
            possessionBonus: -0.05,
            counterBonus: 0.08,
            crossingBonus: 0.02,
            longBallBonus: 0.12,
            defenseBonus: -0.03,
            shotFrequencyBonus: 0.08,
            shotAccuracyBonus: 0.03
        }
    },
    {
        id: 'wing_play',
        name: 'Wing Play',
        short: 'Kanat aksiyonu ve orta',
        icon: '🦅',
        description: 'Hücumu kanatlardan başlatır, çokça orta yapar ve kafa golü arar. Kanat aksiyonları artar.',
        modifiers: {
            pressingBonus: 0.00,
            passAccuracyBonus: 0.02,
            staminaDrain: 0.03,
            tackleBonus: 0.00,
            possessionBonus: 0.03,
            counterBonus: 0.02,
            crossingBonus: 0.14,
            longBallBonus: 0.00,
            defenseBonus: -0.02,
            shotFrequencyBonus: 0.05,
            shotAccuracyBonus: 0.00
        }
    },
    {
        id: 'total_football',
        name: 'Total Football',
        short: 'Herkes her yerde oynar',
        icon: '🌀',
        description: 'Pozisyonlar arası esneklik, herkes hücum ve savunmaya katılır. Tüm istatistikler hafif artar ama kondisyon kaybı yüksek.',
        modifiers: {
            pressingBonus: 0.05,
            passAccuracyBonus: 0.04,
            staminaDrain: 0.10,
            tackleBonus: 0.04,
            possessionBonus: 0.04,
            counterBonus: 0.04,
            crossingBonus: 0.03,
            longBallBonus: 0.00,
            defenseBonus: 0.03,
            shotFrequencyBonus: 0.03,
            shotAccuracyBonus: 0.03
        }
    },
    {
        id: 'route_one',
        name: 'Route One',
        short: 'Direkt kaleci → forvet',
        icon: '🏹',
        description: 'En kısa yoldan gol arar. Kaleci doğrudan forvete uzun top atar. Basit ama etkili. Pas isabeti düşer.',
        modifiers: {
            pressingBonus: -0.03,
            passAccuracyBonus: -0.08,
            staminaDrain: -0.03,
            tackleBonus: 0.00,
            possessionBonus: -0.10,
            counterBonus: 0.05,
            crossingBonus: 0.00,
            longBallBonus: 0.18,
            defenseBonus: 0.00,
            shotFrequencyBonus: 0.06,
            shotAccuracyBonus: 0.05
        }
    },
    {
        id: 'possession_football',
        name: 'Possession Football',
        short: 'Topa sahip olma odaklı',
        icon: '🔄',
        description: 'Topu ayağında tutarak rakibi yorar. Yüksek pas isabeti ve topa sahip olma, ama kontra atak zayıf.',
        modifiers: {
            pressingBonus: 0.00,
            passAccuracyBonus: 0.10,
            staminaDrain: -0.02,
            tackleBonus: 0.00,
            possessionBonus: 0.10,
            counterBonus: -0.05,
            crossingBonus: 0.00,
            longBallBonus: -0.08,
            defenseBonus: 0.00,
            shotFrequencyBonus: -0.03,
            shotAccuracyBonus: 0.05
        }
    },
    {
        id: 'high_press',
        name: 'High Press',
        short: 'Rakip yarı sahada baskı',
        icon: '🔥',
        description: 'Rakip yarı sahada agresif baskı yapar, topu kazanır ve hemen gol arar. Çok enerji harcar.',
        modifiers: {
            pressingBonus: 0.15,
            passAccuracyBonus: 0.00,
            staminaDrain: 0.20,
            tackleBonus: 0.08,
            possessionBonus: 0.03,
            counterBonus: 0.05,
            crossingBonus: 0.00,
            longBallBonus: -0.05,
            defenseBonus: 0.05,
            shotFrequencyBonus: 0.08,
            shotAccuracyBonus: 0.02
        }
    },
    {
        id: 'parking_the_bus',
        name: 'Parking the Bus',
        short: 'Tüm takım savunmada',
        icon: '🚌',
        description: 'Tüm takım kendi yarı sahasında çifter çifter durur. Az şut, az gol yeme, yüksek savunma.',
        modifiers: {
            pressingBonus: -0.05,
            passAccuracyBonus: 0.00,
            staminaDrain: -0.08,
            tackleBonus: 0.05,
            possessionBonus: -0.12,
            counterBonus: 0.12,
            crossingBonus: -0.05,
            longBallBonus: 0.05,
            defenseBonus: 0.15,
            shotFrequencyBonus: -0.12,
            shotAccuracyBonus: 0.00
        }
    }
];
// ─── Lookup maps ────────────────────────────────────────────────────────────
const PLAY_STYLE_BY_ID = {};
const PLAY_STYLE_BY_NAME = {};
for (const def of PLAY_STYLE_DEFS){
    PLAY_STYLE_BY_ID[def.id] = def;
    PLAY_STYLE_BY_NAME[def.name] = def;
}
function getPlayStyleEffect(style) {
    // Try by name first, then by id
    const def = PLAY_STYLE_BY_NAME[style] || PLAY_STYLE_BY_ID[style];
    if (def) {
        return {
            name: def.name,
            short: def.short,
            icon: def.icon,
            description: def.description
        };
    }
    return null;
}
function getPlayStyleMatchModifiers(style) {
    const def = PLAY_STYLE_BY_NAME[style] || PLAY_STYLE_BY_ID[style];
    if (def) {
        return {
            ...def.modifiers
        };
    }
    // Return neutral modifiers if style not found
    return {
        pressingBonus: 0,
        passAccuracyBonus: 0,
        staminaDrain: 0,
        tackleBonus: 0,
        possessionBonus: 0,
        counterBonus: 0,
        crossingBonus: 0,
        longBallBonus: 0,
        defenseBonus: 0,
        shotFrequencyBonus: 0,
        shotAccuracyBonus: 0
    };
}
// ─── Position-weighted style assignment ─────────────────────────────────────
// Some styles are more natural for certain positions. This map gives weights
// so that e.g., a defender is more likely to get Catenaccio than Wing Play.
const POSITION_STYLE_WEIGHTS = {
    GK: {
        gegenpressing: 0.3,
        tiki_taka: 0.2,
        catenaccio: 1.0,
        direct_play: 0.5,
        wing_play: 0.1,
        total_football: 0.3,
        route_one: 0.8,
        possession_football: 0.3,
        high_press: 0.2,
        parking_the_bus: 0.8
    },
    DEF: {
        gegenpressing: 0.5,
        tiki_taka: 0.3,
        catenaccio: 1.0,
        direct_play: 0.4,
        wing_play: 0.3,
        total_football: 0.4,
        route_one: 0.6,
        possession_football: 0.4,
        high_press: 0.5,
        parking_the_bus: 1.0
    },
    MID: {
        gegenpressing: 0.8,
        tiki_taka: 1.0,
        catenaccio: 0.3,
        direct_play: 0.5,
        wing_play: 0.5,
        total_football: 0.8,
        route_one: 0.3,
        possession_football: 1.0,
        high_press: 0.7,
        parking_the_bus: 0.2
    },
    FWD: {
        gegenpressing: 0.6,
        tiki_taka: 0.4,
        catenaccio: 0.1,
        direct_play: 0.8,
        wing_play: 0.7,
        total_football: 0.7,
        route_one: 0.5,
        possession_football: 0.3,
        high_press: 0.5,
        parking_the_bus: 0.05
    }
};
function assignRandomPlayStyle(player) {
    // If player already has a style, keep it
    if (player.playStyle) return player;
    const pos = player.position || 'MID';
    const weights = POSITION_STYLE_WEIGHTS[pos] || POSITION_STYLE_WEIGHTS['MID'];
    // Build weighted selection pool
    const pool = [];
    for (const def of PLAY_STYLE_DEFS){
        pool.push({
            style: def,
            weight: weights[def.id] ?? 0.5
        });
    }
    // Weighted random pick
    const totalWeight = pool.reduce((s, p)=>s + p.weight, 0);
    let r = Math.random() * totalWeight;
    let selected = pool[0].style;
    for (const entry of pool){
        r -= entry.weight;
        if (r <= 0) {
            selected = entry.style;
            break;
        }
    }
    return {
        ...player,
        playStyle: selected.name
    };
}
function calculateTeamPlayStyleModifiers(players, teamPlayStyle) {
    // If the team has an explicit tactical play style, use it
    if (teamPlayStyle) {
        return getPlayStyleMatchModifiers(teamPlayStyle);
    }
    // Otherwise, aggregate from individual player styles
    if (players.length === 0) {
        return getPlayStyleMatchModifiers(''); // neutral
    }
    const modifierKeys = [
        'pressingBonus',
        'passAccuracyBonus',
        'staminaDrain',
        'tackleBonus',
        'possessionBonus',
        'counterBonus',
        'crossingBonus',
        'longBallBonus',
        'defenseBonus',
        'shotFrequencyBonus',
        'shotAccuracyBonus'
    ];
    const result = {
        pressingBonus: 0,
        passAccuracyBonus: 0,
        staminaDrain: 0,
        tackleBonus: 0,
        possessionBonus: 0,
        counterBonus: 0,
        crossingBonus: 0,
        longBallBonus: 0,
        defenseBonus: 0,
        shotFrequencyBonus: 0,
        shotAccuracyBonus: 0
    };
    let totalWeight = 0;
    for (const player of players){
        if (!player.playStyle) continue;
        const mods = getPlayStyleMatchModifiers(player.playStyle);
        // Weight by player rating — better players contribute more to team style
        const weight = (player.rating || 60) / 100;
        totalWeight += weight;
        for (const key of modifierKeys){
            result[key] += mods[key] * weight;
        }
    }
    // Normalize by total weight
    if (totalWeight > 0) {
        for (const key of modifierKeys){
            result[key] = result[key] / totalWeight;
        }
    }
    return result;
}
function getAllPlayStyleNames() {
    return PLAY_STYLE_DEFS.map((def)=>({
            id: def.id,
            name: def.name,
            icon: def.icon
        }));
}
}),
"[project]/src/lib/fm/enhancedMatchEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Managerium — Enhanced Match Engine
// =============================================================================
// Comprehensive football match simulation with realistic event generation,
// Turkish commentary, detailed statistics, and player rating calculation.
// =============================================================================
__turbopack_context__.s([
    "applyRoleBonuses",
    ()=>applyRoleBonuses,
    "generateMatchReport",
    ()=>generateMatchReport,
    "matchEngine",
    ()=>matchEngine,
    "runUnifiedMatch",
    ()=>runUnifiedMatch,
    "simulateEnhancedMatch",
    ()=>simulateEnhancedMatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/injuryManager.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/positionEffectiveness.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/referee.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$matchCommentaryGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/matchCommentaryGenerator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$tacticsRoles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/tacticsRoles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traitsData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playStyles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/constants.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
// =============================================================================
// Unified Commentary Bridge
// Bridges enhancedMatchEngine's internal event types to the trait-based
// matchCommentaryGenerator system. All matches now use rich, contextual,
// trait-aware commentary regardless of which component renders the events.
// =============================================================================
function generateRichCommentary(type, player, secondaryPlayer, minute) {
    try {
        // Map enhancedMatchEngine event types to matchCommentaryGenerator event types
        const eventTypeMap = {
            'goal': 'GOAL',
            'shot_saved': 'COMMENTARY',
            'shot_wide': 'COMMENTARY',
            'shot_post': 'COMMENTARY',
            'foul': 'COMMENTARY',
            'yellow_card': 'YELLOW',
            'red_card': 'RED',
            'corner': 'CORNER',
            'free_kick': 'COMMENTARY',
            'penalty': 'COMMENTARY',
            'offside': 'OFFSIDE',
            'substitution': 'SUB',
            'injury': 'INJURY',
            'save': 'COMMENTARY',
            'tackle': 'COMMENTARY',
            'interception': 'COMMENTARY',
            'chance': 'COMMENTARY',
            'var_review': 'COMMENTARY',
            'goal_overturned': 'COMMENTARY'
        };
        const commentaryEventType = eventTypeMap[type] || 'COMMENTARY';
        const p = player.player;
        const traits = p.traits || [];
        const negTraits = p.negTraits || [];
        const personality = p.personalityTraits || [];
        const ctx = {
            eventType: commentaryEventType,
            playerName: p.name,
            team: player.team === 'home' ? 'HOME' : 'AWAY',
            minute,
            homeScore: type === 'goal' ? player.team === 'home' ? 1 : 0 : undefined,
            awayScore: type === 'goal' ? player.team === 'away' ? 1 : 0 : undefined,
            playerTraits: traits,
            playerNegTraits: negTraits,
            playerPersonality: personality,
            assistPlayerName: secondaryPlayer?.player.name,
            detail: type === 'substitution' && secondaryPlayer ? `${secondaryPlayer.player.name} çıkıyor, ${p.name} giriyor` : undefined
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$matchCommentaryGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCommentary"])(ctx);
        return result.text;
    } catch (err) {
        // Fallback: simple commentary if the generator fails
        const p = player.player.name;
        switch(type){
            case 'goal':
                return `${minute}. dakikada ${p} golü buldu!`;
            case 'yellow_card':
                return `${minute}. dakikada ${p} sarı kart gördü.`;
            case 'red_card':
                return `${minute}. dakikada kırmızı kart! ${p} oyundan atıldı!`;
            case 'injury':
                return `${minute}. dakikada ${p} sakatlık geçirdi.`;
            case 'substitution':
                return `${minute}. dakikada değişiklik. ${secondaryPlayer?.player.name || 'Oyuncu'} çıkıyor, ${p} giriyor.`;
            case 'offside':
                return `${minute}. dakikada ofsayt.`;
            case 'corner':
                return `${minute}. dakikada korner.`;
            default:
                return `${minute}. dakikada ${p} bir olaya dahil oldu.`;
        }
    }
}
// =============================================================================
// Utility helpers
// =============================================================================
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function rand(min, max) {
    return min + Math.random() * (max - min);
}
function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function weightedPick(items) {
    const totalWeight = items.reduce((s, i)=>s + i.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of items){
        r -= item.weight;
        if (r <= 0) return item;
    }
    return items[items.length - 1];
}
function getAttr(p, attr, fallback = 50) {
    const val = p[attr];
    return typeof val === 'number' ? val : fallback;
}
function positionGroup(p) {
    return p.position;
}
function isPosition(p, group) {
    return p.position === group;
}
// =============================================================================
// Team Strength Calculation
// =============================================================================
function calculateTeamStrength(players, tactic) {
    // ── Pozisyon bazlı etkinlik hesaplama ──
    // Her oyuncunun specificPosition'ına göre etkinlik puanını hesapla
    // ve geniş grup (GK/DEF/MID/FWD) bazlı kadro oluşturma
    const forwards = players.filter((p)=>isPosition(p, 'FWD'));
    const midfielders = players.filter((p)=>isPosition(p, 'MID'));
    const defenders = players.filter((p)=>isPosition(p, 'DEF'));
    const goalkeepers = players.filter((p)=>isPosition(p, 'GK'));
    // ── Pozisyon-etkinlik duyarlı rating hesaplama ──
    // Her oyuncunun effectiveRating'ini kullan: rating × (0.7 + 0.3 × effectiveness)
    // Bu sayede CDM ve CAM aynı MID grubunda olsa bile farklı katkı yapar
    const weightedRating = (group, ...attrs)=>{
        if (group.length === 0) return 0;
        return group.reduce((sum, p)=>{
            // Pozisyon etkinlik puanını hesapla
            const effectiveness = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionEffectiveness"])(p, p.specificPosition || p.position);
            const effectiveRating = (p.rating || 50) * (0.7 + 0.3 * effectiveness);
            let attrSum = 0;
            for (const a of attrs)attrSum += getAttr(p, a, 50);
            const avg = attrs.length > 0 ? attrSum / attrs.length : effectiveRating;
            const moraleMod = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_BASE"] + p.morale / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_VAR"];
            const formMod = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_BASE"] + p.form / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_VAR"];
            const condMod = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_BASE"] + p.cond / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_VAR"];
            // Nitelik ortalaması ile effectiveRating'i harmanla
            // %60 nitelikler + %40 pozisyon etkinliği
            const blended = attrs.length > 0 ? avg * 0.6 + effectiveRating * 0.4 : effectiveRating;
            return sum + blended * moraleMod * formMod * condMod;
        }, 0) / group.length;
    };
    const attack = weightedRating(forwards, 'finishing', 'shooting', 'speed', 'dribbling', 'offTheBall');
    const midfield = weightedRating(midfielders, 'passing', 'vision', 'control', 'stamina', 'technique');
    const defense = weightedRating(defenders, 'tackling', 'marking', 'positioning', 'strength', 'anticipation');
    const gk = goalkeepers.length > 0 ? weightedRating(goalkeepers, 'goalkeeping', 'reflexes', 'positioning', 'composure', 'concentration') : weightedRating(goalkeepers, 'goalkeeping');
    // Tactic modifiers
    let tacticMod = 1.0;
    // Mentality 1-5 scale
    if (tactic.mentality >= 4) tacticMod += (tactic.mentality - 3) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_MENTALITY_BONUS"];
    else if (tactic.mentality <= 2) tacticMod -= (3 - tactic.mentality) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_MENTALITY_PENALTY"];
    // Pressing bonus
    if (tactic.pressing) tacticMod += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_PRESSING_BONUS"];
    // Intensity
    if (tactic.intensity === 'high') tacticMod += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_HIGH_INTENSITY_BONUS"];
    else if (tactic.intensity === 'low') tacticMod -= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_LOW_INTENSITY_PENALTY"];
    // Aggression
    tacticMod += (tactic.aggression - __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_AGGRESSION_BASELINE"]) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TACTIC_AGGRESSION_SCALE"];
    // ── Formasyon bazlı ağırlık modifikatörleri ──────────────────────────
    const formationKey = tactic.formation || tactic.tactic_type || '4-4-2';
    const fmod = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FORMATION_MODS"][formationKey] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FORMATION_MODS"]['4-4-2'];
    return {
        overall: (attack * fmod.attack * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_ATTACK"] + midfield * fmod.midfield * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_MIDFIELD"] + defense * fmod.defense * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_DEFENSE"] + gk * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_GK"]) * tacticMod,
        attack: attack * fmod.attack * tacticMod,
        midfield: midfield * fmod.midfield * tacticMod,
        defense: defense * fmod.defense * tacticMod,
        gk: gk
    };
}
// =============================================================================
// Commentary Generation (Turkish)
// =============================================================================
const COMMENTARY = {
    goal: {
        normal: [
            (p, a, m)=>`${m}. dakikada ${a}'ın mükemmel pasıyla ${p} golü buldu! Tribünler yerinden oynadı!`,
            (p, a, m)=>`${m}. dakikada harika bir organizasyon! ${a} topu ${p}'e aktardı ve fileler heyecanla sallandı!`,
            (p, a, m)=>`${m}. dakikada ${a}'ın kilit pasıyla ${p} şık bir vuruşla takımını öne geçirdi!`,
            (p, a, m)=>`${m}. dakikada muazzam bir hücum! ${a} serbest kalıp ${p}'e topu bıraktı, neticesi gol!`,
            (p, a, m)=>`${m}. dakikada ${a}'ın görkemli pası ve ${p}'in harika bitirişi! Seyirciler coştu!`
        ],
        solo: [
            (p, m)=>`${m}. dakikada ${p} tek başına sahneye çıktı! Müthiş bir çalımla defansı geçip golü buldu!`,
            (p, m)=>`${m}. dakikada ${p} kendi çabasıyla topu kaptı, orta sahaya dek koştu ve ağları buldu!`,
            (p, m)=>`${m}. dakikada ${p}'in bireysel şaheseri! Birkaç oyuncuyu ezip geçti ve kalecinin solundan topu ağlara gönderdi!`
        ],
        header: [
            (p, a, m)=>`${m}. dakikada kornere çıkan ${a} ortasını yaptı, ${p} havada asılı kaldı ve kafa golüyle takımını mutlu etti!`,
            (p, a, m)=>`${m}. dakikada ${a}'in muhteşem ortasına ${p} yükseldi ve kafayla topu ağlara gönderdi!`
        ],
        longShot: [
            (p, m)=>`${m}. dakikada ${p} ceza sahası dışından harika bir şut attı! Top köşeden ağlarla buluştu! Uzaktan şut specialization!`,
            (p, m)=>`${m}. dakikada müthiş bir şut geldi! ${p} yaklaşık 25 metreden fileleri buldu! Kaleci şaşkınlık içinde kaldı!`
        ],
        penalty: [
            (p, m)=>`${m}. dakikada penaltı vuruşunu kullanan ${p} topu ağlara gönderdi! Soğukkanlı bir vuruş!`
        ],
        freeKick: [
            (p, m)=>`${m}. dakikada ${p} serbest vuruşu mükemmel kullandı! Top barajın üzerinden kavis yapıp ağlarla buluştu!`
        ],
        counter: [
            (p, a, m)=>`${m}. dakikada nefes kesen bir kontra atak! ${a} topu hemen ileri attı, ${p} kaleciyle karşı karşıya golü buldu!`
        ],
        lateGoal: [
            (p, a, m)=>`${m}. dakikada son anlarda dramatik bir gol! ${a}'ın pasıyla ${p} maçın kaderini değiştirdi! İnanılmaz bir son!`
        ]
    },
    shot_saved: [
        (p, gk, m)=>`${m}. dakikada ${p} sert vurdu ama kaleci ${gk} harika bir refleksle topu kornere çeldi!`,
        (p, gk, m)=>`${m}. dakikada ${p}'in güçlü şutunu ${gk} çift yumrukla uzaklaştırdı! Müthiş bir kurtarış!`,
        (p, gk, m)=>`${m}. dakikada ${p} kaleyi test etti ama ${gk} yatarak topu kurtardı!`,
        (p, gk, m)=>`${m}. dakikada ${p} şık bir vuruş yaptı, ${gk} köşeyi iyi okuyup topu tuttu!`,
        (p, gk, m)=>`${m}. dakikada ${p}'in plase şutunu ${gk} parmak ucuyla kornere attı! Çok yakın!`
    ],
    shot_wide: [
        (p, m)=>`${m}. dakikada ${p} şut attı ama top auta gitti. Fırsat kaçtı.`,
        (p, m)=>`${m}. dakikada ${p}'in şutu az farkla kaleyi bulmadı! İzleyiciler derin bir nefes aldı.`,
        (p, m)=>`${m}. dakikada ${p} vurdu ama direk dibinden dışarı çıktı!`,
        (p, m)=>`${m}. dakikada ${p} iyi bir pozisyon yakaladı ama vuruşu kalibrasyon eksikliğiyle auta gitti.`
    ],
    shot_post: [
        (p, m)=>`${m}. dakikada ${p} harika vurdu ama top direkten döndü! Kaçan gol!`,
        (p, m)=>`${m}. dakikada ${p} inanılmaz bir şut çekti, kaleci çaresiz kalırken top direkten geri geldi!`,
        (p, m)=>`${m}. dakikada ${p}'in şutu kalecinin üzerinden auta çarptı! Canhıraç bir an!`
    ],
    foul: [
        (p, m)=>`${m}. dakikada ${p} sert bir müdahale yaptı ve hakem faul düdüğü çaldı.`,
        (p, m)=>`${m}. dakikada ${p} top mücadelesinde rakibine faul yaptı.`,
        (p, m)=>`${m}. dakikada sert bir girişim! ${p} rakibini yere düşürdü, hakem durumu değerlendiriyor.`,
        (p, m)=>`${m}. dakikada ${p} pozisyon mücadelesinde hücuma engel oldu ama faul gerekçesiyle oyun durdu.`
    ],
    yellow_card: [
        (p, m)=>`${m}. dakikada ${p} sarı kart gördü! Ciddi bir ihlal, hakem cebine el attı.`,
        (p, m)=>`${m}. dakikada ${p}'in tehlikeli müdahalesi sarı kartla sonuçlandı. Bu oyuncu dikkatli olmalı!`,
        (p, m)=>`${m}. dakikada taktiksel bir faul! ${p} sarı kart gördü, takımını organize olmaya çağırıyor.`,
        (p, m)=>`${m}. dakikada ${p} aşırı agresif bir müdahale yaptı ve sarı kart cezasını gördü.`
    ],
    red_card: [
        (p, m)=>`${m}. dakikada kırmızı kart! ${p} sahadan ihraç edildi! Takımı 10 kişi kaldı!`,
        (p, m)=>`${m}. dakikada ${p} son çare bir faul yaptı ve hakem doğrudan kırmızı kartı gösterdi!`
    ],
    corner: [
        (p, m)=>`${m}. dakikada ${p}'in şutunu savunma kornere çeldi. Korner kullanılacak.`,
        (p, m)=>`${m}. dakikada ${p} kanattan getirdi ama savunma topu uzaklaştırdı. Korner.`
    ],
    free_kick: [
        (p, m)=>`${m}. dakikada ${p} tehlikeli bir bölgede faul yaptı. Serbest vuruş kullanılacak.`,
        (p, m)=>`${m}. dakikada ${p} serbest vuruş kazandı. Top tehlikeli bölgede duruyor.`
    ],
    penalty: [
        (p, m)=>`${m}. dakikada ceza sahası içinde faul! Penaltı! ${p} penaltı kazandırdı!`
    ],
    offside: [
        (p, m)=>`${m}. dakikada ${p} ofsayt pozisyonunda kaldı. Bayrak yukarıda.`,
        (p, m)=>`${m}. dakikada güzel bir koşu ama ${p} ofsayt çizgisini geçmiş. Oyun durdu.`
    ],
    injury: [
        (p, m)=>`${m}. dakikada ${p} sakatlık durumuyla yerde kaldı. Sağlık ekibi sahaya giriyor.`,
        (p, m)=>`${m}. dakikada kötü bir düşme! ${p} ağrı içinde yerde. Maç duraksadı.`
    ],
    save: [
        (p, m)=>`${m}. dakikada kaleci ${p} inanılmaz bir kurtarış yaptı! Topu çeliştirip kornere attı!`,
        (p, m)=>`${m}. dakikada ${p} altı pasta devleşti! Müthiş bir refleks!`,
        (p, m)=>`${m}. dakikada yakın mesafe şutunu ${p} muhteşem bir şekilde kurtardı!`
    ],
    tackle: [
        (p, m)=>`${m}. dakikada ${p} mükemmel bir top kapma ile hücumu önledi!`,
        (p, m)=>`${m}. dakikada ${p} zamanlamasını harika ayarladı ve topu rakibin ayağından aldı!`,
        (p, m)=>`${m}. dakikada kritik bir müdahale! ${p} kanarya bir kalkan gibi savunmaya yardımcı oldu.`
    ],
    interception: [
        (p, m)=>`${m}. dakikada ${p} pas yolunu kesti! Harika bir önsezi.`,
        (p, m)=>`${m}. dakikada ${p} rakibin pasını okudu ve topu kaptı. Akıllıca bir pozisyon alma.`
    ],
    chance: [
        (p, m)=>`${m}. dakikada ${p} büyük bir fırsat yakaladı! Kaleciyle karşı karşıya kaldı!`,
        (p, m)=>`${m}. dakikada ${p} ceza sahasına girdi, tehlikeli bir pozisyon!`,
        (p, m)=>`${m}. dakikada muazzam bir pas! ${p} vuruş hazırlığı yapıyor!`
    ],
    var_review: [
        (p, m)=>`${m}. dakikada VAR incelemesi! Hakem monitöre gidiyor. ${p} ile ilgili pozisyon inceleniyor...`,
        (p, m)=>`${m}. dakikada şüpheli pozisyon! VAR hakemi uyarıyor, ${p} olayı değerlendiriliyor.`
    ],
    goal_overturned: [
        (p, m)=>`${m}. dakikada VAR incelemesi sonucu gol İPTAL EDİLDİ! ${p} ofsayttaydı!`,
        (p, m)=>`${m}. dakikada gol iptal! VAR incelemesinde ${p}'in pozisyonu düdüğü bozdu.`
    ],
    substitution: [
        (outP, inP, m)=>`${m}. dakikada değişiklik! ${outP} oyundan çıkıyor, ${inP} sahaya giriyor.`
    ],
    momentumStart: [
        (m)=>`${m}. dakikada tempolar yükseldi, atak yoğunluğu artıyor.`,
        (m)=>`${m}. dakikada oyunun kontrolü bir elden diğerine geçiyor.`,
        (m)=>`${m}. dakikada baskı artıyor, savunma altında kalan takım zor anlar yaşıyor.`
    ],
    weatherComment: {
        rain: [
            'Yağmur yağmaya devam ediyor. Zemin kaygan, pas hataları artabilir.',
            'Sağanak yağış altında zorlu bir oyun. Oyuncuların ayakkabı tutuşu azaldı.'
        ],
        snow: [
            'Kar yağışı sahayı kaplamaya başladı. Oyun yavaşladı.',
            'Zemin buz gibi! Oyuncular top kontrolunde zorlanıyor.'
        ],
        windy: [
            'Rüzgar maçın görünmez oyuncusu bugün. Top beklenmeyen yönlerde savruluyor.',
            'Kuvvetli rüzgar topun uçuşunu etkiliyor, uzak şutlar riske giriyor.'
        ],
        sunny: [
            'Güneşli bir gün, harika futbol havası! Oyuncular keyifli oynuyor.',
            'Mükemmel hava koşulları, zemin futbol için ideal.'
        ]
    },
    halftime: [
        'İlk yarı sona erdi. Hakem düdüğü çaldı.',
        'İlk 45 dakika geride kaldı. Takımlar soyunma odasına gidiyor.'
    ],
    fulltime: [
        'Maç sona erdi! Hakem son düdüğü çaldı.',
        '90 dakika tamamlandı! Taraftarlar ellerini alkışla ovuşturuyor.'
    ]
};
function generateGoalCommentary(scorer, assister, minute, eventDetail) {
    const p = scorer.player.name;
    const a = assister ? assister.player.name : 'takım arkadaşı';
    const detail = minute >= 85 ? 'lateGoal' : eventDetail;
    // Solo / penalty / freeKick / longShot don't need an assister name
    if (!assister || detail === 'solo' || detail === 'penalty' || detail === 'freeKick' || detail === 'longShot') {
        const soloTemplates = {
            solo: COMMENTARY.goal.solo,
            penalty: COMMENTARY.goal.penalty,
            freeKick: COMMENTARY.goal.freeKick,
            longShot: COMMENTARY.goal.longShot
        };
        const tpls = soloTemplates[detail];
        if (tpls) return pick(tpls)(p, minute);
    }
    // All other goal types use (p, a, m) signature
    const duoTemplates = {
        normal: COMMENTARY.goal.normal,
        header: COMMENTARY.goal.header,
        counter: COMMENTARY.goal.counter,
        lateGoal: COMMENTARY.goal.lateGoal
    };
    const tpls = duoTemplates[detail] ?? duoTemplates.normal;
    return pick(tpls)(p, a, minute);
}
function generateEventCommentary(type, player, minute, secondaryPlayer) {
    const p = player.player.name;
    switch(type){
        case 'shot_saved':
            return pick(COMMENTARY.shot_saved)(p, secondaryPlayer?.player.name || 'kaleci', minute);
        case 'shot_wide':
            return pick(COMMENTARY.shot_wide)(p, minute);
        case 'shot_post':
            return pick(COMMENTARY.shot_post)(p, minute);
        case 'foul':
            return pick(COMMENTARY.foul)(p, minute);
        case 'yellow_card':
            return pick(COMMENTARY.yellow_card)(p, minute);
        case 'red_card':
            return pick(COMMENTARY.red_card)(p, minute);
        case 'corner':
            return pick(COMMENTARY.corner)(p, minute);
        case 'free_kick':
            return pick(COMMENTARY.free_kick)(p, minute);
        case 'penalty':
            return pick(COMMENTARY.penalty)(p, minute);
        case 'offside':
            return pick(COMMENTARY.offside)(p, minute);
        case 'injury':
            return pick(COMMENTARY.injury)(p, minute);
        case 'save':
            return pick(COMMENTARY.save)(p, minute);
        case 'tackle':
            return pick(COMMENTARY.tackle)(p, minute);
        case 'interception':
            return pick(COMMENTARY.interception)(p, minute);
        case 'chance':
            return pick(COMMENTARY.chance)(p, minute);
        case 'substitution':
            return pick(COMMENTARY.substitution)(p, secondaryPlayer?.player.name || 'yedek oyuncu', minute);
        default:
            return `${minute}. dakikada ${p} bir olaya dahil oldu.`;
    }
}
// =============================================================================
// Pitch Coordinate Generation
// =============================================================================
function getPitchCoords(team, position, type) {
    // x: 0 = home goal, 100 = away goal; y: 0 = left touchline, 100 = right touchline
    const attacking = team === 'home';
    const baseX = ()=>{
        switch(type){
            case 'goal':
            case 'shot_saved':
            case 'shot_wide':
            case 'shot_post':
            case 'chance':
                return attacking ? rand(78, 92) : rand(8, 22);
            case 'save':
                return attacking ? rand(3, 12) : rand(88, 97);
            case 'foul':
            case 'yellow_card':
            case 'red_card':
            case 'free_kick':
                return rand(30, 70);
            case 'corner':
                return attacking ? rand(95, 99) : rand(1, 5);
            case 'tackle':
            case 'interception':
                return attacking ? rand(30, 60) : rand(40, 70);
            default:
                return rand(25, 75);
        }
    };
    const baseY = ()=>{
        const side = Math.random() > 0.5 ? 1 : 0;
        if (type === 'corner') return side === 0 ? rand(1, 5) : rand(95, 99);
        switch(position){
            case 'GK':
                return rand(38, 62);
            case 'DEF':
                return side === 0 ? rand(15, 40) : rand(60, 85);
            case 'MID':
                return rand(25, 75);
            case 'FWD':
                return side === 0 ? rand(25, 55) : rand(45, 75);
            default:
                return rand(20, 80);
        }
    };
    return {
        x: clamp(Math.round(baseX()), 0, 100),
        y: clamp(Math.round(baseY()), 0, 100)
    };
}
function getWeatherModifiers(weather) {
    const mods = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WEATHER_MODIFIERS"][weather] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WEATHER_MODIFIERS"]['sunny'];
    return {
        ...mods,
        description: weather === 'rainy' ? pick(COMMENTARY.weatherComment.rain) : weather === 'snowy' ? pick(COMMENTARY.weatherComment.snow) : weather === 'windy' ? pick(COMMENTARY.weatherComment.windy) : pick(COMMENTARY.weatherComment.sunny)
    };
}
function getEventProbabilities(state, teamStrength, oppositionStrength, weatherMods, minute, isAttacking) {
    const p = state.player;
    const pos = positionGroup(p);
    const specPos = p.specificPosition || pos; // Spesifik pozisyon (CDM, CAM, CB vb.)
    let shot = 0;
    let tackle = 0;
    let interception = 0;
    let foul = 0;
    let chance = 0;
    let save = 0;
    const fatigueMod = state.currentCond < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_COND_THRESHOLDS"].low ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_COND_MODS"].low : state.currentCond < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_COND_THRESHOLDS"].mid ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_COND_MODS"].mid : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_COND_MODS"].full;
    const moraleMod = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_BASE"] + p.morale / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_MOD_VAR"];
    // Late game fatigue accumulation
    const fatigueMinute = minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_MINUTE_THRESHOLDS"].late ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_MINUTE_MODS"].late : minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_MINUTE_THRESHOLDS"].mid ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_MINUTE_MODS"].mid : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FATIGUE_MINUTE_MODS"].fresh;
    const effectiveMod = fatigueMod * moraleMod * fatigueMinute;
    // Pozisyon etkinlik puanı — spesifik mevkideki gerçek etkinlik
    const effectiveness = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionEffectiveness"])(p, specPos);
    if (isAttacking) {
        if (pos === 'FWD') {
            // ST, CF, LW, RW için farklı ağırlıklar
            const isWinger = specPos === 'LW' || specPos === 'RW';
            const isCF = specPos === 'CF';
            const shotAttr = isWinger ? 'dribbling' : isCF ? 'passing' : 'finishing';
            shot = clamp(getAttr(p, shotAttr) / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.shotMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.shotMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.shotMax);
            chance = clamp(getAttr(p, 'offTheBall') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.chanceMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.chanceMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.chanceMax);
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].FWD.foul;
        } else if (pos === 'MID') {
            // CDM, CM, CAM, LM, RM, LW, RW için farklı ağırlıklar
            const isCDM = specPos === 'CDM';
            const isCAM = specPos === 'CAM';
            const isWinger = specPos === 'LM' || specPos === 'RM' || specPos === 'LW' || specPos === 'RW';
            // CDM: daha çok savunma odaklı, az şut; CAM: daha çok şut ve chance
            if (isCDM) {
                shot = clamp(getAttr(p, 'longShots') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMultiplier * effectiveMod * effectiveness * 0.5, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMax * 0.6);
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 1.3, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMax * 1.3);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 1.2, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMax * 1.2);
                chance = clamp(getAttr(p, 'vision') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMultiplier * effectiveMod * effectiveness * 0.6, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMax * 0.7);
            } else if (isCAM) {
                shot = clamp(getAttr(p, 'longShots') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMultiplier * effectiveMod * effectiveness * 1.3, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMax * 1.3);
                chance = clamp(getAttr(p, 'vision') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMultiplier * effectiveMod * effectiveness * 1.4, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMax * 1.4);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 0.5, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMax * 0.6);
            } else if (isWinger) {
                shot = clamp(getAttr(p, 'crossing') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMultiplier * effectiveMod * effectiveness * 1.1, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMax * 1.1);
                chance = clamp(getAttr(p, 'dribbling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMultiplier * effectiveMod * effectiveness * 1.2, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMax * 1.2);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 0.7, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMax * 0.7);
            } else {
                // CM (standart)
                shot = clamp(getAttr(p, 'longShots') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.shotMax);
                chance = clamp(getAttr(p, 'vision') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMax);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.interceptionMax);
            }
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.foul;
        } else if (pos === 'DEF') {
            // CB, LB, RB, LWB, RWB için farklı ağırlıklar
            const isFullback = specPos === 'LB' || specPos === 'RB';
            const isWingback = specPos === 'LWB' || specPos === 'RWB';
            if (isFullback || isWingback) {
                // Bekler: daha çok top taşıma ve cross
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMultiplier * effectiveMod * effectiveness * 0.8, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMax * 0.9);
                chance = clamp(getAttr(p, 'crossing') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMultiplier * effectiveMod * effectiveness * 0.4, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].MID.chanceMax * 0.4);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMultiplier * effectiveMod * effectiveness * 0.9, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMax * 0.9);
            } else {
                // CB (standart)
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.tackleMax);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.interceptionMax);
            }
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].DEF.foul;
        } else if (pos === 'GK') {
            save = clamp(getAttr(p, 'goalkeeping') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].GK.saveMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].GK.saveMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTACK_PROBS"].GK.saveMax);
        }
    } else {
        // Defending phase
        if (pos === 'DEF') {
            const isFullback = specPos === 'LB' || specPos === 'RB';
            const isWingback = specPos === 'LWB' || specPos === 'RWB';
            if (isFullback || isWingback) {
                // Bekler: daha çok top kazanma, az interception
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMultiplier * effectiveMod * effectiveness * 0.9, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMax * 0.95);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMultiplier * effectiveMod * effectiveness * 0.8, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMax * 0.85);
            } else {
                // CB (standart)
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.tackleMax);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.interceptionMax);
            }
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].DEF.foul;
        } else if (pos === 'MID') {
            const isCDM = specPos === 'CDM';
            const isCAM = specPos === 'CAM';
            if (isCDM) {
                // CDM: savunma fazında çok etkili
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMultiplier * effectiveMod * effectiveness * 1.3, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMax * 1.3);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 1.3, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMax * 1.3);
            } else if (isCAM) {
                // CAM: savunma fazında az etkili
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMultiplier * effectiveMod * effectiveness * 0.5, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMax * 0.6);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness * 0.5, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMax * 0.6);
            } else {
                // CM (standart)
                tackle = clamp(getAttr(p, 'tackling') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.tackleMax);
                interception = clamp(getAttr(p, 'anticipation') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.interceptionMax);
            }
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].MID.foul;
        } else if (pos === 'GK') {
            save = clamp(getAttr(p, 'goalkeeping') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].GK.saveMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].GK.saveMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].GK.saveMax);
        } else if (pos === 'FWD') {
            interception = clamp(getAttr(p, 'aggression') / 100 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].FWD.interceptionMultiplier * effectiveMod * effectiveness, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].FWD.interceptionMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].FWD.interceptionMax);
            foul = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFEND_PROBS"].FWD.foul;
        }
    }
    // Strength ratio modifier
    const strengthRatio = teamStrength / (teamStrength + oppositionStrength);
    if (isAttacking) {
        shot *= strengthRatio * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STRENGTH_RATIO"].attackShot;
        chance *= strengthRatio * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STRENGTH_RATIO"].attackChance;
    } else {
        tackle *= (1 - strengthRatio) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STRENGTH_RATIO"].defendTackle;
        save *= (1 - strengthRatio) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STRENGTH_RATIO"].defendSave;
    }
    // Weather modifiers
    shot *= weatherMods.shootingMod;
    tackle *= weatherMods.tacklingMod;
    // Tactic aggression modifier
    foul *= 1.0; // Will be modified by team tactic externally
    return {
        shot: clamp(shot, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].shot),
        tackle: clamp(tackle, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].tackle),
        interception: clamp(interception, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].interception),
        foul: clamp(foul, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].foul),
        chance: clamp(chance, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].chance),
        save: clamp(save, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].save)
    };
}
// =============================================================================
// Trait Engine Effect System
// =============================================================================
// Trait'lerin maç motoru olasılıklarına (goalChance, probs) etkisini hesaplar.
// Sadece engineEffect alanına sahip veya level'e sahip pozitif traitler ve
// penalty alanına sahip negatif traitler motoru etkiler.
// Her trait'in goalChance üzerindeki etkisi maksimum ±0.03 ile sınırlıdır.
const TRAIT_EFFECT_CAP = 0.03; // Maksimum ±0.03 goalChance değişimi per trait
// Level bazlı varsayılan engineWeight (trait'in kendi engineEffect'i yoksa)
const DEFAULT_ENGINE_WEIGHT = {
    MOR: 0.04,
    ALTIN: 0.035,
    LACIVERT: 0.03,
    BEYAZ: 0.025
};
const OFFENSIVE_CATEGORIES = new Set([
    'forvet',
    'orta_saha'
]);
// Build lookup maps once (lazy, first match call triggers build)
const traitLookupMap = new Map();
const negTraitPenaltyMap = new Map();
let traitLookupBuilt = false;
function ensureTraitLookup() {
    if (traitLookupBuilt) return;
    traitLookupBuilt = true;
    for (const [category, data] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRAITS_DATA"])){
        const catData = data;
        const isOffensive = OFFENSIVE_CATEGORIES.has(category);
        if (catData.pozitif && Array.isArray(catData.pozitif)) {
            for (const trait of catData.pozitif){
                let engineWeight;
                // Öncelikle trait'in kendi engineEffect'i kullanılır
                if (trait.engineEffect) {
                    engineWeight = trait.engineEffect.engineWeight;
                } else if (trait.level && DEFAULT_ENGINE_WEIGHT[trait.level]) {
                    // engineEffect yoksa level bazlı varsayılan kullanılır
                    engineWeight = DEFAULT_ENGINE_WEIGHT[trait.level];
                }
                if (engineWeight !== undefined) {
                    const info = {
                        engineWeight,
                        category,
                        isOffensive,
                        counterFor: trait.counterFor
                    };
                    const existing = traitLookupMap.get(trait.name) || [];
                    existing.push(info);
                    traitLookupMap.set(trait.name, existing);
                }
            }
        }
        if (catData.negatif && Array.isArray(catData.negatif)) {
            for (const trait of catData.negatif){
                if (trait.penalty) {
                    negTraitPenaltyMap.set(trait.name, trait.penalty);
                }
            }
        }
    }
}
/**
 * Trait ismini pozisyon grubuna göre çözümler.
 * Aynı isimli trait farklı kategorilerde farklı anlama gelebilir
 * (örn: "Ofsayt ustası" hem defans hem forvette var).
 */ function resolveTraitInfo(traitName, playerPosGroup) {
    const infos = traitLookupMap.get(traitName);
    if (!infos || infos.length === 0) return undefined;
    // Tek eşleşme varsa direkt döndür
    if (infos.length === 1) return infos[0];
    // Çoklu eşleşme: oyuncunun pozisyon grubuna göre en uygun olanı seç
    if (playerPosGroup === 'FWD' || playerPosGroup === 'MID') {
        return infos.find((i)=>i.isOffensive) || infos[0];
    } else {
        return infos.find((i)=>!i.isOffensive) || infos[0];
    }
}
/**
 * Saldıran oyuncunun trait'lerinin goalChance'e etkisini uygular.
 * Ofansif traitler (forvet/orta_saha) goalChance'i artırır:
 *   goalChance *= (1 + engineWeight)
 * Defansif traitler hücumda yarı etkiyle goalChance'i düşürür:
 *   goalChance *= (1 - engineWeight * 0.5)
 * Negatif traitler penalty alanına göre küçük ceza uygular:
 *   goalChance *= (1 - 0.01 * penaltyMagnitude / 10)
 * Her trait'in etkisi ±0.03 absolute change ile sınırlıdır.
 */ function applyAttackerTraitEffects(goalChance, attacker) {
    ensureTraitLookup();
    const traits = attacker.player.traits || [];
    const negTraits = attacker.player.negTraits || [];
    const posGroup = positionGroup(attacker.player);
    // Pozitif trait etkileri
    for (const traitName of traits){
        const info = resolveTraitInfo(traitName, posGroup);
        if (!info) continue;
        const prevGoalChance = goalChance;
        if (info.isOffensive) {
            // Ofansif trait (forvet/orta_saha) → goalChance artır
            goalChance *= 1 + info.engineWeight;
        } else {
            // Defansif trait hücumda → goalChance hafif düşür (yarım etki)
            goalChance *= 1 - info.engineWeight * 0.5;
        }
        // Her trait'in goalChance değişimi ±0.03 ile sınırlı
        const delta = goalChance - prevGoalChance;
        if (Math.abs(delta) > TRAIT_EFFECT_CAP) {
            goalChance = prevGoalChance + Math.sign(delta) * TRAIT_EFFECT_CAP;
        }
    }
    // Negatif trait etkileri — penalty alanından küçük ceza
    for (const traitName of negTraits){
        const penalty = negTraitPenaltyMap.get(traitName);
        if (!penalty) continue;
        const penaltyValues = Object.values(penalty);
        const avgMagnitude = penaltyValues.reduce((sum, v)=>sum + Math.abs(v), 0) / penaltyValues.length;
        // penaltyMagnitude / 10 oranında küçük ceza (örn: penalty -10 → 0.01 azalma)
        const prevGoalChance = goalChance;
        goalChance *= 1 - 0.01 * avgMagnitude / 10;
        // ±0.03 sınırı
        const delta = goalChance - prevGoalChance;
        if (Math.abs(delta) > TRAIT_EFFECT_CAP) {
            goalChance = prevGoalChance - Math.min(TRAIT_EFFECT_CAP, Math.abs(delta));
        }
    }
    return goalChance;
}
/**
 * Savunan takımın kaleci/defans oyuncularının trait'lerinin
 * probs.save ve probs.tackle değerlerine etkisini uygular.
 * Kaleci traitleri probs.save'i artırır.
 * Defans traitleri probs.tackle'ı artırır.
 * engineWeight olmayan traitler atlanır.
 */ function applyDefenderTraitEffects(probs, defendingGK, defendingDefender) {
    ensureTraitLookup();
    // Kaleci trait'leri → probs.save
    if (defendingGK) {
        const traits = defendingGK.player.traits || [];
        for (const traitName of traits){
            const info = resolveTraitInfo(traitName, 'GK');
            if (!info) continue;
            // Kaleci veya defansif trait → save olasılığını artır
            if (info.category === 'kaleci' || !info.isOffensive) {
                probs.save *= 1 + info.engineWeight;
                probs.save = clamp(probs.save, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].save);
            }
        }
    }
    // Defans oyuncusu trait'leri → probs.tackle
    if (defendingDefender) {
        const traits = defendingDefender.player.traits || [];
        for (const traitName of traits){
            const info = resolveTraitInfo(traitName, 'DEF');
            if (!info) continue;
            // Defansif trait → tackle olasılığını artır
            if (!info.isOffensive) {
                probs.tackle *= 1 + info.engineWeight;
                probs.tackle = clamp(probs.tackle, 0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROB_CAPS"].tackle);
            }
        }
    }
}
function simulateEnhancedMatch(homePlayers, awayPlayers, homeTactic, awayTactic, options) {
    // ── Pozisyon etkinlik cache'ini temizle (yeni maç) ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearEffectivenessCache"])();
    // ── Pre-match Setup ─────────────────────────────────────────────────────
    const weather = options?.weather ?? pick(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WEATHER_DISTRIBUTION"]);
    const weatherMods = getWeatherModifiers(weather);
    // Initialize mutable player states
    const createMutableState = (players, team)=>{
        return players.map((p)=>({
                player: p,
                team,
                isSubbedOut: false,
                isSubbedIn: false,
                isInjured: false,
                currentCond: p.cond,
                events: [],
                goals: 0,
                assists: 0,
                shots: 0,
                shotsOnTarget: 0,
                tackles: 0,
                interceptions: 0,
                passes: 0,
                keyPasses: 0,
                saves: 0,
                fouls: 0,
                yellowCards: 0,
                redCards: 0,
                ratingDelta: 0,
                minuteEntered: 0,
                minuteLeft: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].duration
            }));
    };
    const homeMutablePlayers = createMutableState(homePlayers, 'home');
    const awayMutablePlayers = createMutableState(awayPlayers, 'away');
    // Initialize substitutes
    const homeSubstitutes = createMutableState(options?.substitutes?.home || [], 'home');
    const awaySubstitutes = createMutableState(options?.substitutes?.away || [], 'away');
    // Initialize referee match context (uses referee.ts system)
    const defaultReferee = {
        id: 'ref-default',
        name: options?.refereeName ?? 'Varsayılan Hakem',
        personality: options?.refereePersonality ?? 'dengeci',
        experience: 5,
        league_id: 'default',
        strictness: options?.refereeStrictness ?? 50,
        totalMatches: 0,
        totalYellows: 0,
        totalReds: 0,
        totalPenalties: 0
    };
    const refCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRefereeMatchContext"])(defaultReferee);
    // Calculate strengths
    const homeStrength = calculateTeamStrength(homePlayers, homeTactic);
    const awayStrength = calculateTeamStrength(awayPlayers, awayTactic);
    // ── Play Style Modifiers ──────────────────────────────────────────────
    // Apply play style effects to team strengths. Play style modifiers affect
    // possession, pressing, defense, counter-attack, etc.
    const homePS = options?.homePlayStyleModifiers;
    const awayPS = options?.awayPlayStyleModifiers;
    // Apply play style to team strength calculations
    if (homePS) {
        homeStrength.attack *= 1 + (homePS.shotFrequencyBonus + homePS.shotAccuracyBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        homeStrength.midfield *= 1 + (homePS.passAccuracyBonus + homePS.possessionBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        homeStrength.defense *= 1 + (homePS.defenseBonus + homePS.tackleBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        homeStrength.overall = homeStrength.attack * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_ATTACK"] + homeStrength.midfield * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_MIDFIELD"] + homeStrength.defense * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_DEFENSE"] + homeStrength.gk * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_GK"];
    }
    if (awayPS) {
        awayStrength.attack *= 1 + (awayPS.shotFrequencyBonus + awayPS.shotAccuracyBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        awayStrength.midfield *= 1 + (awayPS.passAccuracyBonus + awayPS.possessionBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        awayStrength.defense *= 1 + (awayPS.defenseBonus + awayPS.tackleBonus) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].combinationWeight;
        awayStrength.overall = awayStrength.attack * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_ATTACK"] + awayStrength.midfield * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_MIDFIELD"] + awayStrength.defense * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_DEFENSE"] + awayStrength.gk * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OVERALL_WEIGHT_GK"];
    }
    // Home advantage: +10% base
    homeStrength.overall *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HOME_ADVANTAGE"].overall;
    homeStrength.attack *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HOME_ADVANTAGE"].attack;
    homeStrength.midfield *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HOME_ADVANTAGE"].midfield;
    homeStrength.defense *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HOME_ADVANTAGE"].defense;
    const homeTeam = {
        players: homeMutablePlayers,
        tactic: homeTactic,
        overallStrength: homeStrength.overall,
        attackStrength: homeStrength.attack,
        midfieldStrength: homeStrength.midfield,
        defenseStrength: homeStrength.defense,
        gkStrength: homeStrength.gk,
        substitutionSlots: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].substitutionSlots,
        usedSubs: 0,
        substitutes: homeSubstitutes
    };
    const awayTeam = {
        players: awayMutablePlayers,
        tactic: awayTactic,
        overallStrength: awayStrength.overall,
        attackStrength: awayStrength.attack,
        midfieldStrength: awayStrength.midfield,
        defenseStrength: awayStrength.defense,
        gkStrength: awayStrength.gk,
        substitutionSlots: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].substitutionSlots,
        usedSubs: 0,
        substitutes: awaySubstitutes
    };
    // Score
    let homeScore = 0;
    let awayScore = 0;
    // All events
    const allEvents = [];
    // Live statistics
    const homeLiveStats = {
        possessionTicks: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        passSuccesses: 0,
        tackles: 0,
        interceptions: 0,
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
        corners: 0,
        freeKicks: 0,
        offsides: 0,
        injuries: 0,
        saves: 0
    };
    const awayLiveStats = {
        possessionTicks: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        passSuccesses: 0,
        tackles: 0,
        interceptions: 0,
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
        corners: 0,
        freeKicks: 0,
        offsides: 0,
        injuries: 0,
        saves: 0
    };
    // ── Helper: Get active (on-pitch) players ──────────────────────────────
    const getActivePlayers = (team)=>team.players.filter((p)=>!p.isSubbedOut && !p.isInjured);
    // ── Helper: Get players by position ─────────────────────────────────────
    // Geniş pozisyon grubuna (GK/DEF/MID/FWD) göre filtreler ve
    // pozisyon etkinlik puanına göre sıralar (en uygun oyuncu önce)
    const getByPosition = (team, pos)=>{
        const candidates = getActivePlayers(team).filter((p)=>positionGroup(p.player) === pos);
        // Pozisyon etkinlik puanına göre sırala — kendi mevkisinde en etkili oyuncu öne
        candidates.sort((a, b)=>{
            const effA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionEffectiveness"])(a.player, a.player.specificPosition || a.player.position);
            const effB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$positionEffectiveness$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionEffectiveness"])(b.player, b.player.specificPosition || b.player.position);
            return effB - effA;
        });
        return candidates;
    };
    // ── Helper: Create an event ─────────────────────────────────────────────
    const createEvent = (minute, type, team, player, secondary, ratingImpact = 0)=>{
        const coords = getPitchCoords(player.team, positionGroup(player.player), type);
        const event = {
            minute,
            type,
            team: player.team,
            playerName: player.player.name,
            playerId: player.player.id,
            assistPlayerId: secondary?.player.id,
            assistPlayerName: secondary?.player.name,
            description: '',
            x: coords.x,
            y: coords.y,
            ratingImpact
        };
        // Generate commentary using the unified trait-based commentary generator
        event.description = generateRichCommentary(type, player, secondary, minute);
        return event;
    };
    // ── Helper: Determine momentum (which team has the ball) ────────────────
    const determineMomentum = (minute)=>{
        let homeWeight = homeTeam.overallStrength;
        let awayWeight = awayTeam.overallStrength;
        // Period-based adjustments
        let homeBias = 1.0;
        let awayBias = 1.0;
        // Home team tends to start stronger
        if (minute <= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].earlyHomeCutoff) homeBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].earlyHomeBias;
        // Second half away team sometimes rallies
        if (minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].awayRallyStart && minute <= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].awayRallyEnd) awayBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].awayRallyBias;
        // Late game: leading team may sit back
        if (minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].leadSitBackCutoff) {
            if (homeScore > awayScore) homeBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].leadSitBack;
            if (awayScore > homeScore) awayBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].leadSitBack;
        }
        // If a team is down, they push forward
        if (homeScore < awayScore && minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].losingPushCutoff) homeBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].losingTeamPush;
        if (awayScore < homeScore && minute > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].losingPushCutoff) awayBias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].losingTeamPush;
        // Red card penalty
        const homeReds = homeLiveStats.redCards;
        const awayReds = awayLiveStats.redCards;
        if (homeReds > 0) homeBias *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].redCardPenalty;
        if (awayReds > 0) awayBias *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOMENTUM_BIASES"].redCardPenalty;
        // Play style: possession bonus affects momentum
        if (homePS?.possessionBonus) homeBias *= 1 + homePS.possessionBonus;
        if (awayPS?.possessionBonus) awayBias *= 1 + awayPS.possessionBonus;
        const totalWeight = homeWeight * homeBias + awayWeight * awayBias;
        return Math.random() * totalWeight < homeWeight * homeBias ? 'home' : 'away';
    };
    // ── Substitution logic ──────────────────────────────────────────────────
    const performSubstitution = (team, minute, events, liveStats)=>{
        if (team.usedSubs >= team.substitutionSlots) return;
        if (team.substitutes.length === 0) return;
        const active = getActivePlayers(team);
        const tiredPlayers = active.filter((p)=>p.currentCond < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].tiredPlayerCondThreshold && !p.isSubbedOut && p.minuteEntered < minute).sort((a, b)=>a.currentCond - b.currentCond);
        if (tiredPlayers.length === 0) return;
        // Find appropriate substitute by position
        const outPlayer = tiredPlayers[0];
        const outPos = positionGroup(outPlayer.player);
        const sub = team.substitutes.find((s)=>!s.isSubbedIn && positionGroup(s.player) === outPos) ?? team.substitutes.find((s)=>!s.isSubbedIn);
        if (!sub) return;
        // Execute substitution
        outPlayer.isSubbedOut = true;
        outPlayer.minuteLeft = minute;
        sub.isSubbedIn = true;
        sub.minuteEntered = minute;
        sub.currentCond = sub.player.cond;
        // Move substitute into active roster
        team.players.push(sub);
        team.usedSubs++;
        const event = createEvent(minute, 'substitution', team, outPlayer, sub, 0);
        // Fix: for substitution, playerName should be the player coming in
        event.description = generateEventCommentary('substitution', outPlayer, minute, sub);
        events.push(event);
    };
    // ── Main match loop ─────────────────────────────────────────────────────
    let currentMinute = 1;
    let momentumShiftCounter = 0;
    while(currentMinute <= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].duration){
        const minute = currentMinute;
        // Weather & referee commentary at start
        if (minute === 1) {
            const refConfig = refCtx.personalityConfig;
            const refInfo = refCtx.referee.name ? ` Hakem: ${refCtx.referee.name} (${refConfig.emoji} ${refConfig.label_tr}, Sertlik: ${refCtx.referee.strictness}).` : '';
            allEvents.push({
                minute: 0,
                type: 'chance',
                team: 'home',
                playerName: '',
                playerId: '',
                description: `Maç başlıyor! Hava durumu: ${weather === 'sunny' ? 'Güneşli' : weather === 'rainy' ? 'Yağmurlu' : weather === 'snowy' ? 'Karlı' : 'Rüzgarlı'}. ${weatherMods.description}${refInfo}`,
                x: 50,
                y: 50,
                ratingImpact: 0
            });
        }
        // Determine momentum
        const hasMomentum = determineMomentum(minute);
        const attackingTeam = hasMomentum === 'home' ? homeTeam : awayTeam;
        const defendingTeam = hasMomentum === 'home' ? awayTeam : homeTeam;
        // Possession tracking
        if (hasMomentum === 'home') homeLiveStats.possessionTicks++;
        else awayLiveStats.possessionTicks++;
        // Pass simulation (background activity)
        const activeAttackers = getActivePlayers(attackingTeam);
        const passCount = randInt(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PASS_SIMULATION"].minPasses, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PASS_SIMULATION"].maxPasses);
        const attackingPS = hasMomentum === 'home' ? homePS : awayPS;
        for(let i = 0; i < passCount; i++){
            const passer = pick(activeAttackers);
            let passSkill = getAttr(passer.player, 'passing', 50) * weatherMods.passingMod / 100;
            // Play style: pass accuracy bonus
            if (attackingPS?.passAccuracyBonus) {
                passSkill *= 1 + attackingPS.passAccuracyBonus;
            }
            // Play style: long ball bonus reduces short pass accuracy slightly
            if (attackingPS?.longBallBonus && attackingPS.longBallBonus > 0) {
                passSkill *= 1 - attackingPS.longBallBonus * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PASS_SIMULATION"].longBallShortPassPenalty; // slight penalty for short passes
            }
            passer.passes++;
            if (hasMomentum === 'home') homeLiveStats.passes++;
            else awayLiveStats.passes++;
            if (Math.random() < passSkill) {
                if (hasMomentum === 'home') homeLiveStats.passSuccesses++;
                else awayLiveStats.passSuccesses++;
                // Chance for key pass
                if (Math.random() < passSkill * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PASS_SIMULATION"].keyPassChance) {
                    passer.keyPasses++;
                }
            }
        }
        // Determine if an event happens this minute
        // Events every 1-3 minutes
        momentumShiftCounter++;
        if (momentumShiftCounter >= randInt(1, 3)) {
            momentumShiftCounter = 0;
            // Select a random player from the attacking team to generate an event for
            const posWeights = [
                {
                    pos: 'FWD',
                    weight: attackingTeam.attackStrength
                },
                {
                    pos: 'MID',
                    weight: attackingTeam.midfieldStrength
                },
                {
                    pos: 'DEF',
                    weight: attackingTeam.defenseStrength * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].defenseWeight
                }
            ];
            const selectedPos = weightedPick(posWeights).pos;
            const candidates = getByPosition(attackingTeam, selectedPos);
            if (candidates.length === 0) {
                // Fallback: pick any active player
                const allActive = getActivePlayers(attackingTeam);
                if (allActive.length === 0) {
                    currentMinute++;
                    continue;
                }
            }
            const pool = candidates.length > 0 ? candidates : getActivePlayers(attackingTeam);
            const selectedPlayer = pick(pool);
            const opponentGKs = getByPosition(defendingTeam, 'GK');
            const opponentGK = opponentGKs.length > 0 ? opponentGKs[0] : undefined;
            const opponentDefenders = getByPosition(defendingTeam, 'DEF');
            const opponentDefender = opponentDefenders.length > 0 ? pick(opponentDefenders) : undefined;
            const probs = getEventProbabilities(selectedPlayer, attackingTeam.overallStrength, defendingTeam.overallStrength, weatherMods, minute, true);
            // ── Trait Engine: Savunan takım trait'leri probs'a etki eder ─────────────
            // Kaleci trait'leri probs.save'i, defans trait'leri probs.tackle'ı artırır
            applyDefenderTraitEffects(probs, opponentGK, opponentDefender);
            // ── Attempt a shot / chance ──────────────────────────────────────
            const shotRoll = Math.random();
            const baseGoalChance = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].base; // 3% base goal per attacking minute
            const strengthRatio = attackingTeam.attackStrength / (attackingTeam.attackStrength + defendingTeam.defenseStrength);
            // Modified goal probability
            const finishing = getAttr(selectedPlayer.player, 'finishing', 50) / 100;
            const gkRating = opponentGK ? getAttr(opponentGK.player, 'goalkeeping', 50) / 100 : 0.5;
            let goalChance = baseGoalChance * strengthRatio * (finishing / (finishing + gkRating * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].gkWeight));
            // Quality gap modifier — much stronger team creates more
            const qualityGap = Math.abs(attackingTeam.overallStrength - defendingTeam.overallStrength) / 100;
            if (attackingTeam.overallStrength > defendingTeam.overallStrength) {
                goalChance *= 1 + qualityGap * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].qualityGapBonus;
            } else {
                goalChance *= 1 - qualityGap * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].qualityGapPenalty;
            }
            // Tactic mentality modifier
            const tacticMentalityMod = attackingTeam.tactic.mentality >= 4 ? 1 + (attackingTeam.tactic.mentality - 3) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].mentalityBonus : attackingTeam.tactic.mentality <= 2 ? 1 - (3 - attackingTeam.tactic.mentality) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].mentalityPenalty : 1.0;
            goalChance *= tacticMentalityMod;
            // ── Play Style: shot frequency & accuracy modifiers ───────────────
            if (attackingPS?.shotFrequencyBonus) {
                goalChance *= 1 + attackingPS.shotFrequencyBonus;
            }
            if (attackingPS?.shotAccuracyBonus) {
                goalChance *= 1 + attackingPS.shotAccuracyBonus;
            }
            // Play Style: counter bonus — increases goal chance when counter-attacking
            // Counter detected when opponent has momentum but defense is outnumbered
            if (attackingPS?.counterBonus && attackingPS.counterBonus > 0) {
                // Counter bonus applies when the team has fewer players in attack or when
                // the defending team has higher aggression (committed players forward)
                const counterChance = Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].counterTriggerProb ? attackingPS.counterBonus : 0;
                goalChance *= 1 + counterChance;
            }
            // Play Style: pressing bonus — increases chance of winning ball in dangerous area
            if (attackingPS?.pressingBonus && attackingPS.pressingBonus > 0) {
                // Pressing teams get a small boost to goal probability from high turnovers
                goalChance *= 1 + attackingPS.pressingBonus * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].pressingGoalBoost;
            }
            // ── Live Strategy Tactic Modifiers (goalMod / conceedMod) ──────────────
            // Home team attacking → apply home goalMod + away conceedMod
            // Away team attacking → apply away goalMod + home conceedMod
            const isHomeAttacking = hasMomentum === 'home';
            const attackerMods = isHomeAttacking ? options?.homeTacticModifiers : options?.awayTacticModifiers;
            const defenderMods = isHomeAttacking ? options?.awayTacticModifiers : options?.homeTacticModifiers;
            if (attackerMods?.goalMod) {
                goalChance *= 1 + attackerMods.goalMod;
            }
            if (defenderMods?.conceedMod) {
                goalChance *= 1 + defenderMods.conceedMod;
            }
            // Late game desperation
            if (minute > 80) {
                if (hasMomentum === 'home' && homeScore < awayScore) goalChance *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].lateGameDesperation;
                if (hasMomentum === 'away' && awayScore < homeScore) goalChance *= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].lateGameDesperation;
            }
            // ── Trait Engine: Saldıran oyuncu trait'leri goalChance'e etki eder ──────
            // Ofansif traitler goalChance'i artırır, negatif traitler azaltır
            // Her trait'in etkisi ±0.03 ile sınırlıdır (oyun dengesi)
            goalChance = applyAttackerTraitEffects(goalChance, selectedPlayer);
            // ── Panikçi mekanizması: 70+ dakika, geride olan takımın Panikçi oyuncuları ──
            if (minute > 70) {
                const teamIsLosing = hasMomentum === 'home' && homeScore < awayScore || hasMomentum === 'away' && awayScore < homeScore;
                if (teamIsLosing) {
                    const isPanicky = selectedPlayer.player.personalityTraits?.some((t)=>t === 'Panikçi' || t === 'Panik yapar');
                    if (isPanicky) {
                        goalChance *= 0.60; // %40 daha az gol ihtimali
                        // Faul ihtimalini artır — %8 ekstra faul
                        const foulRoll = Math.random();
                        if (foulRoll < 0.08 && opponentDefender) {
                            const foulEvent = createEvent(minute, 'foul', defendingTeam, opponentDefender, selectedPlayer, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].foulCommitted);
                            allEvents.push(foulEvent);
                            opponentDefender.events.push(foulEvent);
                            if (hasMomentum === 'home') awayLiveStats.fouls++;
                            else homeLiveStats.fouls++;
                        }
                    }
                }
            }
            goalChance = clamp(goalChance, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].clampMin, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_CHANCE"].clampMax);
            // Find potential assister (midfielder or other forward)
            const midfielders = getByPosition(attackingTeam, 'MID');
            const otherForwards = getByPosition(attackingTeam, 'FWD').filter((p)=>p.player.id !== selectedPlayer.player.id);
            const assistCandidates = [
                ...midfielders,
                ...otherForwards
            ].filter((p)=>p.player.id !== selectedPlayer.player.id);
            const assister = assistCandidates.length > 0 && Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ASSIST_CHANCE"] ? pick(assistCandidates) : undefined;
            if (shotRoll < goalChance) {
                // ── GOAL ──────────────────────────────────────────────────────
                selectedPlayer.goals++;
                selectedPlayer.shots++;
                selectedPlayer.shotsOnTarget++;
                selectedPlayer.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].goal;
                if (hasMomentum === 'home') {
                    homeScore++;
                    homeLiveStats.shots++;
                    homeLiveStats.shotsOnTarget++;
                } else {
                    awayScore++;
                    awayLiveStats.shots++;
                    awayLiveStats.shotsOnTarget++;
                }
                if (assister) {
                    assister.assists++;
                    assister.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].assist;
                    assister.keyPasses++;
                }
                // Determine goal type
                let goalDetail = 'normal';
                if (!assister) goalDetail = 'solo';
                if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_TYPE"].headerChance && selectedPlayer.player.specificPosition === 'ST') goalDetail = 'header';
                if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_TYPE"].longShotChance && getAttr(selectedPlayer.player, 'longShots', 50) > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_TYPE"].longShotThreshold) goalDetail = 'longShot';
                if (minute >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GOAL_TYPE"].lateGoalMinute) goalDetail = 'lateGoal';
                const goalEvent = createEvent(minute, 'goal', attackingTeam, selectedPlayer, assister, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].goal);
                goalEvent.description = generateGoalCommentary(selectedPlayer, assister, minute, goalDetail);
                // VAR check for goal — referee.ts checkVARForGoal
                const isScorerHome = selectedPlayer.team === 'home';
                const varResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkVARForGoal"])(refCtx, isScorerHome);
                if (varResult.varReview && varResult.overturned) {
                    // Goal overturned by VAR!
                    selectedPlayer.goals--;
                    selectedPlayer.ratingDelta -= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].goal;
                    if (assister) {
                        assister.assists--;
                        assister.ratingDelta -= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].assist;
                    }
                    if (hasMomentum === 'home') {
                        homeScore--;
                        homeLiveStats.shotsOnTarget--;
                    } else {
                        awayScore--;
                        awayLiveStats.shotsOnTarget--;
                    }
                    // Add VAR review event then overturned event
                    const varEvent = {
                        minute,
                        type: 'var_review',
                        team: selectedPlayer.team,
                        playerName: selectedPlayer.player.name,
                        playerId: selectedPlayer.player.id,
                        assistPlayerId: assister?.player.id,
                        assistPlayerName: assister?.player.name,
                        description: `${minute}. dakikada VAR incelemesi! ${selectedPlayer.player.name}'in golü inceleniyor...`,
                        x: 50,
                        y: 50,
                        ratingImpact: 0
                    };
                    allEvents.push(varEvent);
                    const overturnedEvent = {
                        minute,
                        type: 'goal_overturned',
                        team: selectedPlayer.team,
                        playerName: selectedPlayer.player.name,
                        playerId: selectedPlayer.player.id,
                        description: pick(COMMENTARY.goal_overturned)(selectedPlayer.player.name, minute),
                        x: 50,
                        y: 50,
                        ratingImpact: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].redCard
                    };
                    allEvents.push(overturnedEvent);
                    selectedPlayer.events.push(overturnedEvent);
                } else {
                    // Goal confirmed (or no VAR review)
                    allEvents.push(goalEvent);
                    selectedPlayer.events.push(goalEvent);
                    if (varResult.varReview) {
                        // VAR reviewed but goal stands
                        const varEvent = {
                            minute,
                            type: 'var_review',
                            team: selectedPlayer.team,
                            playerName: selectedPlayer.player.name,
                            playerId: selectedPlayer.player.id,
                            description: `${minute}. dakikada VAR incelemesi — gol geçerli!`,
                            x: 50,
                            y: 50,
                            ratingImpact: 0
                        };
                        allEvents.push(varEvent);
                    }
                }
                if (assister) assister.events.push(goalEvent);
            } else if (shotRoll < goalChance + probs.shot) {
                // ── Shot on target but saved ──────────────────────────────────
                selectedPlayer.shots++;
                selectedPlayer.shotsOnTarget++;
                selectedPlayer.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotSaved;
                if (hasMomentum === 'home') {
                    homeLiveStats.shots++;
                    homeLiveStats.shotsOnTarget++;
                } else {
                    awayLiveStats.shots++;
                    awayLiveStats.shotsOnTarget++;
                }
                if (opponentGK) {
                    opponentGK.saves++;
                    opponentGK.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].gkSave;
                    if (hasMomentum === 'home') awayLiveStats.saves++;
                    else homeLiveStats.saves++;
                    const saveEvent = createEvent(minute, 'shot_saved', attackingTeam, selectedPlayer, opponentGK, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotSaved);
                    allEvents.push(saveEvent);
                    selectedPlayer.events.push(saveEvent);
                    opponentGK.events.push(saveEvent);
                }
            } else if (shotRoll < goalChance + probs.shot * 2.5) {
                // ── Shot wide ────────────────────────────────────────────────
                selectedPlayer.shots++;
                selectedPlayer.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotWide;
                if (hasMomentum === 'home') homeLiveStats.shots++;
                else awayLiveStats.shots++;
                const wideEvent = createEvent(minute, 'shot_wide', attackingTeam, selectedPlayer, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotWide);
                allEvents.push(wideEvent);
                selectedPlayer.events.push(wideEvent);
            } else if (shotRoll < goalChance + probs.shot * 3.5) {
                // ── Shot hits post ───────────────────────────────────────────
                selectedPlayer.shots++;
                selectedPlayer.shotsOnTarget++;
                selectedPlayer.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotPost;
                if (hasMomentum === 'home') {
                    homeLiveStats.shots++;
                    homeLiveStats.shotsOnTarget++;
                } else {
                    awayLiveStats.shots++;
                    awayLiveStats.shotsOnTarget++;
                }
                const postEvent = createEvent(minute, 'shot_post', attackingTeam, selectedPlayer, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].shotPost);
                allEvents.push(postEvent);
                selectedPlayer.events.push(postEvent);
            } else if (shotRoll < goalChance + probs.shot * 3.5 + probs.chance) {
                // ── Chance created ───────────────────────────────────────────
                selectedPlayer.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].chanceCreated;
                if (assister) {
                    assister.keyPasses++;
                    assister.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].assistOnChance;
                }
                const chanceEvent = createEvent(minute, 'chance', attackingTeam, selectedPlayer, assister, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].chanceCreated);
                allEvents.push(chanceEvent);
                selectedPlayer.events.push(chanceEvent);
            } else {
                // ── Defensive / general events ───────────────────────────────
                const activeDefenders = getActivePlayers(defendingTeam);
                const defendingPS = hasMomentum === 'home' ? awayPS : homePS;
                if (activeDefenders.length > 0) {
                    const defender = pick(activeDefenders);
                    // Tackle
                    let tackleProb = probs.tackle;
                    // Play style: tackle bonus for defending team
                    if (defendingPS?.tackleBonus) {
                        tackleProb *= 1 + defendingPS.tackleBonus;
                    }
                    // Play style: pressing bonus increases tackle probability
                    if (defendingPS?.pressingBonus) {
                        tackleProb *= 1 + defendingPS.pressingBonus * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYSTYLE_WEIGHTS"].pressingTackleBoost;
                    }
                    if (Math.random() < tackleProb) {
                        defender.tackles++;
                        defender.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].tackle;
                        if (hasMomentum === 'home') awayLiveStats.tackles++;
                        else homeLiveStats.tackles++;
                        // Occasionally generate a notable tackle event
                        if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EVENT_VISIBILITY"].tackle) {
                            const tackleEvent = createEvent(minute, 'tackle', defendingTeam, defender, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].tackle);
                            allEvents.push(tackleEvent);
                            defender.events.push(tackleEvent);
                        }
                    }
                    // Interception
                    let interceptionProb = probs.interception;
                    // Play style: pressing bonus increases interception probability
                    if (defendingPS?.pressingBonus) {
                        interceptionProb *= 1 + defendingPS.pressingBonus;
                    }
                    if (Math.random() < interceptionProb) {
                        defender.interceptions++;
                        defender.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].interception;
                        if (hasMomentum === 'home') awayLiveStats.interceptions++;
                        else homeLiveStats.interceptions++;
                        if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EVENT_VISIBILITY"].interception) {
                            const intEvent = createEvent(minute, 'interception', defendingTeam, defender, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].interception);
                            allEvents.push(intEvent);
                            defender.events.push(intEvent);
                        }
                    }
                    // Fouls — Referee-modified system (uses referee.ts decision functions)
                    const isDefenderHome = defender.team === 'home';
                    const baseFoulProb = probs.foul * (attackingTeam.tactic.aggression / 50);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldCallFoul"])(refCtx, baseFoulProb, isDefenderHome)) {
                        defender.fouls++;
                        defender.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].foulCommitted;
                        if (hasMomentum === 'home') awayLiveStats.fouls++;
                        else homeLiveStats.fouls++;
                        // Yellow card — referee decision function
                        const baseYellowProb = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_RATES"].yellow;
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldGiveYellowCard"])(refCtx, baseYellowProb, isDefenderHome, minute)) {
                            defender.yellowCards++;
                            refCtx.yellowsGiven++;
                            defender.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].yellowCard;
                            if (hasMomentum === 'home') awayLiveStats.yellowCards++;
                            else homeLiveStats.yellowCards++;
                            const yellowEvent = createEvent(minute, 'yellow_card', defendingTeam, defender, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].yellowCard);
                            allEvents.push(yellowEvent);
                            defender.events.push(yellowEvent);
                        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldGiveRedCard"])(refCtx, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_RATES"].red, isDefenderHome)) {
                            // Red card — referee decision function
                            defender.redCards++;
                            refCtx.redsGiven++;
                            defender.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].redCard;
                            defender.isSubbedOut = true;
                            defender.minuteLeft = minute;
                            if (hasMomentum === 'home') awayLiveStats.redCards++;
                            else homeLiveStats.redCards++;
                            const redEvent = createEvent(minute, 'red_card', defendingTeam, defender, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].redCard);
                            allEvents.push(redEvent);
                            defender.events.push(redEvent);
                        } else {
                            // Regular foul event (sometimes visible)
                            if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_RATES"].foulVisibility * refCtx.personalityConfig.foulMultiplier * refCtx.runtimeFoulMod) {
                                const foulEvent = createEvent(minute, 'foul', defendingTeam, defender, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].foulCommitted);
                                allEvents.push(foulEvent);
                                defender.events.push(foulEvent);
                                // Award free kick or penalty — referee decision function with VAR
                                const isAttackerHome = selectedPlayer.team === 'home';
                                const penaltyResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldGivePenalty"])(refCtx, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_RATES"].penalty, isAttackerHome, minute);
                                if (penaltyResult.penalty && !penaltyResult.overturned) {
                                    const penaltyEvent = createEvent(minute, 'penalty', attackingTeam, selectedPlayer, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].penalty);
                                    allEvents.push(penaltyEvent);
                                    selectedPlayer.events.push(penaltyEvent);
                                    if (hasMomentum === 'home') homeLiveStats.freeKicks++;
                                    else awayLiveStats.freeKicks++;
                                } else if (penaltyResult.varReview) {
                                    // VAR review event (penalty overturned or confirmed)
                                    const varEvent = createEvent(minute, 'var_review', attackingTeam, selectedPlayer, undefined, 0);
                                    varEvent.description = pick(COMMENTARY.var_review)(selectedPlayer.player.name, minute);
                                    if (penaltyResult.overturned) {
                                        varEvent.description += ' Penaltı iptal edildi!';
                                    }
                                    allEvents.push(varEvent);
                                } else {
                                    const fkEvent = createEvent(minute, 'free_kick', attackingTeam, selectedPlayer, defender, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].freeKick);
                                    allEvents.push(fkEvent);
                                    selectedPlayer.events.push(fkEvent);
                                    if (hasMomentum === 'home') homeLiveStats.freeKicks++;
                                    else awayLiveStats.freeKicks++;
                                }
                            }
                        }
                    }
                }
                // Offside — referee-modified (uses referee.ts getOffsideMultiplier)
                const isAttHome = hasMomentum === 'home';
                const offsideMod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$referee$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOffsideMultiplier"])(refCtx, isAttHome);
                if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SET_PIECE_RATES"].offside * offsideMod) {
                    const forwards = getByPosition(attackingTeam, 'FWD');
                    if (forwards.length > 0) {
                        const offsidePlayer = pick(forwards);
                        const offsideEvent = createEvent(minute, 'offside', attackingTeam, offsidePlayer, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].offside);
                        allEvents.push(offsideEvent);
                        offsidePlayer.events.push(offsideEvent);
                        if (hasMomentum === 'home') homeLiveStats.offsides++;
                        else awayLiveStats.offsides++;
                    }
                }
                // Corner
                let cornerProb = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SET_PIECE_RATES"].corner;
                // Play style: crossing bonus increases corner probability
                const attackingPSForCorner = hasMomentum === 'home' ? homePS : awayPS;
                if (attackingPSForCorner?.crossingBonus) {
                    cornerProb *= 1 + attackingPSForCorner.crossingBonus;
                }
                if (Math.random() < cornerProb) {
                    const cornerPlayer = pick(getActivePlayers(attackingTeam));
                    const cornerEvent = createEvent(minute, 'corner', attackingTeam, cornerPlayer, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].corner);
                    allEvents.push(cornerEvent);
                    cornerPlayer.events.push(cornerEvent);
                    if (hasMomentum === 'home') homeLiveStats.corners++;
                    else awayLiveStats.corners++;
                }
                // GK save (reactionary)
                if (opponentGK && Math.random() < probs.save * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EVENT_VISIBILITY"].gkSaveScaling) {
                    opponentGK.saves++;
                    opponentGK.ratingDelta += __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].gkReactionarySave;
                    if (hasMomentum === 'home') awayLiveStats.saves++;
                    else homeLiveStats.saves++;
                    if (Math.random() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EVENT_VISIBILITY"].gkSave) {
                        const saveEvent = createEvent(minute, 'save', defendingTeam, opponentGK, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_IMPACT"].gkReactionarySave);
                        allEvents.push(saveEvent);
                        opponentGK.events.push(saveEvent);
                    }
                }
            }
            // ── Injury check ────────────────────────────────────────────────
            const activeForInjury = getActivePlayers(attackingTeam).concat(getActivePlayers(defendingTeam));
            for (const p of activeForInjury){
                // Use injuryManager's risk calculation based on stamina/condition
                const stamina = getAttr(p.player, 'stamina', 50);
                const injuryRisk = p.currentCond < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].condThresholdLow ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].low : p.currentCond < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].condThresholdMid ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].mid : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].base;
                if (Math.random() < injuryRisk) {
                    const { severity, days } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInjury"])();
                    p.isInjured = true;
                    p.minuteLeft = minute;
                    p.ratingDelta += severity === 'heavy' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactHeavy : severity === 'medium' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactMedium : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactLight;
                    if (hasMomentum === 'home') homeLiveStats.injuries++;
                    else awayLiveStats.injuries++;
                    const injuryEvent = createEvent(minute, 'injury', p.team === 'home' ? homeTeam : awayTeam, p, undefined, severity === 'heavy' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactHeavy : severity === 'medium' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactMedium : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INJURY_RISK"].ratingImpactLight);
                    injuryEvent.injurySeverity = severity;
                    injuryEvent.injuryDays = days;
                    allEvents.push(injuryEvent);
                    p.events.push(injuryEvent);
                }
            }
        }
        // ── Condition drain per minute ───────────────────────────────────────
        for (const p of getActivePlayers(homeTeam)){
            let drain = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].base + (p.player.stamina ? (100 - getAttr(p.player, 'stamina', 50)) / __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].staminaDivisor : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].fallbackDrain);
            // Play style: stamina drain modifier for home team
            if (homePS?.staminaDrain) {
                drain *= 1 + homePS.staminaDrain;
            }
            p.currentCond = clamp(p.currentCond - drain, 0, 100);
        }
        for (const p of getActivePlayers(awayTeam)){
            let drain = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].base + (p.player.stamina ? (100 - getAttr(p.player, 'stamina', 50)) / __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].staminaDivisor : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONDITION_DRAIN"].fallbackDrain);
            // Play style: stamina drain modifier for away team
            if (awayPS?.staminaDrain) {
                drain *= 1 + awayPS.staminaDrain;
            }
            p.currentCond = clamp(p.currentCond - drain, 0, 100);
        }
        // ── Auto substitution at 60' and 75' ────────────────────────────────
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].autoSubMinutes.includes(minute)) {
            performSubstitution(homeTeam, minute, allEvents, homeLiveStats);
            performSubstitution(awayTeam, minute, allEvents, awayLiveStats);
        }
        // ── Halftime ────────────────────────────────────────────────────────
        if (minute === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].halftime) {
            allEvents.push({
                minute: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].halftime,
                type: 'chance',
                team: 'home',
                playerName: '',
                playerId: '',
                description: pick(COMMENTARY.halftime),
                x: 50,
                y: 50,
                ratingImpact: 0
            });
        }
        currentMinute++;
    }
    // ── Fulltime ────────────────────────────────────────────────────────────
    allEvents.push({
        minute: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STRUCTURE"].duration,
        type: 'chance',
        team: 'home',
        playerName: '',
        playerId: '',
        description: pick(COMMENTARY.fulltime),
        x: 50,
        y: 50,
        ratingImpact: 0
    });
    // Sort events by minute
    allEvents.sort((a, b)=>a.minute - b.minute);
    // ── Calculate final statistics ──────────────────────────────────────────
    const totalPossessionTicks = homeLiveStats.possessionTicks + awayLiveStats.possessionTicks;
    const homePossession = totalPossessionTicks > 0 ? Math.round(homeLiveStats.possessionTicks / totalPossessionTicks * 100) : 50;
    const awayPossession = 100 - homePossession;
    const buildStats = (s)=>({
            possession: homePossession,
            shots: s.shots,
            shotsOnTarget: s.shotsOnTarget,
            passes: s.passes,
            passAccuracy: s.passes > 0 ? Math.round(s.passSuccesses / s.passes * 100) : 0,
            tackles: s.tackles,
            interceptions: s.interceptions,
            fouls: s.fouls,
            yellowCards: s.yellowCards,
            redCards: s.redCards,
            corners: s.corners,
            freeKicks: s.freeKicks,
            offsides: s.offsides,
            injuries: s.injuries,
            saves: s.saves
        });
    const homeStats = {
        ...buildStats(homeLiveStats),
        possession: homePossession
    };
    const awayStats = {
        ...buildStats(awayLiveStats),
        possession: awayPossession
    };
    // ── Calculate player ratings ───────────────────────────────────────────
    const calculatePlayerRating = (state)=>{
        // Base rating
        let rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].baseRating;
        // Position-adjusted base
        const pos = positionGroup(state.player);
        switch(pos){
            case 'GK':
                rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].baseRating;
                rating += state.saves * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].GK.perSave;
                rating -= state.goals > 0 ? state.goals * -__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].GK.perGoalConceded : 0;
                break;
            case 'DEF':
                rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].baseRating;
                rating += state.tackles * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].DEF.perTackle;
                rating += state.interceptions * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].DEF.perInterception;
                rating += state.assists * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].DEF.perAssist;
                rating += state.goals * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].DEF.perGoal;
                break;
            case 'MID':
                rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].baseRating;
                rating += state.keyPasses * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].MID.perKeyPass;
                rating += state.passes * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].MID.perPass;
                rating += state.tackles * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].MID.perTackle;
                rating += state.goals * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].MID.perGoal;
                rating += state.assists * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].MID.perAssist;
                break;
            case 'FWD':
                rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].baseRating;
                rating += state.goals * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].FWD.perGoal;
                rating += state.assists * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].FWD.perAssist;
                rating += state.shotsOnTarget * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].FWD.perShotOnTarget;
                rating += (state.shots - state.shotsOnTarget) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].FWD.perMissedShot;
                break;
        }
        // Card penalties
        rating += state.yellowCards * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].yellowCardPenalty;
        rating += state.redCards * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].redCardPenalty;
        // Fouls penalty
        rating += state.fouls * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].foulPenalty;
        // Apply accumulated ratingDelta
        rating += state.ratingDelta;
        // Minutes played factor (less time = less impact on rating)
        const minutesPlayed = state.minuteLeft - state.minuteEntered;
        const ptf = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].playingTimeFactors;
        const playingTimeFactor = minutesPlayed >= 85 ? ptf.full85 : minutesPlayed >= 60 ? ptf.mid60 : minutesPlayed >= 30 ? ptf.low30 : ptf.sub30;
        rating = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].ratingShiftBase + (rating - __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].ratingShiftBase) * playingTimeFactor;
        // Morale, form, condition modifiers (subtle)
        const avgMental = (state.player.morale + state.player.form + state.player.confidence) / 300;
        rating += (avgMental - 0.5) * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].mentalModifierStrength;
        rating = clamp(Math.round(rating * 10) / 10, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].ratingClamp.min, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAYER_RATING_WEIGHTS"].ratingClamp.max);
        return {
            playerId: state.player.id,
            playerName: state.player.name,
            position: state.player.specificPosition || pos,
            rating,
            goals: state.goals,
            assists: state.assists,
            shots: state.shots,
            tackles: state.tackles,
            passes: state.passes,
            keyPasses: state.keyPasses,
            saves: state.saves
        };
    };
    const homePlayerRatings = homeTeam.players.map(calculatePlayerRating);
    const awayPlayerRatings = awayTeam.players.map(calculatePlayerRating);
    // ── Man of the Match ───────────────────────────────────────────────────
    const allRatings = [
        ...homePlayerRatings,
        ...awayPlayerRatings
    ];
    const motm = allRatings.reduce((best, r)=>r.rating > best.rating ? r : best, allRatings[0]);
    return {
        homeScore,
        awayScore,
        events: allEvents,
        homeStats,
        awayStats,
        homePlayerRatings,
        awayPlayerRatings,
        manOfTheMatch: motm?.playerId || '',
        homePossession,
        awayPossession,
        weather,
        refereeName: refCtx.referee.name,
        refereePersonality: refCtx.referee.personality,
        refereeStrictness: refCtx.referee.strictness,
        varReviews: refCtx.varReviews,
        goalsOverturned: refCtx.goalsOverturned
    };
}
function generateMatchReport(result) {
    const lines = [];
    const homeGoals = result.events.filter((e)=>e.type === 'goal' && e.team === 'home');
    const awayGoals = result.events.filter((e)=>e.type === 'goal' && e.team === 'away');
    const yellows = result.events.filter((e)=>e.type === 'yellow_card');
    const reds = result.events.filter((e)=>e.type === 'red_card');
    const injuries = result.events.filter((e)=>e.type === 'injury');
    const subs = result.events.filter((e)=>e.type === 'substitution');
    // Find MOTM details
    const allRatings = [
        ...result.homePlayerRatings,
        ...result.awayPlayerRatings
    ];
    const motm = allRatings.find((r)=>r.playerId === result.manOfTheMatch);
    // ── ÖZET ───────────────────────────────────────────────────────────────
    lines.push('═'.repeat(60));
    lines.push('                    MAÇ RAPORU');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`                    EV SAHİBİ ${result.homeScore} - ${result.awayScore} DEPLASMAN`);
    lines.push('');
    lines.push(`  Hava: ${result.weather === 'sunny' ? 'Güneşli ☀️' : result.weather === 'rainy' ? 'Yağmurlu 🌧️' : result.weather === 'snowy' ? 'Karlı ❄️' : 'Rüzgarlı 💨'}`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('  📋 ÖZET');
    lines.push('─'.repeat(60));
    lines.push('');
    // Goal descriptions
    if (homeGoals.length > 0 || awayGoals.length > 0) {
        lines.push('  ⚽ Goller:');
        for (const g of [
            ...homeGoals,
            ...awayGoals
        ]){
            const teamLabel = g.team === 'home' ? '[EV]' : '[DP]';
            lines.push(`     ${teamLabel} ${g.minute}. dk — ${g.description}`);
        }
        lines.push('');
    }
    // Key events
    const keyEvents = [
        ...yellows,
        ...reds,
        ...injuries,
        ...subs
    ];
    if (keyEvents.length > 0) {
        lines.push('  📌 Önemli Olaylar:');
        for (const e of keyEvents){
            lines.push(`     ${e.minute}. dk — ${e.description}`);
        }
        lines.push('');
    }
    // Match narrative
    lines.push('  📖 Maçın Hikayesi:');
    if (result.homeScore === 0 && result.awayScore === 0) {
        lines.push('     Her iki takım da net pozisyon bulmakta zorlandı.');
        lines.push('     Savunma ağırlıklı bir oyun izledik. Kaleciler az iş yaptı.');
    } else if (result.homeScore > result.awayScore) {
        const diff = result.homeScore - result.awayScore;
        if (diff >= 3) {
            lines.push('     Ev sahibi takım sahadan ezici bir galibiyetle ayrıldı.');
        } else if (diff === 1) {
            lines.push('     Çekişmeli bir maçtı. Ev sahibi, skoru lehine çevirmeyi başardı.');
        } else {
            lines.push('     Ev sahibi, deplasman ekibine üstünlük kurarak fark yaratmayı bildi.');
        }
    } else if (result.awayScore > result.homeScore) {
        const diff = result.awayScore - result.homeScore;
        if (diff >= 3) {
            lines.push('     Deplasman takımı adeta sahaya hükmetti! Net bir galibiyet.');
        } else if (diff === 1) {
            lines.push('     Deplasman takımı zorlu deplasmanda 3 puanı kaptı.');
        } else {
            lines.push('     Deplasman ekibi, ev sahibine karşın rahat bir galibiyet aldı.');
        }
    } else {
        lines.push('     Karşılıklı gollerle sonuçlanan dengeli bir mücadele oldu.');
        lines.push('     İki takım da puandan memnun görünüyor.');
    }
    lines.push('');
    // ── İSTATİSTİKLER ──────────────────────────────────────────────────────
    lines.push('─'.repeat(60));
    lines.push('  📊 İSTATİSTİKLER');
    lines.push('─'.repeat(60));
    lines.push('');
    const padStat = (home, label, away)=>{
        return `  ${home.padStart(6)}  │  ${label.padEnd(20)}  │  ${away.padEnd(6)}`;
    };
    lines.push(padStat(String(result.homeStats.possession) + '%', 'Topla Oynama', String(result.awayStats.possession) + '%'));
    lines.push(padStat(String(result.homeStats.shots), 'Toplam Şut', String(result.awayStats.shots)));
    lines.push(padStat(String(result.homeStats.shotsOnTarget), 'İsabetli Şut', String(result.awayStats.shotsOnTarget)));
    lines.push(padStat(String(result.homeStats.passes), 'Pas', String(result.awayStats.passes)));
    lines.push(padStat(String(result.homeStats.passAccuracy) + '%', 'Pas Başarısı', String(result.awayStats.passAccuracy) + '%'));
    lines.push(padStat(String(result.homeStats.tackles), 'Top Kapma', String(result.awayStats.tackles)));
    lines.push(padStat(String(result.homeStats.interceptions), 'Pas Yolu Kesme', String(result.awayStats.interceptions)));
    lines.push(padStat(String(result.homeStats.fouls), 'Faul', String(result.awayStats.fouls)));
    lines.push(padStat(String(result.homeStats.yellowCards), 'Sarı Kart', String(result.awayStats.yellowCards)));
    lines.push(padStat(String(result.homeStats.redCards), 'Kırmızı Kart', String(result.awayStats.redCards)));
    lines.push(padStat(String(result.homeStats.corners), 'Korner', String(result.awayStats.corners)));
    lines.push(padStat(String(result.homeStats.freeKicks), 'Serbest Vuruş', String(result.awayStats.freeKicks)));
    lines.push(padStat(String(result.homeStats.offsides), 'Ofsayt', String(result.awayStats.offsides)));
    lines.push(padStat(String(result.homeStats.saves), 'Kurtarış', String(result.awayStats.saves)));
    lines.push('');
    // ── OYUNCU DEĞERLENDİRMELERİ ────────────────────────────────────────────
    lines.push('─'.repeat(60));
    lines.push('  👤 OYUNCU DEĞERLENDİRMELERİ');
    lines.push('─'.repeat(60));
    lines.push('');
    const formatRatings = (ratings, teamLabel)=>{
        lines.push(`  ── ${teamLabel} ──`);
        const sorted = [
            ...ratings
        ].sort((a, b)=>b.rating - a.rating);
        for (const r of sorted){
            const emoji = r.rating >= 8.0 ? '🌟' : r.rating >= 7.0 ? '✅' : r.rating >= 6.0 ? '➖' : '📉';
            const posLabel = r.position.padEnd(4);
            const name = r.playerName.padEnd(20);
            const ratingStr = r.rating.toFixed(1).padStart(4);
            let statStr = '';
            if (r.goals > 0) statStr += `⚽${r.goals} `;
            if (r.assists > 0) statStr += `🅰️${r.assists} `;
            if (r.saves > 0) statStr += `🧤${r.saves} `;
            if (r.tackles > 2) statStr += `🦵${r.tackles} `;
            if (r.keyPasses > 1) statStr += `🔑${r.keyPasses} `;
            lines.push(`  ${emoji} [${posLabel}] ${name} ${ratingStr}  ${statStr}`);
        }
        lines.push('');
    };
    formatRatings(result.homePlayerRatings, 'EV SAHİBİ');
    formatRatings(result.awayPlayerRatings, 'DEPLASMAN');
    // ── MAÇIN ADAMI ────────────────────────────────────────────────────────
    lines.push('─'.repeat(60));
    lines.push('  🏆 MAÇIN ADAMI');
    lines.push('─'.repeat(60));
    lines.push('');
    if (motm) {
        const motmEvents = result.events.filter((e)=>e.playerId === motm.playerId && e.type !== 'chance');
        lines.push(`     ${motm.playerName} (${motm.position})`);
        lines.push(`     Puan: ${motm.rating.toFixed(1)}`);
        lines.push('');
        if (motm.goals > 0) lines.push(`     ⚽ Gol: ${motm.goals}`);
        if (motm.assists > 0) lines.push(`     🅰️ Asist: ${motm.assists}`);
        if (motm.saves > 0) lines.push(`     🧤 Kurtarış: ${motm.saves}`);
        if (motm.keyPasses > 0) lines.push(`     🔑 Ana Pas: ${motm.keyPasses}`);
        if (motm.tackles > 0) lines.push(`     🦵 Top Kapma: ${motm.tackles}`);
        lines.push('');
        lines.push('     Maçta Öne Çıkan Anlar:');
        for (const ev of motmEvents.slice(0, 5)){
            lines.push(`     • ${ev.minute}. dk — ${ev.description}`);
        }
    } else {
        lines.push('     Maçın adamı belirlenemedi.');
    }
    lines.push('');
    lines.push('═'.repeat(60));
    lines.push('');
    return lines.join('\n');
}
function applyRoleBonuses(players, playerRoles) {
    if (!playerRoles || Object.keys(playerRoles).length === 0) return players;
    return players.map((p)=>{
        const roleId = playerRoles[p.id];
        if (!roleId) return p;
        const bonuses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$tacticsRoles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRoleAttributeBonuses"])(roleId);
        if (!bonuses || Object.keys(bonuses).length === 0) return p;
        // Rol-pozisyon uyumluluk kontrolü
        // Eğer rol oyuncunun specificPosition ile uyumluysa tam bonus,
        // uyumsuzsa %50 bonus penalty uygulanır
        const roleCompat = getRolePositionCompatibility(roleId, p.specificPosition || p.position);
        const bonusScale = 0.05 * roleCompat; // Temel ölçek × uyum oranı
        const updated = {
            ...p
        };
        for (const [attr, bonus] of Object.entries(bonuses)){
            const current = updated[attr] ?? updated.rating ?? 60;
            updated[attr] = Math.min(99, Math.round(current + bonus * bonusScale));
        }
        return updated;
    });
}
/**
 * Bir rolün belirli bir pozisyonla uyumluluk oranını hesaplar.
 * Uyumlu → 1.0, Kısmen uyumlu → 0.7, Uyumsuz → 0.4
 */ function getRolePositionCompatibility(roleId, position) {
    // tacticsRoles.ts'den ROLES dizisini import etmeden basit harita kullan
    // (Çünkü ROLES zaten getRoleAttributeBonuses ile kullanılıyor)
    const rolePositionMap = {
        // Kaleci rolleri
        sweeper_keeper: [
            'GK'
        ],
        shot_stopper: [
            'GK'
        ],
        // Defans rolleri
        ball_playing_defender: [
            'CB'
        ],
        no_nonsense_cb: [
            'CB'
        ],
        offside_trap_cb: [
            'CB'
        ],
        wing_back: [
            'LB',
            'RB',
            'LWB',
            'RWB'
        ],
        inverted_fullback: [
            'LB',
            'RB'
        ],
        libero: [
            'CB'
        ],
        // Orta saha rolleri
        deep_lying_playmaker: [
            'CDM',
            'CM'
        ],
        box_to_box: [
            'CM',
            'CDM'
        ],
        mezzala: [
            'CM',
            'CAM'
        ],
        defensive_midfielder: [
            'CDM'
        ],
        advanced_playmaker: [
            'CAM',
            'CM'
        ],
        half_winger: [
            'LM',
            'RM',
            'LW',
            'RW'
        ],
        carrilero: [
            'CM',
            'CDM'
        ],
        // Forvet rolleri
        target_man: [
            'ST',
            'CF'
        ],
        poacher: [
            'ST'
        ],
        complete_forward: [
            'ST',
            'CF'
        ],
        false_nine: [
            'CF',
            'CAM'
        ],
        inside_forward: [
            'LW',
            'RW',
            'LM',
            'RM'
        ],
        winger: [
            'LW',
            'RW',
            'LM',
            'RM'
        ],
        advanced_playmaker_fwd: [
            'CF',
            'CAM'
        ]
    };
    const compatiblePositions = rolePositionMap[roleId];
    if (!compatiblePositions) return 0.7; // Bilinmeyen rol → kısmen uyumlu
    if (compatiblePositions.includes(position)) return 1.0; // Tam uyum
    // Aynı geniş grupta mı? (örn: MID rol → MID pozisyon)
    const roleGroup = getPositionGroupFromPositions(compatiblePositions);
    const playerGroup = position === 'GK' ? 'GK' : [
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ].includes(position) ? 'DEF' : [
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ].includes(position) ? 'MID' : 'FWD';
    if (roleGroup === playerGroup) return 0.7; // Aynı grup, farklı pozisyon → kısmen uyumlu
    return 0.4; // Farklı grup → zayıf uyum
}
function getPositionGroupFromPositions(positions) {
    const groups = positions.map((pos)=>pos === 'GK' ? 'GK' : [
            'CB',
            'LB',
            'RB',
            'LWB',
            'RWB'
        ].includes(pos) ? 'DEF' : [
            'CDM',
            'CM',
            'CAM',
            'LM',
            'RM',
            'LW',
            'RW'
        ].includes(pos) ? 'MID' : 'FWD');
    // En yaygın grubu döndür
    const counts = {};
    for (const g of groups)counts[g] = (counts[g] || 0) + 1;
    return Object.entries(counts).sort((a, b)=>b[1] - a[1])[0]?.[0] || 'MID';
}
// ─── Event Type Mapping ─────────────────────────────────────────────────────
function mapEnhancedTypeToLegacy(type) {
    switch(type){
        case 'goal':
            return 'GOAL';
        case 'shot_saved':
            return 'SAVE';
        case 'shot_wide':
            return 'COMMENTARY';
        case 'shot_post':
            return 'POST';
        case 'foul':
            return 'BATTLE';
        case 'yellow_card':
            return 'YELLOW';
        case 'red_card':
            return 'RED';
        case 'corner':
            return 'COMMENTARY';
        case 'free_kick':
            return 'COMMENTARY';
        case 'penalty':
            return 'PENALTY';
        case 'offside':
            return 'OFFSIDE';
        case 'substitution':
            return 'SUB';
        case 'injury':
            return 'INJURY';
        case 'save':
            return 'SAVE';
        case 'tackle':
            return 'BATTLE';
        case 'interception':
            return 'COMMENTARY';
        case 'chance':
            return 'CHANCE';
        case 'var_review':
            return 'COMMENTARY';
        case 'goal_overturned':
            return 'COMMENTARY';
        default:
            return 'COMMENTARY';
    }
}
// ─── Convert EnhancedMatchStats to LegacyMatchStats ──────────────────────────
function convertStats(enhanced) {
    return {
        possession: enhanced.possession,
        shots: enhanced.shots,
        shotsOnTarget: enhanced.shotsOnTarget,
        passing: enhanced.passAccuracy,
        tackles: enhanced.tackles,
        corners: enhanced.corners,
        fouls: enhanced.fouls,
        saves: enhanced.saves,
        yellowCards: enhanced.yellowCards,
        redCards: enhanced.redCards,
        offsides: enhanced.offsides,
        interceptions: enhanced.interceptions
    };
}
// ─── Convert EnhancedMatchResult to MatchResult (MatchDay format) ──────────
function convertEnhancedToLegacy(enhanced, homePlayers, options) {
    const legacyEvents = enhanced.events.map((e)=>{
        const mappedType = mapEnhancedTypeToLegacy(e.type);
        const team = e.team.toUpperCase();
        return {
            minute: e.minute,
            type: mappedType,
            team,
            player: e.playerName,
            text: e.description,
            assistant: e.assistPlayerName
        };
    });
    const hasHalftime = legacyEvents.some((e)=>e.type === 'HALFTIME');
    const hasFulltime = legacyEvents.some((e)=>e.type === 'FULLTIME');
    if (!hasHalftime) {
        legacyEvents.push({
            minute: 45,
            type: 'HALFTIME',
            team: 'NEUTRAL',
            text: 'İlk yarı sona erdi.'
        });
    }
    if (!hasFulltime) {
        legacyEvents.push({
            minute: 90,
            type: 'FULLTIME',
            team: 'NEUTRAL',
            text: 'Maç sona erdi.'
        });
    }
    legacyEvents.sort((a, b)=>a.minute - b.minute);
    const playerRatings = {};
    enhanced.homePlayerRatings.forEach((pr)=>{
        playerRatings[pr.playerId] = pr.rating;
    });
    const staminaLoss = {};
    homePlayers.forEach((p)=>{
        staminaLoss[p.id] = 5 + Math.random() * 12;
    });
    const playerStats = {};
    enhanced.homePlayerRatings.forEach((pr)=>{
        playerStats[pr.playerId] = {
            goals: pr.goals,
            assists: pr.assists,
            yellowCards: 0,
            redCards: 0,
            fouls: 0,
            goalDetails: {},
            saveDetails: {}
        };
    });
    enhanced.events.forEach((e)=>{
        if (e.team === 'home' && playerStats[e.playerId]) {
            if (e.type === 'yellow_card') playerStats[e.playerId].yellowCards++;
            if (e.type === 'red_card') playerStats[e.playerId].redCards++;
            if (e.type === 'foul') playerStats[e.playerId].fouls++;
        }
    });
    const motmPlayer = enhanced.homePlayerRatings.find((pr)=>pr.playerId === enhanced.manOfTheMatch);
    const motm = motmPlayer?.playerName || 'Belirlenemedi';
    const homeLegacyStats = convertStats(enhanced.homeStats);
    const awayLegacyStats = convertStats(enhanced.awayStats);
    // ── Farming Multipliers ────────────────────────────────────────────────
    // Aşırı gol/performans → farming şüphesi → büyüme çarpanı düşürülür
    const farmingMultipliers = {};
    for (const pr of enhanced.homePlayerRatings){
        let mult = 1.0;
        // Gol sayısına göre farming çarpanı
        if (pr.goals >= 3) {
            mult = 0.4; // Hat-trick: çok düşük büyüme
        } else if (pr.goals === 2) {
            mult = 0.7; // 2 gol: düşük büyüme
        }
        // 1 gol veya 0 gol: mult = 1.0 (normal)
        // Rating 9.5+ → çok yüksek performans da farming işareti olabilir
        if (pr.rating >= 9.5) {
            mult = Math.min(mult, 0.6);
        }
        farmingMultipliers[pr.playerId] = mult;
    }
    // Away oyuncuları da ekle (simetrik koruma)
    for (const pr of enhanced.awayPlayerRatings){
        let mult = 1.0;
        if (pr.goals >= 3) {
            mult = 0.4;
        } else if (pr.goals === 2) {
            mult = 0.7;
        }
        if (pr.rating >= 9.5) {
            mult = Math.min(mult, 0.6);
        }
        farmingMultipliers[pr.playerId] = mult;
    }
    return {
        score: {
            home: enhanced.homeScore,
            away: enhanced.awayScore
        },
        events: legacyEvents,
        playerRatings,
        staminaLoss,
        playerStats,
        stats: {
            home: homeLegacyStats,
            away: awayLegacyStats
        },
        motm,
        extendedStats: {
            home: enhanced.homeStats,
            away: enhanced.awayStats
        },
        weather: enhanced.weather,
        refereeName: enhanced.refereeName,
        refereePersonality: enhanced.refereePersonality,
        refereeStrictness: enhanced.refereeStrictness,
        varReviews: enhanced.varReviews,
        goalsOverturned: enhanced.goalsOverturned,
        farmingMultipliers
    };
}
// ─── Build ActiveTactic from DB row (mirrors process-match-queue buildActiveTactic) ──
function buildActiveTacticFromDB(data) {
    const tempo = Number(data.tempo || 50);
    const defLine = data.defense_line || 'standart';
    const playWidth = data.play_width || 'normal';
    return {
        formation: data.formation || '4-4-2',
        mentality: Number(data.mentality || 3),
        pressing: Boolean(data.pressing),
        passingStyle: data.passing_style || 'Karışık',
        intensity: tempo > 70 ? 'high' : tempo < 30 ? 'low' : 'normal',
        tactic_type: data.formation || '4-4-2',
        lineHeight: defLine === 'onde' ? 70 : defLine === 'geride' ? 30 : 50,
        width: playWidth === 'genis' ? 70 : playWidth === 'dar' ? 30 : 50,
        aggression: tempo > 70 ? 70 : 50,
        passingIntensity: tempo,
        screenKeeper: false,
        wasteTime: false,
        parkTheBus: defLine === 'geride',
        crossGame: playWidth === 'genis',
        loneStrikerCounter: false,
        offsideTrap: Boolean(data.pressing),
        playStyle: defLine === 'onde' ? 'hucum' : defLine === 'geride' ? 'savunma' : 'dengeli',
        tempo: tempo > 70 ? 'hizli' : tempo < 30 ? 'yavas' : 'normal',
        defensiveLine: defLine === 'onde' ? 'onde' : defLine === 'geride' ? 'geride' : 'normal'
    };
}
// ─── Default ActiveTactic (fallback) ──────────────────────────────────────────
function getDefaultTactic() {
    return {
        formation: '4-4-2',
        tactic_type: '4-4-2',
        mentality: 3,
        pressing: false,
        passingStyle: 'Karışık',
        intensity: 'normal',
        aggression: 50,
        width: 50,
        passingIntensity: 50,
        lineHeight: 50,
        screenKeeper: false,
        wasteTime: false,
        parkTheBus: false,
        crossGame: false,
        loneStrikerCounter: false,
        offsideTrap: false
    };
}
async function runUnifiedMatch(homeSquad, awaySquad, options) {
    if (!homeSquad || homeSquad.length === 0 || !awaySquad || awaySquad.length === 0) {
        throw new Error("Match Engine Error: Home or Away squad is empty.");
    }
    const homeTactic = options.activeTactic;
    // Away takım taktiği: awayProfileId verilirse Supabase'den çek, yoksa varsayılan
    let awayTactic = getDefaultTactic();
    if (options.awayProfileId) {
        try {
            const { getSupabase, isSupabaseConfigured } = await __turbopack_context__.A("[project]/src/lib/supabase.ts [app-ssr] (ecmascript, async loader)");
            if (isSupabaseConfigured()) {
                const supabase = getSupabase();
                const { data } = await supabase.from('active_tactics').select('*').eq('profile_id', options.awayProfileId).maybeSingle();
                if (data) awayTactic = buildActiveTacticFromDB(data);
            }
        } catch  {}
    }
    const refereeOptions = {
        homeTeamName: options.homeTeamName,
        awayTeamName: options.awayTeamName
    };
    if (options.refereeName) refereeOptions.refereeName = options.refereeName;
    if (options.refereePersonality) refereeOptions.refereePersonality = options.refereePersonality;
    if (options.refereeStrictness) refereeOptions.refereeStrictness = options.refereeStrictness;
    const effectiveHomeSquad = options.playerRoles ? applyRoleBonuses(homeSquad, options.playerRoles) : homeSquad;
    const simulationOptions = {
        ...refereeOptions
    };
    if (options.homeTacticModifiers) simulationOptions.homeTacticModifiers = options.homeTacticModifiers;
    if (options.awayTacticModifiers) simulationOptions.awayTacticModifiers = options.awayTacticModifiers;
    // ── Taktik skoru modifier: 50 = nötr, 100 = +%5 bonus, 0 = -%5 ceza ──
    if (options.tacticalScore) {
        const score = options.tacticalScore.overall;
        const mod = (score - 50) / 1000; // max ±0.05
        simulationOptions.homeTacticModifiers = {
            ...simulationOptions.homeTacticModifiers || {},
            goalMod: (simulationOptions.homeTacticModifiers?.goalMod || 0) + mod,
            conceedMod: (simulationOptions.homeTacticModifiers?.conceedMod || 0) - mod
        };
    }
    const homePSMods = options.homePlayStyleModifiers ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTeamPlayStyleModifiers"])(effectiveHomeSquad, homeTactic.playStyle);
    const awayPSMods = options.awayPlayStyleModifiers ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTeamPlayStyleModifiers"])(awaySquad, awayTactic.playStyle);
    simulationOptions.homePlayStyleModifiers = homePSMods;
    simulationOptions.awayPlayStyleModifiers = awayPSMods;
    // ── PROMPT 9: Maç tarihine göre tutarlı hava durumu ──
    // simulationOptions.weather zaten set edilmediyse ve matchDate verildiyse,
    // getWeatherForDate ile fikstür sayfasıyla aynı deterministik havayı kullan
    if (!simulationOptions.weather && options.matchDate) {
        try {
            const { getWeatherForDate } = await __turbopack_context__.A("[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript, async loader)");
            simulationOptions.weather = getWeatherForDate(options.matchDate);
        } catch  {}
    }
    const upgrades = options.stadiumUpgrades || {};
    // ── PROMPT 7: Auto-detect isNightMatch / isWinterMatch when not provided ──
    // matchDate verilirse onu kullan, yoksa şu anki zamana göre tespit et
    if (Object.keys(upgrades).length > 0) {
        if (options.isNightMatch === undefined || options.isWinterMatch === undefined) {
            try {
                const { detectMatchConditions } = await __turbopack_context__.A("[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript, async loader)");
                const dateStr = options.matchDate || new Date().toISOString().split('T')[0];
                const timeStr = options.matchDate ? '12:00' : `${String(new Date().getHours()).padStart(2, '0')}:00`;
                const conditions = detectMatchConditions(dateStr, timeStr);
                if (options.isNightMatch === undefined) options.isNightMatch = conditions.isNightMatch;
                if (options.isWinterMatch === undefined) options.isWinterMatch = conditions.isWinterMatch;
            } catch  {}
        }
    }
    const pitchLevel = upgrades['pitch'] || 0;
    if (pitchLevel > 0) simulationOptions.pitchPassBonus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPitchPassAccuracyBonus"])(pitchLevel);
    const heatingLevel = upgrades['heating'] || 0;
    if (heatingLevel > 0 && options.isWinterMatch) simulationOptions.heatingProtection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getHeatingWinterProtection"])(heatingLevel);
    const lightingLevel = upgrades['lighting'] || 0;
    if (lightingLevel > 0 && options.isNightMatch) simulationOptions.lightingNightBonus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLightingNightBonus"])(lightingLevel);
    if (options.pitchPassBonus !== undefined) simulationOptions.pitchPassBonus = options.pitchPassBonus;
    if (options.heatingProtection !== undefined) simulationOptions.heatingProtection = options.heatingProtection;
    if (options.lightingNightBonus !== undefined) simulationOptions.lightingNightBonus = options.lightingNightBonus;
    if (options.stadiumEffects) {
        const { modifiedHomeSquad, modifiedAwaySquad } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyStadiumEffects"])(effectiveHomeSquad, awaySquad, options.stadiumEffects);
        const enhancedResult = simulateEnhancedMatch(modifiedHomeSquad, modifiedAwaySquad, homeTactic, awayTactic, simulationOptions);
        return convertEnhancedToLegacy(enhancedResult, homeSquad, options);
    }
    if (options.stadiumUpgrades && Object.keys(options.stadiumUpgrades).length > 0) {
        const effects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeStadiumEffects"])(options.stadiumUpgrades, options.isNightMatch, options.isWinterMatch);
        const { modifiedHomeSquad, modifiedAwaySquad } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyStadiumEffects"])(effectiveHomeSquad, awaySquad, effects);
        const enhancedResult = simulateEnhancedMatch(modifiedHomeSquad, modifiedAwaySquad, homeTactic, awayTactic, simulationOptions);
        return convertEnhancedToLegacy(enhancedResult, homeSquad, options);
    }
    const enhancedResult = simulateEnhancedMatch(effectiveHomeSquad, awaySquad, homeTactic, awayTactic, simulationOptions);
    return convertEnhancedToLegacy(enhancedResult, homeSquad, options);
}
const matchEngine = {
    async runScheduledMatch (homeSquad, awaySquad, options) {
        return runUnifiedMatch(homeSquad, awaySquad, options);
    }
};
}),
"[project]/src/lib/fm/traits.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPlayStyleInfo",
    ()=>getPlayStyleInfo,
    "getTraitBgColor",
    ()=>getTraitBgColor,
    "getTraitColor",
    ()=>getTraitColor,
    "getTraitInfo",
    ()=>getTraitInfo,
    "getTraitTierLabel",
    ()=>getTraitTierLabel,
    "traitDescriptions",
    ()=>traitDescriptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traitsData.ts [app-ssr] (ecmascript)");
;
const traitDescriptions = {};
// Populate traitDescriptions from TRAITS_DATA
Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRAITS_DATA"]).forEach((posData)=>{
    if (posData?.pozitif) {
        posData.pozitif.forEach((t)=>{
            traitDescriptions[t.name] = {
                name: t.name,
                short: t.description,
                type: 'pozitif',
                counterFor: t.counterFor,
                engineEffect: t.engineEffect
            };
        });
    }
    if (posData?.negatif) {
        posData.negatif.forEach((t)=>{
            traitDescriptions[t.name] = {
                name: t.name,
                short: t.description || t.penalty || 'Negatif özellik.',
                type: 'negatif',
                counterFor: t.counterFor,
                engineEffect: t.engineEffect
            };
        });
    }
});
// Populate traitDescriptions from PERSONALITY_TRAITS
Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"]).forEach(([cat, data])=>{
    if (cat === 'nadir') {
        data.forEach((t)=>{
            traitDescriptions[t.name] = {
                name: t.name,
                short: t.description,
                type: 'pozitif'
            };
        });
    } else {
        const constTypedData = data;
        if (constTypedData?.pozitif) {
            constTypedData.pozitif.forEach((t)=>{
                traitDescriptions[t.name] = {
                    name: t.name,
                    short: t.description,
                    type: 'pozitif'
                };
            });
        }
        if (constTypedData?.negatif) {
            constTypedData.negatif.forEach((t)=>{
                traitDescriptions[t.name] = {
                    name: t.name,
                    short: t.description,
                    type: 'negatif'
                };
            });
        }
    }
});
const getTraitInfo = (traitName)=>{
    return traitDescriptions[traitName] || null;
};
const getTraitTierLabel = (traitName)=>{
    // Logic to determine tier based on name or presence in playstyles
    // For now returning a default that components expect
    return {
        label: 'Pro',
        color: 'text-emerald-400'
    };
};
const getPlayStyleInfo = (styleName)=>{
    for (const pos of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLAY_STYLES"])){
        const found = pos.find((s)=>s.name === styleName);
        if (found) return found;
    }
    return null;
};
const getTraitColor = (level)=>{
    switch(level){
        case 'MOR':
            return 'from-purple-600 to-purple-400 border-purple-500/50 text-purple-100 shadow-purple-500/20';
        case 'ALTIN':
            return 'from-amber-500 to-yellow-300 border-amber-400/50 text-amber-950 shadow-amber-500/20';
        case 'LACIVERT':
            return 'from-blue-900 to-blue-700 border-blue-600/50 text-blue-50 shadow-blue-900/20';
        case 'BEYAZ':
            return 'from-zinc-200 to-white border-zinc-300/50 text-zinc-900 shadow-white/10';
        default:
            return 'from-zinc-800 to-zinc-700 border-white/5 text-white/40 shadow-none';
    }
};
const getTraitBgColor = (level)=>{
    switch(level){
        case 'MOR':
            return 'bg-purple-500';
        case 'ALTIN':
            return 'bg-amber-500';
        case 'LACIVERT':
            return 'bg-blue-800';
        case 'BEYAZ':
            return 'bg-white';
        default:
            return 'bg-zinc-700';
    }
};
}),
"[project]/src/lib/fm/careerStats.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchPlayerCareerStats",
    ()=>fetchPlayerCareerStats,
    "updateMatchCareerStats",
    ()=>updateMatchCareerStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
async function fetchPlayerCareerStats(playerId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    const { data, error } = await supabase.from('player_career_stats').select('*').eq('player_id', playerId).order('created_at', {
        ascending: false
    });
    if (error) {
        console.error('Error fetching career stats:', error);
        return [];
    }
    return data || [];
}
async function updateMatchCareerStats(playerId, seasonId, teamId, stats) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // 1. Get existing or create
    const { data: existing, error: fetchError } = await supabase.from('player_career_stats').select('*').eq('player_id', playerId).eq('season_id', seasonId).single();
    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking career stats:', fetchError);
        return;
    }
    if (existing) {
        const newMatches = existing.matches_played + 1;
        const newRating = (existing.avg_rating * existing.matches_played + stats.rating) / newMatches;
        // Merge goal_types and save_types JSONB
        const existingGoalTypes = existing.goal_types && typeof existing.goal_types === 'object' ? existing.goal_types : {};
        const existingSaveTypes = existing.save_types && typeof existing.save_types === 'object' ? existing.save_types : {};
        const mergedGoalTypes = {
            ...existingGoalTypes
        };
        if (stats.goalTypes) {
            for (const [type, count] of Object.entries(stats.goalTypes)){
                mergedGoalTypes[type] = (mergedGoalTypes[type] || 0) + count;
            }
        }
        const mergedSaveTypes = {
            ...existingSaveTypes
        };
        if (stats.saveTypes) {
            for (const [type, count] of Object.entries(stats.saveTypes)){
                mergedSaveTypes[type] = (mergedSaveTypes[type] || 0) + count;
            }
        }
        const updateData = {
            matches_played: newMatches,
            goals: existing.goals + stats.goals,
            assists: existing.assists + stats.assists,
            yellow_cards: existing.yellow_cards + stats.yellowCards,
            red_cards: existing.red_cards + stats.redCards,
            fouls: (existing.fouls || 0) + stats.fouls,
            avg_rating: Number(newRating.toFixed(2)),
            goal_types: mergedGoalTypes,
            save_types: mergedSaveTypes,
            motm_count: (existing.motm_count || 0) + (stats.isMotm ? 1 : 0)
        };
        // ADIM 4: clean_sheets, motm, saves
        if (stats.cleanSheet) {
            updateData.clean_sheets = (existing.clean_sheets || 0) + 1;
        }
        if (stats.isMotm) {
            updateData.motm = (existing.motm || 0) + 1;
        }
        if (stats.saves && stats.saves > 0) {
            updateData.saves = (existing.saves || 0) + stats.saves;
        }
        await supabase.from('player_career_stats').update(updateData).eq('id', existing.id);
    } else {
        const insertData = {
            player_id: playerId,
            season_id: seasonId,
            team_id: teamId,
            matches_played: 1,
            goals: stats.goals,
            assists: stats.assists,
            yellow_cards: stats.yellowCards,
            red_cards: stats.redCards,
            fouls: stats.fouls,
            avg_rating: Number(stats.rating.toFixed(2)),
            clean_sheets: stats.cleanSheet ? 1 : 0,
            motm: stats.isMotm ? 1 : 0,
            motm_count: stats.isMotm ? 1 : 0,
            saves: stats.saves || 0,
            goal_types: stats.goalTypes || {},
            save_types: stats.saveTypes || {}
        };
        if (stats.position) insertData.position = stats.position;
        if (stats.playerRating) insertData.rating = stats.playerRating;
        await supabase.from('player_career_stats').insert([
            insertData
        ]);
    }
}
}),
"[project]/src/lib/fm/evolution.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UpdatePlayerStats",
    ()=>UpdatePlayerStats,
    "applyEvolution",
    ()=>applyEvolution,
    "applyMatchEvolution",
    ()=>applyMatchEvolution,
    "processDailyUpdates",
    ()=>processDailyUpdates
]);
const UpdatePlayerStats = (player, performance, farmingMult = 1.0)=>{
    const p = {
        ...player
    };
    // Growth multiplier (young faster)
    const ageFactor = p.age < 21 ? 1.5 : p.age > 30 ? 0.5 : 1.0;
    const growth = (performance - 6.0) * 0.05 * ageFactor * farmingMult;
    // Potansiyel Kontrolü
    const newRating = Math.min(p.hidden_potential || 99, p.rating + growth);
    // 2. Trait Evolution
    const newTraitLevels = {
        ...p.traitLevels || {}
    };
    let morCount = Object.values(newTraitLevels).filter((l)=>l === 'MOR').length;
    let altınCount = Object.values(newTraitLevels).filter((l)=>l === 'ALTIN').length;
    if (performance > 8.0 && Math.random() > 0.9) {
        const traitNames = p.traits || [];
        if (traitNames.length > 0) {
            const tToUpgrade = traitNames[Math.floor(Math.random() * traitNames.length)];
            const currentLvl = newTraitLevels[tToUpgrade] || 'BEYAZ';
            if (currentLvl === 'BEYAZ') newTraitLevels[tToUpgrade] = 'LACIVERT';
            else if (currentLvl === 'LACIVERT' && altınCount < 1) {
                newTraitLevels[tToUpgrade] = 'ALTIN';
                altınCount++;
            } else if (currentLvl === 'ALTIN' && morCount < 1) {
                newTraitLevels[tToUpgrade] = 'MOR';
                morCount++;
            }
        }
    }
    // 3. PlayStyle Evolution
    const newStyleLevels = {
        ...p.styleLevels || {}
    };
    if (p.playStyle && performance > 7.5 && Math.random() > 0.95) {
        const currentS = newStyleLevels[p.playStyle] || 1;
        if (currentS < 3) newStyleLevels[p.playStyle] = currentS + 1;
    }
    // NOT: Yaşa bağlı yetenek düşüşü (speed 31+, passing 33+) artık maç bazlı DEĞİL,
    // sezon bazlı uygulanıyor. Bkz: app/api/cron/season-end/route.ts adım 14c.
    // Buradan kaldırıldı — çift düşüş (match + season) engellendi.
    return {
        ...p,
        rating: newRating,
        traitLevels: newTraitLevels,
        styleLevels: newStyleLevels
    };
};
const applyMatchEvolution = (players, result, isHome)=>{
    const teamScored = isHome ? result.score.home : result.score.away;
    const teamConceded = isHome ? result.score.away : result.score.home;
    const won = teamScored > teamConceded;
    const draw = teamScored === teamConceded;
    return players.map((player)=>{
        const matchRating = player.match_ratings && player.match_ratings.length > 0 ? player.match_ratings[player.match_ratings.length - 1] : 6.5;
        let evolved = UpdatePlayerStats(player, matchRating);
        // 4. Form/Morale/Confidence
        let newForm = evolved.form || 60;
        let newMorale = evolved.morale || 60;
        let newConfidence = evolved.confidence || 60;
        if (won) {
            newMorale = Math.min(100, newMorale + 5);
            newConfidence = Math.min(100, newConfidence + 3);
        } else if (!draw) {
            newMorale = Math.max(0, newMorale - 5);
            newConfidence = Math.max(0, newConfidence - 2);
        }
        if (matchRating >= 7.5) newForm = Math.min(100, newForm + 8);
        else if (matchRating < 6.0) newForm = Math.max(0, newForm - 10);
        else newForm = Math.max(0, newForm - 2); // Idle decay
        return {
            ...evolved,
            form: newForm,
            morale: newMorale,
            confidence: newConfidence
        };
    });
};
const applyEvolution = applyMatchEvolution;
const processDailyUpdates = (players)=>{
    return players.map((p)=>{
        let newForm = p.form || 60;
        let newMorale = p.morale || 60;
        let newConfidence = p.confidence || 60;
        // Daily decay/fluctuation
        newForm = Math.max(30, Math.min(100, newForm + (Math.random() * 4 - 2)));
        newMorale = Math.max(10, Math.min(100, newMorale + (Math.random() * 2 - 1.2))); // Slight negative bias
        newConfidence = Math.max(10, Math.min(100, newConfidence + (Math.random() * 1.5 - 1)));
        // Injury handling
        let newInjury = p.injury;
        if (newInjury && newInjury.remaining_days > 0) {
            const remaining = newInjury.remaining_days - 1;
            if (remaining <= 0) {
                newInjury = undefined;
            } else {
                newInjury = {
                    ...newInjury,
                    remaining_days: remaining
                };
            }
        }
        // 5. Tenure / Club Legend Logic
        const tenure = p.tenure || 0;
        const newTenure = tenure + 1;
        let isLegend = p.is_legend || false;
        if (newTenure > 365 && !isLegend && (p.rating > 80 || p.goals > 50)) {
            isLegend = true;
        }
        return {
            ...p,
            form: newForm,
            morale: newMorale,
            confidence: newConfidence,
            injury: newInjury,
            is_legend: isLegend,
            tenure: newTenure
        };
    });
};
}),
"[project]/src/lib/fm/retirement.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "processSeasonEndRetirements",
    ()=>processSeasonEndRetirements,
    "shouldPlayerRetire",
    ()=>shouldPlayerRetire
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-ssr] (ecmascript)");
;
function shouldPlayerRetire(player) {
    const age = player.age || 0;
    const morale = player.morale ?? 60;
    const form = player.form ?? 50;
    const hasChronicInjury = player.injury?.type === 'chronic';
    const injuryHistory = player.injury_history || [];
    const severeInjuries = injuryHistory.filter((i)=>(i.duration_days || 0) >= 10).length;
    // 40+ yaş: kesin emeklilik
    if (age >= 40) return true;
    // 38-39: düşük morale veya kronik sakatlık
    if (age >= 38) {
        if (hasChronicInjury) return true;
        if (morale < 30) return true;
        if (form < 30 && severeInjuries >= 2) return true;
        if (Math.random() < 0.4) return true; // %40 rastgele emeklilik
        return false;
    }
    // 36-37: çok kötü koşullarda erken emeklilik
    if (age >= 36) {
        if (hasChronicInjury && morale < 25 && form < 25) return true;
        if (severeInjuries >= 4 && morale < 20) return true;
        return false;
    }
    return false;
}
function processSeasonEndRetirements(squad, teamId) {
    const retiredPlayers = [];
    const retirementMessages = [];
    const updatedSquad = [];
    const newTalents = [];
    for (const player of squad){
        if (shouldPlayerRetire(player)) {
            retiredPlayers.push(player);
            // Emekli oyuncunun yerine genç yetenek üret
            const pos = player.position || 'MID';
            const talent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateStarterPlayer"])(pos);
            talent.id = `talent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            newTalents.push(talent);
            // Duygusal emeklilik mesajı
            const age = player.age;
            if (age >= 40) {
                retirementMessages.push(`${player.name} (${age}) kariyerini noktalıyor. Sahada geçirdiği yıllar tarihe karıştı.`);
            } else if (player.injury?.type === 'chronic') {
                retirementMessages.push(`${player.name} (${age}) kronik sakatlığı nedeniyle kariyerine son vermek zorunda kaldı. Acı bir veda.`);
            } else if ((player.morale ?? 60) < 30) {
                retirementMessages.push(`${player.name} (${age}) motivasyonunu yitirdi ve futbola veda etti. Kariyerinde önemli bir sayfa kapandı.`);
            } else {
                retirementMessages.push(`${player.name} (${age}) sessizce futbola veda etti.`);
            }
        } else {
            updatedSquad.push(player);
        }
    }
    return {
        updatedSquad,
        retiredPlayers,
        newTalents,
        retirementMessages
    };
}
}),
"[project]/src/lib/fm/youthAcademy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════
// Managerium — Gençlik Akademisi Sistemi (Youth Academy System)
// Comprehensive youth development, scouting, and promotion logic
// ═══════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "ACADEMY_QUALITY_MULTIPLIER_BASE",
    ()=>ACADEMY_QUALITY_MULTIPLIER_BASE,
    "ACADEMY_QUALITY_MULTIPLIER_PER_LEVEL",
    ()=>ACADEMY_QUALITY_MULTIPLIER_PER_LEVEL,
    "YOUTH_FACILITIES",
    ()=>YOUTH_FACILITIES,
    "YouthCategory",
    ()=>YouthCategory,
    "calculateYouthValue",
    ()=>calculateYouthValue,
    "checkYouthPromotion",
    ()=>checkYouthPromotion,
    "formatYouthValue",
    ()=>formatYouthValue,
    "generateScoutReport",
    ()=>generateScoutReport,
    "generateYouthIntake",
    ()=>generateYouthIntake,
    "generateYouthPlayer",
    ()=>generateYouthPlayer,
    "getAcademyFacilityQualityMultiplier",
    ()=>getAcademyFacilityQualityMultiplier,
    "getAcademyYouthCount",
    ()=>getAcademyYouthCount,
    "getDefaultFacilityState",
    ()=>getDefaultFacilityState,
    "getDevelopmentCurveLabel",
    ()=>getDevelopmentCurveLabel,
    "getFacilityById",
    ()=>getFacilityById,
    "getInjuryPrevention",
    ()=>getInjuryPrevention,
    "getPotentialRatingLabel",
    ()=>getPotentialRatingLabel,
    "getScoutQualityMultiplier",
    ()=>getScoutQualityMultiplier,
    "getTrainingSpeedMultiplier",
    ()=>getTrainingSpeedMultiplier,
    "getUpgradeCost",
    ()=>getUpgradeCost,
    "getWeeklyUpkeep",
    ()=>getWeeklyUpkeep,
    "getYouthPotentialStars",
    ()=>getYouthPotentialStars,
    "processYouthWeeklyTraining",
    ()=>processYouthWeeklyTraining
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/attributeGenerator.ts [app-ssr] (ecmascript)");
;
const ACADEMY_QUALITY_MULTIPLIER_BASE = 1.0;
const ACADEMY_QUALITY_MULTIPLIER_PER_LEVEL = 0.15;
function getAcademyFacilityQualityMultiplier(academyFacilityLevel) {
    return ACADEMY_QUALITY_MULTIPLIER_BASE + academyFacilityLevel * ACADEMY_QUALITY_MULTIPLIER_PER_LEVEL;
}
function getAcademyYouthCount(academyFacilityLevel) {
    return 1 + Math.floor(academyFacilityLevel / 2);
}
var YouthCategory = /*#__PURE__*/ function(YouthCategory) {
    YouthCategory["U17"] = "U17";
    YouthCategory["U19"] = "U19";
    YouthCategory["U21"] = "U21";
    return YouthCategory;
}({});
// ─── Turkish Name Pools (40+ each) ───────────────────────────────────
const FIRST_NAMES = [
    'Ahmet',
    'Mehmet',
    'Mustafa',
    'Can',
    'Burak',
    'Emre',
    'Arda',
    'Ömer',
    'Yiğit',
    'Mert',
    'Ali',
    'Hakan',
    'Kerem',
    'Efe',
    'Deniz',
    'Tolga',
    'Sercan',
    'Cengiz',
    'Umut',
    'Berk',
    'Furkan',
    'Oğuz',
    'Salih',
    'İbrahim',
    'Yusuf',
    'Kaan',
    'Baran',
    'Alper',
    'Murat',
    'Cem',
    'Semih',
    'Batuhan',
    'Emirhan',
    'Taha',
    'Rıza',
    'Niyazi',
    'Tayfun',
    'Gökhan',
    'Savaş',
    'Erkan',
    'Eren',
    'Kadir',
    'Okan',
    'Emrullah',
    'Doğukan',
    'Sinan',
    'Volkan',
    'Çağrı',
    'İlker',
    'Melih',
    'Tolga',
    'Bedirhan'
];
const LAST_NAMES = [
    'Yılmaz',
    'Kaya',
    'Demir',
    'Çelik',
    'Şahin',
    'Yıldız',
    'Erdogan',
    'Aydın',
    'Özdemir',
    'Arslan',
    'Koç',
    'Öztürk',
    'Kılıç',
    'Doğan',
    'Keskin',
    'Akar',
    'Çetin',
    'Korkmaz',
    'Gündüz',
    'Polat',
    'Erdoğan',
    'Şen',
    'Güven',
    'Tan',
    'Aktaş',
    'Karadağ',
    'Uğur',
    'Başaran',
    'Söğüt',
    'Tuncel',
    'Balcı',
    'Kıraç',
    'Soysal',
    'Velioğlu',
    'Yavuz',
    'Dinç',
    'Köse',
    'Okutan',
    'Güneş',
    'Aksoy',
    'Özcan',
    'Tekin',
    'Şimşek',
    'Ateş',
    'Turhan',
    'Avci',
    'Tamer',
    'Önal',
    'Çevik',
    'Dalga'
];
// ─── Scout Names ──────────────────────────────────────────────────────
const SCOUT_NAMES = [
    'Hasan Hoca',
    'Ahmet Gözlemci',
    'Murat Talentscout',
    'İbrahim Genç',
    'Yusuf Akademi',
    'Kemal Analist',
    'Selçuk İzleyici',
    'Ferhat Keşifçi',
    'Cem Tarayıcı',
    'Oktay Gözlemci',
    'Hüseyin Gençlik',
    'Rıdvan Scout',
    'Nihat Yetenek Avcısı',
    'Şafak Keşif',
    'Bülent İzci'
];
// ─── Comparison Players (real player names for scout reports) ─────────
const COMPARISON_PLAYERS = {
    GK: [
        'Cenk Gönay',
        'Altay Bayındır',
        'Volkan Demirel',
        'Feyyaz Uçar'
    ],
    DEF: [
        'Çağlar Söyüncü',
        'Merih Demiral',
        'Ozan Kabak',
        'Zeki Çelik'
    ],
    MID: [
        'Hakan Çalhanoğlu',
        'Arda Güler',
        'İlkay Gündoğan',
        'Orkun Kökçü'
    ],
    FWD: [
        'Cengiz Ünder',
        'Burak Yılmaz',
        'Enes Ünal',
        'Kerem Aktürkoğlu'
    ]
};
// ─── Position Config ─────────────────────────────────────────────────
const POSITION_ARCHETYPES = {
    GK: {
        group: 'GK',
        keyStats: [
            'goalkeeping',
            'reflexes',
            'positioning',
            'jumping',
            'composure',
            'concentration'
        ],
        secondaryStats: [
            'strength',
            'agility',
            'determination',
            'bravery',
            'decisions'
        ],
        weakStats: [
            'speed',
            'dribbling',
            'shooting',
            'crossing',
            'finishing',
            'tackling',
            'marking',
            'passing'
        ]
    },
    CB: {
        group: 'DEF',
        keyStats: [
            'marking',
            'tackling',
            'heading',
            'positioning',
            'strength',
            'anticipation'
        ],
        secondaryStats: [
            'concentration',
            'composure',
            'jumping',
            'passing',
            'aggression',
            'decisions'
        ],
        weakStats: [
            'speed',
            'dribbling',
            'crossing',
            'shooting',
            'finishing',
            'agility',
            'flair'
        ]
    },
    LB: {
        group: 'DEF',
        keyStats: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        secondaryStats: [
            'dribbling',
            'passing',
            'marking',
            'positioning',
            'agility',
            'teamwork'
        ],
        weakStats: [
            'heading',
            'shooting',
            'finishing',
            'strength',
            'longShots',
            'vision'
        ]
    },
    RB: {
        group: 'DEF',
        keyStats: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        secondaryStats: [
            'dribbling',
            'passing',
            'marking',
            'positioning',
            'agility',
            'teamwork'
        ],
        weakStats: [
            'heading',
            'shooting',
            'finishing',
            'strength',
            'longShots',
            'vision'
        ]
    },
    LWB: {
        group: 'DEF',
        keyStats: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        secondaryStats: [
            'workRate',
            'passing',
            'tackling',
            'balance',
            'teamwork',
            'firstTouch'
        ],
        weakStats: [
            'heading',
            'shooting',
            'strength',
            'marking',
            'longShots',
            'finishing'
        ]
    },
    RWB: {
        group: 'DEF',
        keyStats: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        secondaryStats: [
            'workRate',
            'passing',
            'tackling',
            'balance',
            'teamwork',
            'firstTouch'
        ],
        weakStats: [
            'heading',
            'shooting',
            'strength',
            'marking',
            'longShots',
            'finishing'
        ]
    },
    CDM: {
        group: 'MID',
        keyStats: [
            'tackling',
            'positioning',
            'passing',
            'strength',
            'anticipation',
            'workRate'
        ],
        secondaryStats: [
            'marking',
            'vision',
            'decisions',
            'concentration',
            'teamwork',
            'composure'
        ],
        weakStats: [
            'dribbling',
            'shooting',
            'crossing',
            'finishing',
            'speed',
            'flair'
        ]
    },
    CM: {
        group: 'MID',
        keyStats: [
            'passing',
            'vision',
            'stamina',
            'workRate',
            'teamwork',
            'firstTouch'
        ],
        secondaryStats: [
            'dribbling',
            'technique',
            'decisions',
            'tackling',
            'longShots',
            'composure'
        ],
        weakStats: [
            'heading',
            'shooting',
            'speed',
            'marking',
            'crossing',
            'finishing'
        ]
    },
    CAM: {
        group: 'MID',
        keyStats: [
            'passing',
            'vision',
            'dribbling',
            'technique',
            'flair',
            'offTheBall'
        ],
        secondaryStats: [
            'shooting',
            'finishing',
            'longShots',
            'composure',
            'decisions',
            'creativity'
        ],
        weakStats: [
            'tackling',
            'marking',
            'heading',
            'strength',
            'stamina',
            'positioning'
        ]
    },
    LM: {
        group: 'MID',
        keyStats: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        secondaryStats: [
            'passing',
            'firstTouch',
            'technique',
            'agility',
            'balance',
            'teamwork'
        ],
        weakStats: [
            'shooting',
            'finishing',
            'heading',
            'marking',
            'tackling',
            'strength'
        ]
    },
    RM: {
        group: 'MID',
        keyStats: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        secondaryStats: [
            'passing',
            'firstTouch',
            'technique',
            'agility',
            'balance',
            'teamwork'
        ],
        weakStats: [
            'shooting',
            'finishing',
            'heading',
            'marking',
            'tackling',
            'strength'
        ]
    },
    LW: {
        group: 'MID',
        keyStats: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        secondaryStats: [
            'finishing',
            'firstTouch',
            'technique',
            'balance',
            'offTheBall',
            'vision'
        ],
        weakStats: [
            'heading',
            'strength',
            'tackling',
            'marking',
            'stamina',
            'positioning'
        ]
    },
    RW: {
        group: 'MID',
        keyStats: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        secondaryStats: [
            'finishing',
            'firstTouch',
            'technique',
            'balance',
            'offTheBall',
            'vision'
        ],
        weakStats: [
            'heading',
            'strength',
            'tackling',
            'marking',
            'stamina',
            'positioning'
        ]
    },
    CF: {
        group: 'FWD',
        keyStats: [
            'shooting',
            'finishing',
            'passing',
            'vision',
            'dribbling',
            'offTheBall'
        ],
        secondaryStats: [
            'technique',
            'firstTouch',
            'composure',
            'flair',
            'decisions',
            'balance'
        ],
        weakStats: [
            'heading',
            'speed',
            'strength',
            'tackling',
            'marking',
            'stamina'
        ]
    },
    ST: {
        group: 'FWD',
        keyStats: [
            'shooting',
            'finishing',
            'heading',
            'speed',
            'offTheBall',
            'strength'
        ],
        secondaryStats: [
            'acceleration',
            'jumping',
            'composure',
            'aggression',
            'determination',
            'balance'
        ],
        weakStats: [
            'vision',
            'crossing',
            'tackling',
            'marking',
            'dribbling',
            'passing'
        ]
    }
};
const GROUP_POSITIONS = {
    GK: [
        'GK'
    ],
    DEF: [
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ],
    MID: [
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ],
    FWD: [
        'CF',
        'ST'
    ]
};
// ─── Personality trait pools for youth ───────────────────────────────
const YOUTH_PERSONALITY_TRAITS = [
    // Positive
    'Profesyonel',
    'Disiplinli',
    'Çalışkan',
    'Hırslı',
    'Kazanan karakter',
    'Takım oyuncusu',
    'Sessiz lider',
    'Sadık',
    'Gençlere destek olur',
    'Büyük maç oyuncusu',
    'Soğukkanlı',
    'Geri dönüş lideri',
    'Baskı sever',
    // Negative
    'Tembel',
    'Disiplinsiz',
    'Gece hayatı düşkünü',
    'Rahatına düşkün',
    'İsteksiz',
    'Egoist',
    'Problem çıkaran',
    'Kibirli',
    'Panikçi',
    'Kırılgan mental',
    'Özgüven sorunu'
];
const POSITIVE_YOUTH_TRAITS = [
    'Profesyonel',
    'Disiplinli',
    'Çalışkan',
    'Hırslı',
    'Kazanan karakter',
    'Takım oyuncusu',
    'Sessiz lider',
    'Sadık',
    'Gençlere destek olur',
    'Büyük maç oyuncusu',
    'Soğukkanlı',
    'Geri dönüş lideri',
    'Baskı sever'
];
const NEGATIVE_YOUTH_TRAITS = [
    'Tembel',
    'Disiplinsiz',
    'Gece hayatı düşkünü',
    'Rahatına düşkün',
    'İsteksiz',
    'Egoist',
    'Problem çıkaran',
    'Kibirli',
    'Panikçi',
    'Kırılgan mental',
    'Özgüven sorunu'
];
// ─── Youth trait pools (position-based) ──────────────────────────────
const YOUTH_TRAITS_BY_GROUP = {
    GK: [
        'Refleks canavarı',
        'Güvenli eller',
        '1v1 ustası',
        'Hava hakimiyeti',
        'Lider kaleci',
        'Sweeper keeper',
        'Penaltı ustası',
        'Büyük maç kalecisi'
    ],
    DEF: [
        'Kale gibi',
        'Top kapma uzmanı',
        'Pozisyon ustası',
        'Hava hakimiyeti',
        'Markajcı',
        'Lider stoper',
        'Ofsayt ustası',
        'Hızlı stoper',
        'Topla çıkan stoper',
        'Uzun pas ustası'
    ],
    MID: [
        'Oyun kurucu',
        'Top dağıtıcı',
        'Box-to-box',
        'Pres ustası',
        'Top saklayan',
        'Oyun görüşü yüksek',
        'Boşluk bulucu',
        'Tempo kontrolcüsü',
        '10 numara',
        'Uzaktan şutçu'
    ],
    FWD: [
        'Bitirici',
        'Pozisyoncu',
        'Hızlı forvet',
        'Fiziksel santrafor',
        'Fırsatçı',
        'Boşluk avcısı',
        'Gol makinesi',
        'Kontra canavarı',
        'Büyük maç oyuncusu'
    ]
};
// ─── Academy Rating/Potential Ranges by Level ────────────────────────
const ACADEMY_LEVEL_CONFIG = {
    1: {
        ratingRange: [
            40,
            52
        ],
        potentialRange: [
            55,
            68
        ],
        wonderkidChance: 0.005,
        avgStatLevel: 42,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.35,
            MID: 0.40,
            FWD: 0.20
        }
    },
    2: {
        ratingRange: [
            42,
            56
        ],
        potentialRange: [
            58,
            72
        ],
        wonderkidChance: 0.01,
        avgStatLevel: 46,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.35,
            MID: 0.40,
            FWD: 0.20
        }
    },
    3: {
        ratingRange: [
            44,
            60
        ],
        potentialRange: [
            60,
            78
        ],
        wonderkidChance: 0.02,
        avgStatLevel: 50,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.35,
            MID: 0.40,
            FWD: 0.20
        }
    },
    4: {
        ratingRange: [
            46,
            64
        ],
        potentialRange: [
            62,
            85
        ],
        wonderkidChance: 0.035,
        avgStatLevel: 54,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.35,
            MID: 0.40,
            FWD: 0.20
        }
    },
    5: {
        ratingRange: [
            48,
            68
        ],
        potentialRange: [
            65,
            90
        ],
        wonderkidChance: 0.05,
        avgStatLevel: 58,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.35,
            MID: 0.40,
            FWD: 0.20
        }
    },
    6: {
        ratingRange: [
            55,
            70
        ],
        potentialRange: [
            75,
            90
        ],
        wonderkidChance: 0.08,
        avgStatLevel: 62,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.30,
            MID: 0.40,
            FWD: 0.25
        }
    },
    7: {
        ratingRange: [
            58,
            73
        ],
        potentialRange: [
            78,
            92
        ],
        wonderkidChance: 0.10,
        avgStatLevel: 66,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.30,
            MID: 0.40,
            FWD: 0.25
        }
    },
    8: {
        ratingRange: [
            60,
            75
        ],
        potentialRange: [
            80,
            94
        ],
        wonderkidChance: 0.12,
        avgStatLevel: 70,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.28,
            MID: 0.40,
            FWD: 0.27
        }
    },
    9: {
        ratingRange: [
            62,
            77
        ],
        potentialRange: [
            82,
            96
        ],
        wonderkidChance: 0.15,
        avgStatLevel: 74,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.28,
            MID: 0.40,
            FWD: 0.27
        }
    },
    10: {
        ratingRange: [
            65,
            80
        ],
        potentialRange: [
            85,
            98
        ],
        wonderkidChance: 0.20,
        avgStatLevel: 78,
        positionDistribution: {
            GK: 0.05,
            DEF: 0.25,
            MID: 0.40,
            FWD: 0.30
        }
    }
};
// ─── Turkish Assessment Templates ────────────────────────────────────
const OVERALL_ASSESSMENTS = {
    excellent: [
        'Bu oyuncu geleceğin yıldızı olabilir. Şu anki seviyesi yaşına göre oldukça yüksek.',
        'Mükemmel bir yetenek. Rakipleri arasında sıyrılacak kalitede.',
        'Nadir görülen bir potansiyel var. Her yönüyle dikkat çekiyor.',
        'Olağanüstü yetenekli bir genç. Özel ilgi gerektiriyor.'
    ],
    good: [
        'Güçlü bir yetenek. Düzenli antrenmanla ilk takıma çıkabilir.',
        'Üst düzey bir aday. Gelişime açık birçok alanı var.',
        'İyi bir temel var. Doğru yönlendirmeyle önemli bir oyuncu olabilir.',
        'Potansiyel yüksek. Zamanla açığa çıkacak bir yetenek.'
    ],
    average: [
        'Ortalama üstü bir yetenek. Sabırla geliştirilmeli.',
        'İdmanlı bir oyuncu. Beklentileri karşılayabilir.',
        'Kullanışlı bir genç. Belirli bir rolde değer katabilir.'
    ],
    below: [
        'Gelişmesi için çok çalışması gerekiyor. Şu an sınırlı etki.',
        'Potansiyeli düşük. Yedek kulübesi için düşünülmeli.',
        'Rakiplerinin gerisinde. Acil gelişim programı lazım.'
    ]
};
const STRENGTH_DESCRIPTIONS = {
    speed: [
        'Çok hızlı',
        'İnanılmaz patlayıcı hız',
        'Rüzgar gibi koşar',
        'Hızlı'
    ],
    passing: [
        'Pasları keskin',
        'Harika pas vizyonu',
        'Top dağıtımı mükemmel',
        'Pas oranı yüksek'
    ],
    shooting: [
        'Güçlü şut atar',
        'Bitirici vuruşları etkili',
        'Şut kalitesi iyi'
    ],
    defending: [
        'Güçlü müdahaleler',
        'Defansif açıdan sağlam',
        'Top kapma becerisi gelişmiş'
    ],
    power: [
        'Fiziksel olarak güçlü',
        'İkili mücadelelerde üstün'
    ],
    goalkeeping: [
        'Refleksleri hızlı',
        'Kurtarışları güvenilir',
        'Kale hakimiyeti iyi'
    ],
    dribbling: [
        'Top kontrolü muazzam',
        'Dribling yeteneği dikkat çekici',
        'Boğazına kadar top saklar'
    ],
    finishing: [
        'Bitiricilik gücü yüksek',
        'Net fırsatları değerlendirir',
        'Gol hissi gelişmiş'
    ],
    heading: [
        'Hava toplarında etkili',
        'Kafa vuruşları güçlü',
        'Hakimiyeti iyi'
    ],
    vision: [
        'Saha görüşü geniş',
        'Oyun okuyucu',
        'Önden görme yeteneği var'
    ],
    tackling: [
        'Müdahaleleri temiz',
        'Top çalma oranı yüksek',
        'Zamanlaması iyi'
    ],
    anticipation: [
        'Oyunu önceden okur',
        'Hamleleri sezer',
        'Pozisyon alma yeteneği gelişmiş'
    ],
    workRate: [
        'Çalışkan bir oyuncu',
        'Asla pes etmez',
        'Sahayı ter dökmüş halde terk eder'
    ],
    composure: [
        'Soğukkanlı',
        'Baskı altında sakin kalır',
        'Kritik anlarda güvenilir'
    ],
    leadership: [
        'Doğal lider',
        'Sahayı yönlendirir',
        'Arkadaşlarını motive eder'
    ],
    determination: [
        'Kararlı karakter',
        'Mücadeleci ruhu var',
        'Vazgeçmez'
    ],
    flair: [
        'Özel yetenekli',
        'Kreatif oyuncu',
        'Sürpriz yapabilir'
    ],
    stamina: [
        'Dayanıklılığı yüksek',
        '90 dakika boyunca etkili',
        'Kondisyonu mükemmel'
    ],
    crossing: [
        'Ortaları isabetli',
        'Kanat bindirmeleri etkili'
    ],
    longShots: [
        'Uzaktan şutları tehlikeli',
        'Distan golcü'
    ],
    offTheBall: [
        'Boşlukları iyi bulur',
        'Pozisyon zekası yüksek'
    ],
    technique: [
        'Tekniği gelişmiş',
        'Top ayağında dans eder'
    ],
    marking: [
        'Markajı sıkı',
        'Rakibi izler'
    ],
    firstTouch: [
        'İlk kontrolleri harika',
        'Topu yumuşak indirir'
    ],
    positioning: [
        'Pozisyon alması doğru',
        'Sahada yerini bilir'
    ],
    acceleration: [
        'Hızlanması muazzam',
        'İlk adımları patlayıcı'
    ],
    agility: [
        'Çevik hareket eder',
        'Yön değiştirmesi hızlı'
    ],
    jumping: [
        'Zıplaması etkileyici',
        'Havada hakim'
    ],
    strength: [
        'Fiziksel gücü yüksek',
        'Güreş gücü var'
    ],
    concentration: [
        'Konsantrasyonu uzun süreli',
        'Dikkati dağılmaz'
    ],
    decisions: [
        'Kararları doğru',
        'Oyun zekası gelişmiş'
    ],
    teamwork: [
        'Takım oyununa yatkın',
        'Takım arkadaşı için oynar'
    ],
    aggression: [
        'Agresif oyun tarzı',
        'Rakipten korkmaz'
    ],
    bravery: [
        'Cesur oyuncu',
        'Risk almaktan çekinmez'
    ],
    balance: [
        'Dengesi sağlam',
        'İkili mücadelelerde yıkılmaz'
    ],
    control: [
        'Top kontrolü iyi',
        'Topu ayağında tutar'
    ]
};
const WEAKNESS_DESCRIPTIONS = {
    speed: [
        'Hızı yetersiz',
        'Patlayıcı hız eksik',
        'Sprinter forvetlerin gerisinde'
    ],
    passing: [
        'Pas oranı düşük',
        'Kararlarında pas hatası var',
        'Top dağıtımı zayıf'
    ],
    shooting: [
        'Şut kalitesi düşük',
        'Bitiricilik zayıf',
        'Fırsatları kaçırıyor'
    ],
    defending: [
        'Savunması yetersiz',
        'Müdahalelerde geç kalıyor'
    ],
    power: [
        'Fiziksel olarak zayıf',
        'İkili mücadelelerde düşüyor'
    ],
    dribbling: [
        'Top kontrolü zayıf',
        'Basit kayıplar yapıyor',
        'Baskı altında top kaybeder'
    ],
    finishing: [
        'Bitiricilik vasat',
        'Net fırsatları harcıyor'
    ],
    heading: [
        'Hava toplarında etkisiz',
        'Kafa vuruşları eksik'
    ],
    vision: [
        'Saha görüşü dar',
        'Pas opsiyonlarını görmekte geç kalıyor'
    ],
    tackling: [
        'Top çalmada başarısız',
        'Müdahalelerde hata yapıyor'
    ],
    workRate: [
        'Çalışkanlığı yetersiz',
        'Sahada pasif kalıyor'
    ],
    composure: [
        'Soğukkanlı değil',
        'Baskı altında panik yapıyor'
    ],
    stamina: [
        'Dayanıklılığı düşük',
        'Maç sonu yorgun düşüyor'
    ],
    crossing: [
        'Ortaları isabetsiz',
        'Kanat bindirmeleri zayıf'
    ],
    longShots: [
        'Uzaktan şutları etkisiz'
    ],
    offTheBall: [
        'Boşluk bulamıyor',
        'Sahada kayboluyor'
    ],
    technique: [
        'Tekniği ham',
        'Top ayağında rahat değil'
    ],
    marking: [
        'Markajı gevşek',
        'Rakibini kaybediyor'
    ],
    firstTouch: [
        'İlk kontrolleri kötü',
        'Topu kontrol etmekte zorlanıyor'
    ],
    positioning: [
        'Pozisyon alması hatalı',
        'Yerini iyi seçemiyor'
    ],
    concentration: [
        'Konsantrasyonu düşük',
        'Maçın içinde kaybolabiliyor'
    ],
    decisions: [
        'Kararları acele',
        'Yanlış tercih yapıyor'
    ],
    teamwork: [
        'Bencil oynuyor',
        'Takım oyununa uzak'
    ],
    aggression: [
        'Aşırı agresif',
        'Kart görmeye meyilli'
    ],
    leadership: [
        'Liderlik yok',
        'Saha içinde pasif'
    ],
    determination: [
        'Kararsız',
        'Mücadele ruhu zayıf'
    ],
    flair: [
        'Kreatif değil',
        'Öngörülebilir oyun tarzı'
    ],
    anticipation: [
        'Oyunu okuyamıyor',
        'Hamleleri sezemiyor'
    ],
    acceleration: [
        'Hızlanması yavaş',
        'İlk adımlar ağır'
    ],
    agility: [
        'Çevikliği yetersiz',
        'Yön değiştirmekte zorlanıyor'
    ],
    jumping: [
        'Zıplaması zayıf',
        'Havada etkisiz'
    ],
    strength: [
        'Fiziksel olarak yetersiz',
        'Güç mücadelelerinde düşüyor'
    ],
    balance: [
        'Dengesi zayıf',
        'Basit çelme takılır'
    ],
    control: [
        'Topu tutamıyor',
        'Kontrolü kötü'
    ]
};
const RECOMMENDED_ROLES = {
    GK: [
        'Birinci Kaleci',
        'Yedek Kaleci',
        'Uzun vadeli kaleci projesi'
    ],
    CB: [
        'Merkez Defans',
        'Sağ/Sol Stoper',
        'Boşta oyuncu'
    ],
    LB: [
        'Sol Bek',
        'Alternatif Sol Bek',
        'Kanat bek olarak geliştirilmeli'
    ],
    RB: [
        'Sağ Bek',
        'Alternatif Sağ Bek',
        'Kanat bek olarak geliştirilmeli'
    ],
    LWB: [
        'Sol Kanat Beki',
        'Alternatif LWB'
    ],
    RWB: [
        'Sağ Kanat Beki',
        'Alternatif RWB'
    ],
    CDM: [
        'Defansif Orta Saha',
        'Pivot',
        'Oyun bozan CDM'
    ],
    CM: [
        'Merkez Orta Saha',
        'Box-to-box',
        'Saha genelinde 8 numara'
    ],
    CAM: [
        'Ofansif Orta Saha',
        '10 numara',
        'Göbek oyuncusu'
    ],
    LM: [
        'Sol Açık',
        'Kanat oyuncusu',
        'Alternatif sol kanat'
    ],
    RM: [
        'Sağ Açık',
        'Kanat oyuncusu',
        'Alternatif sağ kanat'
    ],
    LW: [
        'Sol Kanat',
        'Kanat forvet',
        'Sol kanat hücumcusu'
    ],
    RW: [
        'Sağ Kanat',
        'Kanat forvet',
        'Sağ kanat hücumcusu'
    ],
    CF: [
        'Göbek Forvet',
        'İkinci forvet',
        '10 numara rolünde'
    ],
    ST: [
        'Santrfor',
        'Golcü',
        'Hedef adam'
    ]
};
const YOUTH_FACILITIES = [
    {
        id: 'training_pitch',
        name: 'Antrenman Saha',
        description: 'Antrenman sahası kalitesi, genç oyuncuların temel gelişim hızını belirler.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            500_000,
            1_500_000,
            4_000_000,
            8_000_000,
            15_000_000
        ],
        effects: {
            trainingSpeed: 0.12,
            scoutQuality: 0.02,
            injuryPrevention: 0.01
        },
        icon: '🏟️'
    },
    {
        id: 'gym',
        name: 'Spor Salonu',
        description: 'Modern ekipmanlar, fiziksel gelişimi hızlandırır ve sakatlık riskini azaltır.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            300_000,
            1_000_000,
            3_000_000,
            6_000_000,
            12_000_000
        ],
        effects: {
            trainingSpeed: 0.08,
            scoutQuality: 0.0,
            injuryPrevention: 0.03
        },
        icon: '🏋️'
    },
    {
        id: 'medical_center',
        name: 'Tıp Merkezi',
        description: 'Tıbbi olanaklar, sakatlık iyileşme süresini kısaltır ve önleyici bakım sağlar.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            400_000,
            1_200_000,
            3_500_000,
            7_000_000,
            14_000_000
        ],
        effects: {
            trainingSpeed: 0.02,
            scoutQuality: 0.0,
            injuryPrevention: 0.06
        },
        icon: '🏥'
    },
    {
        id: 'analysis_room',
        name: 'Analiz Odası',
        description: 'Video analiz ve istatistik araçları, zihinsel gelişimi destekler.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            200_000,
            800_000,
            2_500_000,
            5_000_000,
            10_000_000
        ],
        effects: {
            trainingSpeed: 0.06,
            scoutQuality: 0.04,
            injuryPrevention: 0.01
        },
        icon: '📊'
    },
    {
        id: 'scout_network',
        name: 'Gözlem Ağı',
        description: 'Genişletilmiş gözlem ağı, daha kaliteli genç oyuncular keşfetmenizi sağlar.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            600_000,
            2_000_000,
            5_000_000,
            10_000_000,
            20_000_000
        ],
        effects: {
            trainingSpeed: 0.0,
            scoutQuality: 0.12,
            injuryPrevention: 0.0
        },
        icon: '🔭'
    },
    {
        id: 'dormitory',
        name: 'Yurt',
        description: 'Konaklama imkanları, genç oyuncuların kulübe bağlılığını ve adaptasyonunu artırır.',
        level: 1,
        maxLevel: 5,
        upgradeCost: [
            350_000,
            1_000_000,
            3_000_000,
            6_000_000,
            12_000_000
        ],
        effects: {
            trainingSpeed: 0.04,
            scoutQuality: 0.02,
            injuryPrevention: 0.02
        },
        icon: '🏠'
    }
];
// ─── Helper Functions ────────────────────────────────────────────────
function rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function shuffleArray(array) {
    const shuffled = [
        ...array
    ];
    for(let i = shuffled.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }
    return shuffled;
}
function getYouthCategory(age) {
    if (age <= 17) return "U17";
    if (age <= 19) return "U19";
    return "U21";
}
function pickPositionByGroup(group, config) {
    const positions = GROUP_POSITIONS[group];
    return pickRandom(positions);
}
function rollPositionGroup(academyLevel) {
    const dist = ACADEMY_LEVEL_CONFIG[academyLevel].positionDistribution;
    const roll = Math.random();
    let cumulative = 0;
    for (const [group, chance] of Object.entries(dist)){
        cumulative += chance;
        if (roll <= cumulative) {
            return group;
        }
    }
    return 'MID';
}
// ─── Stat Generation ─────────────────────────────────────────────────
function generateYouthStats(specificPosition, baseRating, rngFn = Math.random) {
    // Pozisyon öncelik tablolarını kullan (attributeGenerator.ts)
    const posKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionKey"])(specificPosition);
    const priorities = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["positionPriorities"][posKey];
    const stats = {};
    if (priorities) {
        // Teknik nitelikler
        for (const [trKey, priority] of Object.entries(priorities.teknik)){
            const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
            if (engKey) {
                const val = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
                // Genç oyuncular için değerleri baseRating'e ölçekle
                stats[engKey] = clamp(Math.round(val * (baseRating / 65)), 5, 85);
            }
        }
        // Mental nitelikler
        for (const [trKey, priority] of Object.entries(priorities.mental)){
            const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
            if (engKey) {
                const val = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
                stats[engKey] = clamp(Math.round(val * (baseRating / 65)), 5, 85);
            }
        }
        // Fiziksel nitelikler
        for (const [trKey, priority] of Object.entries(priorities.fiziksel)){
            const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
            if (engKey) {
                const val = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
                stats[engKey] = clamp(Math.round(val * (baseRating / 65)), 5, 85);
            }
        }
        // Goalkeeping
        if (posKey === 'GK') {
            stats.goalkeeping = clamp(Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])('cok_yuksek') * (baseRating / 65)), 10, 85);
        } else {
            stats.goalkeeping = clamp(Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])('cok_dusuk') * (baseRating / 65)), 5, 35);
        }
        // offTheBall
        if (!stats.offTheBall) {
            stats.offTheBall = posKey === 'FWD' ? clamp(Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])('yuksek') * (baseRating / 65)), 5, 85) : clamp(Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAttributeValue"])('orta') * (baseRating / 65)), 5, 85);
        }
    } else {
        // Fallback: eski arketip sistemi
        const arch = POSITION_ARCHETYPES[specificPosition];
        for (const stat of arch.keyStats){
            stats[stat] = clamp(Math.round(baseRating + (rngFn() * 12 - 4)), 10, 85);
        }
        for (const stat of arch.secondaryStats){
            stats[stat] = clamp(Math.round(baseRating - 8 + (rngFn() * 16 - 4)), 8, 75);
        }
        for (const stat of arch.weakStats){
            stats[stat] = clamp(Math.round(baseRating - 20 + (rngFn() * 14 - 4)), 5, 55);
        }
    }
    // Ensure all standard stats have values
    const allStatKeys = [
        'speed',
        'passing',
        'shooting',
        'defending',
        'power',
        'goalkeeping',
        'finishing',
        'dribbling',
        'firstTouch',
        'crossing',
        'marking',
        'tackling',
        'technique',
        'longShots',
        'offTheBall',
        'heading',
        'aggression',
        'bravery',
        'workRate',
        'decisions',
        'determination',
        'concentration',
        'leadership',
        'anticipation',
        'flair',
        'positioning',
        'composure',
        'teamwork',
        'vision',
        'agility',
        'balance',
        'strength',
        'acceleration',
        'jumping',
        'stamina',
        'control'
    ];
    for (const key of allStatKeys){
        if (!stats[key]) {
            stats[key] = clamp(Math.round(baseRating - 15 + (rngFn() * 20 - 6)), 5, 60);
        }
    }
    // Special: goalkeeping for non-GK should be very low
    if (specificPosition !== 'GK' && (stats.goalkeeping ?? 0) > 35) {
        stats.goalkeeping = clamp(Math.round(10 + rngFn() * 20), 5, 35);
    }
    // Türetilmiş istatistikler (backward compat)
    stats.shooting = clamp(Math.round(((stats.finishing || 50) + (stats.longShots || 50)) / 2), 5, 85);
    stats.defending = clamp(Math.round(((stats.tackling || 50) + (stats.marking || 50) + (stats.positioning || 50)) / 3), 5, 85);
    stats.power = stats.strength || 50;
    stats.control = stats.dribbling || 50;
    return stats;
}
function generatePersonalityTraits(isWonderkid) {
    const traits = [];
    const positiveRoll = Math.random();
    // Wonderkids always get positive traits
    if (isWonderkid) {
        const shuffled = shuffleArray(POSITIVE_YOUTH_TRAITS);
        traits.push(shuffled[0]); // At least one strong positive
        if (Math.random() < 0.6) traits.push(shuffled[1]);
        if (Math.random() < 0.3) traits.push(shuffled[2]);
    } else {
        // Normal distribution: ~70% get at least one positive, ~30% get negative
        if (positiveRoll < 0.5) {
            traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
            if (Math.random() < 0.3) traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
        } else if (positiveRoll < 0.75) {
            traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
            traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
        } else {
            traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
            if (Math.random() < 0.4) traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
        }
    }
    return traits;
}
function pickYouthTraits(positionGroup) {
    const pool = YOUTH_TRAITS_BY_GROUP[positionGroup] || [];
    const traits = [];
    const traitLevels = {};
    const numTraits = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1;
    const shuffled = shuffleArray(pool);
    const levels = [
        'MOR',
        'ALTIN',
        'LACIVERT',
        'BEYAZ'
    ];
    for(let i = 0; i < Math.min(numTraits, shuffled.length); i++){
        const traitName = shuffled[i];
        traits.push(traitName);
        // First trait can be higher level
        if (i === 0) {
            const levelRoll = Math.random();
            if (levelRoll < 0.1) traitLevels[traitName] = 'MOR';
            else if (levelRoll < 0.35) traitLevels[traitName] = 'ALTIN';
            else if (levelRoll < 0.65) traitLevels[traitName] = 'LACIVERT';
            else traitLevels[traitName] = 'BEYAZ';
        } else {
            const levelRoll = Math.random();
            if (levelRoll < 0.05) traitLevels[traitName] = 'MOR';
            else if (levelRoll < 0.2) traitLevels[traitName] = 'ALTIN';
            else if (levelRoll < 0.5) traitLevels[traitName] = 'LACIVERT';
            else traitLevels[traitName] = 'BEYAZ';
        }
    }
    return {
        traits,
        traitLevels
    };
}
function determineDevelopmentCurve() {
    const roll = Math.random();
    if (roll < 0.60) return 'normal';
    if (roll < 0.75) return 'early';
    if (roll < 0.90) return 'late';
    return 'injury_prone';
}
function generateYouthPlayer(academyLevel, targetAge, rngFn = Math.random) {
    const config = ACADEMY_LEVEL_CONFIG[clamp(academyLevel, 1, 10)];
    const age = targetAge ?? rng(15, 21);
    // Determine position
    const positionGroup = rollPositionGroup(clamp(academyLevel, 1, 10));
    const specificPosition = pickPositionByGroup(positionGroup, config);
    // Check wonderkid
    const isWonderkid = Math.random() < config.wonderkidChance;
    let rating;
    let potential;
    let hidden_potential;
    if (isWonderkid) {
        rating = rng(68, 75);
        potential = rng(85, 95);
        hidden_potential = rng(90, 99);
    } else {
        const [rMin, rMax] = config.ratingRange;
        const [pMin, pMax] = config.potentialRange;
        // Age adjustment: younger players have lower ratings but same potential
        const agePenalty = Math.max(0, (18 - age) * 1.5);
        rating = clamp(Math.round(rng(rMin, rMax) - agePenalty), 40, 75);
        potential = clamp(rng(pMin, pMax), rating + 5, 95);
        hidden_potential = clamp(potential + rng(2, 12), potential, 99);
    }
    // Generate stats
    const stats = generateYouthStats(specificPosition, rating, rngFn);
    // Pick traits
    const { traits, traitLevels } = pickYouthTraits(positionGroup);
    const personalityTraits = generatePersonalityTraits(isWonderkid);
    // Development curve
    const developmentCurve = determineDevelopmentCurve();
    // Training hours (10-25 based on personality)
    let weeklyTrainingHours = rng(10, 25);
    if (personalityTraits.includes('Çalışkan')) weeklyTrainingHours = Math.min(30, weeklyTrainingHours + 5);
    if (personalityTraits.includes('Profesyonel')) weeklyTrainingHours = Math.min(30, weeklyTrainingHours + 3);
    if (personalityTraits.includes('Tembel')) weeklyTrainingHours = Math.max(8, weeklyTrainingHours - 5);
    if (personalityTraits.includes('Disiplinsiz')) weeklyTrainingHours = Math.max(8, weeklyTrainingHours - 3);
    // Quality bonus from academy level: (academyLevel - 1) * 3
    const qualityBonus = (clamp(academyLevel, 1, 10) - 1) * 3;
    const finalRating = clamp(rating + qualityBonus, 40, 80);
    const finalPotential = clamp(potential + qualityBonus, finalRating + 5, 99);
    const finalHiddenPotential = clamp(hidden_potential + qualityBonus, finalPotential, 99);
    const name = `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
    const category = getYouthCategory(age);
    const joinDate = new Date().toISOString();
    // Varsayılan milliyet: TR (Türk altyapısı)
    const nation = 'TR';
    return {
        id: `youth_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name,
        age,
        position: positionGroup,
        specificPosition,
        rating: finalRating,
        potential: finalPotential,
        hidden_potential: finalHiddenPotential,
        academyLevel,
        joinDate,
        weeklyTrainingHours,
        developmentCurve,
        isWonderkid,
        category,
        scoutReport: null,
        personalityTraits,
        traits,
        traitLevels: Object.keys(traitLevels).length > 0 ? traitLevels : undefined,
        nation,
        speed: stats.speed ?? 50,
        passing: stats.passing ?? 50,
        shooting: stats.shooting ?? 50,
        defending: stats.defending ?? 50,
        power: stats.power ?? 50,
        goalkeeping: stats.goalkeeping ?? 15,
        finishing: stats.finishing ?? 50,
        dribbling: stats.dribbling ?? 50,
        firstTouch: stats.firstTouch ?? 50,
        crossing: stats.crossing ?? 50,
        marking: stats.marking ?? 50,
        tackling: stats.tackling ?? 50,
        technique: stats.technique ?? 50,
        longShots: stats.longShots ?? 50,
        offTheBall: stats.offTheBall ?? 50,
        heading: stats.heading ?? 50,
        aggression: stats.aggression ?? 50,
        bravery: stats.bravery ?? 50,
        workRate: stats.workRate ?? 50,
        decisions: stats.decisions ?? 50,
        determination: stats.determination ?? 50,
        concentration: stats.concentration ?? 50,
        leadership: stats.leadership ?? 30,
        anticipation: stats.anticipation ?? 50,
        flair: stats.flair ?? 20,
        positioning: stats.positioning ?? 50,
        composure: stats.composure ?? 50,
        teamwork: stats.teamwork ?? 50,
        vision: stats.vision ?? 50,
        agility: stats.agility ?? 50,
        balance: stats.balance ?? 50,
        strength: stats.strength ?? 50,
        acceleration: stats.acceleration ?? stats.speed ?? 50,
        jumping: stats.jumping ?? 50,
        stamina: stats.stamina ?? 60,
        control: stats.control ?? 50,
        cond: rng(75, 95),
        form: rng(40, 70),
        morale: rng(50, 80),
        confidence: rng(40, 70),
        injured: false,
        injuryWeeksRemaining: 0,
        totalTrainingWeeks: 0,
        statsGainedThisSeason: {}
    };
}
function generateScoutReport(player) {
    const scoutName = pickRandom(SCOUT_NAMES);
    const date = new Date().toISOString();
    // Accuracy: younger players are harder to scout
    // Age 15: ~40% accurate, Age 21: ~85% accurate
    const accuracyBase = 0.4 + (player.age - 15) / 6 * 0.45;
    const isAccurate = Math.random() < accuracyBase;
    // Potential assessment (may be inaccurate for young players)
    let potentialRating;
    const truePotential = player.hidden_potential;
    if (isAccurate) {
        if (truePotential >= 88) potentialRating = 'world_class';
        else if (truePotential >= 78) potentialRating = 'high';
        else if (truePotential >= 65) potentialRating = 'medium';
        else potentialRating = 'low';
    } else {
        // Inaccurate — could be off by one tier
        const tiers = [
            'low',
            'medium',
            'high',
            'world_class'
        ];
        const trueIndex = truePotential >= 88 ? 3 : truePotential >= 78 ? 2 : truePotential >= 65 ? 1 : 0;
        const offset = Math.random() < 0.5 ? -1 : 1;
        potentialRating = tiers[clamp(trueIndex + offset, 0, 3)];
    }
    // Overall assessment
    let assessmentTier;
    if (player.rating >= 65) assessmentTier = 'excellent';
    else if (player.rating >= 58) assessmentTier = 'good';
    else if (player.rating >= 50) assessmentTier = 'average';
    else assessmentTier = 'below';
    // Wonderkids always get top assessment
    if (player.isWonderkid) assessmentTier = 'excellent';
    const overallAssessment = pickRandom(OVERALL_ASSESSMENTS[assessmentTier]);
    // Identify strengths and weaknesses
    const allStatEntries = [];
    const arch = POSITION_ARCHETYPES[player.specificPosition];
    const statMapping = {
        speed: player.speed,
        passing: player.passing,
        shooting: player.shooting,
        defending: player.defending,
        power: player.power,
        goalkeeping: player.goalkeeping,
        finishing: player.finishing,
        dribbling: player.dribbling,
        firstTouch: player.firstTouch,
        crossing: player.crossing,
        marking: player.marking,
        tackling: player.tackling,
        technique: player.technique,
        longShots: player.longShots,
        offTheBall: player.offTheBall,
        heading: player.heading,
        aggression: player.aggression,
        bravery: player.bravery,
        workRate: player.workRate,
        decisions: player.decisions,
        determination: player.determination,
        concentration: player.concentration,
        leadership: player.leadership,
        anticipation: player.anticipation,
        flair: player.flair,
        positioning: player.positioning,
        composure: player.composure,
        teamwork: player.teamwork,
        vision: player.vision,
        agility: player.agility,
        balance: player.balance,
        strength: player.strength,
        acceleration: player.acceleration,
        jumping: player.jumping,
        stamina: player.stamina,
        control: player.control
    };
    for (const [key, value] of Object.entries(statMapping)){
        if (value !== undefined) {
            const isKey = arch.keyStats.includes(key);
            allStatEntries.push({
                key,
                value,
                isKey
            });
        }
    }
    // Sort by value descending for strengths, ascending for weaknesses
    const sortedDesc = [
        ...allStatEntries
    ].sort((a, b)=>b.value - a.value);
    const sortedAsc = [
        ...allStatEntries
    ].sort((a, b)=>a.value - b.value);
    // Key stats get priority for strengths, weak stats for weaknesses
    const keyStatsHigh = sortedDesc.filter((s)=>s.isKey && s.value >= 60);
    const keyStatsLow = sortedAsc.filter((s)=>s.isKey && s.value <= 50);
    // Pick 2-4 strengths
    const numStrengths = isAccurate ? rng(2, 4) : rng(1, 3);
    const keyStrengths = [];
    const usedKeys = new Set();
    // Prioritize key stats that are high
    const strengthCandidates = [
        ...keyStatsHigh,
        ...sortedDesc.filter((s)=>!keyStatsHigh.includes(s) && s.value >= 62)
    ];
    for (const entry of strengthCandidates){
        if (keyStrengths.length >= numStrengths) break;
        if (usedKeys.has(entry.key)) continue;
        const descriptions = STRENGTH_DESCRIPTIONS[entry.key];
        if (descriptions) {
            keyStrengths.push(pickRandom(descriptions));
            usedKeys.add(entry.key);
        }
    }
    // Pick 1-2 weaknesses
    const numWeaknesses = isAccurate ? rng(1, 2) : rng(0, 1);
    const keyWeaknesses = [];
    const weaknessCandidates = [
        ...keyStatsLow,
        ...sortedAsc.filter((s)=>!keyStatsLow.includes(s) && s.value <= 45)
    ];
    for (const entry of weaknessCandidates){
        if (keyWeaknesses.length >= numWeaknesses) break;
        if (usedKeys.has(entry.key)) continue;
        const descriptions = WEAKNESS_DESCRIPTIONS[entry.key];
        if (descriptions) {
            keyWeaknesses.push(pickRandom(descriptions));
            usedKeys.add(entry.key);
        }
    }
    // If no weaknesses found, add a generic one
    if (keyWeaknesses.length === 0 && numWeaknesses > 0) {
        keyWeaknesses.push('Deneyim eksikliği var');
    }
    // Comparison player (only if rating > 70 and accurate)
    let comparisonPlayer = null;
    if (player.rating > 70 && isAccurate) {
        const comparisons = COMPARISON_PLAYERS[player.position];
        comparisonPlayer = comparisons ? `Bu oyuncu genç ${pickRandom(comparisons)}'e benziyor` : null;
    }
    // Recommended role
    const recommendedRole = pickRandom(RECOMMENDED_ROLES[player.specificPosition]);
    return {
        scoutName,
        date,
        overallAssessment,
        keyStrengths,
        keyWeaknesses,
        potentialRating,
        comparisonPlayer,
        recommendedRole
    };
}
function processYouthWeeklyTraining(player, facilities) {
    // If injured, just decrement injury timer
    if (player.injured) {
        return {
            ...player,
            injuryWeeksRemaining: Math.max(0, player.injuryWeeksRemaining - 1),
            injured: player.injuryWeeksRemaining > 1,
            totalTrainingWeeks: player.totalTrainingWeeks + 1
        };
    }
    // Check for injury (injury_prone: 10%, others: 1-3%)
    const medicalFacility = facilities.find((f)=>f.facilityId === 'medical_center');
    const gymFacility = facilities.find((f)=>f.facilityId === 'gym');
    const injuryReduction = (medicalFacility ? medicalFacility.currentLevel * YOUTH_FACILITIES.find((f)=>f.id === 'medical_center').effects.injuryPrevention : 0) + (gymFacility ? gymFacility.currentLevel * YOUTH_FACILITIES.find((f)=>f.id === 'gym').effects.injuryPrevention : 0);
    let injuryChance = player.developmentCurve === 'injury_prone' ? 0.10 : 0.02;
    injuryChance = Math.max(0.005, injuryChance - injuryReduction);
    // Overtraining injury risk
    if (player.weeklyTrainingHours > 25) {
        injuryChance += 0.02;
    }
    if (Math.random() < injuryChance) {
        const injuryWeeks = player.developmentCurve === 'injury_prone' ? rng(2, 6) : rng(1, 3);
        return {
            ...player,
            injured: true,
            injuryWeeksRemaining: injuryWeeks,
            morale: Math.max(10, player.morale - rng(5, 15)),
            totalTrainingWeeks: player.totalTrainingWeeks + 1
        };
    }
    // Calculate training speed
    const updated = {
        ...player
    };
    // --- Facility bonuses ---
    let trainingMultiplier = 1.0;
    for (const fac of facilities){
        const facilityDef = YOUTH_FACILITIES.find((f)=>f.id === fac.facilityId);
        if (facilityDef) {
            trainingMultiplier += facilityDef.effects.trainingSpeed * fac.currentLevel;
        }
    }
    // --- Development curve modifiers ---
    let curveModifier = 1.0;
    switch(player.developmentCurve){
        case 'early':
            // Faster gains 15-18, slower 19+
            if (player.age <= 18) curveModifier = 1.35;
            else if (player.age <= 20) curveModifier = 0.8;
            else curveModifier = 0.5;
            break;
        case 'late':
            // Slower 15-18, faster 19+
            if (player.age <= 17) curveModifier = 0.65;
            else if (player.age <= 18) curveModifier = 0.85;
            else if (player.age <= 20) curveModifier = 1.3;
            else curveModifier = 1.1;
            break;
        case 'injury_prone':
            // Normal when not injured, but overall slightly less
            curveModifier = 0.9;
            break;
        case 'normal':
        default:
            // Slight peak 17-19
            if (player.age >= 17 && player.age <= 19) curveModifier = 1.1;
            else curveModifier = 1.0;
            break;
    }
    // --- Age modifier (younger = more room to grow) ---
    let ageModifier = 1.0;
    if (player.age <= 16) ageModifier = 1.2;
    else if (player.age <= 18) ageModifier = 1.15;
    else if (player.age <= 20) ageModifier = 1.0;
    else ageModifier = 0.7;
    // --- Wonderkid bonus ---
    const wonderkidBonus = player.isWonderkid ? 1.2 : 1.0;
    // --- Personality trait modifiers ---
    let personalityModifier = 1.0;
    if (player.personalityTraits.includes('Profesyonel')) personalityModifier += 0.15;
    if (player.personalityTraits.includes('Çalışkan')) personalityModifier += 0.1;
    if (player.personalityTraits.includes('Disiplinli')) personalityModifier += 0.08;
    if (player.personalityTraits.includes('Hırslı')) personalityModifier += 0.1;
    if (player.personalityTraits.includes('Tembel')) personalityModifier -= 0.15;
    if (player.personalityTraits.includes('İsteksiz')) personalityModifier -= 0.1;
    if (player.personalityTraits.includes('Disiplinsiz')) personalityModifier -= 0.08;
    personalityModifier = Math.max(0.3, personalityModifier);
    // --- Training hours modifier ---
    const hoursModifier = player.weeklyTrainingHours / 20; // 20 hours = 1.0x
    // --- Potential cap: if approaching potential, slow down growth ---
    const potentialGap = player.hidden_potential - player.rating;
    let potentialCapModifier = 1.0;
    if (potentialGap <= 5) potentialCapModifier = 0.2;
    else if (potentialGap <= 10) potentialCapModifier = 0.5;
    else if (potentialGap <= 15) potentialCapModifier = 0.75;
    else if (potentialGap <= 20) potentialCapModifier = 0.9;
    // --- Final training speed ---
    const finalSpeed = trainingMultiplier * curveModifier * ageModifier * wonderkidBonus * personalityModifier * hoursModifier * potentialCapModifier;
    // --- Apply stat gains ---
    const arch = POSITION_ARCHETYPES[player.specificPosition];
    const statKeys = Object.keys(updated);
    const mutableStatKeys = [
        'speed',
        'passing',
        'shooting',
        'defending',
        'power',
        'goalkeeping',
        'finishing',
        'dribbling',
        'firstTouch',
        'crossing',
        'marking',
        'tackling',
        'technique',
        'longShots',
        'offTheBall',
        'heading',
        'aggression',
        'bravery',
        'workRate',
        'decisions',
        'determination',
        'concentration',
        'leadership',
        'anticipation',
        'flair',
        'positioning',
        'composure',
        'teamwork',
        'vision',
        'agility',
        'balance',
        'strength',
        'acceleration',
        'jumping',
        'stamina',
        'control'
    ];
    const baseGainPerWeek = 0.35; // Base gain in stat points per week
    const statsGained = {
        ...player.statsGainedThisSeason
    };
    for (const key of mutableStatKeys){
        const currentValue = updated[key] ?? 50;
        // Skip goalkeeping for non-GK
        if (key === 'goalkeeping' && player.specificPosition !== 'GK') continue;
        // Determine weight for this stat
        let statWeight = 0.3; // Default low weight
        if (arch.keyStats.includes(key)) statWeight = 1.0;
        else if (arch.secondaryStats.includes(key)) statWeight = 0.6;
        // Calculate gain
        const rawGain = baseGainPerWeek * finalSpeed * statWeight;
        // Random variance (±40%)
        const variance = 0.6 + Math.random() * 0.8;
        const gain = rawGain * variance;
        // Don't grow past hidden potential (loosely applied per stat)
        const statCap = Math.min(player.hidden_potential + 5, 99);
        const newValue = clamp(Math.round(currentValue + gain), 1, statCap);
        if (newValue !== currentValue) {
            updated[key] = newValue;
            statsGained[key] = (statsGained[key] || 0) + (newValue - currentValue);
        }
    }
    // Update overall rating based on stat average of key stats
    let keyStatSum = 0;
    let keyStatCount = 0;
    for (const stat of arch.keyStats){
        const val = updated[stat];
        if (val !== undefined) {
            keyStatSum += val;
            keyStatCount++;
        }
    }
    // Also include the 6 core stats
    const coreStats = [
        updated.speed,
        updated.passing,
        updated.shooting,
        updated.defending,
        updated.power,
        updated.goalkeeping
    ];
    for (const val of coreStats){
        if (val !== undefined) {
            keyStatSum += val;
            keyStatCount++;
        }
    }
    const avgStat = keyStatCount > 0 ? keyStatSum / keyStatCount : player.rating;
    const newRating = clamp(Math.round(avgStat * 0.6 + player.rating * 0.4), player.rating - 1, Math.min(player.hidden_potential, 95));
    // Update morale/confidence slightly based on growth
    const totalGained = Object.values(statsGained).reduce((a, b)=>a + b, 0);
    const moraleChange = totalGained > 0 ? 1 : 0;
    const confidenceChange = Math.random() < 0.1 ? rng(-2, 3) : 0;
    return {
        ...updated,
        rating: newRating,
        morale: clamp(player.morale + moraleChange, 10, 100),
        confidence: clamp(player.confidence + confidenceChange, 10, 100),
        totalTrainingWeeks: player.totalTrainingWeeks + 1,
        statsGainedThisSeason: statsGained
    };
}
function checkYouthPromotion(player) {
    const reasons = [];
    const warnings = [];
    // --- Hard requirements ---
    const ageOk = player.age >= 17;
    const ratingOk = player.rating >= 65;
    // Count stats above 60
    const statValues = [
        player.speed,
        player.passing,
        player.shooting,
        player.defending,
        player.power,
        player.finishing ?? 50,
        player.dribbling ?? 50,
        player.firstTouch ?? 50,
        player.tackling ?? 50,
        player.marking ?? 50,
        player.heading ?? 50,
        player.vision ?? 50,
        player.stamina ?? 60,
        player.composure ?? 50,
        player.workRate ?? 50,
        player.decisions ?? 50,
        player.determination ?? 50
    ];
    const statsAbove60 = statValues.filter((s)=>s >= 60).length;
    const statsAbove65 = statValues.filter((s)=>s >= 65).length;
    const statsAbove70 = statValues.filter((s)=>s >= 70).length;
    // --- Confidence scoring ---
    let confidence = 0;
    // Age factor (0-25)
    if (player.age >= 20) confidence += 25;
    else if (player.age >= 18) confidence += 20;
    else if (player.age >= 17) confidence += 10;
    else confidence += 0;
    // Rating factor (0-30)
    if (player.rating >= 72) confidence += 30;
    else if (player.rating >= 68) confidence += 25;
    else if (player.rating >= 65) confidence += 18;
    else if (player.rating >= 62) confidence += 8;
    else confidence += 0;
    // Stats above 60 factor (0-25)
    confidence += Math.min(25, statsAbove60 * 4);
    // Stats above 65 factor (0-10)
    confidence += Math.min(10, statsAbove65 * 2);
    // Stats above 70 factor (0-10)
    confidence += Math.min(10, statsAbove70 * 3);
    // Wonderkid bonus
    if (player.isWonderkid) confidence += 10;
    // High potential bonus
    if (player.potential >= 85) confidence += 5;
    // Positive personality traits
    if (player.personalityTraits.includes('Profesyonel')) confidence += 3;
    if (player.personalityTraits.includes('Soğukkanlı')) confidence += 2;
    if (player.personalityTraits.includes('Kazanan karakter')) confidence += 3;
    // Negative personality penalties
    if (player.personalityTraits.includes('Panikçi')) confidence -= 5;
    if (player.personalityTraits.includes('Kırılgan mental')) confidence -= 3;
    if (player.personalityTraits.includes('Tembel')) confidence -= 3;
    // Injury prone penalty
    if (player.developmentCurve === 'injury_prone') confidence -= 5;
    // Clamp confidence
    confidence = clamp(confidence, 0, 100);
    // --- Build reasons ---
    if (player.rating >= 68) reasons.push(`Reyting yeterli (${player.rating})`);
    if (statsAbove60 >= 8) reasons.push(`${statsAbove60} istatistik 60 üzerinde`);
    if (statsAbove65 >= 5) reasons.push(`${statsAbove65} istatistik 65 üzerinde`);
    if (player.age >= 19) reasons.push('Yaş gereksinimi karşılandı');
    if (player.isWonderkid) reasons.push('Wonderkid — özel yetenek');
    if (player.potential >= 85) reasons.push('Yüksek potansiyel tespit edildi');
    if (player.scoutReport && player.scoutReport.potentialRating === 'world_class') {
        reasons.push('Gözlem raporu: Dünya sınıfı potansiyel');
    }
    // --- Build warnings ---
    if (!ageOk) warnings.push(`Yaş ${player.age} — minimum 17 gerekli`);
    if (!ratingOk) warnings.push(`Reyting ${player.rating} — minimum 65 gerekli`);
    if (statsAbove60 < 5) warnings.push(`Sadece ${statsAbove60} istatistik 60 üzerinde — en az 5 gerekli`);
    if (player.injured) warnings.push('Şu anda sakat — iyileşmeyi bekleyin');
    if (player.morale < 40) warnings.push(`Moral düşük (${player.morale}) — takıma uyum sağlayamayabilir`);
    if (player.developmentCurve === 'injury_prone') warnings.push('Sakatlık eğilimli — dikkatli olun');
    if (player.age <= 17 && player.rating < 67) warnings.push('Çok genç ve reyting düşük — acele etmeyin');
    if (player.personalityTraits.includes('Panikçi')) warnings.push('Panikçi yapısı — büyük maçlarda sorun yaşayabilir');
    const ready = ageOk && ratingOk && statsAbove60 >= 5 && confidence >= 45;
    return {
        ready,
        confidence,
        reasons: reasons.length > 0 ? reasons : [
            'Henüz hazır değil'
        ],
        warnings,
        suggestedPosition: player.specificPosition
    };
}
function generateYouthIntake(academyLevel, rngFn = Math.random) {
    const count = rng(6, 10);
    const players = [];
    // Age distribution: 40% U17, 35% U19, 25% U21
    const ageDistribution = [
        {
            range: [
                15,
                17
            ],
            weight: 0.40
        },
        {
            range: [
                17,
                19
            ],
            weight: 0.35
        },
        {
            range: [
                19,
                21
            ],
            weight: 0.25
        }
    ];
    for(let i = 0; i < count; i++){
        // Pick age bucket
        const roll = rngFn();
        let ageRange = [
            15,
            17
        ];
        let cumulative = 0;
        for (const bucket of ageDistribution){
            cumulative += bucket.weight;
            if (roll <= cumulative) {
                ageRange = bucket.range;
                break;
            }
        }
        const targetAge = rng(ageRange[0], ageRange[1]);
        const player = generateYouthPlayer(academyLevel, targetAge, rngFn);
        // Generate initial scout report for all intake players
        player.scoutReport = generateScoutReport(player);
        players.push(player);
    }
    // Sort by rating descending (best first)
    players.sort((a, b)=>b.rating - a.rating);
    return players;
}
function calculateYouthValue(player) {
    // Base value from rating
    const ratingMultiplier = Math.pow(player.rating / 50, 2.5);
    // Potential gap bonus
    const potentialGap = player.hidden_potential - player.rating;
    const potentialBonus = 1 + potentialGap / 10;
    // Age factor: younger = higher potential value
    let ageFactor;
    if (player.age <= 16) ageFactor = 2.5;
    else if (player.age <= 17) ageFactor = 2.2;
    else if (player.age <= 18) ageFactor = 1.8;
    else if (player.age <= 19) ageFactor = 1.5;
    else if (player.age <= 20) ageFactor = 1.2;
    else ageFactor = 1.0;
    // Wonderkid multiplier (3-10x)
    let wonderkidMultiplier = 1;
    if (player.isWonderkid) {
        if (player.hidden_potential >= 95) wonderkidMultiplier = 10;
        else if (player.hidden_potential >= 92) wonderkidMultiplier = 8;
        else if (player.hidden_potential >= 90) wonderkidMultiplier = 6;
        else wonderkidMultiplier = 4;
    }
    // Personality trait impact on value
    let personalityValue = 1.0;
    if (player.personalityTraits.includes('Profesyonel')) personalityValue += 0.1;
    if (player.personalityTraits.includes('Çalışkan')) personalityValue += 0.08;
    if (player.personalityTraits.includes('Hırslı')) personalityValue += 0.08;
    if (player.personalityTraits.includes('Soğukkanlı')) personalityValue += 0.05;
    if (player.personalityTraits.includes('Kazanan karakter')) personalityValue += 0.1;
    if (player.personalityTraits.includes('Tembel')) personalityValue -= 0.15;
    if (player.personalityTraits.includes('Kibirli')) personalityValue -= 0.1;
    if (player.personalityTraits.includes('Egoist')) personalityValue -= 0.1;
    if (player.personalityTraits.includes('Disiplinsiz')) personalityValue -= 0.12;
    // Scout report impact
    let scoutBonus = 1.0;
    if (player.scoutReport) {
        switch(player.scoutReport.potentialRating){
            case 'world_class':
                scoutBonus = 1.4;
                break;
            case 'high':
                scoutBonus = 1.2;
                break;
            case 'medium':
                scoutBonus = 1.05;
                break;
            case 'low':
                scoutBonus = 0.9;
                break;
        }
    }
    // Trait value (higher level traits = more valuable)
    let traitValue = 1.0;
    if (player.traitLevels) {
        const levels = Object.values(player.traitLevels);
        const morCount = levels.filter((l)=>l === 'MOR').length;
        const altinCount = levels.filter((l)=>l === 'ALTIN').length;
        traitValue += morCount * 0.1 + altinCount * 0.05;
    }
    // Development curve impact
    let curveValue = 1.0;
    if (player.developmentCurve === 'early') curveValue = 1.1;
    if (player.developmentCurve === 'late') curveValue = 0.95;
    if (player.developmentCurve === 'injury_prone') curveValue = 0.75;
    // Injury status
    if (player.injured) curveValue *= 0.8;
    // Base price in thousands
    const basePrice = 50_000;
    const totalValue = Math.round(basePrice * ratingMultiplier * potentialBonus * ageFactor * wonderkidMultiplier * Math.max(0.5, personalityValue) * scoutBonus * traitValue * curveValue);
    // Minimum value is 10K
    return Math.max(10_000, totalValue);
}
function getFacilityById(id) {
    return YOUTH_FACILITIES.find((f)=>f.id === id);
}
function getTrainingSpeedMultiplier(facilities) {
    let multiplier = 1.0;
    for (const fac of facilities){
        const def = YOUTH_FACILITIES.find((f)=>f.id === fac.facilityId);
        if (def) {
            multiplier += def.effects.trainingSpeed * fac.currentLevel;
        }
    }
    return multiplier;
}
function getScoutQualityMultiplier(facilities) {
    let multiplier = 1.0;
    for (const fac of facilities){
        const def = YOUTH_FACILITIES.find((f)=>f.id === fac.facilityId);
        if (def) {
            multiplier += def.effects.scoutQuality * fac.currentLevel;
        }
    }
    return multiplier;
}
function getInjuryPrevention(facilities) {
    let prevention = 0;
    for (const fac of facilities){
        const def = YOUTH_FACILITIES.find((f)=>f.id === fac.facilityId);
        if (def) {
            prevention += def.effects.injuryPrevention * fac.currentLevel;
        }
    }
    return prevention;
}
function getUpgradeCost(facilityId, currentLevel) {
    const facility = YOUTH_FACILITIES.find((f)=>f.id === facilityId);
    if (!facility) return null;
    if (currentLevel >= facility.maxLevel) return null;
    return facility.upgradeCost[currentLevel]; // Index 0 = cost to go from 1→2
}
function getDefaultFacilityState() {
    return YOUTH_FACILITIES.map((f)=>({
            facilityId: f.id,
            currentLevel: 1
        }));
}
function getWeeklyUpkeep(facilities) {
    let total = 0;
    for (const fac of facilities){
        total += fac.currentLevel * 5000; // 5K per level per week per facility
    }
    return total;
}
function getPotentialRatingLabel(rating) {
    switch(rating){
        case 'world_class':
            return 'Dünya Sınıfı';
        case 'high':
            return 'Yüksek';
        case 'medium':
            return 'Orta';
        case 'low':
            return 'Düşük';
    }
}
function getDevelopmentCurveLabel(curve) {
    switch(curve){
        case 'early':
            return 'Erken Gelişen';
        case 'late':
            return 'Geç Gelişen';
        case 'normal':
            return 'Normal';
        case 'injury_prone':
            return 'Sakatlığa Yatkın';
    }
}
function formatYouthValue(value) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K`;
    }
    return `${value}`;
}
function getYouthPotentialStars(player) {
    const p = player.hidden_potential;
    if (p >= 92) return 5;
    if (p >= 85) return 4;
    if (p >= 75) return 3;
    if (p >= 65) return 2;
    return 1;
}
}),
"[project]/src/lib/fm/seasonAwardsService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeSeasonAwards",
    ()=>computeSeasonAwards,
    "computeSeasonAwardsWithCareerStats",
    ()=>computeSeasonAwardsWithCareerStats,
    "computeSeasonBadge",
    ()=>computeSeasonBadge,
    "computeSeasonSummary",
    ()=>computeSeasonSummary,
    "getChampionshipCount",
    ()=>getChampionshipCount,
    "getSeasonId",
    ()=>getSeasonId,
    "getSeasonNumber",
    ()=>getSeasonNumber,
    "loadAllSeasonSummaries",
    ()=>loadAllSeasonSummaries,
    "loadAwardCeremony",
    ()=>loadAwardCeremony,
    "loadSeasonAwards",
    ()=>loadSeasonAwards,
    "savePlayerAchievements",
    ()=>savePlayerAchievements,
    "saveSeasonAwardsAndSummary",
    ()=>saveSeasonAwardsAndSummary
]);
// ═══════════════════════════════════════════════════════════════════════
// Managerium — Sezon Sonu Ödüller Sistemi (Season Awards Service)
// Sezon sonu istatistik hesaplamaları, ödül belirleme, badge kazanma
// ═══════════════════════════════════════════════════════════════════════
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/sharedUtils.ts [app-ssr] (ecmascript)");
;
;
function getSeasonId(currentDay) {
    return `season-${Math.ceil(currentDay / 34)}`;
}
function getSeasonNumber(currentDay) {
    return Math.ceil(currentDay / 34);
}
async function computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName) {
    const awards = [];
    // ── Asist verisini player_career_stats'tan çek ──
    const assistMap = await fetchAssistData(squad.map((p)=>p.id), seasonId);
    // Oyuncu sezon istatistiklerini topla (career_stats'tan veya mevcut verilerden)
    const playerStats = squad.map((p)=>({
            playerId: p.id,
            playerName: p.name,
            position: p.position,
            rating: p.rating,
            age: p.age,
            goals: p.goalStats ? Object.values(p.goalStats).reduce((a, b)=>a + b, 0) : 0,
            assists: assistMap.get(p.id) ?? 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0,
            cleanSheets: p.saveStats ? Object.values(p.saveStats).reduce((a, b)=>a + b, 0) > 0 ? 1 : 0 : 0,
            avgRating: p.form_rating ?? p.rating,
            motm: 0
        }));
    // ─── Altın Krampon (En golcü) ────────────────────────────────────
    const topScorer = [
        ...playerStats
    ].sort((a, b)=>b.goals - a.goals)[0];
    if (topScorer && topScorer.goals > 0) {
        awards.push({
            id: `award_${seasonId}_golden_boot_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'golden_boot',
            player_id: topScorer.playerId,
            player_name: topScorer.playerName,
            team_name: teamName,
            stat_value: topScorer.goals,
            stat_detail: {
                goals: topScorer.goals,
                matches: topScorer.matchesPlayed,
                avg_rating: topScorer.avgRating
            }
        });
    }
    // ─── MVP (En yüksek ortalama rating + gol + asist katkısı) ────────
    const mvpCandidates = playerStats.map((p)=>({
            ...p,
            mvpScore: p.avgRating * 0.5 + p.goals * 2 + p.assists * 1.5 + p.matchesPlayed * 0.1
        }));
    const mvp = [
        ...mvpCandidates
    ].sort((a, b)=>b.mvpScore - a.mvpScore)[0];
    if (mvp) {
        awards.push({
            id: `award_${seasonId}_mvp_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'mvp',
            player_id: mvp.playerId,
            player_name: mvp.playerName,
            team_name: teamName,
            stat_value: Math.round(mvp.mvpScore * 10) / 10,
            stat_detail: {
                avg_rating: mvp.avgRating,
                goals: mvp.goals,
                assists: mvp.assists,
                matches: mvp.matchesPlayed
            }
        });
    }
    // ─── En İyi Kaleci ──────────────────────────────────────────────
    const goalkeepers = playerStats.filter((p)=>p.position === 'GK');
    const bestGK = [
        ...goalkeepers
    ].sort((a, b)=>{
        const scoreA = a.avgRating + a.cleanSheets * 3;
        const scoreB = b.avgRating + b.cleanSheets * 3;
        return scoreB - scoreA;
    })[0];
    if (bestGK) {
        awards.push({
            id: `award_${seasonId}_best_gk_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'best_gk',
            player_id: bestGK.playerId,
            player_name: bestGK.playerName,
            team_name: teamName,
            stat_value: bestGK.avgRating,
            stat_detail: {
                avg_rating: bestGK.avgRating,
                clean_sheets: bestGK.cleanSheets,
                matches: bestGK.matchesPlayed
            }
        });
    }
    // ─── Asist Kralı ────────────────────────────────────────────────
    const topAssister = [
        ...playerStats
    ].sort((a, b)=>b.assists - a.assists)[0];
    if (topAssister && topAssister.assists > 0) {
        awards.push({
            id: `award_${seasonId}_top_assists_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'top_assists',
            player_id: topAssister.playerId,
            player_name: topAssister.playerName,
            team_name: teamName,
            stat_value: topAssister.assists,
            stat_detail: {
                assists: topAssister.assists,
                matches: topAssister.matchesPlayed,
                avg_rating: topAssister.avgRating
            }
        });
    }
    // ─── En İyi Genç (U21, en yüksek rating) ──────────────────────────
    const youngPlayers = playerStats.filter((p)=>p.age <= 21);
    const bestYoung = [
        ...youngPlayers
    ].sort((a, b)=>b.avgRating - a.avgRating)[0];
    if (bestYoung) {
        awards.push({
            id: `award_${seasonId}_best_young_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'best_young',
            player_id: bestYoung.playerId,
            player_name: bestYoung.playerName,
            team_name: teamName,
            stat_value: bestYoung.avgRating,
            stat_detail: {
                avg_rating: bestYoung.avgRating,
                age: bestYoung.age,
                goals: bestYoung.goals,
                assists: bestYoung.assists
            }
        });
    }
    // ─── Fair Play (En az kart, en çok maç oynayan) ──────────────────
    const fairPlayCandidates = playerStats.filter((p)=>p.matchesPlayed >= 10);
    const fairPlay = [
        ...fairPlayCandidates
    ].sort((a, b)=>{
        const cardsA = a.yellowCards + a.redCards * 3;
        const cardsB = b.yellowCards + b.redCards * 3;
        if (cardsA !== cardsB) return cardsA - cardsB;
        return b.matchesPlayed - a.matchesPlayed;
    })[0];
    if (fairPlay) {
        awards.push({
            id: `award_${seasonId}_fair_play_${profileId}`,
            season_id: seasonId,
            profile_id: profileId,
            league_name: leagueName,
            award_type: 'fair_play',
            player_id: fairPlay.playerId,
            player_name: fairPlay.playerName,
            team_name: teamName,
            stat_value: fairPlay.yellowCards + fairPlay.redCards * 3,
            stat_detail: {
                yellow_cards: fairPlay.yellowCards,
                red_cards: fairPlay.redCards,
                matches: fairPlay.matchesPlayed
            }
        });
    }
    return awards;
}
async function computeSeasonSummary(squad, seasonId, profileId, teamName, leagueName, leagueStandings) {
    // ── Asist verisini player_career_stats'tan çek ──
    const assistMap = await fetchAssistData(squad.map((p)=>p.id), seasonId);
    // Toplam istatistikler
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellow = 0;
    let totalRed = 0;
    let totalRating = 0;
    let ratedCount = 0;
    let totalCleanSheets = 0;
    let topScorerName = '';
    let topScorerGoals = 0;
    let topAssisterName = '';
    let topAssisterAssists = 0;
    let bestPlayerName = '';
    let bestPlayerRating = 0;
    for (const p of squad){
        const goals = p.goalStats ? Object.values(p.goalStats).reduce((a, b)=>a + b, 0) : 0;
        const assists = assistMap.get(p.id) ?? 0;
        const yCards = 0;
        const rCards = 0;
        const rating = p.form_rating ?? p.rating;
        const cleanSheets = p.position === 'GK' && p.saveStats ? 1 : 0;
        totalGoals += goals;
        totalAssists += assists;
        totalYellow += yCards;
        totalRed += rCards;
        totalCleanSheets += cleanSheets;
        if (rating > 0) {
            totalRating += rating;
            ratedCount++;
        }
        if (goals > topScorerGoals) {
            topScorerGoals = goals;
            topScorerName = p.name;
        }
        if (assists > topAssisterAssists) {
            topAssisterAssists = assists;
            topAssisterName = p.name;
        }
        if (rating > bestPlayerRating) {
            bestPlayerRating = rating;
            bestPlayerName = p.name;
        }
    }
    // Lig pozisyonu
    let finalPosition = 0;
    let points = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    if (leagueStandings) {
        const myTeam = leagueStandings.find((t)=>t.name === teamName);
        if (myTeam) {
            finalPosition = leagueStandings.indexOf(myTeam) + 1;
            points = myTeam.points;
            won = myTeam.won;
            drawn = myTeam.drawn;
            lost = myTeam.lost;
            goalsFor = myTeam.gf;
            goalsAgainst = myTeam.ga;
        }
    }
    const isChampion = finalPosition === 1;
    const isPromoted = finalPosition <= 3 && finalPosition > 0;
    const isRelegated = finalPosition >= leagueStandings?.length - 1 && finalPosition > 0;
    return {
        id: `summary_${seasonId}_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        team_name: teamName,
        league_name: leagueName,
        final_position: finalPosition,
        points,
        won,
        drawn,
        lost,
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        total_goals: totalGoals || goalsFor,
        total_assists: totalAssists,
        total_yellow: totalYellow,
        total_red: totalRed,
        total_clean_sheets: totalCleanSheets,
        avg_team_rating: ratedCount > 0 ? Math.round(totalRating / ratedCount * 10) / 10 : 0,
        top_scorer_name: topScorerName,
        top_scorer_goals: topScorerGoals,
        top_assister_name: topAssisterName,
        top_assister_assists: topAssisterAssists,
        best_player_name: bestPlayerName,
        best_player_rating: Math.round(bestPlayerRating * 10) / 10,
        is_champion: isChampion,
        is_promoted: isPromoted,
        is_relegated: isRelegated,
        awards_count: 0,
        badge_earned: undefined
    };
}
function computeSeasonBadge(finalPosition, isChampion, awards, totalTeams) {
    const seasonId = awards[0]?.season_id || 'unknown';
    // Şampiyonluk badge'i
    if (isChampion) {
        return {
            season_id: seasonId,
            type: 'champion_gold',
            label: 'Şampiyon',
            icon: '🏆'
        };
    }
    // Bireysel ödül badge'leri
    const awardTypes = awards.map((a)=>a.award_type);
    if (awardTypes.includes('golden_boot')) {
        return {
            season_id: seasonId,
            type: 'golden_boot',
            label: 'Altın Krampon Sahibi',
            icon: '👢'
        };
    }
    if (awardTypes.includes('mvp')) {
        return {
            season_id: seasonId,
            type: 'mvp',
            label: 'MVP',
            icon: '⭐'
        };
    }
    // Lig pozisyonuna göre badge
    if (finalPosition <= 3 && finalPosition > 0) {
        return {
            season_id: seasonId,
            type: 'top4',
            label: `#${finalPosition} Sıra`,
            icon: '🥈'
        };
    }
    if (finalPosition > 0 && totalTeams && finalPosition >= totalTeams - 1) {
        return {
            season_id: seasonId,
            type: 'relegated',
            label: 'Düşme',
            icon: '⬇️'
        };
    }
    if (finalPosition > 0 && finalPosition <= totalTeams / 2) {
        return {
            season_id: seasonId,
            type: 'mid_table',
            label: 'Orta Sıra',
            icon: '📋'
        };
    }
    return null;
}
async function savePlayerAchievements(awards, profileId) {
    const errors = [];
    let saved = 0;
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            saved: 0,
            errors: [
                'Supabase not configured'
            ]
        };
        const entries = awards.filter((a)=>a.player_id).map((a)=>({
                player_id: a.player_id,
                profile_id: profileId,
                achievement_type: a.award_type,
                season_id: a.season_id,
                description: `${a.award_type} ödülü — ${a.player_name} (${a.team_name})`
            }));
        if (entries.length > 0) {
            const { error } = await supabase.from('player_achievements').upsert(entries, {
                onConflict: 'player_id,achievement_type,season_id'
            });
            if (error) {
                errors.push(error.message);
            } else {
                saved = entries.length;
            }
        }
    } catch (err) {
        errors.push(String(err));
    }
    return {
        saved,
        errors
    };
}
async function saveSeasonAwardsAndSummary(awards, summary, badge, profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase not configured'
        };
        // 1. Ödülleri kaydet
        if (awards.length > 0) {
            const awardRows = awards.map((a)=>({
                    id: a.id,
                    season_id: a.season_id,
                    profile_id: a.profile_id,
                    league_name: a.league_name,
                    award_type: a.award_type,
                    player_id: a.player_id,
                    player_name: a.player_name,
                    team_name: a.team_name,
                    stat_value: a.stat_value,
                    stat_detail: JSON.stringify(a.stat_detail || {})
                }));
            const { error: awardError } = await supabase.from('season_awards').upsert(awardRows, {
                onConflict: 'id'
            });
            if (awardError) {
                console.error('[saveSeasonAwards] Award upsert error:', awardError.message);
            }
        }
        // 2. Özeti kaydet
        const summaryRow = {
            id: summary.id,
            season_id: summary.season_id,
            profile_id: summary.profile_id,
            team_name: summary.team_name,
            league_name: summary.league_name,
            final_position: summary.final_position,
            points: summary.points,
            won: summary.won,
            drawn: summary.drawn,
            lost: summary.lost,
            goals_for: summary.goals_for,
            goals_against: summary.goals_against,
            total_goals: summary.total_goals,
            total_assists: summary.total_assists,
            total_yellow: summary.total_yellow,
            total_red: summary.total_red,
            total_clean_sheets: summary.total_clean_sheets,
            avg_team_rating: summary.avg_team_rating,
            top_scorer_name: summary.top_scorer_name,
            top_scorer_goals: summary.top_scorer_goals,
            top_assister_name: summary.top_assister_name,
            top_assister_assists: summary.top_assister_assists,
            best_player_name: summary.best_player_name,
            best_player_rating: summary.best_player_rating,
            is_champion: summary.is_champion,
            is_promoted: summary.is_promoted,
            is_relegated: summary.is_relegated,
            awards_count: awards.length,
            badge_earned: badge?.type || null
        };
        const { error: summaryError } = await supabase.from('season_summaries').upsert(summaryRow, {
            onConflict: 'id'
        });
        if (summaryError) {
            console.error('[saveSeasonAwards] Summary upsert error:', summaryError.message);
        }
        // 3. Profile güncelle: trophy/award sayıları ve badge'ler
        const updateData = {};
        if (summary.is_champion) {
            updateData.total_trophies = 1; // Increment will be done via RPC or read-then-write
        }
        updateData.total_awards = awards.length;
        // Badge'leri güncelle
        if (badge) {
            // Mevcut badge'leri oku, yenisini ekle
            const { data: profileData } = await supabase.from('profiles').select('season_badges').eq('id', profileId).single();
            const existingBadges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(profileData.season_badges, []);
            // Aynı sezonun badge'ini güncelle veya ekle
            const updatedBadges = [
                ...existingBadges.filter((b)=>b.season_id !== badge.season_id),
                badge
            ];
            updateData.season_badges = JSON.stringify(updatedBadges);
        }
        if (Object.keys(updateData).length > 0) {
            // Read current values for incrementing
            const { data: currentProfile } = await supabase.from('profiles').select('total_trophies, total_awards').eq('id', profileId).single();
            if (currentProfile) {
                if (summary.is_champion) {
                    updateData.total_trophies = (currentProfile.total_trophies || 0) + 1;
                }
                updateData.total_awards = (currentProfile.total_awards || 0) + awards.length;
            }
            const { error: profileError } = await supabase.from('profiles').update(updateData).eq('id', profileId);
            if (profileError) {
                console.error('[saveSeasonAwards] Profile update error:', profileError.message);
            }
        }
        return {
            success: true
        };
    } catch (err) {
        console.error('[saveSeasonAwards] Exception:', err);
        return {
            success: false,
            error: String(err)
        };
    }
}
async function loadSeasonAwards(profileId, seasonId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return [];
        const { data, error } = await supabase.from('season_awards').select('*').eq('profile_id', profileId).eq('season_id', seasonId);
        if (error || !data) return [];
        return data.map(mapAwardFromRow);
    } catch  {
        return [];
    }
}
async function loadAllSeasonSummaries(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return [];
        const { data, error } = await supabase.from('season_summaries').select('*').eq('profile_id', profileId).order('season_id', {
            ascending: false
        });
        if (error || !data) return [];
        return data.map(mapSummaryFromRow);
    } catch  {
        return [];
    }
}
async function loadAwardCeremony(profileId, seasonId) {
    try {
        const [awards, summaries] = await Promise.all([
            loadSeasonAwards(profileId, seasonId),
            loadAllSeasonSummaries(profileId)
        ]);
        const summary = summaries.find((s)=>s.season_id === seasonId);
        if (!summary) return null;
        // Badge'i profile'dan oku
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        let badge = null;
        if (supabase) {
            const { data } = await supabase.from('profiles').select('season_badges').eq('id', profileId).single();
            if (data?.season_badges) {
                const badges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(data.season_badges, []);
                badge = badges.find((b)=>b.season_id === seasonId) || null;
            }
        }
        return {
            season_id: seasonId,
            summary,
            awards,
            badge
        };
    } catch  {
        return null;
    }
}
async function getChampionshipCount(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return 0;
        const { count, error } = await supabase.from('season_summaries').select('id', {
            count: 'exact',
            head: true
        }).eq('profile_id', profileId).eq('is_champion', true);
        return count || 0;
    } catch  {
        return 0;
    }
}
// ─── Yardımcı: Row Mapping ──────────────────────────────────────────
function mapAwardFromRow(row) {
    return {
        id: row.id,
        season_id: row.season_id,
        profile_id: row.profile_id,
        league_name: row.league_name,
        award_type: row.award_type,
        player_id: row.player_id,
        player_name: row.player_name,
        team_name: row.team_name,
        stat_value: row.stat_value,
        stat_detail: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(row.stat_detail, undefined),
        created_at: row.created_at
    };
}
function mapSummaryFromRow(row) {
    return {
        id: row.id,
        season_id: row.season_id,
        profile_id: row.profile_id,
        team_name: row.team_name,
        league_name: row.league_name,
        final_position: row.final_position,
        points: row.points || 0,
        won: row.won || 0,
        drawn: row.drawn || 0,
        lost: row.lost || 0,
        goals_for: row.goals_for || 0,
        goals_against: row.goals_against || 0,
        total_goals: row.total_goals || 0,
        total_assists: row.total_assists || 0,
        total_yellow: row.total_yellow || 0,
        total_red: row.total_red || 0,
        total_clean_sheets: row.total_clean_sheets || 0,
        avg_team_rating: row.avg_team_rating || 0,
        top_scorer_name: row.top_scorer_name,
        top_scorer_goals: row.top_scorer_goals || 0,
        top_assister_name: row.top_assister_name,
        top_assister_assists: row.top_assister_assists || 0,
        best_player_name: row.best_player_name,
        best_player_rating: row.best_player_rating || 0,
        is_champion: row.is_champion || false,
        is_promoted: row.is_promoted || false,
        is_relegated: row.is_relegated || false,
        awards_count: row.awards_count || 0,
        badge_earned: row.badge_earned,
        created_at: row.created_at
    };
}
// ─── Asist Verisi Çekme ──────────────────────────────────────────────
/**
 * player_career_stats tablosundan sezonluk asist verisini çeker.
 * Tablo yoksa veya veri yoksa, match_events tablosundan fallback hesaplar.
 *
 * @param playerIds - Asist verisi istenen oyuncu ID'leri
 * @param seasonId - Sezon ID'si
 * @returns Map<playerId, assists>
 */ async function fetchAssistData(playerIds, seasonId) {
    const assistMap = new Map();
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase || playerIds.length === 0) return assistMap;
        // ── Önce player_career_stats'tan dene ──
        const { data: careerData, error: careerError } = await supabase.from('player_career_stats').select('player_id, assists').eq('season_id', seasonId).in('player_id', playerIds);
        if (!careerError && careerData && careerData.length > 0) {
            for (const row of careerData){
                if (row.assists && row.assists > 0) {
                    assistMap.set(row.player_id, row.assists);
                }
            }
            // En az 1 oyuncunun asist verisi varsa, bu veriyi kullan
            if (assistMap.size > 0) {
                return assistMap;
            }
        }
        // ── Fallback: match_events tablosundan asistleri say ──
        const { data: assistEvents, error: eventsError } = await supabase.from('match_events').select('player_id').eq('event_type', 'assist').in('player_id', playerIds);
        if (!eventsError && assistEvents && assistEvents.length > 0) {
            // Her oyuncu için asist sayısını hesapla
            const countMap = new Map();
            for (const evt of assistEvents){
                countMap.set(evt.player_id, (countMap.get(evt.player_id) || 0) + 1);
            }
            for (const [pid, count] of countMap){
                assistMap.set(pid, count);
            }
        }
    } catch (err) {
        console.warn('[fetchAssistData] Error fetching assist data:', err);
    }
    return assistMap;
}
async function computeSeasonAwardsWithCareerStats(profileId, seasonId, squad, teamName, leagueName) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);
        // Career stats'ı çek
        const playerIds = squad.map((p)=>p.id);
        const { data: careerData } = await supabase.from('player_career_stats').select('*').eq('season_id', seasonId).in('player_id', playerIds);
        if (!careerData || careerData.length === 0) {
            // Fallback: mevcut verilerle hesapla
            return await computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);
        }
        // Career stats map: playerId -> stats
        const statsMap = {};
        for (const row of careerData){
            statsMap[row.player_id] = row;
        }
        const awards = [];
        // ─── Altın Krampon ─────────────────────────────────────────────
        const scorerData = [
            ...careerData
        ].sort((a, b)=>b.goals - a.goals)[0];
        if (scorerData && scorerData.goals > 0) {
            const player = squad.find((p)=>p.id === scorerData.player_id);
            awards.push({
                id: `award_${seasonId}_golden_boot_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'golden_boot',
                player_id: scorerData.player_id,
                player_name: player?.name || scorerData.player_id,
                team_name: teamName,
                stat_value: scorerData.goals,
                stat_detail: {
                    goals: scorerData.goals,
                    matches: scorerData.matches_played,
                    avg_rating: Math.round(scorerData.avg_rating * 10) / 10
                }
            });
        }
        // ─── MVP ───────────────────────────────────────────────────────
        const mvpData = [
            ...careerData
        ].sort((a, b)=>{
            const scoreA = a.avg_rating * 0.5 + a.goals * 2 + a.assists * 1.5 + a.matches_played * 0.1;
            const scoreB = b.avg_rating * 0.5 + b.goals * 2 + b.assists * 1.5 + b.matches_played * 0.1;
            return scoreB - scoreA;
        })[0];
        if (mvpData) {
            const player = squad.find((p)=>p.id === mvpData.player_id);
            awards.push({
                id: `award_${seasonId}_mvp_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'mvp',
                player_id: mvpData.player_id,
                player_name: player?.name || mvpData.player_id,
                team_name: teamName,
                stat_value: Math.round((mvpData.avg_rating * 0.5 + mvpData.goals * 2 + mvpData.assists * 1.5) * 10) / 10,
                stat_detail: {
                    avg_rating: Math.round(mvpData.avg_rating * 10) / 10,
                    goals: mvpData.goals,
                    assists: mvpData.assists,
                    matches: mvpData.matches_played
                }
            });
        }
        // ─── En İyi Kaleci ────────────────────────────────────────────
        const gkData = careerData.filter((row)=>{
            const player = squad.find((p)=>p.id === row.player_id);
            return player?.position === 'GK';
        });
        const bestGKData = [
            ...gkData
        ].sort((a, b)=>{
            const scoreA = a.avg_rating + (a.clean_sheets || 0) * 3;
            const scoreB = b.avg_rating + (b.clean_sheets || 0) * 3;
            return scoreB - scoreA;
        })[0];
        if (bestGKData) {
            const player = squad.find((p)=>p.id === bestGKData.player_id);
            awards.push({
                id: `award_${seasonId}_best_gk_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'best_gk',
                player_id: bestGKData.player_id,
                player_name: player?.name || bestGKData.player_id,
                team_name: teamName,
                stat_value: Math.round(bestGKData.avg_rating * 10) / 10,
                stat_detail: {
                    avg_rating: Math.round(bestGKData.avg_rating * 10) / 10,
                    clean_sheets: bestGKData.clean_sheets || 0,
                    matches: bestGKData.matches_played
                }
            });
        }
        // ─── Asist Kralı ──────────────────────────────────────────────
        const assisterData = [
            ...careerData
        ].sort((a, b)=>b.assists - a.assists)[0];
        if (assisterData && assisterData.assists > 0) {
            const player = squad.find((p)=>p.id === assisterData.player_id);
            awards.push({
                id: `award_${seasonId}_top_assists_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'top_assists',
                player_id: assisterData.player_id,
                player_name: player?.name || assisterData.player_id,
                team_name: teamName,
                stat_value: assisterData.assists,
                stat_detail: {
                    assists: assisterData.assists,
                    matches: assisterData.matches_played,
                    avg_rating: Math.round(assisterData.avg_rating * 10) / 10
                }
            });
        }
        // ─── En İyi Genç (U21) ────────────────────────────────────────
        const youngData = careerData.filter((row)=>{
            const player = squad.find((p)=>p.id === row.player_id);
            return player && player.age <= 21;
        });
        const bestYoungData = [
            ...youngData
        ].sort((a, b)=>b.avg_rating - a.avg_rating)[0];
        if (bestYoungData) {
            const player = squad.find((p)=>p.id === bestYoungData.player_id);
            awards.push({
                id: `award_${seasonId}_best_young_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'best_young',
                player_id: bestYoungData.player_id,
                player_name: player?.name || bestYoungData.player_id,
                team_name: teamName,
                stat_value: Math.round(bestYoungData.avg_rating * 10) / 10,
                stat_detail: {
                    avg_rating: Math.round(bestYoungData.avg_rating * 10) / 10,
                    age: player?.age || 0,
                    goals: bestYoungData.goals,
                    assists: bestYoungData.assists
                }
            });
        }
        // ─── Fair Play ────────────────────────────────────────────────
        const fairPlayData = [
            ...careerData
        ].filter((r)=>r.matches_played >= 5).sort((a, b)=>{
            const cardsA = a.yellow_cards + a.red_cards * 3;
            const cardsB = b.yellow_cards + b.red_cards * 3;
            if (cardsA !== cardsB) return cardsA - cardsB;
            return b.matches_played - a.matches_played;
        })[0];
        if (fairPlayData) {
            const player = squad.find((p)=>p.id === fairPlayData.player_id);
            awards.push({
                id: `award_${seasonId}_fair_play_${profileId}`,
                season_id: seasonId,
                profile_id: profileId,
                league_name: leagueName,
                award_type: 'fair_play',
                player_id: fairPlayData.player_id,
                player_name: player?.name || fairPlayData.player_id,
                team_name: teamName,
                stat_value: fairPlayData.yellow_cards + fairPlayData.red_cards * 3,
                stat_detail: {
                    yellow_cards: fairPlayData.yellow_cards,
                    red_cards: fairPlayData.red_cards,
                    matches: fairPlayData.matches_played
                }
            });
        }
        return awards;
    } catch (err) {
        console.error('[computeSeasonAwardsWithCareerStats] Error, falling back:', err);
        return await computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);
    }
}
}),
"[project]/src/lib/fm/operations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPERATIONS",
    ()=>OPERATIONS
]);
const OPERATIONS = [
    // Tier 1-3: Perception Management / Defense
    {
        id: 'op_bot_army',
        name: 'Sosyal Medya Bot Ordusu',
        tier: 1,
        description: 'Rakip takımı sosyal medyada baskı altına al.',
        cost: 5000,
        successRate: 0.9,
        scandalRisk: 0.05,
        impactType: 'luck',
        impactValue: 0.03,
        type: 'ATTACK',
        category: 'media'
    },
    {
        id: 'op_media_blackout_def',
        name: 'Medya Karartması',
        tier: 2,
        description: 'Hakkınızda çıkan negatif haberlerin yayılmasını durdurun.',
        cost: 7500,
        successRate: 0.95,
        scandalRisk: 0.02,
        impactType: 'cleanup',
        impactValue: 1,
        type: 'DEFENSE',
        category: 'media'
    },
    {
        id: 'op_local_leak',
        name: 'Yerel Basına Fısıltı',
        tier: 2,
        description: 'Rakipte kriz haberi sızdırarak huzursuzluk çıkar.',
        cost: 10000,
        successRate: 0.85,
        scandalRisk: 0.1,
        impactType: 'stamina',
        impactValue: 3,
        type: 'ATTACK',
        category: 'media'
    },
    {
        id: 'op_fan_provocation',
        name: 'Taraftar Kışkırtma',
        tier: 3,
        description: 'Rakip taraftarları kendi yönetimlerine karşı kışkırt.',
        cost: 15000,
        successRate: 0.8,
        scandalRisk: 0.15,
        impactType: 'error_rate',
        impactValue: 0.05,
        type: 'ATTACK',
        category: 'media'
    },
    // Tier 4-6: Corporate Pressure / Cleanup
    {
        id: 'op_mole_hunt',
        name: 'Köstebek Avı',
        tier: 4,
        description: 'Tesislerinize sızmış olası sızıntıları temizler.',
        cost: 40000,
        successRate: 0.85,
        scandalRisk: 0.05,
        impactType: 'defense',
        impactValue: 0.2,
        type: 'CLEANUP',
        category: 'scouting'
    },
    {
        id: 'op_media_blackout',
        name: 'Ulusal Medya Ambargosu',
        tier: 4,
        description: 'Rakibin sesini duyurmasını engelle.',
        cost: 50000,
        successRate: 0.7,
        scandalRisk: 0.2,
        impactType: 'luck',
        impactValue: 0.05,
        type: 'ATTACK',
        category: 'media'
    },
    {
        id: 'op_cyber_sabotage',
        name: 'Siber Sabotaj',
        tier: 5,
        description: 'Rakip tesislerin dijital altyapısını boz.',
        cost: 75000,
        successRate: 0.65,
        scandalRisk: 0.25,
        impactType: 'stamina',
        impactValue: 7,
        type: 'ATTACK',
        category: 'physical'
    },
    {
        id: 'op_referee_lobby',
        name: 'Hakem Odası Kulisleri',
        tier: 6,
        description: 'Yarınki maça "doğru" hakemin atanmasını sağla.',
        cost: 100000,
        successRate: 0.6,
        scandalRisk: 0.3,
        impactType: 'referee',
        impactValue: 0.1,
        type: 'ATTACK',
        category: 'legal'
    },
    // Tier 7-9: System Intervention / Legal Shield
    {
        id: 'op_legal_shield',
        name: 'Hukuk Zırhı',
        tier: 7,
        description: 'Federasyon nezdinde açılan soruşturmaları yavaşlatır.',
        cost: 150000,
        successRate: 0.8,
        scandalRisk: 0.1,
        impactType: 'defense',
        impactValue: 0.4,
        type: 'DEFENSE',
        category: 'legal'
    },
    {
        id: 'op_federation_influence',
        name: 'Federasyon Lobisi',
        tier: 7,
        description: 'Kurullarda karar alıcıları "bilgilendir".',
        cost: 250000,
        successRate: 0.5,
        scandalRisk: 0.4,
        impactType: 'points',
        impactValue: 2,
        type: 'ATTACK',
        category: 'legal'
    },
    {
        id: 'op_ban_cancellation',
        name: 'Cezaları İptal Ettirme',
        tier: 8,
        description: 'Disiplin kurulundan lehte kararlar çıkar.',
        cost: 500000,
        successRate: 0.4,
        scandalRisk: 0.5,
        impactType: 'error_rate',
        impactValue: 0.1,
        type: 'ATTACK',
        category: 'legal'
    },
    {
        id: 'op_holy_alliance',
        name: 'Kutsal İttifak',
        tier: 9,
        description: 'Diğer kulüplerle rakibi paketle.',
        cost: 1000000,
        successRate: 0.3,
        scandalRisk: 0.6,
        impactType: 'luck',
        impactValue: 0.15,
        type: 'ATTACK',
        category: 'media'
    },
    // Tier 10: Dark Centers / Veto
    {
        id: 'op_veto_power',
        name: 'Veto Yetkisi',
        tier: 10,
        description: 'Rakibin en üst düzey saldırısını başlamadan iptal eder.',
        cost: 2500000,
        successRate: 0.9,
        scandalRisk: 0.05,
        impactType: 'defense',
        impactValue: 0.7,
        type: 'DEFENSE',
        category: 'veto'
    },
    {
        id: 'op_dark_odak',
        name: 'Karanlık Odaklar',
        tier: 10,
        description: 'Ligin kaderine doğrudan müdahale.',
        cost: 5000000,
        successRate: 0.2,
        scandalRisk: 0.8,
        impactType: 'referee',
        impactValue: 0.3,
        type: 'ATTACK',
        category: 'veto'
    }
];
}),
"[project]/src/lib/fm/DefenseManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefenseManager",
    ()=>DefenseManager
]);
class DefenseManager {
    /**
   * Calculates the final success chance of an attack given the defender's defense powers.
   * @param baseSuccessRate The base success rate of the operation
   * @param category The category of the operation (media, scouting, physical, legal, veto)
   * @param defenderProfile The profile of the team being attacked
   */ static calculateSuccessChance(baseSuccessRate, category, defenderProfile) {
        const defensePowers = defenderProfile.defense_powers || {};
        const defensePower = defensePowers[category] || 0;
        // Logic: Success = Base * (1 - DefensePower)
        // defensePower is expected to be between 0 and 1 (e.g. 0.2 for 20% reduction)
        let finalChance = baseSuccessRate * (1 - defensePower);
        // Ensure final chance doesn't drop below a minimum threshold for gameplay reasons
        return Math.max(finalChance, 0.05);
    }
    /**
   * Calculates if an attack rebounds back to the attacker as a scandal risk multiplier.
   * "Ava giderken avlanma" logic.
   */ static getScandalReboundMultiplier(defenderProfile, category) {
        const defensePowers = defenderProfile.defense_powers || {};
        const defensePower = defensePowers[category] || 0;
        // If defense is high, scandal risk for attacker doubles
        if (defensePower > 0.5) {
            return 2.0;
        }
        return 1.0;
    }
}
}),
"[project]/src/lib/fm/OperationManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OperationManager",
    ()=>OperationManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$operations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/operations.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$DefenseManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/DefenseManager.ts [app-ssr] (ecmascript)");
;
;
class OperationManager {
    static instance;
    constructor(){}
    static getInstance() {
        if (!OperationManager.instance) {
            OperationManager.instance = new OperationManager();
        }
        return OperationManager.instance;
    }
    launchOperation(opId, state, budget) {
        const op = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$operations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPERATIONS"].find((o)=>o.id === opId);
        if (!op) return {
            state,
            cost: 0,
            error: 'Operation not found'
        };
        if (budget < op.cost) return {
            state,
            cost: 0,
            error: 'Insufficient funds'
        };
        const activeOps = state.activeOperations || [];
        // Check limit of 10
        const usageCount = activeOps.filter((ao)=>ao.operationId === opId).length;
        if (usageCount >= 10) return {
            state,
            cost: 0,
            error: `Bu operasyon maksimum kullanım sınırına (10) ulaştı.`
        };
        const newActiveOp = {
            id: Math.random().toString(36).substr(2, 9),
            operationId: opId,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        return {
            state: {
                ...state,
                activeOperations: [
                    ...activeOps,
                    newActiveOp
                ]
            },
            cost: op.cost
        };
    }
    resolveOperations(state, targetProfile) {
        const activeOps = state.activeOperations || [];
        const reports = [];
        let scandalOccured = false;
        const resolvedOps = activeOps.map((active)=>{
            if (active.status !== 'pending') return active;
            const op = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$operations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPERATIONS"].find((o)=>o.id === active.operationId);
            if (!op) return {
                ...active,
                status: 'completed'
            };
            // DEFENSE LOGIC
            let successChance = op.successRate;
            let scandalRisk = op.scandalRisk;
            if (targetProfile && op.category) {
                successChance = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$DefenseManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DefenseManager"].calculateSuccessChance(op.successRate, op.category, targetProfile);
                scandalRisk = op.scandalRisk * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$DefenseManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DefenseManager"].getScandalReboundMultiplier(targetProfile, op.category);
            }
            const roll = Math.random();
            if (roll < successChance) {
                const text = `${op.name} BAŞARILI: ${op.description}`;
                reports.push(text);
                return {
                    ...active,
                    status: 'success',
                    resultText: text
                };
            } else {
                const scandalRoll = Math.random();
                if (scandalRoll < scandalRisk) {
                    scandalOccured = true;
                    const text = `SKANDAL: ${op.name} DEŞİFRE OLDU! SAVUNMA HATTI SİZE GÜLDÜ.`;
                    reports.push(text);
                    return {
                        ...active,
                        status: 'scandal',
                        resultText: text
                    };
                }
                const text = `${op.name} BAŞARISIZ: Hedefin savunma kalkanları geçilemedi.`;
                reports.push(text);
                return {
                    ...active,
                    status: 'completed',
                    resultText: text
                };
            }
        });
        return {
            updatedState: {
                ...state,
                activeOperations: resolvedOps,
                operationReports: [
                    ...state.operationReports || [],
                    ...reports
                ]
            },
            reports,
            scandalOccured
        };
    }
    /**
   * Simulates an enemy attack on the user's club to test defense mechanics.
   */ simulateEnemyAttack(userProfile, state) {
        const attackCategories = [
            'media',
            'scouting',
            'physical',
            'legal',
            'veto'
        ];
        const category = attackCategories[Math.floor(Math.random() * attackCategories.length)];
        // Enemy success rate fluctuates based on day or difficulty
        const baseEnemySuccess = 0.4 + Math.random() * 0.3;
        const finalSuccess = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$DefenseManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DefenseManager"].calculateSuccessChance(baseEnemySuccess, category, userProfile);
        const didSucceed = Math.random() < finalSuccess;
        const reports = [
            ...state.operationReports || []
        ];
        let alertHeader;
        let alertText;
        if (didSucceed) {
            alertHeader = 'İSTİHBARAT: SALDIRI BAŞARILI';
            alertText = `Rakip grubun "${category}" odaklı siber sızması savunma hattınızı geçti. Bazı veriler kopyalandı.`;
            reports.push(`[DÜŞMAN] ${alertText}`);
        } else {
            alertHeader = 'SAVUNMA BAŞARILI';
            alertText = `Tesislerimize yönelik "${category}" sızma girişimi kalkanlarımıza çarparak başarısız oldu.`;
            reports.push(`[SAVUNMA] ${alertText}`);
        }
        return {
            updatedState: {
                ...state,
                operationReports: reports
            },
            alertHeader,
            alertText
        };
    }
}
}),
"[project]/src/lib/fm/evolutionDayService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════
// Evolution Day Service — Pure function for daily game evolution
// Extracted from page.tsx runEvolution callback (Task 2.2-e)
// ═══════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "processEvolutionDay",
    ()=>processEvolutionDay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$evolution$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/evolution.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$retirement$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/retirement.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/youthAcademy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$seasonAwardsService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/seasonAwardsService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$OperationManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/OperationManager.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
function processEvolutionDay(input) {
    const { squad, profile, trainingState, youthPlayers, youthFacilities } = input;
    const isSeasonEnd = profile.current_day > 0 && profile.current_day % 34 === 0;
    // ── 1. Daily player evolution ──────────────────────────────────────
    let updatedSquad = squad.map((player)=>{
        const matchRatings = player.match_ratings || [];
        let performance;
        if (matchRatings.length > 0) {
            performance = matchRatings.reduce((sum, r)=>sum + r, 0) / matchRatings.length;
        } else {
            performance = 3;
        }
        let evolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$evolution$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UpdatePlayerStats"])(player, performance);
        if (profile.current_day % 34 === 17 && !evolved.is_retiring) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$retirement$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldPlayerRetire"])(evolved)) evolved.is_retiring = true;
        }
        return evolved;
    });
    // Apply daily updates (injuries, form, morale)
    updatedSquad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$evolution$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["processDailyUpdates"])(updatedSquad);
    // ── 2. Season-end processing ───────────────────────────────────────
    let retiredLog = null;
    let hofInduction = null;
    let updatedYouthPlayers = youthPlayers;
    let youthSaveNeeded = false;
    if (isSeasonEnd) {
        const { updatedSquad: nextSeasonSquad, retiredPlayers, newTalents } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$retirement$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["processSeasonEndRetirements"])(updatedSquad, profile.id);
        updatedSquad = nextSeasonSquad;
        // Stadium Academy Bonus
        const academyLvl = (profile.stadium_upgrades || {})['academy'] || 0;
        if (academyLvl === 10) {
            const eliteWonderkid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEliteWonderkid"])();
            eliteWonderkid.id = `wonderkid-${Date.now()}`;
            newTalents.push(eliteWonderkid);
            updatedSquad.push(eliteWonderkid);
        }
        // Youth aging + intake
        const aged = updatedYouthPlayers.map((yp)=>{
            const newAge = yp.age + 1;
            const newCategory = newAge <= 17 ? 'U17' : newAge <= 19 ? 'U19' : 'U21';
            if (newAge > 21) return null;
            return {
                ...yp,
                age: newAge,
                category: newCategory
            };
        }).filter(Boolean);
        const academyLevel = profile.academy_level || 1;
        const intakeCount = Math.min(5, 1 + academyLevel);
        const newIntake = [];
        for(let i = 0; i < intakeCount; i++){
            const yp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateYouthPlayer"])(academyLevel);
            const withReport = {
                ...yp,
                scoutReport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateScoutReport"])(yp)
            };
            newIntake.push(withReport);
        }
        updatedYouthPlayers = [
            ...aged,
            ...newIntake
        ];
        youthSaveNeeded = true;
        retiredLog = {
            retired: retiredPlayers,
            talents: newTalents
        };
        // HoF induction info (caller handles the async call)
        if (retiredPlayers.length > 0 && profile.id) {
            const retiredSeason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$seasonAwardsService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSeasonId"])(profile.current_day);
            hofInduction = {
                retiredPlayers,
                profileId: profile.id,
                currentDay: profile.current_day,
                retiredSeason
            };
        }
    }
    // ── 3. Weekly youth training (every 7 days) ────────────────────────
    const currentDay = profile.current_day ?? 1;
    if (currentDay > 0 && currentDay % 7 === 0) {
        if (updatedYouthPlayers.length > 0) {
            const facilityStates = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YOUTH_FACILITIES"].map((f)=>({
                    facilityId: f.id,
                    currentLevel: youthFacilities[f.id] ?? 1
                }));
            updatedYouthPlayers = updatedYouthPlayers.map((yp)=>{
                try {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["processYouthWeeklyTraining"])(yp, facilityStates);
                } catch  {
                    return yp;
                }
            });
            youthSaveNeeded = true;
        }
    }
    // ── 4. Financial daily income + day increment ──────────────────────
    const stadiumUpgrades = profile.stadium_upgrades || {};
    const storeLvl = stadiumUpgrades['store'] || 0;
    const dailyIncome = storeLvl * 5000;
    const updatedProfile = {
        ...profile,
        current_day: (profile.current_day || 1) + 1,
        money: (profile.money || 0) + dailyIncome
    };
    // ── 5. Scouting progress ───────────────────────────────────────────
    let updatedTrainingState = trainingState;
    if (trainingState?.scouting) {
        const newFoundPlayers = [];
        const updatedScouts = trainingState.scouting.scouts.map((s)=>{
            if (s.status === 'SCOUTING') {
                const remaining = s.remainingDays - 1;
                if (remaining <= 0) {
                    const playerCount = 2 + Math.floor(Math.random() * s.stars);
                    for(let i = 0; i < playerCount; i++){
                        const pos = [
                            'GK',
                            'DEF',
                            'MID',
                            'FWD'
                        ][Math.floor(Math.random() * 4)];
                        const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateStarterPlayer"])(pos);
                        const bonus = (s.stars - 3) * 4;
                        p.rating = Math.max(45, Math.min(94, p.rating + bonus));
                        p.potential = Math.max(p.rating, Math.min(99, p.potential + bonus + 2));
                        newFoundPlayers.push(p);
                    }
                    return {
                        ...s,
                        status: 'IDLE',
                        remainingDays: 0,
                        location: undefined
                    };
                }
                return {
                    ...s,
                    remainingDays: remaining
                };
            }
            return s;
        });
        updatedTrainingState = {
            ...updatedTrainingState,
            scouting: {
                ...updatedTrainingState.scouting,
                scouts: updatedScouts,
                foundPlayersPool: [
                    ...updatedTrainingState.scouting?.foundPlayersPool || [],
                    ...newFoundPlayers
                ]
            }
        };
    }
    // ── 6. Enemy attack simulation (10% chance) ────────────────────────
    let alertInfo = null;
    if (Math.random() < 0.1) {
        const { updatedState, alertHeader, alertText } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$OperationManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationManager"].getInstance().simulateEnemyAttack(updatedProfile, updatedTrainingState);
        updatedTrainingState = updatedState;
        if (alertHeader) {
            alertInfo = {
                header: alertHeader,
                text: alertText || ''
            };
        }
    }
    // ── Return ─────────────────────────────────────────────────────────
    return {
        updatedSquad,
        updatedProfile,
        updatedTrainingState,
        updatedYouthPlayers,
        retiredLog,
        hofInduction,
        alertInfo,
        youthSaveNeeded
    };
}
}),
"[project]/src/lib/fm/helpers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "syncPlayerStats",
    ()=>syncPlayerStats
]);
function syncPlayerStats(player) {
    // Ensure stats don't exceed potential or bounds
    const potential = player.potential || 99;
    const cap = (val)=>val !== undefined ? Math.min(99, Math.max(1, val)) : val;
    return {
        ...player,
        rating: Math.min(potential, Math.max(1, player.rating)),
        shooting: cap(player.shooting),
        passing: cap(player.passing),
        defending: cap(player.defending),
        speed: cap(player.speed),
        power: cap(player.power),
        goalkeeping: cap(player.goalkeeping),
        vision: cap(player.vision),
        control: cap(player.control),
        heading: cap(player.heading)
    };
}
}),
"[project]/src/lib/fm/emotionalEvents.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * lib/emotionalEvents.ts
 *
 * Duygusal katman — kritik anları tespit eden sistem.
 * Rekor, şampiyonluk, büyük transfer, kariyer dönüm noktaları gibi
 * olayları algılar ve EmotionalEvent objesi döner.
 */ __turbopack_context__.s([
    "checkBigTransfer",
    ()=>checkBigTransfer,
    "checkCareerMilestones",
    ()=>checkCareerMilestones,
    "checkChampion",
    ()=>checkChampion,
    "checkMatchDrama",
    ()=>checkMatchDrama,
    "checkMostAppearances",
    ()=>checkMostAppearances,
    "checkTopScorerRecord",
    ()=>checkTopScorerRecord,
    "detectEmotionalEvents",
    ()=>detectEmotionalEvents,
    "emitEmotionalEvent",
    ()=>emitEmotionalEvent,
    "onEmotionalEvent",
    ()=>onEmotionalEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/sound.ts [app-ssr] (ecmascript)");
;
// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────
/**
 * Oyuncunun toplam gol sayısını hesaplar (goalStats veya match_ratings üzerinden).
 */ function getPlayerTotalGoals(player) {
    try {
        if (player.goalStats) {
            const gs = player.goalStats;
            return (gs.plase ?? 0) + (gs.header ?? 0) + (gs.head_right ?? 0) + (gs.head_left ?? 0) + (gs.one_touch ?? 0) + (gs.postup_turn ?? 0) + (gs.sprint_finish ?? 0) + (gs.long_shot ?? 0) + (gs.penalty ?? 0) + (gs.freekick ?? 0);
        }
        // Fallback: rating bazlı tahmin
        return player.shooting ? Math.floor(player.shooting / 10) : 0;
    } catch  {
        return 0;
    }
}
/**
 * Oyuncunun maç sayısını tahmin eder (match_ratings dizisi uzunluğundan).
 */ function getPlayerMatchCount(player) {
    try {
        return player.match_ratings?.length ?? 0;
    } catch  {
        return 0;
    }
}
function formatMoney(amount) {
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M €`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(0)}K €`;
    }
    return `${amount} €`;
}
function checkTopScorerRecord(players, profile) {
    try {
        if (!players || players.length === 0 || !profile) return null;
        const withGoals = players.map((p)=>({
                player: p,
                goals: getPlayerTotalGoals(p)
            }));
        withGoals.sort((a, b)=>b.goals - a.goals);
        const topScorer = withGoals[0];
        if (!topScorer || topScorer.goals < 5) return null;
        const secondBest = withGoals[1]?.goals ?? 0;
        if (topScorer.goals > secondBest && topScorer.goals >= 8) {
            return {
                type: 'RECORD_TOP_SCORER',
                severity: topScorer.goals >= 20 ? 'legendary' : 'high',
                title: 'GOL KRALI REKORU!',
                description: `${topScorer.player.name}, takımın en golcü oyuncusu oldu! ${topScorer.goals} gol ile tarihe geçti.`,
                icon: '👢',
                player: topScorer.player.name,
                teamName: profile.team_name,
                metadata: {
                    goals: topScorer.goals
                },
                timestamp: Date.now()
            };
        }
        return null;
    } catch (err) {
        console.error('[emotionalEvents] checkTopScorerRecord error:', err);
        return null;
    }
}
function checkMostAppearances(players, profile) {
    try {
        if (!players || players.length === 0 || !profile) return null;
        const withMatches = players.map((p)=>({
                player: p,
                matches: getPlayerMatchCount(p)
            }));
        withMatches.sort((a, b)=>b.matches - a.matches);
        const topPlayer = withMatches[0];
        if (!topPlayer || topPlayer.matches < 10) return null;
        const secondBest = withMatches[1]?.matches ?? 0;
        if (topPlayer.matches > secondBest && topPlayer.matches >= 20) {
            return {
                type: 'RECORD_MOST_APPEARANCES',
                severity: topPlayer.matches >= 50 ? 'legendary' : 'medium',
                title: 'EN ÇOK MAÇ OYNAYAN!',
                description: `${topPlayer.player.name}, ${topPlayer.matches} maçla takımın en sadık oyuncusu! Efsanevi bir bağlılık!`,
                icon: '👕',
                player: topPlayer.player.name,
                teamName: profile.team_name,
                metadata: {
                    matches: topPlayer.matches
                },
                timestamp: Date.now()
            };
        }
        return null;
    } catch (err) {
        console.error('[emotionalEvents] checkMostAppearances error:', err);
        return null;
    }
}
function checkChampion(leagueStandings, profile) {
    try {
        if (!leagueStandings || leagueStandings.length === 0 || !profile) return null;
        const sorted = [
            ...leagueStandings
        ].sort((a, b)=>b.points - a.points);
        const champion = sorted[0];
        if (champion && (champion.is_user_team || champion.name === profile.team_name)) {
            return {
                type: 'CHAMPION',
                severity: 'legendary',
                title: 'ŞAMPİYONLUK!',
                description: `${profile.team_name} ligi birinci bitirdi! Taraftarlar çıldırmış durumda! Bu unutulmaz bir an!`,
                icon: '🏆',
                teamName: profile.team_name,
                metadata: {
                    points: champion.points
                },
                timestamp: Date.now()
            };
        }
        return null;
    } catch (err) {
        console.error('[emotionalEvents] checkChampion error:', err);
        return null;
    }
}
function checkBigTransfer(transferFee, playerName, profile, threshold = 1_000_000) {
    try {
        if (!transferFee || !playerName || !profile) return null;
        const THRESHOLD = threshold;
        if (transferFee >= THRESHOLD) {
            return {
                type: 'BIG_TRANSFER',
                severity: transferFee >= 5_000_000 ? 'legendary' : 'high',
                title: 'BÜYÜK TRANSFER!',
                description: `${playerName}, ${formatMoney(transferFee)} karşılığında takıma katıldı! Bu kulüp tarihinin en pahalı transferi!`,
                icon: '💰',
                player: playerName,
                teamName: profile.team_name,
                metadata: {
                    fee: transferFee
                },
                timestamp: Date.now()
            };
        }
        return null;
    } catch (err) {
        console.error('[emotionalEvents] checkBigTransfer error:', err);
        return null;
    }
}
function checkCareerMilestones(player, matchResult) {
    try {
        const events = [];
        if (!player || !matchResult) return events;
        const playerStats = matchResult.playerStats?.[player.id];
        if (!playerStats) return events;
        // İlk gol (oyuncunun hiç goalStats'ı yoksa veya gol sayısı 0 ise)
        if ((playerStats.goals ?? 0) > 0) {
            const totalGoals = getPlayerTotalGoals(player);
            if (totalGoals <= (playerStats.goals ?? 0)) {
                events.push({
                    type: 'CAREER_FIRST_GOAL',
                    severity: 'high',
                    title: 'İLK GOL!',
                    description: `${player.name} kariyerinin ilk golünü attı! Bu anı hiç unutmayacak!`,
                    icon: '⚽',
                    player: player.name,
                    metadata: {
                        goals: playerStats.goals
                    },
                    timestamp: Date.now()
                });
            }
        }
        // İlk asist
        if ((playerStats.assists ?? 0) > 0 && getPlayerMatchCount(player) <= 1) {
            events.push({
                type: 'CAREER_FIRST_ASSIST',
                severity: 'medium',
                title: 'İLK ASİST!',
                description: `${player.name} kariyerinin ilk asistini yaptı! Harika bir başlangıç!`,
                icon: '🅰️',
                player: player.name,
                metadata: {
                    assists: playerStats.assists
                },
                timestamp: Date.now()
            });
        }
        // Hat-trick
        if ((playerStats.goals ?? 0) >= 3) {
            events.push({
                type: 'CAREER_HAT_TRICK',
                severity: 'legendary',
                title: 'HAT-TRICK!',
                description: `${player.name} bir maçta 3 gol attı! Muhteşem bir performans!`,
                icon: '🎩',
                player: player.name,
                metadata: {
                    goals: playerStats.goals
                },
                timestamp: Date.now()
            });
        }
        return events;
    } catch (err) {
        console.error('[emotionalEvents] checkCareerMilestones error:', err);
        return [];
    }
}
function checkMatchDrama(matchResult, teamName) {
    try {
        const events = [];
        if (!matchResult || !matchResult.events) return events;
        // Son dakika golü (85+ dakikada gol ve galibiyet)
        const lateGoals = matchResult.events.filter((e)=>e.type === 'GOAL' && e.minute >= 85);
        for (const goal of lateGoals){
            const isWinner = matchResult.score.home > matchResult.score.away ? goal.team === 'HOME' : matchResult.score.away > matchResult.score.home ? goal.team === 'AWAY' : false;
            if (isWinner) {
                events.push({
                    type: 'LATE_WINNER',
                    severity: 'legendary',
                    title: 'SON DAKİKA GOLÜ!',
                    description: `${goal.player ?? 'Bilinmeyen'}, ${goal.minute}. dakikada takıma galibiyeti getirdi! Tribünler çıldırdı!`,
                    icon: '🔥',
                    player: goal.player,
                    teamName,
                    metadata: {
                        minute: goal.minute
                    },
                    timestamp: Date.now()
                });
            }
        }
        return events;
    } catch (err) {
        console.error('[emotionalEvents] checkMatchDrama error:', err);
        return [];
    }
}
function detectEmotionalEvents(params) {
    try {
        const results = [];
        const { players, profile, leagueStandings, matchResult, transferFee, transferPlayerName } = params;
        const scorerRecord = checkTopScorerRecord(players, profile);
        if (scorerRecord) results.push(scorerRecord);
        const appearanceRecord = checkMostAppearances(players, profile);
        if (appearanceRecord) results.push(appearanceRecord);
        if (leagueStandings) {
            const champion = checkChampion(leagueStandings, profile);
            if (champion) results.push(champion);
        }
        if (transferFee && transferPlayerName) {
            const bigTransfer = checkBigTransfer(transferFee, transferPlayerName, profile);
            if (bigTransfer) results.push(bigTransfer);
        }
        if (matchResult) {
            for (const player of players){
                const milestones = checkCareerMilestones(player, matchResult);
                results.push(...milestones);
            }
            const drama = checkMatchDrama(matchResult, profile.team_name);
            results.push(...drama);
        }
        const severityOrder = {
            legendary: 3,
            high: 2,
            medium: 1,
            low: 0
        };
        results.sort((a, b)=>severityOrder[b.severity] - severityOrder[a.severity]);
        return results;
    } catch (err) {
        console.error('[emotionalEvents] detectEmotionalEvents error:', err);
        return [];
    }
}
const listeners = new Set();
function onEmotionalEvent(handler) {
    listeners.add(handler);
    return ()=>{
        listeners.delete(handler);
    };
}
function emitEmotionalEvent(event) {
    try {
        for (const handler of listeners){
            handler(event);
        }
        // Play sound effect based on event type
        try {
            if (event.type === 'CHAMPION') (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSound"])('champion');
            else if (event.type === 'PROMOTION') (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSound"])('applause');
            else if (event.type === 'BIG_TRANSFER') (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSound"])('transfer');
            else if (event.type.startsWith('RECORD_')) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSound"])('record');
        } catch  {}
    } catch (err) {
        console.error('[emotionalEvents] emitEmotionalEvent error:', err);
    }
}
}),
"[project]/src/lib/fm/schedule.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeMatchDateFromDay",
    ()=>computeMatchDateFromDay,
    "getCompetitionIcon",
    ()=>getCompetitionIcon,
    "getCompetitionLabel",
    ()=>getCompetitionLabel,
    "getDayFromDate",
    ()=>getDayFromDate,
    "getHourFromDate",
    ()=>getHourFromDate,
    "isMatchDay",
    ()=>isMatchDay,
    "isMatchTime",
    ()=>isMatchTime,
    "isTrainingTime",
    ()=>isTrainingTime,
    "nextCupMatchDate",
    ()=>nextCupMatchDate
]);
const getDayFromDate = (date)=>{
    // Date.getDay() returns 0 for Sunday, 1 for Monday etc.
    // The user wants TRT time.
    // Assuming the environment is UTC, TRT is UTC+3.
    const trtDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return trtDate.getUTCDay();
};
const getHourFromDate = (date)=>{
    const trtDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return trtDate.getUTCHours();
};
const isMatchDay = (date, competitionType = 'league')=>{
    const day = getDayFromDate(date);
    if (competitionType === 'league') return day >= 1 && day <= 5; // Mon-Fri
    if (competitionType === 'cup') return day === 0 || day === 6; // Pazar veya Cumartesi
    return day >= 1 && day <= 5; // friendly = weekday
};
const isMatchTime = (date, competitionType = 'league')=>{
    if (!isMatchDay(date, competitionType)) return false;
    const hour = getHourFromDate(date);
    if (competitionType === 'league') return hour === 12 || hour === 18;
    if (competitionType === 'cup') return hour === 15 || hour === 20; // 15:00 veya 20:00
    if (competitionType === 'friendly') return hour === 15;
    return false;
};
const isTrainingTime = (date)=>{
    const day = getDayFromDate(date);
    if (day === 0 || day === 6) return false; // weekend off
    const hour = getHourFromDate(date);
    return hour === 15 || hour === 21;
};
function getCompetitionIcon(competitionType) {
    switch(competitionType){
        case 'cup':
            return '🏆';
        case 'friendly':
            return '🤝';
        case 'league':
        default:
            return '⚽';
    }
}
function getCompetitionLabel(competitionType) {
    switch(competitionType){
        case 'cup':
            return 'Kupa Maçı';
        case 'friendly':
            return 'Hazırlık Maçı';
        case 'league':
        default:
            return 'Lig Maçı';
    }
}
function nextCupMatchDate(from) {
    const d = from ? new Date(from) : new Date();
    const day = d.getDay();
    // Find next Saturday (6)
    const diff = day === 6 ? 7 : (6 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(15 + Math.floor(Math.random() * 2) * 5, 0, 0, 0); // 15:00 veya 20:00
    return d;
}
function computeMatchDateFromDay(currentDay) {
    const seasonStart = new Date(2025, 7, 1); // 1 Ağustos 2025
    const date = new Date(seasonStart);
    date.setDate(date.getDate() + (currentDay - 1) * 4); // 4 günlük aralıklar
    return date.toISOString().split('T')[0];
}
}),
"[project]/src/lib/fm/league.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/fm/supabaseRateLimit.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
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
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
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
"[project]/src/lib/fm/security.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$supabaseRateLimit$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/supabaseRateLimit.ts [app-ssr] (ecmascript)");
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
        __turbopack_context__.A("[project]/src/lib/fm/supabaseRateLimit.ts [app-ssr] (ecmascript, async loader)").then(({ cleanupRateLimits })=>cleanupRateLimits());
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
"[project]/src/lib/fm/unifiedMessagingService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MESSAGE_CATEGORIES",
    ()=>MESSAGE_CATEGORIES,
    "QUICK_REPLIES",
    ()=>QUICK_REPLIES,
    "REACTION_EMOJIS",
    ()=>REACTION_EMOJIS,
    "deleteMessage",
    ()=>deleteMessage,
    "generateFixtureId",
    ()=>generateFixtureId,
    "getConversationMessages",
    ()=>getConversationMessages,
    "getManagerPresence",
    ()=>getManagerPresence,
    "getMultiplePresence",
    ()=>getMultiplePresence,
    "getMyConversations",
    ()=>getMyConversations,
    "getOrCreateConversation",
    ()=>getOrCreateConversation,
    "getTotalUnreadCount",
    ()=>getTotalUnreadCount,
    "loadMatchChat",
    ()=>loadMatchChat,
    "markMessagesAsRead",
    ()=>markMessagesAsRead,
    "searchRivalManagers",
    ()=>searchRivalManagers,
    "sendDirectMessage",
    ()=>sendDirectMessage,
    "sendMatchChatMessage",
    ()=>sendMatchChatMessage,
    "sendMatchEvent",
    ()=>sendMatchEvent,
    "sendMatchReaction",
    ()=>sendMatchReaction,
    "subscribeToConversationMessages",
    ()=>subscribeToConversationMessages,
    "subscribeToDirectMessages",
    ()=>subscribeToDirectMessages,
    "subscribeToMatchChat",
    ()=>subscribeToMatchChat,
    "subscribeToPresence",
    ()=>subscribeToPresence,
    "unsubscribeAll",
    ()=>unsubscribeAll,
    "unsubscribeFromChannel",
    ()=>unsubscribeFromChannel,
    "unsubscribeFromMatchChat",
    ()=>unsubscribeFromMatchChat,
    "updateMyPresence",
    ()=>updateMyPresence
]);
/**
 * Unified Messaging Service
 * Tek bir Supabase Realtime bağlantısı üzerinden hem özel mesajları (direct)
 * hem de maç odalarını (match chat) yönetir.
 *
 * Kanal adları:
 *   - direct:${sortedId1}-${sortedId2}  → Özel mesajlar
 *   - match:${matchId}                  → Maç sohbeti
 *
 * Supabase JS client, tüm kanalları tek bir WebSocket üzerinden çoklayarak
 * (multiplex) gönderir; bu servis katmanı abonelikleri merkezi olarak yönetir.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/fm/security.ts [app-ssr] (ecmascript) <locals>");
;
;
const MESSAGE_CATEGORIES = {
    general: {
        label: 'Genel',
        emoji: '💬',
        color: '#6b7280'
    },
    trash_talk: {
        label: 'Ses Savaşı',
        emoji: '🔥',
        color: '#ef4444'
    },
    transfer: {
        label: 'Transfer',
        emoji: '💰',
        color: '#f59e0b'
    },
    alliance: {
        label: 'İttifak',
        emoji: '🤝',
        color: '#10b981'
    },
    friendly_invite: {
        label: 'Hazırlık Maçı',
        emoji: '⚽',
        color: '#3b82f6'
    },
    season_greeting: {
        label: 'Sezon Tebriği',
        emoji: '🎉',
        color: '#8b5cf6'
    }
};
const QUICK_REPLIES = {
    general: [
        'Nasılsın? Maça hazır mısın?',
        'Takımın bu sezon iyi görünüyor!',
        'Bir sonraki maçımıza kadar şanslı kal!'
    ],
    trash_talk: [
        'Sahada görüşürüz! Hazır ol!',
        'Takımın bizim karşımızda şanssız!',
        'Bu hafta yenileceksiniz, bilesin!',
        'Kupayı biz alacağız!'
    ],
    transfer: [
        'Oyuncun satılık mı?',
        'Transfer teklifim var, ilgilenir misin?',
        'Takas teklifi: 2 oyuncu against 1?'
    ],
    alliance: [
        'İttifak teklif ediyorum!',
        'Birlikte güçlü oluruz!',
        'Ligde birlikte hareket edelim mi?'
    ],
    friendly_invite: [
        'Hazırlık maçı ister misin?',
        'Bugün maç yapalım mı?',
        'Antrenman maçı teklif ediyorum!'
    ],
    season_greeting: [
        'Yeni sezonun kutlu olsun!',
        'Başarılar dilerim!',
        'Bu sezon şampiyon sen ol!'
    ]
};
const REACTION_EMOJIS = [
    {
        emoji: '⚽',
        label: 'Gol!'
    },
    {
        emoji: '🔥',
        label: 'Ateşli'
    },
    {
        emoji: '😱',
        label: 'Şok'
    },
    {
        emoji: '👏',
        label: 'Alkış'
    },
    {
        emoji: '❤️',
        label: 'Sevgi'
    },
    {
        emoji: '😂',
        label: 'Komik'
    },
    {
        emoji: '😤',
        label: 'Sinirli'
    },
    {
        emoji: '🤦',
        label: 'Yuh'
    }
];
// ═══════════════════════════════════════════════════════════════════════
// CHANNEL REGISTRY — aktif abonelikleri merkezi olarak takip eder
// ═══════════════════════════════════════════════════════════════════════
const activeChannels = new Map();
function getOrCreateChannel(channelName) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) throw new Error('Supabase yapılandırılmamış');
    const existing = activeChannels.get(channelName);
    if (existing) return existing;
    const channel = supabase.channel(channelName);
    activeChannels.set(channelName, channel);
    return channel;
}
function removeChannel(channelName) {
    const channel = activeChannels.get(channelName);
    if (channel) {
        channel.unsubscribe();
        activeChannels.delete(channelName);
    }
}
function unsubscribeAll() {
    for (const [, channel] of activeChannels){
        channel.unsubscribe();
    }
    activeChannels.clear();
}
// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════
function generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
function generateConversationId(p1, p2) {
    const sorted = [
        p1,
        p2
    ].sort();
    return `conv-${sorted[0]}-${sorted[1]}`.replace(/[^a-zA-Z0-9-]/g, '_');
}
function mapConversationFromRow(row) {
    return {
        id: row.id,
        participant1: row.participant_1,
        participant2: row.participant_2,
        lastMessageAt: row.last_message_at || '',
        lastMessageContent: row.last_message_content || '',
        lastMessageSender: row.last_message_sender || '',
        createdAt: row.created_at || ''
    };
}
function mapMessageFromRow(row) {
    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content || '',
        messageType: row.message_type || 'general',
        isRead: row.is_read ?? false,
        readAt: row.read_at || null,
        createdAt: row.created_at || '',
        senderName: row.profiles?.manager_name || row.sender_name || '',
        senderTeamName: row.profiles?.team_name || row.sender_team_name || ''
    };
}
function mapPresenceFromRow(row) {
    return {
        profileId: row.profile_id,
        isOnline: row.is_online ?? false,
        lastSeen: row.last_seen || '',
        statusText: row.status_text || ''
    };
}
function mapChatFromRow(row) {
    return {
        id: row.id,
        fixture_id: row.fixture_id,
        profile_id: row.profile_id,
        sender_name: row.sender_name,
        content: row.content,
        message_type: row.message_type || 'chat',
        reaction_type: row.reaction_type,
        minute: row.minute,
        created_at: row.created_at
    };
}
async function getOrCreateConversation(myId, otherId, _otherName) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const convId = generateConversationId(myId, otherId);
        const { data: existing, error: fetchErr } = await supabase.from('manager_conversations').select('*').eq('id', convId).maybeSingle();
        if (fetchErr) {
            console.error('getOrCreateConversation fetch error:', fetchErr);
            return {
                error: fetchErr.message
            };
        }
        if (existing) {
            return {
                conversation: mapConversationFromRow(existing)
            };
        }
        const sorted = [
            myId,
            otherId
        ].sort();
        const { data: created, error: insertErr } = await supabase.from('manager_conversations').insert({
            id: convId,
            participant_1: sorted[0],
            participant_2: sorted[1],
            last_message_at: new Date().toISOString()
        }).select().single();
        if (insertErr) {
            console.error('getOrCreateConversation insert error:', insertErr);
            return {
                error: insertErr.message
            };
        }
        return {
            conversation: mapConversationFromRow(created)
        };
    } catch (err) {
        return {
            error: err.message || 'Bilinmeyen hata'
        };
    }
}
async function getMyConversations(myId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const { data, error } = await supabase.from('manager_conversations').select(`
        *,
        p1:profiles!manager_conversations_participant_1_fkey(manager_name, team_name),
        p2:profiles!manager_conversations_participant_2_fkey(manager_name, team_name)
      `).or(`participant_1.eq.${myId},participant_2.eq.${myId}`).order('last_message_at', {
            ascending: false
        });
        if (error) {
            console.error('getMyConversations error:', error);
            return {
                error: error.message
            };
        }
        if (!data) return {
            conversations: []
        };
        const convIds = data.map((c)=>c.id);
        const { data: unreadData } = await supabase.from('manager_messages').select('conversation_id').in('conversation_id', convIds).eq('is_read', false).neq('sender_id', myId);
        const unreadMap = new Map();
        (unreadData || []).forEach((r)=>{
            unreadMap.set(r.conversation_id, (unreadMap.get(r.conversation_id) || 0) + 1);
        });
        const conversations = data.map((row)=>{
            const conv = mapConversationFromRow(row);
            const isP1 = conv.participant1 === myId;
            const otherProfile = isP1 ? row.p2 : row.p1;
            return {
                ...conv,
                otherManagerName: otherProfile?.manager_name || 'Bilinmeyen',
                otherManagerTeam: otherProfile?.team_name || '',
                unreadCount: unreadMap.get(conv.id) || 0
            };
        });
        return {
            conversations
        };
    } catch (err) {
        return {
            error: err.message || 'Bilinmeyen hata'
        };
    }
}
async function sendDirectMessage(conversationId, senderId, content, messageType = 'general') {
    try {
        if (!content.trim()) return {
            error: 'Mesaj boş olamaz'
        };
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const trimmed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeInput"])(content, 500);
        if (!trimmed) return {
            error: 'Mesaj boş olamaz'
        };
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isValidMessageType"])(messageType)) {
            return {
                error: 'Geçersiz mesaj türü'
            };
        }
        const msgId = generateId();
        const { data, error } = await supabase.from('manager_messages').insert({
            id: msgId,
            conversation_id: conversationId,
            sender_id: senderId,
            content: trimmed,
            message_type: messageType,
            is_read: false
        }).select(`
        *,
        profiles:sender_id(manager_name, team_name)
      `).single();
        if (error) {
            console.error('sendDirectMessage error:', error);
            return {
                error: error.message
            };
        }
        // Update conversation's last message
        await supabase.from('manager_conversations').update({
            last_message_at: new Date().toISOString(),
            last_message_content: trimmed,
            last_message_sender: senderId
        }).eq('id', conversationId);
        return {
            message: mapMessageFromRow(data)
        };
    } catch (err) {
        return {
            error: err.message || 'Bilinmeyen hata'
        };
    }
}
async function getConversationMessages(conversationId, myId, limit = 50, beforeTimestamp) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        let query = supabase.from('manager_messages').select(`
        *,
        profiles:sender_id(manager_name, team_name)
      `).eq('conversation_id', conversationId).order('created_at', {
            ascending: true
        }).limit(limit);
        if (beforeTimestamp) {
            query = query.lt('created_at', beforeTimestamp);
        }
        const { data, error } = await query;
        if (error) {
            console.error('getConversationMessages error:', error);
            return {
                error: error.message
            };
        }
        const messages = (data || []).map(mapMessageFromRow);
        await markMessagesAsRead(conversationId, myId);
        return {
            messages
        };
    } catch (err) {
        return {
            error: err.message || 'Bilinmeyen hata'
        };
    }
}
async function markMessagesAsRead(conversationId, myId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase yapılandırılmamış'
        };
        const now = new Date().toISOString();
        const { error } = await supabase.from('manager_messages').update({
            is_read: true,
            read_at: now
        }).eq('conversation_id', conversationId).eq('is_read', false).neq('sender_id', myId);
        if (error) {
            console.error('markMessagesAsRead error:', error);
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
async function getTotalUnreadCount(myId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            count: 0
        };
        const { data: convs } = await supabase.from('manager_conversations').select('id').or(`participant_1.eq.${myId},participant_2.eq.${myId}`);
        if (!convs || convs.length === 0) return {
            count: 0
        };
        const convIds = convs.map((c)=>c.id);
        const { count, error } = await supabase.from('manager_messages').select('*', {
            count: 'exact',
            head: true
        }).in('conversation_id', convIds).eq('is_read', false).neq('sender_id', myId);
        if (error) {
            console.error('getTotalUnreadCount error:', error);
            return {
                count: 0,
                error: error.message
            };
        }
        return {
            count: count || 0
        };
    } catch (err) {
        return {
            count: 0,
            error: err.message
        };
    }
}
async function deleteMessage(messageId, senderId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase yapılandırılmamış'
        };
        const { error } = await supabase.from('manager_messages').delete().eq('id', messageId).eq('sender_id', senderId);
        if (error) {
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
async function updateMyPresence(myId, isOnline, statusText = '') {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase yapılandırılmamış'
        };
        const { error } = await supabase.from('manager_presence').upsert({
            profile_id: myId,
            is_online: isOnline,
            last_seen: new Date().toISOString(),
            status_text: statusText
        }, {
            onConflict: 'profile_id'
        });
        if (error) {
            console.error('updateMyPresence error:', error);
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
async function getManagerPresence(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const { data, error } = await supabase.from('manager_presence').select('*').eq('profile_id', profileId).maybeSingle();
        if (error) {
            return {
                error: error.message
            };
        }
        if (!data) {
            return {
                presence: {
                    profileId,
                    isOnline: false,
                    lastSeen: '',
                    statusText: ''
                }
            };
        }
        return {
            presence: mapPresenceFromRow(data)
        };
    } catch (err) {
        return {
            error: err.message
        };
    }
}
async function getMultiplePresence(profileIds) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const { data, error } = await supabase.from('manager_presence').select('*').in('profile_id', profileIds);
        if (error) {
            return {
                error: error.message
            };
        }
        const presences = (data || []).map(mapPresenceFromRow);
        return {
            presences
        };
    } catch (err) {
        return {
            error: err.message
        };
    }
}
async function searchRivalManagers(myId, query, limit = 10) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            error: 'Supabase yapılandırılmamış'
        };
        const safeQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeLikePattern"])(query);
        const { data, error } = await supabase.from('profiles').select('id, manager_name, team_name').neq('id', myId).ilike('team_name', `%${safeQuery}%`).limit(limit);
        if (error) {
            return {
                error: error.message
            };
        }
        if (!data || data.length === 0) {
            return {
                managers: []
            };
        }
        const ids = data.map((d)=>d.id);
        const { presences } = await getMultiplePresence(ids);
        const presenceMap = new Map((presences || []).map((p)=>[
                p.profileId,
                p.isOnline
            ]));
        const managers = data.map((d)=>({
                id: d.id,
                managerName: d.manager_name || 'Bilinmeyen',
                teamName: d.team_name || '',
                isOnline: presenceMap.get(d.id) || false
            }));
        return {
            managers
        };
    } catch (err) {
        return {
            error: err.message
        };
    }
}
function subscribeToDirectMessages(myId, onNewMessage, onConversationUpdate) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return null;
    const channelName = `direct:${myId}`;
    const channel = getOrCreateChannel(channelName);
    // Listen for new messages in any of user's conversations
    channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'manager_messages'
    }, (payload)=>{
        const msg = mapMessageFromRow(payload.new);
        onNewMessage(msg);
    });
    // Listen for conversation updates (last message, etc.)
    if (onConversationUpdate) {
        channel.on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'manager_conversations'
        }, (payload)=>{
            const conv = mapConversationFromRow(payload.new);
            if (conv.participant1 === myId || conv.participant2 === myId) {
                onConversationUpdate(conv);
            }
        });
    }
    channel.subscribe();
    return channel;
}
function subscribeToConversationMessages(conversationId, onMessage) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return null;
    const channelName = `direct-conv:${conversationId}`;
    const channel = getOrCreateChannel(channelName);
    channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'manager_messages',
        filter: `conversation_id=eq.${conversationId}`
    }, (payload)=>{
        const msg = mapMessageFromRow(payload.new);
        onMessage(msg);
    });
    channel.subscribe();
    return channel;
}
function subscribeToPresence(profileIds, onPresenceChange) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return null;
    const channelName = 'presence:global';
    const channel = getOrCreateChannel(channelName);
    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'manager_presence'
    }, (payload)=>{
        const p = mapPresenceFromRow(payload.new);
        if (profileIds.includes(p.profileId)) {
            onPresenceChange(p);
        }
    });
    channel.subscribe();
    return channel;
}
function unsubscribeFromChannel(channel) {
    if (channel) {
        channel.unsubscribe();
        // Registry'den de kaldır
        for (const [name, ch] of activeChannels){
            if (ch === channel) {
                activeChannels.delete(name);
                break;
            }
        }
    }
}
async function sendMatchChatMessage(fixtureId, profileId, senderName, content) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase not configured'
        };
        const trimmed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$security$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeInput"])(content, 200);
        if (!trimmed) return {
            success: false,
            error: 'Empty message'
        };
        const { error } = await supabase.from('match_chat').insert({
            fixture_id: fixtureId,
            profile_id: profileId,
            sender_name: senderName,
            content: trimmed,
            message_type: 'chat'
        });
        if (error) {
            console.error('[sendMatchChatMessage] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        console.error('[sendMatchChatMessage] Exception:', err);
        return {
            success: false,
            error: String(err)
        };
    }
}
async function sendMatchReaction(fixtureId, profileId, senderName, reaction, minute) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase not configured'
        };
        const { error } = await supabase.from('match_chat').insert({
            fixture_id: fixtureId,
            profile_id: profileId,
            sender_name: senderName,
            content: reaction,
            message_type: 'reaction',
            reaction_type: reaction,
            minute: minute
        });
        if (error) {
            console.error('[sendMatchReaction] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: String(err)
        };
    }
}
async function sendMatchEvent(event) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false
        };
        const contentMap = {
            goal: `⚽ GOL! ${event.player || ''} (${event.minute}')${event.assistPlayer ? ` | Asist: ${event.assistPlayer}` : ''}`,
            penalty_goal: `⚽ PENALTI GOLU! ${event.player || ''} (${event.minute}')`,
            free_kick_goal: `⚽ SERBEST VURUŞ GOLU! ${event.player || ''} (${event.minute}')`,
            yellow: `🟨 Sarı Kart ${event.player || ''} (${event.minute}')${event.reason ? ` - ${event.reason}` : ''}`,
            red: `🟥 Kırmızı Kart ${event.player || ''} (${event.minute}')${event.reason ? ` - ${event.reason}` : ''}`,
            second_yellow: `🟥 2. Sarı→Kırmızı ${event.player || ''} (${event.minute}')`,
            injury: `🏥 Sakatlık ${event.player || ''} (${event.minute}')`,
            halftime: `⏱️ Devre Arası`,
            fulltime: `🏁 Maç Sonu`,
            save: `🧤 Kurtarış ${event.player || ''} (${event.minute}')`,
            substitution: `🔄 Değişiklik ${event.player || ''} (${event.minute}')`,
            motm: `🏅 Maçın Adamı: ${event.player || ''}`
        };
        const { error } = await supabase.from('match_chat').insert({
            fixture_id: event.fixtureId,
            profile_id: event.profileId,
            sender_name: event.senderName,
            content: contentMap[event.eventType] || event.eventType,
            message_type: 'event',
            minute: event.minute
        });
        if (error) {
            console.error('[sendMatchEvent] Error:', error.message);
        }
        return {
            success: !error
        };
    } catch  {
        return {
            success: false
        };
    }
}
async function loadMatchChat(fixtureId, limit = 50) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return [];
        const { data, error } = await supabase.from('match_chat').select('*').eq('fixture_id', fixtureId).order('created_at', {
            ascending: true
        }).limit(limit);
        if (error || !data) return [];
        return data.map(mapChatFromRow);
    } catch  {
        return [];
    }
}
function subscribeToMatchChat(fixtureId, onMessage) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return null;
    const channelName = `match:${fixtureId}`;
    const channel = getOrCreateChannel(channelName);
    channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'match_chat',
        filter: `fixture_id=eq.${fixtureId}`
    }, (payload)=>{
        const msg = mapChatFromRow(payload.new);
        onMessage(msg);
    });
    channel.subscribe();
    return channel;
}
function unsubscribeFromMatchChat(channel) {
    if (channel) {
        channel.unsubscribe();
        for (const [name, ch] of activeChannels){
            if (ch === channel) {
                activeChannels.delete(name);
                break;
            }
        }
    }
}
function generateFixtureId(currentDay, opponentName) {
    const day = currentDay || 1;
    const week = Math.ceil(day / 7);
    const opp = opponentName?.replace(/\s+/g, '-').toLowerCase() || 'cpu';
    return `fixture-w${week}-${opp}`;
}
}),
"[project]/src/lib/fm/financialModel.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════
//  Managerium – Financial Model
//  Comprehensive revenue, expense, sponsor, broadcast, and FFP system
// ═══════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "DEFAULT_BROADCAST_DEAL",
    ()=>DEFAULT_BROADCAST_DEAL,
    "DEFAULT_STARTING_SPONSORS",
    ()=>DEFAULT_STARTING_SPONSORS,
    "FINANCIAL_DEFAULTS",
    ()=>FINANCIAL_DEFAULTS,
    "buildFinancialOverview",
    ()=>buildFinancialOverview,
    "calculateAttendance",
    ()=>calculateAttendance,
    "calculateMatchRevenue",
    ()=>calculateMatchRevenue,
    "calculateMatchRevenueLegacy",
    ()=>calculateMatchRevenueLegacy,
    "calculateStadiumCapacity",
    ()=>calculateStadiumCapacity,
    "calculateWageBillLimit",
    ()=>calculateWageBillLimit,
    "calculateWeeklyExpenses",
    ()=>calculateWeeklyExpenses,
    "calculateWeeklyRevenue",
    ()=>calculateWeeklyRevenue,
    "checkFinancialHealth",
    ()=>checkFinancialHealth,
    "generateBroadcastDeal",
    ()=>generateBroadcastDeal,
    "generateSponsorOffer",
    ()=>generateSponsorOffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript)");
;
function calculateWeeklyRevenue(profile, lastMatchAttendance, isHome, leaguePosition, tier = 1) {
    const capacity = profile.stadium_capacity ?? 15000;
    const ticketPrice = profile.ticket_price ?? 50;
    const avgFillRate = 0.7;
    const isHomeMatch = isHome ?? false;
    const sources = [];
    // ── Matchday Revenue ─────────────────────────────────────────
    const matchdaySources = [];
    if (isHomeMatch) {
        const expectedAttendance = Math.round(capacity * avgFillRate);
        const actualAttendance = lastMatchAttendance ?? expectedAttendance;
        const ticketRevenue = actualAttendance * ticketPrice;
        matchdaySources.push({
            id: 'ticket_sales',
            name: 'Bilet Satışları',
            nameEn: 'Ticket Sales',
            category: 'matchday',
            amount: ticketRevenue,
            frequency: 'per_match',
            isVariable: true,
            calculation: `seyirci (${actualAttendance.toLocaleString('tr-TR')}) × bilet fiyatı (${ticketPrice} €)`
        });
        // VIP / Hospitality revenue ≈ 8 % of ticket revenue
        const hospitalityRevenue = Math.round(ticketRevenue * 0.08);
        matchdaySources.push({
            id: 'hospitality',
            name: 'VIP ve Misafirlik',
            nameEn: 'Hospitality',
            category: 'matchday',
            amount: hospitalityRevenue,
            frequency: 'per_match',
            isVariable: true,
            calculation: 'bilet gelirinin %8\'i'
        });
        // Stadium ticket revenue multiplier (stadiumMatrix)
        const upgrades = profile.stadium_upgrades || {};
        const stadiumLevel = upgrades['capacity'] || 0;
        const ticketMultiplier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStadiumTicketRevenueMultiplier"])(stadiumLevel);
        if (stadiumLevel > 0 && ticketMultiplier > 1) {
            const ticketBonus = Math.round(ticketRevenue * (ticketMultiplier - 1));
            matchdaySources.push({
                id: 'stadium_ticket_bonus',
                name: 'Stadyum Bilet Bonusu',
                nameEn: 'Stadium Ticket Bonus',
                category: 'matchday',
                amount: ticketBonus,
                frequency: 'per_match',
                isVariable: true,
                calculation: `stadyum seviye ${stadiumLevel} çarpanı (${ticketMultiplier.toFixed(1)})`
            });
        }
        // VIP revenue per match (stadiumMatrix)
        const vipLevel = upgrades['vip'] || 0;
        const vipRevenue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getVIPRevenuePerMatch"])(vipLevel);
        if (vipLevel > 0 && vipRevenue > 0) {
            matchdaySources.push({
                id: 'vip_lounge_revenue',
                name: 'VIP Loca Geliri',
                nameEn: 'VIP Lounge Revenue',
                category: 'matchday',
                amount: vipRevenue,
                frequency: 'per_match',
                isVariable: false,
                calculation: `VIP seviye ${vipLevel} × 50.000 €/maç`
            });
        }
        // Merchandise per home match ≈ reputation-dependent
        const merchBase = 15000;
        const merchRevenue = Math.round(merchBase * (profile.reputation / 50));
        matchdaySources.push({
            id: 'merchandise',
            name: 'Souvenir ve Forma Satışları',
            nameEn: 'Merchandise',
            category: 'matchday',
            amount: merchRevenue,
            frequency: 'per_match',
            isVariable: true,
            calculation: `temel matrah ${merchBase.toLocaleString('tr-TR')} € × itibar çarpanı (${(profile.reputation / 50).toFixed(2)})`
        });
        // Parking & F&B
        const parkingFbRevenue = Math.round(actualAttendance * 12);
        matchdaySources.push({
            id: 'parking_fb',
            name: 'Otopark ve Yiyecek-İçecek',
            nameEn: 'Parking & Food & Beverage',
            category: 'matchday',
            amount: parkingFbRevenue,
            frequency: 'per_match',
            isVariable: true,
            calculation: `seyirci (${actualAttendance.toLocaleString('tr-TR')}) × ortalama 12 €`
        });
    }
    // Away match – minimal merch at stadium shop
    if (!isHomeMatch) {
        matchdaySources.push({
            id: 'shop_sales_away',
            name: 'Mağaza Satışları (Deplasman)',
            nameEn: 'Club Shop Sales (Away)',
            category: 'matchday',
            amount: 5000,
            frequency: 'weekly',
            isVariable: true,
            calculation: 'sabit mağaza cirosu (deplasman haftası)'
        });
    }
    // ── Commercial Revenue ───────────────────────────────────────
    const commercialSources = [];
    // Sponsor weekly payouts (with media sponsor multiplier)
    const existingSponsors = profile.sponsors ?? [];
    const mediaLevel = (profile.stadium_upgrades || {})['media'] || 0;
    const mediaMultiplier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMediaSponsorMultiplier"])(mediaLevel);
    let weeklySponsorIncome = 0;
    for (const sp of existingSponsors){
        weeklySponsorIncome += Math.round(sp.weeklyPayout * mediaMultiplier);
    }
    if (weeklySponsorIncome > 0) {
        commercialSources.push({
            id: 'sponsor_payouts',
            name: 'Sponsor Ödemeleri',
            nameEn: 'Sponsor Payouts',
            category: 'commercial',
            amount: weeklySponsorIncome,
            frequency: 'weekly',
            isVariable: false,
            calculation: `${existingSponsors.length} aktif sponsorun haftalık ödemesi`
        });
    }
    // Kit sales – reputation based
    const kitWeekly = Math.round(8000 * (profile.reputation / 50));
    commercialSources.push({
        id: 'kit_sales',
        name: 'Forma Satışları',
        nameEn: 'Kit Sales',
        category: 'commercial',
        amount: kitWeekly,
        frequency: 'weekly',
        isVariable: true,
        calculation: `temel 8.000 € × itibar çarpanı (${(profile.reputation / 50).toFixed(2)})`
    });
    // Commercial partner income based on reputation
    const partnerIncome = Math.round(profile.reputation * 200);
    if (partnerIncome > 0) {
        commercialSources.push({
            id: 'commercial_partners',
            name: 'Ticari Ortak Gelirleri',
            nameEn: 'Commercial Partner Revenue',
            category: 'commercial',
            amount: partnerIncome,
            frequency: 'weekly',
            isVariable: true,
            calculation: `itibar (${profile.reputation}) × 200 €`
        });
    }
    // Stadium store daily revenue (stadiumMatrix)
    const storeLevel = (profile.stadium_upgrades || {})['store'] || 0;
    const storeDailyRevenue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStoreDailyRevenue"])(storeLevel);
    if (storeLevel > 0 && storeDailyRevenue > 0) {
        const weeklyStoreRevenue = storeDailyRevenue * 7;
        commercialSources.push({
            id: 'store_passive_income',
            name: 'Mağaza Pasif Geliri',
            nameEn: 'Store Passive Income',
            category: 'commercial',
            amount: weeklyStoreRevenue,
            frequency: 'weekly',
            isVariable: false,
            calculation: `mağaza seviye ${storeLevel} × ${storeDailyRevenue.toLocaleString('tr-TR')} €/gün × 7`
        });
    }
    // ── Broadcast Revenue ────────────────────────────────────────
    const broadcastSources = [];
    const tierMultiplier = {
        1: 1,
        2: 0.45,
        3: 0.18,
        4: 0.06
    }[tier] ?? 0.06;
    const baseWeeklyBroadcast = Math.round(350_000 * tierMultiplier);
    broadcastSources.push({
        id: 'broadcast_weekly',
        name: 'Yayın Geliri',
        nameEn: 'Broadcast Revenue',
        category: 'broadcast',
        amount: baseWeeklyBroadcast,
        frequency: 'weekly',
        isVariable: false,
        calculation: `temel 350.000 € × lig seviye çarpanı (${tierMultiplier})`
    });
    // Per-match broadcast bonus
    if (isHomeMatch) {
        const matchBonus = Math.round(120_000 * tierMultiplier);
        broadcastSources.push({
            id: 'broadcast_per_match',
            name: 'Maç Başı Yayın Bonusu',
            nameEn: 'Per-Match Broadcast Bonus',
            category: 'broadcast',
            amount: matchBonus,
            frequency: 'per_match',
            isVariable: true,
            calculation: `120.000 € × lig seviye çarpanı (${tierMultiplier})`
        });
    }
    // Position bonus (paid weekly for top-half finish in higher tiers)
    if (leaguePosition && leaguePosition <= 9 && tier <= 2) {
        const posBonus = Math.round((10 - leaguePosition) * 30_000 * tierMultiplier);
        broadcastSources.push({
            id: 'broadcast_position',
            name: 'Sıralama Yayın Bonusu',
            nameEn: 'Position Broadcast Bonus',
            category: 'broadcast',
            amount: posBonus,
            frequency: 'weekly',
            isVariable: true,
            calculation: `lig pozisyonu ${leaguePosition} → 30.000 € × (10 - ${leaguePosition}) × seviye çarpanı`
        });
    }
    // ── Transfer Revenue (weekly amortised) ──────────────────────
    const transferSources = [];
    // Estimate weekly transfer revenue from profile data
    const avgTransferIncomePerSale = Math.round(500_000 * (profile.reputation / 50));
    const estimatedSalesPerSeason = Math.max(1, Math.floor(profile.reputation / 25));
    const weeklyAmortisedTransfer = Math.round(avgTransferIncomePerSale * estimatedSalesPerSeason / 42);
    if (weeklyAmortisedTransfer > 0) {
        transferSources.push({
            id: 'transfer_sales_amortised',
            name: 'Oyuncu Satış Geliri (Amortisman)',
            nameEn: 'Player Sales Revenue (Amortised)',
            category: 'transfer',
            amount: weeklyAmortisedTransfer,
            frequency: 'weekly',
            isVariable: true,
            calculation: `ortalama satış ${avgTransferIncomePerSale.toLocaleString('tr-TR')} € × sezon başı ${estimatedSalesPerSeason} satış / 42 hafta`
        });
    }
    // ── Prize Revenue (weekly amortised) ─────────────────────────
    const prizeSources = [];
    // League prize money based on position and tier
    if (leaguePosition) {
        const tierPrizePool = {
            1: 50_000_000,
            2: 15_000_000,
            3: 5_000_000,
            4: 1_500_000
        };
        const pool = tierPrizePool[tier] ?? tierPrizePool[4];
        const positionShare = Math.max(0.02, (20 - leaguePosition) / 190); // top team ≈ 10%, bottom ≈ 2%
        const seasonPrize = Math.round(pool * positionShare);
        const weeklyPrize = Math.round(seasonPrize / 42);
        if (weeklyPrize > 0) {
            prizeSources.push({
                id: 'league_prize',
                name: 'Lig Ödülü (Amortisman)',
                nameEn: 'League Prize (Amortised)',
                category: 'prize',
                amount: weeklyPrize,
                frequency: 'weekly',
                isVariable: true,
                calculation: `lig ${tier}. seviye havuz ${pool.toLocaleString('tr-TR')} € × pozisyon payı ${(positionShare * 100).toFixed(1)}% / 42 hafta`
            });
        }
    }
    // Cup progress bonus (estimated based on reputation)
    const cupProgressBonus = Math.round(200_000 * (profile.reputation / 50));
    const weeklyCupPrize = Math.round(cupProgressBonus / 42);
    if (weeklyCupPrize > 0 && profile.reputation >= 20) {
        prizeSources.push({
            id: 'cup_prize',
            name: 'Kup Ödülü (Amortisman)',
            nameEn: 'Cup Prize (Amortised)',
            category: 'prize',
            amount: weeklyCupPrize,
            frequency: 'weekly',
            isVariable: true,
            calculation: `itibar çarpanı (${(profile.reputation / 50).toFixed(2)}) × temel 200.000 € / 42 hafta`
        });
    }
    // ── Totals ───────────────────────────────────────────────────
    const sum = (arr)=>arr.reduce((s, r)=>s + r.amount, 0);
    return {
        matchday: matchdaySources,
        commercial: commercialSources,
        broadcast: broadcastSources,
        transfer: transferSources,
        prize: prizeSources,
        total: sum(matchdaySources) + sum(commercialSources) + sum(broadcastSources) + sum(transferSources) + sum(prizeSources)
    };
}
function calculateWeeklyExpenses(squad, stadiumUpgrades, academyLevel = 0, tier = 1) {
    const expenses = [];
    const wages = [];
    const facility = [];
    const operation = [];
    const transfer = [];
    const agent = [];
    // ── Wages ────────────────────────────────────────────────────
    const totalWages = squad.reduce((sum, p)=>sum + p.salary, 0);
    wages.push({
        id: 'player_wages',
        name: 'Oyuncu Maaşları',
        category: 'wages',
        amount: totalWages,
        frequency: 'weekly'
    });
    // Agent fees – ~3 % of total wages
    const agentWeekly = Math.round(totalWages * 0.03);
    agent.push({
        id: 'agent_fees',
        name: 'Menajer Komisyonları',
        category: 'agent',
        amount: agentWeekly,
        frequency: 'weekly'
    });
    // ── Facility Maintenance ─────────────────────────────────────
    const upgrades = stadiumUpgrades ?? {};
    const stadiumLevel = upgrades['stadium'] ?? 1;
    const trainingLevel = upgrades['training'] ?? 1;
    const medicalLevel = upgrades['medical'] ?? 1;
    const youthLevel = upgrades['youth'] ?? 1;
    const stadiumMaint = Math.round(8_000 * stadiumLevel);
    const trainingMaint = Math.round(4_000 * trainingLevel);
    const medicalMaint = Math.round(3_500 * medicalLevel);
    const youthMaint = Math.round(2_500 * youthLevel);
    facility.push({
        id: 'stadium_maintenance',
        name: 'Stadyum Bakım',
        category: 'facility',
        amount: stadiumMaint,
        frequency: 'weekly'
    }, {
        id: 'training_ground_maint',
        name: 'Antrenman Tesisleri Bakım',
        category: 'facility',
        amount: trainingMaint,
        frequency: 'weekly'
    }, {
        id: 'medical_center_maint',
        name: 'Tıbbi Merkez İşletme',
        category: 'facility',
        amount: medicalMaint,
        frequency: 'weekly'
    }, {
        id: 'youth_facility_maint',
        name: 'Altyapı Tesisleri İşletme',
        category: 'facility',
        amount: youthMaint,
        frequency: 'weekly'
    });
    // ── Academy Running Costs ────────────────────────────────────
    const academyCostPerLevel = 6_000;
    const academyWeekly = academyLevel * academyCostPerLevel;
    if (academyWeekly > 0) {
        operation.push({
            id: 'academy_running',
            name: 'Akademi İşletme Masrafları',
            category: 'operation',
            amount: academyWeekly,
            frequency: 'weekly'
        });
    }
    // ── Staff Costs ──────────────────────────────────────────────
    const staffCount = 15 + stadiumLevel * 3 + trainingLevel * 2;
    const staffCost = staffCount * 1_800;
    operation.push({
        id: 'staff_costs',
        name: 'Personel Giderleri',
        category: 'operation',
        amount: staffCost,
        frequency: 'weekly'
    });
    // Travel / logistics (higher for away weeks, averaged here)
    const travelBase = tier <= 2 ? 12_000 : 6_000;
    operation.push({
        id: 'travel_logistics',
        name: 'Seyahat ve Lojistik',
        category: 'operation',
        amount: travelBase,
        frequency: 'weekly'
    });
    // Security & insurance
    const securityInsurance = Math.round(5_000 * stadiumLevel);
    operation.push({
        id: 'security_insurance',
        name: 'Güvenlik ve Sigorta',
        category: 'operation',
        amount: securityInsurance,
        frequency: 'weekly'
    });
    // ── Transfer Amortisation ─────────────────────────────────────
    const totalSquadValue = squad.reduce((sum, p)=>sum + (p.market_value ?? 0), 0);
    const amortisationWeekly = Math.round(totalSquadValue / (42 * 3)); // spread over 3 seasons (156 weeks)
    if (amortisationWeekly > 0) {
        transfer.push({
            id: 'transfer_amortisation',
            name: 'Transfer Amortismanı',
            category: 'transfer',
            amount: amortisationWeekly,
            frequency: 'weekly'
        });
    }
    // ── Totals ───────────────────────────────────────────────────
    const sumExp = (arr)=>arr.reduce((s, e)=>s + e.amount, 0);
    return {
        wages,
        facility,
        operation,
        transfer,
        agent,
        total: sumExp(wages) + sumExp(facility) + sumExp(operation) + sumExp(transfer) + sumExp(agent)
    };
}
// ─── Sponsor Offer Generation ────────────────────────────────────
const SPONSOR_NAMES_KIT = [
    'AeroSport',
    'TeknoFit',
    'BüyükEnerji',
    'KartalBeyaz',
    'TurkcellMax',
    'YıldızYakıt',
    'SaharaSoft',
    'KırmızıFırtına',
    'AltınBurun',
    'BuzMavi'
];
const SPONSOR_NAMES_SHIRT = [
    'ZiraatBankası',
    'HalkFinans',
    'AnadoluGrup',
    'TürkTelekom',
    'GarantiBBVA',
    'AkbankYıldız',
    'İşCep',
    'VodafoneKırmızı',
    'TürkHavaYolları',
    'Pirelli'
];
const SPONSOR_NAMES_STADIUM = [
    'MegaStadyum',
    'GüneşPark',
    'BoğazArena',
    'KartalArena',
    'AnadoluPark',
    'YıldızStadyum',
    'AltınSaha',
    'FırtınaArena',
    'MaviArena',
    'EgePark'
];
const SPONSOR_NAMES_TRAINING = [
    'ProTraining',
    'FitLife',
    'SportMax',
    'EurosportTR',
    'PowerGym',
    'AktifYaşam',
    'SporAkademi',
    'PerformanceLab',
    'FitPlus',
    'MaxPower'
];
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function generateId() {
    return Math.random().toString(36).substring(2, 11);
}
function generateSponsorOffer(leaguePosition, reputation, stadiumCapacity) {
    const typePool = leaguePosition <= 5 ? [
        'kit',
        'shirt',
        'stadium',
        'training_ground'
    ] : leaguePosition <= 12 ? [
        'kit',
        'shirt',
        'training_ground'
    ] : [
        'kit',
        'training_ground'
    ];
    const type = pickRandom([
        ...typePool
    ]);
    const namePool = type === 'kit' ? SPONSOR_NAMES_KIT : type === 'shirt' ? SPONSOR_NAMES_SHIRT : type === 'stadium' ? SPONSOR_NAMES_STADIUM : SPONSOR_NAMES_TRAINING;
    const name = pickRandom(namePool);
    // Value scaled by reputation (0-100), position, and type
    const repMultiplier = reputation / 50;
    const posMultiplier = Math.max(0.3, (20 - leaguePosition) / 18);
    const typeMultiplier = type === 'kit' ? 1 : type === 'shirt' ? 2.5 : type === 'stadium' ? 4 : 0.6;
    const baseValues = {
        kit: 800_000,
        shirt: 2_500_000,
        stadium: 5_000_000,
        training_ground: 400_000
    };
    const annualValue = Math.round(baseValues[type] * repMultiplier * posMultiplier * typeMultiplier);
    const weeklyPayout = Math.round(annualValue / 52);
    const durationWeeks = type === 'stadium' ? 156 : type === 'shirt' ? 104 : 78; // 3yr / 2yr / 1.5yr
    // Prestige 1–5
    const prestige = Math.min(5, Math.max(1, Math.ceil(repMultiplier * posMultiplier * 3)));
    // Bonus conditions
    const bonusConditions = [];
    if (leaguePosition <= 10) {
        bonusConditions.push({
            type: 'league_position',
            threshold: 3,
            bonus: Math.round(annualValue * 0.15)
        });
    }
    if (stadiumCapacity > 20000) {
        bonusConditions.push({
            type: 'attendance',
            threshold: Math.round(stadiumCapacity * 0.85),
            bonus: Math.round(annualValue * 0.08)
        });
    }
    return {
        id: generateId(),
        name,
        type,
        annualValue,
        weeklyPayout,
        durationWeeks,
        weeksRemaining: durationWeeks,
        bonusConditions,
        prestige,
        satisfaction: 50 + Math.round(reputation / 10)
    };
}
function generateBroadcastDeal(tier, leaguePosition) {
    const tierData = {
        1: {
            name: 'Süper Lig Yayın Hakları',
            annual: 18_000_000,
            match: 350_000,
            positions: [
                {
                    minPosition: 1,
                    bonus: 15_000_000
                },
                {
                    minPosition: 2,
                    bonus: 12_000_000
                },
                {
                    minPosition: 3,
                    bonus: 9_000_000
                },
                {
                    minPosition: 4,
                    bonus: 6_000_000
                },
                {
                    minPosition: 6,
                    bonus: 3_000_000
                }
            ]
        },
        2: {
            name: '1. Lig Yayın Hakları',
            annual: 6_000_000,
            match: 120_000,
            positions: [
                {
                    minPosition: 1,
                    bonus: 5_000_000
                },
                {
                    minPosition: 2,
                    bonus: 3_500_000
                },
                {
                    minPosition: 3,
                    bonus: 2_000_000
                }
            ]
        },
        3: {
            name: '2. Lig Yayın Hakları',
            annual: 1_800_000,
            match: 40_000,
            positions: [
                {
                    minPosition: 1,
                    bonus: 1_500_000
                },
                {
                    minPosition: 2,
                    bonus: 800_000
                }
            ]
        },
        4: {
            name: '3. Lig Yayın Hakları',
            annual: 500_000,
            match: 12_000,
            positions: []
        }
    };
    const data = tierData[tier] ?? tierData[4];
    // Position bonus lookup
    const positionBonus = data.positions.filter((p)=>leaguePosition >= p.minPosition).sort((a, b)=>b.minPosition - a.minPosition)[0]?.bonus ?? 0;
    // Adjusted annual value based on position
    const posMultiplier = Math.max(0.5, 1 - (leaguePosition - 1) * 0.03);
    const adjustedAnnual = Math.round((data.annual + positionBonus) * posMultiplier);
    const weeklyPayout = Math.round(adjustedAnnual / 52);
    const durationWeeks = tier <= 2 ? 156 : 104; // 3-year / 2-year deals
    return {
        id: generateId(),
        name: data.name,
        annualValue: adjustedAnnual,
        weeklyPayout,
        perMatchBonus: data.match,
        positionBonuses: data.positions,
        durationWeeks,
        weeksRemaining: durationWeeks
    };
}
function calculateWageBillLimit(annualRevenue) {
    const FFP_RATIO = 0.70;
    return Math.round(annualRevenue * FFP_RATIO / 52);
}
function checkFinancialHealth(financialOverview, currentCash, consecutiveLossWeeks = 0) {
    // Bankrupt – negative cash
    if (currentCash < 0) {
        return 'bankrupt';
    }
    // Weeks of runway
    const weeklyBurn = financialOverview.weeklyExpenses - financialOverview.weeklyRevenue;
    if (weeklyBurn > 0) {
        const weeksRunway = currentCash / weeklyBurn;
        if (weeksRunway < 2) {
            return 'critical';
        }
    }
    // Critical indicators
    const isCritical = financialOverview.wageUtilization > 95 || consecutiveLossWeeks > 8 || weeklyBurn > 0 && currentCash / weeklyBurn < 3;
    if (isCritical) {
        return 'critical';
    }
    // Warning indicators
    const isWarning = financialOverview.wageUtilization > 85 || consecutiveLossWeeks > 4 || financialOverview.weeklyProfit < 0;
    if (isWarning) {
        return 'warning';
    }
    return 'healthy';
}
function buildFinancialOverview(profile, squad, options) {
    const { isHome = false, lastMatchAttendance, leaguePosition = 10, tier = 1, transferRevenueWeek = 0, transferSpendingWeek = 0 } = options ?? {};
    const revenueBreakdown = calculateWeeklyRevenue(profile, lastMatchAttendance, isHome, leaguePosition, tier);
    const expenseBreakdown = calculateWeeklyExpenses(squad, profile.stadium_upgrades, profile.academy_level, tier);
    const weeklyRevenue = revenueBreakdown.total + transferRevenueWeek;
    const weeklyExpenses = expenseBreakdown.total + transferSpendingWeek;
    const weeklyProfit = weeklyRevenue - weeklyExpenses;
    const WEEKS_PER_MONTH = 4.33;
    const WEEKS_PER_SEASON = 42;
    const monthlyRevenue = Math.round(weeklyRevenue * WEEKS_PER_MONTH);
    const monthlyExpenses = Math.round(weeklyExpenses * WEEKS_PER_MONTH);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const seasonRevenue = Math.round(weeklyRevenue * WEEKS_PER_SEASON);
    const seasonExpenses = Math.round(weeklyExpenses * WEEKS_PER_SEASON);
    const seasonProfit = seasonRevenue - seasonExpenses;
    const totalWages = expenseBreakdown.wages.reduce((s, e)=>s + e.amount, 0);
    const projectedAnnual = seasonRevenue;
    const wageBillLimit = calculateWageBillLimit(projectedAnnual);
    const wageUtilization = wageBillLimit > 0 ? Math.min(100, Math.round(totalWages / wageBillLimit * 100)) : 0;
    const sponsors = profile.sponsors ?? [];
    const sponsorCount = sponsors.length;
    const sponsorRevenue = sponsors.reduce((s, sp)=>s + sp.weeklyPayout, 0);
    const matchdayRevenue = revenueBreakdown.matchday.reduce((s, r)=>s + r.amount, 0);
    const broadcastRevenue = revenueBreakdown.broadcast.reduce((s, r)=>s + r.amount, 0);
    const transferRevenue = revenueBreakdown.transfer.reduce((s, r)=>s + r.amount, 0) + transferRevenueWeek;
    const overview = {
        weeklyRevenue,
        weeklyExpenses,
        weeklyProfit,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit,
        seasonRevenue,
        seasonExpenses,
        seasonProfit,
        totalWages,
        wageBillLimit,
        wageUtilization,
        sponsorCount,
        sponsorRevenue,
        matchdayRevenue,
        broadcastRevenue,
        transferRevenue,
        transferSpending: transferSpendingWeek
    };
    const healthStatus = checkFinancialHealth(overview, profile.money, options?.consecutiveLossWeeks);
    return {
        ...overview,
        healthStatus
    };
}
const DEFAULT_STARTING_SPONSORS = [
    {
        id: 'default_kit_01',
        name: 'TeknoFit',
        type: 'kit',
        annualValue: 600_000,
        weeklyPayout: 11_538,
        durationWeeks: 78,
        weeksRemaining: 78,
        bonusConditions: [
            {
                type: 'league_position',
                threshold: 5,
                bonus: 60_000
            }
        ],
        prestige: 2,
        satisfaction: 60
    },
    {
        id: 'default_shirt_01',
        name: 'AnadoluGrup',
        type: 'shirt',
        annualValue: 1_200_000,
        weeklyPayout: 23_077,
        durationWeeks: 104,
        weeksRemaining: 104,
        bonusConditions: [
            {
                type: 'league_position',
                threshold: 3,
                bonus: 150_000
            },
            {
                type: 'fan_milestone',
                threshold: 50_000,
                bonus: 80_000
            }
        ],
        prestige: 3,
        satisfaction: 55
    }
];
const DEFAULT_BROADCAST_DEAL = {
    id: 'default_broadcast_01',
    name: 'Süper Lig Yayın Hakları',
    annualValue: 10_000_000,
    weeklyPayout: 192_308,
    perMatchBonus: 200_000,
    positionBonuses: [
        {
            minPosition: 1,
            bonus: 8_000_000
        },
        {
            minPosition: 2,
            bonus: 5_500_000
        },
        {
            minPosition: 3,
            bonus: 3_500_000
        },
        {
            minPosition: 4,
            bonus: 2_000_000
        },
        {
            minPosition: 6,
            bonus: 800_000
        }
    ],
    durationWeeks: 156,
    weeksRemaining: 156
};
const FINANCIAL_DEFAULTS = {
    ticketPrice: 50,
    averageFillRate: 0.7,
    startingMoney: 10_000_000,
    maxSponsors: 5,
    maxBilateralDeals: 3,
    ffpWageRatio: 0.70,
    weeklyBaseExpenses: {
        stadiumMaintenance: 8_000,
        trainingGround: 4_000,
        medicalCenter: 3_500,
        youthFacility: 2_500,
        staffPerPerson: 1_800,
        baseStaffCount: 15,
        travelLowTier: 6_000,
        travelHighTier: 12_000
    },
    revenuePerTicket: {
        vipMultiplier: 0.08,
        parkingPerPerson: 12,
        merchandiseBase: 15_000,
        kitSalesBase: 8_000
    },
    sponsorTiers: {
        kit: {
            baseAnnual: 800_000
        },
        shirt: {
            baseAnnual: 2_500_000
        },
        stadium: {
            baseAnnual: 5_000_000
        },
        training_ground: {
            baseAnnual: 400_000
        }
    },
    broadcastTiers: {
        1: {
            label: 'Süper Lig',
            annualBase: 18_000_000,
            perMatch: 350_000
        },
        2: {
            label: '1. Lig',
            annualBase: 6_000_000,
            perMatch: 120_000
        },
        3: {
            label: '2. Lig',
            annualBase: 1_800_000,
            perMatch: 40_000
        },
        4: {
            label: '3. Lig',
            annualBase: 500_000,
            perMatch: 12_000
        }
    },
    financialHealthThresholds: {
        bankruptCash: 0,
        criticalRunwayWeeks: 3,
        warningWageUtilization: 85,
        criticalWageUtilization: 95,
        warningLossWeeks: 4,
        criticalLossWeeks: 8
    }
};
function calculateStadiumCapacity(stadiumLevel) {
    return 10000 + stadiumLevel * 2000;
}
function calculateAttendance(stadiumLevel, leaguePosition, totalTeams, ticketPrice) {
    try {
        const capacity = calculateStadiumCapacity(stadiumLevel);
        // Lig pozisyonu faktörü: üst sıralar daha çok seyirci çeker
        const positionFactor = 0.5 + 0.5 * ((totalTeams - leaguePosition + 1) / totalTeams);
        const baseAttendance = capacity * positionFactor;
        // Fiyat faktörü: 50 ortalama fiyat, üstünde talep düşer, altında artar
        const priceFactor = Math.max(0.1, 1 - (ticketPrice - 50) / 100);
        return Math.floor(Math.min(capacity, baseAttendance * priceFactor));
    } catch  {
        return 0;
    }
}
function calculateMatchRevenueLegacy(stadiumLevel, leaguePosition, totalTeams, ticketPrice) {
    try {
        const attendance = calculateAttendance(stadiumLevel, leaguePosition, totalTeams, ticketPrice);
        return attendance * ticketPrice;
    } catch  {
        return 0;
    }
}
function calculateMatchRevenue(profile, isHome, homeScore, awayScore) {
    const capacity = profile.stadium_capacity || 30000;
    const ticketPrice = profile.ticket_price || 25;
    const reputation = profile.reputation || 50;
    const upgrades = profile.stadium_upgrades || {};
    const standLevel = upgrades['stand'] || 0;
    // Attendance based on capacity, reputation, and upgrades
    const baseAttendance = capacity * (0.4 + reputation / 100 * 0.5);
    const upgradeBonus = 1 + standLevel * 0.05;
    const attendance = Math.min(capacity, Math.floor(baseAttendance * upgradeBonus));
    if (!isHome) return {
        revenue: 0,
        attendance: 0
    };
    // Revenue calculation
    const baseRevenue = attendance * ticketPrice;
    const vipLevel = upgrades['vip'] || 0;
    const vipBonus = 1 + vipLevel * 0.08;
    const resultBonus = homeScore > awayScore ? 1.1 : homeScore === awayScore ? 1.0 : 0.9;
    const revenue = baseRevenue * vipBonus * resultBonus;
    return {
        revenue: Math.floor(revenue),
        attendance
    };
}
}),
"[project]/src/lib/fm/InfoContentManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INFO_CONTENT",
    ()=>INFO_CONTENT
]);
const INFO_CONTENT = {
    // Yerleşke
    'STADYUM KAPASİTESİ': 'Şehir üzerindeki baskı gücünü temsil eder. Seviye arttıkça stadyumun fiziksel kapasitesi büyür, bilet gelirleri artar. Unutma; boş kalan her koltuk kulüp kasasından bakım maliyeti olarak eksilir.',
    'Lojistik Ağ': 'Kulübün şehir ekonomisine yayılan kollarıdır. Maç günü dışı yan gelirleri (yiyecek, ürün satışı) belirler. Yüksek seviyelerde oyuncu kondisyonunun (15:00/21:00) daha hızlı dolmasını sağlayan rehabilitasyon etkisine sahiptir.',
    'Koz Odaları': 'Sadece parayı değil, otoriteyi de ağırladığınız yerdir. En yüksek bilet marjını sağlar. Buradaki misafir memnuniyeti, operasyonel başarı şansınıza ve savunma direncinize %5 ile %20 arası gizli çarpan ekler.',
    'Harp Sahası': "Ordunuzun manevra kabiliyetini belirler. Zemin kalitesi arttıkça pas isabeti artar, sakatlık riskleri minimize edilir. Ayrıca rakibin 'Yıldız Markajı' operasyonlarının etkisini azaltan 'Geniş Alan' avantajı sağlar.",
    'Gözlem Kulesi': "Teknolojik güçtür. Yayın gelirlerini doğrudan etkiler. Kripto İletişim Hattı sayesinde rakibin 'Tesis Sızıntısı' ve 'Transfer Sabotajı' operasyonlarının başarı şansını %15'den %50'ye kadar düşürebilir.",
    // Operasyon Odası - Saldırı/Savunma
    'Tier 1-3': "Sosyal medya ve yerel medya üzerinden kamuoyu oluşturma aşamasıdır. 'Medya Karartması' kartı ile hakkınızda çıkan negatif haberlerin yayılmasını %80 oranında durdurabilirsiniz.",
    'Tier 4-6': "Kurumsal baskı ve federasyon alt kurullarını kapsar. 'Köstebek Avı' kartı ile tesislerinize sızmış casusları temizleyebilir, rakip menajere 'Yanıltıcı İstihbarat' verebilirsiniz.",
    'Tier 7-9': "Yüksek yargı ve sistem mekanizmalarına sızma aşamasıdır. 'Hukuk Zırhı' kartı ile soruşturmaları yavaşlatabilir ve olası skandal cezalarını %100'e kadar sümen altı edebilirsiniz.",
    'Tier 10': "Sistemin bizzat kendisi olma halidir. 'Veto Yetkisi' kartı ile rakibin en ağır saldırısını henüz başlamadan, bütçelerini tamamen yakarak iptal edebilirsiniz."
};
}),
"[project]/src/lib/fm/mediaSystem.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════
//  Managerium – Media & Press System
//  News generation, motivation phrases, headlines
// ═══════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "MOTIVATION_PHRASES",
    ()=>MOTIVATION_PHRASES,
    "calculateMotivationBonus",
    ()=>calculateMotivationBonus,
    "generateMediaHeadline",
    ()=>generateMediaHeadline,
    "generateWeeklyNews",
    ()=>generateWeeklyNews
]);
// ─── ID Generator ────────────────────────────────────────────────
function uid() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36).slice(-4);
}
function generateWeeklyNews(options) {
    const messages = [];
    const { profile, lastMatch, transfers, leaguePosition = 10, tier = 1 } = options;
    const teamName = profile.team_name;
    const now = new Date().toISOString();
    // ── Match Result News ─────────────────────────────────────────
    if (lastMatch) {
        const { result, opponentName, goalsFor, goalsAgainst } = lastMatch;
        if (result === 'win') {
            const headlines = [
                `${teamName.toUpperCase()} GÜÇLÜ RAKİBİNİ YIKTI!`,
                `${goalsFor}-${goalsAgainst}: ${teamName} SAHADAN GALİP AYRILDI!`,
                `FIRTINA GİBİ ESTİK! ${opponentName} MAĞLUP!`,
                `ZAFER! ${teamName} SEYIRCİSİNİ MUTLU ETTİ!`
            ];
            messages.push({
                id: uid(),
                type: 'praise',
                headline: headlines[Math.floor(Math.random() * headlines.length)],
                body: `${teamName}, ${opponentName} karşısında ${goalsFor}-${goalsAgainst}'lık etkileyici bir galibiyet elde etti. Takım, sahada gösterdiği performansla taraftarını coşturdu.`,
                date: now,
                importance: goalsFor - goalsAgainst >= 3 ? 4 : 3,
                teamImpact: {
                    morale: 8,
                    reputation: 2,
                    fanMood: 12
                }
            });
        } else if (result === 'loss') {
            const headlines = [
                `${teamName} ${opponentName} KARŞISINDA YIKILDI!`,
                `ACI MAĞLUBİYET: ${goalsFor}-${goalsAgainst}`,
                `KRİZ BÜYÜYOR! ${teamName} PUAN KAYBETTİ!`,
                `${opponentName}, ${teamName}'I EZDİ GEÇTİ!`
            ];
            messages.push({
                id: uid(),
                type: 'criticism',
                headline: headlines[Math.floor(Math.random() * headlines.length)],
                body: `${teamName}, ${opponentName} deplasmanında ${goalsFor}-${goalsAgainst} mağlup oldu. Performans eleştirilerin odağında.`,
                date: now,
                importance: goalsAgainst - goalsFor >= 3 ? 4 : 3,
                teamImpact: {
                    morale: -10,
                    reputation: -3,
                    fanMood: -15
                }
            });
        } else {
            const headlines = [
                `${teamName} – ${opponentName}: ${goalsFor}-${goalsAgainst} BERABERLİK`,
                `PUANLAR PAYLAŞILDI! ${teamName} KAZANAMADI!`,
                `ORTA SAHA SAVAŞI: ${goalsFor}-${goalsAgainst} SONUÇ`
            ];
            messages.push({
                id: uid(),
                type: 'news',
                headline: headlines[Math.floor(Math.random() * headlines.length)],
                body: `${teamName} ile ${opponentName} arasındaki maç ${goalsFor}-${goalsAgainst} berabere bitti. Her iki takım da bir puana razı görünmedi.`,
                date: now,
                importance: 2,
                teamImpact: {
                    morale: -2,
                    reputation: 0,
                    fanMood: -3
                }
            });
        }
    }
    // ── Transfer News ─────────────────────────────────────────────
    if (transfers && transfers.length > 0) {
        for (const tr of transfers){
            if (tr.type === 'in') {
                const headlines = [
                    `${teamName.toUpperCase()}'A BÜYÜK TRANSFER!`,
                    `YILDIZ OYUNCU ${teamName}'DA!`,
                    `${tr.playerName} RESMEN İMZALADI!`,
                    `TRANSFER HABERİ: ${tr.playerName} ${teamName}'A GELDİ!`
                ];
                messages.push({
                    id: uid(),
                    type: 'transfer',
                    headline: headlines[Math.floor(Math.random() * headlines.length)],
                    body: `${teamName}, ${tr.club} kulübünden ${tr.playerName}'ı kadrosuna kattı${tr.fee ? ` (${tr.fee.toLocaleString('tr-TR')} €)` : ''}. Taraftarlar transferden memnun.`,
                    date: now,
                    importance: 4,
                    teamImpact: {
                        morale: 5,
                        reputation: 3,
                        fanMood: 8
                    }
                });
            } else {
                const headlines = [
                    `${tr.playerName} ${teamName}'DAN AYRILDI!`,
                    `VEDALAŞMA: ${tr.playerName} GİDİYOR!`,
                    `${teamName}, ${tr.playerName}'I ${tr.club}'E SATTI!`
                ];
                messages.push({
                    id: uid(),
                    type: 'transfer',
                    headline: headlines[Math.floor(Math.random() * headlines.length)],
                    body: `${teamName}, ${tr.playerName} ile yollarını ayırdı. Oyuncu ${tr.club} kulübüne${tr.fee ? ` ${tr.fee.toLocaleString('tr-TR')} € karşılığında` : ''} transfer oldu.`,
                    date: now,
                    importance: 3,
                    teamImpact: {
                        morale: -3,
                        reputation: -1,
                        fanMood: -5
                    }
                });
            }
        }
    }
    // ── League Standing News ──────────────────────────────────────
    if (leaguePosition <= 3 && tier <= 2) {
        const posLabel = leaguePosition === 1 ? 'ZİRVEDE' : leaguePosition === 2 ? 'İKİNCİ SIRADA' : 'ÜÇÜNCÜ SIRADA';
        messages.push({
            id: uid(),
            type: 'praise',
            headline: `${teamName.toUpperCase()} ${posLabel}!`,
            body: `${teamName}, ligde ${leaguePosition}. sırada yer alıyor. Şampiyonluk yarışında iddialı konumda.`,
            date: now,
            importance: leaguePosition === 1 ? 5 : 3,
            teamImpact: {
                morale: 5,
                reputation: 4,
                fanMood: 8
            }
        });
    } else if (leaguePosition >= 16 && tier <= 3) {
        messages.push({
            id: uid(),
            type: 'criticism',
            headline: `${teamName.toUpperCase()} DÜŞME HATTINDA!`,
            body: `${teamName}, ligde ${leaguePosition}. sırada yer alıyor. Düşme potasında tehlike çanları çalıyor.`,
            date: now,
            importance: 4,
            teamImpact: {
                morale: -8,
                reputation: -3,
                fanMood: -12
            }
        });
    }
    // ── Financial News (if money is low) ──────────────────────────
    if (profile.money < 2_000_000) {
        messages.push({
            id: uid(),
            type: 'rumor',
            headline: `${teamName} MALİ KRİZDE Mİ?`,
            body: `Kulübün mali durumu hakkında endişe verici iddialar ortaya atıldı. Oyuncu alımında kısıntı yaşanabileceği konuşuluyor.`,
            date: now,
            importance: 3,
            teamImpact: {
                morale: -4,
                reputation: -2,
                fanMood: -6
            }
        });
    }
    // ── Reputation Milestone ──────────────────────────────────────
    if (profile.reputation >= 80) {
        messages.push({
            id: uid(),
            type: 'praise',
            headline: `${teamName}: TÜRKİYE'NİN EN BÜYÜK KULÜPLERİNDEN!`,
            body: `${teamName}, artık Türkiye futbolunun en prestijli kulüpleri arasında yer alıyor. Uluslararası alanda da adından sıkça söz ettiriyor.`,
            date: now,
            importance: 4,
            teamImpact: {
                morale: 5,
                reputation: 3,
                fanMood: 10
            }
        });
    }
    // ── Fan mood news ─────────────────────────────────────────────
    if (profile.fans > 100_000) {
        messages.push({
            id: uid(),
            type: 'milestone',
            headline: `${teamName}'IN TARAFTAR SAYISI 100 BİNİ AŞTI!`,
            body: `Kulübün taraftar kitlesi hızla büyüyor. Sosyal medya ve stadyum doluluk oranları rekor seviyede.`,
            date: now,
            importance: 3,
            teamImpact: {
                morale: 3,
                reputation: 2,
                fanMood: 5
            }
        });
    }
    // ── Injury Rumor (random flavor) ──────────────────────────────
    if (Math.random() < 0.2) {
        messages.push({
            id: uid(),
            type: 'injury',
            headline: `${teamName}'DA SAKATLIK ENDİŞESİ!`,
            body: 'Antrenmanda yaşanan küçük bir sakatlık endişesi, teknik heyeti tedirgin etti. Detaylar önümüzdeki saatlerde netleşecek.',
            date: now,
            importance: 2,
            teamImpact: {
                morale: -2,
                reputation: 0,
                fanMood: -2
            }
        });
    }
    // ── Transfer Rumor (random flavor) ────────────────────────────
    if (Math.random() < 0.15) {
        messages.push({
            id: uid(),
            type: 'rumor',
            headline: `${teamName} TRANSFERDE MI?`,
            body: 'Kulüp kaynakları, transfer piyasasında hareketli olduklarını doğruladı. Hangi oyuncularla ilgilendikleri henüz bilinmiyor.',
            date: now,
            importance: 2,
            teamImpact: {
                morale: 2,
                reputation: 1,
                fanMood: 4
            }
        });
    }
    // Ensure minimum 3 messages
    if (messages.length < 3) {
        const fillerHeadlines = [
            {
                h: `${teamName} HAFTA SONU HAZIRLIKLARINA BAŞLADI`,
                type: 'news',
                impact: {
                    morale: 1,
                    reputation: 0,
                    fanMood: 1
                }
            },
            {
                h: `LİGDE HAFTANIN ANALİZİ: ${teamName} NEREDE?`,
                type: 'news',
                impact: {
                    morale: 0,
                    reputation: 0,
                    fanMood: 0
                }
            },
            {
                h: `ALTYAPI HABERLERİ: GENÇ YILDIZLAR YOLUNDA`,
                type: 'milestone',
                impact: {
                    morale: 2,
                    reputation: 1,
                    fanMood: 2
                }
            },
            {
                h: `STADYUM BAKIM ÇALIŞMALARI SÜRÜYOR`,
                type: 'news',
                impact: {
                    morale: 0,
                    reputation: 0,
                    fanMood: 0
                }
            }
        ];
        const needed = 3 - messages.length;
        for(let i = 0; i < needed; i++){
            const filler = fillerHeadlines[i % fillerHeadlines.length];
            messages.push({
                id: uid(),
                type: filler.type,
                headline: filler.h,
                body: `${teamName} ile ilgili son gelişmeler ve haftalık özet.`,
                date: now,
                importance: 1,
                teamImpact: filler.impact
            });
        }
    }
    return messages;
}
const MOTIVATION_PHRASES = {
    pre_match: [
        'Bu maçtan galibiyetle çıkmak zorundayız!',
        'Taraftarımızın desteğiyle her şeyi başarabiliriz!',
        'Sahaya çıkın ve kalplerinizi bırakın!',
        'Bugün tarih yazacağız!',
        'Rakip kim olursa olsun, biz hazırız!',
        'Her maç bir savaş, bu savaşı kazanacağız!',
        'Gözler hepimizde, gururla oynayın!',
        'Büyük takım olmanın zamanı geldi!',
        'Bu formayı giydiğiniz anda sorumluluklusunuz!',
        'İnanın, savaşın, kazanın!'
    ],
    halftime_leading: [
        'Aynı oyunu sürdürün, rahat olun!',
        'Harika ilk yarı! Ama dikkat, maç bitmedi!',
        'Bu oyunu devam ettirin, şampiyon gibi oynayın!',
        'Bravo! Ama ikinci yarıda da aynı konsantrasyonu gösterin!',
        'İyi gidiyoruz, tempo düşmesin!',
        'Gol daha atabiliriz, açılın!'
    ],
    halftime_trailing: [
        'Hadi toparlanın, hâlâ şansımız var!',
        'Maç bitmedi! Kafaları kaldırın!',
        'İkinci yarı bizim olacak, inanın bana!',
        'Savunmayı sıkın ama forveti unutmayın!',
        'Cesur olun! Risk almak zorundayız!',
        'Bu takım karakterini her zaman göstermiştir!',
        'Daha fazlasını verin, taraftar sizi bekliyor!'
    ],
    post_win: [
        'Harika bir takım performansı!',
        'Gurur duyuyorum, herkes emeğinin karşılığını aldı!',
        'Bu takım sınırlarını zorluyor!',
        'Taraftarımıza layık bir galibiyet!',
        'İleride bu zaferi hatırlayacağız!'
    ],
    post_loss: [
        'Bu sadece bir maç, sezon daha uzun.',
        'Başarısızlık geçicidir, karakter kalıcıdır.',
        'Toparlanacağız, bu takım daha güçlü dönecek!',
        'Düşünmek için zaman var, sonra çalışmaya devam.',
        'Moralinizi bozmayın, bir sonraki maçta göstereceğiz!'
    ],
    post_draw: [
        'İyisiyle kötüsüyle geçti. Daha iyisini yapacağız.',
        'Bir puan kötü değil ama daha fazlasını hakediyorduk.',
        'Kendimize güvenelim, gelişiyoruz.'
    ],
    defensive_praise: [
        'Kale duvar gibi! Harika savunma!',
        'Dört duvar ördünüz, bravo!',
        'Savunma milli takım seviyesinde!'
    ],
    attacking_praise: [
        'Forvet hattı alev alev! Golün devamı gelir!',
        'Hücumda harikalar yarattınız!',
        'Rakip savunması çöktü, muhteşem!'
    ],
    injury_encouragement: [
        'Sahada olmasan bile kalbin bizimle!',
        'Güçlü dön, bekliyoruz!',
        'Sakatlık geçici, kahramanlık kalıcı!'
    ]
};
function calculateMotivationBonus(motivationPhrase, squad) {
    // Determine phrase category for base effect
    let baseMorale = 3;
    let baseConfidence = 2;
    if (MOTIVATION_PHRASES.pre_match.includes(motivationPhrase)) {
        baseMorale = 5;
        baseConfidence = 4;
    } else if (MOTIVATION_PHRASES.halftime_leading.includes(motivationPhrase)) {
        baseMorale = 6;
        baseConfidence = 5;
    } else if (MOTIVATION_PHRASES.halftime_trailing.includes(motivationPhrase)) {
        baseMorale = 4;
        baseConfidence = 3;
    } else if (MOTIVATION_PHRASES.post_win.includes(motivationPhrase)) {
        baseMorale = 8;
        baseConfidence = 6;
    } else if (MOTIVATION_PHRASES.post_loss.includes(motivationPhrase)) {
        baseMorale = 2;
        baseConfidence = 1;
    } else if (MOTIVATION_PHRASES.defensive_praise.includes(motivationPhrase)) {
        baseMorale = 5;
        baseConfidence = 4;
    } else if (MOTIVATION_PHRASES.attacking_praise.includes(motivationPhrase)) {
        baseMorale = 6;
        baseConfidence = 7;
    } else if (MOTIVATION_PHRASES.injury_encouragement.includes(motivationPhrase)) {
        baseMorale = 3;
        baseConfidence = 2;
    }
    // Detect "intense" phrases by keyword
    const intenseKeywords = [
        'zorundayız',
        'savaş',
        'kazanacağız',
        'tarih',
        'karakter'
    ];
    const isIntense = intenseKeywords.some((kw)=>motivationPhrase.includes(kw));
    if (isIntense) {
        baseMorale += 2;
        baseConfidence += 1;
    }
    // Detect "calm" phrases
    const calmKeywords = [
        'rahat',
        'aynı',
        'daha uzun',
        'sınırlarını'
    ];
    const isCalm = calmKeywords.some((kw)=>motivationPhrase.includes(kw));
    if (isCalm) {
        baseConfidence += 2;
    }
    const playerAdjustments = {};
    for (const player of squad){
        const leadership = player.leadership ?? 50;
        const isCaptain = player.special_role === 'captain';
        // Amplification: captain = 1.4x, leaders (>70) = 1.15x, low leadership (<30) = 0.7x
        let amplification = 1;
        if (isCaptain) {
            amplification = 1.4;
        } else if (leadership >= 70) {
            amplification = 1.15;
        } else if (leadership <= 30) {
            amplification = 0.7;
        }
        // Determination and composure also factor in
        const determination = player.determination ?? 50;
        const composure = player.composure ?? 50;
        const mentalBonus = 1 + (determination + composure - 100) / 400; // 0.75 – 1.25
        playerAdjustments[player.id] = {
            moraleAdjustment: Math.round(baseMorale * amplification * mentalBonus),
            confidenceAdjustment: Math.round(baseConfidence * amplification * mentalBonus)
        };
    }
    // Average effect across the squad
    const avgMorale = Math.round(Object.values(playerAdjustments).reduce((s, a)=>s + a.moraleAdjustment, 0) / (squad.length || 1));
    const avgConfidence = Math.round(Object.values(playerAdjustments).reduce((s, a)=>s + a.confidenceAdjustment, 0) / (squad.length || 1));
    return {
        moraleAdjustment: avgMorale,
        confidenceAdjustment: avgConfidence,
        playerAdjustments
    };
}
function generateMediaHeadline(event) {
    const { type, teamName } = event;
    switch(type){
        case 'match_result':
            {
                if (event.isWin && event.score) {
                    const { home, away } = event.score;
                    const diff = Math.abs(home - away);
                    if (diff >= 4) {
                        const headlines = [
                            `${teamName.toUpperCase()} RAKİBİNİ EZDİ GEÇTİ! ${home}-${away}`,
                            `${home}-${away} TARIHİ HEZİMET! ${teamName.toUpperCase()} FIRTINA GİBİ ESTİ!`,
                            `${teamName.toUpperCase()} SAHADA KATLIAM YAPTI: ${home}-${away}!`
                        ];
                        return headlines[Math.floor(Math.random() * headlines.length)];
                    } else if (diff >= 2) {
                        const headlines = [
                            `${teamName.toUpperCase()} GÜÇLÜ RAKİBİNİ YIKTI! ${home}-${away}`,
                            `${home}-${away}: ${teamName} SAHADAN GALİP AYRILDI!`,
                            `FIRTINA GİBİ ESTİK! ${event.opponentName} MAĞLUP!`
                        ];
                        return headlines[Math.floor(Math.random() * headlines.length)];
                    } else {
                        const headlines = [
                            `${teamName} SINIRI AŞTI: ${home}-${away}`,
                            `${home}-${away}: ${teamName} KOLAY GEÇMADI!`,
                            `KRİTİK 3 PUAN: ${teamName} KAZANDI!`
                        ];
                        return headlines[Math.floor(Math.random() * headlines.length)];
                    }
                } else if (!event.isWin && event.isWin !== undefined && event.score) {
                    const { home, away } = event.score;
                    const headlines = [
                        `${teamName.toUpperCase()} ${event.opponentName} KARŞISINDA YIKILDI!`,
                        `ACI MAĞLUBİYET: ${home}-${away}`,
                        `${teamName.toUpperCase()} PUAN KAYBETTİ!`,
                        `KARANLIK GÜN: ${home}-${away} MAĞLUBİYET`
                    ];
                    return headlines[Math.floor(Math.random() * headlines.length)];
                } else {
                    return `${teamName} – ${event.opponentName}: ${event.score?.home ?? 0}-${event.score?.away ?? 0} BERABERLİK`;
                }
            }
        case 'transfer_in':
            {
                const feeText = event.fee ? ` ${event.fee.toLocaleString('tr-TR')} Kredi` : '';
                const headlines = [
                    `${teamName.toUpperCase()}'A BOMBA TRANSFER!`,
                    `YILDIZ TRANSFERİ KAPIDA! ${event.playerName?.toUpperCase()} GELİYOR${feeText}!`,
                    `${teamName.toUpperCase()} TARİHİ TRANSFER YAPTI!`,
                    `${event.playerName?.toUpperCase()} RESMEN ${teamName.toUpperCase()}'DA!`,
                    `TRANSFER HABERİ: ${event.playerName} İMZALADI${feeText}!`
                ];
                return headlines[Math.floor(Math.random() * headlines.length)];
            }
        case 'transfer_out':
            {
                const feeText = event.fee ? ` ${event.fee.toLocaleString('tr-TR')} €'ye` : '';
                const headlines = [
                    `${event.playerName?.toUpperCase()} ${teamName}'DAN AYRILIYOR!`,
                    `VEDALAŞMA: ${event.playerName} GİDİYOR${feeText}!`,
                    `${teamName}, ${event.playerName}'I SATIYOR!`,
                    `ŞOK TRANSFER: ${event.playerName} KULÜPTEN GİDİYOR!`
                ];
                return headlines[Math.floor(Math.random() * headlines.length)];
            }
        case 'injury':
            {
                const headlines = [
                    `${teamName.toUpperCase()} SAKATLIK FIRTINASINA GİRDİ!`,
                    `${event.playerName?.toUpperCase()} SAKATLANDI! TAKIM ZOR DURUMDA!`,
                    `KÖTÜ HABER: ${event.playerName} HAFTALARCA OYNAMAYACAK!`,
                    `SAĞLIK BÜLTENİ: ${teamName} İÇİ KARANLIK!`
                ];
                return headlines[Math.floor(Math.random() * headlines.length)];
            }
        case 'milestone':
            {
                return event.milestoneText ?? `${teamName.toUpperCase()} TARİHİ AN YAŞADI!`;
            }
        case 'derby':
            {
                const derbyHeadlines = [
                    `DERBİDE ATEŞ SAÇAN ${teamName.toUpperCase()}!`,
                    `ŞEHRİN EFENDİSİ: ${teamName.toUpperCase()} DERBİYİ KAZANDI!`,
                    `DERBİDE TARİH: ${teamName.toUpperCase()} FARKLI KAZANDI!`,
                    `${teamName.toUpperCase()}-DERBY: SAHADA SAVAŞ ALANI!`
                ];
                return derbyHeadlines[Math.floor(Math.random() * derbyHeadlines.length)];
            }
        default:
            return `${teamName.toUpperCase()} İLE İLGİLİ SON DAKİKA HABERİ!`;
    }
}
}),
"[project]/src/lib/fm/hallOfFameService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeAllTimeRecords",
    ()=>computeAllTimeRecords,
    "computeLegendTier",
    ()=>computeLegendTier,
    "createHOFEntry",
    ()=>createHOFEntry,
    "inductRetiredPlayers",
    ()=>inductRetiredPlayers,
    "isClubLegend",
    ()=>isClubLegend,
    "loadHallOfFame",
    ()=>loadHallOfFame,
    "shouldInductToHOF",
    ()=>shouldInductToHOF
]);
// ═══════════════════════════════════════════════════════════════════════
// Managerium — Hall of Fame Museum Service (Adım 5)
// Emekli oyuncuların HOF'a alınması, kariyer özetinin hesaplanması,
// tüm zamanların rekorları, persistent okuma/yazma
// ═══════════════════════════════════════════════════════════════════════
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/sharedUtils.ts [app-ssr] (ecmascript)");
;
;
function computeLegendTier(player, careerStats) {
    const goals = careerStats?.totalGoals ?? getTotalGoals(player);
    const avgRating = careerStats?.avgRating ?? (player.form_rating || player.rating);
    const motm = careerStats?.motm ?? 0;
    const seasons = careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player);
    if (seasons >= 3 && (goals >= 100 || avgRating >= 8.5 || motm >= 5)) return 'platinum';
    if (seasons >= 2 && (goals >= 50 || avgRating >= 7.5 || motm >= 3)) return 'gold';
    if (seasons >= 1 && (goals >= 20 || avgRating >= 7.0)) return 'silver';
    return 'bronze';
}
function isClubLegend(player, careerStats) {
    const goals = careerStats?.totalGoals ?? getTotalGoals(player);
    const avgRating = careerStats?.avgRating ?? (player.form_rating || player.rating);
    const motm = careerStats?.motm ?? 0;
    const seasons = careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player);
    return seasons >= 3 && (goals >= 50 || avgRating >= 7.5 || motm >= 5);
}
// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────
function getTotalGoals(player) {
    if (!player.goalStats) return 0;
    return Object.values(player.goalStats).reduce((a, b)=>a + b, 0);
}
function estimateSeasonsPlayed(player) {
    // Basit tahmin: (current_age - joined_age) ile sezon sayısı
    // Eğer bu bilgi yoksa, en az 1 sezon oynamış kabul et (emekli olduysa)
    if (player.career_stats) {
        return Math.max(1, Math.floor(player.career_stats.seasons || 1));
    }
    return 1;
}
function shouldInductToHOF(player, careerStats) {
    // is_legend olan herkes otomatik girer
    if (player.is_legend) return true;
    // En az 1 sezon oynamış ve belli bir kalitede olanlar
    const tier = computeLegendTier(player, careerStats);
    return tier !== 'bronze' || (careerStats?.totalMatches ?? 0) >= 15 || getTotalGoals(player) >= 5;
}
function createHOFEntry(player, profileId, retiredDay, retiredSeason, careerStats) {
    const totalGoals = careerStats?.totalGoals ?? getTotalGoals(player);
    const tier = computeLegendTier(player, careerStats);
    const legend = isClubLegend(player, careerStats);
    return {
        id: `hof_${player.id}_${profileId}`,
        profile_id: profileId,
        player_id: player.id,
        player_name: player.name,
        position: player.position,
        nationality: player.nation,
        seasons_played: careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player),
        total_goals: totalGoals,
        total_assists: careerStats?.totalAssists ?? 0,
        total_matches: careerStats?.totalMatches ?? 0,
        total_clean_sheets: careerStats?.totalCleanSheets ?? 0,
        total_motm: careerStats?.motm ?? 0,
        avg_rating: careerStats?.avgRating ?? (player.form_rating || player.rating),
        peak_rating: player.rating,
        legend_tier: tier,
        is_club_legend: legend,
        awards_won: careerStats?.awardsWon ?? [],
        joined_day: player.joined_day,
        retired_day: retiredDay,
        retired_season: retiredSeason
    };
}
async function inductRetiredPlayers(retiredPlayers, profileId, retiredDay, retiredSeason) {
    const inducted = [];
    const skipped = [];
    for (const player of retiredPlayers){
        if (shouldInductToHOF(player)) {
            // Career stats'ı Supabase'den çekmeyi dene
            const careerStats = await fetchCareerStatsForHOF(player.id, retiredSeason);
            const entry = createHOFEntry(player, profileId, retiredDay, retiredSeason, careerStats);
            inducted.push(entry);
        } else {
            skipped.push(player);
        }
    }
    // Supabase'e kaydet
    if (inducted.length > 0) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (supabase) {
            const rows = inducted.map((entry)=>({
                    id: entry.id,
                    profile_id: entry.profile_id,
                    player_id: entry.player_id,
                    player_name: entry.player_name,
                    position: entry.position,
                    nationality: entry.nationality,
                    seasons_played: entry.seasons_played,
                    total_goals: entry.total_goals,
                    total_assists: entry.total_assists,
                    total_matches: entry.total_matches,
                    total_clean_sheets: entry.total_clean_sheets,
                    total_motm: entry.total_motm,
                    avg_rating: entry.avg_rating,
                    peak_rating: entry.peak_rating,
                    legend_tier: entry.legend_tier,
                    is_club_legend: entry.is_club_legend,
                    awards_won: JSON.stringify(entry.awards_won),
                    joined_day: entry.joined_day,
                    retired_day: entry.retired_day,
                    retired_season: entry.retired_season,
                    inducted_at: new Date().toISOString()
                }));
            const { error } = await supabase.from('hall_of_fame').upsert(rows, {
                onConflict: 'id'
            });
            if (error) {
                console.error('[inductRetiredPlayers] Upsert error:', error.message);
            }
            // Profile'daki hof_count'u güncelle
            const { data: currentProfile } = await supabase.from('profiles').select('hof_count').eq('id', profileId).single();
            if (currentProfile) {
                await supabase.from('profiles').update({
                    hof_count: (currentProfile.hof_count || 0) + inducted.length
                }).eq('id', profileId);
            }
        }
    }
    return {
        inducted,
        skipped
    };
}
// ─── Career Stats Çekme ──────────────────────────────────────────────
/**
 * Emekli olan oyuncunun kariyer istatistiklerini Supabase'den çeker.
 * Tüm sezonların toplamını hesaplar.
 */ async function fetchCareerStatsForHOF(playerId, _lastSeasonId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return undefined;
        // Tüm sezonların kariyer istatistiklerini çek
        const { data, error } = await supabase.from('player_career_stats').select('*').eq('player_id', playerId);
        if (error || !data || data.length === 0) return undefined;
        // Toplamları hesapla
        let totalGoals = 0;
        let totalAssists = 0;
        let totalMatches = 0;
        let totalCleanSheets = 0;
        let totalMotm = 0;
        let ratingSum = 0;
        let ratedSeasons = 0;
        const awardsWon = [];
        for (const row of data){
            totalGoals += row.goals || 0;
            totalAssists += row.assists || 0;
            totalMatches += row.matches_played || 0;
            totalCleanSheets += row.clean_sheets || 0;
            totalMotm += row.motm || 0;
            if (row.avg_rating > 0) {
                ratingSum += row.avg_rating;
                ratedSeasons++;
            }
        }
        // Sezon ödüllerini çek
        const { data: awardData } = await supabase.from('season_awards').select('award_type').eq('player_id', playerId);
        if (awardData) {
            for (const a of awardData){
                if (a.award_type && !awardsWon.includes(a.award_type)) {
                    awardsWon.push(a.award_type);
                }
            }
        }
        return {
            totalGoals,
            totalAssists,
            totalMatches,
            totalCleanSheets,
            avgRating: ratedSeasons > 0 ? Math.round(ratingSum / ratedSeasons * 100) / 100 : 0,
            motm: totalMotm,
            seasonsPlayed: data.length,
            awardsWon
        };
    } catch (err) {
        console.error('[fetchCareerStatsForHOF] Error:', err);
        return undefined;
    }
}
async function loadHallOfFame(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return [];
        const { data, error } = await supabase.from('hall_of_fame').select('*').eq('profile_id', profileId).order('avg_rating', {
            ascending: false
        });
        if (error || !data) return [];
        return data.map(mapHofFromRow);
    } catch  {
        return [];
    }
}
async function computeAllTimeRecords(profileId) {
    const hof = await loadHallOfFame(profileId);
    if (hof.length === 0) return [];
    const records = [];
    // En çok gol
    const topScorer = [
        ...hof
    ].sort((a, b)=>b.total_goals - a.total_goals)[0];
    if (topScorer && topScorer.total_goals > 0) {
        records.push({
            category: 'goals',
            label: 'En Çok Gol',
            icon: '⚽',
            playerName: topScorer.player_name,
            value: topScorer.total_goals,
            unit: 'gol'
        });
    }
    // En çok asist
    const topAssister = [
        ...hof
    ].sort((a, b)=>b.total_assists - a.total_assists)[0];
    if (topAssister && topAssister.total_assists > 0) {
        records.push({
            category: 'assists',
            label: 'En Çok Asist',
            icon: '🎯',
            playerName: topAssister.player_name,
            value: topAssister.total_assists,
            unit: 'asist'
        });
    }
    // En çok maç
    const topMatches = [
        ...hof
    ].sort((a, b)=>b.total_matches - a.total_matches)[0];
    if (topMatches && topMatches.total_matches > 0) {
        records.push({
            category: 'matches',
            label: 'En Çok Maç',
            icon: '🏟️',
            playerName: topMatches.player_name,
            value: topMatches.total_matches,
            unit: 'maç'
        });
    }
    // En yüksek rating
    const topRating = [
        ...hof
    ].sort((a, b)=>b.avg_rating - a.avg_rating)[0];
    if (topRating && topRating.avg_rating > 0) {
        records.push({
            category: 'rating',
            label: 'En Yüksek Rating',
            icon: '⭐',
            playerName: topRating.player_name,
            value: Math.round(topRating.avg_rating * 10) / 10,
            unit: 'avg'
        });
    }
    // En çok MotM
    const topMotm = [
        ...hof
    ].sort((a, b)=>b.total_motm - a.total_motm)[0];
    if (topMotm && topMotm.total_motm > 0) {
        records.push({
            category: 'motm',
            label: 'En Çok Maçın Adamı',
            icon: '🏅',
            playerName: topMotm.player_name,
            value: topMotm.total_motm,
            unit: 'MotM'
        });
    }
    // En çok clean sheet (sadece kaleciler)
    const gks = hof.filter((p)=>p.position === 'GK');
    const topCS = [
        ...gks
    ].sort((a, b)=>b.total_clean_sheets - a.total_clean_sheets)[0];
    if (topCS && topCS.total_clean_sheets > 0) {
        records.push({
            category: 'cleansheets',
            label: 'En Çok Clean Sheet',
            icon: '🧤',
            playerName: topCS.player_name,
            value: topCS.total_clean_sheets,
            unit: 'CS'
        });
    }
    // En yüksek peak rating
    const topPeak = [
        ...hof
    ].sort((a, b)=>b.peak_rating - a.peak_rating)[0];
    if (topPeak && topPeak.peak_rating > 0) {
        records.push({
            category: 'peak',
            label: 'En Yüksek Zirve Rating',
            icon: '🏔️',
            playerName: topPeak.player_name,
            value: topPeak.peak_rating,
            unit: 'OVR'
        });
    }
    return records;
}
// ─── Row Mapping ─────────────────────────────────────────────────────
function mapHofFromRow(row) {
    return {
        id: row.id,
        profile_id: row.profile_id,
        player_id: row.player_id,
        player_name: row.player_name,
        position: row.position,
        nationality: row.nationality,
        seasons_played: row.seasons_played || 0,
        total_goals: row.total_goals || 0,
        total_assists: row.total_assists || 0,
        total_matches: row.total_matches || 0,
        total_clean_sheets: row.total_clean_sheets || 0,
        total_motm: row.total_motm || 0,
        avg_rating: row.avg_rating || 0,
        peak_rating: row.peak_rating || 0,
        legend_tier: row.legend_tier || 'bronze',
        is_club_legend: row.is_club_legend || false,
        awards_won: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(row.awards_won, []),
        joined_day: row.joined_day,
        retired_day: row.retired_day,
        retired_season: row.retired_season,
        inducted_at: row.inducted_at
    };
}
}),
"[project]/src/lib/fm/multiplayer.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignTeamToManager",
    ()=>assignTeamToManager,
    "buyPlayerFromMarket",
    ()=>buyPlayerFromMarket,
    "cancelAuction",
    ()=>cancelAuction,
    "getAuctionBids",
    ()=>getAuctionBids,
    "getGlobalLeaderboard",
    ()=>getGlobalLeaderboard,
    "getMarketListings",
    ()=>getMarketListings,
    "getMyAuctions",
    ()=>getMyAuctions,
    "getTeamSquad",
    ()=>getTeamSquad,
    "initFreeAgentsOnMarket",
    ()=>initFreeAgentsOnMarket,
    "listAllSquadOnMarket",
    ()=>listAllSquadOnMarket,
    "listPlayerOnMarket",
    ()=>listPlayerOnMarket,
    "massListPlayers",
    ()=>massListPlayers,
    "moveTeamToMarket",
    ()=>moveTeamToMarket,
    "placeBid",
    ()=>placeBid,
    "resolveExpiredAuctions",
    ()=>resolveExpiredAuctions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
// ---------------------------------------------------------------------------
// Init Free Agents on Market
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-ssr] (ecmascript)");
;
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TAX_RATE = 0.025; // 2.5% Tax
const AUCTION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Generate an expiry ISO string that is 4 hours from now. */ function auctionExpiry() {
    return new Date(Date.now() + AUCTION_DURATION_MS).toISOString();
}
/** Complete a transfer: update seller money, player ownership, deactivate listing. */ async function completeTransfer(supabase, listing, buyerId, finalPrice) {
    const taxAmount = finalPrice * TAX_RATE;
    const sellerRevenue = finalPrice - taxAmount;
    // Credit seller
    const { data: sellerProfile } = await supabase.from('profiles').select('money').eq('id', listing.seller_id).single();
    if (sellerProfile) {
        await supabase.from('profiles').update({
            money: Number(sellerProfile.money) + sellerRevenue
        }).eq('id', listing.seller_id);
    }
    // Transfer player ownership
    // Alıcının takım adını da güncelle (buyPlayerFromMarket ile tutarlı)
    const { data: buyerProfile } = await supabase.from('profiles').select('team_name').eq('id', buyerId).maybeSingle();
    await supabase.from('players').update({
        profile_id: buyerId,
        team_name: buyerProfile?.team_name || buyerId
    }).eq('id', listing.player_id);
    // Deactivate listing
    await supabase.from('transfer_market').update({
        is_active: false
    }).eq('id', listing.id);
    return {
        taxAmount,
        sellerRevenue
    };
}
const listPlayerOnMarket = async (player, sellerId, sellerName, price, minPrice, maxPrice)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured'
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // Determine auction vs direct-buy mode
    const isAuction = sellerId !== 'free-agent-system';
    const insertPayload = {
        player_id: player.id,
        player_data: player,
        seller_id: sellerId,
        seller_name: sellerName,
        price,
        min_price: minPrice ?? Math.round(price * 0.8),
        max_price: maxPrice ?? Math.round(price * 1.5),
        is_active: true,
        is_auction: isAuction,
        starting_price: price,
        reserve_price: minPrice ?? Math.round(price * 0.8),
        bid_count: 0
    };
    // Auctions get a 4-hour expiry; free agents do not
    if (isAuction) {
        insertPayload.expires_at = auctionExpiry();
    }
    const { error } = await supabase.from('transfer_market').insert(insertPayload);
    if (error) return {
        success: false,
        error: error.message
    };
    return {
        success: true
    };
};
const buyPlayerFromMarket = async (listingId, buyerId, buyerTeam)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured'
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // 1. Fetch listing
    const { data: listing, error: fetchError } = await supabase.from('transfer_market').select('*').eq('id', listingId).single();
    if (fetchError || !listing) return {
        success: false,
        error: 'Listing not found'
    };
    // 2. Auction items must go through placeBid
    if (listing.is_auction) {
        return {
            success: false,
            error: 'This is an auction listing. Use placeBid instead.'
        };
    }
    // 3. Calculate tax and revenue
    const taxAmount = listing.price * TAX_RATE;
    const sellerRevenue = listing.price - taxAmount;
    // 4. Update seller's money
    const { data: sellerProfile } = await supabase.from('profiles').select('money').eq('id', listing.seller_id).single();
    if (sellerProfile) {
        await supabase.from('profiles').update({
            money: Number(sellerProfile.money) + sellerRevenue
        }).eq('id', listing.seller_id);
    }
    // 5. Update player ownership
    await supabase.from('players').update({
        profile_id: buyerId,
        team_name: buyerTeam
    }).eq('id', listing.player_id);
    // 6. Deactivate listing
    await supabase.from('transfer_market').update({
        is_active: false
    }).eq('id', listingId);
    return {
        success: true,
        player: listing.player_data,
        price: listing.price,
        taxAmount,
        sellerRevenue
    };
};
const placeBid = async (listingId, bidderId, bidderName, bidAmount)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured'
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // 1. Fetch the listing
    const { data: listing, error: fetchError } = await supabase.from('transfer_market').select('*').eq('id', listingId).single();
    if (fetchError || !listing) return {
        success: false,
        error: 'Listing not found'
    };
    // 2. Must be active auction
    if (!listing.is_active) return {
        success: false,
        error: 'Listing is no longer active'
    };
    if (!listing.is_auction) return {
        success: false,
        error: 'This is not an auction listing'
    };
    // 3. Bid must exceed current highest bid (or listing price if no bids)
    const currentHigh = listing.current_bid ?? listing.price;
    if (bidAmount <= currentHigh) {
        return {
            success: false,
            error: `Bid must be higher than the current highest bid (${currentHigh.toLocaleString()})`
        };
    }
    // 4. Bid must not exceed max_price (auto-buy cap)
    if (listing.max_price && bidAmount > listing.max_price) {
        return {
            success: false,
            error: `Bid exceeds the maximum allowed price (${listing.max_price.toLocaleString()})`
        };
    }
    // 5. Bidder cannot be the seller
    if (bidderId === listing.seller_id) {
        return {
            success: false,
            error: 'You cannot bid on your own listing'
        };
    }
    // 6. Check bidder has enough money (mevcut tutulan parayı da hesaba kat)
    const { data: bidderProfile } = await supabase.from('profiles').select('money').eq('id', bidderId).single();
    // Mevcut en yüksek teklif sahibinin held_amount'unu iade et
    const prevHeldAmount = listing.held_amount || 0;
    const prevBidderId = listing.highest_bidder_id;
    const availableMoney = Number(bidderProfile?.money || 0);
    if (!bidderProfile || availableMoney < bidAmount) {
        return {
            success: false,
            error: 'Insufficient funds'
        };
    }
    // 7. Yeni teklif sahibinin parasını rezerve et (held_amount)
    // Önceki teklif sahibinin parasını iade et
    if (prevBidderId && prevHeldAmount > 0) {
        try {
            const { data: prevBidder } = await supabase.from('profiles').select('money').eq('id', prevBidderId).maybeSingle();
            if (prevBidder) {
                await supabase.from('profiles').update({
                    money: Number(prevBidder.money) + prevHeldAmount
                }).eq('id', prevBidderId);
            }
        } catch (e) {
            console.warn('[placeBid] Previous bidder refund failed:', e);
        }
    }
    // Yeni teklif sahibinin parasından düş
    await supabase.from('profiles').update({
        money: availableMoney - bidAmount
    }).eq('id', bidderId);
    // 8. Update listing with new bid + held_amount
    const newBidCount = (listing.bid_count ?? 0) + 1;
    const newExpiry = auctionExpiry(); // extend by 4 hours from NOW
    const { error: updateError } = await supabase.from('transfer_market').update({
        current_bid: bidAmount,
        highest_bidder_id: bidderId,
        highest_bidder_name: bidderName,
        bid_count: newBidCount,
        expires_at: newExpiry,
        held_amount: bidAmount
    }).eq('id', listingId);
    if (updateError) {
        // Para kesildi ama listing güncellenemedi — parayı geri iade et
        await supabase.from('profiles').update({
            money: availableMoney
        }).eq('id', bidderId);
        return {
            success: false,
            error: updateError.message
        };
    }
    // 9. Record the bid in auction_bids (graceful — table may not exist yet)
    try {
        await supabase.from('auction_bids').insert({
            listing_id: listingId,
            bidder_id: bidderId,
            bidder_name: bidderName,
            bid_amount: bidAmount
        });
    } catch  {
    // auction_bids table may not exist — non-critical, skip bid history
    }
    // 10. Auto-buy check: if bid meets or exceeds max_price, immediately complete
    let autoWin = false;
    if (listing.max_price && bidAmount >= listing.max_price) {
        autoWin = true;
        // Para zaten reserve edildi (held_amount), sadece transferi tamamla
        // held_amount'u 0'a düş (para zaten kesildi)
        await supabase.from('transfer_market').update({
            held_amount: 0
        }).eq('id', listingId);
        // Complete transfer
        await completeTransfer(supabase, {
            ...listing,
            current_bid: bidAmount
        }, bidderId, bidAmount);
    }
    return {
        success: true,
        autoWin,
        ...autoWin ? {
            player: listing.player_data,
            price: bidAmount
        } : {}
    };
};
const cancelAuction = async (listingId, sellerId)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured'
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // 1. Fetch listing
    const { data: listing, error: fetchError } = await supabase.from('transfer_market').select('*').eq('id', listingId).single();
    if (fetchError || !listing) return {
        success: false,
        error: 'Listing not found'
    };
    // 2. Only the seller can cancel
    if (listing.seller_id !== sellerId) {
        return {
            success: false,
            error: 'Only the seller can cancel this auction'
        };
    }
    // 3. Cannot cancel if there are bids
    if ((listing.bid_count ?? 0) > 0) {
        return {
            success: false,
            error: 'Cannot cancel — auction already has bids'
        };
    }
    // 4. Deactivate
    const { error: updateError } = await supabase.from('transfer_market').update({
        is_active: false
    }).eq('id', listingId);
    if (updateError) return {
        success: false,
        error: updateError.message
    };
    return {
        success: true
    };
};
const getAuctionBids = async (listingId)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    try {
        const { data, error } = await supabase.from('auction_bids').select('*').eq('listing_id', listingId).order('bid_amount', {
            ascending: false
        });
        if (error) return [];
        return data ?? [];
    } catch  {
        // auction_bids table may not exist yet
        return [];
    }
};
const resolveExpiredAuctions = async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        resolved: 0
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    const now = new Date().toISOString();
    // 1. Fetch all active auctions that have expired
    const { data: expiredListings, error } = await supabase.from('transfer_market').select('*').eq('is_active', true).eq('is_auction', true).lt('expires_at', now);
    if (error || !expiredListings?.length) return {
        resolved: 0
    };
    let resolved = 0;
    const SIGNING_DEADLINE_HOURS = 24;
    const PENALTY_RATE = 0.05;
    for (const listing of expiredListings){
        // ── Duplicate transfer koruması: Atomik lock ──
        // Önce listing'i processing olarak işaretle (is_active = false + processing_flag)
        // Eğer başka bir instance aynı listing'i işlemişse, bu update 0 satır etkiler
        const { data: lockResult, error: lockError } = await supabase.from('transfer_market').update({
            is_active: false
        }) // Lock: hemen deaktif et, duplicate engelle
        .eq('id', listing.id).eq('is_active', true) // Sadece hala aktifse güncelle (race condition koruması)
        .select('id');
        if (lockError || !lockResult || lockResult.length === 0) {
            continue;
        }
        const reserveThreshold = listing.reserve_price ?? listing.min_price ?? 0;
        const currentBid = listing.current_bid ?? 0;
        const hasValidBid = currentBid >= reserveThreshold && listing.highest_bidder_id;
        if (hasValidBid) {
            // İmzalanmış mı kontrol et
            const { data: playerData } = await supabase.from('players').select('profile_id').eq('id', listing.player_id).maybeSingle();
            const isSigned = playerData?.profile_id === listing.highest_bidder_id;
            if (isSigned) {
                // ── Kazanan imzalamış → listing zaten deaktif (lock adımında) ──
                resolved++;
            } else {
                // ── İmzalamamış → 24 saat sonrasını bekle (tazminat sistemi) ──
                const auctionEnd = new Date(listing.expires_at);
                const penaltyDeadline = new Date(auctionEnd.getTime() + SIGNING_DEADLINE_HOURS * 60 * 60 * 1000);
                const isPastDeadline = new Date() > penaltyDeadline;
                if (isPastDeadline) {
                    // Tazminat: teklifin %5'i satıcıya
                    const penaltyAmount = Math.round(currentBid * PENALTY_RATE);
                    const { data: winnerProfile } = await supabase.from('profiles').select('money').eq('id', listing.highest_bidder_id).maybeSingle();
                    if (winnerProfile) {
                        await supabase.from('profiles').update({
                            money: Math.max(0, Number(winnerProfile.money) - penaltyAmount)
                        }).eq('id', listing.highest_bidder_id);
                        const { data: sellerProfile } = await supabase.from('profiles').select('money').eq('id', listing.seller_id).maybeSingle();
                        if (sellerProfile) {
                            await supabase.from('profiles').update({
                                money: Number(sellerProfile.money) + penaltyAmount
                            }).eq('id', listing.seller_id);
                        }
                    }
                    // Satıcı gerçek kullanıcıysa listing'i sıfırla ve yeniden aç
                    if (listing.seller_id && listing.seller_id !== 'free-agent-system') {
                        const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                        await supabase.from('transfer_market').update({
                            is_active: true,
                            current_bid: null,
                            highest_bidder_id: null,
                            highest_bidder_name: null,
                            bid_count: 0,
                            expires_at: newExpiry.toISOString()
                        }).eq('id', listing.id);
                    }
                    // Serbest oyuncu ise listing zaten deaktif (lock adımında)
                    resolved++;
                } else {
                    // Henüz 24 saat dolmamışsa — listing'i tekrar aktif yap (bekleme süresi devam ediyor)
                    await supabase.from('transfer_market').update({
                        is_active: true
                    }).eq('id', listing.id);
                }
            }
        } else {
            // No valid bid — listing zaten deaktif (lock adımında), hiçbir şey yapma
            resolved++;
        }
    }
    return {
        resolved
    };
};
const getMarketListings = async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // NOTE: Expired auctions are now resolved server-side only via /api/market/expire cron.
    // Client-side fire-and-forget was removed to prevent race conditions and duplicate transfers.
    const { data } = await supabase.from('transfer_market').select('*').eq('is_active', true).order('created_at', {
        ascending: false
    });
    let listings = data ?? [];
    // ── Sahipli oyuncuları filtrele ──
    // transfer_market is_active=true olsa bile, oyuncunun profile_id'si null değilse
    // bu oyuncu zaten satın alınmış demektir — listeden çıkar
    if (listings.length > 0) {
        const playerIds = listings.map((l)=>l.player_id).filter(Boolean);
        if (playerIds.length > 0) {
            const { data: ownedPlayers } = await supabase.from('players').select('id').in('id', playerIds).not('profile_id', 'is', null);
            const ownedIds = new Set((ownedPlayers || []).map((p)=>p.id));
            if (ownedIds.size > 0) {
                // Sahipli oyuncuların listelerini deaktif et (temizlik)
                const ownedListingIds = listings.filter((l)=>ownedIds.has(l.player_id)).map((l)=>l.id);
                if (ownedListingIds.length > 0) {
                    await supabase.from('transfer_market').update({
                        is_active: false
                    }).in('id', ownedListingIds);
                }
                // Listeden kaldır
                listings = listings.filter((l)=>!ownedIds.has(l.player_id));
            }
        }
    }
    const now = new Date();
    // Mark auction listings that have expired (for UI display purposes)
    return listings.map((l)=>({
            ...l,
            expired: l.is_auction && l.expires_at ? new Date(l.expires_at) < now : false
        }));
};
const getMyAuctions = async (sellerId)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    const { data } = await supabase.from('transfer_market').select('*').eq('seller_id', sellerId).order('created_at', {
        ascending: false
    });
    return data ?? [];
};
const massListPlayers = async (players, sellerId, sellerName)=>{
    for (const p of players){
        await listPlayerOnMarket(p, sellerId, sellerName, p.market_value);
    }
    return {
        success: true,
        total: players.length
    };
};
;
const initFreeAgentsOnMarket = async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        // Return early if not configured, local storage handled by context if needed
        return {
            success: false
        };
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    // Check current count of free agents
    const { count } = await supabase.from('transfer_market').select('*', {
        count: 'exact',
        head: true
    }).eq('seller_id', 'free-agent-system').eq('is_active', true);
    if (count !== null && count >= 150) return {
        success: true,
        count
    };
    const needed = 150 - (count || 0);
    const players = [];
    for(let i = 0; i < needed; i++){
        const pos = [
            'GK',
            'DEF',
            'MID',
            'FWD'
        ][Math.floor(Math.random() * 4)];
        const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generatePlayer"])(pos);
        players.push({
            player_id: p.id,
            player_data: p,
            seller_id: 'free-agent-system',
            seller_name: 'SERBEST OYUNCU',
            price: p.market_value,
            min_price: Math.round(p.market_value * 0.8),
            max_price: Math.round(p.market_value * 1.5),
            is_active: true,
            is_auction: false,
            starting_price: p.market_value,
            reserve_price: Math.round(p.market_value * 0.8),
            bid_count: 0
        });
    }
    // Use chunks for large inserts
    const CHUNK_SIZE = 50;
    for(let i = 0; i < players.length; i += CHUNK_SIZE){
        const chunk = players.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from('transfer_market').insert(chunk);
        if (error) {
            console.error('Error seeding free agents chunk:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    return {
        success: true,
        count: 150
    };
};
const moveTeamToMarket = async (teamId, profileId, teamName)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured'
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    try {
        // 1. Fetch all players belonging to the team
        const { data: players, error: fetchError } = await supabase.from('players').select('*').eq('profile_id', teamId);
        if (fetchError) return {
            success: false,
            error: fetchError.message
        };
        if (!players || players.length === 0) return {
            success: true,
            moved: 0
        };
        // 2. Insert each player into transfer_market
        let moved = 0;
        for (const p of players){
            const { error: insertError } = await supabase.from('transfer_market').insert({
                player_id: p.id,
                player_data: p,
                seller_id: profileId,
                seller_name: teamName,
                price: p.market_value ?? 0,
                min_price: Math.round((p.market_value ?? 0) * 0.8),
                max_price: Math.round((p.market_value ?? 0) * 1.5),
                is_active: true,
                is_auction: true,
                starting_price: p.market_value ?? 0,
                reserve_price: Math.round((p.market_value ?? 0) * 0.8),
                bid_count: 0,
                expires_at: auctionExpiry()
            });
            if (!insertError) moved++;
        }
        // 3. Delete players from players table
        const { error: deleteError } = await supabase.from('players').delete().eq('profile_id', teamId);
        if (deleteError) {
            console.error('Error deleting players after market move:', deleteError);
        }
        return {
            success: true,
            moved
        };
    } catch (err) {
        console.error('moveTeamToMarket error:', err);
        return {
            success: false,
            error: 'Unexpected error'
        };
    }
};
const listAllSquadOnMarket = async (players, profileId, teamName)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        success: false,
        error: 'Supabase not configured',
        total: 0
    };
    try {
        const result = await massListPlayers(players, profileId, teamName);
        return result;
    } catch (err) {
        console.error('listAllSquadOnMarket error:', err);
        return {
            success: false,
            error: 'Unexpected error',
            total: 0
        };
    }
};
const getGlobalLeaderboard = async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    try {
        const { data, error } = await supabase.from('profiles').select('id, manager_name, team_name, reputation, level, fans').order('reputation', {
            ascending: false
        }).limit(20);
        if (error || !data) return [];
        return data;
    } catch  {
        return [];
    }
};
const assignTeamToManager = async (managerId, teamId)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    try {
        await supabase.from('profiles').update({
            team_id: teamId
        }).eq('id', managerId);
    } catch (err) {
        console.error('assignTeamToManager error:', err);
    }
};
const getTeamSquad = async (teamId)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    try {
        const { data, error } = await supabase.from('players').select('*').eq('profile_id', teamId);
        if (error || !data) return [];
        return data;
    } catch  {
        return [];
    }
};
}),
"[project]/src/lib/fm/playerDemands.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generatePlayerDemands",
    ()=>generatePlayerDemands
]);
// ── Player Demands (Single Source of Truth) ──────────────────────────
// Bu dosya hem client hem server tarafında kullanılır.
// ContractOfferModal.tsx ve api/contract-offer/route.ts buradan import eder.
//
// Maaş hesaplama artık salaryUtils.ts üzerinden yapılır.
// Bu dosya geriye dönük uyumluluk için korunur.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$salaryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/salaryUtils.ts [app-ssr] (ecmascript)");
;
function generatePlayerDemands(rating, isFreeAgent) {
    const salary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$salaryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateSalaryRange"])(rating, isFreeAgent);
    const fee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$salaryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateSigningFeeRange"])(rating);
    return {
        minWeeklySalary: salary.minWeeklySalary,
        maxWeeklySalary: salary.maxWeeklySalary,
        minSigningFee: fee.minSigningFee,
        maxSigningFee: fee.maxSigningFee
    };
}
}),
"[project]/src/lib/fm/migration.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkSupabaseData",
    ()=>checkSupabaseData,
    "migrateLocalStorageToSupabase",
    ()=>migrateLocalStorageToSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/persistence.ts [app-ssr] (ecmascript)");
;
;
async function migrateLocalStorageToSupabase(userId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !userId) return {
        success: false,
        count: 0
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return {
        success: false,
        count: 0
    };
    const localProfile = localStorage.getItem('fm_profile');
    const localSquad = localStorage.getItem('fm_squad');
    if (!localProfile && !localSquad) return {
        success: true,
        count: 0
    };
    try {
        let count = 0;
        if (localProfile) {
            const profile = JSON.parse(localProfile);
            // Ensure ID matches
            profile.id = userId;
            await supabase.from('profiles').upsert(profile);
        }
        if (localSquad) {
            const squad = JSON.parse(localSquad);
            count = squad.length;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["savePlayers"])(squad, userId);
        }
        return {
            success: true,
            count
        };
    } catch (err) {
        console.error('Migration failed:', err);
        return {
            success: false,
            count: 0
        };
    }
}
async function checkSupabaseData(userId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() || !userId) return {
        players: 0
    };
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return {
        players: 0
    };
    try {
        const { count, error } = await supabase.from('players').select('*', {
            count: 'exact',
            head: true
        }).eq('profile_id', userId);
        if (error) throw error;
        return {
            players: count || 0
        };
    } catch (err) {
        console.error('Check failed:', err);
        return {
            players: 0
        };
    }
}
}),
"[project]/src/lib/fm/FitnessManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FitnessManager",
    ()=>FitnessManager
]);
class FitnessManager {
    static updateAfterMatch(players, tacticIntensity) {
        const intensityMult = tacticIntensity === 'high' ? 1.5 : tacticIntensity === 'low' ? 0.8 : 1.0;
        return players.map((player)=>{
            const staminaFactor = (player.stamina || 50) / 100;
            const loss = Math.floor((10 + Math.random() * 15) * intensityMult * (1.2 - staminaFactor));
            return {
                ...player,
                fitness: Math.max(0, player.fitness - loss)
            };
        });
    }
    static restoreFitness(players, rehabLevel, trainingIntensity) {
        // Recovery at 15:00 and 21:00
        // Gain: Base + (Rehab * Multiplier) - Intensity_Penalty
        const intensityPenalty = trainingIntensity === 'high' ? 0.5 : 0;
        return players.map((player)=>{
            if (player.fitness >= 100) return player;
            const gain = Math.floor((10 + rehabLevel * 5) * (1 - intensityPenalty));
            return {
                ...player,
                fitness: Math.min(100, player.fitness + gain)
            };
        });
    }
}
}),
"[project]/src/lib/fm/useDbHealth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDbHealth",
    ()=>useDbHealth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/persistence.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$migration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/migration.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/multiplayer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$FitnessManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/FitnessManager.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$schedule$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/schedule.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function useDbHealth(userId, squad, activeTactic, teamStats, setSquad) {
    const [dbStatus, setDbStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('checking');
    const [dbLatency, setDbLatency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [migrating, setMigrating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastMatch, setLastMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [migrationResult, setMigrationResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showMigrationBanner, setShowMigrationBanner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCheckDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (dbStatus === 'not_configured') {
            alert('Supabase henüz yapılandırılmamış.');
        } else {
            const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkConnectionHealth"])();
            setDbStatus(health.status);
            setDbLatency(health.latency ?? null);
        }
    }, [
        dbStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const checkDb = async ()=>{
            const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkConnectionHealth"])();
            setDbStatus(health.status);
            setDbLatency(health.latency ?? null);
            const last = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadLastMatchResult"])();
            if (last) setLastMatch(last);
            if (health.status === 'connected' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                if (userId) {
                    const counts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$migration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkSupabaseData"])(userId);
                    if (counts.players === 0) setShowMigrationBanner(true);
                }
                // Move free agents to market on startup if connected
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$multiplayer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initFreeAgentsOnMarket"])();
            }
        };
        checkDb();
        const interval = setInterval(checkDb, 300000);
        return ()=>clearInterval(interval);
    }, [
        userId
    ]);
    // Fitness restoration loop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const interval = setInterval(()=>{
            const now = new Date();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$schedule$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTrainingTime"])(now)) {
                const rehabLevel = teamStats.medical || 1;
                const intensity = activeTactic.intensity || 'normal';
                setSquad((prev)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$FitnessManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FitnessManager"].restoreFitness(prev, rehabLevel, intensity));
            }
        }, 180000);
        return ()=>clearInterval(interval);
    }, [
        squad,
        activeTactic,
        teamStats,
        setSquad
    ]);
    const handleMigrate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setMigrating(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$migration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["migrateLocalStorageToSupabase"])('guest-manager');
            setMigrationResult(result);
            if (result.success) setShowMigrationBanner(false);
        } catch (err) {
            console.error('Migration error:', err);
        } finally{
            setMigrating(false);
        }
    }, []);
    return {
        dbStatus,
        dbLatency,
        migrating,
        migrationResult,
        showMigrationBanner,
        lastMatch,
        handleCheckDb,
        handleMigrate,
        setShowMigrationBanner,
        setMigrationResult,
        setLastMatch
    };
}
}),
"[project]/src/lib/fm/useYouthAcademy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useYouthAcademy",
    ()=>useYouthAcademy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/persistence.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useYouthAcademy(profileId) {
    const [youthPlayers, setYouthPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [youthFacilities, setYouthFacilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Track whether initial load has completed to avoid saving empty state
    const youthFacilitiesLoadedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Load youth players + facilities on profile load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!profileId) return;
        let cancelled = false;
        (async ()=>{
            try {
                const [loadedPlayers, loadedFacilities] = await Promise.all([
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadYouthPlayers"])(profileId),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadYouthFacilities"])(profileId)
                ]);
                if (!cancelled) {
                    if (loadedPlayers.length > 0) setYouthPlayers(loadedPlayers);
                    // Always set loaded facilities (even empty) to sync state with DB
                    setYouthFacilities(loadedFacilities);
                    youthFacilitiesLoadedRef.current = true;
                }
            } catch (err) {
                console.error('[Youth Academy] Veri yükleme hatası:', err);
            }
        })();
        return ()=>{
            cancelled = true;
        };
    }, [
        profileId
    ]);
    // Auto-sync youthFacilities → Supabase when state changes (after initial load)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!profileId) return;
        if (!youthFacilitiesLoadedRef.current) return; // Don't save before initial load completes
        if (Object.keys(youthFacilities).length === 0) return; // Don't save empty state
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveYouthFacilities"])(youthFacilities, profileId);
    }, [
        youthFacilities,
        profileId
    ]);
    return {
        youthPlayers,
        setYouthPlayers,
        youthFacilities,
        setYouthFacilities
    };
}
}),
"[project]/src/lib/fm/useCupSeasons.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCupSeasons",
    ()=>useCupSeasons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
;
function useCupSeasons(profileId, teamName) {
    const [cupSeasons, setCupSeasons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!profileId || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return;
        fetch(`/api/cups/my-seasons?profileId=${profileId}&teamName=${encodeURIComponent(teamName || '')}`).then((r)=>r.json()).then((data)=>{
            if (Array.isArray(data)) setCupSeasons(data);
        }).catch(()=>{});
    }, [
        profileId,
        teamName
    ]);
    return {
        cupSeasons,
        setCupSeasons
    };
}
}),
"[project]/src/lib/fm/useActiveOperations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useActiveOperations",
    ()=>useActiveOperations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function useActiveOperations(userId, activeTab) {
    const [activeOperations, setActiveOperations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (userId) {
            __turbopack_context__.A("[project]/src/lib/fm/persistence.ts [app-ssr] (ecmascript, async loader)").then(({ getMatchPreparations })=>{
                getMatchPreparations(userId).then((preps)=>{
                    if (preps) setActiveOperations(preps.filter(Boolean));
                });
            });
        }
    }, [
        userId,
        activeTab
    ]);
    return {
        activeOperations,
        setActiveOperations
    };
}
}),
"[project]/src/lib/push-notifications.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_NOTIFICATION_PREFERENCES",
    ()=>DEFAULT_NOTIFICATION_PREFERENCES,
    "getNotificationPermissionStatus",
    ()=>getNotificationPermissionStatus,
    "getVapidPrivateKey",
    ()=>getVapidPrivateKey,
    "getVapidPublicKey",
    ()=>getVapidPublicKey,
    "hasPushSubscription",
    ()=>hasPushSubscription,
    "loadNotificationPreferences",
    ()=>loadNotificationPreferences,
    "registerServiceWorker",
    ()=>registerServiceWorker,
    "removeSubscription",
    ()=>removeSubscription,
    "requestPushPermission",
    ()=>requestPushPermission,
    "saveNotificationPreferences",
    ()=>saveNotificationPreferences,
    "saveSubscription",
    ()=>saveSubscription,
    "sendMatchReminder",
    ()=>sendMatchReminder,
    "sendPushToProfile",
    ()=>sendPushToProfile,
    "subscribeToPush",
    ()=>subscribeToPush,
    "unsubscribeFromPush",
    ()=>unsubscribeFromPush
]);
/**
 * Web Push Bildirim Yardımcısı
 *
 * Kullanıcıdan izin isteme, abonelik kaydetme, ve bildirim gönderme.
 * Sütun adı tutarlılığı: push_subscriptions tablosunda "auth_key" kullanılır
 * (supabase-migration.sql master şemasına uygun).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
// ═══════════════════════════════════════════════════════════════
// VAPID Public Key (.env'den alınacak)
// ═══════════════════════════════════════════════════════════════
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
/**
 * VAPID key'i Uint8Array'e çevirir (Application Server Key formatı)
 */ function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for(let i = 0; i < rawData.length; ++i){
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
async function registerServiceWorker() {
    try {
        if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('serviceWorker' in navigator)) {
            console.warn('[Push] Service Worker desteklenmiyor.');
            return null;
        }
        //TURBOPACK unreachable
        ;
        const registration = undefined;
    } catch (err) {
        console.error('[Push] Service Worker kayıt hatası:', err);
        return null;
    }
}
async function requestPushPermission() {
    try {
        if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('Notification' in window)) {
            console.warn('[Push] Notification API desteklenmiyor.');
            return 'denied';
        }
        //TURBOPACK unreachable
        ;
        const permission = undefined;
    } catch (err) {
        console.error('[Push] İzin hatası:', err);
        return 'denied';
    }
}
function getNotificationPermissionStatus() {
    if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }
    //TURBOPACK unreachable
    ;
}
async function hasPushSubscription(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return false;
        const { data, error } = await supabase.from('push_subscriptions').select('id').eq('profile_id', profileId).maybeSingle();
        if (error) {
            console.error('[Push] Abonelik kontrol hatası:', error.message);
            return false;
        }
        return !!data;
    } catch (err) {
        console.error('[Push] Abonelik kontrol hatası:', err);
        return false;
    }
}
async function subscribeToPush(profileId) {
    try {
        if (!VAPID_PUBLIC_KEY) {
            return {
                success: false,
                error: 'VAPID public key yapılandırılmamış.'
            };
        }
        // İzin al
        const permission = await requestPushPermission();
        if (permission !== 'granted') {
            return {
                success: false,
                error: 'Bildirim izni reddedildi.'
            };
        }
        // Service Worker kaydet
        const registration = await registerServiceWorker();
        if (!registration) {
            return {
                success: false,
                error: 'Service Worker kaydedilemedi.'
            };
        }
        // Mevcut aboneliği kontrol et
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            // Yeni abonelik oluştur
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }
        // Supabase'e kaydet (auth_key sütun adı kullanılır)
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) {
            return {
                success: false,
                error: 'Supabase yapılandırılmamış.'
            };
        }
        const subscriptionJson = subscription.toJSON();
        const { error } = await supabase.from('push_subscriptions').upsert({
            profile_id: profileId,
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys?.p256dh || '',
            auth_key: subscriptionJson.keys?.auth || '',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'profile_id,endpoint'
        });
        if (error) {
            console.error('[Push] Supabase kayıt hatası:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
        console.log('[Push] Abonelik kaydedildi:', subscriptionJson.endpoint);
        return {
            success: true
        };
    } catch (err) {
        console.error('[Push] Subscribe hatası:', err);
        return {
            success: false,
            error: String(err)
        };
    }
}
async function unsubscribeFromPush(profileId) {
    try {
        if (("TURBOPACK compile-time value", "undefined") === 'undefined' || !('serviceWorker' in navigator)) {
            return {
                success: false
            };
        }
        //TURBOPACK unreachable
        ;
        const registration = undefined;
        const subscription = undefined;
        // Supabase'den sil
        const supabase = undefined;
    } catch (err) {
        console.error('[Push] Unsubscribe hatası:', err);
        return {
            success: false
        };
    }
}
const DEFAULT_NOTIFICATION_PREFERENCES = {
    match_reminder: true,
    transfer_offer: true,
    training_report: true,
    push_enabled: false
};
async function loadNotificationPreferences(profileId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return DEFAULT_NOTIFICATION_PREFERENCES;
        const { data, error } = await supabase.from('notification_preferences').select('*').eq('profile_id', profileId).maybeSingle();
        if (error || !data) {
            return DEFAULT_NOTIFICATION_PREFERENCES;
        }
        return {
            match_reminder: data.match_reminder ?? true,
            transfer_offer: data.transfer_offer ?? true,
            training_report: data.training_report ?? true,
            push_enabled: data.push_enabled ?? false
        };
    } catch (err) {
        console.error('[Push] Tercih yükleme hatası:', err);
        return DEFAULT_NOTIFICATION_PREFERENCES;
    }
}
async function saveNotificationPreferences(profileId, prefs) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return {
            success: false,
            error: 'Supabase yapılandırılmamış.'
        };
        const { error } = await supabase.from('notification_preferences').upsert({
            profile_id: profileId,
            match_reminder: prefs.match_reminder,
            transfer_offer: prefs.transfer_offer,
            training_report: prefs.training_report,
            push_enabled: prefs.push_enabled,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'profile_id'
        });
        if (error) {
            console.error('[Push] Tercih kaydetme hatası:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (err) {
        console.error('[Push] Tercih kaydetme hatası:', err);
        return {
            success: false,
            error: String(err)
        };
    }
}
function getVapidPublicKey() {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
}
function getVapidPrivateKey() {
    return process.env.VAPID_PRIVATE_KEY || '';
}
async function saveSubscription(profileId, subscription) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return false;
    const { error } = await supabase.from('push_subscriptions').upsert({
        profile_id: profileId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'profile_id,endpoint'
    });
    return !error;
}
async function removeSubscription(profileId, endpoint) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return false;
    const { error } = await supabase.from('push_subscriptions').delete().eq('profile_id', profileId).eq('endpoint', endpoint);
    return !error;
}
async function sendPushToProfile(profileId, payload) {
    // Server-only: bu fonksiyon sadece API route'larından çağrılmalı
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) return 0;
    const { data: subs } = await supabase.from('push_subscriptions').select('endpoint, p256dh, auth_key').eq('profile_id', profileId);
    if (!subs || subs.length === 0) return 0;
    // web-push kütüphanesini server-only dinamik import ile kullan
    try {
        const webpush = __turbopack_context__.r("[project]/node_modules/web-push/src/index.js [app-ssr] (ecmascript)");
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@siyahbeyazfc.com';
        if (!vapidPublicKey || !vapidPrivateKey) {
            console.warn('[push] VAPID keys not configured, skipping real push');
            return 0;
        }
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        let sent = 0;
        for (const sub of subs){
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth_key || ''
                    }
                }, JSON.stringify({
                    title: payload.title,
                    body: payload.body,
                    icon: payload.icon || '/favicon.ico',
                    url: payload.url || '/fixture'
                }));
                sent++;
            } catch (pushErr) {
                const statusCode = pushErr?.statusCode;
                if (statusCode === 404 || statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).eq('profile_id', profileId);
                }
                console.error('[push] Gönderim hatası:', pushErr);
            }
        }
        return sent;
    } catch  {
        console.warn('[push] web-push kütüphanesi yüklenemedi, stub modunda');
        return 0;
    }
}
async function sendMatchReminder(profileId, matchInfo) {
    const venue = matchInfo.isHome ? 'EV' : 'DEP';
    const title = '⚽ Maç Hatırlatması!';
    const body = `${venue}: ${matchInfo.opponent} - ${matchInfo.matchTime} | ${matchInfo.stadium}`;
    return sendPushToProfile(profileId, {
        title,
        body,
        url: matchInfo.matchId ? `/match/${matchInfo.matchId}` : '/fixture'
    });
}
}),
"[project]/src/lib/fm/youthAcademySeasonSync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canDoSeasonIntake",
    ()=>canDoSeasonIntake,
    "generateYouthPlayersForAllTeams",
    ()=>generateYouthPlayersForAllTeams
]);
/**
 * youthAcademySeasonSync.ts
 *
 * Gençlik akademisi sezon başı üretim sistemi.
 * Yeni genç oyuncular SADECE sezon sonunda (34. hafta tamamlandığında) üretilir.
 * Haftalık cron sadece mevcut genç oyuncuların gelişimini yönetir.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/youthAcademy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/stadiumMatrix.ts [app-ssr] (ecmascript)");
;
;
/**
 * Akademi seviyesine göre sezon başı üretilecek genç oyuncu sayısı
 * Level 1: 1 oyuncu, Level 2: 1-2, Level 3: 2, Level 4: 2-3, Level 5: 3
 * Level 6: 3-4, Level 7: 3-5, Level 8: 4-5, Level 9: 5-6
 */ function getYouthCountForLevel(academyLevel) {
    const counts = {
        1: [
            1,
            1
        ],
        2: [
            1,
            2
        ],
        3: [
            2,
            2
        ],
        4: [
            2,
            3
        ],
        5: [
            3,
            3
        ],
        6: [
            3,
            4
        ],
        7: [
            3,
            5
        ],
        8: [
            4,
            5
        ],
        9: [
            5,
            6
        ],
        10: [
            6,
            7
        ]
    };
    const [min, max] = counts[academyLevel] || [
        1,
        1
    ];
    return min + Math.floor(Math.random() * (max - min + 1));
}
/**
 * user_facilities tablosundan akademi seviyesini oku.
 * facility_id = 'youth_academy' veya 'akademi' olan kaydın level'ını döndür.
 * Bulunamazsa varsayılan seviye 1.
 */ async function getAcademyLevel(supabase, profileId) {
    try {
        const { data } = await supabase.from('user_facilities').select('level').eq('profile_id', profileId).in('facility_id', [
            'youth_academy',
            'akademi',
            'academy'
        ]).order('level', {
            ascending: false
        }).limit(1).maybeSingle();
        if (data && typeof data.level === 'number') {
            return Math.max(1, Math.min(10, data.level));
        }
    } catch  {
    // Table might not exist
    }
    // Fallback: profiles tablosundan academy_level kolonu dene
    try {
        const { data: profileData } = await supabase.from('profiles').select('academy_level, youth_academy_level').eq('id', profileId).maybeSingle();
        if (profileData) {
            const level = profileData.academy_level || profileData.youth_academy_level;
            if (typeof level === 'number') return Math.max(1, Math.min(10, level));
        }
    } catch  {
    // Column might not exist
    }
    return 1; // Default level 1
}
async function generateYouthPlayersForAllTeams(supabase) {
    // 1. Tüm aktif takımları getir (league_teams üzerinden)
    const { data: leagueTeams } = await supabase.from('league_teams').select('profile_id, name').not('profile_id', 'is', null);
    if (!leagueTeams || leagueTeams.length === 0) {
        return {
            totalGenerated: 0,
            teamsProcessed: 0,
            details: []
        };
    }
    // Benzersiz profile_id'leri al
    const uniqueProfiles = Array.from(new Map(leagueTeams.filter((t)=>t.profile_id).map((t)=>[
            t.profile_id,
            t
        ])).values());
    const details = [];
    let totalGenerated = 0;
    for (const team of uniqueProfiles){
        const profileId = team.profile_id;
        const teamName = team.name;
        // Akademi seviyesini oku
        const academyLevel = await getAcademyLevel(supabase, profileId);
        const youthCount = getYouthCountForLevel(academyLevel);
        // currentWeek hesapla (sözleşme bitiş haftası için)
        const { data: profileData } = await supabase.from('profiles').select('current_day').eq('id', profileId).maybeSingle();
        const currentWeek = Math.ceil((profileData?.current_day || 1) / 7);
        // Genç oyuncuları üret
        const playersToInsert = [];
        for(let i = 0; i < youthCount; i++){
            const youthPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$youthAcademy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateYouthPlayer"])(academyLevel);
            // Apply academy quality multiplier from stadiumMatrix
            const academyQualityMultiplier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$stadiumMatrix$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAcademyQualityMultiplier"])(academyLevel);
            const boostedRating = Math.min(99, Math.round(youthPlayer.rating * academyQualityMultiplier));
            const boostedPotential = Math.min(99, Math.round((youthPlayer.hidden_potential || youthPlayer.potential || youthPlayer.rating + 15) * academyQualityMultiplier));
            // YouthPlayer → players tablosu formatına dönüştür
            const playerRow = {
                id: `youth-${profileId}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: youthPlayer.name,
                position: youthPlayer.position,
                specific_position: youthPlayer.specificPosition || youthPlayer.position,
                rating: boostedRating,
                potential: boostedPotential,
                age: youthPlayer.age,
                nation: youthPlayer.nationality || 'Türkiye',
                team_name: teamName,
                profile_id: profileId,
                market_value: youthPlayer.rating * youthPlayer.rating * 80,
                salary: Math.round(youthPlayer.rating * 100),
                speed: youthPlayer.speed ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                physical: youthPlayer.power ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                passing: youthPlayer.passing ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                shooting: youthPlayer.shooting ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                heading: youthPlayer.heading ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                goalkeeping: youthPlayer.goalkeeping ?? (youthPlayer.position === 'GK' ? youthPlayer.rating + 10 : Math.max(1, youthPlayer.rating - 30)),
                control: youthPlayer.control ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                vision: youthPlayer.vision ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                defending: youthPlayer.defending ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
                mental: youthPlayer.mental ?? youthPlayer.rating,
                cond: 100,
                morale: 80,
                is_injured: false,
                is_on_loan_market: false,
                loan_fee: 0,
                scouted: true,
                is_youth: true,
                contract_end_week: currentWeek + 34
            };
            playersToInsert.push(playerRow);
        }
        // players tablosuna ekle
        if (playersToInsert.length > 0) {
            const { error: insertError } = await supabase.from('players').insert(playersToInsert);
            if (insertError) {
                console.warn(`[youthSeasonSync] Players insert failed for ${teamName}:`, insertError.message);
            } else {
                totalGenerated += playersToInsert.length;
                details.push({
                    profileId,
                    count: playersToInsert.length
                });
            }
        }
        // youth_players tablosuna da ekle (tablo varsa)
        try {
            const youthRows = playersToInsert.map((p)=>({
                    profile_id: profileId,
                    player_id: p.id,
                    player_name: p.name,
                    position: p.position,
                    rating: p.rating,
                    potential: p.potential,
                    discovered_at: new Date().toISOString()
                }));
            await supabase.from('youth_players').insert(youthRows);
        } catch  {
        // youth_players tablosu yoksa sessizce devam et
        }
    }
    return {
        totalGenerated,
        teamsProcessed: uniqueProfiles.length,
        details
    };
}
function canDoSeasonIntake(currentWeek, seasonIntakeUsed) {
    if (currentWeek < 34) {
        return {
            canIntake: false,
            reason: `Sezon sonu alım için 34 hafta tamamlanmalı. Şu an: ${currentWeek}/34`
        };
    }
    if (seasonIntakeUsed) {
        return {
            canIntake: false,
            reason: 'Bu sezonun alımı zaten yapıldı.'
        };
    }
    return {
        canIntake: true
    };
}
}),
"[project]/src/lib/fm/cupSystem.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ════════════════════════════════════════════════════════════════
//  CUP / TOURNAMENT SYSTEM  –  Managerium FM Engine
//  Kupa turnuva yönetimi, kura çekimi, simülasyon, braket
// ════════════════════════════════════════════════════════════════
// ──────────────────────────────────────────────────────────────
//  1. TYPES
// ──────────────────────────────────────────────────────────────
__turbopack_context__.s([
    "CUP_DEFINITIONS",
    ()=>CUP_DEFINITIONS,
    "advanceCupRound",
    ()=>advanceCupRound,
    "calculateCupRevenue",
    ()=>calculateCupRevenue,
    "formatCupBracket",
    ()=>formatCupBracket,
    "generateCupDraw",
    ()=>generateCupDraw,
    "generateCupFixtures",
    ()=>generateCupFixtures,
    "generateCupNews",
    ()=>generateCupNews,
    "getCupDefinition",
    ()=>getCupDefinition,
    "getCupRoundCount",
    ()=>getCupRoundCount,
    "getCupSchedule",
    ()=>getCupSchedule,
    "getCupStandings",
    ()=>getCupStandings,
    "getCupTypeName",
    ()=>getCupTypeName,
    "getMatchWinner",
    ()=>getMatchWinner,
    "getRoundTypeName",
    ()=>getRoundTypeName,
    "getTeamDeepestRound",
    ()=>getTeamDeepestRound,
    "isTeamActive",
    ()=>isTeamActive,
    "simulateCupMatch",
    ()=>simulateCupMatch
]);
// ──────────────────────────────────────────────────────────────
//  3. HELPERS
// ──────────────────────────────────────────────────────────────
let _idCounter = 0;
function uid(prefix = 'cup') {
    _idCounter += 1;
    return `${prefix}_${_idCounter}_${Date.now().toString(36)}`;
}
/** Fisher-Yates shuffle (pure) */ function shuffle(arr) {
    const a = [
        ...arr
    ];
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [
            a[j],
            a[i]
        ];
    }
    return a;
}
/** Clamp a number to [min, max] */ function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}
/** Format a Date as YYYY-MM-DD */ function fmtDate(d) {
    return d.toISOString().slice(0, 10);
}
/** Find next Saturday from a given date (or today) */ function nextSaturday(from) {
    const d = from ? new Date(from) : new Date();
    const day = d.getDay();
    const diff = day === 6 ? 7 : (6 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(20, 0, 0, 0);
    return d;
}
/** Find next Wednesday from a given date */ function nextWednesday(from) {
    const d = from ? new Date(from) : new Date();
    const day = d.getDay();
    const diff = day === 3 ? 7 : (3 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(20, 0, 0, 0);
    return d;
}
/** Poisson-distributed random integer */ function poissonRandom(lambda) {
    if (lambda <= 0) return 0;
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k += 1;
        p *= Math.random();
    }while (p > L)
    return k - 1;
}
/** Derive a seed rank (1 = strongest) from tier & league position */ function deriveSeed(tier, leaguePosition) {
    return (tier - 1) * 20 + leaguePosition;
}
/** Calculate seed bucket (1-4) from seed rank */ function seedBucket(seed) {
    if (seed <= 8) return 1;
    if (seed <= 24) return 2;
    if (seed <= 48) return 3;
    return 4;
}
/** Turkish ordinal suffix for round names */ function turkishRoundOrdinal(n) {
    const suffixes = {
        1: 'Birinci',
        2: 'İkinci',
        3: 'Üçüncü',
        4: 'Dördüncü',
        5: 'Beşinci',
        6: 'Altıncı',
        7: 'Yedinci',
        8: 'Sekizinci'
    };
    return suffixes[n] || `${n}.`;
}
/** Check whether two teams are from the same league tier */ function sameTier(a, b, seedMap) {
    const sa = seedMap.get(a);
    const sb = seedMap.get(b);
    if (!sa || !sb) return false;
    return sa.tier === sb.tier;
}
const CUP_DEFINITIONS = [
    // ── Türkiye Kupası ──────────────────────────────────────────
    {
        id: 'turkiye_kupasi',
        name: 'Türkiye Kupası',
        nameEn: 'Turkish Cup',
        type: 'domestic_cup',
        tier: 4,
        teamsPerSeason: 64,
        rounds: [
            {
                name: '1. Tur',
                teams: 32,
                twoLegged: false
            },
            {
                name: '2. Tur',
                teams: 32,
                twoLegged: false
            },
            {
                name: '3. Tur',
                teams: 32,
                twoLegged: false
            },
            {
                name: 'Son 16',
                teams: 16,
                twoLegged: false
            },
            {
                name: 'Çeyrek Final',
                teams: 8,
                twoLegged: false
            },
            {
                name: 'Yarı Final',
                teams: 4,
                twoLegged: false
            },
            {
                name: 'Final',
                teams: 2,
                twoLegged: false
            }
        ],
        prizeMoney: 1_000_000,
        championReward: 10_000_000,
        isNeutralVenue: true
    },
    // ── Süper Kupa ──────────────────────────────────────────────
    {
        id: 'super_kupa',
        name: 'Süper Kupa',
        nameEn: 'Super Cup',
        type: 'super_cup',
        tier: 1,
        teamsPerSeason: 2,
        rounds: [
            {
                name: 'Süper Kupa',
                teams: 2,
                twoLegged: false
            }
        ],
        prizeMoney: 0,
        championReward: 2_000_000,
        isNeutralVenue: true
    },
    // ── Gençlik Kupası ──────────────────────────────────────────
    {
        id: 'genclik_kupasi',
        name: 'Gençlik Kupası',
        nameEn: 'Youth Cup',
        type: 'youth_cup',
        tier: 1,
        teamsPerSeason: 16,
        rounds: [
            {
                name: 'Son 16',
                teams: 16,
                twoLegged: false
            },
            {
                name: 'Çeyrek Final',
                teams: 8,
                twoLegged: false
            },
            {
                name: 'Yarı Final',
                teams: 4,
                twoLegged: false
            },
            {
                name: 'Final',
                teams: 2,
                twoLegged: false
            }
        ],
        prizeMoney: 100_000,
        championReward: 500_000,
        isNeutralVenue: false
    }
];
// ──────────────────────────────────────────────────────────────
//  5. MAP round definition names → RoundType
// ──────────────────────────────────────────────────────────────
function roundTypeFromName(name, roundNumber, totalRounds) {
    const lower = name.toLowerCase().replace(/\s/g, '');
    if (lower.includes('final') && roundNumber === totalRounds) return 'final';
    if (lower.includes('yarı') || lower.includes('yari') || lower === 'semifinal') return 'semi_final';
    if (lower.includes('çeyrek') || lower.includes('ceyrek') || lower === 'quarterfinal') return 'quarter_final';
    if (lower.includes('son16') || lower.includes('16')) return 'round_of_16';
    if (lower.includes('son32') || lower.includes('32')) return 'round_of_32';
    if (lower.includes('son64') || lower.includes('64')) return 'round_of_64';
    // Fallback: infer from round position
    const remaining = totalRounds - roundNumber + 1;
    if (remaining === 1) return 'final';
    if (remaining === 2) return 'semi_final';
    if (remaining === 3) return 'quarter_final';
    if (remaining === 4) return 'round_of_16';
    if (remaining === 5) return 'round_of_32';
    return 'round_of_64';
}
function generateCupDraw(teams, cupDefinition, teamSeeds, seasonYear, baseDate) {
    const year = seasonYear ?? new Date().getFullYear();
    const totalRounds = cupDefinition.rounds.length;
    // Build seed map (default: all tier 4, random position)
    const seedMap = new Map();
    if (teamSeeds) {
        for (const ts of teamSeeds)seedMap.set(ts.name, ts);
    } else {
        const shuffled = shuffle(teams.map((_, i)=>i));
        for(let i = 0; i < teams.length; i++){
            seedMap.set(teams[i], {
                name: teams[i],
                tier: 4,
                leaguePosition: shuffled[i] + 1
            });
        }
    }
    // Sort teams by seed rank (strongest = tier-1 pos-1 first)
    const sorted = [
        ...teams
    ].sort((a, b)=>{
        const sa = seedMap.get(a) ?? {
            tier: 4,
            leaguePosition: 99
        };
        const sb = seedMap.get(b) ?? {
            tier: 4,
            leaguePosition: 99
        };
        const ra = deriveSeed(sa.tier, sa.leaguePosition);
        const rb = deriveSeed(sb.tier, sb.leaguePosition);
        return ra - rb;
    });
    // ── Staggered entry allocation ──
    // Determine how many NEW teams enter at each round.
    // Round 0 is the first defined round.
    // Total new teams across all rounds must equal `teams.length`.
    const entryAlloc = computeEntryAllocation(cupDefinition, teams.length);
    const rounds = [];
    let carryOver = [];
    let assigned = new Set();
    let nextEntryIdx = 0; // index into `sorted`
    const base = baseDate ? new Date(baseDate) : new Date(year, 7, 1); // August 1
    for(let ri = 0; ri < totalRounds; ri++){
        const rd = cupDefinition.rounds[ri];
        const newEntryCount = entryAlloc[ri] ?? 0;
        // Collect new entrants for this round
        const newEntrants = [];
        for(let i = 0; i < newEntryCount && nextEntryIdx < sorted.length; i++){
            newEntrants.push(sorted[nextEntryIdx]);
            assigned.add(sorted[nextEntryIdx]);
            nextEntryIdx += 1;
        }
        const pool = [
            ...carryOver,
            ...newEntrants
        ];
        const isQuarterFinalOrLater = rd.teams <= 8 || rd.name.toLowerCase().includes('çeyrek') || rd.name.toLowerCase().includes('ceyrek') || rd.name.toLowerCase().includes('yarı') || rd.name.toLowerCase().includes('yari') || rd.name.toLowerCase().includes('final');
        // Pair up teams
        const shuffledPool = isQuarterFinalOrLater ? shuffle(pool) : seededShuffle(pool, seedMap, isQuarterFinalOrLater);
        const matches = [];
        const roundDate = findRoundDate(base, ri, cupDefinition.type);
        for(let mi = 0; mi < shuffledPool.length; mi += 2){
            const home = shuffledPool[mi];
            const away = shuffledPool[mi + 1];
            if (!away) continue; // odd team (bye) – advance directly
            matches.push({
                id: uid('match'),
                round: ri + 1,
                homeTeam: home,
                awayTeam: away,
                homeScore: null,
                awayScore: null,
                homeExtraTime: null,
                awayExtraTime: null,
                homePenalties: null,
                awayPenalties: null,
                date: fmtDate(roundDate),
                status: 'scheduled',
                venue: cupDefinition.isNeutralVenue ? 'neutral' : 'home',
                hasReplay: false
            });
        }
        // If odd number → one team gets a bye
        let byeTeam = null;
        if (shuffledPool.length % 2 === 1) {
            byeTeam = shuffledPool[shuffledPool.length - 1];
        }
        const roundEndDate = new Date(roundDate);
        roundEndDate.setDate(roundEndDate.getDate() + (rd.twoLegged ? 7 : 0));
        rounds.push({
            roundNumber: ri + 1,
            name: rd.name,
            roundType: roundTypeFromName(rd.name, ri + 1, totalRounds),
            legs: rd.twoLegged ? 'two' : 'single',
            matches,
            isCompleted: false,
            startDate: fmtDate(roundDate),
            endDate: fmtDate(roundEndDate)
        });
        // Carry-over for next round: bye team (if any) + placeholders for winners
        carryOver = byeTeam ? [
            byeTeam
        ] : [];
    }
    // ── Build participants ──
    const participants = teams.map((t)=>({
            name: t,
            eliminated: false,
            eliminatedRound: 0
        }));
    return {
        id: uid('season'),
        cupId: cupDefinition.id,
        year,
        name: cupDefinition.name,
        type: cupDefinition.type,
        rounds,
        currentRound: 1,
        participants,
        winner: null,
        runnerUp: null,
        topScorer: null,
        isCompleted: false,
        prizeMoney: cupDefinition.prizeMoney,
        championReward: cupDefinition.championReward
    };
}
/** Compute how many new teams enter at each round */ function computeEntryAllocation(def, totalTeams) {
    const n = def.rounds.length;
    const alloc = new Array(n).fill(0);
    if (totalTeams <= def.rounds[0].teams) {
        // All teams enter in round 1
        alloc[0] = totalTeams;
        return alloc;
    }
    // For staggered entry: fill from last round backwards
    // The last round takes exactly `teams` from previous winners
    // We need to ensure the number of teams entering per round makes
    // the elimination math work (each round halves its participants).
    //
    // Simplified: distribute proportionally so early rounds get more
    // lower-tier teams and later rounds get higher-tier teams.
    const lastRoundTeams = def.rounds[n - 1].teams;
    // Work backwards to figure out required winners cascade
    let requiredFromPrevious = lastRoundTeams;
    for(let i = n - 2; i >= 0; i--){
        const roundTeams = def.rounds[i].teams;
        const winnersFromThisRound = roundTeams / 2;
        // The next round needs `def.rounds[i+1].teams` teams
        const nextNeeds = def.rounds[i + 1].teams;
        // new entrants at round i+1 = nextNeeds - winnersFromThisRound
        const newAtNext = nextNeeds - winnersFromThisRound;
        alloc[i + 1] = Math.max(0, newAtNext);
        requiredFromPrevious = roundTeams;
    }
    // Round 0 gets the remainder
    const allocated = alloc.reduce((s, v)=>s + v, 0);
    alloc[0] = totalTeams - allocated;
    // Safety: ensure all numbers are non-negative
    for(let i = 0; i < n; i++)alloc[i] = Math.max(0, alloc[i]);
    // If there's still unallocated due to rounding, dump into round 0
    const sum = alloc.reduce((s, v)=>s + v, 0);
    if (sum < totalTeams) alloc[0] += totalTeams - sum;
    return alloc;
}
/** Shuffle pool trying to avoid same-tier matchups before quarter-finals */ function seededShuffle(pool, seedMap, allowSameTier) {
    if (allowSameTier || pool.length <= 2) return shuffle(pool);
    // Sort by seed bucket so different tiers are interleaved
    const buckets = new Map();
    for (const t of pool){
        const info = seedMap.get(t) ?? {
            tier: 4,
            leaguePosition: 99
        };
        const bucket = seedBucket(deriveSeed(info.tier, info.leaguePosition));
        if (!buckets.has(bucket)) buckets.set(bucket, []);
        buckets.get(bucket).push(t);
    }
    // Shuffle within each bucket
    buckets.forEach((arr)=>{
        const s = shuffle(arr);
        arr.length = 0;
        arr.push(...s);
    });
    // Interleave: pick from buckets in round-robin
    const result = [];
    const bucketKeys = Array.from(buckets.keys()).sort((a, b)=>a - b);
    let idx = 0;
    while(result.length < pool.length){
        const key = bucketKeys[idx % bucketKeys.length];
        const arr = buckets.get(key);
        if (arr.length > 0) {
            result.push(arr.shift());
        }
        idx += 1;
        // Remove empty buckets
        if (arr.length === 0) {
            buckets.delete(key);
            const bi = bucketKeys.indexOf(key);
            if (bi !== -1) bucketKeys.splice(bi, 1);
        }
    }
    // Post-process: swap any adjacent same-tier pairs if possible
    for(let i = 0; i < result.length - 1; i += 2){
        const a = result[i];
        const b = result[i + 1];
        if (sameTier(a, b, seedMap)) {
            // Try to swap b with next available different-tier team
            for(let j = i + 2; j < result.length; j++){
                if (!sameTier(a, result[j], seedMap)) {
                    [result[i + 1], result[j]] = [
                        result[j],
                        result[i + 1]
                    ];
                    break;
                }
            }
        }
    }
    return result;
}
/** Find an appropriate date for a cup round */ function findRoundDate(base, roundIndex, cupType) {
    const weekOffset = roundIndex * 2; // 2 weeks between rounds
    const d = new Date(base);
    d.setDate(d.getDate() + weekOffset * 7);
    if (cupType === 'super_cup') {
        // Super Cup is on a Saturday
        return nextSaturday(d);
    }
    // Kupa maçları hafta sonu (Cumartesi veya Pazar)
    // Çift turlar: Cumartesi, tek turlar: Pazar
    if (roundIndex % 2 === 0) {
        return nextSaturday(d);
    } else {
        // Pazar günü bul
        const sunday = new Date(d);
        const day = sunday.getDay();
        const diff = day === 0 ? 7 : (0 - day + 7) % 7;
        sunday.setDate(sunday.getDate() + (diff === 0 ? 7 : diff));
        sunday.setHours(20, 0, 0, 0);
        return sunday;
    }
}
function simulateCupMatch(homeTeam, awayTeam, homePlayers, awayPlayers, options) {
    const { date = fmtDate(new Date()), venue = 'neutral', round = 1, isNeutral = true } = options ?? {};
    // Team strength: average player rating
    const homeStrength = avgRating(homePlayers);
    const awayStrength = avgRating(awayPlayers);
    // Venue modifier: neutral → no home advantage, home → small boost
    let homeAdv = 0;
    if (!isNeutral && venue === 'home') homeAdv = 2;
    if (!isNeutral && venue === 'away') homeAdv = -2;
    // ── Regular time (90 minutes) ──
    const homeExpected = Math.max(0.3, (homeStrength + homeAdv) / 32);
    const awayExpected = Math.max(0.3, awayStrength / 32);
    const homeScore = poissonRandom(homeExpected);
    const awayScore = poissonRandom(awayExpected);
    // ── Check if draw → extra time ──
    if (homeScore === awayScore) {
        // Extra time: slightly lower expected goals (fatigue)
        const homeET = poissonRandom(homeExpected * 0.6);
        const awayET = poissonRandom(awayExpected * 0.6);
        const homeTotal = homeScore + homeET;
        const awayTotal = awayScore + awayET;
        if (homeTotal !== awayTotal) {
            return {
                id: uid('match'),
                round,
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                homeExtraTime: homeET,
                awayExtraTime: awayET,
                homePenalties: null,
                awayPenalties: null,
                date,
                status: 'extra_time',
                venue,
                hasReplay: false
            };
        }
        // Still draw → penalties
        const pens = simulatePenalties();
        return {
            id: uid('match'),
            round,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            homeExtraTime: homeET,
            awayExtraTime: awayET,
            homePenalties: pens.home,
            awayPenalties: pens.away,
            date,
            status: 'penalties',
            venue,
            hasReplay: false
        };
    }
    // ── Normal result ──
    return {
        id: uid('match'),
        round,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeExtraTime: null,
        awayExtraTime: null,
        homePenalties: null,
        awayPenalties: null,
        date,
        status: 'played',
        venue,
        hasReplay: false
    };
}
function avgRating(players) {
    if (players.length === 0) return 50;
    return players.reduce((s, p)=>s + (p.rating || 50), 0) / players.length;
}
function simulatePenalties() {
    let home = 0;
    let away = 0;
    // Best of 5
    for(let i = 0; i < 5; i++){
        if (Math.random() < 0.75) home += 1;
        if (Math.random() < 0.75) away += 1;
    }
    // Sudden death
    while(home === away){
        const hScore = Math.random() < 0.75 ? 1 : 0;
        const aScore = Math.random() < 0.75 ? 1 : 0;
        home += hScore;
        away += aScore;
    }
    return {
        home,
        away
    };
}
function getMatchWinner(match) {
    if (match.status === 'scheduled') return null;
    if (match.status === 'penalties') {
        return (match.homePenalties ?? 0) > (match.awayPenalties ?? 0) ? match.homeTeam : match.awayTeam;
    }
    // 'played' or 'extra_time'
    const h = match.homeScore ?? 0;
    const a = match.awayScore ?? 0;
    if (match.status === 'extra_time') {
        const ht = match.homeExtraTime ?? 0;
        const at = match.awayExtraTime ?? 0;
        return h + ht > a + at ? match.homeTeam : match.awayTeam;
    }
    return h > a ? match.homeTeam : h < a ? match.awayTeam : null;
}
function advanceCupRound(cupSeason, cupDefinition) {
    const updated = structuredClone(cupSeason);
    const curIdx = updated.currentRound - 1;
    const currentRound = updated.rounds[curIdx];
    if (!currentRound || !currentRound.isCompleted) {
        // If not yet completed, mark it completed
        if (currentRound) {
            currentRound.isCompleted = true;
        }
    }
    // Collect winners from the current round
    const winners = [];
    if (currentRound) {
        for (const m of currentRound.matches){
            const w = getMatchWinner(m);
            if (w) winners.push(w);
            else winners.push(m.homeTeam); // fallback
        }
    }
    // Also include bye teams (they carry over automatically — handled in generateCupDraw)
    // Mark eliminated teams
    for (const p of updated.participants){
        if (!winners.includes(p.name) && !p.eliminated) {
            // Check if they played in this round
            const played = currentRound?.matches.some((m)=>m.homeTeam === p.name || m.awayTeam === p.name);
            if (played) {
                p.eliminated = true;
                p.eliminatedRound = updated.currentRound;
            }
        }
    }
    // Check if this was the final round
    const isLastRound = updated.currentRound >= updated.rounds.length;
    if (isLastRound || winners.length <= 1) {
        updated.isCompleted = true;
        if (winners.length >= 1) updated.winner = winners[0];
        if (winners.length >= 2) updated.runnerUp = winners[1];
        if (currentRound?.matches.length === 1) {
            const fm = currentRound.matches[0];
            updated.winner = getMatchWinner(fm) ?? fm.homeTeam;
            updated.runnerUp = updated.winner === fm.homeTeam ? fm.awayTeam : fm.homeTeam;
        }
        return updated;
    }
    // ── Generate next round ──
    const nextRoundDef = cupDefinition.rounds[updated.currentRound];
    if (!nextRoundDef) {
        updated.isCompleted = true;
        return updated;
    }
    const nextDate = findRoundDate(new Date(currentRound?.startDate ?? new Date()), updated.currentRound, cupDefinition.type);
    const nextMatches = [];
    const shuffledWinners = shuffle(winners);
    const isQForLater = nextRoundDef.teams <= 8 || nextRoundDef.name.toLowerCase().includes('çeyrek') || nextRoundDef.name.toLowerCase().includes('ceyrek') || nextRoundDef.name.toLowerCase().includes('yarı') || nextRoundDef.name.toLowerCase().includes('yari') || nextRoundDef.name.toLowerCase().includes('final');
    for(let i = 0; i < shuffledWinners.length; i += 2){
        const home = shuffledWinners[i];
        const away = shuffledWinners[i + 1];
        if (!away) continue;
        nextMatches.push({
            id: uid('match'),
            round: updated.currentRound + 1,
            homeTeam: home,
            awayTeam: away,
            homeScore: null,
            awayScore: null,
            homeExtraTime: null,
            awayExtraTime: null,
            homePenalties: null,
            awayPenalties: null,
            date: fmtDate(nextDate),
            status: 'scheduled',
            venue: cupDefinition.isNeutralVenue ? 'neutral' : 'home',
            hasReplay: false
        });
    }
    const nextRound = {
        roundNumber: updated.currentRound + 1,
        name: nextRoundDef.name,
        roundType: roundTypeFromName(nextRoundDef.name, updated.currentRound + 1, cupDefinition.rounds.length),
        legs: nextRoundDef.twoLegged ? 'two' : 'single',
        matches: nextMatches,
        isCompleted: false,
        startDate: fmtDate(nextDate),
        endDate: fmtDate(new Date(nextDate.getTime() + 7 * 86400000))
    };
    updated.rounds.push(nextRound);
    updated.currentRound += 1;
    return updated;
}
function getCupSchedule(cupSeason, fromDate) {
    const now = fromDate ? new Date(fromDate) : new Date();
    const entries = [];
    for (const round of cupSeason.rounds){
        for (const match of round.matches){
            if (match.status === 'scheduled') {
                const matchDate = new Date(match.date);
                const diffMs = matchDate.getTime() - now.getTime();
                const daysUntil = Math.ceil(diffMs / 86400000);
                entries.push({
                    match,
                    roundName: round.name,
                    roundNumber: round.roundNumber,
                    daysUntilMatch: daysUntil
                });
            }
        }
    }
    entries.sort((a, b)=>a.match.date.localeCompare(b.match.date));
    return entries;
}
function getCupStandings(cupSeason) {
    const result = [];
    for (const p of cupSeason.participants){
        // Find the latest round this team played in
        let latestRound = 0;
        let latestRoundName = '';
        for (const round of cupSeason.rounds){
            const played = round.matches.some((m)=>m.homeTeam === p.name || m.awayTeam === p.name);
            if (played && round.roundNumber > latestRound) {
                latestRound = round.roundNumber;
                latestRoundName = round.name;
            }
        }
        result.push({
            name: p.name,
            roundReached: latestRound,
            roundName: latestRoundName,
            status: p.eliminated ? 'eliminated' : 'active'
        });
    }
    // Sort: active first, then by roundReached desc
    result.sort((a, b)=>{
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return b.roundReached - a.roundReached;
    });
    return result;
}
function calculateCupRevenue(cupSeason, teamName) {
    const roundPrizes = [];
    let gateReceipts = 0;
    for (const round of cupSeason.rounds){
        const played = round.matches.some((m)=>m.homeTeam === teamName || m.awayTeam === teamName);
        if (!played) continue;
        // Check if the team WON this round (advanced)
        const teamMatch = round.matches.find((m)=>m.homeTeam === teamName || m.awayTeam === teamName);
        if (!teamMatch) continue;
        const isWinner = getMatchWinner(teamMatch) === teamName;
        const isRunnerUp = !cupSeason.isCompleted ? false : cupSeason.runnerUp === teamName;
        const isChampion = cupSeason.winner === teamName;
        if (isWinner) {
            roundPrizes.push({
                round: round.roundNumber,
                roundName: round.name,
                amount: cupSeason.prizeMoney
            });
        }
        // Gate receipts for home matches
        if (teamMatch.homeTeam === teamName) {
            const baseGate = teamMatch.venue === 'home' ? 50_000 : 30_000;
            gateReceipts += baseGate;
        }
    }
    // Champion / runner-up bonus
    if (cupSeason.winner === teamName) {
        roundPrizes.push({
            round: cupSeason.rounds.length + 1,
            roundName: 'Şampiyon',
            amount: cupSeason.championReward
        });
    }
    const total = roundPrizes.reduce((s, r)=>s + r.amount, 0) + gateReceipts;
    return {
        teamName,
        cupName: cupSeason.name,
        roundPrizes,
        gateReceipts,
        total
    };
}
function generateCupNews(cupSeason, latestMatch) {
    const news = [];
    // ── If a specific match was just played ──
    if (latestMatch && latestMatch.status !== 'scheduled') {
        news.push(...newsForMatch(cupSeason, latestMatch));
    }
    // ── General cup updates ──
    if (cupSeason.isCompleted && cupSeason.winner) {
        news.push({
            id: uid('news'),
            headline: `${cupSeason.name} Şampiyonu: ${cupSeason.winner}!`,
            body: `${cupSeason.name} finalinde büyük zafer! ${cupSeason.winner}, ${cupSeason.runnerUp ?? 'rakibini'} mağlup ederek kupayı kaldırdı. Taraftarlar sokaklara döküldü!`,
            date: fmtDate(new Date()),
            type: 'winner',
            importance: 'critical',
            teams: [
                cupSeason.winner,
                cupSeason.runnerUp ?? ''
            ].filter(Boolean)
        });
    }
    // ── Upcoming round预告 ──
    const upcoming = getCupSchedule(cupSeason);
    if (upcoming.length > 0 && !cupSeason.isCompleted) {
        const nextMatch = upcoming[0];
        news.push({
            id: uid('news'),
            headline: `${cupSeason.name} ${nextMatch.roundName} maçları yaklaşıyor`,
            body: `${nextMatch.roundName} turunda ${nextMatch.match.homeTeam} vs ${nextMatch.match.awayTeam} maçı heyecanla bekleniyor. Kura sonuçları açıklandı!`,
            date: fmtDate(new Date()),
            type: 'upcoming',
            importance: 'low',
            teams: [
                nextMatch.match.homeTeam,
                nextMatch.match.awayTeam
            ]
        });
    }
    return news;
}
function newsForMatch(cupSeason, match) {
    const items = [];
    const roundName = cupSeason.rounds.find((r)=>r.roundNumber === match.round)?.name ?? '';
    const isFinal = match.status !== 'scheduled' && cupSeason.rounds.find((r)=>r.roundNumber === match.round)?.roundType === 'final';
    const h = match.homeScore ?? 0;
    const a = match.awayScore ?? 0;
    if (match.status === 'penalties') {
        const winner = getMatchWinner(match);
        items.push({
            id: uid('news'),
            headline: `Penaltı atışları nefes kesti! ${winner} ${roundName}'a yükseldi`,
            body: `${match.homeTeam} ${h}-${a} ${match.awayTeam} sonucu uzatma dakikalarında eşitliği bozamadı. Penaltı atışlarında skor ${match.homePenalties}-${match.awayPenalties} oldu. ${winner} büyük bir çekişmeden galip ayrıldı!`,
            date: match.date,
            type: 'penalty_drama',
            importance: isFinal ? 'critical' : 'high',
            teams: [
                match.homeTeam,
                match.awayTeam
            ]
        });
    } else if (match.status === 'extra_time') {
        const winner = getMatchWinner(match);
        items.push({
            id: uid('news'),
            headline: `Uzatmalarda kırılma anı! ${winner} ${roundName}'a adını yazdırdı`,
            body: `${match.homeTeam} ${h}(${match.homeExtraTime})-${a}(${match.awayExtraTime}) ${match.awayTeam}. Uzatma dakikalarında ${winner} bulduğu gollerle tur atladı. Maç son derece çekişmeli geçti!`,
            date: match.date,
            type: 'result',
            importance: isFinal ? 'critical' : 'medium',
            teams: [
                match.homeTeam,
                match.awayTeam
            ]
        });
    } else if (match.status === 'played') {
        const winner = getMatchWinner(match);
        const goalDiff = Math.abs(h - a);
        // Giant-killing detection: check tier difference
        const homeSeed = cupSeason.participants.find((p)=>p.name === match.homeTeam);
        const awaySeed = cupSeason.participants.find((p)=>p.name === match.awayTeam);
        // Heuristic upset: 3+ goal difference
        if (goalDiff >= 3) {
            const loser = winner === match.homeTeam ? match.awayTeam : match.homeTeam;
            items.push({
                id: uid('news'),
                headline: `${roundName} sürprizi! ${winner}, ${loser}'u ${h}-${a} ile geçti`,
                body: `${roundName} turunda büyük bir sürpriz yaşandı. ${winner}, ${loser} karşısında ${goalDiff} farklı galibiyet aldı. ${loser} taraftarları şoke oldu!`,
                date: match.date,
                type: 'upset',
                importance: isFinal ? 'critical' : 'high',
                teams: [
                    match.homeTeam,
                    match.awayTeam
                ]
            });
        } else {
            items.push({
                id: uid('news'),
                headline: `${match.homeTeam} ${h}-${a} ${match.awayTeam} | ${roundName} sonucu`,
                body: `${roundName} turunda ${match.homeTeam} ile ${match.awayTeam} karşı karşıya geldi. Maç ${h}-${a} sona erdi${winner ? ` ve ${winner} tur atladı` : ''}.`,
                date: match.date,
                type: 'result',
                importance: isFinal ? 'critical' : 'medium',
                teams: [
                    match.homeTeam,
                    match.awayTeam
                ]
            });
        }
    }
    return items;
}
function formatCupBracket(cupSeason) {
    const rounds = [];
    for (const round of cupSeason.rounds){
        const matches = round.matches.map((m)=>{
            let winner = null;
            if (m.status !== 'scheduled') {
                winner = getMatchWinner(m);
            }
            return {
                id: m.id,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                homeExtraTime: m.homeExtraTime,
                awayExtraTime: m.awayExtraTime,
                homePenalties: m.homePenalties,
                awayPenalties: m.awayPenalties,
                winner
            };
        });
        rounds.push({
            name: round.name,
            roundNumber: round.roundNumber,
            matches
        });
    }
    return {
        cupId: cupSeason.cupId,
        cupName: cupSeason.name,
        year: cupSeason.year,
        rounds
    };
}
function getCupDefinition(id) {
    return CUP_DEFINITIONS.find((d)=>d.id === id);
}
function getCupRoundCount(def) {
    return def.rounds.length;
}
function getRoundTypeName(rt) {
    const map = {
        round_of_64: '64 Turu',
        round_of_32: '32 Turu',
        round_of_16: 'Son 16',
        quarter_final: 'Çeyrek Final',
        semi_final: 'Yarı Final',
        final: 'Final'
    };
    return map[rt] ?? rt;
}
function getCupTypeName(ct) {
    const map = {
        domestic_cup: 'Kupa',
        super_cup: 'Süper Kupa',
        continental: 'Kıtalararası',
        youth_cup: 'Gençlik Kupası'
    };
    return map[ct] ?? ct;
}
function isTeamActive(cupSeason, teamName) {
    const p = cupSeason.participants.find((pp)=>pp.name === teamName);
    if (!p) return false;
    return !p.eliminated;
}
function getTeamDeepestRound(cupSeason, teamName) {
    let deepest = {
        roundNumber: 0,
        roundName: ''
    };
    for (const round of cupSeason.rounds){
        const played = round.matches.some((m)=>m.homeTeam === teamName || m.awayTeam === teamName);
        if (played && round.roundNumber > deepest.roundNumber) {
            deepest = {
                roundNumber: round.roundNumber,
                roundName: round.name
            };
        }
    }
    return deepest;
}
function generateCupFixtures(cupSeason, seasonId) {
    const fixtures = [];
    for (const round of cupSeason.rounds){
        for (const match of round.matches){
            if (match.status !== 'scheduled') continue;
            fixtures.push({
                home_team_id: match.homeTeam,
                away_team_id: match.awayTeam,
                season_id: seasonId,
                tur: round.roundNumber,
                match_date: match.date,
                match_time: '20:00',
                status: 'scheduled',
                competition_type: 'cup'
            });
        }
    }
    return fixtures;
}
}),
"[project]/src/lib/fm/useEmotionalEvents.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEmotionalEvents",
    ()=>useEmotionalEvents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$MatchContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/MatchContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/sound.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function useEmotionalEvents() {
    const { matchState } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$MatchContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMatchContext"])();
    // Gol kutlama state
    const [goalCelebrationTrigger, setGoalCelebrationTrigger] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [goalScorer, setGoalScorer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [goalMinute, setGoalMinute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    // Maç olaylarını dinle ve gol kutlamasını tetikle
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!matchState.isActive || !matchState.result?.events) return;
        const events = matchState.result.events;
        const lastEvent = events[events.length - 1];
        if (lastEvent?.type === 'GOAL' && lastEvent.team === 'HOME') {
            setGoalScorer(lastEvent.player);
            setGoalMinute(lastEvent.minute);
            setGoalCelebrationTrigger(true);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSound"])('goal');
            setTimeout(()=>setGoalCelebrationTrigger(false), 2600);
        }
    }, [
        matchState.result?.events?.length,
        matchState.isActive
    ]);
    return {
        goalCelebrationTrigger,
        setGoalCelebrationTrigger,
        goalScorer,
        goalMinute
    };
}
}),
"[project]/src/lib/fm/useOnboarding.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useOnboarding",
    ()=>useOnboarding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$OnboardingTutorial$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/OnboardingTutorial.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function useOnboarding(profileId) {
    const [showOnboarding, setShowOnboarding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (profileId) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$OnboardingTutorial$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldShowOnboarding"])(profileId).then(setShowOnboarding);
        }
    }, [
        profileId
    ]);
    return {
        showOnboarding,
        setShowOnboarding
    };
}
}),
];

//# sourceMappingURL=src_lib_f2f1d27e._.js.map