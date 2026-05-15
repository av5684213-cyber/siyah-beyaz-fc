import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { TIER_TEAM_NAMES } from '@/lib/fm/constants';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

// Bu API jenerik isimleri gerçek isimlerle değiştirir.
// GET /api/league/rename-teams?tier=4 (Admin-only: x-cron-secret header gerekli)
export async function GET(request: NextRequest) {
  // Admin-only: cron secret doğrulama
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const targetTier = parseInt(searchParams.get('tier') || '4', 10);

  try {
    // 1. Tüm ligleri bu tier için getir
    const { data: leagues } = await supabase
      .from('leagues')
      .select('id, name, tier')
      .eq('tier', targetTier)
      .order('created_at', { ascending: true });

    if (!leagues || leagues.length === 0) {
      return NextResponse.json({ success: false, message: `${targetTier}. Lig bulunamadı` });
    }

    const namePool = TIER_TEAM_NAMES[targetTier] || TIER_TEAM_NAMES[4] || [];
    let totalRenamed = 0;

    for (let leagueIdx = 0; leagueIdx < leagues.length; leagueIdx++) {
      const league = leagues[leagueIdx];
      const start = leagueIdx * 18;

      // 2. Bu ligdeki jenerik isimli takımları bul
      const { data: teams } = await supabase
        .from('league_teams')
        .select('id, name, is_npc')
        .eq('league_id', league.id);

      if (!teams || teams.length === 0) continue;

      // İsim havuzundan bu departman için 18 isim al
      const deptNames = namePool.slice(start, start + 18);

      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        if (!team.is_npc) continue; // Kullanıcı takımlarını atla

        const isGeneric = team.name.includes('Kulüp') || team.name.includes('Takım');
        const newName = deptNames[i];

        if (isGeneric && newName) {
          await supabase
            .from('league_teams')
            .update({ name: newName })
            .eq('id', team.id);
          totalRenamed++;
          console.log(`[RENAME] "${team.name}" → "${newName}" (${league.name})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      tier: targetTier,
      leaguesFound: leagues.length,
      totalRenamed,
      message: `${totalRenamed} takım ismi güncellendi.`
    });
  } catch (error: any) {
    console.error('Rename teams error:', error);
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}
