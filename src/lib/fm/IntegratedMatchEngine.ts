import { Player, MatchResult, ActiveTactic, LabSettings } from './types';
import { MATCH_COMMENTARY } from './commentary';
import { OPERATIONS } from './operations';
import { traitDescriptions } from './traits';

export interface MatchOptions {
  homeTactics: any;
  activeTactic: ActiveTactic;
  homeOperations: string[];
  startMinute?: number;
  currentScore?: { home: number; away: number };
  homeTeamName?: string;
  awayTeamName?: string;
  gameDay?: number;
  isDerby?: boolean;
  isBigMatch?: boolean;
  labSettings?: LabSettings;
  stadiumUpgrades?: Record<string, number>;
  isLabSimulation?: boolean;
}

class IntegratedMatchEngine {
  async runScheduledMatch(homeSquad: Player[], awaySquad: Player[], options: MatchOptions): Promise<MatchResult> {
    if (!homeSquad || homeSquad.length === 0 || !awaySquad || awaySquad.length === 0) {
      throw new Error("Match Engine Error: Home or Away squad is empty.");
    }

    const isDerby = options.isDerby || false;
    const isBigMatch = options.isBigMatch || false;
    
    // Pre-calculate team counters for performance
    const getCounters = (squad: Player[]) => {
      const counters = new Set<string>();
      squad.forEach(p => {
        [...(p.traits || []), ...(p.personalityTraits || [])].forEach(t => {
          const info = traitDescriptions[t];
          if (info?.counterFor) counters.add(info.counterFor);
        });
      });
      return counters;
    };

    const homeActiveCounters = getCounters(homeSquad);
    const awayActiveCounters = getCounters(awaySquad);

    const stadium = options.stadiumUpgrades || {};
    const lab = options.labSettings;
    
    // Helper to calculate total player influence
    const calculatePlayerInfluence = (p: Player, isHome: boolean) => {
      let influence = p.rating;
      
      // Morale override for lab
      let effMorale = p.morale;
      if (lab?.moraleMode === 'Collapsed') effMorale = 20;
      if (lab?.moraleMode === 'Hyper') effMorale = 100;

      // Stadium: Museum Effect (if I had it, but let's use scoreboards for morale)
      const scoreboardLvl = stadium['scoreboards'] || 0;
      if (isHome && scoreboardLvl > 0) {
        effMorale = Math.min(100, effMorale + (scoreboardLvl * 2));
      }

      // 1. Form & Morale Impact (Up to +/- 10%)
      const formBonus = (p.form - 70) / 300; 
      const moraleBonus = (effMorale - 70) / 500;
      influence *= (1 + formBonus + moraleBonus);

      // Stadium: Pitch Effect (Nano-Çim)
      const pitchLvl = stadium['pitch'] || 0;
      if (isHome && pitchLvl > 0) {
        // Boost passing related influence: Lvl 10 gives +15% 
        const passBoost = pitchLvl === 10 ? 0.15 : (pitchLvl * 0.01);
        influence *= (1 + passBoost); 
      }

      // Weather penalty (Snow/Rain impacts passing and balance)
      const heatingLvl = stadium['heating'] || 0;
      const thermalKalkan = isHome && (heatingLvl === 10 || (heatingLvl > 0 && Math.random() < heatingLvl * 0.1));
      
      if (!thermalKalkan) {
        if (lab?.weather === 'Rainy') influence *= 0.95;
        if (lab?.weather === 'Snowy') influence *= 0.90;
        if (lab?.ground === 'Muddy') influence *= 0.94;
      }

      // Lighting Effect (Lümen Operasyonu) - Level 10 GK bonus
      const lightingLvl = stadium['lighting'] || 0;
      if (isHome && lightingLvl === 10 && p.position === 'GK') {
        influence *= 1.10; // Reflex bonus
      }

      // Capacity Effect (Kolezyum Ölçeği) - Level 10 debuff
      const capLvl = stadium['capacity'] || 0;
      if (!isHome && capLvl === 10) {
        influence *= 0.95; // -5 Decision making impact roughly 5% debuff
      }

      // Scoreboards Effect (Analitik Ekranlar) - Level 10 xG debuff for Away
      if (!isHome && scoreboardLvl === 10) {
        influence *= 0.97; // Mental pressure from scoreboard data
      }

      // 2. Personality Trait & Tactical Trait Match-time impacts
      if (p.personalityTraits) {
        if (p.personalityTraits.includes('Profesyonel')) influence *= 1.02;
        if (p.personalityTraits.includes('Hırslı') && isBigMatch) influence *= 1.1;
        if (p.personalityTraits.includes('Büyük maç oyuncusu') && isBigMatch) influence *= 1.15;
        if (p.personalityTraits.includes('Derbi canavarı') && isDerby) influence *= 1.25;
        if (p.personalityTraits.includes('Kazanan karakter')) influence *= 1.05;
        if (p.personalityTraits.includes('Soğukkanlı')) influence *= 1.03;
        
        // Negative impacts
        if (p.personalityTraits.includes('Panikçi') && (isBigMatch || Math.random() < 0.1)) influence *= 0.85;
        if (p.personalityTraits.includes('Kırılgan mental') && p.morale < 50) influence *= 0.8;
      }

      // 2b. Detailed Trait Engine Effects from TRAITS_DATA
      [...(p.traits || []), ...(p.personalityTraits || [])].forEach(tName => {
        const info = traitDescriptions[tName];
        if (info?.engineEffect) {
          // Base engine weight impact (match engine effects)
          influence *= (1 + info.engineEffect.engineWeight);

          // Counter logic: if this player's trait counters an opponent's trait
          const opponentCounters = isHome ? awayActiveCounters : homeActiveCounters;
          const opponentHasCounterTrait = info.counterFor && [...(isHome ? awaySquad : homeSquad)].some(op => 
            [...(op.traits || []), ...(op.personalityTraits || [])].includes(info.counterFor!)
          );

          if (opponentHasCounterTrait) {
            // Apply successRate bonus for the counter
            influence *= (1 + info.engineEffect.successRate * 0.1); // Scaled for balance
          }
        }
      });

      // 3. Trait Level Impacts (Capsule impact)
      if (p.traitLevels) {
        Object.values(p.traitLevels).forEach(lvl => {
          if (lvl === 'MOR') influence *= 1.08;
          if (lvl === 'ALTIN') influence *= 1.04;
          if (lvl === 'LACIVERT') influence *= 1.02;
        });
      }

      return influence * (p.cond || 100) / 100;
    };

    let homeStrength = homeSquad.reduce((sum, p) => sum + calculatePlayerInfluence(p, true), 0) / (homeSquad.length || 1);
    let awayStrength = awaySquad.reduce((sum, p) => sum + calculatePlayerInfluence(p, false), 0) / (awaySquad.length || 1);
    
    // Goalkeeper Safeguard: Enforce presence of GKs for both teams
    const homeGK = homeSquad.find(p => p.position === 'GK');
    const awayGK = awaySquad.find(p => p.position === 'GK');
    
    if (!homeGK) homeStrength *= 0.65; // -35% Total efficiency without a dedicated GK
    if (!awayGK) awayStrength *= 0.65;
    
    // Squad Balance: Penalize if squads aren't full (especially in 9v9 simulation)
    if (homeSquad.length < 9) homeStrength *= (0.85 + (homeSquad.length / 9) * 0.15);
    if (awaySquad.length < 9) awayStrength *= (0.85 + (awaySquad.length / 9) * 0.15);

    // HOME ADVANTAGE
    let homeAdvantage = 1.1;
    const capacityLvl = stadium['capacity'] || 0;
    homeAdvantage += (capacityLvl * 0.02); // Up to 1.3x advantage at level 10

    if (homeSquad.some(p => p.personalityTraits?.includes('Baskı sever'))) homeAdvantage *= 1.05;
    if (homeSquad.some(p => p.personalityTraits?.includes('Taraftar baskısından etkilenir'))) homeAdvantage *= 0.95;

    homeStrength *= homeAdvantage;
    
    // SURPRISE FACTOR: Add more randomness to allow for "Sürpriz" results
    const homeSurprise = 0.85 + Math.random() * 0.3;
    const awaySurprise = 0.85 + Math.random() * 0.3;
    homeStrength *= homeSurprise;
    awayStrength *= awaySurprise;

    // Tactic multipliers
    const formationImpacts: Record<string, { offense: number; defense: number; control: number }> = {
      '4-4-2': { offense: 1.0, defense: 1.0, control: 1.0 },
      '4-3-3': { offense: 1.05, defense: 0.95, control: 1.0 },
      '3-5-2': { offense: 1.0, defense: 0.98, control: 1.05 },
      '5-4-1': { offense: 0.85, defense: 1.15, control: 1.0 },
      '4-2-3-1': { offense: 1.07, defense: 0.98, control: 1.1 },
      '3-4-3': { offense: 1.1, defense: 0.9, control: 1.0 },
      '4-1-4-1': { offense: 0.9, defense: 1.05, control: 1.1 },
      '4-3-2-1': { offense: 1.0, defense: 1.0, control: 1.15 },
      '5-3-2': { offense: 0.9, defense: 1.1, control: 1.0 },
      '4-3-1-2': { offense: 1.05, defense: 1.0, control: 1.05 },
      '3-1-4-2': { offense: 1.0, defense: 0.95, control: 1.1 },
      '4-4-1-1': { offense: 1.02, defense: 1.02, control: 1.0 },
      '4-5-1': { offense: 0.85, defense: 1.1, control: 1.15 },
      '3-3-3-1': { offense: 1.05, defense: 0.9, control: 1.12 },
    };

    // Operation Effects
    let luckMultiplier = 1.0;
    let refereeFavor = 0.5;
    let errorRateDebuff = 0;

    const activeOps: any[] = [];
    if (options.homeOperations?.length) {
      options.homeOperations.forEach(id => {
        const op = OPERATIONS.find((o: any) => o.id === id);
        if (op) activeOps.push(op);
      });
    }

    activeOps.forEach(op => {
      if (op.impactType === 'luck') luckMultiplier += op.impactValue;
      if (op.impactType === 'referee') refereeFavor += op.impactValue;
      if (op.impactType === 'error_rate') errorRateDebuff += op.impactValue;
    });

    // Tactical Parameter Modifiers
    // Prefer homeTactics (real-time adjustments) over activeTactic (base settings)
    const t = { ...(options.activeTactic as any), ...(options.homeTactics || {}) };

    const imp = formationImpacts[t.formation] || formationImpacts['4-4-2'];
    
    // Granular % Percentage Impacts based on tactical settings
    // Formation Balance
    homeStrength *= (imp?.control || 1.0); 
    
    const getPlayerHeight = (p: Player) => p.height || ((parseInt(p.id.replace(/[^0-9a-f]/gi, '').slice(0, 2) || '0', 16) % 30) + 170);

    const lh = t.lineHeight ?? 50; // Defense Line Height
    const w = t.width ?? 50; // Team Width
    const aggr = t.aggression ?? 50; // Pressure/Aggression
    const passInt = t.passingIntensity ?? 50; // Tempo
    const isScreening = t.screenKeeper ?? false;
    const isWastingTime = t.wasteTime ?? false;
    const isOffsideTrap = t.offsideTrap ?? false;
    
    // Offside Trap Calculation
    // Success depends on CB anticipation, positioning, concentration, teamwork
    const calculateOffsideTrapStrength = (squad: Player[]) => {
      const cbs = squad.filter(p => p.position === 'DEF' || ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.specificPosition || p.position));
      if (cbs.length === 0) return 0.15;
      
      // Average key mental attributes for offside trap
      const avgAttr = (attr: string) => cbs.reduce((sum, p) => sum + ((p as any)[attr] || 50), 0) / cbs.length;
      
      const anticipation = avgAttr('anticipation');
      const positioning = avgAttr('positioning');
      const concentration = avgAttr('concentration');
      const teamwork = avgAttr('teamwork');
      const decisions = avgAttr('decisions');
      const composure = avgAttr('composure');
      
      // Base trap success from mental attributes (weighted average)
      const mentalScore = (anticipation * 0.30 + positioning * 0.25 + concentration * 0.20 + teamwork * 0.15 + decisions * 0.05 + composure * 0.05) / 100;
      
      // High defensive line makes trap more effective
      const lineBonus = (lh - 50) / 200; // Up to +0.25 for very high line
      
      // More CBs = slightly better coordination
      const countBonus = Math.min(cbs.length - 2, 2) * 0.05;
      
      // offside_trap_cb role bonus
      const hasTrapCB = cbs.some(p => p.special_role === 'offside_trap_cb' || p.special_role === 'stopper');
      const roleBonus = hasTrapCB ? 0.12 : 0;
      
      // Communication/trait bonus
      const hasLeader = cbs.some(p => p.personalityTraits?.includes('Lider') || (p.leadership ?? 0) > 80);
      const leaderBonus = hasLeader ? 0.08 : 0;
      
      return Math.min(0.85, Math.max(0.10, mentalScore + lineBonus + countBonus + roleBonus + leaderBonus));
    };
    
