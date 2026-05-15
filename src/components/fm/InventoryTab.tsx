'use client';

import React from 'react';
import { ComingSoon } from './UIComponents';
import { Archive } from 'lucide-react';

export default function InventoryTab({ userId, onMarketRedirect }: { userId?: string, onMarketRedirect: () => void }) {
  return <ComingSoon title="Envanter" icon={<Archive size={40} />} />;
}
