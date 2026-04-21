'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Avatar, Card, ProgressBar } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';
import { getLevelIcon, getLevelName, getLevel, getLevelProgress } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.success) {
        setUser(d.data);
        setForm({ firstName: d.data.profile.firstName, lastName: d.data.profile.lastName, bio: d.data.profile.bio || '', phone: d.data.profile.phone || '' });
      }
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/users/me', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: { ...user.profile, ...form, displayName: `${form.firstName} ${form.lastName}` } }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);
      setEditing(false);
      toast('تم حفظ الملف الشخصي ✅', 'success');
      await update({ name: `${form.firstName} ${form.lastName}` });
    } else toast('حدث خطأ في الحفظ', 'error');
    setSaving(false);
  }

  if (!user) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const g = user.gamification || {};
  const xp = g.xp || 0;
  const level = getLevel(xp);
  const { current, next, percent } = getLevelProgress(xp);

  const statsGrid = [
    { label: 'مجموع XP', value: xp.toLocaleString(), icon: '💎' },
    { label: 'الدروس', value: g.totalLessonsCompleted || 0, icon: '📚' },
    { label: 'التمارين', value: g.totalExercisesSolved || 0, icon: '✏️' },
    { label: 'الشارات', value: g.badges?.length || 0, icon: '🏅' },
    { label: 'السلسلة', value: `${g.streak?.current || 0} يوم`, icon: '🔥' },
    { label: 'الدقة', value: `${Math.round(g.accuracy || 0)}%`, icon: '🎯' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-500 to-secondary" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="ring-4 ring-white rounded-full">
              <Avatar src={user.profile?.avatar} name={user.profile?.displayName || 'م'} size="xl" level={level} />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-black text-slate-800 font-cairo">{user.profile?.displayName}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <button onClick={() => setEditing(!editing)} className="mr-auto text-sm text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50">
              {editing ? 'إلغاء' : '✏️ تعديل'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="الاسم الأول" value={form.firstName} onChange={(e: any) => setForm(p => ({ ...p, firstName: e.target.value }))} />
                <Input label="اسم العائلة" value={form.lastName} onChange={(e: any) => setForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
              <Input label="رقم الجوال" value={form.phone} onChange={(e: any) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966..." />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نبذة شخصية</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="أخبرنا عن نفسك..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <Button fullWidth onClick={save} loading={saving}>حفظ التغييرات</Button>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-slate-600">
              {user.profile?.bio && <p className="leading-relaxed">{user.profile.bio}</p>}
              {user.profile?.phone && <p>📱 {user.profile.phone}</p>}
              <p>🌍 {user.profile?.country}</p>
              <p>📅 عضو منذ {new Date(user.createdAt).toLocaleDateString('ar', { year:'numeric', month:'long' })}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{getLevelIcon(level)}</div>
          <div>
            <p className="font-bold text-slate-800 font-cairo">المستوى {level}: {getLevelName(level)}</p>
            <p className="text-xs text-slate-500 font-numbers">{current.toLocaleString()} / {next.toLocaleString()} XP</p>
          </div>
          <div className="mr-auto text-lg font-black text-primary-600 font-numbers">{percent}%</div>
        </div>
        <ProgressBar value={percent} color="bg-gradient-to-r from-primary-500 to-secondary" size="md" />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {statsGrid.map(s => (
          <Card key={s.label} className="p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-black text-slate-800 font-numbers">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Subscription */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 font-cairo">اشتراكي</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${user.subscription?.plan === 'free' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                {user.subscription?.plan === 'free' ? '🆓 مجاني' : user.subscription?.plan === 'basic' ? '⭐ أساسي' : '💎 مميز'}
              </span>
            </div>
          </div>
          {user.subscription?.plan === 'free' && (
            <Button size="sm" variant="outline">ترقية الاشتراك ↗</Button>
          )}
        </div>
      </Card>

      {/* Settings quick links */}
      <Card className="divide-y divide-slate-100">
        {[
          { icon:'🔔', label:'إعدادات الإشعارات' },
          { icon:'🌙', label:'الوضع الداكن' },
          { icon:'🔒', label:'تغيير كلمة المرور' },
          { icon:'🗑️', label:'حذف الحساب', danger: true },
        ].map(item => (
          <button key={item.label} className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-slate-50 transition text-right ${item.danger ? 'text-red-600' : 'text-slate-700'}`}>
            <span>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            <span className="mr-auto text-slate-300">←</span>
          </button>
        ))}
      </Card>
    </div>
  );
}