    const homeTrapStrength = isOffsideTrap ? calculateOffsideTrapStrength(homeSquad) : 0.10;
    const awayTrapStrength = 0.10; // AI uses default low trap rate
    
    // Offside Trap Risk: When trap fails, defensive line is exposed
    const trapFailurePenalty = isOffsideTrap ? (1 - homeTrapStrength) * 0.20 : 0; // Up to 18% debuff on failed traps
    if (isOffsideTrap) {
      // High risk / high reward: Better defense if trap works, worse if it doesn't
      homeStrength *= (1 + homeTrapStrength * 0.08 - trapFailurePenalty * 0.5);
      // Offside trap synergizes with high line
      if (lh > 60) homeStrength *= 1.04;
    }
    
    // 1. Line Height Effect: High line improves recovery but risks counter-attacks
    homeStrength *= (1 + (lh - 50) / 500); // +/- 10% base
    if (lh > 70) awayStrength *= 1.15; // Risk of being countered increases (+15% for opponent)
    
    // 2. Width Effect: Wide team stretches play but leaves gaps
    if (w > 70) homeStrength *= 1.05; // Better offensive play
    if (w > 70 && awaySquad.some(p => p.traits?.includes('Kontra Atakçı'))) awayStrength *= 1.1; // Gaps exploited
    
