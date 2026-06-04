import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processAgentResponse, getPlayerPersonality } from '@/lib/fm/agentMessageEngine';
import type { PlayerResponse } from '@/lib/fm/agentMessageEngine';
import { createErrorResponse } from '@/lib/api-error-handler';

// ── POST: Process manager's response to an agent message ────────────
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { messageId, playerId, response, profileId } = body as {
      messageId: string;
      playerId: string;
      response: PlayerResponse;
      profileId: string;
    };

    // Validate
    if (!messageId || !playerId || !response || !profileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validResponses: PlayerResponse[] = ['promise', 'list_for_sale', 'ignore', 'call_meeting'];
    if (!validResponses.includes(response)) {
      return NextResponse.json({ error: 'Invalid response type' }, { status: 400 });
    }

    // 1. Get the player's current data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, morale, personality, personalityTraits')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // 2. Get player personality
    const personality = getPlayerPersonality(player as any);

    // 3. Calculate effects
    const currentMorale = player.morale ?? 50;
    const result = processAgentResponse(response, currentMorale, personality);

    // 4. Apply morale change to player
    const { error: moraleError } = await supabase
      .from('players')
      .update({ morale: result.newMorale })
      .eq('id', playerId);

    if (moraleError) {
      console.error('[agent-messages/respond] Morale update error:', moraleError);
    }

    // 5. Apply loyalty change to personality JSONB
    if (result.loyaltyChange !== 0) {
      const updatedPersonality = {
        ...personality,
        loyalty: Math.max(1, Math.min(20, personality.loyalty + result.loyaltyChange)),
      };
      await supabase
        .from('players')
        .update({ personality: updatedPersonality })
        .eq('id', playerId);
    }

    // 6. Handle 'list_for_sale' response
    if (response === 'list_for_sale') {
      await supabase
        .from('players')
        .update({ is_for_sale: true })
        .eq('id', playerId);
    }

    // 7. Handle 'call_meeting' — create follow-up message
    if (response === 'call_meeting' && result.followUpMessage) {
      await supabase
        .from('agent_messages')
        .insert({
          profile_id: profileId,
          player_id: playerId,
          message_type: 'morale',
          message_text: result.followUpMessage,
          is_read: false,
        });
    }

    return NextResponse.json({
      success: true,
      moraleChange: result.moraleChange,
      loyaltyChange: result.loyaltyChange,
      newMorale: result.newMorale,
      followUpMessage: result.followUpMessage,
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/agent-messages/respond', method: 'POST' });
  }
}
