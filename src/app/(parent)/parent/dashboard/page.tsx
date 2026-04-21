import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserProgress, LearningAnalytics } from '@/models/Analytics';
import { Card, Avatar, ProgressBar, CircularProgress } from '@/components/ui/index';
import { getLevel, getLevelIcon, getLevelName, formatTime, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export default async function ParentDashboardPage() {
  const session = await auth();
  await connectDB();
  const parent = await User.findById(session!.user.id).select('parentInfo profile').lean() as any;

  // Get linked children (or show sample if none)
  const childIds = parent?.parentInfo?.children || [];
  const children = childIds.length > 0
    ? await User.find({ _id: { $in: childIds } }).select('profile gamification studentInfo lastLoginAt').lean() as unknown as any[]
    : await User.find({ role: 'student', isActive: true }).select('profile gamification studentInfo lastLoginAt').limit(3).lean() as unknown as any[];

  const childrenWithAnalytics = await Promise.all(children.map(async (child: any) => {
    const [progress, analytics] = await Promise.all([
      UserProgress.findOne({ userId: child._id }).select('subjects lessons exercises').lean() as any,
      LearningAnalytics.findOne({ userId: child._id }).select('dailyStats patterns').lean() as any,
    ]);
    const todayStats = analytics?.dailyStats?.find((d: any) => new Date(d.date).toDateString() === new Date().toDateString());
    const weekStats = analytics?.dailyStats?.slice(-7) || [];
    const weekMinutes = weekStats.reduce((s: number, d: any) => s + (d.minutesStudied || 0), 0);
    return { ...child, progress, analytics, todayMinutes: todayStats?.minutesStudied || 0, weekMinutes };
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-black font-cairo">مرحباً {parent?.profile?.displayName} 👋</h1>
        <p className="text-teal-100 mt-1">متابعة تعلم أبنائك في منصة نَبَغ</p>
        {childIds.length === 0 && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 text-sm">
            💡 لم تقم بربط أبنائك بعد. يمكنك ربط حساباتهم من إعدادات كل حساب.
          </div>
        )}
      </div>

      {childrenWithAnalytics.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👨‍👧‍👦</div>
          <h2 className="text-xl font-bold text-slate-700 font-cairo">لا يوجد أبناء مرتبطون</h2>
          <p className="text-slate-500 mt-2">اطلب من أبنائك إضافتك في إعدادات حساباتهم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {childrenWithAnalytics.map((child: any) => {
            const level = getLevel(child.gamification?.xp || 0);
            const goal = child.studentInfo?.dailyGoalMinutes || 30;
            const completedLessons = child.progress?.lessons?.filter((l: any) => l.status === 'completed').length || 0;
            const lastActive = child.lastLoginAt ? formatRelativeTime(child.lastLoginAt) : 'لم يسجل دخول';
            const isActiveToday = child.lastLoginAt && new Date(child.lastLoginAt).toDateString() === new Date().toDateString();

            return (
              <Card key={child._id} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={child.profile?.avatar} name={child.profile?.displayName || '?'} size="lg" level={level} />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 font-cairo">{child.profile?.displayName}</h3>
                      <p className="text-xs text-slate-500">{getLevelIcon(level)} {getLevelName(level)} • مستوى {level}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isActiveToday ? 'text-green-600' : 'text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${isActiveToday ? 'bg-green-500' : 'bg-slate-300'}`} />
                        {lastActive}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-orange-500 fire-flicker">{child.gamification?.streak?.current || 0}</div>
                      <div className="text-xs text-slate-500">🔥 يوم</div>
                    </div>
                  </div>

                  {/* Today's goal */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span>هدف اليوم</span>
                      <span className="font-numbers">{child.todayMinutes}/{goal} دقيقة</span>
                    </div>
                    <ProgressBar value={child.todayMinutes} max={goal} color="bg-emerald-500" size="md" />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-xl p-2 text-center">
                      <div className="font-black text-blue-600 font-numbers">{child.gamification?.xp?.toLocaleString() || 0}</div>
                      <div className="text-xs text-slate-500">XP</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2 text-center">
                      <div className="font-black text-green-600 font-numbers">{completedLessons}</div>
                      <div className="text-xs text-slate-500">درس</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-2 text-center">
                      <div className="font-black text-purple-600 font-numbers">{child.weekMinutes}</div>
                      <div className="text-xs text-slate-500">د/أسبوع</div>
                    </div>
                  </div>

                  {/* Weekly activity mini chart */}
                  <div className="flex items-end gap-1 h-10 mb-3">
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = new Date(); d.setDate(d.getDate() - (6 - i));
                      const dayStat = child.analytics?.dailyStats?.find((s: any) => new Date(s.date).toDateString() === d.toDateString());
                      const mins = dayStat?.minutesStudied || 0;
                      const maxMins = 60;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end">
                          <div className={`w-full rounded-t ${mins > 0 ? 'bg-primary-400' : 'bg-slate-100'}`}
                            style={{ height: `${Math.max(2, (mins / maxMins) * 100)}%` }} />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 text-center">نشاط آخر 7 أيام</p>

                  {/* Alerts */}
                  {!isActiveToday && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                      ⚠️ لم يتعلم {child.profile?.displayName} اليوم بعد
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips for parents */}
      <Card className="p-5 bg-teal-50 border-teal-200">
        <h3 className="font-bold text-teal-800 mb-3 font-cairo">💡 نصائح لمتابعة أبنائك</h3>
        <ul className="space-y-1.5 text-sm text-teal-700">
          <li>• شجّع ابنك على التعلم يومياً للحفاظ على السلسلة 🔥</li>
          <li>• احتفل بإنجازاته وشاراته الجديدة 🏅</li>
          <li>• راجع التقارير الأسبوعية للاطلاع على أدائه</li>
          <li>• تواصل مع معلمه عند الحاجة</li>
        </ul>
      </Card>
    </div>
  );
}
