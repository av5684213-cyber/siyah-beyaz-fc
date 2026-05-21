const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COMPATIBLE = {
  GK: [], CB: ['LB', 'RB', 'CDM'], LB: ['CB', 'LWB', 'LM'], RB: ['CB', 'RWB', 'RM'],
  LWB: ['LB', 'LM', 'LW'], RWB: ['RB', 'RM', 'RW'], CDM: ['CM', 'CB'],
  CM: ['CDM', 'CAM'], CAM: ['CM', 'CF'], LM: ['LW', 'LB', 'LWB', 'CM'],
  RM: ['RW', 'RB', 'RWB', 'CM'], LW: ['LM', 'ST', 'CF'], RW: ['RM', 'ST', 'CF'],
  CF: ['ST', 'CAM', 'LW', 'RW'], ST: ['CF', 'LW', 'RW'],
};

const POS_TO_GROUP = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'MID', RW: 'MID',
  CF: 'FWD', ST: 'FWD',
};

async function fix() {
  // Current: CB:93, CDM:116, CF:90, CM:67, GK:70, LB:103, LWB:39, RB:120, RWB:40, ST:262
  // Missing: CAM:0, LM:0, RM:0, LW:0, RW:0
  // Need to redistribute from over-represented positions

  const targets = {
    GK: 70, CB: 90, LB: 55, RB: 55, LWB: 40, RWB: 40,
    CDM: 60, CM: 80, CAM: 60, LM: 50, RM: 50, LW: 55, RW: 55,
    CF: 80, ST: 115,
  };

  // Fetch all players
  const { data: players } = await supabase.from('players').select('id, specific_position, secondary_positions').limit(2000);
  if (!players) { console.error('No players'); return; }

  // Group by position
  const byPos = {};
  for (const p of players) {
    const sp = p.specific_position || 'CM';
    if (!byPos[sp]) byPos[sp] = [];
    byPos[sp].push(p);
  }

  console.log('Before:', Object.fromEntries(Object.entries(byPos).map(([k,v]) => [k, v.length])));

  // Redistribute excess players
  const updates = [];
  
  // Excess ST (262 → 115): 147 players → distribute to CAM, LM, RM, LW, RW, CM
  const excessST = Math.max(0, (byPos.ST?.length || 0) - (targets.ST || 0));
  if (excessST > 0 && byPos.ST) {
    const stPlayers = byPos.ST.slice(0, excessST);
    const targetPositions = ['CAM', 'LM', 'RM', 'LW', 'RW', 'CM'];
    for (let i = 0; i < stPlayers.length; i++) {
      const newPos = targetPositions[i % targetPositions.length];
      if ((byPos[newPos]?.length || 0) < (targets[newPos] || 0)) {
        updates.push({ id: stPlayers[i].id, newPos, newGroup: POS_TO_GROUP[newPos] });
        if (!byPos[newPos]) byPos[newPos] = [];
        byPos[newPos].push(stPlayers[i]);
      }
    }
    byPos.ST = byPos.ST.slice(excessST);
  }

  // Excess CDM (116 → 60): 56 players → distribute to CAM, CM, LM, RM, LW, RW
  const excessCDM = Math.max(0, (byPos.CDM?.length || 0) - (targets.CDM || 0));
  if (excessCDM > 0 && byPos.CDM) {
    const cdmPlayers = byPos.CDM.slice(0, excessCDM);
    const targetPositions = ['CAM', 'CM', 'LM', 'RM'];
    for (let i = 0; i < cdmPlayers.length; i++) {
      const newPos = targetPositions[i % targetPositions.length];
      if ((byPos[newPos]?.length || 0) < (targets[newPos] || 0)) {
        updates.push({ id: cdmPlayers[i].id, newPos, newGroup: POS_TO_GROUP[newPos] });
        if (!byPos[newPos]) byPos[newPos] = [];
        byPos[newPos].push(cdmPlayers[i]);
      }
    }
    byPos.CDM = byPos.CDM.slice(excessCDM);
  }

  // Excess LB (103 → 55): distribute to LW, LM
  const excessLB = Math.max(0, (byPos.LB?.length || 0) - (targets.LB || 0));
  if (excessLB > 0 && byPos.LB) {
    const lbPlayers = byPos.LB.slice(0, excessLB);
    const targetPositions = ['LW', 'LM'];
    for (let i = 0; i < lbPlayers.length; i++) {
      const newPos = targetPositions[i % targetPositions.length];
      if ((byPos[newPos]?.length || 0) < (targets[newPos] || 0)) {
        updates.push({ id: lbPlayers[i].id, newPos, newGroup: POS_TO_GROUP[newPos] });
        if (!byPos[newPos]) byPos[newPos] = [];
        byPos[newPos].push(lbPlayers[i]);
      }
    }
    byPos.LB = byPos.LB.slice(excessLB);
  }

  // Excess RB (120 → 55): distribute to RW, RM
  const excessRB = Math.max(0, (byPos.RB?.length || 0) - (targets.RB || 0));
  if (excessRB > 0 && byPos.RB) {
    const rbPlayers = byPos.RB.slice(0, excessRB);
    const targetPositions = ['RW', 'RM'];
    for (let i = 0; i < rbPlayers.length; i++) {
      const newPos = targetPositions[i % targetPositions.length];
      if ((byPos[newPos]?.length || 0) < (targets[newPos] || 0)) {
        updates.push({ id: rbPlayers[i].id, newPos, newGroup: POS_TO_GROUP[newPos] });
        if (!byPos[newPos]) byPos[newPos] = [];
        byPos[newPos].push(rbPlayers[i]);
      }
    }
    byPos.RB = byPos.RB.slice(excessRB);
  }

  // Excess CF (90 → 80): distribute to CAM, LW, RW
  const excessCF = Math.max(0, (byPos.CF?.length || 0) - (targets.CF || 0));
  if (excessCF > 0 && byPos.CF) {
    const cfPlayers = byPos.CF.slice(0, excessCF);
    const targetPositions = ['CAM', 'LW', 'RW'];
    for (let i = 0; i < cfPlayers.length; i++) {
      const newPos = targetPositions[i % targetPositions.length];
      if ((byPos[newPos]?.length || 0) < (targets[newPos] || 0)) {
        updates.push({ id: cfPlayers[i].id, newPos, newGroup: POS_TO_GROUP[newPos] });
        if (!byPos[newPos]) byPos[newPos] = [];
        byPos[newPos].push(cfPlayers[i]);
      }
    }
    byPos.CF = byPos.CF.slice(excessCF);
  }

  console.log(`\nTotal reassignments: ${updates.length}`);

  // Apply updates in batches
  let updated = 0;
  for (const u of updates) {
    // Generate secondary positions
    const compatibles = COMPATIBLE[u.newPos] || [];
    let secondaries = [];
    const roll = Math.random();
    if (roll < 0.06 && compatibles.length >= 2) {
      secondaries = [...compatibles].sort(() => 0.5 - Math.random()).slice(0, 2);
    } else if (roll < 0.24 && compatibles.length > 0) {
      secondaries = [compatibles[Math.floor(Math.random() * compatibles.length)]];
    }

    const { error } = await supabase
      .from('players')
      .update({
        position: u.newGroup,
        specific_position: u.newPos,
        secondary_positions: secondaries.length > 0 ? secondaries : null,
      })
      .eq('id', u.id);

    if (!error) updated++;
  }
  console.log(`Updated ${updated}/${updates.length} players`);

  // Now add secondary_positions to remaining players without them
  const { data: noSecondary } = await supabase
    .from('players')
    .select('id, specific_position')
    .is('secondary_positions', null)
    .neq('specific_position', 'GK')
    .limit(500);

  if (noSecondary && noSecondary.length > 0) {
    let secUpdated = 0;
    for (const p of noSecondary) {
      const compatibles = COMPATIBLE[p.specific_position] || [];
      if (compatibles.length === 0) continue;
      let secondaries = [];
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
    console.log(`Added secondary_positions to ${secUpdated} players`);
  }

  // Final check
  const { data: finalPlayers } = await supabase.from('players').select('specific_position').limit(2000);
  if (finalPlayers) {
    const counts = {};
    for (const p of finalPlayers) {
      counts[p.specific_position] = (counts[p.specific_position] || 0) + 1;
    }
    console.log('\nFinal distribution:', counts);
  }
}

fix().catch(console.error);
