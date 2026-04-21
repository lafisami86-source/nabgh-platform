import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getLevelIcon, getLevel, formatNumber } from '@/lib/utils';
import { Avatar, Card } from '@/components/ui/index';

export default async function LeaderboardPage() {
  const session = await auth();
  await connectDB();

  const users = await User.find({ role: 'student', isActive: true })
    .select('profile.displayName profile.avatar profile.country gamification.xp gamification.level gamification.streak gamification.badges')
    .sort({ 'gamification.xp': -1 }).limit(50).lean() as unknown as any[];

  const myRank = users.findIndex(u => u._id.toString() === session!.user.id) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">🏆 لوحة الصدارة</h1>
          <p className="text-slate-500 text-sm mt-1">ترتيبك بين أفضل الطلاب</p>
        </div>
        {myRank > 0 && (
          <div className="text-center bg-primary-50 rounded-xl p-3">
            <div className="text-2xl font-black text-primary-600">#{myRank}</div>
            <div className="text-xs text-slate-500">ترتيبك</div>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <Avatar src={users[1]?.profile?.avatar} name={users[1]?.profile?.displayName || '?'} size="lg" />
            <div className="text-center"><p className="font-bold text-sm text-slate-700 truncate max-w-24">{users[1]?.profile?.displayName}</p><p className="text-xs text-slate-500 font-numbers">{formatNumber(users[1]?.gamification?.xp || 0)} XP</p></div>
            <div className="w-20 bg-slate-200 rounded-t-xl flex items-center justify-center h-16 text-2xl font-black text-slate-600">🥈</div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-yellow-400 text-2xl">👑</div>
            <Avatar src={users[0]?.profile?.avatar} name={users[0]?.profile?.displayName || '?'} size="xl" />
            <div className="text-center"><p className="font-bold text-slate-700 truncate max-w-28">{users[0]?.profile?.displayName}</p><p className="text-xs text-slate-500 font-numbers">{formatNumber(users[0]?.gamification?.xp || 0)} XP</p></div>
            <div className="w-24 bg-amber-400 rounded-t-xl flex items-center justify-center h-24 text-3xl font-black text-white">🥇</div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <Avatar src={users[2]?.profile?.avatar} name={users[2]?.profile?.displayName || '?'} size="lg" />
            <div className="text-center"><p className="font-bold text-sm text-slate-700 truncate max-w-24">{users[2]?.profile?.displayName}</p><p className="text-xs text-slate-500 font-numbers">{formatNumber(users[2]?.gamification?.xp || 0)} XP</p></div>
            <div className="w-20 bg-amber-700/30 rounded-t-xl flex items-center justify-center h-12 text-2xl font-black text-amber-800">🥉</div>
          </div>
        </div>
      )}

      {/* Full list */}
      <Card className="divide-y divide-slate-100">
        {users.map((u: any, i) => {
          const isMe = u._id.toString() === session!.user.id;
          const level = getLevel(u.gamification?.xp || 0);
          return (
            <div key={u._id} className={`flex items-center gap-4 px-4 py-3 ${isMe ? 'bg-primary-50' : ''}`}>
              <div className={`w-8 text-center font-black text-sm ${i < 3 ? 'text-amber-500' : 'text-slate-400'} font-numbers`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </div>
              <Avatar src={u.profile?.avatar} name={u.profile?.displayName || '?'} size="sm" level={level} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm truncate ${isMe ? 'text-primary-700' : 'text-slate-800'}`}>{u.profile?.displayName}</span>
                  {isMe && <span className="text-xs bg-primary-100 text-primary-600 rounded-full px-1.5 py-0.5">أنت</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-500">{getLevelIcon(level)} مستوى {level}</span>
                  {(u.gamification?.streak?.current || 0) > 0 && (
                    <span className="text-xs text-orange-500">🔥 {u.gamification.streak.current}</span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <div className="font-black text-slate-800 text-sm font-numbers">{formatNumber(u.gamification?.xp || 0)}</div>
                <div className="text-xs text-slate-400">XP</div>
              </div>
            </div>
          );
        })}
      </Card>

      {users.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-slate-500">لا يوجد طلاب بعد. كن أول من يتصدر!</p>
        </div>
      )}
    </div>
  );
}
