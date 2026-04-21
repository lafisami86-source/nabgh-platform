'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, CircularProgress } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

interface Challenge {
  _id: string; type: string; title: string; description: string;
  difficulty: string; questionCount: number; timeLimit: number;
  startTime: string; endTime: string; status: string;
  stats: { totalParticipants: number; avgScore: number };
  rewards: { first: { xp: number }; completion: { xp: number } };
}

export default function ChallengesPage() {
  const { toast } = useToast();
  const [daily, setDaily] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/challenges/daily').then(r => r.json()),
      fetch('/api/challenges').then(r => r.json()),
    ]).then(([d, c]) => {
      if (d.success) setDaily(d.data);
      if (c.success) setChallenges(c.data);
      setLoading(false);
    });
  }, []);

  // Countdown timer for daily challenge
  useEffect(() => {
    if (!daily?.endTime) return;
    const tick = () => {
      const diff = new Date(daily.endTime).getTime() - Date.now();
      if (diff <= 0) { setCountdown('انتهى'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [daily?.endTime]);

  async function joinChallenge(id: string) {
    setJoiningId(id);
    const res = await fetch(`/api/challenges/${id}/join`, { method: 'POST' });
    const data = await res.json();
    if (data.success) toast('تم الانضمام للتحدي! ⚔️', 'success');
    else toast('حدث خطأ في الانضمام', 'error');
    setJoiningId(null);
  }

  const DIFF_COLORS: Record<string, any> = { easy:'success', medium:'warning', hard:'error', mixed:'primary' };
  const DIFF_LABELS: Record<string, string> = { easy:'سهل', medium:'متوسط', hard:'صعب', mixed:'متنوع' };
  const TYPE_ICONS: Record<string, string> = { daily:'☀️', weekly:'📅', friend:'👥', tournament:'🏆', course:'📚' };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">⚔️ التحديات</h1>
        <p className="text-slate-500 text-sm mt-1">تنافس واكسب نقاطاً مضاعفة</p>
      </div>

      {/* Daily Challenge - featured */}
      {daily && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-secondary p-6 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">☀️</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">تحدي اليوم</span>
              {countdown && (
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold font-numbers mr-auto">⏱ {countdown}</span>
              )}
            </div>
            <h2 className="text-xl font-black font-cairo">{daily.title}</h2>
            <p className="text-primary-100 text-sm mt-1">{daily.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span>📝 {daily.questionCount} أسئلة</span>
              <span>⏱ {Math.floor(daily.timeLimit / 60)} دقائق</span>
              <span>🏆 +{daily.rewards?.first?.xp || 200} XP</span>
              <span>👥 {daily.stats?.totalParticipants || 0} مشارك</span>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                size="md"
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={() => joinChallenge(daily._id)}
                loading={joiningId === daily._id}
              >
                ابدأ التحدي الآن! ⚡
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge types grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon:'👥', title:'تحدي الأصدقاء', desc:'تحدَّ صديقك مباشرة', xp:150, soon:false },
          { icon:'📅', title:'تحدي الأسبوع', desc:'20 سؤال أسبوعياً', xp:300, soon:false },
          { icon:'🏆', title:'البطولة الشهرية', desc:'تنافس مع الجميع', xp:1000, soon:true },
        ].map(c => (
          <Card key={c.title} className={cn('p-4 text-center', c.soon && 'opacity-60')}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <h3 className="font-bold text-slate-800 text-sm font-cairo">{c.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
            <div className="text-xs text-amber-600 font-bold mt-2">+{c.xp} XP</div>
            {c.soon
              ? <div className="mt-3 text-xs bg-slate-100 text-slate-500 rounded-full px-3 py-1">قريباً</div>
              : <Button size="xs" className="mt-3 w-full" variant="outline">انضم</Button>
            }
          </Card>
        ))}
      </div>

      {/* Active challenges list */}
      {challenges.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-800 mb-3 font-cairo">تحديات نشطة</h2>
          <div className="space-y-3">
            {challenges.map((c: Challenge) => (
              <Card key={c._id} hover className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {TYPE_ICONS[c.type] || '⚔️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 truncate">{c.title}</h3>
                      <Badge color={DIFF_COLORS[c.difficulty] || 'primary'} size="xs">
                        {DIFF_LABELS[c.difficulty] || c.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>📝 {c.questionCount} سؤال</span>
                      <span>👥 {c.stats?.totalParticipants || 0} مشارك</span>
                      <span className="text-amber-500 font-bold">+{c.rewards?.completion?.xp || 30} XP</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => joinChallenge(c._id)}
                    loading={joiningId === c._id}
                  >
                    انضم
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="p-5 bg-amber-50 border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3 font-cairo">💡 نصائح للتحديات</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• تحدي اليوم يتغير كل 24 ساعة - لا تفوّته!</li>
          <li>• الإجابة الصحيحة والسريعة تمنحك نقاطاً إضافية</li>
          <li>• المركز الأول يكسب +200 XP وشارة خاصة</li>
          <li>• شارك أصدقاءك في التحديات للمزيد من المتعة</li>
        </ul>
      </Card>
    </div>
  );
}
