// ═══════════════════════════════════════════════════════════════════
//  Managerium – Media & Press System
//  News generation, motivation phrases, headlines
// ═══════════════════════════════════════════════════════════════════

import type { Player, Profile } from './types';
import { kaptanMi } from './sharedUtils';

// ─── Enums / Union Types ─────────────────────────────────────────

export type MessageType =
  | 'news'
  | 'rumor'
  | 'transfer'
  | 'injury'
  | 'praise'
  | 'criticism'
  | 'milestone';

// ─── Interfaces ──────────────────────────────────────────────────

export interface MediaMessage {
  id: string;
  type: MessageType;
  headline: string;        // Turkish
  body: string;            // Turkish
  date: string;            // ISO date string
  importance: 1 | 2 | 3 | 4 | 5;
  teamImpact: {
    morale: number;
    reputation: number;
    fanMood: number;
  };
}

export interface MotivationEffect {
  moraleAdjustment: number;
  confidenceAdjustment: number;
}

// ─── ID Generator ────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36).slice(-4);
}

// ═══════════════════════════════════════════════════════════════════
//  Weekly News Generation
// ═══════════════════════════════════════════════════════════════════

export interface WeeklyNewsOptions {
  profile: Profile;
  lastMatch?: {
    result: 'win' | 'draw' | 'loss';
    opponentName: string;
    goalsFor: number;
    goalsAgainst: number;
  };
  transfers?: { type: 'in' | 'out'; playerName: string; club: string; fee?: number }[];
  leaguePosition?: number;
  tier?: number;
  topPlayer?: { name?: string; goals?: number; rating?: number; position?: string };
}

/**
 * Generates 3–7 media messages for the week.
 */
