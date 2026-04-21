'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button, Card, ProgressBar, CircularProgress } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';
import { cn, getScoreLabel } from '@/lib/utils';

interface ExercisePageProps { params: { exerciseId: string } }

export default function ExercisePage({ params }: ExercisePageProps) {
  const { toast } = useToast();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'intro'|'quiz'|'results'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [selected, setSelected] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{correct:boolean; text:string; explanation?:string} | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [xpPopup, setXpPopup] = useState<number|null>(null);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const qStartTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/exercises/${params.exerciseId}`)
      .then(r => r.json())
      .then(d => { setExercise(d.data); if (d.data?.settings?.timeLimit > 0) setTimeLeft(d.data.settings.timeLimit * 60); setLoading(false); })
      .catch(() => { toast('خطأ في تحميل التمرين', 'error'); setLoading(false); });
  }, [params.exerciseId]);

  // Timer countdown
  useEffect(() => {
    if (phase === 'quiz' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitAll(); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timeLeft > 0]);

  const q = exercise?.questions?.[currentQ];

  function selectAnswer(answer: any) {
    if (submitted) return;
    setSelected(answer);
  }

  function checkAnswer() {
    if (selected === null || selected === undefined) return;
    setSubmitted(true);
    const timeSpent = Math.round((Date.now() - qStartTime.current) / 1000);
    setQuestionTimes(p => { const t = [...p]; t[currentQ] = timeSpent; return t; });
    setAnswers(p => ({ ...p, [currentQ]: { questionId: q._id, questionIndex: currentQ, answer: selected, timeSpent, hintsUsed } }));

    // Client-side feedback for speed
    let correct = false;
    if (q.type === 'multiple-choice') correct = q.options?.find((o: any) => o.text === selected)?.isCorrect === true;
    else if (q.type === 'true-false') correct = selected === q.correctBoolean;
    else correct = true; // Server will grade complex types

    setFeedback({ correct, text: correct ? 'أحسنت! ✅' : 'إجابة خاطئة ❌', explanation: q.explanation });
  }

  function nextQuestion() {
    if (currentQ < exercise.questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null); setSubmitted(false); setFeedback(null); setHintsUsed(0); setShowHint(false);
      qStartTime.current = Date.now();
    } else {
      submitAll();
    }
  }

  async function submitAll() {
    clearInterval(timerRef.current);
    setPhase('results');
    const allAnswers = { ...answers };
    if (selected !== null && !allAnswers[currentQ]) {
      allAnswers[currentQ] = { questionId: q?._id, questionIndex: currentQ, answer: selected, timeSpent: 0, hintsUsed };
    }
    try {
      const totalTime = exercise.settings?.timeLimit ? (exercise.settings.timeLimit * 60 - timeLeft) / 60 : 5;
      const res = await fetch(`/api/exercises/${params.exerciseId}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: Object.values(allAnswers), timeSpentMinutes: Math.round(totalTime) }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setXpPopup(data.results.xpEarned);
        setTimeout(() => setXpPopup(null), 3000);
        if (data.results.leveledUp) toast(`🎉 وصلت للمستوى ${data.results.newLevel}!`, 'success');
      }
    } catch { toast('خطأ في تسليم الإجابات', 'error'); }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!exercise) return <div className="text-center py-16 text-slate-500">التمرين غير موجود</div>;

  // ── Intro Phase ──
  if (phase === 'intro') return (
    <div className="max-w-xl mx-auto">
      <Card className="p-8 text-center space-y-5">
        <div className="text-5xl">✏️</div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">{exercise.title}</h1>
          <p className="text-slate-500 mt-2">{exercise.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-3"><div className="text-xl font-black text-blue-600">{exercise.questions.length}</div><div className="text-xs text-slate-500 mt-1">سؤال</div></div>
          <div className="bg-amber-50 rounded-xl p-3"><div className="text-xl font-black text-amber-600">{exercise.settings.timeLimit ? `${exercise.settings.timeLimit}د` : '∞'}</div><div className="text-xs text-slate-500 mt-1">وقت</div></div>
          <div className="bg-green-50 rounded-xl p-3"><div className="text-xl font-black text-green-600">{exercise.xpReward.completion}</div><div className="text-xs text-slate-500 mt-1">XP</div></div>
        </div>
        <Button size="lg" fullWidth onClick={() => { setPhase('quiz'); qStartTime.current = Date.now(); }}>ابدأ التمرين 🚀</Button>
        <Link href="/student/subjects" className="block text-sm text-slate-500 hover:text-primary-600">← رجوع</Link>
      </Card>
    </div>
  );

  // ── Results Phase ──
  if (phase === 'results') {
    const score = results;
    const label = score ? getScoreLabel(score.percentage) : null;
    return (
      <div className="max-w-xl mx-auto space-y-6">
        {xpPopup && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-white font-black text-xl rounded-full px-6 py-3 shadow-lg xp-float">
            +{xpPopup} XP 🌟
          </div>
        )}
        <Card className="p-8 text-center space-y-5">
          <div className="text-5xl">{score?.isPerfect ? '🏆' : score?.passed ? '🎉' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-cairo">
              {score?.isPerfect ? 'مثالي!' : score?.passed ? 'ممتاز!' : 'استمر في المحاولة!'}
            </h2>
            {!score && <p className="text-slate-500 mt-2">جارٍ معالجة نتائجك...</p>}
          </div>
          {score && (
            <>
              <CircularProgress value={score.percentage} size={120} strokeWidth={10} color={score.passed ? '#10B981' : '#EF4444'}>
                <div className="text-center">
                  <div className={`text-2xl font-black font-numbers ${label?.color}`}>{score.percentage}%</div>
                  <div className="text-xs text-slate-500">{label?.label}</div>
                </div>
              </CircularProgress>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-3"><div className="text-xl font-black text-green-600">{score.correctAnswers}</div><div className="text-xs text-slate-500">صحيح</div></div>
                <div className="bg-red-50 rounded-xl p-3"><div className="text-xl font-black text-red-600">{score.totalQuestions - score.correctAnswers}</div><div className="text-xs text-slate-500">خطأ</div></div>
                <div className="bg-amber-50 rounded-xl p-3"><div className="text-xl font-black text-amber-600">+{score.xpEarned}</div><div className="text-xs text-slate-500">XP</div></div>
              </div>
              {/* Answer Review */}
              <div className="text-right space-y-2 max-h-60 overflow-y-auto">
                <h3 className="font-bold text-slate-800 font-cairo">مراجعة الإجابات:</h3>
                {score.gradedAnswers?.map((a: any, i: number) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${a.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{a.isCorrect ? '✅' : '❌'}</span>
                      <span className="font-medium">{exercise.questions[i]?.text}</span>
                    </div>
                    {!a.isCorrect && a.correctAnswer && (
                      <div className="text-xs text-green-700 mt-1">الإجابة الصحيحة: {String(a.correctAnswer)}</div>
                    )}
                    {a.explanation && <div className="text-xs text-slate-600 mt-1">{a.explanation}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-3">
            {score?.canRetry && (
              <Button variant="outline" fullWidth onClick={() => {
                setPhase('intro'); setCurrentQ(0); setAnswers({}); setSelected(null);
                setSubmitted(false); setFeedback(null); setResults(null);
              }}>حاول مرة أخرى</Button>
            )}
            <Link href="/student/subjects" className="flex-1"><Button fullWidth>العودة للمواد</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Quiz Phase ──
  const progress = Math.round(((currentQ) / exercise.questions.length) * 100);
  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600 font-numbers whitespace-nowrap">{currentQ + 1}/{exercise.questions.length}</span>
        <ProgressBar value={currentQ} max={exercise.questions.length} className="flex-1" />
        {timeLeft > 0 && (
          <span className={cn('text-sm font-bold font-numbers px-3 py-1 rounded-lg', timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600')}>
            ⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
          </span>
        )}
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
              {q.type === 'multiple-choice' ? 'اختيار من متعدد' : q.type === 'true-false' ? 'صح أو خطأ' : q.type === 'fill-blank' ? 'إكمال فراغ' : q.type === 'ordering' ? 'ترتيب' : q.type === 'short-answer' ? 'إجابة قصيرة' : q.type}
            </span>
            <span className="text-xs text-amber-600 font-medium">+{q.points} نقطة</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed text-base">{q.text}</p>
          {q.image && <img src={q.image} alt="" className="w-full rounded-xl mt-3 max-h-48 object-contain" />}
        </div>

        {/* Multiple Choice */}
        {q.type === 'multiple-choice' && (
          <div className="space-y-2">
            {q.options?.map((opt: any, i: number) => (
              <button key={i} onClick={() => selectAnswer(opt.text)} disabled={submitted}
                className={cn('w-full text-right px-4 py-3 rounded-xl border-2 text-sm transition-all',
                  submitted && opt.isCorrect && 'border-green-500 bg-green-50 text-green-700 answer-correct',
                  submitted && selected === opt.text && !opt.isCorrect && 'border-red-500 bg-red-50 text-red-700 answer-wrong',
                  !submitted && selected === opt.text && 'border-primary-500 bg-primary-50',
                  !submitted && selected !== opt.text && 'border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                )}>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-3">
            {[{label:'✅ صح', val:true},{label:'❌ خطأ', val:false}].map(btn => (
              <button key={String(btn.val)} onClick={() => selectAnswer(btn.val)} disabled={submitted}
                className={cn('py-4 rounded-xl border-2 text-sm font-bold transition-all',
                  submitted && q.correctBoolean === btn.val && 'border-green-500 bg-green-50 text-green-700',
                  submitted && selected === btn.val && q.correctBoolean !== btn.val && 'border-red-500 bg-red-50 text-red-700',
                  !submitted && selected === btn.val && 'border-primary-500 bg-primary-50',
                  !submitted && selected !== btn.val && 'border-slate-200 hover:border-primary-300'
                )}>
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {q.type === 'short-answer' && (
          <input type="text" value={selected || ''} onChange={e => setSelected(e.target.value)} disabled={submitted}
            placeholder="اكتب إجابتك هنا..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:outline-none" />
        )}

        {/* Fill Blank */}
        {q.type === 'fill-blank' && (
          <div className="space-y-2">
            {q.blanks?.map((_: any, i: number) => (
              <input key={i} type="text" value={(selected || [])[i] || ''} onChange={e => {
                const arr = [...(selected || [])]; arr[i] = e.target.value; setSelected(arr);
              }} disabled={submitted} placeholder={`الفراغ ${i+1}`}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
            ))}
          </div>
        )}

        {/* Hint */}
        {q.hint && !submitted && (
          <div>
            {!showHint
              ? <button onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }} className="text-xs text-amber-600 hover:underline flex items-center gap-1">💡 أعطني تلميحاً (-2 نقطة)</button>
              : <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">💡 {q.hint}</div>
            }
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={cn('p-4 rounded-xl text-sm', feedback.correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800')}>
            <p className="font-semibold">{feedback.text}</p>
            {feedback.explanation && <p className="mt-1 text-xs opacity-80">{feedback.explanation}</p>}
          </div>
        )}
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!submitted
          ? <Button fullWidth size="lg" onClick={checkAnswer} disabled={selected === null || selected === undefined}>تحقق من الإجابة ✓</Button>
          : <Button fullWidth size="lg" onClick={nextQuestion}>{currentQ < exercise.questions.length - 1 ? 'السؤال التالي ←' : 'عرض النتائج 🏆'}</Button>
        }
      </div>
    </div>
  );
}
