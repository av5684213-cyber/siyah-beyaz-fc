import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateStableSquad, POS_TO_GROUP } from '@/lib/fm/playerGenerator';
import type { SpecificPosition } from '@/lib/fm/types';
import { createErrorResponse } from '@/lib/api-error-handler';

// ═══════════════════════════════════════════════════
//  Deterministik Seeded Random Generator
//  Aynı seed her zaman aynı sonuçları üretir
// ═══════════════════════════════════════════════════
function createSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  // İlk birka çağrıyı atla (warmup)
  for (let i = 0; i < 5; i++) {
    h = Math.imul(48271, h) | 0;
  }
  return () => {
    h = Math.imul(48271, h) | 0;
    return (h >>> 0) / 2147483647;
  };
}

// Türkçe isim havuzu (deterministik seçim için)
const TR_FIRST_NAMES = [
  "Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Arda", "Ömer", "Yiğit", "Mert",
  "Ali", "Hakan", "Kerem", "Efe", "Deniz", "Tolga", "Sercan", "Cengiz", "Umut", "Berk",
  "Furkan", "Oğuz", "Salih", "İbrahim", "Yusuf", "Kaan", "Baran", "Alper", "Murat", "Cem",
  "Semih", "Batuhan", "Emirhan", "Taha", "Rıza", "Niyazi", "Tayfun", "Gökhan", "Savaş", "Erkan",
];

const TR_LAST_NAMES = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Erdogan", "Aydın", "Özdemir", "Arslan",
  "Koç", "Öztürk", "Kılıç", "Arslan", "Doğan", "Keskin", "Akar", "Çetin", "Korkmaz", "Gündüz",
  "Polat", "Erdoğan", "Şen", "Güven", "Tan", "Aktaş", "Karadağ", "Aydoğan", "Uğur", "Başaran",
  "Söğüt", "Tuncel", "Balcı", "Kıraç", "Soysal", "Velioğlu", "Yavuz", "Dinç", "Köse", "Okutan",
];

// Seeded random ile deterministik oyuncu üret
function generateDeterministicSquad(teamName: string, tier: number) {
  // Her takım adı için sabit seed oluştur
  const baseSeed = `${teamName}-squad-${tier}`;
  const rng = createSeededRandom(baseSeed);
  return generateStableSquad(teamName, tier, rng);
}

// Supabase kayıt formatına dönüştür
function toDbRow(p: any, teamName: string, index: number) {
  return {
    id: `npc-${teamName.replace(/\s+/g, '-')}-${index}`,
    name: p.name,
    position: p.position,
    specific_position: p.specificPosition || p.specific_position || p.position,
    secondary_positions: p.secondaryPositions || p.secondary_positions || null,
    rating: p.rating,
    potential: p.potential,
    speed: p.speed ?? 50,
    power: p.power ?? 50,
    passing: p.passing ?? 50,
    shooting: p.shooting ?? 50,
    defending: p.defending ?? 50,
    control: p.control ?? 50,
    vision: p.vision ?? 50,
    heading: p.heading ?? 50,
    goalkeeping: p.goalkeeping ?? (p.position === 'GK' ? p.rating : 10),
    age: p.age,
    nation: p.nation || 'Türkiye',
    cond: p.cond ?? 100,
    form: p.form ?? 70,
    morale: p.morale ?? 70,
    team_name: teamName,
    klt: p.rating,
    pas: p.passing ?? 50,
    sut: p.shooting ?? 50,
    tk: p.defending ?? 50,
    hiz: p.speed ?? 50,
    guc: p.power ?? 50,
    alg: p.vision ?? 50,
    top: p.control ?? 50,
    kfa: p.heading ?? 50,
    klc: p.goalkeeping ?? (p.position === 'GK' ? p.rating : 10),
    personality: JSON.stringify({
      traits: p.traits || [],
      negTraits: p.negTraits || [],
      personalityTraits: p.personalityTraits || [],
      traitLevels: p.traitLevels || {},
      playStyle: p.playStyle
    })
  };
}

// Oyuncu verisini frontend formatına dönüştür
function mapPlayer(p: any) {
  const specificPos = p.specific_position || p.specificPosition;
  const secondaryPos = p.secondary_positions || p.secondaryPositions;
  return {
    ...p,
    position: p.position || POS_TO_GROUP[specificPos] || 'MID',
    specificPosition: specificPos || p.position || 'CM',
    secondaryPositions: secondaryPos && secondaryPos.length > 0 ? secondaryPos : undefined,
    rating: p.rating ?? p.klt ?? 60,
    potential: p.potential ?? p.rating ?? 70,
    passing: p.passing ?? p.pas ?? 50,
    shooting: p.shooting ?? p.sut ?? 50,
    defending: p.defending ?? p.tk ?? 50,
    speed: p.speed ?? p.hiz ?? 50,
    power: p.power ?? p.guc ?? 50,
    vision: p.vision ?? p.alg ?? 50,
    control: p.control ?? p.top ?? 50,
    heading: p.heading ?? p.kfa ?? 50,
    goalkeeping: p.goalkeeping ?? p.klc ?? 10,
    cond: p.cond ?? 100,
    form: p.form ?? 70,
    morale: p.morale ?? 70
  };
}

// Takımın tier'ını bul (league_teams → leagues)
async function getTeamTier(supabase: any, teamName: string): Promise<number> {
  const { data: lt } = await supabase
    .from('league_teams')
    .select('league_id')
    .eq('name', teamName)
    .limit(1)
    .single();

  if (!lt) return 4;

  const { data: league } = await supabase
    .from('leagues')
    .select('tier')
    .eq('id', lt.league_id)
    .single();

  return league?.tier ?? 4;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamName = searchParams.get('teamName');

  if (!teamName) {
    return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
  }

  const supabase = getSupabase();

  if (!supabase) {
    // Offline: deterministik kadro üret
    return NextResponse.json({
      source: 'offline_generated',
      players: generateDeterministicSquad(teamName, 4)
    });
  }

  try {
    // 1. Supabase'den var olan oyuncuları getir
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('team_name', teamName);

    if (existingPlayers && existingPlayers.length > 0) {
      // Oyuncular zaten var, direkt döndür
      return NextResponse.json({
        source: 'database',
        players: existingPlayers.map(mapPlayer)
      });
    }

    // 2. Oyuncular yok → deterministik olarak üret ve kaydet
    console.log(`[TEAM-PLAYERS] Generating stable squad for: ${teamName}`);

    const tier = await getTeamTier(supabase, teamName);
    const squad = generateDeterministicSquad(teamName, tier);
    const dbRows = squad.map((p, i) => toDbRow(p, teamName, i));

    // Supabase'e kaydet (upsert ile çakışma önleme)
    const { error: insertError } = await supabase
      .from('players')
      .upsert(dbRows, { onConflict: 'id' });

    if (insertError) {
      // Upsert desteklemiyorsa insert dene
      console.warn('[TEAM-PLAYERS] Upsert failed, trying insert:', insertError.message);
      const { error: insertErr2 } = await supabase
        .from('players')
        .insert(dbRows);
      if (insertErr2) {
        console.error('[TEAM-PLAYERS] Insert failed:', insertErr2.message);
      }
    }

    return NextResponse.json({
      source: 'generated_and_saved',
      players: squad.map(mapPlayer)
    });
  } catch (error: any) {
    return createErrorResponse(error, { route: '/api/league/team-players', method: 'GET' });
  }
}
