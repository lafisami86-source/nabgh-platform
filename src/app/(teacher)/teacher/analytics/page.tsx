import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Lesson, Exercise } from '@/models/Content';
import { Card, ProgressBar } from '@/components/ui/index';

export default async function TeacherAnalyticsPage() {
  const session = await auth();
  await connectDB();

  const [myLessons, myExercises, allStudents] = await Promise.all([
    Lesson.find({ createdBy: session!.user.id, isPublished: true }).select('title stats').lean() as unknown as any[],
    Exercise.find({ createdBy: session!.user.id, isPublished: true }).select('title stats').lean() as unknown as any[],
    User.find({ role: 'student', isActive: true }).select('gamification createdAt').lean() as unknown as any[],
  ]);

  const totalViews = myLessons.reduce((s, l) => s + (l.stats?.views || 0), 0);
  const totalCompletions = myLessons.reduce((s, l) => s + (l.stats?.completions || 0), 0);
  const avgRating = myLessons.length > 0
    ? (myLessons.reduce((s, l) => s + (l.stats?.avgRating || 0), 0) / myLessons.length).toFixed(1)
    : '—';
  const totalAttempts = myExercises.reduce((s, e) => s + (e.stats?.attempts || 0), 0);
  const avgScore = myExercises.length > 0
    ? Math.round(myExercises.reduce((s, e) => s + (e.stats?.avgScore || 0), 0) / myExercises.length)
    : 0;

  const topLessons = [...myLessons].sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0)).slice(0, 5);
  const topExercises = [...myExercises].sort((a, b) => (b.stats?.attempts || 0) - (a.stats?.attempts || 0)).slice(0, 5);

  // Student XP distribution
  const xpBuckets = [
    { label: '0 - 500', min: 0, max: 500 },
    { label: '500 - 2K', min: 500, max: 2000 },
    { label: '2K - 5K', min: 2000, max: 5000 },
    { label: '5K - 10K', min: 5000, max: 10000 },
    { label: '10K+', min: 10000, max: Infinity },
  ];
  const bucketCounts = xpBuckets.map(b => ({
    ...b, count: allStudents.filter(s => (s.gamification?.xp || 0) >= b.min && (s.gamification?.xp || 0) < b.max).length,
  }));
  const maxBucket = Math.max(...bucketCounts.map(b => b.count), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">📊 التحليلات</h1>
        <p className="text-slate-500 text-sm mt-1">إحصائيات أداء المحتوى والطلاب</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '👁', label: 'مشاهدات الدروس', value: totalViews.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: '✅', label: 'إتمامات الدروس', value: totalCompletions.toLocaleString(), color: 'text-green-600', bg: 'bg-green-50' },
          { icon: '⭐', label: 'متوسط التقييم', value: avgRating, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: '✏️', label: 'محاولات التمارين', value: totalAttempts.toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className={`text-2xl font-black font-numbers ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top lessons by views */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">🔝 أكثر الدروس مشاهدة</h3>
          </div>
          <div className="p-5 space-y-3">
            {topLessons.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات بعد</p>
            ) : topLessons.map((lesson, i) => (
              <div key={lesson._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 truncate flex-1 ml-3">{i + 1}. {lesson.title}</span>
                  <span className="text-xs text-slate-500 font-numbers shrink-0">{lesson.stats?.views || 0} 👁</span>
                </div>
                <ProgressBar value={lesson.stats?.views || 0} max={Math.max(topLessons[0]?.stats?.views || 1, 1)} size="xs" />
              </div>
            ))}
          </div>
        </Card>

        {/* Top exercises */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 font-cairo">✏️ أكثر التمارين محاولة</h3>
          </div>
          <div className="p-5 space-y-3">
            {topExercises.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات بعد</p>
            ) : topExercises.map((ex, i) => (
              <div key={ex._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 truncate flex-1 ml-3">{i + 1}. {ex.title}</span>
                  <span className="text-xs text-slate-500 font-numbers shrink-0">{ex.stats?.attempts || 0} محاولة</span>
                </div>
                <ProgressBar value={ex.stats?.attempts || 0} max={Math.max(topExercises[0]?.stats?.attempts || 1, 1)} size="xs" color="bg-green-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* XP Distribution chart */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-5 font-cairo">💎 توزيع نقاط XP بين الطلاب</h3>
        <div className="flex items-end gap-4 h-40">
          {bucketCounts.map(b => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 font-numbers">{b.count}</span>
              <div className="w-full bg-primary-100 rounded-t-lg relative overflow-hidden"
                style={{ height: `${Math.max(4, Math.round((b.count / maxBucket) * 100))}%` }}>
                <div className="absolute inset-0 bg-primary-500 opacity-80" />
              </div>
              <span className="text-xs text-slate-500 text-center">{b.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Exercise performance */}
      {avgScore > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 font-cairo">📈 أداء التمارين</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-primary-600 font-numbers">{avgScore}%</div>
              <div className="text-sm text-slate-500 mt-1">متوسط الدرجات</div>
            </div>
            <div className="flex-1">
              <ProgressBar value={avgScore} color={avgScore >= 70 ? 'bg-green-500' : avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'} size="lg" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span><span>60% (ناجح)</span><span>100%</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
