import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generatePlayerDemands } from '@/lib/fm/playerDemands';
import { checkApiRateLimit } from '@/lib/fm/apiSecurity';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

// ── POST: Submit contract offer ───────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ accepted: false, reason: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ accepted: false, reason: 'Database not available' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      listingId,
      playerId,
      buyerId: bodyBuyerId,
      buyerTeam,
      weeklySalary,
      contractWeeks,
      signingFee,
      isAuctionWin,
      auctionBidAmount,
      playerRating,
    } = body;
    const buyerId = getAuthenticatedUserId(request, bodyBuyerId);

    // -- Rate limit check --
    if (buyerId) {
      const rateLimitResponse = await checkApiRateLimit(buyerId, 'player_buy');
      if (rateLimitResponse) return rateLimitResponse;
    }

    // Validate required fields
    if (!listingId || !buyerId || !buyerTeam) {
      return NextResponse.json({ accepted: false, reason: 'Eksik bilgi.' }, { status: 400 });
    }

    if (!weeklySalary || weeklySalary <= 0) {
      return NextResponse.json({ accepted: false, reason: 'Gecersiz haftalik ucret.' }, { status: 400 });
    }

    if (!contractWeeks || contractWeeks < 1 || contractWeeks > 34) {
      return NextResponse.json({ accepted: false, reason: 'Sozlesme suresi 1-34 hafta arasinda olmali.' }, { status: 400 });
    }

    if (signingFee === undefined || signingFee < 0) {
      return NextResponse.json({ accepted: false, reason: 'Gecersiz imza ucreti.' }, { status: 400 });
    }

    // 1. Fetch the listing
    const { data: listing, error: fetchError } = await supabase
      .from('transfer_market')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    if (fetchError || !listing) {
      return NextResponse.json({ accepted: false, reason: 'Ilan bulunamadi.' }, { status: 404 });
    }

    if (!listing.is_active) {
      return NextResponse.json({ accepted: false, reason: 'Bu ilan artik aktif degil.' }, { status: 400 });
    }

    // 2. Fetch buyer profile
    const { data: buyerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', buyerId)
      .maybeSingle();

    if (profileError || !buyerProfile) {
      return NextResponse.json({ accepted: false, reason: 'Profil bulunamadi.' }, { status: 404 });
    }

    // 3. Check affordability
    const transferCost = isAuctionWin ? (auctionBidAmount || 0) : listing.price;
    
    if (Number(buyerProfile.credits) < signingFee) {
      return NextResponse.json({ accepted: false, reason: `Yetersiz Kredi! Imza ucreti icin ${signingFee} Kredi gerekiyor.` }, { status: 400 });
    }

    if (!isAuctionWin && Number(buyerProfile.money) < transferCost) {
      return NextResponse.json({ accepted: false, reason: 'Yetersiz butce!' }, { status: 400 });
    }

    // 4. Generate player demands and check if offer is within ±20%
    const demands = generatePlayerDemands(playerRating || 60);
    const salaryMidpoint = (demands.minWeeklySalary + demands.maxWeeklySalary) / 2;
    const signingFeeMidpoint = (demands.minSigningFee + demands.maxSigningFee) / 2;

    // Check if both salary and signing fee are within ±20% of the midpoint of demands
    const salaryInRange = weeklySalary >= salaryMidpoint * 0.8 && weeklySalary <= salaryMidpoint * 1.2;
    const feeInRange = signingFee >= signingFeeMidpoint * 0.8 && signingFee <= signingFeeMidpoint * 1.2;

    const accepted = salaryInRange && feeInRange;

    if (!accepted) {
      // Offer rejected - but no penalty for free agents
      const reasons: string[] = [];
      if (!salaryInRange) {
        reasons.push('Haftalik ucret oyuncunun beklentilerine uygun degil');
      }
      if (!feeInRange) {
        reasons.push('Imza ucreti oyuncunun beklentilerine uygun degil');
      }
      return NextResponse.json({
        accepted: false,
        reason: `Oyuncu teklifinizi reddetti. ${reasons.join('. ')}. Talepler: Haftalik ${demands.minWeeklySalary.toLocaleString()}-${demands.maxWeeklySalary.toLocaleString()} Euro, Imza ${demands.minSigningFee}-${demands.maxSigningFee} Kredi`,
      });
    }

    // 5. Offer accepted! Process the transfer

    // For auction wins: the auction price was already deducted by resolveExpiredAuctions
    // For free agents: deduct transfer price (money)
    if (!isAuctionWin) {
      // Deduct transfer price from buyer's money
      const { error: moneyError } = await supabase
        .from('profiles')
        .update({ money: Number(buyerProfile.money) - transferCost })
        .eq('id', buyerId);

      if (moneyError) {
        console.error('Error deducting money:', moneyError);
        return NextResponse.json({ accepted: false, reason: 'Transfer islemi basarisiz oldu.' }, { status: 500 });
      }

      // Credit seller (for free agents, seller is 'free-agent-system' - no profile to credit)
      if (listing.seller_id !== 'free-agent-system') {
        const TAX_RATE = 0.025;
        const sellerRevenue = transferCost - (transferCost * TAX_RATE);
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('money')
          .eq('id', listing.seller_id)
          .maybeSingle();
        if (sellerProfile) {
          await supabase
            .from('profiles')
            .update({ money: Number(sellerProfile.money) + sellerRevenue })
            .eq('id', listing.seller_id);
        }
      }
    }

    // Deduct signing fee (Kredi) from buyer
    const { error: creditsError } = await supabase
      .from('profiles')
      .update({ credits: Number(buyerProfile.credits) - signingFee })
      .eq('id', buyerId);

    if (creditsError) {
      console.error('Error deducting credits:', creditsError);
      return NextResponse.json({ accepted: false, reason: 'Kredi dusme islemi basarisiz oldu.' }, { status: 500 });
    }

    // Transfer player ownership
    // SAHİPLİK DOĞRULAMA: Satıcı doğrulaması — sadece ilan sahibinin oyuncusunu transfer et
    const { error: transferError } = await supabase
      .from('players')
      .update({
        profile_id: buyerId,
        team_name: buyerTeam,
        salary: weeklySalary,
        contract_end_week: contractWeeks,
        is_free_agent: false,
      })
      .eq('id', playerId || listing.player_id)
      .eq('profile_id', listing.seller_id); // Satıcı doğrulama

    if (transferError) {
      console.error('[contract-offer] Player transfer ownership check failed:', transferError.message);
      // Free agent transferlerinde seller_id = 'free-agent-system' → .eq() eşleşmez
      // Bu durumda seller_id kontrolü olmadan tekrar dene
      if (listing.seller_id === 'free-agent-system') {
        await supabase
          .from('players')
          .update({
            profile_id: buyerId,
            team_name: buyerTeam,
            salary: weeklySalary,
            contract_end_week: contractWeeks,
            is_free_agent: false,
          })
          .eq('id', playerId || listing.player_id);
      }
    }

    // Deactivate listing
    // SAHİPLİK DOĞRULAMA: Sadece ilan sahibinin ilanını deaktif et
    await supabase
      .from('transfer_market')
      .update({ is_active: false })
      .eq('id', listingId)
      .eq('seller_id', listing.seller_id);

    return NextResponse.json({
      accepted: true,
      player: listing.player_data,
      transferCost,
      signingFee,
      weeklySalary,
      contractWeeks,
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/contract-offer', method: 'POST' });
  }
}

// ── PUT: Sign auction contract (with penalty awareness) ───────────────
export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ accepted: false, reason: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ accepted: false, reason: 'Database not available' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      listingId,
      playerId,
      buyerId,
      buyerTeam,
      weeklySalary,
      contractWeeks,
      signingFee,
      auctionBidAmount,
      giveUp,
    } = body;

    if (giveUp) {
      // User gives up on the auction win - apply 5% penalty to seller
      const { data: listing } = await supabase
        .from('transfer_market')
        .select('*')
        .eq('id', listingId)
        .maybeSingle();

      if (listing && listing.seller_id !== 'free-agent-system') {
        const penalty = Math.round((auctionBidAmount || listing.current_bid || listing.price) * 0.05);
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('money')
          .eq('id', buyerId)
          .maybeSingle();
        
        if (buyerProfile && Number(buyerProfile.money) >= penalty) {
          // Deduct penalty from buyer
          await supabase
            .from('profiles')
            .update({ money: Number(buyerProfile.money) - penalty })
            .eq('id', buyerId);
          
          // Credit penalty to seller
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('money')
            .eq('id', listing.seller_id)
            .maybeSingle();
          
          if (sellerProfile) {
            await supabase
              .from('profiles')
              .update({ money: Number(sellerProfile.money) + penalty })
              .eq('id', listing.seller_id);
          }
        }
      }

      // Deactivate listing (player goes back to seller or remains unsold)
      await supabase
        .from('transfer_market')
        .update({ is_active: false })
        .eq('id', listingId);

      return NextResponse.json({ accepted: false, gaveUp: true, penalty: Math.round((auctionBidAmount || 0) * 0.05) });
    }

    // Sign the contract (same logic as POST for auction wins)
    return POST(request);

  } catch (err) {
    return createErrorResponse(err, { route: '/api/contract-offer', method: 'PUT' });
  }
}
