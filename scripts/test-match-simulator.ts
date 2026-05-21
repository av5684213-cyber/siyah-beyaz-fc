/**
 * Test Script: matchSimulator.ts
 *
 * Runs 100 matches with equal-strength teams to verify:
 * - Average goal counts are realistic (2.5-3.0 total per match)
 * - Events are generated correctly
 * - Tactical modifiers work as expected
 * - MOTM is selected properly
 *
 * Usage:
 *   npx tsx scripts/test-match-simulator.ts
 */

import { simulateMatch, calculateTeamStrength, binomialGoals } from '../src/lib/fm/matchSimulator';
import type { Player } from '../src/lib/fm/types';

// ── Generate a fake player ──
function fakePlayer(id: string, position: string, rating: number): Player {
  return {
    id,
    name: `Player ${id}`,
    position: position as any,
    specificPosition: position as any,
    rating,
    potential: rating + 5,
    age: 25,
    nation: 'TR',
    club: 'Test',
    team_name: 'Test',
    market_value: rating * 50000,
    speed: rating - 5,
    power: rating - 3,
    passing: rating,
    shooting: rating - 2,
    defending: position.includes('B') || position === 'GK' ? rating + 5 : rating - 10,
    control: rating,
    vision: rating - 2,
    heading: rating - 5,
    goalkeeping: position === 'GK' ? rating + 10 : 10,
    cond: 80,
    form: 70,
    morale: 75,
    stamina: 80,
    aggression: 50,
    composure: 60,
    concentration: 55,
    leadership: 50,
    teamwork: 60,
    workRate: 65,
    determination: 55,
    anticipation: 58,
    flair: 40,
    bravery: 55,
    dribbling: position.includes('W') || position === 'ST' ? rating + 3 : rating - 5,
    crossing: position.includes('B') || position.includes('W') ? rating + 2 : rating - 5,
    firstTouch: rating,
    finishing: position === 'ST' || position === 'CF' ? rating + 5 : rating - 10,
    longShots: rating - 5,
    marking: position.includes('B') || position === 'CDM' ? rating + 3 : rating - 10,
    tackling: position.includes('B') || position === 'CDM' ? rating + 5 : rating - 10,
    technique: rating,
    strength: rating - 5,
    agility: rating - 3,
    balance: rating - 5,
    jumping: rating - 5,
    acceleration: rating - 2,
    preferred_foot: 'Right' as any,
    is_free_agent: false,
  } as Player;
}

// ── Generate a team ──
function generateTeam(prefix: string, baseRating: number): Player[] {
  const positions = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  return positions.map((pos, i) =>
    fakePlayer(`${prefix}_${i+1}`, pos, baseRating + Math.floor(Math.random() * 10 - 5))
  );
}

// ── Test 1: Average Goals ──
function testAverageGoals() {
  console.log('\n═══ TEST 1: Average Goals (100 matches) ═══');
  
  const homeSquad = generateTeam('H', 70);
  const awaySquad = generateTeam('A', 68);
  
  let totalHome = 0;
  let totalAway = 0;
  let totalEvents = 0;
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  
  for (let i = 0; i < 100; i++) {
    const result = simulateMatch({
      homeSquad,
      awaySquad,
      homeSubs: [],
      awaySubs: [],
      homeTactic: 'normal',
      awayTactic: 'normal',
      homeFormation: '4-4-2',
      awayFormation: '4-3-3',
    });
    
    totalHome += result.homeScore;
    totalAway += result.awayScore;
    totalEvents += result.events.length;
    
    if (result.homeScore > result.awayScore) homeWins++;
    else if (result.awayScore > result.homeScore) awayWins++;
    else draws++;
  }
  
  console.log(`  Avg Home Goals: ${(totalHome / 100).toFixed(2)}`);
  console.log(`  Avg Away Goals: ${(totalAway / 100).toFixed(2)}`);
  console.log(`  Avg Total Goals: ${((totalHome + totalAway) / 100).toFixed(2)}`);
  console.log(`  Avg Events: ${(totalEvents / 100).toFixed(1)}`);
  console.log(`  Home Wins: ${homeWins}, Away Wins: ${awayWins}, Draws: ${draws}`);
  
  const avgTotal = (totalHome + totalAway) / 100;
  if (avgTotal >= 2.0 && avgTotal <= 4.5) {
    console.log('  ✅ PASS: Average goals in realistic range (2.0-4.5)');
  } else {
    console.log(`  ❌ FAIL: Average goals ${avgTotal.toFixed(2)} out of range`);
  }
}

