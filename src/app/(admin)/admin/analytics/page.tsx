import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Lesson, Exercise } from '@/models/Content';
import { Card, ProgressBar } from '@/components/ui/index';
import { getLevel, formatNumber } from '@/lib/utils';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') redirect('/student/dashboard');
  await connectDB();

  const now = new Date();
  const periods = {
    today: new Date(now.setHours(0, 0, 0, 0)),
    week: new Date(Date.now() - 7 * 86400000),
    month: new Date(Date.now() - 30 * 86400000),
  };

  const [
    totalStudents, newToday, newThisWeek, newThisMonth,
    activeToday, activeThisWeek,
    avgXP, topLessons, topExercises,
    levelDist,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'student', createdAt: { $gte: periods.today } }),
    User.countDocuments({ role: 'student', createdAt: { $gte: periods.week } }),
    User.countDocuments({ role: 'student', createdAt: { $gte: periods.month } }),
    User.countDocuments({ role: 'student', isActive: true, lastLoginAt: { $gte: periods.today } }),
    User.countDocuments({ role: 'student', isActive: true, lastLoginAt: { $gte: periods.week } }),
    User.aggregate([{ $match: { role: 'student', isActive: true } }, { $group: { _id: null, avg: { $avg: '$gamification.xp' } } }]),
    Lesson.find({ isPublished: true }).sort({ 'stats.completions': -1 }).limit(5).select('title stats').lean() as unknown as any[],
    Exercise.find({ isPublished: true }).sort({ 'stats.attempts': -1 }).limit(5).select('title stats').lean() as unknown as any[],
    User.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: '$gamification.level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const avgXPVal = Math.round(avgXP[0]?.avg || 0);
  const retentionRate = totalStudents > 0 ? Math.round((activeThisWeek / totalStudents) * 100) : 0;
  const dailyActiveRate = totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0;

  const levelNames = ['مبتدئ', 'متعلم', 'دارس', 'متقدم', 'متميز', 'نابغة', 'عبقري', 'أسطورة'];
  const maxLevelCount = Math.max(...levelDist.map((l: any) => l.count), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">📊 تحليلات المنصة</h1>
        <p className="text-slate-500 text-sm mt-1">نظرة شاملة على بيانات المستخدمين والمحتوى</p>
      </div>

      {/* Growth metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلاب', value: formatNumber(totalStudents), sub: `+${newThisMonth} هذا الشهر`, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'جدد اليوم', value: newToday, sub: `${newThisWeek} هذا الأسبوع`, icon: '🆕', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'نشطون اليوم', value: `${dailyActiveRate}%`, sub: `${activeToday} طالب`, icon: '✅', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'الاحتفاظ الأسبوعي', value: `${retentionRate}%`, sub: `${activeThisWeek} طالب نشط`, icon: '🔄', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(m => (
          <Card key={m.label} className="p-4">
            <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{m.icon}</div>
            <div className={`text-2xl font-black font-numbers ${m.color}`}>{m.value}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{m.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Engagement metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'متوسط XP للطالب', value: formatNumber(avgXPVal), icon: '💎', desc: 'نقطة تجربة' },
          { label: 'معدل نشاط يومي', value: `${dailyActiveRate}%`, icon: '📈', desc: 'من إجمالي الطلاب' },
          { label: 'معدل الاحتفاظ', value: `${retentionRate}%`, icon: '🎯', desc: 'نشاط أسبوعي' },
        ].map(m => (
          <Card key={m.label} className="p-5 text-center">
            <div className="text-4xl mb-2">{m.icon}</div>
            <div className="text-3xl font-black text-slate-800 font-numbers">{m.value}</div>
            <div className="text-sm font-semibold text-slate-700 mt-1">{m.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
          </Card>
        ))}
      </div>

      {/* Level distribution */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-5 font-cairo">📊 توزيع المستويات</h3>
        <div className="space-y-3">
          {levelDist.map((ld: any) => {
            const levelNum = ld._id || 1;
            const levelName = levelNames[levelNum - 1] || 'مبتدئ';
            const icons = ['🌱','🌿','🌳','⭐','🌟','👑','💎','🏆'];
            return (
              <div key={levelNum} className="flex items-center gap-3">
                <div className="w-16 text-xs text-slate-500 shrink-0 text-left">{icons[levelNum-1]} {levelName}</div>
                <ProgressBar value={ld.count} max={maxLevelCount} size="md" className="flex-1"
                  color={`bg-gradient-to-r from-primary-${Math.min(400 + levelNum * 50, 700)} to-primary-${Math.min(500 + levelNum * 50, 800)}`} />
                <div className="w-12 text-xs font-bold text-slate-600 text-right font-numbers">{ld.count}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top content */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">🏆 أكثر الدروس إتماماً</h3>
          </div>
          <div className="p-5 space-y-3">
            {topLessons.map((l: any, i: number) => (
              <div key={l._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{i + 1}. {l.title}</span>
                  <span className="text-xs text-slate-500 font-numbers">✓ {l.stats?.completions || 0}</span>
                </div>
                <ProgressBar value={l.stats?.completions || 0} max={Math.max(topLessons[0]?.stats?.completions || 1, 1)} size="xs" />
              </div>
            ))}
            {topLessons.length === 0 && <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات</p>}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">✏️ أكثر التمارين محاولة</h3>
          </div>
          <div className="p-5 space-y-3">
            {topExercises.map((e: any, i: number) => (
              <div key={e._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{i + 1}. {e.title}</span>
                  <span className="text-xs text-slate-500 font-numbers">🔄 {e.stats?.attempts || 0}</span>
                </div>
                <ProgressBar value={e.stats?.attempts || 0} max={Math.max(topExercises[0]?.stats?.attempts || 1, 1)} size="xs" color="bg-green-500" />
              </div>
            ))}
            {topExercises.length === 0 && <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات</p>}
          </div>
        </Card>
      </div>

      {/* Registration trend (last 7 days) */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 font-cairo">📅 تسجيلات آخر 7 أيام</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-green-600 font-numbers">{newThisWeek}</div>
            <div className="text-xs text-slate-500">تسجيل جديد</div>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-4 text-sm text-green-700">
            <p className="font-semibold">معدل النمو الأسبوعي</p>
            <p className="mt-1 text-xs text-green-600">المنصة تنمو بمعدل {totalStudents > 0 ? Math.round((newThisWeek / totalStudents) * 100) : 0}% أسبوعياً</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
