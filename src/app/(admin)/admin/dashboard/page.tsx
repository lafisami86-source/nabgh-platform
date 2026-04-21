import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Lesson, Exercise, Subject } from '@/models/Content';
import { Curriculum } from '@/models/Content';
import { Card, Badge, Avatar } from '@/components/ui/index';
import { formatNumber, getLevelIcon, getLevel } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') redirect('/student/dashboard');
  await connectDB();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers, dailyUsers, weeklyUsers, totalStudents, totalTeachers,
    totalLessons, publishedLessons, totalExercises,
    totalSubjects, topStudents, recentUsers,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true, createdAt: { $gte: dayAgo } }),
    User.countDocuments({ isActive: true, createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
    Exercise.countDocuments(),
    Subject.countDocuments({ isActive: true }),
    User.find({ role: 'student', isActive: true }).select('profile gamification').sort({ 'gamification.xp': -1 }).limit(5).lean() as unknown as any[],
    User.find({ isActive: true }).select('profile role createdAt').sort({ createdAt: -1 }).limit(8).lean() as unknown as any[],
  ]);

  const metrics = [
    { label: 'إجمالي المستخدمين', value: formatNumber(totalUsers), sub: `+${dailyUsers} اليوم`, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الطلاب النشطون', value: formatNumber(totalStudents), sub: `+${weeklyUsers} هذا الأسبوع`, icon: '🎓', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'المعلمون', value: formatNumber(totalTeachers), sub: 'مسجلون في المنصة', icon: '👩‍🏫', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'الدروس المنشورة', value: `${publishedLessons}/${totalLessons}`, sub: `${totalExercises} تمرين`, icon: '📚', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'المواد المتاحة', value: formatNumber(totalSubjects), sub: 'في المنصة', icon: '📖', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const roleLabels: Record<string, string> = { student: 'طالب', teacher: 'معلم', parent: 'ولي أمر', admin: 'مدير' };
  const roleColors: Record<string, any> = { student: 'primary', teacher: 'success', parent: 'warning', admin: 'error' };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-cairo">⚙️ لوحة الإدارة</h1>
            <p className="text-slate-400 mt-1">نظرة شاملة على منصة نَبَغ</p>
          </div>
          <div className="flex gap-3">
            <Link href="/api/seed">
              <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
                🌱 تهيئة البيانات
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="p-4">
            <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{m.icon}</div>
            <div className={`text-2xl font-black font-cairo ${m.color}`}>{m.value}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{m.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top students leaderboard */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-cairo">🏆 أفضل الطلاب</h3>
            <Link href="/admin/users" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topStudents.map((s: any, i) => {
              const level = getLevel(s.gamification?.xp || 0);
              return (
                <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`text-sm font-black w-6 text-center font-numbers ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <Avatar src={s.profile?.avatar} name={s.profile?.displayName || '?'} size="sm" level={level} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{s.profile?.displayName}</p>
                    <p className="text-xs text-slate-400">{getLevelIcon(level)} مستوى {level}</p>
                  </div>
                  <div className="text-sm font-black text-primary-600 font-numbers">{formatNumber(s.gamification?.xp || 0)} XP</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent registrations */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">🆕 آخر المسجلين</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentUsers.map((u: any) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                <Avatar src={u.profile?.avatar} name={u.profile?.displayName || '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{u.profile?.displayName}</p>
                  <p className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('ar', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <Badge color={roleColors[u.role] || 'gray'} size="xs">{roleLabels[u.role] || u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', icon: '👥', label: 'إدارة المستخدمين', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { href: '/admin/content', icon: '📚', label: 'إدارة المحتوى', color: 'bg-green-50 border-green-200 text-green-700' },
          { href: '/admin/analytics', icon: '📊', label: 'التحليلات', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { href: '/api/seed', icon: '🌱', label: 'تهيئة البيانات', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className={`border-2 rounded-xl p-4 text-center hover:shadow-md transition-all card-hover ${a.color}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-semibold text-sm font-cairo">{a.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Platform health */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-800 mb-4 font-cairo">🔧 حالة المنصة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'قاعدة البيانات', status: 'online', icon: '🗄️' },
            { label: 'OpenAI API', status: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'online' : 'warning', icon: '🤖' },
            { label: 'التخزين', status: 'online', icon: '📁' },
            { label: 'المصادقة', status: 'online', icon: '🔐' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-700">{s.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500' : s.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className={`text-xs ${s.status === 'online' ? 'text-green-600' : 'text-amber-600'}`}>
                    {s.status === 'online' ? 'يعمل' : s.status === 'warning' ? 'تحقق من الإعداد' : 'متوقف'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
