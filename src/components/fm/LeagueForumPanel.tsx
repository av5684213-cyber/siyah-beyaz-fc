'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Send, MessageSquare } from 'lucide-react';

interface ForumPost {
  id: string;
  profile_id: string;
  team_name: string;
  content: string;
  created_at: string;
  likes: number;
}

export default function LeagueForumPanel({ userId, leagueId }: { userId: string; leagueId: string }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured() || !leagueId) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.from('profiles').select('team_name').eq('id', userId).maybeSingle()
      .then(({ data }) => { if (data) setTeamName(data.team_name || ''); });
    sb.from('league_forum_posts')
      .select('*').eq('league_id', leagueId)
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setPosts(data as ForumPost[]); });
  }, [userId, leagueId]);

  const handlePost = useCallback(async () => {
    if (!newPost.trim() || !isSupabaseConfigured() || submitting) return;
    setSubmitting(true);
    const sb = getSupabase();
    if (!sb) { setSubmitting(false); return; }
    try {
      const { data } = await sb.from('league_forum_posts').insert({
        profile_id: userId, league_id: leagueId,
        team_name: teamName, content: newPost.trim().slice(0, 280),
      }).select().maybeSingle();
      if (data) setPosts(prev => [data as ForumPost, ...prev]);
    } catch { /* sessizce geç */ }
    setNewPost('');
    setSubmitting(false);
  }, [newPost, userId, leagueId, teamName, submitting]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newPost}
          onChange={e => setNewPost(e.target.value.slice(0, 280))}
          placeholder="Lig hakkında ne düşünüyorsun?"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-white/20"
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
        />
        <button onClick={handlePost} disabled={submitting || !newPost.trim()}
          className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30">
          <Send size={14} />
        </button>
      </div>
      {posts.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare size={32} className="text-white/10 mx-auto mb-2" />
          <p className="text-[10px] text-white/20">Henüz yorum yok. İlk yazan sen ol!</p>
        </div>
      )}
      {posts.map((p, i) => (
        <motion.div key={p.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}
          className="p-3 bg-white/[0.03] border border-white/8 rounded-xl">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-[10px] font-black text-white/70">{p.team_name}</p>
            <p className="text-[10px] text-white/20">
              {new Date(p.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">{p.content}</p>
        </motion.div>
      ))}
    </div>
  );
}
