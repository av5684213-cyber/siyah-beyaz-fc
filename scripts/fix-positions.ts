/**
 * Fix player positions script
 * Updates players with missing/imbalanced specific_position values
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COMPATIBLE: Record<string, string[]> = {
  GK: [],
  CB: ['LB', 'RB', 'CDM'],
  LB: ['CB', 'LWB', 'LM'],
  RB: ['CB', 'RWB', 'RM'],
  LWB: ['LB', 'LM', 'LW'],
  RWB: ['RB', 'RM', 'RW'],
  CDM: ['CM', 'CB'],
  CM: ['CDM', 'CAM'],
  CAM: ['CM', 'CF'],
  LM: ['LW', 'LB', 'LWB', 'CM'],
  RM: ['RW', 'RB', 'RWB', 'CM'],
  LW: ['LM', 'ST', 'CF'],
  RW: ['RM', 'ST', 'CF'],
  CF: ['ST', 'CAM', 'LW', 'RW'],
  ST: ['CF', 'LW', 'RW'],
};

const MID_POSITIONS = ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'];
const FWD_POSITIONS = ['CF', 'ST'];

async function fixPositions() {
  console.log('=== Fixing Player Positions ===\n');

  // Step 1: Redistribute excess GK players to MID/FWD positions
  // Too many GKs (137) - convert some to other positions
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, position, specific_position, secondary_positions')
    .limit(2000);

  if (!allPlayers) {
    console.error('Could not fetch players');
    return;
  }

  console.log(`Total players: ${allPlayers.length}`);

  const posCount: Record<string, number> = {};
  for (const p of allPlayers) {
    const sp = p.specific_position || p.position;
    posCount[sp] = (posCount[sp] || 0) + 1;
  }
  console.log('Current distribution:', posCount);

  // Target: roughly balanced squad
  // GK: ~40, CB: ~80, LB: ~40, RB: ~40, LWB: ~25, RWB: ~25
  // CDM: ~40, CM: ~60, CAM: ~40, LM: ~30, RM: ~30, LW: ~30, RW: ~30
  // CF: ~30, ST: ~60
  // Total: ~600 (or whatever we have)
  
  const targetCounts: Record<string, number> = {};
  const total = allPlayers.length;
  const gkTarget = Math.round(total * 0.07);
  const defTarget = Math.round(total * 0.30);
  const midTarget = Math.round(total * 0.40);
  const fwdTarget = total - gkTarget - defTarget;
  
  targetCounts.GK = gkTarget;
  targetCounts.CB = Math.round(defTarget * 0.35);
  targetCounts.LB = Math.round(defTarget * 0.18);
  targetCounts.RB = Math.round(defTarget * 0.18);
  targetCounts.LWB = Math.round(defTarget * 0.14);
  targetCounts.RWB = Math.round(defTarget * 0.15);
  targetCounts.CDM = Math.round(midTarget * 0.14);
  targetCounts.CM = Math.round(midTarget * 0.20);
  targetCounts.CAM = Math.round(midTarget * 0.14);
  targetCounts.LM = Math.round(midTarget * 0.12);
  targetCounts.RM = Math.round(midTarget * 0.12);
  targetCounts.LW = Math.round(midTarget * 0.14);
  targetCounts.RW = Math.round(midTarget * 0.14);
  targetCounts.CF = Math.round(fwdTarget * 0.35);
  targetCounts.ST = Math.round(fwdTarget * 0.65);

  console.log('\nTarget distribution:', targetCounts);

  // Step 2: Find players to redistribute
  // Excess GKs (137 vs target ~40) → convert to MID/FWD
  // Excess CBs (287 vs target ~105) → convert to MID/FWD
  // Too few CM/CAM/LM/RM/LW/RW/CF/ST → need more

  interface Reassignment {
    id: string;
    oldPos: string;
    newPos: string;
    newGroup: string;
  }

  const reassignments: Reassignment[] = [];
  const currentCounts = { ...posCount };

  // Helper to assign to needed position
  const getNeededPosition = (exclude?: string): string | null => {
    // Priority: positions with biggest deficit
    const deficits: [string, number][] = [];
    for (const [pos, target] of Object.entries(targetCounts)) {
      if (pos === exclude) continue;
      const current = currentCounts[pos] || 0;
      const deficit = target - current;
      if (deficit > 0) deficits.push([pos, deficit]);
    }
    deficits.sort((a, b) => b[1] - a[1]);
    return deficits.length > 0 ? deficits[0][0] : null;
  };

  // Redistribute excess GK players
  const gkPlayers = allPlayers.filter(p => p.specific_position === 'GK');
  const excessGK = Math.max(0, (currentCounts.GK || 0) - targetCounts.GK);
  console.log(`\nExcess GKs to redistribute: ${excessGK}`);
  
  for (let i = 0; i < excessGK && i < gkPlayers.length; i++) {
    const newPos = getNeededPosition('GK');
    if (!newPos) break;
    
    const posGroup = ['CDM','CM','CAM','LM','RM','LW','RW'].includes(newPos) ? 'MID' : 
                     ['CF','ST'].includes(newPos) ? 'FWD' : 'DEF';
    
    reassignments.push({
      id: gkPlayers[i].id,
      oldPos: 'GK',
      newPos,
      newGroup: posGroup,
    });
    currentCounts.GK = (currentCounts.GK || 0) - 1;
    currentCounts[newPos] = (currentCounts[newPos] || 0) + 1;
  }

  // Redistribute excess CB players
  const cbPlayers = allPlayers.filter(p => p.specific_position === 'CB');
  const excessCB = Math.max(0, (currentCounts.CB || 0) - targetCounts.CB);
  console.log(`Excess CBs to redistribute: ${excessCB}`);
  
  for (let i = 0; i < excessCB && i < cbPlayers.length; i++) {
    const newPos = getNeededPosition('CB');
    if (!newPos) break;
    
    const posGroup = ['CDM','CM','CAM','LM','RM','LW','RW'].includes(newPos) ? 'MID' : 
                     ['CF','ST'].includes(newPos) ? 'FWD' : 'DEF';
    
    reassignments.push({
      id: cbPlayers[i].id,
      oldPos: 'CB',
      newPos,
      newGroup: posGroup,
    });
    currentCounts.CB = (currentCounts.CB || 0) - 1;
    currentCounts[newPos] = (currentCounts[newPos] || 0) + 1;
  }

  // Redistribute excess LWB players
  const lwbPlayers = allPlayers.filter(p => p.specific_position === 'LWB');
  const excessLWB = Math.max(0, (currentCounts.LWB || 0) - targetCounts.LWB);
  console.log(`Excess LWBs to redistribute: ${excessLWB}`);
  
  for (let i = 0; i < excessLWB && i < lwbPlayers.length; i++) {
    const newPos = getNeededPosition('LWB');
    if (!newPos) break;
    
    const posGroup = ['CDM','CM','CAM','LM','RM','LW','RW'].includes(newPos) ? 'MID' : 
                     ['CF','ST'].includes(newPos) ? 'FWD' : 'DEF';
    
    reassignments.push({
      id: lwbPlayers[i].id,
      oldPos: 'LWB',
      newPos,
      newGroup: posGroup,
    });
    currentCounts.LWB = (currentCounts.LWB || 0) - 1;
    currentCounts[newPos] = (currentCounts[newPos] || 0) + 1;
  }

  // Redistribute excess RWB players
  const rwbPlayers = allPlayers.filter(p => p.specific_position === 'RWB');
  const excessRWB = Math.max(0, (currentCounts.RWB || 0) - targetCounts.RWB);
  console.log(`Excess RWBs to redistribute: ${excessRWB}`);
  
  for (let i = 0; i < excessRWB && i < rwbPlayers.length; i++) {
    const newPos = getNeededPosition('RWB');
    if (!newPos) break;
    
    const posGroup = ['CDM','CM','CAM','LM','RM','LW','RW'].includes(newPos) ? 'MID' : 
                     ['CF','ST'].includes(newPos) ? 'FWD' : 'DEF';
    
    reassignments.push({
      id: rwbPlayers[i].id,
      oldPos: 'RWB',
      newPos,
      newGroup: posGroup,
    });
    currentCounts.RWB = (currentCounts.RWB || 0) - 1;
    currentCounts[newPos] = (currentCounts[newPos] || 0) + 1;
  }

  console.log(`\nTotal reassignments: ${reassignments.length}`);
  console.log('New distribution:', currentCounts);

  // Step 3: Apply reassignments
  let updated = 0;
  for (const r of reassignments) {
    // Generate secondary positions for the new position
    const compatibles = COMPATIBLE[r.newPos] || [];
    let secondaries: string[] = [];
    const roll = Math.random();
    if (roll < 0.06 && compatibles.length >= 2) {
      secondaries = [...compatibles].sort(() => 0.5 - Math.random()).slice(0, 2);
    } else if (roll < 0.24 && compatibles.length > 0) {
      secondaries = [compatibles[Math.floor(Math.random() * compatibles.length)]];
    }

    const { error } = await supabase
      .from('players')
      .update({ 
        position: r.newGroup,
        specific_position: r.newPos,
        secondary_positions: secondaries.length > 0 ? secondaries : null,
      })
      .eq('id', r.id);

    if (!error) updated++;
    else console.error(`Error updating ${r.id}: ${error.message}`);
  }
  console.log(`\nUpdated ${updated}/${reassignments.length} players`);

  // Step 4: Add secondary_positions to players that don't have them
  const { data: playersNoSecondary } = await supabase
    .from('players')
    .select('id, specific_position')
    .or('secondary_positions.is.null,and(specific_position.neq.GK)')
    .limit(1000);

  if (playersNoSecondary && playersNoSecondary.length > 0) {
    let secUpdated = 0;
    for (const p of playersNoSecondary) {
      if (p.specific_position === 'GK' || !p.specific_position) continue;
      const compatibles = COMPATIBLE[p.specific_position] || [];
      if (compatibles.length === 0) continue;

      let secondaries: string[] = [];
      const roll = Math.random();
      if (roll < 0.06 && compatibles.length >= 2) {
        secondaries = [...compatibles].sort(() => 0.5 - Math.random()).slice(0, 2);
      } else if (roll < 0.24) {
        secondaries = [compatibles[Math.floor(Math.random() * compatibles.length)]];
      }

      if (secondaries.length > 0) {
        const { error } = await supabase
          .from('players')
          .update({ secondary_positions: secondaries })
          .eq('id', p.id);
        if (!error) secUpdated++;
      }
    }
    console.log(`\nAdded secondary_positions to ${secUpdated} players`);
  }

  // Final distribution
  const { data: finalPlayers } = await supabase
    .from('players')
    .select('specific_position')
    .limit(2000);

  if (finalPlayers) {
    const finalCounts: Record<string, number> = {};
    for (const p of finalPlayers) {
      const sp = p.specific_position || 'UNKNOWN';
      finalCounts[sp] = (finalCounts[sp] || 0) + 1;
    }
    console.log('\nFinal distribution:', finalCounts);
  }
}

fixPositions().catch(console.error);
