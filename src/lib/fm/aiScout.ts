export interface ScoutingReport {
  summary: string;
}

export async function generateScoutingReport(): Promise<ScoutingReport> {
  return { summary: 'Potansiyelli bir oyuncu bulundu.' };
}
