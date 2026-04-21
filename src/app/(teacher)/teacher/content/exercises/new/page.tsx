'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Badge } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'ordering' | 'matching' | 'essay';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  skill: string;
  explanation: string;
  hint: string;
  // MCQ
  options: { text: string; isCorrect: boolean; feedback: string }[];
  // T/F
  correctBoolean: boolean;
  correction: string;
  // Fill blank
  blanks: { position: number; acceptedAnswers: string[]; caseSensitive: boolean }[];
  // Short answer
  acceptedAnswers: string[];
  // Ordering
  items: { text: string; correctOrder: number }[];
  // Matching
  pairs: { left: string; right: string }[];
}

const Q_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'multiple-choice', label: 'اختيار متعدد', icon: '🔘' },
  { value: 'true-false', label: 'صح / خطأ', icon: '✓✗' },
  { value: 'fill-blank', label: 'إكمال فراغ', icon: '___' },
  { value: 'short-answer', label: 'إجابة قصيرة', icon: '✏️' },
  { value: 'ordering', label: 'ترتيب', icon: '🔢' },
  { value: 'matching', label: 'توصيل', icon: '🔗' },
  { value: 'essay', label: 'مقال', icon: '📝' },
];

function newQuestion(type: QuestionType): Question {
  return {
    id: Math.random().toString(36).slice(2),
    type, text: '', points: 10, difficulty: 'medium', skill: '', explanation: '', hint: '',
    options: type === 'multiple-choice' ? [
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
    ] : [],
    correctBoolean: true, correction: '',
    blanks: type === 'fill-blank' ? [{ position: 0, acceptedAnswers: [''], caseSensitive: false }] : [],
    acceptedAnswers: type === 'short-answer' ? [''] : [],
    items: type === 'ordering' ? [{ text: '', correctOrder: 1 }, { text: '', correctOrder: 2 }, { text: '', correctOrder: 3 }] : [],
    pairs: type === 'matching' ? [{ left: '', right: '' }, { left: '', right: '' }] : [],
  };
}