    // 3. Pressure Interaction: High aggression improves recovery but risks cards/fouls
    homeStrength *= (1 + (aggr - 50) / 400); // +/- 12.5% impact
    
    // 4. Tempo (Passing Intensity)
    homeStrength *= (1 + (passInt - 50) / 600); // +/- 8% impact

    // NEW Tactical Constants
    const playStyle = t.playStyle || 'dengeli';
    const tempo = t.tempo || 'normal';
    const defLine = t.defensiveLine || 'normal';
    const intensity = t.intensity || 'normal';
    const mentality = t.mentality ?? 3;

    // 1. PlayStyle Multipliers
    if (playStyle === 'hucum') { homeStrength *= 1.12; awayStrength *= 1.10; } // High risk high reward
    if (playStyle === 'savunma') { homeStrength *= 0.95; awayStrength *= 0.85; } // Solidify defense
    if (playStyle === 'kontra') { homeStrength *= 1.08; awayStrength *= 1.05; } 
    if (playStyle === 'tikitaka') { homeStrength *= 1.05; } // Higher possession/control

    // 2. Tempo Multipliers
    if (tempo === 'hizli') { homeStrength *= 1.05; awayStrength *= 1.03; } // Faster game = more goals
    if (tempo === 'yavas') { homeStrength *= 0.95; awayStrength *= 0.95; } // Controlling game

