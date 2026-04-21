'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui/index';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student', country: 'SA' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'student', label: '🎓 طالب', desc: 'أريد التعلم' },
    { value: 'teacher', label: '👩‍🏫 معلم', desc: 'أريد التدريس' },
    { value: 'parent', label: '👨‍👧 ولي أمر', desc: 'أريد متابعة أبنائي' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); setLoading(false); return; }
      const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (signInRes?.ok) router.push('/onboarding');
    } catch { setError('حدث خطأ، حاول مرة أخرى'); }
    setLoading(false);
  }

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-3 font-cairo">ن</div>
          <h1 className="text-3xl font-black text-slate-800 font-cairo">انضم لنَبَغ</h1>
          <p className="text-slate-500 text-sm mt-1">ابدأ رحلتك التعليمية الذكية</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">أنا...</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${form.role === r.value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-xl mb-1">{r.label.split(' ')[0]}</div>
                    <div className="text-xs font-medium text-slate-700">{r.label.split(' ')[1]}</div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="الاسم الأول" placeholder="محمد" value={form.firstName} onChange={set('firstName')} required />
              <Input label="اسم العائلة" placeholder="العلي" value={form.lastName} onChange={set('lastName')} required />
            </div>
            <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} required />
            <Input label="كلمة المرور" type="password" placeholder="8 أحرف على الأقل" value={form.password} onChange={set('password')} required />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الدولة</label>
              <select value={form.country} onChange={set('country')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="SA">🇸🇦 المملكة العربية السعودية</option>
                <option value="EG">🇪🇬 مصر</option>
                <option value="AE">🇦🇪 الإمارات</option>
                <option value="JO">🇯🇴 الأردن</option>
                <option value="MA">🇲🇦 المغرب</option>
                <option value="KW">🇰🇼 الكويت</option>
                <option value="QA">🇶🇦 قطر</option>
              </select>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
            <Button type="submit" fullWidth size="lg" loading={loading}>إنشاء الحساب 🚀</Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-600">لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
