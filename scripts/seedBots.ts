/**
 * seedBots.ts
 * 
 * 16 bot takım oluşturur. Her biri:
 * - Rastgele isim ve renk
 * - 19 oyuncu (GK:2, DEF:6, MID:6, FWD:5)
 * - 50M-100M kredi
 * - 1-3 zorluk seviyesi
 * 
 * Çalıştırma: npx tsx scripts/seedBots.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generatePlayer } from '../src/lib/fm/playerGenerator';
import { getTeamNamesForDepartment } from '../src/lib/fm/constants';

// Supabase config (from .env or hardcoded)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BOT_MANAGER_NAMES = [
  'Bot Alex', 'Bot Maria', 'Bot Chen', 'Bot Yuki',
  'Bot Omar', 'Bot Sofia', 'Bot Leo', 'Bot Ava',
  'Bot Max', 'Bot Zara', 'Bot Kai', 'Bot Lena',
  'Bot Hugo', 'Bot Mia', 'Bot Ravi', 'Bot Elif',
];

const BOT_REGIONS = ['TR', 'EU', 'SA', 'ASIA'];
const POSITION_GROUPS = [
  { pos: 'GK', count: 2 },
  { pos: 'DEF', count: 6 },
  { pos: 'MID', count: 6 },
  { pos: 'FWD', count: 5 },
];

function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

async function seedBots() {
  console.log('🤖 Bot seed başlatılıyor...\n');

  // Get team names from tier 4 departments
  const allTeamNames: string[] = [];
  for (let dept = 0; dept < 5; dept++) {
    const names = getTeamNamesForDepartment(4, dept);
    allTeamNames.push(...names);
  }

  // Shuffle
  for (let i = allTeamNames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTeamNames[i], allTeamNames[j]] = [allTeamNames[j], allTeamNames[i]];
  }

  const botNames = allTeamNames.slice(0, 16);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < 16; i++) {
    const teamName = botNames[i];
    const managerName = BOT_MANAGER_NAMES[i] || `Bot Manager ${i + 1}`;
    const difficulty = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
    const region = BOT_REGIONS[Math.floor(Math.random() * BOT_REGIONS.length)];
    const profileId = crypto.randomUUID();

    try {
      // 1. Create bot profile
      const { error: profError } = await supabase.from('profiles').insert({
        id: profileId,
        manager_name: managerName,
        team_name: teamName,
        money: 50_000_000 + Math.floor(Math.random() * 50_000_000),
        credits: 100,
        level: 1,
        xp: 0,
        fans: 1000 + Math.floor(Math.random() * 5000),
        reputation: 20 + Math.floor(Math.random() * 30),
        current_day: 1,
        ticket_price: 30,
        stadium_capacity: 8000 + Math.floor(Math.random() * 7000),
        region: region,
        philosophy: 'balanced',
        primary_color: randomColor(),
        secondary_color: randomColor(),
        is_bot: true,
        bot_difficulty: difficulty,
        created_at: new Date().toISOString(),
      });

      if (profError) {
        console.error(`❌ ${teamName}: Profile oluşturma hatası - ${profError.message}`);
        failCount++;
        continue;
      }

      // 2. Generate players
      const players: any[] = [];
      for (const { pos, count } of POSITION_GROUPS) {
        for (let j = 0; j < count; j++) {
          const p = generatePlayer(pos as any);
          players.push({
            ...p,
            position: pos,
            profile_id: profileId,
            team_name: teamName,
            nation: region === 'TR' ? 'Turkey' : region === 'EU' ? 'Germany' : region === 'SA' ? 'Brazil' : 'Japan',
          });
        }
      }

      // 3. Insert players in chunks
      const CHUNK_SIZE = 20;
      for (let c = 0; c < players.length; c += CHUNK_SIZE) {
        const chunk = players.slice(c, c + CHUNK_SIZE);
        const { error: playerError } = await supabase.from('players').insert(chunk);
        if (playerError) {
          console.error(`❌ ${teamName}: Oyuncu ekleme hatası - ${playerError.message}`);
        }
      }

      successCount++;
      console.log(`✅ ${teamName} (${managerName}) — Zorluk: ${difficulty}, Bölge: ${region}, ${players.length} oyuncu`);
    } catch (err) {
      console.error(`❌ ${teamName}: Beklenmeyen hata - ${err}`);
      failCount++;
    }
  }

  console.log(`\n🤖 Bot seed tamamlandı: ${successCount} başarılı, ${failCount} başarısız`);
}

seedBots().catch(console.error);
