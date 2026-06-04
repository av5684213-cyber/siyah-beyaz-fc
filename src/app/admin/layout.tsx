'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Shield, LayoutDashboard, Users, UserCircle, Trophy,
  Swords, Database, Activity, ArrowLeft, Menu, X, Zap
} from 'lucide-react';
import Link from 'next/link';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Gösterge Paneli' },
  { href: '/admin/teams', icon: Shield, label: 'Takımlar' },
  { href: '/admin/users', icon: Users, label: 'Kullanıcılar' },
  { href: '/admin/players', icon: UserCircle, label: 'Oyuncular' },
  { href: '/admin/matches', icon: Swords, label: 'Maçlar' },
  { href: '/admin/leagues', icon: Trophy, label: 'Ligler' },
  { href: '/admin/system', icon: Database, label: 'Sistem' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      const email = user.email?.toLowerCase();
      if (email !== ADMIN_EMAIL) {
        router.replace('/');
        return;
      }
      setVerifying(false);
    }
  }, [user, authLoading, router]);

  if (authLoading || verifying) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Admin doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-white/5 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-wider">Admin Panel</h1>
                <p className="text-[9px] text-red-400/60 font-bold uppercase tracking-widest">Süper Yönetici</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={16} />
            Oyuna Dön
          </Link>
          <div className="mt-3 px-3 py-2 bg-zinc-800 rounded-xl">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Oturum</p>
            <p className="text-[11px] text-zinc-400 font-mono truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-red-500" />
            <span className="text-xs font-black uppercase">Admin</span>
          </div>
          <div className="w-8" />
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
