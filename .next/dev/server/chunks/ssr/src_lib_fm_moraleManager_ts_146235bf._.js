module.exports = [
"[project]/src/lib/fm/moraleManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Managerium — Moral ve Özgüven Yönetim Sistemi
// =============================================================================
// Maç sonuçlarına, bireysel performansa ve kulüp olaylarına göre
// oyuncuların moral ve özgüven değerlerini günceller.
// =============================================================================
__turbopack_context__.s([
    "calculateConfidenceChange",
    ()=>calculateConfidenceChange,
    "calculateMoraleChange",
    ()=>calculateMoraleChange,
    "calculateTeamMoraleUpdates",
    ()=>calculateTeamMoraleUpdates,
    "getMoraleNotificationText",
    ()=>getMoraleNotificationText,
    "saveMoraleUpdates",
    ()=>saveMoraleUpdates
]);
// ─── Moral Değişim Sabitleri ─────────────────────────────────────────────────
const MORALE_GAINS = {
    MATCH_WIN: 8,
    MATCH_DRAW: 2,
    MATCH_LOSS: -5,
    CONSECUTIVE_LOSSES_5: -20,
    KEY_PLAYER_SOLD: -10,
    GOAL_SCORED: 3,
    ASSIST_MADE: 2,
    CLEAN_SHEET_DEF: 4,
    RED_CARD: -8,
    INJURY: -5,
    PROMOTION: 10,
    RELEGATION: -15,
    NEW_SIGNING: 5
};
const CONFIDENCE_GAINS = {
    HIGH_RATING: 6,
    GOOD_RATING: 3,
    POOR_RATING: -4,
    VERY_POOR_RATING: -8,
    PENALTY_SCORED: 5,
    PENALTY_MISSED: -6,
    LATE_GOAL_CONCEDED: -3,
    COMEBACK_WIN: 5
};
function calculateMoraleChange(player, outcome) {
    let delta = 0;
    // Maç sonucu etkisi
    if (outcome.result === 'W') delta += MORALE_GAINS.MATCH_WIN;
    else if (outcome.result === 'D') delta += MORALE_GAINS.MATCH_DRAW;
    else delta += MORALE_GAINS.MATCH_LOSS;
    // Üst üste kayıp cezası
    if (outcome.consecutiveLosses && outcome.consecutiveLosses >= 5 && outcome.result === 'L') {
        delta += MORALE_GAINS.CONSECUTIVE_LOSSES_5;
    }
    // Kişisel performans
    if (outcome.goalScorers.includes(player.id)) {
        delta += MORALE_GAINS.GOAL_SCORED;
    }
    if (outcome.assisters.includes(player.id)) {
        delta += MORALE_GAINS.ASSIST_MADE;
    }
    if (outcome.redCarded.includes(player.id)) {
        delta += MORALE_GAINS.RED_CARD;
    }
    if (outcome.injured.includes(player.id)) {
        delta += MORALE_GAINS.INJURY;
    }
    // Kaleci ve savunma için clean sheet bonus
    if (outcome.result !== 'L') {
        const oppScore = outcome.isHome ? outcome.awayScore : outcome.homeScore;
        if (oppScore === 0 && (player.position === 'GK' || player.position === 'DEF')) {
            delta += MORALE_GAINS.CLEAN_SHEET_DEF;
        }
    }
    // Geriden gelip kazanma
    if (outcome.result === 'W') {
        const myScore = outcome.isHome ? outcome.homeScore : outcome.awayScore;
        const oppScore = outcome.isHome ? outcome.awayScore : outcome.homeScore;
        // İlk yarı gerideydi mi bilmiyoruz ama ikinci yarı gol çoksa bonus
        if (myScore >= 3) delta += 2;
    }
    return clampMorale(player.morale + delta);
}
function calculateConfidenceChange(player, matchRating) {
    let delta = 0;
    if (matchRating >= 8.0) delta += CONFIDENCE_GAINS.HIGH_RATING;
    else if (matchRating >= 7.0) delta += CONFIDENCE_GAINS.GOOD_RATING;
    else if (matchRating < 5.0) delta += CONFIDENCE_GAINS.VERY_POOR_RATING;
    else if (matchRating < 6.0) delta += CONFIDENCE_GAINS.POOR_RATING;
    return clampConfidence(player.confidence + delta);
}
function calculateTeamMoraleUpdates(squad, outcome) {
    return squad.map((player)=>{
        const newMorale = calculateMoraleChange(player, outcome);
        const rating = outcome.playerRatings[player.id] || 6.0;
        const newConfidence = calculateConfidenceChange(player, rating);
        return {
            playerId: player.id,
            morale: newMorale,
            confidence: newConfidence,
            moraleDelta: newMorale - player.morale,
            confidenceDelta: newConfidence - player.confidence,
            needsNotification: newMorale < 20 && player.morale >= 20
        };
    });
}
function getMoraleNotificationText(moraleUpdates) {
    const lowMoraleCount = moraleUpdates.filter((u)=>u.morale < 20).length;
    if (lowMoraleCount >= 3) {
        return 'Soyunma odasında huzursuzluk var! Oyuncularınız motive değil. Birkaç oyuncunun moralı çok düşük.';
    }
    if (lowMoraleCount >= 1) {
        return 'Bazı oyuncuların moralı tehlike seviyesinde. Motivasyon çalışmalarına ağırlık verin.';
    }
    return null;
}
async function saveMoraleUpdates(updates, supabase) {
    let saved = 0;
    let failed = 0;
    for (const update of updates){
        try {
            const { error } = await supabase.from('players').update({
                morale: update.morale,
                confidence: update.confidence
            }).eq('id', update.playerId);
            if (error) failed++;
            else saved++;
        } catch  {
            failed++;
        }
    }
    return {
        saved,
        failed
    };
}
// ─── Yardımcılar ────────────────────────────────────────────────────────────
function clampMorale(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function clampConfidence(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
}),
];

//# sourceMappingURL=src_lib_fm_moraleManager_ts_146235bf._.js.map