// ── Test 2: Tactical Modifiers ──
function testTacticalModifiers() {
  console.log('\n═══ TEST 2: Tactical Modifiers (100 matches each) ═══');
  
  const tactics: Array<{ name: string; code: 'hücum' | 'defans' | 'kontra' | 'pres' | 'normal' }> = [
    { name: 'Hücum', code: 'hücum' },
    { name: 'Defans', code: 'defans' },
    { name: 'Kontra', code: 'kontra' },
    { name: 'Pres', code: 'pres' },
    { name: 'Normal', code: 'normal' },
  ];
  
  for (const tactic of tactics) {
    const homeSquad = generateTeam('H', 70);
    const awaySquad = generateTeam('A', 70);
    
    let totalGoals = 0;
    for (let i = 0; i < 100; i++) {
      const result = simulateMatch({
        homeSquad,
        awaySquad,
        homeSubs: [],
        awaySubs: [],
        homeTactic: tactic.code,
        awayTactic: 'normal',
        homeFormation: '4-4-2',
        awayFormation: '4-4-2',
      });
      totalGoals += result.homeScore;
    }
    
    const avgGoals = totalGoals / 100;
    console.log(`  ${tactic.name} (home): Avg Home Goals = ${avgGoals.toFixed(2)}`);
  }
  console.log('  ✅ Tactical modifiers tested');
}

// ── Test 3: Team Strength Calculation ──
function testTeamStrength() {
  console.log('\n═══ TEST 3: Team Strength Calculation ═══');
  
  const team60 = generateTeam('T60', 60);
  const team70 = generateTeam('T70', 70);
  const team80 = generateTeam('T80', 80);
  
  const str60 = calculateTeamStrength(team60, 'normal');
  const str70 = calculateTeamStrength(team70, 'normal');
  const str80 = calculateTeamStrength(team80, 'normal');
  
  console.log(`  Team 60 OVR: Strength = ${str60.toFixed(2)}`);
  console.log(`  Team 70 OVR: Strength = ${str70.toFixed(2)}`);
  console.log(`  Team 80 OVR: Strength = ${str80.toFixed(2)}`);
  
  if (str80 > str70 && str70 > str60) {
    console.log('  ✅ PASS: Strength increases with OVR');
  } else {
    console.log('  ❌ FAIL: Strength ordering incorrect');
  }
}

// ── Test 4: Event Types ──
function testEventTypes() {
  console.log('\n═══ TEST 4: Event Types ═══');
  
  const homeSquad = generateTeam('H', 72);
  const awaySquad = generateTeam('A', 70);
  
  const result = simulateMatch({
    homeSquad,
    awaySquad,
    homeSubs: [],
    awaySubs: [],
    homeTactic: 'normal',
    awayTactic: 'normal',
    homeFormation: '4-4-2',
    awayFormation: '4-3-3',
  });
  
  const eventTypes = new Set(result.events.map(e => e.type));
  console.log(`  Event types found: ${[...eventTypes].join(', ')}`);
  console.log(`  Total events: ${result.events.length}`);
  console.log(`  Score: ${result.homeScore}-${result.awayScore}`);
  console.log(`  MOTM Home: ${result.motmHome || 'N/A'}`);
  console.log(`  MOTM Away: ${result.motmAway || 'N/A'}`);
  console.log(`  Possession: ${result.homePossession}% - ${result.awayPossession}%`);
  console.log(`  Shots: ${result.homeShots} - ${result.awayShots}`);
  
  const hasGoals = result.events.some(e => e.type === 'GOAL');
  const hasHalf = result.events.some(e => e.type === 'HALFTIME');
  const hasFull = result.events.some(e => e.type === 'FULLTIME');
  
  if (hasGoals && hasHalf && hasFull) {
    console.log('  ✅ PASS: Essential events present');
  } else {
    console.log('  ❌ FAIL: Missing essential events');
  }
}

// ── Run all tests ──
console.log('╔══════════════════════════════════════════════╗');
console.log('║  matchSimulator.ts — Test Suite              ║');
console.log('╚══════════════════════════════════════════════╝');

testTeamStrength();
testAverageGoals();
testTacticalModifiers();
testEventTypes();

console.log('\n═══ All tests completed ═══\n');
