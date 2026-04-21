'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnread(data.data.unread || 0);
      }
    } catch {}
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(p => Math.max(0, p - 1));
  }

  async function markAllRead() {
    await Promise.all(notifications.filter(n => !n.isRead).map(n => fetch(`/api/notifications/${n._id}`, { method: 'PUT' })));
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  }

  const TYPE_ICONS: Record<string, string> = {
    achievement: '🏆', badge: '🏅', streak: '🔥', reminder: '⏰',
    challenge: '⚔️', message: '💬', progress: '📊', system: '⚙️', social: '👥',
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition">
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center font-numbers">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">الإشعارات</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">قراءة الكل</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-slate-500 text-sm">لا توجد إشعارات</p>
              </div>
            ) : notifications.slice(0, 10).map(n => (
              <button key={n._id} onClick={() => markRead(n._id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-right hover:bg-slate-50 transition border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-primary-50/50' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || '📬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{n.body}</p>}
                  <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