export default function NewExercisePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    title: '', description: '', subjectId: '', type: 'practice',
    timeLimit: 0, passingScore: 60, shuffleQuestions: true, shuffleOptions: true,
    showExplanation: 'immediately', allowRetry: true, maxAttempts: 3,
    xpCompletion: 100, xpPerfect: 50,
  });
  const [questions, setQuestions] = useState<Question[]>([newQuestion('multiple-choice')]);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => { if (d.success) setSubjects(d.data); });
  }, []);

  function addQuestion(type: QuestionType) {
    const q = newQuestion(type);
    setQuestions(p => [...p, q]);
    setActiveQ(q.id);
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...updates } : q));
  }

  function removeQuestion(id: string) {
    setQuestions(p => p.filter(q => q.id !== id));
    if (activeQ === id) setActiveQ(null);
  }

  function moveQuestion(id: string, dir: 'up' | 'down') {
    const idx = questions.findIndex(q => q.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === questions.length - 1) return;
    const newQ = [...questions];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    [newQ[idx], newQ[target]] = [newQ[target], newQ[idx]];
    setQuestions(newQ);
  }

  async function save(publish = false) {
    if (!meta.title || !meta.subjectId) { toast('يرجى ملء العنوان والمادة', 'error'); return; }
    if (questions.length === 0) { toast('يرجى إضافة سؤال على الأقل', 'error'); return; }
    setSaving(true);
    const payload = {
      title: meta.title, description: meta.description, subjectId: meta.subjectId,
      type: meta.type, isPublished: publish,
      questions: questions.map((q, i) => ({
        order: i + 1, type: q.type, text: q.text, points: q.points,
        difficulty: q.difficulty, skill: q.skill, explanation: q.explanation, hint: q.hint,
        options: q.options, correctBoolean: q.correctBoolean, correction: q.correction,
        blanks: q.blanks, acceptedAnswers: q.acceptedAnswers, items: q.items,
        pairs: q.pairs.map(p => ({ left: { text: p.left }, right: { text: p.right } })),
        tags: [q.skill].filter(Boolean),
      })),
      settings: {
        shuffleQuestions: meta.shuffleQuestions, shuffleOptions: meta.shuffleOptions,
        showExplanation: meta.showExplanation, allowRetry: meta.allowRetry,
        maxAttempts: +meta.maxAttempts, timeLimit: +meta.timeLimit,
        passingScore: +meta.passingScore, showResults: true, showCorrectAnswers: true,
        penaltyForWrong: 0, bonusForSpeed: false,
      },
      xpReward: { completion: +meta.xpCompletion, perfect: +meta.xpPerfect, speed: 25 },
    };
    const res = await fetch('/api/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { toast(publish ? 'تم نشر التمرين ✅' : 'تم حفظ المسودة', 'success'); router.push('/teacher/content/exercises'); }
    else toast(data.error || 'حدث خطأ', 'error');
  }

  const setM = (k: string) => (e: any) => setMeta(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 font-cairo">✏️ إنشاء تمرين جديد</h1>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← رجوع</button>
      </div>

      {/* Meta */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-bold font-cairo">إعدادات التمرين</h2></div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Input label="عنوان التمرين *" placeholder="مثال: تمارين على الكسور" value={meta.title} onChange={setM('title')} /></div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المادة *</label>
            <select value={meta.subjectId} onChange={setM('subjectId')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">اختر المادة</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع التمرين</label>
            <select value={meta.type} onChange={setM('type')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="practice">تدريب</option>
              <option value="homework">واجب</option>
              <option value="quiz">اختبار قصير</option>
              <option value="exam">اختبار رسمي</option>
            </select>
          </div>
          <Input label="وقت الحل (دقيقة، 0=بدون حد)" type="number" value={meta.timeLimit} onChange={setM('timeLimit')} />
          <Input label="درجة النجاح (%)" type="number" value={meta.passingScore} onChange={setM('passingScore')} />
          <Input label="XP للإكمال" type="number" value={meta.xpCompletion} onChange={setM('xpCompletion')} />
          <Input label="XP للمثالي (100%)" type="number" value={meta.xpPerfect} onChange={setM('xpPerfect')} />
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <input type="checkbox" id="shuffle" checked={meta.shuffleQuestions} onChange={e => setMeta(p => ({...p, shuffleQuestions: e.target.checked}))} className="w-4 h-4 accent-primary-500" />
            <label htmlFor="shuffle" className="text-sm text-slate-700">تبديل ترتيب الأسئلة عشوائياً</label>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <input type="checkbox" id="retry" checked={meta.allowRetry} onChange={e => setMeta(p => ({...p, allowRetry: e.target.checked}))} className="w-4 h-4 accent-primary-500" />
            <label htmlFor="retry" className="text-sm text-slate-700">السماح بإعادة المحاولة</label>
          </div>
        </div>
      </Card>

      {/* Question list */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card key={q.id} className={cn('overflow-hidden transition-all', activeQ === q.id && 'ring-2 ring-primary-500')}>
            {/* Question header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer" onClick={() => setActiveQ(activeQ === q.id ? null : q.id)}>
              <span className="text-xs font-bold text-slate-400 font-numbers w-6">S{idx + 1}</span>
              <span className="text-sm font-medium text-slate-700 flex-1 truncate">{q.text || 'سؤال جديد...'}</span>
              <Badge color={q.difficulty === 'easy' ? 'success' : q.difficulty === 'medium' ? 'warning' : 'error'} size="xs">
                {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </Badge>
              <span className="text-xs text-slate-400 font-numbers">{q.points} نقطة</span>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'up'); }} className="text-slate-400 hover:text-slate-600 text-xs px-1">↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'down'); }} className="text-slate-400 hover:text-slate-600 text-xs px-1">↓</button>
                <button onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }} className="text-red-400 hover:text-red-600 text-xs px-1 ml-1">✕</button>
              </div>
            </div>

            {/* Question editor (expanded) */}
            {activeQ === q.id && (
              <div className="p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">نص السؤال</label>
                    <textarea value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} rows={2} placeholder="اكتب السؤال هنا..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="w-24">
                    <Input label="نقاط" type="number" value={q.points} onChange={(e: any) => updateQuestion(q.id, { points: +e.target.value })} />
                  </div>
                </div>

                {/* MCQ options */}
                {q.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">الخيارات (علّم الإجابة الصحيحة)</label>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={cn('flex items-center gap-2 p-2 rounded-xl border', opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-slate-200')}>
                        <input type="radio" name={`correct-${q.id}`} checked={opt.isCorrect}
                          onChange={() => updateQuestion(q.id, { options: q.options.map((o, i) => ({ ...o, isCorrect: i === oi })) })}
                          className="w-4 h-4 accent-green-500 shrink-0" />
                        <input value={opt.text} onChange={e => updateQuestion(q.id, { options: q.options.map((o, i) => i === oi ? { ...o, text: e.target.value } : o) })}
                          placeholder={`الخيار ${oi + 1}`} className="flex-1 bg-transparent text-sm focus:outline-none" />
                        <input value={opt.feedback} onChange={e => updateQuestion(q.id, { options: q.options.map((o, i) => i === oi ? { ...o, feedback: e.target.value } : o) })}
                          placeholder="تعليق (اختياري)" className="w-32 bg-transparent text-xs text-slate-500 focus:outline-none border-r border-slate-200 pr-2" />
                        {q.options.length > 2 && (
                          <button onClick={() => updateQuestion(q.id, { options: q.options.filter((_, i) => i !== oi) })} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { options: [...q.options, { text: '', isCorrect: false, feedback: '' }] })}
                      className="text-xs text-primary-600 hover:underline">+ إضافة خيار</button>
                  </div>
                )}

                {/* True/False */}
                {q.type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: '✅ صح', val: true }, { label: '❌ خطأ', val: false }].map(btn => (
                      <button key={String(btn.val)} onClick={() => updateQuestion(q.id, { correctBoolean: btn.val })}
                        className={cn('py-3 rounded-xl border-2 text-sm font-bold transition-all', q.correctBoolean === btn.val ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300')}>
                        {btn.label}
                      </button>
                    ))}
                    <div className="col-span-2">
                      <Input label="التصحيح (للإجابة الخاطئة)" value={q.correction} onChange={(e: any) => updateQuestion(q.id, { correction: e.target.value })} placeholder="لأن..." />
                    </div>
                  </div>
                )}

                {/* Fill blank */}
                {q.type === 'fill-blank' && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">استخدم ___ في نص السؤال لوضع الفراغات</p>
                    {q.blanks.map((blank, bi) => (
                      <div key={bi} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 w-16">فراغ {bi + 1}:</span>
                        <input value={blank.acceptedAnswers[0] || ''} onChange={e => updateQuestion(q.id, { blanks: q.blanks.map((b, i) => i === bi ? { ...b, acceptedAnswers: [e.target.value] } : b) })}
                          placeholder="الإجابة الصحيحة" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { blanks: [...q.blanks, { position: q.blanks.length, acceptedAnswers: [''], caseSensitive: false }] })}
                      className="text-xs text-primary-600 hover:underline">+ إضافة فراغ</button>
                  </div>
                )}

                {/* Short answer */}
                {q.type === 'short-answer' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">الإجابات المقبولة</label>
                    {q.acceptedAnswers.map((ans, ai) => (
                      <div key={ai} className="flex gap-2">
                        <input value={ans} onChange={e => updateQuestion(q.id, { acceptedAnswers: q.acceptedAnswers.map((a, i) => i === ai ? e.target.value : a) })}
                          placeholder={`إجابة ${ai + 1}`} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        {q.acceptedAnswers.length > 1 && (
                          <button onClick={() => updateQuestion(q.id, { acceptedAnswers: q.acceptedAnswers.filter((_, i) => i !== ai) })} className="text-red-400 text-xs hover:text-red-600">✕</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { acceptedAnswers: [...q.acceptedAnswers, ''] })} className="text-xs text-primary-600 hover:underline">+ إضافة إجابة مقبولة</button>
                  </div>
                )}

                {/* Ordering */}
                {q.type === 'ordering' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">العناصر (بالترتيب الصحيح)</label>
                    {q.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{item.correctOrder}</span>
                        <input value={item.text} onChange={e => updateQuestion(q.id, { items: q.items.map((it, i) => i === ii ? { ...it, text: e.target.value } : it) })}
                          placeholder={`العنصر ${ii + 1}`} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { items: [...q.items, { text: '', correctOrder: q.items.length + 1 }] })} className="text-xs text-primary-600 hover:underline">+ إضافة عنصر</button>
                  </div>
                )}

                {/* Matching */}
                {q.type === 'matching' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">الأزواج (يسار ↔ يمين)</label>
                    {q.pairs.map((pair, pi) => (
                      <div key={pi} className="grid grid-cols-2 gap-2">
                        <input value={pair.left} onChange={e => updateQuestion(q.id, { pairs: q.pairs.map((p, i) => i === pi ? { ...p, left: e.target.value } : p) })}
                          placeholder={`يسار ${pi + 1}`} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input value={pair.right} onChange={e => updateQuestion(q.id, { pairs: q.pairs.map((p, i) => i === pi ? { ...p, right: e.target.value } : p) })}
                          placeholder={`يمين ${pi + 1}`} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { pairs: [...q.pairs, { left: '', right: '' }] })} className="text-xs text-primary-600 hover:underline">+ إضافة زوج</button>
                  </div>
                )}

                {/* Common fields */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الصعوبة</label>
                    <select value={q.difficulty} onChange={e => updateQuestion(q.id, { difficulty: e.target.value as any })} className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option>
                    </select>
                  </div>
                  <Input label="المهارة المستهدفة" placeholder="مثال: fraction-addition" value={q.skill} onChange={(e: any) => updateQuestion(q.id, { skill: e.target.value })} />
                  <div className="col-span-2"><Input label="شرح الإجابة" placeholder="لماذا هذه الإجابة صحيحة؟" value={q.explanation} onChange={(e: any) => updateQuestion(q.id, { explanation: e.target.value })} /></div>
                  <div className="col-span-2"><Input label="تلميح" placeholder="تلميح للطالب عند الخطأ" value={q.hint} onChange={(e: any) => updateQuestion(q.id, { hint: e.target.value })} /></div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add question buttons */}
      <Card className="p-4">
        <p className="text-sm font-medium text-slate-700 mb-3">إضافة سؤال جديد:</p>
        <div className="flex flex-wrap gap-2">
          {Q_TYPES.map(t => (
            <button key={t.value} onClick={() => addQuestion(t.value)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl text-xs font-medium hover:bg-primary-100 transition">
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
        <div className="flex items-center gap-6">
          <span>📝 {questions.length} سؤال</span>
          <span>💯 {questions.reduce((s, q) => s + q.points, 0)} نقطة</span>
          <span>⏱ ~{Math.ceil(questions.length * 1.5)} دقيقة</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" fullWidth size="lg" onClick={() => save(false)} loading={saving}>💾 حفظ مسودة</Button>
        <Button fullWidth size="lg" onClick={() => save(true)} loading={saving}>🚀 نشر التمرين</Button>
      </div>
    </div>
  );
}
