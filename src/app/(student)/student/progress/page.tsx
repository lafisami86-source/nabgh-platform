import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { LearningAnalytics, UserProgress } from '@/models/Analytics';
import { getLevelName, getLevelIcon, getLevel, formatTime } from '@/lib/utils';
import { Card, ProgressBar, CircularProgress } from '@/components/ui/index';

export default async function ProgressPage() {
  const session = await auth();
  await connectDB();

  const [user, analytics, progress] = await Promise.all([
    User.findById(session!.user.id).select('gamification profile studentInfo').lean() as any,
    LearningAnalytics.findOne({ userId: session!.user.id }).lean() as any,
    UserProgress.findOne({ userId: session!.user.id }).lean() as any,
  ]);

  const g = user?.gamification || {};
  const level = getLevel(g.xp || 0);

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const stat = analytics?.dailyStats?.find((s: any) => new Date(s.date).toDateString() === d.toDateString());
    return { day: d.toLocaleDateString('ar', { weekday: 'short' }), minutes: stat?.minutesStudied || 0, xp: stat?.xpEarned || 0 };
  });

  const maxMinutes = Math.max(...last7.map(d => d.minutes), 30);

  const BADGE_ICONS: Record<string, string> = {
    lesson_10: '📚', lesson_50: '📖', lesson_100: '🎓', exercises_100: '✏️',
    streak_7: '🔥', streak_30: '💪', streak_100: '🌟', accuracy_95: '🎯',
    perfect_5: '🧠', level_5: '🌟', level_8: '🏆', first_lesson: '🌱',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">📊 تقدمي الدراسي</h1>
        <p className="text-slate-500 text-sm mt-1">تتبع إنجازاتك ونقاط قوتك</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'مجموع XP', value: (g.xp || 0).toLocaleString(), icon: '💎', color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'الدروس المكتملة', value: g.totalLessonsCompleted || 0, icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'التمارين المحلولة', value: g.totalExercisesSolved || 0, icon: '✏️', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'وقت التعلم', value: formatTime(g.totalTimeMinutes || 0), icon: '⏱', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className={`text-2xl mb-2`}>{s.icon}</div>
            <div className={`text-xl font-black font-numbers ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <CircularProgress value={Math.min(100, Math.round(((g.xp || 0) - [0,500,2000,5000,10000,20000,40000,70000][level-1]) / (([500,2000,5000,10000,20000,40000,70000,999999][level-1] - [0,500,2000,5000,10000,20000,40000,70000][level-1]) || 1) * 100))} size={80} strokeWidth={8} color="#6366F1">
            <span className="text-base">{getLevelIcon(level)}</span>
          </CircularProgress>
          <div>
            <h3 className="font-black text-slate-800 font-cairo text-lg">{getLevelName(level)}</h3>
            <p className="text-sm text-slate-500">المستوى {level} من 8</p>
            <p className="text-xs text-primary-600 font-numbers mt-1">{(g.xp||0).toLocaleString()} XP</p>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {[1,2,3,4,5,6,7,8].map(l => (
            <div key={l} className={`h-2 rounded-full ${l <= level ? 'bg-primary-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </Card>

      {/* Weekly Activity Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 font-cairo">📅 نشاط آخر 7 أيام</h3>
        <div className="flex items-end gap-2 h-32">
          {last7.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary-100 rounded-t-lg relative" style={{ height: `${Math.round((day.minutes / maxMinutes) * 100)}%`, minHeight: day.minutes > 0 ? '4px' : '2px' }}>
                {day.minutes > 0 && (
                  <div className="absolute inset-0 bg-primary-500 rounded-t-lg opacity-80" />
                )}
              </div>
              <span className="text-xs text-slate-500">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>كل شريط = دقائق الدراسة</span>
          <span>مجموع: {last7.reduce((s, d) => s + d.minutes, 0)} دقيقة</span>
        </div>
      </Card>

      {/* Streak Info */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 font-cairo">🔥 سلسلة الأيام</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-black text-orange-500 fire-flicker font-numbers">{g.streak?.current || 0}</div>
            <div className="text-xs text-slate-500 mt-1">الحالية</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-slate-700 font-numbers">{g.streak?.longest || 0}</div>
            <div className="text-xs text-slate-500 mt-1">الأطول</div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">حافظ على تعلمك يومياً لكسب مكافآت إضافية!</p>
            <div className="flex gap-1 mt-3">
              {[3,7,14,30,100].map(target => (
                <div key={target} className={`flex-1 text-center py-1 rounded text-xs font-bold ${(g.streak?.current || 0) >= target ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                  {target}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Skill Map */}
      {analytics?.skillMap?.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 font-cairo">🎯 خريطة المهارات</h3>
          <div className="space-y-3">
            {analytics.skillMap.slice(0, 8).map((skill: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-32 truncate">{skill.skill}</span>
                <ProgressBar value={skill.level} color={skill.level >= 80 ? 'bg-green-500' : skill.level >= 60 ? 'bg-amber-500' : 'bg-red-400'} size="sm" className="flex-1" />
                <span className={`text-xs font-bold w-8 text-left font-numbers ${skill.level >= 80 ? 'text-green-600' : skill.level >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{skill.level}%</span>
                <span className="text-xs">{skill.trend === 'improving' ? '📈' : skill.trend === 'declining' ? '📉' : '➡️'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Badges */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 font-cairo">🏅 شاراتي ({g.badges?.length || 0})</h3>
        {g.badges?.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {g.badges.map((b: any) => (
              <div key={b.badgeId} className="flex flex-col items-center gap-1 p-2 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-2xl">{BADGE_ICONS[b.badgeId] || '🏅'}</span>
                <span className="text-xs text-amber-700 text-center leading-tight">{b.badgeId.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">أكمل دروساً وتمارين لكسب شارات! 🌟</p>
        )}
      </Card>
    </div>
  );
}
