'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProgressBar, Button, Card, CircularProgress } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';

interface LessonPageProps { params: { lessonId: string } }

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'intro'|'content'|'summary'|'complete'>('intro');
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [checkpointAnswer, setCheckpointAnswer] = useState<string>('');
  const [checkpointResult, setCheckpointResult] = useState<'correct'|'wrong'|null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startTime] = useState(Date.now());
  const [xpPopup, setXpPopup] = useState<number|null>(null);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/lessons/${params.lessonId}`)
      .then(r => r.json())
      .then(d => { setLesson(d.data); setLoading(false); })
      .catch(() => { toast('حدث خطأ في تحميل الدرس', 'error'); setLoading(false); });

    fetch(`/api/exercises?lessonId=${params.lessonId}`)
      .then(r => r.json())
      .then(d => { if (d.data?.[0]) setExercise(d.data[0]); });
  }, [params.lessonId]);

  const completeLesson = useCallback(async () => {
    if (completed) return;
    setCompleted(true);
    const timeSpent = Math.round((Date.now() - startTime) / 60000);
    try {
      const res = await fetch(`/api/lessons/${params.lessonId}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpent }),
      });
      const data = await res.json();
      if (data.success) {
        setXpPopup(data.xpEarned);
        setTimeout(() => setXpPopup(null), 3000);
        if (data.leveledUp) toast(`🎉 وصلت للمستوى ${data.newLevel}!`, 'success');
        if (data.newBadges?.length > 0) toast(`🏅 شارة جديدة!`, 'success');
      }
    } catch { }
    setPhase('complete');
  }, [completed, params.lessonId, startTime]);

  const answerCheckpoint = (answer: string) => {
    if (!checkpoint) return;
    const correct = checkpoint.question.options?.find((o: any) => o.isCorrect)?.text === answer ||
      checkpoint.question.correctAnswer === answer;
    setCheckpointAnswer(answer);
    setCheckpointResult(correct ? 'correct' : 'wrong');
    setTimeout(() => { setCheckpoint(null); setCheckpointAnswer(''); setCheckpointResult(null); }, 2000);
  };

  const submitRating = async (r: number) => {
    setRating(r);
    await fetch(`/api/lessons/${params.lessonId}/rate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: r }),
    });
    toast('شكراً على تقييمك! +15 XP', 'success');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500">جارٍ تحميل الدرس...</p>
      </div>
    </div>
  );

  if (!lesson) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-slate-700">الدرس غير موجود</h2>
      <Link href="/student/subjects" className="mt-4 inline-block text-primary-600 hover:underline">العودة للمواد</Link>
    </div>
  );

  const slides = lesson.content?.slides || [];
  const totalSlides = Math.max(slides.length, 1);
  const slideProgress = Math.round(((currentSlide + 1) / totalSlides) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* XP Float Popup */}
      {xpPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-white font-black text-xl rounded-full px-6 py-3 shadow-lg xp-float pointer-events-none">
          +{xpPopup} XP 🌟
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/subjects" className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition">←</Link>
        <div className="flex-1">
          <ProgressBar value={phase === 'intro' ? 10 : phase === 'content' ? 40 + slideProgress * 0.4 : phase === 'summary' ? 90 : 100} size="md" />
        </div>
        <span className="text-xs text-slate-500 font-numbers">{lesson.xpReward} XP</span>
      </div>

      {/* ── Phase: Intro ── */}
      {phase === 'intro' && (
        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center text-4xl mx-auto">📖</div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 font-cairo">{lesson.title}</h1>
            <p className="text-slate-500 mt-2 leading-relaxed">{lesson.description}</p>
          </div>
          {lesson.objectives?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 text-right">
              <h3 className="font-bold text-blue-800 mb-3 font-cairo">🎯 بعد هذا الدرس ستتمكن من:</h3>
              <ul className="space-y-1.5">
                {lesson.objectives.map((o: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                    <span className="text-blue-400 mt-0.5">✓</span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <span>⏱ {lesson.estimatedMinutes} دقيقة</span>
            <span>📊 {lesson.difficulty === 'easy' ? 'سهل' : lesson.difficulty === 'medium' ? 'متوسط' : 'متقدم'}</span>
            <span className="text-amber-600 font-semibold">+{lesson.xpReward} XP</span>
          </div>
          <Button size="lg" fullWidth onClick={() => setPhase('content')}>ابدأ الدرس 🚀</Button>
        </Card>
      )}

      {/* ── Phase: Content ── */}
      {phase === 'content' && (
        <div className="space-y-6">
          {/* Video Player */}
          {lesson.content?.video?.url && (
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                <video
                  src={lesson.content.video.url}
                  controls
                  poster={lesson.content.video.thumbnailUrl}
                  className="w-full h-full"
                  onEnded={() => { if (slides.length === 0) setPhase('summary'); }}
                />
              </div>
            </Card>
          )}

          {/* Article Content */}
          {lesson.content?.article?.html && (
            <Card className="p-6">
              <div
                className="prose prose-slate max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.content.article.html }}
              />
            </Card>
          )}

          {/* Slides */}
          {slides.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">الشريحة {currentSlide + 1} / {slides.length}</span>
                <ProgressBar value={currentSlide + 1} max={slides.length} size="sm" className="w-32" />
              </div>
              <div className="min-h-32">
                <h3 className="font-bold text-slate-800 mb-3 font-cairo">{slides[currentSlide]?.title}</h3>
                <div className="text-sm text-slate-600 leading-relaxed">
                  {typeof slides[currentSlide]?.content === 'string'
                    ? slides[currentSlide].content
                    : JSON.stringify(slides[currentSlide]?.content)}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {currentSlide > 0 && <Button variant="outline" size="sm" onClick={() => setCurrentSlide(p => p - 1)}>السابق</Button>}
                {currentSlide < slides.length - 1
                  ? <Button size="sm" className="mr-auto" onClick={() => setCurrentSlide(p => p + 1)}>التالي ←</Button>
                  : <Button size="sm" className="mr-auto" onClick={() => setPhase('summary')}>إنهاء الشرح ✓</Button>
                }
              </div>
            </Card>
          )}

          {/* Checkpoint Popup */}
          {checkpoint && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6 space-y-4">
                <h3 className="font-bold text-slate-800 font-cairo">سؤال سريع 🤔</h3>
                <p className="text-slate-700">{checkpoint.question.text}</p>
                <div className="space-y-2">
                  {checkpoint.question.options?.map((opt: any, i: number) => (
                    <button key={i} onClick={() => answerCheckpoint(opt.text)}
                      className={`w-full text-right px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                        checkpointAnswer === opt.text
                          ? checkpointResult === 'correct' ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                {checkpointResult && (
                  <div className={`p-3 rounded-xl text-sm font-medium ${checkpointResult === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {checkpointResult === 'correct' ? '✅ أحسنت! إجابة صحيحة' : `❌ ${checkpoint.question.explanation || 'إجابة خاطئة'}`}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* No slides - show done button */}
          {slides.length === 0 && !lesson.content?.video && (
            <Button fullWidth onClick={() => setPhase('summary')}>انتقل للملخص →</Button>
          )}
          {slides.length === 0 && lesson.content?.video && (
            <Button fullWidth variant="outline" onClick={() => setPhase('summary')}>انتقل للملخص →</Button>
          )}
        </div>
      )}

      {/* ── Phase: Summary ── */}
      {phase === 'summary' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-black text-slate-800 mb-4 font-cairo">📝 ملخص الدرس</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">{lesson.summary?.text}</p>
            {lesson.summary?.keyPoints?.length > 0 && (
              <div className="space-y-2">
                {lesson.summary.keyPoints.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary-50 rounded-xl">
                    <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-sm text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Flashcards */}
          {lesson.flashcards?.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 font-cairo">🃏 بطاقات المراجعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.flashcards.slice(0, 4).map((card: any, i: number) => (
                  <FlashCard key={i} front={card.front} back={card.back} />
                ))}
              </div>
            </Card>
          )}

          <Button size="lg" fullWidth onClick={completeLesson}>إتمام الدرس وكسب النقاط! 🎉</Button>
        </div>
      )}

      {/* ── Phase: Complete ── */}
      {phase === 'complete' && (
        <Card className="p-8 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-cairo">أحسنت!</h2>
            <p className="text-slate-500 mt-2">أكملت درس "{lesson.title}"</p>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500 font-numbers">+{lesson.xpReward}</div>
              <div className="text-xs text-slate-500">نقطة XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{lesson.estimatedMinutes}</div>
              <div className="text-xs text-slate-500">دقيقة</div>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <p className="text-sm text-slate-600 mb-3">قيّم هذا الدرس:</p>
            <div className="flex items-center justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => submitRating(s)} className="text-3xl transition-transform hover:scale-110">
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {exercise && (
              <Link href={`/student/exercise/${exercise._id}`} className="flex-1">
                <Button variant="primary" fullWidth size="lg">حل التمارين ✏️</Button>
              </Link>
            )}
            <Link href="/student/subjects" className="flex-1">
              <Button variant="outline" fullWidth size="lg">العودة للمواد</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function FlashCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(!flipped)}
      className={`w-full min-h-24 p-4 rounded-xl border-2 text-sm text-right transition-all ${flipped ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-700'}`}>
      <div className="text-xs font-bold mb-2 text-slate-400">{flipped ? 'الإجابة' : 'السؤال'}</div>
      <div>{flipped ? back : front}</div>
    </button>
  );
}
