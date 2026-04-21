'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn, getLevelIcon, getLevel } from '@/lib/utils';
import { Avatar, ProgressBar } from '@/components/ui/index';

const STUDENT_NAV = [
  { href: '/student/dashboard', icon: '🏠', label: 'الرئيسية' },
  { href: '/student/subjects', icon: '📚', label: 'موادي' },
  { href: '/student/challenges', icon: '⚔️', label: 'التحديات' },
  { href: '/student/leaderboard', icon: '🏆', label: 'المتصدرون' },
  { href: '/student/progress', icon: '📊', label: 'تقدمي' },
  { href: '/student/ai-tutor', icon: '🤖', label: 'نبوغ AI' },
  { href: '/student/achievements', icon: '🏅', label: 'إنجازاتي' },
  { href: '/student/flashcards', icon: '🃏', label: 'بطاقات المراجعة' },
];

const TEACHER_NAV = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'الرئيسية' },
  { href: '/teacher/content/lessons', icon: '📝', label: 'الدروس' },
  { href: '/teacher/content/exercises', icon: '✏️', label: 'التمارين' },
  { href: '/teacher/students', icon: '👥', label: 'طلابي' },
  { href: '/teacher/classes', icon: '🏫', label: 'الفصول' },
  { href: '/teacher/analytics', icon: '📊', label: 'التحليلات' },
];

const PARENT_NAV = [
  { href: '/parent/dashboard', icon: '🏠', label: 'الرئيسية' },
  { href: '/parent/children', icon: '👨‍👧‍👦', label: 'أبنائي' },
  { href: '/parent/reports', icon: '📊', label: 'التقارير' },
  { href: '/parent/settings', icon: '⚙️', label: 'الإعدادات' },
];

export function Sidebar({ role, user }: { role: string; user: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const nav = role === 'teacher' ? TEACHER_NAV : role === 'parent' ? PARENT_NAV : STUDENT_NAV;
  const xp = user?.gamification?.xp || 0;
  const level = getLevel(xp);
  const { current, next, percent } = getLevelProgressLocal(xp);

  return (
    <aside className={cn('hidden md:flex flex-col bg-white border-l border-slate-100 shadow-sm transition-all duration-300 h-screen sticky top-0', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 font-cairo">ن</div>
        {!collapsed && <span className="font-black text-xl text-slate-800 font-cairo">نَبَغ</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="mr-auto text-slate-400 hover:text-slate-600 text-xs">
          {collapsed ? '←' : '→'}
        </button>
      </div>

      {/* User XP strip */}
      {!collapsed && role === 'student' && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">المستوى {level} {getLevelIcon(level)}</span>
            <span className="text-xs font-numbers text-primary-600 font-bold">{xp.toLocaleString()} XP</span>
          </div>
          <ProgressBar value={current} max={next} color="bg-gradient-to-r from-primary-500 to-secondary" size="sm" />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className={cn('font-cairo', active && 'font-semibold')}>{item.label}</span>}
              {!collapsed && active && <span className="mr-auto w-1.5 h-1.5 bg-primary-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + signout */}
      <div className="border-t border-slate-100 p-3">
        <Link href={`/${role}/profile`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
          <Avatar src={user?.profile?.avatar} name={user?.profile?.displayName || 'م'} size="sm" level={level} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.profile?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className={cn('flex items-center gap-2 text-xs text-slate-500 hover:text-red-500 transition mt-2', collapsed ? 'justify-center w-full p-2' : 'px-2 py-1.5')}>
          <span>🚪</span>
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const nav = (role === 'teacher' ? TEACHER_NAV : role === 'parent' ? PARENT_NAV : STUDENT_NAV).slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 flex">
      {nav.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href}
            className={cn('flex-1 flex flex-col items-center py-2 gap-0.5 text-center transition-colors', active ? 'text-primary-600' : 'text-slate-500')}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

function getLevelProgressLocal(xp: number) {
  const thresholds = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000, 999999];
  const level = getLevel(xp);
  const current = xp - thresholds[level - 1];
  const next = thresholds[level] - thresholds[level - 1];
  const percent = Math.round((current / next) * 100);
  return { current, next, percent };
}
