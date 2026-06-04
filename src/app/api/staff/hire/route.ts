/**
 * Staff Hire API - Yeni personel ise al
 * POST /api/staff/hire
 * Body: { userId, type, stars }
 *
 * Yeni fiyatlandirma: Her personel tipi/icin yildiza gore sabit Kredi + Euro ucreti.
 * Kredi: profile.credits uzerinden dusulur
 * Euro:  profile.money uzerinden dusulur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

// -- Pricing Constants (Kredi + Euro per star level) --
const STAFF_PRICING: Record<string, { kredi: Record<number, number>; euro: Record<number, number> }> = {
  scout: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 400000, 2: 600000, 3: 800000, 4: 1000000, 5: 1200000 },
  },
  coach: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 650000, 2: 800000, 3: 950000, 4: 1100000, 5: 1250000 },
  },
  physio: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 200000, 2: 280000, 3: 360000, 4: 440000, 5: 520000 },
  },
  youth_coordinator: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 450000, 2: 600000, 3: 750000, 4: 900000, 5: 1050000 },
  },
  sporting_director: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 350000, 2: 500000, 3: 650000, 4: 800000, 5: 950000 },
  },
  analyst: {
    kredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    euro:  { 1: 150000, 2: 250000, 3: 350000, 4: 450000, 5: 550000 },
  },
};

// Turkish first and last names for random name generation
const TURKISH_FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hasan', 'Ibrahim', 'Ismail', 'Yusuf',
  'Murat', 'Ozgur', 'Emre', 'Burak', 'Serkan', 'Hakan', 'Tolga', 'Erkan',
  'Kemal', 'Cemal', 'Selim', 'Kadir', 'Osman', 'Suleyman', 'Fatih', 'Oguz',
  'Deniz', 'Ercan', 'Ugur', 'Ayhan', 'Nuri', 'Cengiz', 'Mert', 'Baris',
  'Levent', 'Bülent', 'Erşan', 'Taner', 'Zafer', 'Oktay', 'Sedat', 'Volkan',
  'Arda', 'Berk', 'Can', 'Doruk', 'Ege', 'Emir', 'Kaan', 'Miraç',
  'Onur', 'Polat', 'Rıza', 'Selçuk', 'Tamer', 'Umut', 'Yiğit', 'Bora',
  'Cem', 'Engin', 'Faruk', 'Gökhan', 'Harun', 'İlker', 'Kerem', 'Mazhar',
];

const TURKISH_LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk',
  'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Koç',
  'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Erdoğan', 'Aktürk', 'Özmen',
  'Başaran', 'Taş', 'Acar', 'Avşar', 'Bulut', 'Coşkun', 'Duru', 'Ergün',
  'Fidan', 'Güneş', 'Hakverdi', 'Işık', 'Karadağ', 'Mercan', 'Pala', 'Sarı',
  'Tuncel', 'Uysal', 'Varol', 'Yağcı', 'Akın', 'Balcı', 'Cangöz', 'Dikmen',
  'Erkül', 'Güler', 'Ilıcalı', 'Keser', 'Menteş', 'Sözüer', 'Türe', 'Ateş',
  'Bayrak', 'Çakır', 'Efe', 'Genç', 'İlhan', 'Karakaş', 'Oktay', 'Sezer',
];

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapilandirilmamis.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const body = await request.json();
    const { userId: bodyUserId, type, stars } = body;
    const userId = getAuthenticatedUserId(request, bodyUserId);

    // -- Validate inputs --
    if (!userId || !type || !stars) {
      return NextResponse.json({ error: true, message: 'userId, type ve stars zorunlu.' }, { status: 400 });
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: true, message: 'Stars 1-5 arasi olmali.' }, { status: 400 });
    }

    // -- Validate staff type and get pricing --
    const pricing = STAFF_PRICING[type];
    if (!pricing) {
      return NextResponse.json({ error: true, message: `Gecersiz personel tipi: ${type}` }, { status: 400 });
    }

    const hireFeeKredi = pricing.kredi[stars] || 0;
    const hireFeeEuro = pricing.euro[stars] || 0;

    // -- Also validate against staff_types table for max_count --
    const { data: staffType, error: typeError } = await supabase
      .from('staff_types')
      .select('*')
      .eq('type', type)
      .maybeSingle();

    if (typeError || !staffType) {
      return NextResponse.json({ error: true, message: 'Gecersiz personel tipi (veritabani).' }, { status: 400 });
    }

    // -- Check max count --
    const { count: existingCount, error: countError } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', type);

    if (countError) {
      console.error('[POST /api/staff/hire] Count error:', countError.message);
      return NextResponse.json({ error: true, message: 'Personel sayisi kontrol edilemedi.' }, { status: 500 });
    }

    if ((existingCount || 0) >= staffType.max_count) {
      return NextResponse.json({ error: true, message: `${staffType.name_tr} icin maksimum ${staffType.max_count} kisi ise alabilirsiniz.` }, { status: 400 });
    }

    // -- Verify profile exists --
    const { valid, profile, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, userId);
    if (!valid) {
      return NextResponse.json({ error: true, message: profileError || 'Profil bulunamadi.' }, { status: profileStatus || 404 });
    }

    // -- Check balances --
    if ((profile.credits || 0) < hireFeeKredi) {
      return NextResponse.json({
        error: true,
        message: `Yetersiz kredi! ${hireFeeKredi} Kredi gerekli, mevcut: ${profile.credits || 0}`,
      }, { status: 400 });
    }

    if ((profile.money || 0) < hireFeeEuro) {
      return NextResponse.json({
        error: true,
        message: `Yetersiz Euro! ${hireFeeEuro.toLocaleString('tr-TR')} € gerekli, mevcut: ${(profile.money || 0).toLocaleString('tr-TR')} €`,
      }, { status: 400 });
    }

    // -- Get current season week --
    let currentWeek = 0;
    const { data: leagueTeam } = await supabase
      .from('league_teams')
      .select('league_id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (leagueTeam?.league_id) {
      const { data: season } = await supabase
        .from('seasons')
        .select('current_tur')
        .eq('league_id', leagueTeam.league_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      currentWeek = season?.current_tur || 0;
    }

    // -- Generate random Turkish full name (Unvan + Ad + Soyad) --
    const randomFirstName = TURKISH_FIRST_NAMES[Math.floor(Math.random() * TURKISH_FIRST_NAMES.length)];
    const randomLastName = TURKISH_LAST_NAMES[Math.floor(Math.random() * TURKISH_LAST_NAMES.length)];
    const staffName = `${staffType.name_tr} ${randomFirstName} ${randomLastName}`;

    // -- Deduct Kredi from profile --
    const newCredits = (profile.credits || 0) - hireFeeKredi;
    const newMoney = (profile.money || 0) - hireFeeEuro;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits, money: newMoney })
      .eq('id', userId);

    if (updateError) {
      console.error('[POST /api/staff/hire] Balance deduction error:', updateError.message);
      return NextResponse.json({ error: true, message: 'Bakiye dusulemedi.' }, { status: 500 });
    }

    // -- Insert staff record --
    const totalCostForRecord = hireFeeKredi; // Store kredi portion as total_cost for backward compat
    const salaryWeekly = Math.round(hireFeeEuro / 52); // Weekly salary derived from purchase price
    const { data: newStaff, error: insertError } = await supabase
      .from('staff')
      .insert({
        user_id: userId,
        type,
        stars,
        name: staffName,
        contract_start_week: currentWeek > 0 ? currentWeek : 1,
        contract_end_week: 34,
        total_cost: totalCostForRecord,
        salary_weekly: salaryWeekly,
      })
      .select('*, staff_types(name_tr, max_count, base_salary)')
      .single();

    if (insertError) {
      console.error('[POST /api/staff/hire] Insert error:', insertError.message);
      // Refund on failure
      await supabase.rpc('rpc_update_profile', { p_profile_id: userId, p_updates: { credits: profile.credits, money: profile.money } });
      return NextResponse.json({ error: true, message: 'Personel kaydedilemedi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      staff: newStaff,
      costKredi: hireFeeKredi,
      costEuro: hireFeeEuro,
      remainingCredits: newCredits,
      remainingMoney: newMoney,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/staff/hire', method: 'POST' });
  }
}
