import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserProgress, LearningAnalytics, Notification } from '@/models/Analytics';
import { Lesson, Subject } from '@/models/Content';
import { getLevelName, getLevelIcon, getLevel, formatNumber, formatTime } from '@/lib/utils';
import Link from 'next/link';
import { ProgressBar, CircularProgress, Card } from '@/components/ui/index';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();
  await connectDB();

  const [user, progress, analytics, notifications] = await Promise.all([
    User.findById(session!.user.id).select('profile gamification subscription studentInfo').lean() as any,
    UserProgress.findOne({ userId: session!.user.id }).lean() as any,
    LearningAnalytics.findOne({ userId: session!.user.id }).lean() as any,
    Notification.find({ userId: session!.user.id, isRead: false }).limit(5).lean() as unknown as any[],
  ]);

  const g = user?.gamification || {};
  const xp = g.xp || 0;
  const level = getLevel(xp);
  const thresholds = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000, 999999];
  const levelXP = xp - thresholds[level - 1];
  const nextLevelXP = thresholds[level] - thresholds[level - 1];
  const levelPct = Math.round((levelXP / nextLevelXP) * 100);

  // Get recent lessons
  const completedIds = progress?.lessons?.filter((l: any) => l.status === 'completed').map((l: any) => l.lessonId) || [];
  const recentLessons = await Lesson.find({ isPublished: true }).sort({ createdAt: -1 }).limit(6)
    .populate('subjectId', 'name icon color').lean() as unknown as any[];

  // Get subjects with progress
  const subjects = await Subject.find({ isActive: true, grade: user?.studentInfo?.grade || 'grade_6' }).limit(6).lean() as unknown as any[];
  const subjectProgress = (progress?.subjects || []).reduce((acc: any, s: any) => {
    acc[s.subjectId?.toString()] = s.progress || 0;
    return acc;
  }, {});

  // Daily goal
  const todayStats = analytics?.dailyStats?.find((d: any) => new Date(d.date).toDateString() === new Date().toDateString());
  const todayMinutes = todayStats?.minutesStudied || 0;
  const dailyGoal = user?.studentInfo?.dailyGoalMinutes || 30;

  // Last lesson in progress
  const inProgressLesson = progress?.lessons?.find((l: any) => l.status === 'in-progress');
  let lastLesson = null;
  if (inProgressLesson) {
    lastLesson = await Lesson.findById(inProgressLesson.lessonId).select('title estimatedMinutes subjectId').lean() as any;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="space-y-6 stagger-children">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">{greeting()} 👋</p>
            <h1 className="text-2xl font-black mt-1 font-cairo">{user?.profile?.displayName}</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                <span className="fire-flicker">🔥</span>
                <span className="text-sm font-bold">{g.streak?.current || 0} يوم</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                <span>💎</span>
                <span className="text-sm font-bold font-numbers">{formatNumber(xp)} XP</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <CircularProgress value={levelPct} size={90} strokeWidth={8} color="rgba(255,255,255,0.9)">
              <div className="text-center">
                <div className="text-xl">{getLevelIcon(level)}</div>
                <div className="text-xs font-bold">{level}</div>
              </div>
            </CircularProgress>
            <p className="text-xs text-primary-100 mt-1">{getLevelName(level)}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📚', label: 'دروس مكتملة', value: g.totalLessonsCompleted || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: '✏️', label: 'تمارين محلولة', value: g.totalExercisesSolved || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: '🎯', label: 'الدقة العامة', value: `${Math.round(g.accuracy || 0)}%`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: '🏅', label: 'الشارات', value: g.badges?.length || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className={`text-2xl font-black font-numbers ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Daily Goal */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 font-cairo">هدف اليوم ⭐</h3>
            <p className="text-xs text-slate-500 mt-0.5">{todayMinutes} / {dailyGoal} دقيقة</p>
          </div>
          <CircularProgress value={Math.min(100, Math.round((todayMinutes / dailyGoal) * 100))} size={60} strokeWidth={6} color="#10B981">
            <span className="text-xs font-bold text-emerald-600">{Math.min(100, Math.round((todayMinutes / dailyGoal) * 100))}%</span>
          </CircularProgress>
        </div>
        <ProgressBar value={todayMinutes} max={dailyGoal} color="bg-gradient-to-r from-emerald-400 to-emerald-600" size="md" />
        {todayMinutes >= dailyGoal && (
          <p className="text-sm text-emerald-600 font-semibold mt-2">🎉 أحسنت! حققت هدف اليوم!</p>
        )}
      </Card>

      {/* Continue where left off */}
      {lastLesson && (
        <div>
          <h2 className="font-bold text-slate-800 mb-3 font-cairo">أكمل من حيث توقفت 📍</h2>
          <Card hover className="p-5">
            <Link href={`/student/lesson/${lastLesson._id}`} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">📖</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{lastLesson.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">⏱ {lastLesson.estimatedMinutes} دقيقة</p>
              </div>
              <div className="text-primary-500 font-semibold text-sm bg-primary-50 rounded-lg px-3 py-1.5">أكمل ←</div>
            </Link>
          </Card>
        </div>
      )}

      {/* Subjects Progress */}
      {subjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 font-cairo">موادي الدراسية 📚</h2>
            <Link href="/student/subjects" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((sub: any) => (
              <Link key={sub._id} href={`/student/subjects/${sub._id}`}>
                <Card hover className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: sub.color + '20' }}>
                      {sub.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{sub.name}</h3>
                      <p className="text-xs text-slate-500">{sub.lessonsCount} درس</p>
                    </div>
                  </div>
                  <ProgressBar value={subjectProgress[sub._id?.toString()] || 0} color={`bg-[${sub.color}]`} size="sm" />
                  <div className="text-xs text-slate-500 mt-1 font-numbers">{subjectProgress[sub._id?.toString()] || 0}% مكتمل</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 font-cairo">دروس موصى بها 💡</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentLessons.slice(0, 4).map((lesson: any) => (
            <Link key={lesson._id} href={`/student/lesson/${lesson._id}`}>
              <Card hover className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  {lesson.content?.video?.thumbnailUrl
                    ? <img src={lesson.content.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{lesson.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">⏱ {lesson.estimatedMinutes} د</span>
                    <span className="text-xs text-amber-600">+{lesson.xpReward} XP</span>
                    {completedIds.includes(lesson._id?.toString()) && (
                      <span className="text-xs text-green-600">✅ مكتمل</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* XP Level Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 font-cairo">{getLevelIcon(level)} المستوى {level}: {getLevelName(level)}</h3>
            <p className="text-xs text-slate-500">{levelXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP للمستوى القادم</p>
          </div>
          {level < 8 && (
            <div className="text-center">
              <div className="text-2xl">{getLevelIcon(level + 1)}</div>
              <div className="text-xs text-slate-500">{getLevelName(level + 1)}</div>
            </div>
          )}
        </div>
        <ProgressBar value={levelPct} color="bg-gradient-to-r from-primary-500 to-secondary" size="lg" label />
      </Card>

    </div>
  );
}
