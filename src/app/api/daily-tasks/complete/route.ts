import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { taskId, userId: bodyUserId } = await request.json();
    const userId = getAuthenticatedUserId(request, bodyUserId);

    if (!userId) {
      return NextResponse.json({ error: 'userId zorunlu.' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Client error' }, { status: 500 });

    const { data, error } = await supabase.rpc('complete_daily_task', {
      p_task_id: taskId,
      p_user_id: userId,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
