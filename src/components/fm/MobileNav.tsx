'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Shield,
  Swords,
  Globe,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  /** Optional: if provided, tab-based navigation is used (main page) */
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
  { id: 'tactics', label: 'Squad', icon: Shield, path: '/squad' },
  { id: 'matchday', label: 'Match', icon: Swords, path: '/' },
  { id: 'multiplayer', label: 'Market', icon: Globe, path: '/' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth sayfalarında (login/register) mobil nav bar'ı gizle
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  const getIsActive = (item: typeof NAV_ITEMS[number]) => {
    // If we have tab-based navigation (main page), use activeTab
    if (activeTab !== undefined && pathname === '/') {
      return activeTab === item.id;
    }
    // Otherwise check path
    if (item.path !== '/') {
      return pathname.startsWith(item.path);
    }
    return false;
  };

  const handleClick = (item: typeof NAV_ITEMS[number]) => {
    if (onTabChange && activeTab !== undefined && pathname === '/') {
      // Tab-based navigation on main page
      onTabChange(item.id);
    } else {
      // Route-based navigation on other pages
      if (item.path === '/') {
        router.push(item.path);
      } else {
        router.push(item.path);
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden" role="navigation" aria-label="Mobile navigation">
      <div className="w-full bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = getIsActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-white/30 hover:text-white/60'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
