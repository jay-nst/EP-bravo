'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { href: '/daily', label: '오늘의지구' },
  { href: '/posts', label: '위성뷰' },
  { href: '/quiz', label: '퀴즈' },
  { href: '/explore', label: '탐색' },
  { href: '/map', label: '지도' },
  { href: '/chat', label: '채팅' },
  { href: '/portal', label: '내 주문' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header
      className="glass-header border-b sticky top-0 z-50"
      style={{ borderColor: 'var(--border)', height: 'var(--header-height)' }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/map"
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            EARTHPAPER
          </Link>
          <nav className="flex gap-0.5">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-sm rounded-md transition-colors"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? 'var(--surface-elevated)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text)';
                      e.currentTarget.style.background = 'var(--surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.background = 'var(--surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-md font-medium transition-colors"
              style={{
                background: 'var(--accent)',
                color: '#0E0E10',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
