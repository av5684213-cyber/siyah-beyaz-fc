import { Operation, ActiveOperation, TrainingState, Profile } from './types';
import { OPERATIONS } from './operations';
import { DefenseManager } from './DefenseManager';

export class OperationManager {
  private static instance: OperationManager;
  
  private constructor() {}

  public static getInstance(): OperationManager {
    if (!OperationManager.instance) {
      OperationManager.instance = new OperationManager();
    }
    return OperationManager.instance;
  }

  public launchOperation(opId: string, state: TrainingState, budget: number): { state: TrainingState, cost: number, error?: string } {
    const op = OPERATIONS.find(o => o.id === opId);
    if (!op) return { state, cost: 0, error: 'Operation not found' };
    if (budget < op.cost) return { state, cost: 0, error: 'Insufficient funds' };

    const activeOps = state.activeOperations || [];
    
    // Check limit of 10
    const usageCount = activeOps.filter(ao => ao.operationId === opId).length;
    if (usageCount >= 10) return { state, cost: 0, error: `Bu operasyon maksimum kullanım sınırına (10) ulaştı.` };

    const newActiveOp: ActiveOperation = {
      id: Math.random().toString(36).substr(2, 9),
      operationId: opId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    return {
      state: {
        ...state,
        activeOperations: [...activeOps, newActiveOp]
      },
      cost: op.cost
    };
  }

  public resolveOperations(state: TrainingState, targetProfile?: Profile): { updatedState: TrainingState, reports: string[], scandalOccured: boolean } {
    const activeOps = state.activeOperations || [];
    const reports: string[] = [];
    let scandalOccured = false;

    const resolvedOps = activeOps.map(active => {
      if (active.status !== 'pending') return active;

      const op = OPERATIONS.find(o => o.id === active.operationId);
      if (!op) return { ...active, status: 'completed' as const };

      // DEFENSE LOGIC
      let successChance = op.successRate;
      let scandalRisk = op.scandalRisk;

      if (targetProfile && op.category) {
        successChance = DefenseManager.calculateSuccessChance(op.successRate, op.category, targetProfile);
        scandalRisk = op.scandalRisk * DefenseManager.getScandalReboundMultiplier(targetProfile, op.category);
      }

      const roll = Math.random();
      if (roll < successChance) {
        const text = `${op.name} BAŞARILI: ${op.description}`;
        reports.push(text);
        return { ...active, status: 'success' as const, resultText: text };
      } else {
        const scandalRoll = Math.random();
        if (scandalRoll < scandalRisk) {
          scandalOccured = true;
          const text = `SKANDAL: ${op.name} DEŞİFRE OLDU! SAVUNMA HATTI SİZE GÜLDÜ.`;
          reports.push(text);
          return { ...active, status: 'scandal' as const, resultText: text };
        }
        const text = `${op.name} BAŞARISIZ: Hedefin savunma kalkanları geçilemedi.`;
        reports.push(text);
        return { ...active, status: 'completed' as const, resultText: text };
      }
    });

    return {
      updatedState: {
        ...state,
        activeOperations: resolvedOps,
        operationReports: [...(state.operationReports || []), ...reports]
      },
      reports,
      scandalOccured
    };
  }

  /**
   * Simulates an enemy attack on the user's club to test defense mechanics.
   */
  public simulateEnemyAttack(userProfile: Profile, state: TrainingState): { updatedState: TrainingState, alertHeader?: string, alertText?: string } {
    const attackCategories = ['media', 'scouting', 'physical', 'legal', 'veto'];
    const category = attackCategories[Math.floor(Math.random() * attackCategories.length)];
    
    // Enemy success rate fluctuates based on day or difficulty
    const baseEnemySuccess = 0.4 + (Math.random() * 0.3);
    
    const finalSuccess = DefenseManager.calculateSuccessChance(baseEnemySuccess, category, userProfile);
    const didSucceed = Math.random() < finalSuccess;
    
    const reports = [...(state.operationReports || [])];
    let alertHeader;
    let alertText;

    if (didSucceed) {
      alertHeader = 'İSTİHBARAT: SALDIRI BAŞARILI';
      alertText = `Rakip grubun "${category}" odaklı siber sızması savunma hattınızı geçti. Bazı veriler kopyalandı.`;
      reports.push(`[DÜŞMAN] ${alertText}`);
    } else {
      alertHeader = 'SAVUNMA BAŞARILI';
      alertText = `Tesislerimize yönelik "${category}" sızma girişimi kalkanlarımıza çarparak başarısız oldu.`;
      reports.push(`[SAVUNMA] ${alertText}`);
    }

    return {
      updatedState: { ...state, operationReports: reports },
      alertHeader,
      alertText
    };
  }
}
