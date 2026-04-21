import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Badge } from '@/models/Analytics';
import { Card } from '@/components/ui/index';
import { cn } from '@/lib/utils';

const RARITY_LABELS: Record<string, string> = { common:'شائع', uncommon:'غير شائع', rare:'نادر', epic:'ملحمي', legendary:'أسطوري' };
const RARITY_COLORS: Record<string, string> = { common:'border-slate-200 bg-slate-50', uncommon:'border-blue-200 bg-blue-50', rare:'border-purple-200 bg-purple-50', epic:'border-amber-200 bg-amber-50', legendary:'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' };
const RARITY_BADGE: Record<string, string> = { common:'text-slate-500', uncommon:'text-blue-600', rare:'text-purple-600', epic:'text-amber-600', legendary:'text-yellow-600' };
const CATEGORY_LABELS: Record<string, string> = { learning:'📚 التعلم', exercises:'✏️ التمارين', streak:'🔥 الالتزام', social:'🤝 الاجتماعي', achievement:'🏆 الإنجاز', challenge:'⚔️ التحديات', special:'⭐ خاصة' };

export default async function AchievementsPage() {
  const session = await auth();
  await connectDB();

  const [allBadges, user] = await Promise.all([
    Badge.find({ isActive: true }).sort({ order: 1 }).lean() as unknown as any[],
    User.findById(session!.user.id).select('gamification').lean() as any,
  ]);

  const earnedMap = new Map((user?.gamification?.badges || []).map((b: any) => [b.badgeId, b.earnedAt]));
  const earnedCount = earnedMap.size;
  const totalCount = allBadges.length;

  const byCategory = allBadges.reduce((acc: any, b: any) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-cairo">🏅 إنجازاتي</h1>
            <p className="text-amber-100 mt-1">اجمع الشارات وأثبت تميزك</p>
          </div>
          <div className="text-center bg-white/20 rounded-2xl px-5 py-3">
            <div className="text-3xl font-black font-numbers">{earnedCount}</div>
            <div className="text-xs text-amber-100">من {totalCount} شارة</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-amber-100 mb-1">
            <span>تقدمك</span>
            <span className="font-numbers">{Math.round((earnedCount/totalCount)*100)}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width:`${(earnedCount/totalCount)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Badges by category */}
      {Object.entries(byCategory).map(([cat, badges]: [string, any]) => {
        const catEarned = (badges as any[]).filter((b: any) => earnedMap.has(b._id));
        return (
          <Card key={cat}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 font-cairo">{CATEGORY_LABELS[cat] || cat}</h2>
              <span className="text-sm text-slate-500 font-numbers">{catEarned.length}/{(badges as any[]).length}</span>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {(badges as any[]).map((badge: any) => {
                const earned = earnedMap.has(badge._id);
                const earnedAt = earnedMap.get(badge._id);
                return (
                  <div
                    key={badge._id}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all relative group',
                      earned ? RARITY_COLORS[badge.rarity] || 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-50 grayscale'
                    )}
                    title={badge.description}
                  >
                    {badge.isSecret && !earned ? (
                      <div className="text-2xl mb-1">🔒</div>
                    ) : (
                      <div className={cn('text-2xl mb-1', earned && 'badge-unlock')}>{badge.icon}</div>
                    )}
                    <div className={cn('text-xs font-semibold leading-tight', earned ? 'text-slate-700' : 'text-slate-400')}>
                      {badge.isSecret && !earned ? '???' : badge.name}
                    </div>
                    <div className={cn('text-xs mt-0.5 font-medium', RARITY_BADGE[badge.rarity])}>
                      {RARITY_LABELS[badge.rarity]}
                    </div>
                    {earned && badge.xpBonus > 0 && (
                      <div className="text-xs text-amber-600 font-bold mt-1">+{badge.xpBonus} XP</div>
                    )}
                    {earned && earnedAt && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(earnedAt as string).toLocaleDateString('ar', { month:'short', day:'numeric' })}
                      </div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-36 bg-slate-800 text-white text-xs rounded-xl p-2 shadow-lg text-center pointer-events-none">
                      {badge.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