    // 3. Defensive Line Multipliers
    if (defLine === 'onde') { homeStrength *= 1.08; awayStrength *= 1.12; } // High line = more offense but fragile back
    if (defLine === 'geride') { homeStrength *= 0.90; awayStrength *= 0.85; } // Park the bus

    // 4. Intensity Multipliers
    if (intensity === 'yuksek') { homeStrength *= 1.10; } 
    if (intensity === 'dusuk') { homeStrength *= 0.90; }

    // 5. Passing Style Multipliers
    const passStyle = t.passingStyle || 'Karışık';
    if (passStyle === 'Kısa') { homeStrength *= 1.05; } // More control
    if (passStyle === 'Uzun') { homeStrength *= 1.02; } // More direct

    // Aggression bonus: Ball recovery booster
    const aggressionBonus = 1 + (aggr / 100) * 0.4; // Up to 1.4x (40% as requested)
    homeStrength *= aggressionBonus;

    // Pass Intensity: Accuracy vs Speed
    const passingMult = 0.95 + (passInt / 100) * 0.1; // 0.95 to 1.05
    homeStrength *= passingMult;

    // Line Height Risk/Reward
    const lineHeightRisk = (lh / 100) * 0.15; // Up to 15% increase in concession risk if caught
    
    // Width impact on control
    const widthMult = 1 + (Math.abs(w - 50) / 100) * 0.05;
    homeStrength *= widthMult;

    // Special Roles logic
    homeSquad.forEach(p => {
      const role = p.special_role;
      if (!role) return;

      switch (role) {
        // GK Roles
        case 'sweeper_gk':
          homeStrength *= 1.02;
          // Reduces risk of high line (lh)
          if (lh > 60) homeStrength *= 1.03; 
          break;
        
        // DEF Roles
        case 'bpd':
          homeStrength *= 1.05; // Passing boost
          break;
        case 'wingback':
          homeStrength *= 1.06; // Width & Offense
          break;
        case 'stopper':
          awayStrength *= 0.95; // Reduces opponent offense
          homeStrength *= 1.02; 
          break;
        case 'enforcer':
          awayStrength *= 0.90; // Intimidation factor
          break;

        // MID Roles
        case 'bwm':
          awayStrength *= 0.94; // Ball winning
          homeStrength *= 1.02;
          break;
        case 'dlp':
          homeStrength *= 1.07; // Control & Distribution
          break;
        case 'btb':
          homeStrength *= 1.08; // High Workrate
          // Note: stamina loss handled later if needed
          break;
        case 'mezzala':
          homeStrength *= 1.05; 
          break;
        case 'playmaker':
          homeStrength *= 1.10; // Major control boost
          break;

        // FWD Roles
        case 'advanced_fwd':
          homeStrength *= 1.08;
          break;
        case 'target_man':
          homeStrength *= 1.05;
          // Extra bonus if tall players are present
          if (getPlayerHeight(p) > 185) homeStrength *= 1.05;
          break;
        case 'false_nine':
          homeStrength *= 1.06; // Link up play
          break;
        case 'inside_fwd':
          homeStrength *= 1.07;
          break;
        case 'sprinter':
          if (playStyle === 'kontra') homeStrength *= 1.10;
          else homeStrength *= 1.04;
          break;
      }
    });

    // Handle Away Squad Roles (Simulated or Basic for balance)
    awaySquad.forEach(p => {
        if (p.special_role === 'enforcer') homeStrength *= 0.95;
        if (p.special_role === 'playmaker') awayStrength *= 1.05;
    });

    homeStrength *= (imp.offense * luckMultiplier);
    awayStrength *= (1 - errorRateDebuff);

    // Screen Keeper boost
    if (isScreening) homeStrength *= 1.04;

    const events: any[] = [];
    let homeScore = options.currentScore?.home || 0;
    let awayScore = options.currentScore?.away || 0;
    let lastEventMinute = options.startMinute || 0;
    
    const startMin = options.startMinute || 0;

    const detailedHomePlayerStats: Record<string, { goals?: number, goalDetails: Record<string, number>, saveDetails: Record<string, number> }> = {};
    homeSquad.forEach(p => {
      detailedHomePlayerStats[p.id] = { goals: 0, goalDetails: {}, saveDetails: {} };
    });

    const detailedAwayPlayerStats: Record<string, { goals?: number, goalDetails: Record<string, number>, saveDetails: Record<string, number> }> = {};
    awaySquad.forEach(p => {
      detailedAwayPlayerStats[p.id] = { goals: 0, goalDetails: {}, saveDetails: {} };
    });

