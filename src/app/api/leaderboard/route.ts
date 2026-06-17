import { NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'no client' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'championships';
    
    let query = supabase.from('profiles').select(
      'id, team_name, manager_name, reputation, seasons_played, league_tier, primary_color'
    ).eq('is_bot', false).not('team_name', 'is', null);
    
    if (category === 'championships') query = query.order('reputation', { ascending: false });
    else if (category === 'seasons') query = query.order('seasons_played', { ascending: false });
    
    const { data, error } = await query.limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ leaderboard: data || [], category });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
