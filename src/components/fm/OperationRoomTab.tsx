'use client';

import React from 'react';
import { ComingSoon } from './UIComponents';
import { Zap } from 'lucide-react';

export default function OperationRoomTab({ userId }: { userId?: string }) {
  return <ComingSoon title="Operasyon Odası" icon={<Zap size={40} />} />;
}
