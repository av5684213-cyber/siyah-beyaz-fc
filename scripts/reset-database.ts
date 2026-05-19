/**
 * SİYAH BEYAZ FC — Veritabanı Sıfırlama Script'i
 * Kullanım: npx ts-node scripts/reset-database.ts
 *
 * Tüm tabloları temizler ve başlangıç verilerini oluşturur:
 * - 18 takım (ligler, league_teams, profiles)
 * - Her takıma 17 oyuncu (players)
 * - 1 sezon (seasons)
 * - 34 haftalık fikstür (fixtures)
 * - Tüm takımlara 5000 KR + 1.000.000 €
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase URL veya Key bulunamadı. .env.local dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════════════
// TAKIM İSİMLERİ (Süper Lig + Kurgusal)
// ═══════════════════════════════════════════════════════════════

const TEAM_NAMES = [
  'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
  'İstanbul Başakşehir', 'Kasımpaşa', 'Antalyaspor', 'Adana Demirspor',
  'Konyaspor', 'Sivasspor', 'Kayserispor', 'Alanyaspor',
  'Ankaragücü', 'Karagümrük', 'Gaziantep FK', 'Hatayspor',
  'Pendikspor', 'Rizespor',
];

const STADIUMS: Record<string, string> = {
  'Galatasaray': 'RAMS Park',
  'Fenerbahçe': 'Ülker Stadyumu',
  'Beşiktaş': 'Tüpraş Stadyumu',
  'Trabzonspor': 'Papara Park',
  'İstanbul Başakşehir': 'Başakşehir Fatih Terim Stadyumu',
  'Kasımpaşa': 'Recep Tayyip Erdoğan Stadyumu',
  'Antalyaspor': 'Corendon Airlines Park',
  'Adana Demirspor': 'Yeni Adana Stadyumu',
  'Konyaspor': 'MEDAŞ Konya Büyükşehir Stadyumu',
  'Sivasspor': 'BG Group 4 Eylül Stadyumu',
  'Kayserispor': 'RHG Enertürk Enerji Stadyumu',
  'Alanyaspor': 'Gain Park Alanya',
  'Ankaragücü': 'Eryaman Stadyumu',
  'Karagümrük': 'Atatürk Olimpiyat Stadyumu',
  'Gaziantep FK': 'Kalyon Stadyumu',
  'Hatayspor': 'Yeni Hatay Stadyumu',
  'Pendikspor': 'Pendik Stadyumu',
  'Rizespor': 'Çaykur Didi Stadyumu',
};

// ═══════════════════════════════════════════════════════════════
// POSİTİON ŞABLONU (17 oyuncu)
// ═══════════════════════════════════════════════════════════════

const SQUAD_TEMPLATE = [
  'GK', 'GK',
  'CB', 'CB', 'CB', 'LB', 'RB',
  'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'ST', 'ST', 'CF',
];

const COMPATIBLE_SECONDARY: Record<string, string[]> = {
  'GK': [],
  'CB': ['LB', 'RB', 'CDM'],
  'LB': ['CB', 'LWB', 'LM'],
  'RB': ['CB', 'RWB', 'RM'],
  'LWB': ['LB', 'LM'],
  'RWB': ['RB', 'RM'],
  'CDM': ['CM', 'CB'],
  'CM': ['CDM', 'CAM'],
  'CAM': ['CM', 'CF'],
  'LM': ['LW', 'LB', 'CM'],
  'RM': ['RW', 'RB', 'CM'],
  'LW': ['LM', 'ST', 'CF'],
  'RW': ['RM', 'ST', 'CF'],
  'CF': ['ST', 'CAM', 'LW'],
  'ST': ['CF', 'LW', 'RW'],
};

const POS_LABELS: Record<string, string> = {
  'GK': 'Kaleci', 'CB': 'Merkez Defans', 'LB': 'Sol Bek', 'RB': 'Sağ Bek',
  'LWB': 'Sol Kanat Bek', 'RWB': 'Sağ Kanat Bek', 'CDM': 'Defansif Orta Saha',
  'CM': 'Merkez Orta Saha', 'CAM': 'Ofansif Orta Saha', 'LM': 'Sol Açık',
  'RM': 'Sağ Açık', 'LW': 'Sol Kanat', 'RW': 'Sağ Kanat',
  'CF': 'Göbek Forvet', 'ST': 'Santrfor',
};

const POS_GROUP: Record<string, string> = {
  'GK': 'GK', 'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF', 'LWB': 'DEF', 'RWB': 'DEF',
  'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID', 'LW': 'MID', 'RW': 'MID',
  'CF': 'FWD', 'ST': 'FWD',
};

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Can', 'Burak', 'Emre', 'Arda', 'Ömer', 'Yiğit', 'Mert',
  'Ali', 'Hakan', 'Kerem', 'Efe', 'Deniz', 'Tolga', 'Sercan', 'Cengiz', 'Umut', 'Berk',
  'Furkan', 'Oğuz', 'Salih', 'İbrahim', 'Yusuf', 'Kaan', 'Baran', 'Alper', 'Murat', 'Cem',
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Aydın', 'Özdemir', 'Arslan',
  'Koç', 'Öztürk', 'Kılıç', 'Doğan', 'Keskin', 'Akar', 'Çetin', 'Korkmaz', 'Gündüz',
  'Polat', 'Şen', 'Güven', 'Tan', 'Aktaş', 'Karadağ', 'Uğur', 'Başaran',
  'Söğüt', 'Tuncel', 'Balcı', 'Kıraç', 'Soysal', 'Yavuz', 'Dinç', 'Köse',
];

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePlayerStats(position: string, baseRating: number) {
  const isGK = position === 'GK';
  const isDef = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position);
  const isMid = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position);
  const isFwd = ['LW', 'RW', 'CF', 'ST'].includes(position);

  const v = () => Math.max(1, Math.min(99, baseRating + Math.floor(Math.random() * 20) - 10)));

  return {
    speed: isFwd ? v() + 5 : v(),
    physical: isDef ? v() + 5 : v(),
    passing: isMid ? v() + 5 : v(),
    shooting: isFwd ? v() + 8 : v(),
    heading: isDef || isFwd ? v() + 3 : v(),
    goalkeeping: isGK ? v() + 15 : Math.max(1, v() - 30),
    control: v(),
    vision: isMid ? v() + 3 : v(),
    defending: isDef ? v() + 8 : v(),
    mental: v(),
  };
}

function assignSecondary(pos: string): string[] | null {
  const compat = COMPATIBLE_SECONDARY[pos];
  if (!compat || compat.length === 0) return null;
  const roll = Math.random();
  if (roll < 0.06 && compat.length >= 2) {
    return [randomFrom(compat), randomFrom(compat)];
  }
  if (roll < 0.24) {
    return [randomFrom(compat)];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// ANA SIFIRLAMA FONKSİYONU
// ═══════════════════════════════════════════════════════════════

async function resetDatabase() {
  console.log('🗑️  Veritabanı sıfırlanıyor...\n');

  // 1. Tabloları temizle
  const tablesToTruncate = [
    'match_events', 'match_reports', 'fixtures', 'league_standings',
    'seasons', 'players', 'league_teams', 'leagues', 'profiles',
    'rental_listings', 'loans', 'player_positions', 'transfer_market',
  ];

  for (const table of tablesToTruncate) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn(`⚠️  ${table} temizlenemedi: ${error.message}`);
    } else {
      console.log(`✅ ${table} temizlendi`);
    }
  }

  // 2. Lig oluştur
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({ name: 'Süper Lig', tier: 1, country: 'Türkiye' })
    .select()
    .single();

  if (leagueError || !league) {
    console.error('❌ Lig oluşturulamadı:', leagueError?.message);
    process.exit(1);
  }
  console.log(`✅ Lig oluşturuldu: ${league.name} (ID: ${league.id})`);

  // 3. Sezon oluştur
  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .insert({ league_id: league.id, name: 'Sezon 1', status: 'active' })
    .select()
    .single();

  if (seasonError || !season) {
    console.error('❌ Sezon oluşturulamadı:', seasonError?.message);
    process.exit(1);
  }
  console.log(`✅ Sezon oluşturuldu: ${season.name} (ID: ${season.id})`);

  // 4. Takımlar ve oyuncular oluştur
  const leagueTeamIds: string[] = [];

  for (let t = 0; t < TEAM_NAMES.length; t++) {
    const teamName = TEAM_NAMES[t];

    // Profile oluştur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        team_name: teamName,
        money: 1000000,       // 1.000.000 €
        credits: 5000,        // 5.000 KR
        is_bot: t > 0,        // İlk takım kullanıcı
      })
      .select()
      .single();

    if (profileError || !profile) {
      console.warn(`⚠️  ${teamName} profili oluşturulamadı: ${profileError?.message}`);
      continue;
    }

    // League team oluştur
    const { data: leagueTeam, error: ltError } = await supabase
      .from('league_teams')
      .insert({
        name: teamName,
        league_id: league.id,
        profile_id: profile.id,
        stadium_name: STADIUMS[teamName] || `${teamName} Stadyumu`,
        is_user_team: t === 0,
        is_bot: t > 0,
      })
      .select()
      .single();

    if (ltError || !leagueTeam) {
      console.warn(`⚠️  ${teamName} league_team oluşturulamadı: ${ltError?.message}`);
      continue;
    }
    leagueTeamIds.push(leagueTeam.id);

    // Oyuncular oluştur
    const players = SQUAD_TEMPLATE.map((pos, i) => {
      const baseRating = 72 - Math.floor(t / 6) * 5; // Tier bazlı rating
      const rating = Math.max(55, Math.min(90, baseRating + Math.floor(Math.random() * 12) - 4));
      const secondaryPositions = assignSecondary(pos);
      const stats = generatePlayerStats(pos, rating);
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      const age = 18 + Math.floor(Math.random() * 16); // 18-33
      const marketValue = Math.round(rating * rating * 120 + age * 5000);
      const salary = Math.round(marketValue * 0.02);

      return {
        id: `p-${teamName.replace(/\s+/g, '-').toLowerCase()}-${i}`,
        name: `${firstName} ${lastName}`,
        position: POS_GROUP[pos],
        specific_position: pos,
        secondary_positions: secondaryPositions,
        rating,
        potential: Math.min(99, rating + Math.floor(Math.random() * 15)),
        age,
        nation: 'Türkiye',
        club: teamName,
        team_name: teamName,
        profile_id: profile.id,
        market_value: marketValue,
        salary,
        preferred_foot: Math.random() > 0.75 ? 'Left' : 'Right',
        ...stats,
        cond: 100,
        morale: 70 + Math.floor(Math.random() * 20),
        is_injured: false,
        is_on_loan_market: false,
        loan_fee: 0,
      };
    });

    const { error: playersError } = await supabase.from('players').insert(players);
    if (playersError) {
      console.warn(`⚠️  ${teamName} oyuncuları oluşturulamadı: ${playersError.message}`);
    } else {
      console.log(`✅ ${teamName}: ${players.length} oyuncu oluşturuldu (ORT: ${Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length)})`);
    }

    // League standings oluştur
    await supabase.from('league_standings').insert({
      team_id: leagueTeam.id,
      league_id: league.id,
      season: 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_diff: 0,
      points: 0,
    });
  }

  // 5. Fikstür oluştur (round-robin, 34 hafta)
  console.log('\n📅 Fikstür oluşturuluyor...');
  const n = leagueTeamIds.length;
  const totalRounds = (n - 1) * 2; // 34 hafta
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const fixtures: any[] = [];
  const teamIds = [...leagueTeamIds];

  // Round-robin algoritması
  for (let round = 0; round < n - 1; round++) {
    for (let match = 0; match < n / 2; match++) {
      const home = teamIds[match];
      const away = teamIds[n - 1 - match];
      if (home && away) {
        const matchDate = new Date(tomorrow);
        matchDate.setDate(matchDate.getDate() + round * 7);

        // İlk yarış (ev-deplasman)
        fixtures.push({
          home_team_id: home,
          away_team_id: away,
          season_id: season.id,
          tur: round + 1,
          match_date: matchDate.toISOString().split('T')[0],
          match_time: '15:00',
          status: 'scheduled',
        });

        // İkinci yarış (ters)
        const returnDate = new Date(matchDate);
        returnDate.setDate(returnDate.getDate() + (n - 1) * 7);
        fixtures.push({
          home_team_id: away,
          away_team_id: home,
          season_id: season.id,
          tur: round + 1 + (n - 1),
          match_date: returnDate.toISOString().split('T')[0],
          match_time: '15:00',
          status: 'scheduled',
        });
      }
    }

    // Takımları döndür
    const last = teamIds.pop();
    if (last) teamIds.splice(1, 0, last);
  }

  // Batch insert (100'erli)
  for (let i = 0; i < fixtures.length; i += 100) {
    const batch = fixtures.slice(i, i + 100);
    const { error: fixError } = await supabase.from('fixtures').insert(batch);
    if (fixError) {
      console.warn(`⚠️  Fikstür batch ${i / 100 + 1} hatası: ${fixError.message}`);
    }
  }
  console.log(`✅ ${fixtures.length} fikstür oluşturuldu (${totalRounds} hafta)`);

  // 6. İlk takımın profil ID'sini göster
  const { data: firstProfile } = await supabase
    .from('profiles')
    .select('id, team_name')
    .eq('is_bot', false)
    .maybeSingle();

  console.log('\n═══════════════════════════════════════');
  console.log('🎉 SIFIRLAMA TAMAMLANDI!');
  console.log('═══════════════════════════════════════');
  console.log(`⚽ ${TEAM_NAMES.length} takım oluşturuldu`);
  console.log(`👥 ${TEAM_NAMES.length * 17} oyuncu oluşturuldu`);
  console.log(`📅 ${fixtures.length} fikstür oluşturuldu`);
  console.log(`💰 Her takım: 5.000 KR + 1.000.000 €`);
  if (firstProfile) {
    console.log(`\n🔑 Kullanıcı Takımı: ${firstProfile.team_name}`);
    console.log(`   Profile ID: ${firstProfile.id}`);
  }
  console.log('═══════════════════════════════════════\n');
}

resetDatabase().catch((err) => {
  console.error('❌ Sıfırlama hatası:', err);
  process.exit(1);
});