    const determineGoalType = (p: Player | null, isPenalty: boolean = false, isFreekick: boolean = false): string => {
      if (isPenalty) return 'penalty';
      if (isFreekick) return 'freekick';
      if (!p) return 'one_touch';
      
      const traits = [...(p.traits || []), ...(p.personalityTraits || [])];
      const weights: Record<string, number> = {
        plase: (p.finishing || 50) * 0.5,
        header: (p.heading || 50) * 0.5,
        one_touch: (p.firstTouch || 50) * 0.4,
        long_shot: (p.longShots || 50) * 0.4,
        sprint_finish: (p.speed || 50) * 0.3,
        postup_turn: (p.strength || 50) * 0.3
      };

      if (traits.includes('Uzaktan şutçu')) weights.long_shot *= 3;
      if (traits.includes('Bitirici')) weights.plase *= 2;
      if (traits.includes('Top saklayan')) weights.postup_turn *= 2.5;
      if (traits.includes('Sprinter')) weights.sprint_finish *= 2.5;
      if (p.heading && p.heading > 80) weights.header *= 2;

      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (const [key, val] of Object.entries(weights)) {
        if (rand < val) return key;
        rand -= val;
      }
      return 'one_touch';
    };

    const determineSaveType = (gk: Player | null, goalType: string): string => {
      if (goalType === 'penalty') return 'penalty';
      if (goalType === 'freekick') return 'freekick';
      if (goalType === 'long_shot') return 'long_shot';
      if (goalType === 'sprint_finish' || goalType === 'one_touch') return 'one_on_one';
      return 'shot_stopping';
    };

    const pickScorer = (squad: Player[]) => {
      const weights = squad.map(p => {
        const pos = p.position?.toUpperCase() || '';
        if (pos.includes('GK')) return 1;
        if (pos.includes('DF') || pos.includes('CB') || pos.includes('LB') || pos.includes('RB')) return 4;
        if (pos.includes('MF') || pos.includes('CM') || pos.includes('DM') || pos.includes('AM')) return 15;
        if (pos.includes('ST') || pos.includes('FW') || pos.includes('RW') || pos.includes('LW') || pos.includes('CF')) return 40;
        return 10;
      });
      
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      let random = Math.random() * totalWeight;
      for (let i = 0; i < squad.length; i++) {
        if (random < weights[i]) return squad[i];
        random -= weights[i];
      }
      return squad.length > 0 ? squad[Math.floor(Math.random() * squad.length)] : null;

    };

    let activeSequence: { type: string, stage: number, team: 'HOME' | 'AWAY', initiator?: Player, target?: Player, minute: number } | null = null;

