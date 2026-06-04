/**
 * BUG-5: Cascade Delete Test
 *
 * Bir profili silen ve bağlı tüm kayıtların otomatik silindiğini doğrulayan test.
 * Gerçek Supabase bağlantısı gerektirir.
 */

import { describe, it, expect } from '@jest/globals';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const skipTests = !SUPABASE_URL || !SERVICE_ROLE_KEY;

describe('Cascade Delete (BUG-5)', () => {
  const itSkip = skipTests ? it.skip : it;

  itSkip('should cascade delete all related records when profile is deleted', async () => {
    // 1. Test profili oluştur (service_role ile)
    const testProfileId = `test-cascade-${Date.now()}`;

    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id: testProfileId,
        manager_name: 'Test Manager',
        team_name: 'Test Team',
        money: 1000000,
        is_bot: false,
      }),
    });

    expect(createRes.status).toBeLessThan(300);

    // 2. Bağlı kayıtlar oluştur
    // Oyuncu ekle
    const playerRes = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        id: `player-${testProfileId}`,
        name: 'Test Player',
        position: 'MID',
        rating: 60,
        profile_id: testProfileId,
        team_name: 'Test Team',
      }),
    });
    expect(playerRes.status).toBeLessThan(300);

    // Taktik ekle
    const tacticRes = await fetch(`${SUPABASE_URL}/rest/v1/active_tactics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        id: testProfileId,
        profile_id: testProfileId,
        formation: '4-4-2',
        mentality: 3,
      }),
    });
    expect(tacticRes.status).toBeLessThan(300);

    // 3. Profili sil
    const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${testProfileId}`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    expect(deleteRes.status).toBeLessThan(300);

    // 4. Bağlı kayıtların silindiğini doğrula
    const { data: players } = await fetch(
      `${SUPABASE_URL}/rest/v1/players?profile_id=eq.${testProfileId}`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    ).then(r => r.json());
    expect(players.length).toBe(0);

    const { data: tactics } = await fetch(
      `${SUPABASE_URL}/rest/v1/active_tactics?profile_id=eq.${testProfileId}`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    ).then(r => r.json());
    expect(tactics.length).toBe(0);

    // 5. Profilin silindiğini doğrula
    const { data: profiles } = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${testProfileId}`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    ).then(r => r.json());
    expect(profiles.length).toBe(0);
  });
});
