/**
 * Bot Transfer AI — Bot takımların otomatik transfer işlemleri
 *
 * Her bot takım için:
 * 1. En düşük OVR'li oyuncuyu transfer listesine koy (rastgele fiyat)
 * 2. Piyasadan, eksik mevkiye uygun ve bütçesine yeten oyuncuyu al
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface BotTeam {
  profileId: string;
  teamName: string;
  credits: number;
  money: number;
}

interface PlayerRecord {
  id: string;
  name: string;
  position: string;
  specific_position: string | null;
  rating: number;
  market_value: number;
  team_name: string;
  profile_id: string | null;
  is_injured: boolean;
  is_on_loan_market: boolean;
}

/**
 * Bot takımlar için haftalık transfer AI çalıştır
 */
export async function runBotTransfers(): Promise<{
  listed: number;
  bought: number;
  details: string[];
}> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const details: string[] = [];
  let listed = 0;
  let bought = 0;

  // 1. Bot takımları getir
  const { data: botProfiles } = await supabase
    .from('profiles')
    .select('id, team_name, credits, money')
    .eq('is_bot', true);

  if (!botProfiles || botProfiles.length === 0) {
    return { listed: 0, bought: 0, details: ['Bot takım bulunamadı'] };
  }

  for (const bot of botProfiles as BotTeam[]) {
    try {
      // 2. Bot'un oyuncularını getir
      const { data: botPlayers } = await supabase
        .from('players')
        .select('id, name, position, specific_position, rating, market_value, team_name, profile_id, is_injured, is_on_loan_market')
        .ilike('team_name', bot.teamName);

      if (!botPlayers || botPlayers.length < 14) continue; // Kadro çok küçükse satma

      // ── ADIM 1: En düşük OVR'li oyuncuyu satışa çıkar ──
      const sortedByRating = [...(botPlayers as PlayerRecord[])].sort((a, b) => a.rating - b.rating);
      const worstPlayer = sortedByRating[0];

      if (worstPlayer && !worstPlayer.is_on_loan_market) {
        // Rastgele fiyat: market_value * 0.6 - 1.2
        const priceMultiplier = 0.6 + Math.random() * 0.6;
        const listingPrice = Math.round((worstPlayer.market_value || 100000) * priceMultiplier);

        const { error: listError } = await supabase
          .from('transfer_market')
          .insert({
            player_id: worstPlayer.id,
            seller_profile_id: bot.profileId,
            asking_price: listingPrice,
            status: 'active',
          });

        if (!listError) {
          listed++;
          details.push(`${bot.teamName}: ${worstPlayer.name} (${worstPlayer.rating} OVR) satışa çıkarıldı - €${listingPrice.toLocaleString()}`);
        }
      }

      // ── ADIM 2: Eksik mevki tespit et ve piyasadan al ──
      const positionCounts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
      for (const p of botPlayers as PlayerRecord[]) {
        const pos = p.specific_position || p.position;
        const group = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos) ? 'DEF'
          : ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pos) ? 'MID'
          : ['CF', 'ST'].includes(pos) ? 'FWD'
          : pos;
        if (positionCounts[group] !== undefined) positionCounts[group]++;
      }

      // En az nüfuslu mevkii bul
      const weakestPosition = Object.entries(positionCounts)
        .filter(([k]) => k !== 'GK') // GK ihtiyacı ignore et
        .sort((a, b) => a[1] - b[1])[0];

      if (weakestPosition && weakestPosition[1] < 5) {
        const neededGroup = weakestPosition[0];
        const maxBudget = (bot.money || 0) * 0.3; // Bütçenin %30'u

        // Piyasadan uygun oyuncu bul
        const { data: marketPlayers } = await supabase
          .from('transfer_market')
          .select('id, player_id, asking_price, status, players!inner(id, name, position, specific_position, rating, market_value)')
          .eq('status', 'active')
          .lte('asking_price', maxBudget)
          .order('asking_price', { ascending: true })
          .limit(10);

        if (marketPlayers && marketPlayers.length > 0) {
          // Mevkisi uyan ve en iyi rating'li olanı seç
          const suitable = marketPlayers
            .filter((mp: any) => {
              const pPos = mp.players?.specific_position || mp.players?.position;
              if (neededGroup === 'DEF' && ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pPos)) return true;
              if (neededGroup === 'MID' && ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pPos)) return true;
              if (neededGroup === 'FWD' && ['CF', 'ST'].includes(pPos)) return true;
              return false;
            })
            .sort((a: any, b: any) => (b.players?.rating || 0) - (a.players?.rating || 0));

          if (suitable.length > 0) {
            const target = suitable[0];
            const price = target.asking_price;

            // Satın al
            const { error: buyError } = await supabase
              .from('players')
              .update({
                team_name: bot.teamName,
                profile_id: bot.profileId,
              })
              .eq('id', target.player_id);

            if (!buyError) {
              // Bütçeyi güncelle
              await supabase
                .from('profiles')
                .update({ money: Math.max(0, (bot.money || 0) - price) })
                .eq('id', bot.profileId);

              // İlanı kaldır
              await supabase
                .from('transfer_market')
                .update({ status: 'sold' })
                .eq('id', target.id);

              bought++;
              details.push(`${bot.teamName}: ${target.players?.name} (${target.players?.rating} OVR) satın alındı - €${price.toLocaleString()}`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[bot-transfers] ${bot.teamName} hatası:`, err);
    }
  }

  return { listed, bought, details };
}