    for (let m = startMin; m <= 90; m++) {
      if (m === 45 && startMin < 45) {
        events.push({ minute: 45, type: 'HALFTIME', text: 'İlk yarı sona erdi.' });
      }
      if (m === 90) {
        events.push({ minute: 90, type: 'FULLTIME', text: 'Maç sona erdi.' });
      }

      // Tactical Logic for Pressing Commentary
      const isHighPress = (intensity === 'yuksek' || aggr > 70);

      // --- SEQUENCE LOGIC ---
      if (activeSequence && m - activeSequence.minute > 2) {
        // Sequence too old, reset
        activeSequence = null;
      }

      const mentalityFactor = mentality / 3;
      let homeOffense = homeStrength * (1 + (mentality - 3) / 10);
      let awayOffense = awayStrength;

      if (homeScore < awayScore && homeSquad.some(p => p.personalityTraits?.includes('Geri dönüş lideri'))) homeOffense *= 1.15;
      if (awayScore < homeScore && awaySquad.some(p => p.personalityTraits?.includes('Geri dönüş lideri'))) awayOffense *= 1.15;

      const baseGoalChance = 0.015 * (homeOffense / awayStrength) * mentalityFactor;
      const baseAwayChance = 0.015 * (awayOffense / homeStrength);

      const roll = Math.random();
      let eventOccurred = false;

      // Handle sequence progression
      if (activeSequence) {
        const seq = activeSequence;
        const currentTeam = seq.team;
        const isHomeSeq = currentTeam === 'HOME';
        const attackerSquad = isHomeSeq ? homeSquad : awaySquad;
        const defenderSquad = isHomeSeq ? awaySquad : homeSquad;

        if (seq.stage === 1) {
          // Progress to final stage (The Chance)
          seq.stage = 2;
          seq.minute = m;
          
          if (seq.type === 'WING') {
            const p = seq.initiator || pickScorer(attackerSquad);
            events.push({
              minute: m,
              type: 'COMMENTARY',
              text: `{${currentTeam}:${p?.name}} sıfıra kadar indi, ceza sahasına bakıyor, ortası geliyor!`
            });
          } else if (seq.type === 'COUNTER') {
            events.push({
              minute: m,
              type: 'COMMENTARY',
              text: `Rakip savunma az kişiyle yakalandı! {${currentTeam}:name} topu hızla ileri taşıyor.`
            });
          } else if (seq.type === 'TIKITAKA') {
            events.push({
              minute: m,
              type: 'COMMENTARY',
              text: `Müthiş paslaşmalar! {${currentTeam}:name} ceza sahası yayında boşluk arıyor...`
            });
          }
          eventOccurred = true;
        } else if (seq.stage === 2) {
          // Final Result of Sequence
          const successChance = isHomeSeq ? 0.35 : 0.30; // High probability since we reached stage 2
          const isGoal = Math.random() < successChance;
          const scorer = pickScorer(attackerSquad);

          if (isGoal) {
            // Offside check — affected by offside trap tactic
            let offsideChance = 0.10;
            if (currentTeam === 'AWAY' && isOffsideTrap) {
              // Home team's offside trap actively tries to catch away attackers
              offsideChance = homeTrapStrength;
            } else if (currentTeam === 'HOME') {
              // Away team has default low trap
              offsideChance = awayTrapStrength;
            }
            
            // Speedy forwards are harder to trap
            const attackerSpeed = scorer?.speed || 50;
            if (attackerSpeed > 80) offsideChance *= 0.7;
            if (attackerSpeed > 90) offsideChance *= 0.6;
            
            // Through ball / counter attacks bypass trap more easily
            if (seq.type === 'COUNTER') offsideChance *= 0.5;
            if (seq.type === 'DIRECT') offsideChance *= 0.7;
            
            if (Math.random() < offsideChance) {
               events.push({
                minute: m,
                type: 'OFFSIDE',
                team: currentTeam,
                player: scorer?.name,
                text: currentTeam === 'AWAY' && isOffsideTrap 
                  ? `OFSAYT! Savunma hattı mükemmel zamanlamayla ileri atıldı! {${currentTeam}:${scorer?.name}} tuzağa düştü!`
                  : `OFSAYT! {${currentTeam}:${scorer?.name}} topu ağlara gönderdi ama yardımcı hakem bayrağını kaldırdı.`
              });
            } else {
              // RECORD GOAL
              if (isHomeSeq) homeScore++; else awayScore++;
              let gType = 'one_touch';
              if (seq.type === 'WING') gType = 'header';
              else if (seq.type === 'TIKITAKA') gType = 'plase';
              else if (seq.type === 'COUNTER') gType = 'sprint_finish';

              if (scorer) {
                if (isHomeSeq) {
                  const gd = detailedHomePlayerStats[scorer.id].goalDetails;
                  gd[gType] = (gd[gType] || 0) + 1;
                  detailedHomePlayerStats[scorer.id].goals = (detailedHomePlayerStats[scorer.id].goals || 0) + 1;
                } else {
                  const gd = detailedAwayPlayerStats[scorer.id].goalDetails;
                  gd[gType] = (gd[gType] || 0) + 1;
                  detailedAwayPlayerStats[scorer.id].goals = (detailedAwayPlayerStats[scorer.id].goals || 0) + 1;
                }
              }

              const goalTexts: Record<string, string> = {
                'WING': `GOL! Harika bir kafa vuruşu! {${currentTeam}:${scorer?.name}} tam köşeye!`,
                'COUNTER': `GOOOL! Kontra atak hızıyla sonuca gittiler! {${currentTeam}:${scorer?.name}} hata yapmadı.`,
                'TIKITAKA': `GOL! Şiir gibi bir organizasyon! {${currentTeam}:${scorer?.name}} son noktayı koydu.`,
                'DIRECT': `GOL! Savunmanın arkasına sızan {${currentTeam}:${scorer?.name}} affetmiyor!`
              };
              
              events.push({
                minute: m,
                type: 'GOAL',
                team: currentTeam,
                player: scorer?.name,
                text: goalTexts[seq.type] || `GOL! {${currentTeam}:${scorer?.name}} ağları havalandırıyor!`,
                goalType: gType as any,
                homeScore: isHomeSeq ? homeScore : homeScore,
                awayScore: isHomeSeq ? awayScore : awayScore,
                playerTraits: scorer?.traits,
                playerPersonality: scorer?.personalityTraits,
                playerGoalCount: isHomeSeq
                  ? (detailedHomePlayerStats[scorer?.id || '']?.goals || 0) + 1
                  : (detailedAwayPlayerStats[scorer?.id || '']?.goals || 0) + 1,
              });
            }
          } else {
            // Offside trap failure check — if home has trap active and this was an away attack,
            // there's a chance the trap broke and left them exposed
            if (currentTeam === 'AWAY' && isOffsideTrap && Math.random() < trapFailurePenalty) {
              // Trap failed! Defensive line is exposed, higher goal chance
              if (Math.random() < 0.45) {
                // GOAL because of broken trap
                awayScore++;
                events.push({
                  minute: m,
                  type: 'GOAL',
                  team: 'AWAY',
                  player: scorer?.name,
                  text: `OFSAYT TUZAĞI BOZULDU! Savunma hattı yarılınca {AWAY:${scorer?.name}} ceza sahasına tek başına girdi ve skoru buldu!`,
                  goalType: 'sprint_finish' as any,
                  homeScore,
                  awayScore,
                  playerTraits: scorer?.traits,
                  playerPersonality: scorer?.personalityTraits,
                });
                activeSequence = null;
                eventOccurred = true;
                continue;
              } else {
                // Trap broke but attacker couldn't finish — close call
                events.push({
                  minute: m,
                  type: 'COMMENTARY',
                  text: `Ofsayt tuzağı bozuldu! Savunma hattı yarıldı ama {AWAY:${scorer?.name}} son topu kaçırdı. Çok tehlikeli bir an!`
                });
                activeSequence = null;
                eventOccurred = true;
                continue;
              }
            }
            // MISSED OR SAVED
            const keeper = defenderSquad.find(p => p.position === 'GK');
            if (Math.random() < 0.4 && isHomeSeq && keeper) {
              // Home Away GK save
               events.push({
                minute: m,
                type: 'COMMENTARY',
                text: `İNANILMAZ KURTARIŞ! Kaleci parmaklarının ucuyla kornere çeldi.`
              });
            } else if (Math.random() < 0.4 && !isHomeSeq) {
              // Home GK Save
              const homeGK = homeSquad.find(p => p.position === 'GK');
              if (homeGK) {
                const sd = detailedHomePlayerStats[homeGK.id].saveDetails;
                sd['shot_stopping'] = (sd['shot_stopping'] || 0) + 1;
              }
               events.push({
                minute: m,
                type: 'COMMENTARY',
                text: `{HOME:${homeSquad.find(p => p.position === 'GK')?.name}} kalesinde devleşti! Müthiş bir kurtarış.`
              });
            } else {
              events.push({
                minute: m,
                type: 'COMMENTARY',
                text: `Az farkla dışarıda! {${currentTeam}:${scorer?.name}} için şanssız bir an.`
              });
            }
          }
          activeSequence = null;
          eventOccurred = true;
        }
      }

      if (!eventOccurred && !activeSequence) {
        // --- START NEW SEQUENCE CHANCE ---
        const hProb = baseGoalChance;
        const aProb = baseAwayChance;
        
        if (roll < hProb) {
           // Home Sequence Starts
           const typeRoll = Math.random();
           let sType = 'DIRECT';
           if (playStyle === 'tikitaka') sType = 'TIKITAKA';
           else if (playStyle === 'kontra' || typeRoll < 0.3) sType = 'COUNTER';
           else if (widthMult > 1.02 || typeRoll < 0.6) sType = 'WING';

           const initiator = pickScorer(homeSquad);
           activeSequence = { type: sType, stage: 1, team: 'HOME', minute: m, initiator: initiator || undefined };
           
           const startTexts: Record<string, string> = {
             'WING': `{HOME:${initiator?.name}} sol kanatta topla buluştu, hızla ilerliyor...`,
             'COUNTER': `Orta sahada kapılan top! {HOME:name} hemen kontra atağa kalkıyor!`,
             'TIKITAKA': `{HOME:name} ile pas trafiği başladı, rakip savunmayı yerleşmeden yakalamaya çalışıyorlar.`,
             'DIRECT': `Savunmadan uzun bir pas! {HOME:${initiator?.name}} topu göğsüyle yumuşattı.`
           };
           
           events.push({
             minute: m,
             type: 'COMMENTARY',
             text: startTexts[activeSequence.type]
           });
           eventOccurred = true;
        } else if (roll < hProb + aProb) {
           // Away Sequence Starts
           activeSequence = { type: 'DIRECT', stage: 1, team: 'AWAY', minute: m };
           events.push({
             minute: m,
             type: 'COMMENTARY',
             text: `Rakip {AWAY:name} tehlikeli geliyor, savunmamız hazırlıksız!`
           });
           eventOccurred = true;
        } else if (isHighPress && roll < 0.03) {
           // High Press Logic: Intercepting a potential away move
           events.push({
             minute: m,
             type: 'COMMENTARY',
             text: `Tam saha pres sonuç veriyor! Rakip oyun kurmakta zorlanıyor, fiziksel üstünlüğümüzü hissettiriyoruz.`
           });
           eventOccurred = true;
        } else if (isOffsideTrap && roll < 0.025) {
           // Offside Trap Commentary: Defensive coordination highlights
           const trapCommentaryPool = [
             `Savunma hattı mükemmel bir şekilde senkronize! Ofsayt tuzağı kusursuz çalışıyor.`,
             `Stoperler birlikte ileri atılıyor, rakip forvetler ofsayt çizgisinde sıkışmış durumda!`,
             `Ofsayt tuzağı devrede! Savunma hattının disiplini takdir topluyor.`,
             `Mükemmel zamanlama! Savunma hattı adeta tek bir vücut gibi hareket ediyor.`,
             `Rakip forvetler defans arkasına sızmaya çalışıyor ama ofsayt tuzağı her seferinde yakalıyor.`,
             `Geriye dört.stoperek dizilen savunma, ofsayt tuzağını başarıyla uyguluyor.`,
           ];
           events.push({
             minute: m,
             type: 'COMMENTARY',
             text: trapCommentaryPool[Math.floor(Math.random() * trapCommentaryPool.length)]
           });
           eventOccurred = true;
        }
      }
 else if (roll < 0.15 || (m - lastEventMinute > 8)) {
        // Generic Commentary (15% chance OR every 8 minutes guaranteed)
        let pool = [...MATCH_COMMENTARY.anytime];
        if (m < 20) pool = [...pool, ...MATCH_COMMENTARY.early];
        else if (m < 75) pool = [...pool, ...MATCH_COMMENTARY.mid];
        else pool = [...pool, ...MATCH_COMMENTARY.late];

        let comment = pool[Math.floor(Math.random() * pool.length)];
        
        // Replace placeholders if any
        if (comment.includes('{HOME:name}')) {
          const p = homeSquad.length > 0 ? homeSquad[Math.floor(Math.random() * homeSquad.length)] : null;
          comment = comment.replaceAll('{HOME:name}', p ? `{HOME:${p.name}}` : '{HOME:Kulüp}');
        }
        if (comment.includes('{AWAY:name}')) {
          const p = awaySquad.length > 0 ? awaySquad[Math.floor(Math.random() * awaySquad.length)] : null;
          comment = comment.replaceAll('{AWAY:name}', p ? `{AWAY:${p.name}}` : '{AWAY:Rakip}');
        }

        events.push({
          minute: m,
          type: 'COMMENTARY',
          text: comment
        });
        eventOccurred = true;
      }

      if (eventOccurred) lastEventMinute = m;
    }

