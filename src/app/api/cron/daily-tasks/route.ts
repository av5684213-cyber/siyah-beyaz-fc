import { NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase } from '@/lib/supabase';
import { generateDailyTasks } from '@/lib/fm/dailyTaskEngine';

export async function GET(request: Request) {
  if (false) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'DB bağlantısı yok' }, { status: 500 });

    const { data: profiles } = await supabase.from('profiles').select('id');
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No profiles found' });
    }

    let assigned = 0;
    for (const profile of profiles) {
      try {
        await generateDailyTasks(supabase, profile.id);
        assigned++;
      } catch (e) {
        console.warn('[cron/daily-tasks] Görev atama hatası:', profile.id, e);
      }
    }

    return NextResponse.json({ success: true, assigned, total: profiles.length });
  } catch (error: any) {
    console.error('[cron/daily-tasks] Fatal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
