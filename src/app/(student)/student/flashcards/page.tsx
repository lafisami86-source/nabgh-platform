'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui/index';
import { cn } from '@/lib/utils';

interface Flashcard { front: string; back: string; image?: string; }
interface LessonWithCards { _id: string; title: string; flashcards: Flashcard[]; }

export default function FlashcardsPage() {
  const [lessons, setLessons] = useState<LessonWithCards[]>([]);
  const [selected, setSelected] = useState<LessonWithCards | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, 'easy' | 'hard' | 'again'>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lessons?unitId=').then(r => r.json()).then(d => {
      if (d.success) {
        const withCards = d.data.filter((l: any) => l.flashcards?.length > 0);
        setLessons(withCards.slice(0, 10));
      }
      setLoading(false);
    });
  }, []);

  function startStudy(lesson: LessonWithCards) {
    setSelected(lesson); setCardIndex(0); setFlipped(false); setResults({}); setDone(false);
  }

  function rate(rating: 'easy' | 'hard' | 'again') {
    setResults(p => ({ ...p, [cardIndex]: rating }));
    if (cardIndex < (selected?.flashcards.length || 0) - 1) {
      setCardIndex(c => c + 1); setFlipped(false);
    } else setDone(true);
  }

  function restart() { setCardIndex(0); setFlipped(false); setResults({}); setDone(false); }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Results screen
  if (done && selected) {
    const easy = Object.values(results).filter(r => r === 'easy').length;
    const hard = Object.values(results).filter(r => r === 'hard').length;
    const again = Object.values(results).filter(r => r === 'again').length;
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center space-y-5">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-black text-slate-800 font-cairo">انتهت الجلسة!</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3"><div className="text-2xl font-black text-green-600">{easy}</div><div className="text-xs text-slate-500">سهل</div></div>
            <div className="bg-amber-50 rounded-xl p-3"><div className="text-2xl font-black text-amber-600">{hard}</div><div className="text-xs text-slate-500">صعب</div></div>
            <div className="bg-red-50 rounded-xl p-3"><div className="text-2xl font-black text-red-600">{again}</div><div className="text-xs text-slate-500">مجدداً</div></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={restart}>مراجعة مجدداً</Button>
            <Button fullWidth onClick={() => setSelected(null)}>اختر درساً آخر</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Lesson selection
  if (!selected) return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">🃏 بطاقات المراجعة</h1>
        <p className="text-slate-500 text-sm mt-1">راجع الدروس باستخدام بطاقات التعلم التكيفي</p>
      </div>
      {lessons.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🃏</div>
          <p className="text-slate-500">أكمل بعض الدروس لظهور بطاقات المراجعة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lessons.map(lesson => (
            <Card key={lesson._id} hover className="p-5" onClick={() => startStudy(lesson)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🃏</div>
                <div>
                  <h3 className="font-semibold text-slate-800">{lesson.title}</h3>
                  <p className="text-xs text-slate-500">{lesson.flashcards.length} بطاقة</p>
                </div>
              </div>
              <Button size="sm" fullWidth variant="outline">ابدأ المراجعة</Button>
            </Card>
          ))}
        </div>
      )}
      <Card className="p-5 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2 font-cairo">💡 كيف يعمل التكرار المتباعد؟</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>سهل</strong>: ستراه مجدداً بعد 7 أيام</li>
          <li>• <strong>صعب</strong>: ستراه مجدداً بعد 3 أيام</li>
          <li>• <strong>مجدداً</strong>: ستراه في نهاية الجلسة الحالية</li>
        </ul>
      </Card>
    </div>
  );

  // Study mode
  const card = selected.flashcards[cardIndex];
  const progress = Math.round(((cardIndex + 1) / selected.flashcards.length) * 100);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-700 text-sm">← رجوع</button>
        <span className="text-sm text-slate-500 font-numbers">{cardIndex + 1} / {selected.flashcards.length}</span>
        <Badge color="primary">{selected.title}</Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full">
        <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px', height: '280px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div className={cn('w-full h-full relative transition-all duration-500', flipped && '[transform:rotateY(180deg)]')}
          style={{ transformStyle: 'preserve-3d' }}>
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-2xl border-2 border-slate-200 shadow-card-hover flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-xs text-slate-400 mb-4 font-bold uppercase tracking-wider">السؤال</div>
            <p className="text-xl font-bold text-slate-800 leading-relaxed">{card.front}</p>
            <p className="text-xs text-slate-400 mt-6">اضغط للكشف عن الإجابة</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border-2 border-primary-200 shadow-card-hover flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-xs text-primary-400 mb-4 font-bold uppercase tracking-wider">الإجابة</div>
            <p className="text-xl font-bold text-primary-800 leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Rating buttons (only show when flipped) */}
      {flipped ? (
        <div className="grid grid-cols-3 gap-3">
          <Button variant="danger" onClick={() => rate('again')} className="flex-col h-16">
            <span className="text-lg">🔄</span>
            <span className="text-xs">مجدداً</span>
          </Button>
          <Button variant="outline" onClick={() => rate('hard')} className="flex-col h-16 border-amber-300 text-amber-700 hover:bg-amber-50">
            <span className="text-lg">😐</span>
            <span className="text-xs">صعب</span>
          </Button>
          <Button variant="success" onClick={() => rate('easy')} className="flex-col h-16">
            <span className="text-lg">😊</span>
            <span className="text-xs">سهل</span>
          </Button>
        </div>
      ) : (
        <Button fullWidth size="lg" variant="outline" onClick={() => setFlipped(true)}>
          اكشف الإجابة 👀
        </Button>
      )}
    </div>
  );
}
