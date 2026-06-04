'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PlayerComparisonModalProps {
  open: boolean;
  onClose: () => void;
  player1: any;
  player2: any;
}

const TECHNICAL_ATTRS = ['finishing', 'passing', 'dribbling', 'crossing', 'long_shots', 'free_kicks', 'heading', 'tackling', 'ball_control', 'vision'];
const PHYSICAL_ATTRS = ['pace', 'acceleration', 'stamina', 'strength', 'agility', 'jumping'];
const MENTAL_ATTRS = ['composure', 'work_rate', 'positioning', 'leadership', 'concentration', 'decisions'];

export default function PlayerComparisonModal({ open, onClose, player1, player2 }: PlayerComparisonModalProps) {
  if (!player1 || !player2) return null;

  const categories = [
    { label: 'Teknik', key: 'technical' as const, attrs: TECHNICAL_ATTRS },
    { label: 'Fiziksel', key: 'physical' as const, attrs: PHYSICAL_ATTRS },
    { label: 'Zihinsel', key: 'mental' as const, attrs: MENTAL_ATTRS },
  ];

  const getAttrValue = (player: any, attr: string): number => {
    return player[attr] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">⚖️ Oyuncu Karşılaştırma</DialogTitle>
        </DialogHeader>

        {/* Headers */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-sm font-bold text-amber-300">{player1.name}</div>
            <div className="text-[10px] text-white/40">{player1.position} | OVR {player1.ovr}</div>
          </div>
          <div className="text-center text-white/20 text-xs">vs</div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-300">{player2.name}</div>
            <div className="text-[10px] text-white/40">{player2.position} | OVR {player2.ovr}</div>
          </div>
        </div>

        {/* Attribute comparison */}
        {categories.map(cat => (
          <div key={cat.key} className="mb-4">
            <h4 className="text-xs font-bold text-white/50 mb-2">{cat.label}</h4>
            <div className="space-y-1">
              {cat.attrs.map(attr => {
                const v1 = getAttrValue(player1, attr);
                const v2 = getAttrValue(player2, attr);
                const diff = v1 - v2;
                return (
                  <div key={attr} className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-[11px]">
                    <div className={`text-right ${diff > 0 ? 'text-green-400 font-bold' : diff < 0 ? 'text-white/40' : 'text-white/60'}`}>
                      {v1} {diff > 0 ? '▲' : ''}
                    </div>
                    <div className="text-white/30 text-center min-w-[80px] capitalize">
                      {attr.replace(/_/g, ' ')}
                    </div>
                    <div className={`text-left ${diff < 0 ? 'text-green-400 font-bold' : diff > 0 ? 'text-white/40' : 'text-white/60'}`}>
                      {diff < 0 ? '▲' : ''} {v2}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
