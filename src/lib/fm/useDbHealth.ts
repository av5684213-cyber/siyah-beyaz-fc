'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Player, ActiveTactic } from '@/lib/fm/types';
import {
  loadLastMatchResult,
  checkConnectionHealth,
  type ConnectionStatus,
} from '@/lib/fm/persistence';
import { isSupabaseConfigured } from '@/lib/supabase';
import { migrateLocalStorageToSupabase, type MigrationResult, checkSupabaseData } from '@/lib/fm/migration';
import { initFreeAgentsOnMarket } from '@/lib/fm/multiplayer';
import { FitnessManager } from '@/lib/fm/FitnessManager';
import { isTrainingTime } from '@/lib/fm/schedule';

export function useDbHealth(
  userId: string | null,
  squad: Player[],
  activeTactic: ActiveTactic,
  teamStats: Record<string, number>,
  setSquad: React.Dispatch<React.SetStateAction<Player[]>>
) {
  const [dbStatus, setDbStatus] = useState<ConnectionStatus>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [lastMatch, setLastMatch] = useState<{ result: any; homeTeamName: string; awayTeamName: string } | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);

  const handleCheckDb = useCallback(async () => {
    if (dbStatus === 'not_configured') {
      alert('Supabase henüz yapılandırılmamış.');
    } else {
      const health = await checkConnectionHealth();
      setDbStatus(health.status);
      setDbLatency(health.latency ?? null);
    }
  }, [dbStatus]);

  useEffect(() => {
    const checkDb = async () => {
      const health = await checkConnectionHealth();
      setDbStatus(health.status);
      setDbLatency(health.latency ?? null);

      const last = await loadLastMatchResult();
      if (last) setLastMatch(last);

      if (health.status === 'connected' && isSupabaseConfigured()) {
        if (userId) {
          const counts = await checkSupabaseData(userId);
          if (counts.players === 0) setShowMigrationBanner(true);
        }
        // Move free agents to market on startup if connected
        initFreeAgentsOnMarket();
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 300000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fitness restoration loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (isTrainingTime(now)) {
        const rehabLevel = teamStats.medical || 1;
        const intensity = activeTactic.intensity || 'normal';
        setSquad(prev => FitnessManager.restoreFitness(prev, rehabLevel, intensity));
      }
    }, 180000);
    return () => clearInterval(interval);
  }, [squad, activeTactic, teamStats, setSquad]);

  const handleMigrate = useCallback(async () => {
    setMigrating(true);
    try {
      const result = await migrateLocalStorageToSupabase('guest-manager');
      setMigrationResult(result);
      if (result.success) setShowMigrationBanner(false);
    } catch (err) {
      console.error('Migration error:', err);
    } finally {
      setMigrating(false);
    }
  }, []);

  return {
    dbStatus,
    dbLatency,
    migrating,
    migrationResult,
    showMigrationBanner,
    lastMatch,
    handleCheckDb,
    handleMigrate,
    setShowMigrationBanner,
    setMigrationResult,
    setLastMatch,
  };
}
