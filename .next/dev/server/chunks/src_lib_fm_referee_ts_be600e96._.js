module.exports = [
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
];

//# sourceMappingURL=src_lib_fm_referee_ts_be600e96._.js.map