import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

const ADMIN_NAV = [
  { href: '/admin/dashboard', icon: '🏠', label: 'الرئيسية' },
  { href: '/admin/users', icon: '👥', label: 'المستخدمون' },
  { href: '/admin/content', icon: '📚', label: 'المحتوى' },
  { href: '/admin/analytics', icon: '📊', label: 'التحليلات' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');
  const role = (session.user as any).role;
  if (role !== 'admin') redirect('/student/dashboard');

  await connectDB();
  const user = await User.findById(session.user.id).select('profile email').lean() as any;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100" dir="rtl">
      {/* Admin sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-white h-screen sticky top-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary rounded-xl flex items-center justify-center text-white font-black font-cairo">ن</div>
          <div>
            <span className="font-black text-white font-cairo">نَبَغ</span>
            <div className="text-xs text-slate-400">لوحة الإدارة</div>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {ADMIN_NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-4 text-sm text-slate-400">
          <p className="truncate">{user?.email}</p>
          <p className="text-xs mt-0.5 text-slate-500">مدير النظام</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
