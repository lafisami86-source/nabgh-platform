'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button, ProgressBar } from '@/components/ui/index';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭' },
];

const GRADES = [
  { id: 'grade_1', name: 'الصف الأول', level: 'ابتدائي' },
  { id: 'grade_2', name: 'الصف الثاني', level: 'ابتدائي' },
  { id: 'grade_3', name: 'الصف الثالث', level: 'ابتدائي' },
  { id: 'grade_4', name: 'الصف الرابع', level: 'ابتدائي' },
  { id: 'grade_5', name: 'الصف الخامس', level: 'ابتدائي' },
  { id: 'grade_6', name: 'الصف السادس', level: 'ابتدائي' },
  { id: 'grade_7', name: 'أول متوسط', level: 'متوسط' },
  { id: 'grade_8', name: 'ثاني متوسط', level: 'متوسط' },
  { id: 'grade_9', name: 'ثالث متوسط', level: 'متوسط' },
  { id: 'grade_10', name: 'أول ثانوي', level: 'ثانوي' },
  { id: 'grade_11', name: 'ثاني ثانوي', level: 'ثانوي' },
  { id: 'grade_12', name: 'ثالث ثانوي', level: 'ثانوي' },
];

const SUBJECTS = [
  { id: 'math', name: 'الرياضيات', icon: '🔢', color: '#3B82F6' },
  { id: 'science', name: 'العلوم', icon: '🔬', color: '#10B981' },
  { id: 'arabic', name: 'اللغة العربية', icon: '📖', color: '#F59E0B' },
  { id: 'english', name: 'اللغة الإنجليزية', icon: '🌍', color: '#8B5CF6' },
  { id: 'islamic', name: 'الدراسات الإسلامية', icon: '🕌', color: '#059669' },
  { id: 'social', name: 'الاجتماعيات', icon: '🗺️', color: '#D97706' },
  { id: 'cs', name: 'الحاسب والتقنية', icon: '💻', color: '#6366F1' },
  { id: 'art', name: 'التربية الفنية', icon: '🎨', color: '#EC4899' },
];

const GOALS = [
  { value: 15, label: '15 دقيقة', desc: 'خفيف' },
  { value: 30, label: '30 دقيقة', desc: 'معتدل', recommended: true },
  { value: 45, label: '45 دقيقة', desc: 'جاد' },
  { value: 60, label: 'ساعة كاملة', desc: 'مكثف' },
];

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    country: 'SA',
    curriculum: 'saudi',
    grade: '',
    subjects: [] as string[],
    dailyGoal: 30,
  });
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const toggleSubject = (id: string) => {
    setData(p => ({
      ...p,
      subjects: p.subjects.includes(id) ? p.subjects.filter(s => s !== id) : [...p.subjects, id],
    }));
  };

  async function finish() {
    setLoading(true);
    try {
      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingCompleted: true,
          country: data.country,
          studentInfo: {
            educationLevel: GRADES.find(g => g.id === data.grade)?.level || 'primary',
            grade: data.grade,
            curriculum: data.curriculum,
            subjects: data.subjects,
            dailyGoalMinutes: data.dailyGoal,
          },
        }),
      });
      await update({ onboardingCompleted: true });
      router.push('/student/dashboard');
    } catch { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">الخطوة {step} من {totalSteps}</span>
            <span className="text-sm text-primary-600 font-semibold">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <ProgressBar value={step} max={totalSteps} color="bg-gradient-to-r from-primary-500 to-secondary" size="md" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="text-6xl">👋</div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 font-cairo">أهلاً بك في نَبَغ!</h2>
                <p className="text-slate-500 mt-2">سنساعدك في إعداد تجربة تعليمية مخصصة لك تماماً</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: '🤖', text: 'مساعد ذكي بالـ AI' },
                  { icon: '🎯', text: 'تعلم تكيفي شخصي' },
                  { icon: '🏆', text: 'نقاط وشارات' },
                  { icon: '📊', text: 'تتبع تقدمك' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-2 bg-primary-50 rounded-xl p-3">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-slate-700 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" fullWidth onClick={() => setStep(2)}>ابدأ الإعداد 🚀</Button>
            </div>
          )}

          {/* Step 2: Country */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 font-cairo">من أي دولة أنت؟ 🌍</h2>
                <p className="text-slate-500 text-sm mt-1">لاختيار المنهج المناسب</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COUNTRIES.map(c => (
                  <button key={c.code} onClick={() => setData(p => ({ ...p, country: c.code }))}
                    className={cn('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                      data.country === c.code ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    )}>
                    <span className="text-2xl">{c.flag}</span> {c.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>← رجوع</Button>
                <Button fullWidth onClick={() => setStep(3)} disabled={!data.country}>التالي →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Grade */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 font-cairo">ما صفك الدراسي؟ 🎓</h2>
                <p className="text-slate-500 text-sm mt-1">لعرض المحتوى المناسب لمستواك</p>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {['ابتدائي', 'متوسط', 'ثانوي'].map(level => (
                  <div key={level}>
                    <p className="text-xs text-slate-400 font-bold mb-1.5 px-1">{level}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADES.filter(g => g.level === level).map(g => (
                        <button key={g.id} onClick={() => setData(p => ({ ...p, grade: g.id }))}
                          className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all',
                            data.grade === g.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          )}>
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>← رجوع</Button>
                <Button fullWidth onClick={() => setStep(4)} disabled={!data.grade}>التالي →</Button>
              </div>
            </div>
          )}

          {/* Step 4: Subjects */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 font-cairo">اختر موادك 📚</h2>
                <p className="text-slate-500 text-sm mt-1">اختر المواد التي تريد دراستها (يمكن تغييرها لاحقاً)</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => toggleSubject(s.id)}
                    className={cn('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                      data.subjects.includes(s.id) ? 'border-current text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    )}
                    style={data.subjects.includes(s.id) ? { borderColor: s.color, background: s.color } : {}}>
                    <span className="text-xl">{s.icon}</span>
                    <span>{s.name}</span>
                    {data.subjects.includes(s.id) && <span className="mr-auto text-white">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(3)}>← رجوع</Button>
                <Button fullWidth onClick={() => setStep(5)} disabled={data.subjects.length === 0}>التالي ({data.subjects.length} مواد) →</Button>
              </div>
            </div>
          )}

          {/* Step 5: Daily Goal */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 font-cairo">هدفك اليومي ⭐</h2>
                <p className="text-slate-500 text-sm mt-1">كم دقيقة يومياً تريد أن تتعلم؟</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => setData(p => ({ ...p, dailyGoal: g.value }))}
                    className={cn('p-4 rounded-xl border-2 text-center transition-all relative',
                      data.dailyGoal === g.value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                    )}>
                    {g.recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-primary-500 text-white rounded-full px-2 py-0.5">موصى به</span>
                    )}
                    <div className="font-black text-2xl text-slate-800 font-cairo">{g.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{g.desc}</div>
                  </button>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                <p className="font-semibold">✨ أنت جاهز تقريباً!</p>
                <ul className="mt-2 space-y-1 text-green-700">
                  <li>📍 الدولة: {COUNTRIES.find(c => c.code === data.country)?.name}</li>
                  <li>🎓 الصف: {GRADES.find(g => g.id === data.grade)?.name}</li>
                  <li>📚 المواد: {data.subjects.length} مادة</li>
                  <li>⏱ الهدف: {data.dailyGoal} دقيقة / يوم</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(4)}>← رجوع</Button>
                <Button fullWidth size="lg" loading={loading} onClick={finish}>ابدأ التعلم! 🎉</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