export function generateWeeklyNews(options: WeeklyNewsOptions): MediaMessage[] {
  const messages: MediaMessage[] = [];
  const {
    profile,
    lastMatch,
    transfers,
    leaguePosition = 10,
    tier = 1,
    topPlayer,
  } = options;

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
        `ZAFER! ${teamName} SEYIRCİSİNİ MUTLU ETTİ!`,
      ];
      messages.push({
        id: uid(),
        type: 'praise',
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        body: `${teamName}, ${opponentName} karşısında ${goalsFor}-${goalsAgainst}'lık etkileyici bir galibiyet elde etti. Takım, sahada gösterdiği performansla taraftarını coşturdu.`,
        date: now,
        importance: (goalsFor - goalsAgainst >= 3 ? 4 : 3) as 1 | 2 | 3 | 4 | 5,
        teamImpact: { morale: 8, reputation: 2, fanMood: 12 },
      });
    } else if (result === 'loss') {
      const headlines = [
        `${teamName} ${opponentName} KARŞISINDA YIKILDI!`,
        `ACI MAĞLUBİYET: ${goalsFor}-${goalsAgainst}`,
        `KRİZ BÜYÜYOR! ${teamName} PUAN KAYBETTİ!`,
        `${opponentName}, ${teamName}'I EZDİ GEÇTİ!`,
      ];
      messages.push({
        id: uid(),
        type: 'criticism',
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        body: `${teamName}, ${opponentName} deplasmanında ${goalsFor}-${goalsAgainst} mağlup oldu. Performans eleştirilerin odağında.`,
        date: now,
        importance: (goalsAgainst - goalsFor >= 3 ? 4 : 3) as 1 | 2 | 3 | 4 | 5,
        teamImpact: { morale: -10, reputation: -3, fanMood: -15 },
      });
    } else {
      const headlines = [
        `${teamName} – ${opponentName}: ${goalsFor}-${goalsAgainst} BERABERLİK`,
        `PUANLAR PAYLAŞILDI! ${teamName} KAZANAMADI!`,
        `ORTA SAHA SAVAŞI: ${goalsFor}-${goalsAgainst} SONUÇ`,
      ];
      messages.push({
        id: uid(),
        type: 'news',
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        body: `${teamName} ile ${opponentName} arasındaki maç ${goalsFor}-${goalsAgainst} berabere bitti. Her iki takım da bir puana razı görünmedi.`,
        date: now,
        importance: 2,
        teamImpact: { morale: -2, reputation: 0, fanMood: -3 },
      });
    }
  }

  // ── Transfer News ─────────────────────────────────────────────
  if (transfers && transfers.length > 0) {
    for (const tr of transfers) {
      if (tr.type === 'in') {
        const headlines = [
          `${teamName.toUpperCase()}'A BÜYÜK TRANSFER!`,
          `YILDIZ OYUNCU ${teamName}'DA!`,
          `${tr.playerName} RESMEN İMZALADI!`,
          `TRANSFER HABERİ: ${tr.playerName} ${teamName}'A GELDİ!`,
        ];
        messages.push({
          id: uid(),
          type: 'transfer',
          headline: headlines[Math.floor(Math.random() * headlines.length)],
          body: `${teamName}, ${tr.club} kulübünden ${tr.playerName}'ı kadrosuna kattı${tr.fee ? ` (${tr.fee.toLocaleString('tr-TR')} €)` : ''}. Taraftarlar transferden memnun.`,
          date: now,
          importance: 4,
          teamImpact: { morale: 5, reputation: 3, fanMood: 8 },
        });
      } else {
        const headlines = [
          `${tr.playerName} ${teamName}'DAN AYRILDI!`,
          `VEDALAŞMA: ${tr.playerName} GİDİYOR!`,
          `${teamName}, ${tr.playerName}'I ${tr.club}'E SATTI!`,
        ];
        messages.push({
          id: uid(),
          type: 'transfer',
          headline: headlines[Math.floor(Math.random() * headlines.length)],
          body: `${teamName}, ${tr.playerName} ile yollarını ayırdı. Oyuncu ${tr.club} kulübüne${tr.fee ? ` ${tr.fee.toLocaleString('tr-TR')} € karşılığında` : ''} transfer oldu.`,
          date: now,
          importance: 3,
          teamImpact: { morale: -3, reputation: -1, fanMood: -5 },
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
      importance: leaguePosition === 1 ? (5 as const) : (3 as const),
      teamImpact: { morale: 5, reputation: 4, fanMood: 8 },
    });
  } else if (leaguePosition >= 16 && tier <= 3) {
    messages.push({
      id: uid(),
      type: 'criticism',
      headline: `${teamName.toUpperCase()} DÜŞME HATTINDA!`,
      body: `${teamName}, ligde ${leaguePosition}. sırada yer alıyor. Düşme potasında tehlike çanları çalıyor.`,
      date: now,
      importance: 4,
      teamImpact: { morale: -8, reputation: -3, fanMood: -12 },
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
      teamImpact: { morale: -4, reputation: -2, fanMood: -6 },
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
      teamImpact: { morale: 5, reputation: 3, fanMood: 10 },
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
      teamImpact: { morale: 3, reputation: 2, fanMood: 5 },
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
      teamImpact: { morale: -2, reputation: 0, fanMood: -2 },
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
      teamImpact: { morale: 2, reputation: 1, fanMood: 4 },
    });
  }

  // ── Top Player News ────────────────────────────────────────
  if (topPlayer) {
    const p = topPlayer;
    const playerName = p.name?.split(' ').pop() || p.name || 'Yıldız';
    if ((p.goals || 0) >= 2) {
      messages.push({
        id: uid(),
        type: 'praise',
        headline: `${playerName.toUpperCase()} ŞOVUNU YAPTI! ${p.goals} GOL!`,
        body: `${teamName}'in yıldızı ${p.name || playerName}, bu sezon ${p.goals || 0} gol sayısına ulaştı. Taraftarlar onu sevgisiyle tezahür etti.`,
        date: now,
        importance: 4,
        teamImpact: { morale: 5, reputation: 3, fanMood: 8 },
      });
    } else if ((p.rating || 0) > 7.5) {
      messages.push({
        id: uid(),
        type: 'praise',
        headline: `${playerName.toUpperCase()} MAÇIN ADAMIYDI!`,
        body: `${p.name || playerName} bu haftaki performansıyla ${(p.rating || 0).toFixed(1)} puan aldı. Formdaki ${p.position || 'oyuncu'} takımın en kritik ismi olmaya devam ediyor.`,
        date: now,
        importance: 3,
        teamImpact: { morale: 4, reputation: 2, fanMood: 6 },
      });
    }
  }

  // ── Düşme/Çıkma Baskısı ──────────────────────────────────
  if (leaguePosition && leaguePosition >= 16) {
    messages.push({
      id: uid(),
      type: 'criticism',
      headline: `${teamName.toUpperCase()} KRİZE DOĞRU GİDİYOR!`,
      body: `${leaguePosition}. sıradaki ${teamName}, küme düşme hattına yakın oynamaya devam ediyor. Teknik kadro baskı altında.`,
      date: now,
      importance: 4,
      teamImpact: { morale: -5, reputation: -2, fanMood: -8 },
    });
  }

  if (leaguePosition && leaguePosition <= 2) {
    messages.push({
      id: uid(),
      type: 'praise',
      headline: `ŞAMPİYONLUK KOŞUSU! ${teamName.toUpperCase()} ZIRVEDE!`,
      body: `${leaguePosition}. sıradaki ${teamName} şampiyonluk yarışında en güçlü aday konumuna geldi. Taraftarlar büyük finali bekliyor.`,
      date: now,
      importance: 5,
      teamImpact: { morale: 8, reputation: 5, fanMood: 15 },
    });
  }

  // Ensure minimum 3 messages
  if (messages.length < 3) {
    const fillerHeadlines = [
      { h: `${teamName} HAFTA SONU HAZIRLIKLARINA BAŞLADI`, type: 'news' as MessageType, impact: { morale: 1, reputation: 0, fanMood: 1 } },
      { h: `LİGDE HAFTANIN ANALİZİ: ${teamName} NEREDE?`, type: 'news' as MessageType, impact: { morale: 0, reputation: 0, fanMood: 0 } },
      { h: `ALTYAPI HABERLERİ: GENÇ YILDIZLAR YOLUNDA`, type: 'milestone' as MessageType, impact: { morale: 2, reputation: 1, fanMood: 2 } },
      { h: `STADYUM BAKIM ÇALIŞMALARI SÜRÜYOR`, type: 'news' as MessageType, impact: { morale: 0, reputation: 0, fanMood: 0 } },
    ];
    const needed = 3 - messages.length;
    for (let i = 0; i < needed; i++) {
      const filler = fillerHeadlines[i % fillerHeadlines.length];
      messages.push({
        id: uid(),
        type: filler.type,
        headline: filler.h,
        body: `${teamName} ile ilgili son gelişmeler ve haftalık özet.`,
        date: now,
        importance: 1,
        teamImpact: filler.impact,
      });
    }
  }

  return messages;
}

// ═══════════════════════════════════════════════════════════════════
//  Motivation Phrases (Turkish)
// ═══════════════════════════════════════════════════════════════════

export const MOTIVATION_PHRASES = {
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
    'İnanın, savaşın, kazanın!',
  ],
  halftime_leading: [
    'Aynı oyunu sürdürün, rahat olun!',
    'Harika ilk yarı! Ama dikkat, maç bitmedi!',
    'Bu oyunu devam ettirin, şampiyon gibi oynayın!',
    'Bravo! Ama ikinci yarıda da aynı konsantrasyonu gösterin!',
    'İyi gidiyoruz, tempo düşmesin!',
    'Gol daha atabiliriz, açılın!',
  ],
  halftime_trailing: [
    'Hadi toparlanın, hâlâ şansımız var!',
    'Maç bitmedi! Kafaları kaldırın!',
    'İkinci yarı bizim olacak, inanın bana!',
    'Savunmayı sıkın ama forveti unutmayın!',
    'Cesur olun! Risk almak zorundayız!',
    'Bu takım karakterini her zaman göstermiştir!',
    'Daha fazlasını verin, taraftar sizi bekliyor!',
  ],
  post_win: [
    'Harika bir takım performansı!',
    'Gurur duyuyorum, herkes emeğinin karşılığını aldı!',
    'Bu takım sınırlarını zorluyor!',
    'Taraftarımıza layık bir galibiyet!',
    'İleride bu zaferi hatırlayacağız!',
  ],
  post_loss: [
    'Bu sadece bir maç, sezon daha uzun.',
    'Başarısızlık geçicidir, karakter kalıcıdır.',
    'Toparlanacağız, bu takım daha güçlü dönecek!',
    'Düşünmek için zaman var, sonra çalışmaya devam.',
    'Moralinizi bozmayın, bir sonraki maçta göstereceğiz!',
  ],
  post_draw: [
    'İyisiyle kötüsüyle geçti. Daha iyisini yapacağız.',
    'Bir puan kötü değil ama daha fazlasını hakediyorduk.',
    'Kendimize güvenelim, gelişiyoruz.',
  ],
  defensive_praise: [
    'Kale duvar gibi! Harika savunma!',
    'Dört duvar ördünüz, bravo!',
    'Savunma milli takım seviyesinde!',
  ],
  attacking_praise: [
    'Forvet hattı alev alev! Golün devamı gelir!',
    'Hücumda harikalar yarattınız!',
    'Rakip savunması çöktü, muhteşem!',
  ],
  injury_encouragement: [
    'Sahada olmasan bile kalbin bizimle!',
    'Güçlü dön, bekliyoruz!',
    'Sakatlık geçici, kahramanlık kalıcı!',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════
//  Motivation Bonus Calculation
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculates morale and confidence adjustments from a motivation phrase.
 *
 * Captain and high-leadership players receive amplified effects.
 */
export function calculateMotivationBonus(
  motivationPhrase: string,
  squad: Player[],
): MotivationEffect & { playerAdjustments: Record<string, MotivationEffect> } {
  // Determine phrase category for base effect
  let baseMorale = 3;
  let baseConfidence = 2;

  if (MOTIVATION_PHRASES.pre_match.includes(motivationPhrase as any)) {
    baseMorale = 5;
    baseConfidence = 4;
  } else if (MOTIVATION_PHRASES.halftime_leading.includes(motivationPhrase as any)) {
    baseMorale = 6;
    baseConfidence = 5;
  } else if (MOTIVATION_PHRASES.halftime_trailing.includes(motivationPhrase as any)) {
    baseMorale = 4;
    baseConfidence = 3;
  } else if (MOTIVATION_PHRASES.post_win.includes(motivationPhrase as any)) {
    baseMorale = 8;
    baseConfidence = 6;
  } else if (MOTIVATION_PHRASES.post_loss.includes(motivationPhrase as any)) {
    baseMorale = 2;
    baseConfidence = 1;
  } else if (MOTIVATION_PHRASES.defensive_praise.includes(motivationPhrase as any)) {
    baseMorale = 5;
    baseConfidence = 4;
  } else if (MOTIVATION_PHRASES.attacking_praise.includes(motivationPhrase as any)) {
    baseMorale = 6;
    baseConfidence = 7;
  } else if (MOTIVATION_PHRASES.injury_encouragement.includes(motivationPhrase as any)) {
    baseMorale = 3;
    baseConfidence = 2;
  }

  // Detect "intense" phrases by keyword
  const intenseKeywords = ['zorundayız', 'savaş', 'kazanacağız', 'tarih', 'karakter'];
  const isIntense = intenseKeywords.some((kw) => motivationPhrase.includes(kw));
  if (isIntense) {
    baseMorale += 2;
    baseConfidence += 1;
  }

  // Detect "calm" phrases
  const calmKeywords = ['rahat', 'aynı', 'daha uzun', 'sınırlarını'];
  const isCalm = calmKeywords.some((kw) => motivationPhrase.includes(kw));
  if (isCalm) {
    baseConfidence += 2;
  }

  const playerAdjustments: Record<string, MotivationEffect> = {};

  for (const player of squad) {
    const leadership = player.leadership ?? 50;
    const isCaptain = kaptanMi(player.special_role);

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
      confidenceAdjustment: Math.round(baseConfidence * amplification * mentalBonus),
    };
  }

  // Average effect across the squad
  const avgMorale = Math.round(
    Object.values(playerAdjustments).reduce((s, a) => s + a.moraleAdjustment, 0) / (squad.length || 1),
  );
  const avgConfidence = Math.round(
    Object.values(playerAdjustments).reduce((s, a) => s + a.confidenceAdjustment, 0) / (squad.length || 1),
  );

  return {
    moraleAdjustment: avgMorale,
    confidenceAdjustment: avgConfidence,
    playerAdjustments,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Media Headline Generation
// ═══════════════════════════════════════════════════════════════════

export interface HeadlineEvent {
  type: 'match_result' | 'transfer_in' | 'transfer_out' | 'injury' | 'milestone' | 'derby';
  teamName: string;
  opponentName?: string;
  score?: { home: number; away: number };
  isWin?: boolean;
  isDerby?: boolean;
  playerName?: string;
  fee?: number;
  milestoneText?: string;
}

/**
 * Generates a catchy Turkish newspaper headline based on an event.
 */
export function generateMediaHeadline(event: HeadlineEvent): string {
  const { type, teamName } = event;

  switch (type) {
    case 'match_result': {
      if (event.isWin && event.score) {
        const { home, away } = event.score;
        const diff = Math.abs(home - away);
        if (diff >= 4) {
          const headlines = [
            `${teamName.toUpperCase()} RAKİBİNİ EZDİ GEÇTİ! ${home}-${away}`,
            `${home}-${away} TARIHİ HEZİMET! ${teamName.toUpperCase()} FIRTINA GİBİ ESTİ!`,
            `${teamName.toUpperCase()} SAHADA KATLIAM YAPTI: ${home}-${away}!`,
          ];
          return headlines[Math.floor(Math.random() * headlines.length)];
        } else if (diff >= 2) {
          const headlines = [
            `${teamName.toUpperCase()} GÜÇLÜ RAKİBİNİ YIKTI! ${home}-${away}`,
            `${home}-${away}: ${teamName} SAHADAN GALİP AYRILDI!`,
            `FIRTINA GİBİ ESTİK! ${event.opponentName} MAĞLUP!`,
          ];
          return headlines[Math.floor(Math.random() * headlines.length)];
        } else {
          const headlines = [
            `${teamName} SINIRI AŞTI: ${home}-${away}`,
            `${home}-${away}: ${teamName} KOLAY GEÇMADI!`,
            `KRİTİK 3 PUAN: ${teamName} KAZANDI!`,
          ];
          return headlines[Math.floor(Math.random() * headlines.length)];
        }
      } else if (!event.isWin && event.isWin !== undefined && event.score) {
        const { home, away } = event.score;
        const headlines = [
          `${teamName.toUpperCase()} ${event.opponentName} KARŞISINDA YIKILDI!`,
          `ACI MAĞLUBİYET: ${home}-${away}`,
          `${teamName.toUpperCase()} PUAN KAYBETTİ!`,
          `KARANLIK GÜN: ${home}-${away} MAĞLUBİYET`,
        ];
        return headlines[Math.floor(Math.random() * headlines.length)];
      } else {
        return `${teamName} – ${event.opponentName}: ${event.score?.home ?? 0}-${event.score?.away ?? 0} BERABERLİK`;
      }
    }

    case 'transfer_in': {
      const feeText = event.fee ? ` ${event.fee.toLocaleString('tr-TR')} Kredi` : '';
      const headlines = [
        `${teamName.toUpperCase()}'A BOMBA TRANSFER!`,
        `YILDIZ TRANSFERİ KAPIDA! ${event.playerName?.toUpperCase()} GELİYOR${feeText}!`,
        `${teamName.toUpperCase()} TARİHİ TRANSFER YAPTI!`,
        `${event.playerName?.toUpperCase()} RESMEN ${teamName.toUpperCase()}'DA!`,
        `TRANSFER HABERİ: ${event.playerName} İMZALADI${feeText}!`,
      ];
      return headlines[Math.floor(Math.random() * headlines.length)];
    }

    case 'transfer_out': {
      const feeText = event.fee ? ` ${event.fee.toLocaleString('tr-TR')} €'ye` : '';
      const headlines = [
        `${event.playerName?.toUpperCase()} ${teamName}'DAN AYRILIYOR!`,
        `VEDALAŞMA: ${event.playerName} GİDİYOR${feeText}!`,
        `${teamName}, ${event.playerName}'I SATIYOR!`,
        `ŞOK TRANSFER: ${event.playerName} KULÜPTEN GİDİYOR!`,
      ];
      return headlines[Math.floor(Math.random() * headlines.length)];
    }

    case 'injury': {
      const headlines = [
        `${teamName.toUpperCase()} SAKATLIK FIRTINASINA GİRDİ!`,
        `${event.playerName?.toUpperCase()} SAKATLANDI! TAKIM ZOR DURUMDA!`,
        `KÖTÜ HABER: ${event.playerName} HAFTALARCA OYNAMAYACAK!`,
        `SAĞLIK BÜLTENİ: ${teamName} İÇİ KARANLIK!`,
      ];
      return headlines[Math.floor(Math.random() * headlines.length)];
    }

    case 'milestone': {
      return event.milestoneText ?? `${teamName.toUpperCase()} TARİHİ AN YAŞADI!`;
    }

    case 'derby': {
      const derbyHeadlines = [
        `DERBİDE ATEŞ SAÇAN ${teamName.toUpperCase()}!`,
        `ŞEHRİN EFENDİSİ: ${teamName.toUpperCase()} DERBİYİ KAZANDI!`,
        `DERBİDE TARİH: ${teamName.toUpperCase()} FARKLI KAZANDI!`,
        `${teamName.toUpperCase()}-DERBY: SAHADA SAVAŞ ALANI!`,
      ];
      return derbyHeadlines[Math.floor(Math.random() * derbyHeadlines.length)];
    }

    default:
      return `${teamName.toUpperCase()} İLE İLGİLİ SON DAKİKA HABERİ!`;
  }
}
