'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui/index';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    setLoading(false);
    if (res?.error) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة'); return; }
    router.push('/student/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-3 shadow-glow font-cairo">ن</div>
          <h1 className="text-3xl font-black text-slate-800 font-cairo">نَبَغ</h1>
          <p className="text-slate-500 text-sm mt-1">تعلّم بذكاء، تفوّق بتميّز</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 font-cairo">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com"
              value={form.email} onChange={(e: any) => setForm(p => ({ ...p, email: e.target.value }))} required />
            <Input label="كلمة المرور" type="password" placeholder="••••••••"
              value={form.password} onChange={(e: any) => setForm(p => ({ ...p, password: e.target.value }))} required />

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

            <Button type="submit" fullWidth size="lg" loading={loading}>تسجيل الدخول</Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-500">أو</span></div>
          </div>

          <button onClick={() => signIn('google', { callbackUrl: '/student/dashboard' })}
            className="w-full flex items-center justify-center gap-3 h-10 border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            الدخول بحساب Google
          </button>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-600">ليس لديك حساب؟{' '}
              <Link href="/auth/register" className="text-primary-600 font-semibold hover:underline">إنشاء حساب جديد</Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">حسابات تجريبية (بعد تشغيل Seed):</p>
            <div className="space-y-1">
              {[
                { label: '🎓 طالب', email: 'student@nabgh.com', pw: 'Student@123' },
                { label: '👩‍🏫 معلمة', email: 'teacher@nabgh.com', pw: 'Teacher@123' },
              ].map(a => (
                <button key={a.email} onClick={() => setForm({ email: a.email, password: a.pw })}
                  className="w-full text-right text-xs text-primary-600 hover:text-primary-700 py-0.5 hover:underline">
                  {a.label}: {a.email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
