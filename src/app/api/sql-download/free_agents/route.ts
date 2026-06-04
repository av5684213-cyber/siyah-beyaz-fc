import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

/**
 * GET /api/sql-download/free_agents
 * Serbest oyuncuların SQL INSERT ifadelerini indirir
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
  }

  try {
    const { data: agents, error } = await supabase
      .from('players')
      .select('*')
      .eq('is_free_agent', true)
      .limit(500);

    if (error) {
      return createErrorResponse(error, { route: '/api/sql-download/free_agents', method: 'GET' });
    }

    if (!agents || agents.length === 0) {
      // Serbest oyuncu yoksa örnek SQL döndür
      const emptySQL = `-- Serbest oyuncu bulunamadı\n-- Kullanılabilir oyuncular henüz oluşturulmamış.\nSELECT * FROM players WHERE is_free_agent = true;\n`;
      return new NextResponse(emptySQL, {
        headers: {
          'Content-Type': 'text/sql; charset=utf-8',
          'Content-Disposition': 'attachment; filename="free_agents.sql"',
        },
      });
    }

    // SQL INSERT ifadeleri oluştur
    const columns = Object.keys(agents[0]);
    let sql = `-- Serbest Oyuncular SQL Dump\n-- Tarih: ${new Date().toISOString()}\n-- Toplam: ${agents.length} oyuncu\n\n`;

    for (const agent of agents) {
      const values = columns.map(col => {
        const val = agent[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number' || typeof val === 'boolean') return String(val);
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      sql += `INSERT INTO players (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }

    sql += `\n-- End of dump\n`;

    return new NextResponse(sql, {
      headers: {
        'Content-Type': 'text/sql; charset=utf-8',
        'Content-Disposition': 'attachment; filename="free_agents.sql"',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