    // Count offsides from events
    const homeOffsides = events.filter(e => e.type === 'OFFSIDE' && e.team === 'HOME').length;
    const awayOffsides = events.filter(e => e.type === 'OFFSIDE' && e.team === 'AWAY').length;
    // If offside trap is active, add extra base offsides (trap catches during non-goal sequences)
    const trapBonusOffsides = isOffsideTrap ? Math.floor(Math.random() * 3) + 1 : 0;

    const stats = {
      home: { 
        possession: Math.min(65, Math.max(35, 50 * (homeStrength / awayStrength) * imp.control)), 
        shots: Math.floor(8 + Math.random() * 8 * (homeStrength / awayStrength) * imp.offense), 
        shotsOnTarget: homeScore + Math.floor(Math.random() * 4), 
        passing: Math.floor(75 + Math.random() * 15),
        offsides: homeOffsides
      },
      away: { 
        possession: 0, 
        shots: Math.floor(6 + Math.random() * 6 * (awayStrength / homeStrength)), 
        shotsOnTarget: awayScore + Math.floor(Math.random() * 3), 
        passing: Math.floor(70 + Math.random() * 15),
        offsides: awayOffsides + trapBonusOffsides
      }
    };
    stats.away.possession = 100 - stats.home.possession;

    const playerRatings = homeSquad.reduce((acc, p) => {
      let r = 6.0 + Math.random() * 2;
      const playerName = p?.name || '';
      const goals = events.filter(e => e.type === 'GOAL' && e.player === playerName).length;
      r += goals * 1.5;
      return { ...acc, [p.id]: Math.min(10.0, r) };
    }, {});


