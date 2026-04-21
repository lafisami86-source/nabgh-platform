import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Lesson, Exercise } from '@/models/Content';
import { Card, Badge, Avatar } from '@/components/ui/index';
import Link from 'next/link';

export default async function TeacherDashboardPage() {
  const session = await auth();
  await connectDB();

  const [user, myLessons, myExercises, students] = await Promise.all([
    User.findById(session!.user.id).select('profile teacherInfo').lean() as any,
    Lesson.find({ createdBy: session!.user.id }).sort({ createdAt: -1 }).limit(5).lean() as unknown as any[],
    Exercise.find({ createdBy: session!.user.id }).sort({ createdAt: -1 }).limit(5).lean() as unknown as any[],
    User.find({ role: 'student', isActive: true }).select('profile gamification').sort({ 'gamification.xp': -1 }).limit(10).lean() as unknown as any[],
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar src={user?.profile?.avatar} name={user?.profile?.displayName || 'م'} size="lg" />
          <div>
            <p className="text-emerald-100 text-sm">مرحباً 👋</p>
            <h1 className="text-2xl font-black font-cairo">{user?.profile?.displayName}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-emerald-100">
              <span>⭐ تقييم: {user?.teacherInfo?.rating?.average?.toFixed(1) || '—'}</span>
              <span>📚 {myLessons.length} درس</span>
              <span>✏️ {myExercises.length} تمرين</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/teacher/content/lessons/new', icon: '📝', label: 'درس جديد', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { href: '/teacher/content/exercises/new', icon: '✏️', label: 'تمرين جديد', color: 'bg-green-50 border-green-200 text-green-700' },
          { href: '/teacher/students', icon: '👥', label: 'طلابي', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { href: '/teacher/analytics', icon: '📊', label: 'التحليلات', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className={`border-2 rounded-xl p-4 text-center hover:shadow-md transition-all card-hover ${a.color}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-semibold text-sm font-cairo">{a.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Recent Lessons */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-cairo">آخر دروسي</h3>
            <Link href="/teacher/content/lessons" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {myLessons.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">لم تنشر أي دروس بعد</div>
            ) : myLessons.map((lesson: any) => (
              <Link key={lesson._id} href={`/teacher/content/lessons/${lesson._id}/edit`}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📖</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-500">{lesson.stats?.views || 0} مشاهدة • {lesson.stats?.completions || 0} إتمام</p>
                  </div>
                  <Badge color={lesson.isPublished ? 'success' : 'gray'} size="xs">
                    {lesson.isPublished ? 'منشور' : 'مسودة'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <Link href="/teacher/content/lessons/new">
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1.5 border-2 border-dashed border-primary-200 rounded-xl hover:border-primary-400 transition">
                + إضافة درس جديد
              </button>
            </Link>
          </div>
        </Card>

        {/* Students Overview */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-cairo">أفضل الطلاب</h3>
            <Link href="/teacher/students" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {students.map((s: any, i: number) => (
              <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                <div className="text-sm font-bold text-slate-400 w-5 font-numbers">#{i+1}</div>
                <Avatar src={s.profile?.avatar} name={s.profile?.displayName || '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{s.profile?.displayName}</p>
                  <p className="text-xs text-slate-500">{(s.gamification?.xp || 0).toLocaleString()} XP</p>
                </div>
                <span className="text-sm">{'🔥'.repeat(Math.min(3, Math.ceil((s.gamification?.streak?.current || 0) / 7)))}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
