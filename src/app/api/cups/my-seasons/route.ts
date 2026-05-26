import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([], { status: 200 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json([], { status: 200 });

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const teamName = searchParams.get('teamName');

  if (!profileId && !teamName) return NextResponse.json([], { status: 200 });

  try {
    let query = supabase
      .from('cup_seasons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profileId) {
      query = query.eq('profile_id', profileId);
    } else if (teamName) {
      query = query.eq('team_name', teamName);
    }

    const { data, error } = await query;

    if (error || !data) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data);
  } catch {
    return createErrorResponse(new Error('Failed to fetch cup seasons'), { route: '/api/cups/my-seasons', method: 'GET' });
  }
}