    const motmId = Object.entries(playerRatings).sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
    const motmPlayer = homeSquad.find(p => p.id === motmId);

    const result = {
      score: { home: homeScore, away: awayScore },
      events,
      playerRatings,
      staminaLoss: options.isLabSimulation ? {} : homeSquad.reduce((acc, p) => ({ ...acc, [p.id]: 5 + Math.random() * 12 }), {}),
      playerStats: homeSquad.reduce((acc, p) => ({ 
        ...acc, 
        [p.id]: { 
          goals: events.filter(e => e.type === 'GOAL' && e.player === p.name && e.team === 'HOME').length, 
          assists: Math.random() > 0.7 ? 1 : 0,
          goalDetails: detailedHomePlayerStats[p.id]?.goalDetails || {},
          saveDetails: detailedHomePlayerStats[p.id]?.saveDetails || {}
        } 
      }), {}),
      stats,
      motm: motmPlayer?.name || 'Belirlenemedi'
    } as MatchResult;

    // --- INJURY SYSTEM ---
    if (!options.isLabSimulation) {
      const medicalLvl = stadium['medical'] || 0;
      const injuryProbBase = medicalLvl === 10 ? 0.0075 : (0.015 - (medicalLvl * 0.0005));

      const allPlayersInMatch = [...homeSquad, ...awaySquad];
      allPlayersInMatch.forEach(p => {
        // Adjusted probability per match
        const pIsHome = homeSquad.some(hp => hp.id === p.id);
        const prob = pIsHome ? injuryProbBase : 0.015;
        
        if (Math.random() < prob && !p.injury) {
          const typeRoll = Math.random();
          let injuryType: 'light' | 'chronic' | 'risky';
          let days = 3;
          
          if (typeRoll > 0.9) { injuryType = 'chronic'; days = 21 + Math.floor(Math.random() * 30); }
          else if (typeRoll > 0.6) { injuryType = 'risky'; days = 7 + Math.floor(Math.random() * 10); }
          else { injuryType = 'light'; days = 3 + Math.floor(Math.random() * 4); }
          
          p.injury = { type: injuryType, remaining_days: days, severity: typeRoll };
          
          if (homeSquad.some(hp => hp.id === p.id)) {
            result.events.push({ 
              minute: 90, 
              type: 'COMMENTARY', 
              text: `${p.name} maç sırasında bir sakatlık yaşadı! (${injuryType === 'light' ? 'Hafif' : (injuryType === 'chronic' ? 'Ciddi' : 'Ürkütücü')})` 
            });
          }
        }
      });
    }

    return result;
  }
}

export const integratedMatchEngine = new IntegratedMatchEngine();
