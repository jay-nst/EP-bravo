'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@naraspace-technology/nds/components';
import { IconAlertOn } from '@naraspace-technology/nds/icons';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const renderBody = (n: Notification) => (
    <>
      <p className="text-body-sm-medium text-text-primary">{n.title}</p>
      <p className="text-body-sm-regular text-text-tertiary mt-2">{n.message}</p>
      <p className="text-body-xs-regular text-(--border) tabular-nums mt-4">
        {new Date(n.created_at).toLocaleString('ko-KR')}
      </p>
    </>
  );

  return (
    <div className="relative">
      <Button variant="text" iconOnly className="text-text-tertiary! [&_svg]:text-text-tertiary!" onClick={() => setOpen(!open)} aria-label="알림">
        <IconAlertOn />
      </Button>
      {unreadCount > 0 && (
        <Badge
          type="letter"
          status="important"
          className="absolute -top-2 -right-2 pointer-events-none bg-status-danger text-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}

      {/* NDS 에 Popover/Menu 가 없어 드롭다운 동작은 그대로 두고 표면·타이포만 NDS 로 */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }} />
          <div className="absolute right-0 top-full mt-8 w-320 z-50 overflow-hidden glass-panel rounded-md inset-ring-1 inset-ring-border-tertiary shadow-6">
            <div className="px-16 py-12 border-b border-border-tertiary">
              <p className="text-body-md-medium text-text-primary">알림</p>
            </div>
            <div className="max-h-320 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-body-sm-regular text-text-tertiary text-center py-32">
                  알림이 없습니다
                </p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    className={`px-16 py-12 transition-colors cursor-pointer border-b border-[rgba(42,42,47,0.5)] ${
                      !n.read ? 'bg-[rgba(27,191,168,0.05)]' : 'bg-transparent'
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {n.link ? (
                      <Link href={n.link} className="block">
                        {renderBody(n)}
                      </Link>
                    ) : (
                      renderBody(n)
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
