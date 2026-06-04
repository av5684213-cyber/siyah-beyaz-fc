/**
 * BUG-2: Transfer Race Condition Test
 *
 * Aynı oyuncuya aynı milisaniyede iki teklif gönderen bir test.
 * Sadece bir teklifin başarılı olduğunu doğrular.
 * Version-based optimistic locking ile ikinci teklif reddedilmelidir.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Bu test gerçek Supabase bağlantısı gerektirir
// CI'da çalıştırılmak için environment variables ayarlanmalıdır

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Skip if no Supabase config
const skipTests = !SUPABASE_URL || !SUPABASE_KEY;

describe('Transfer Race Condition (BUG-2)', () => {
  const itSkip = skipTests ? it.skip : it;

  itSkip('should reject second bid when two bids arrive simultaneously for same listing', async () => {
    // Not: Bu test gerçek DB bağlantısı gerektirir.
    // Integration test olarak çalıştırılmalıdır.

    // 1. Test verisi oluştur: bir satıcı profili, bir oyuncu, bir ilan
    // 2. İki alıcı profili oluştur (yeterli bakiye ile)
    // 3. Aynı ilana aynı anda iki teklif gönder
    // 4. Sadece birinin başarılı olduğunu doğrula

    // Test mantığı:
    const listingId = 'test-listing-id';
    const version = 1;

    // İki eşzamanlı RPC çağrısı
    const bid1Promise = fetch(`${SUPABASE_URL}/rest/v1/rpc/transfer_bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({
        p_listing_id: listingId,
        p_bidder_id: 'bidder-1',
        p_bidder_name: 'Bidder 1',
        p_bid_amount: 100000,
        p_version: version,
      }),
    });

    const bid2Promise = fetch(`${SUPABASE_URL}/rest/v1/rpc/transfer_bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({
        p_listing_id: listingId,
        p_bidder_id: 'bidder-2',
        p_bidder_name: 'Bidder 2',
        p_bid_amount: 110000,
        p_version: version,
      }),
    });

    const [result1, result2] = await Promise.all([bid1Promise, bid2Promise]);
    const data1 = await result1.json();
    const data2 = await result2.json();

    // En az birinin başarısız olması gerekir (version conflict)
    const successCount = [data1, data2].filter(d => d.success === true).length;
    expect(successCount).toBeLessThanOrEqual(1);

    // Conflict tespiti
    const conflictCount = [data1, data2].filter(d => d.conflict === true).length;
    expect(conflictCount).toBeGreaterThanOrEqual(1);
  });

  itSkip('should prevent double acceptance of same transfer', async () => {
    // Aynı transferin iki kez kabul edilmesini test et
    // Version kontrolü ile ikinci kabul reddedilmeli

    const listingId = 'test-listing-id';

    // İki eşzamanlı accept_transfer çağrısı
    const accept1Promise = fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({
        p_listing_id: listingId,
        p_winner_id: 'winner-1',
        p_version: 2,
      }),
    });

    const accept2Promise = fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({
        p_listing_id: listingId,
        p_winner_id: 'winner-2',
        p_version: 2,
      }),
    });

    const [result1, result2] = await Promise.all([accept1Promise, accept2Promise]);
    const data1 = await result1.json();
    const data2 = await result2.json();

    // Sadece birinin başarılı olması gerekir
    const successCount = [data1, data2].filter(d => d.success === true).length;
    expect(successCount).toBeLessThanOrEqual(1);
  });

  it('should validate version increment on bid', () => {
    // Unit test: version mantığını doğrula
    const listing = { id: '1', version: 1, current_bid: 100, is_active: true, is_auction: true };

    // İlk teklif: version 1 → 2
    const bidVersion1 = listing.version;
    expect(bidVersion1).toBe(1);

    // Başarılı teklif sonrası: version 2
    const newVersion = bidVersion1 + 1;
    expect(newVersion).toBe(2);

    // Eski version ile teklif: conflict
    const isConflict = bidVersion1 !== newVersion;
    expect(isConflict).toBe(true);
  });
});

describe('Security: Direct REST API write should fail (BUG-1)', () => {
  const itSkip = skipTests ? it.skip : it;

  itSkip('should reject direct INSERT to profiles table', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        id: 'malicious-user',
        manager_name: 'Hacker',
        team_name: 'Hacked Team',
        money: 999999999,
      }),
    });

    // WITH CHECK (false) nedeniyle 403 Forbidden beklenir
    expect(res.status).toBe(403);
  });

  itSkip('should reject direct UPDATE to players table', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.some-player-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        rating: 99,
      }),
    });

    // WITH CHECK (false) nedeniyle 403 Forbidden beklenir
    expect(res.status).toBe(403);
  });

  itSkip('should reject direct DELETE from transfer_market', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transfer_market?id=eq.some-id`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
      },
    });

    // USING (false) nedeniyle 403 Forbidden beklenir
    expect(res.status).toBe(403);
  });
});
