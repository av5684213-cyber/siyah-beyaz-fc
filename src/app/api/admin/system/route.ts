/**
 * GET /api/admin/system — Sistem bilgisi, cron durumları, hata logları
 * POST /api/admin/system — Cron tetikle, migration uygula, log temizle
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';
export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminEmail = request.headers.get('x-admin-email');
  if (adminEmail?.toLowerCase() === ADMIN_EMAIL) return true;
  const adminUserId = request.headers.get('x-admin-user-id');
  if (adminUserId && isSupabaseConfigured()) {
    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (supabase) {
      const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', adminUserId).maybeSingle();
      if (profile?.role === 'admin' || profile?.email?.toLowerCase() === ADMIN_EMAIL) return true;
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'overview';

  if (section === 'logs') {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const { data: logs, count, error } = await supabase
      .from('error_logs')
      .select('id, error_message, route, method, level, created_at, user_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ logs: logs || [], total: count || 0 });
  }

  if (section === 'cron_locks') {
    const { data: locks, error } = await supabase
      .from('cron_locks')
      .select('*')
      .order('locked_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ locks: locks || [] });
  }

  // Overview
  const { count: errorCount } = await supabase.from('error_logs').select('id', { count: 'exact', head: true });
  const { count: cronLockCount } = await supabase.from('cron_locks').select('id', { count: 'exact', head: true });

  return NextResponse.json({
    errorCount: errorCount || 0,
    cronLockCount: cronLockCount || 0,
    cronJobs: [
      { name: 'match-scheduler', description: 'Lig maçlarını planla', endpoint: '/api/cron/match-scheduler' },
      { name: 'match-simulator', description: 'Planlı maçları simüle et', endpoint: '/api/cron/match-simulator' },
      { name: 'match-tick', description: 'Canlı maç tick', endpoint: '/api/cron/match-tick' },
      { name: 'weekly-income', description: 'Haftalık gelir dağıtımı', endpoint: '/api/cron/weekly-income' },
      { name: 'weekly-evolution', description: 'Haftalık oyuncu gelişimi', endpoint: '/api/cron/weekly-evolution' },
      { name: 'weekly-fans', description: 'Haftalık fan güncellemesi', endpoint: '/api/cron/weekly-fans' },
      { name: 'weekly-report', description: 'Haftalık rapor oluştur', endpoint: '/api/cron/weekly-report' },
      { name: 'bot-actions', description: 'Bot takım aksiyonları', endpoint: '/api/cron/bot-actions' },
      { name: 'daily-tasks', description: 'Günlük görev ata', endpoint: '/api/cron/assign-daily-tasks' },
      { name: 'generate-regens', description: 'Regen oyuncu üret', endpoint: '/api/cron/generate-regens' },
      { name: 'season-end', description: 'Sezon sonu işlemleri', endpoint: '/api/cron/season-end' },
      { name: 'update-form-ratings', description: 'Form rating güncelle', endpoint: '/api/cron/update-form-ratings' },
      { name: 'update-player-values', description: 'Piyasa değeri güncelle', endpoint: '/api/cron/update-player-values' },
      { name: 'apply-training', description: 'Antrenman sonuçları uygula', endpoint: '/api/cron/apply-training' },
      { name: 'youth-training', description: 'Altyapı antrenmanı', endpoint: '/api/cron/youth-training' },
      { name: 'match-scheduler-cup', description: 'Kupa maçlarını planla', endpoint: '/api/cron/match-scheduler-cup' },
      { name: 'auction-cleanup', description: 'Süresi dolan müzayedeleri temizle', endpoint: '/api/cron/auction-cleanup' },
      { name: 'bot-economy-check', description: 'Bot ekonomi kontrolü', endpoint: '/api/cron/bot-economy-check' },
      { name: 'check-academy-upgrades', description: 'Akademi yükseltme kontrolü', endpoint: '/api/cron/check-academy-upgrades' },
    ],
  });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const body = await request.json();
  const { action } = body;

  // Trigger cron job
  if (action === 'trigger_cron') {
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: 'endpoint zorunlu' }, { status: 400 });

    try {
      const cronSecret = process.env.CRON_SECRET || '';
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${cronSecret}` },
      });

      const data = await res.text();
      return NextResponse.json({ success: res.ok, status: res.status, response: data.substring(0, 500) });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Clear error logs
  if (action === 'clear_logs') {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });
    const supabase = getServiceSupabase()!;
    const { error } = await supabase.from('error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Hata logları temizlendi' });
  }

  // Clear cron locks
  if (action === 'clear_cron_locks') {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });
    const supabase = getServiceSupabase()!;
    const { error } = await supabase.from('cron_locks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Cron kilitleri temizlendi' });
  }

  return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
}
