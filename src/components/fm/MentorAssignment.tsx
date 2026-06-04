'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  ovr: number;
  leadership?: number;
}

interface MentorAssignment {
  mentor_id: string;
  mentee_id: string;
  bonus_rate: number;
  mentor_name?: string;
  mentee_name?: string;
}

interface MentorAssignmentProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  players: Player[];
}

export default function MentorAssignment({ open, onClose, userId, players }: MentorAssignmentProps) {
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [selectedMentee, setSelectedMentee] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  const eligibleMentors = players.filter(p => p.age >= 33);
  const eligibleMentees = players.filter(p => p.age <= 21);

  useEffect(() => {
    if (!open || !isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchAssignments = async () => {
      try {
        const { data } = await supabase
          .from('player_mentors')
          .select('*')
          .eq('profile_id', userId);

        if (data) {
          const enriched = data.map((a: any) => ({
            ...a,
            mentor_name: players.find(p => p.id === a.mentor_id)?.name,
            mentee_name: players.find(p => p.id === a.mentee_id)?.name,
          }));
          setAssignments(enriched);
        }
      } catch (err) {
        console.error('Mentor fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [open, userId, players]);

  const handleAssign = async () => {
    if (!selectedMentor || !selectedMentee || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setAssigning(true);
    try {
      const { data, error } = await supabase.rpc('assign_mentor', {
        p_mentor_id: selectedMentor,
        p_mentee_id: selectedMentee,
        p_profile_id: userId,
      });

      if (error) {
        console.error('Assign mentor error:', error.message);
      } else if (data?.success) {
        const mentor = players.find(p => p.id === selectedMentor);
        const mentee = players.find(p => p.id === selectedMentee);
        setAssignments(prev => [...prev, {
          mentor_id: selectedMentor,
          mentee_id: selectedMentee,
          bonus_rate: data.bonus_rate,
          mentor_name: mentor?.name,
          mentee_name: mentee?.name,
        }]);
        setSelectedMentor('');
        setSelectedMentee('');
      }
    } catch (err) {
      console.error('Mentor assignment error:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (menteeId: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('player_mentors').delete().eq('mentee_id', menteeId);
    setAssignments(prev => prev.filter(a => a.mentee_id !== menteeId));
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md bg-gray-900 border-white/10 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">🎓 Mentor Sistemi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 text-xs text-blue-200">
            33+ yaşındaki oyuncular 21 yaş altı oyunculara mentör olarak atanabilir. 
            Mentör atanmış genç oyuncular haftalık +%20-%30 ek gelişim kazanır.
          </div>

          {/* Current assignments */}
          {assignments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white/50 mb-2">Aktif Mentorluklar</h4>
              <div className="space-y-2">
                {assignments.map(a => (
                  <div key={a.mentee_id} className="flex items-center justify-between bg-white/5 rounded-lg p-2 text-xs">
                    <div>
                      <span className="text-amber-300">{a.mentor_name}</span>
                      <span className="text-white/30 mx-1">→</span>
                      <span className="text-blue-300">{a.mentee_name}</span>
                      <span className="text-green-400 ml-2">+{(a.bonus_rate * 100).toFixed(0)}%</span>
                    </div>
                    <button onClick={() => handleRemove(a.mentee_id)} className="text-red-400 hover:text-red-300 text-[10px]">Kaldır</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New assignment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/50">Yeni Atama</h4>
            
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Mentor (33+ yaş)</label>
              <select
                value={selectedMentor}
                onChange={e => setSelectedMentor(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="">Seçin...</option>
                {eligibleMentors.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.age} yaş, OVR {p.ovr})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1">Mentee (21 yaş altı)</label>
              <select
                value={selectedMentee}
                onChange={e => setSelectedMentee(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="">Seçin...</option>
                {eligibleMentees
                  .filter(p => !assignments.some(a => a.mentee_id === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.age} yaş, OVR {p.ovr})</option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              disabled={!selectedMentor || !selectedMentee || assigning}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50"
            >
              {assigning ? 'Atanıyor...' : 'Mentor Ata'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
