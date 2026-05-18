/**
 * GET /api/sponsors/offers?profileId=xxx
 * Kullanıcının takım gücüne göre sponsorluk teklifleri oluşturur.
 * 
 * POST /api/sponsors/offers
 * Sponsorluk teklifini kabul eder.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';

// Sponsor tanımları
const SPONSOR_POOL = [
  { id: 's1', name: 'Yerel Market Zinciri', tier: 1, base_offer_credits: 5, logo: '🏪' },
  { id: 's2', name: 'Bölgesel İnternet Servisi', tier: 1, base_offer_credits: 8, logo: '🌐' },
  { id: 's3', name: 'Semt Kırtasiye', tier: 1, base_offer_credits: 4, logo: '📝' },
  { id: 's4', name: 'Yerel Kafe Zinciri', tier: 1, base_offer_credits: 6, logo: '☕' },
  { id: 's5', name: 'Mahalle Temizlik', tier: 1, base_offer_credits: 5, logo: '🧹' },
  { id: 's6', name: 'Ulusal Elektronik Marka', tier: 2, base_offer_credits: 20, logo: '📱' },
  { id: 's7', name: 'Spor Giyim Zinciri', tier: 2, base_offer_credits: 25, logo: '👟' },
  { id: 's8', name: 'Otomotiv Grubu', tier: 2, base_offer_credits: 22, logo: '🚗' },
  { id: 's9', name: 'Gıda ve İçecek Holding', tier: 2, base_offer_credits: 18, logo: '🍔' },
  { id: 's10', name: 'Sigorta Şirketi', tier: 2, base_offer_credits: 20, logo: '🛡️' },
  { id: 's11', name: 'Global Havayolu', tier: 3, base_offer_credits: 50, logo: '✈️' },
  { id: 's12', name: 'Uluslararası Teknoloji Devi', tier: 3, base_offer_credits: 60, logo: '💻' },
  { id: 's13', name: 'Dünya Bankası Partner', tier: 3, base_offer_credits: 55, logo: '🏦' },
  { id: 's14', name: 'Lüks Otomobil Markası', tier: 3, base_offer_credits: 45, logo: '🏎️' },
];

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    if (!profileId || !isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, team_name, league_name')
      .eq('id', profileId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });

    // Takım gücü
    const { data: players } = await supabase
      .from('players')
      .select('rating')
      .eq('profile_id', profileId);

    const avgOvr = players && players.length > 0
      ? players.reduce((sum: number, p: any) => sum + (p.rating || 65), 0) / players.length
      : 65;
    const teamPower = Math.round(avgOvr / 10);

    // Aktif sponsorluklar
    const { data: activeSponsors } = await supabase
      .from('team_sponsorships')
      .select('*')
      .eq('team_id', profileId)
      .eq('status', 'active');

    const activeCount = activeSponsors?.length || 0;

    // Uygun tier hesapla
    let eligibleTier = 1;
    if (teamPower >= 8) eligibleTier = 3;
    else if (teamPower >= 6) eligibleTier = 2;

    const eligibleSponsors = SPONSOR_POOL.filter(s => s.tier <= eligibleTier);
    const shuffled = [...eligibleSponsors].sort(() => Math.random() - 0.5);
    const activeIds = (activeSponsors || []).map((s: any) => s.sponsor_id);
    const available = shuffled.filter(s => !activeIds.includes(s.id)).slice(0, 3);

    const offers = available.map(sponsor => ({
      ...sponsor,
      weekly_income: Math.round(sponsor.base_offer_credits * (0.8 + teamPower * 0.1)),
      duration_weeks: Math.max(5, 34 - Math.floor(Math.random() * 10) - 1),
    }));

    return NextResponse.json({ teamPower, eligibleTier, activeSponsorships: activeSponsors || [], offers });
  } catch (err) {
    console.error('[GET /api/sponsors/offers] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });

  try {
    const body = await request.json();
    const { sponsorId, profileId, signedWeek, weeklyIncome, durationWeeks } = body;

    if (!sponsorId || !profileId) {
      return NextResponse.json({ error: 'sponsorId ve profileId zorunlu' }, { status: 400 });
    }
    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    const sponsor = SPONSOR_POOL.find(s => s.id === sponsorId);
    if (!sponsor) return NextResponse.json({ error: 'Sponsor bulunamadı' }, { status: 404 });

    const week = signedWeek || 1;
    const duration = durationWeeks || (34 - week);
    const weekly = weeklyIncome || sponsor.base_offer_credits;
    const total = weekly * duration;

    const { data, error } = await supabase
      .from('team_sponsorships')
      .insert({
        team_id: profileId,
        sponsor_id: sponsorId,
        sponsor_name: sponsor.name,
        sponsor_tier: sponsor.tier,
        sponsor_logo: sponsor.logo,
        signed_week: week,
        duration_weeks: duration,
        weekly_income: weekly,
        total_income: total,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/sponsors/offers] Insert error:', error.message);
      return NextResponse.json({ error: 'Sponsorluk kaydı oluşturulamadı: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${sponsor.name} ile sponsorluk anlaşması imzalandı!`,
      sponsorship: data,
    });
  } catch (err) {
    console.error('[POST /api/sponsors/offers] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
