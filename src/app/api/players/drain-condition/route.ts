import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
    }
    
    const body = await request.json();
    const { playerIds, drain, profileId: bodyProfileId } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json({ error: 'Geçersiz oyuncu listesi' }, { status: 400 });
    }

    if (!profileId) {
      return NextResponse.json({ error: 'Profil ID gerekli' }, { status: 400 });
    }
    
    const drainAmount = Math.max(1, Math.min(30, Number(drain) || 10));
    
    // Only drain players that belong to the requesting profile (RLS check)
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('id, cond, profile_id')
      .in('id', playerIds)
      .eq('profile_id', profileId);  // Security: only own players
    
    if (fetchError) {
      return createErrorResponse(fetchError, { route: '/api/players/drain-condition', method: 'POST' });
    }
    
    if (!players || players.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }
    
    // Batch update condition
    let updated = 0;
    for (const player of players) {
      const newCond = Math.max(10, (player.cond || 80) - drainAmount);
      const { error: updateError } = await supabase
        .from('players')
        .update({ cond: newCond })
        .eq('id', player.id)
        .eq('profile_id', profileId);
      
      if (!updateError) updated++;
    }
    
    return NextResponse.json({ success: true, updated, drain: drainAmount });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/players/drain-condition', method: 'POST' });
  }
}
