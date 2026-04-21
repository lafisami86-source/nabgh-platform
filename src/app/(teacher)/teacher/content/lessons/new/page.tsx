'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui/index';
import { useToast } from '@/components/ui/Toaster';

export default function NewLessonPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', subjectId: '', unitId: '', grade: 'grade_6',
    difficulty: 'medium', estimatedMinutes: 20, xpReward: 50,
    contentType: 'mixed',
    videoUrl: '', videoThumbnail: '',
    articleHtml: '',
    objectives: ['', '', ''],
    keyPoints: ['', '', ''],
    flashcardFront: [''], flashcardBack: [''],
    tags: '',
    isPublished: false,
  });

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => { if (d.success) setSubjects(d.data); });
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      fetch(`/api/units?subjectId=${form.subjectId}`).then(r => r.json()).then(d => { if (d.success) setUnits(d.data); });
    }
  }, [form.subjectId]);

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  function addFlashcard() {
    setForm(p => ({ ...p, flashcardFront: [...p.flashcardFront, ''], flashcardBack: [...p.flashcardBack, ''] }));
  }

  async function save(publish = false) {
    if (!form.title || !form.subjectId) { toast('يرجى ملء الحقول المطلوبة', 'error'); return; }
    setSaving(true);
    const slug = form.title.replace(/\s+/g, '-').replace(/[^\w\-]/g, '') + '-' + Date.now();
    const payload = {
      title: form.title, slug, description: form.description,
      subjectId: form.subjectId, unitId: form.unitId || undefined,
      grade: form.grade, difficulty: form.difficulty,
      estimatedMinutes: +form.estimatedMinutes, xpReward: +form.xpReward,
      objectives: form.objectives.filter(Boolean),
      content: {
        type: form.contentType,
        ...(form.videoUrl ? { video: { url: form.videoUrl, duration: 0, provider: 'cloudflare', thumbnailUrl: form.videoThumbnail } } : {}),
        ...(form.articleHtml ? { article: { html: form.articleHtml, readingTime: Math.ceil(form.articleHtml.split(' ').length / 200) } } : {}),
      },
      summary: { text: form.description, keyPoints: form.keyPoints.filter(Boolean) },
      flashcards: form.flashcardFront.map((f, i) => ({ front: f, back: form.flashcardBack[i] || '' })).filter(f => f.front),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublished: publish,
    };

    const res = await fetch('/api/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      toast(publish ? 'تم نشر الدرس ✅' : 'تم حفظ المسودة', 'success');
      router.push('/teacher/content/lessons');
    } else toast(data.error || 'حدث خطأ', 'error');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 font-cairo">📝 إنشاء درس جديد</h1>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← رجوع</button>
      </div>

      {/* Basic Info */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-bold font-cairo">المعلومات الأساسية</h2></div>
        <div className="p-5 space-y-4">
          <Input label="عنوان الدرس *" placeholder="مثال: مفهوم الكسر" value={form.title} onChange={set('title')} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">وصف الدرس</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              placeholder="وصف مختصر لما سيتعلمه الطالب..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المادة *</label>
              <select value={form.subjectId} onChange={set('subjectId')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">اختر المادة</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوحدة</label>
              <select value={form.unitId} onChange={set('unitId')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">اختر الوحدة (اختياري)</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الصعوبة</label>
              <select value={form.difficulty} onChange={set('difficulty')} className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">متقدم</option>
              </select>
            </div>
            <Input label="الوقت (دقيقة)" type="number" value={form.estimatedMinutes} onChange={set('estimatedMinutes')} />
            <Input label="نقاط XP" type="number" value={form.xpReward} onChange={set('xpReward')} />
          </div>
        </div>
      </Card>

      {/* Objectives */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-bold font-cairo">🎯 أهداف الدرس</h2></div>
        <div className="p-5 space-y-2">
          {form.objectives.map((obj, i) => (
            <Input key={i} placeholder={`الهدف ${i+1}`} value={obj}
              onChange={e => { const o = [...form.objectives]; o[i] = e.target.value; setForm(p => ({ ...p, objectives: o })); }} />
          ))}
          <button onClick={() => setForm(p => ({ ...p, objectives: [...p.objectives, ''] }))} className="text-sm text-primary-600 hover:underline">+ إضافة هدف</button>
        </div>
      </Card>

      {/* Content */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-cairo">📹 المحتوى</h2>
            <select value={form.contentType} onChange={set('contentType')} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="video">فيديو فقط</option>
              <option value="reading">نص فقط</option>
              <option value="mixed">مختلط</option>
            </select>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {(form.contentType === 'video' || form.contentType === 'mixed') && (
            <>
              <Input label="رابط الفيديو" placeholder="https://..." value={form.videoUrl} onChange={set('videoUrl')} />
              <Input label="صورة مصغرة للفيديو (اختياري)" placeholder="https://..." value={form.videoThumbnail} onChange={set('videoThumbnail')} />
            </>
          )}
          {(form.contentType === 'reading' || form.contentType === 'mixed') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">محتوى المقال (HTML)</label>
              <textarea value={form.articleHtml} onChange={e => setForm(p => ({ ...p, articleHtml: e.target.value }))} rows={6}
                placeholder="<h2>عنوان</h2><p>محتوى الشرح...</p>"
                className="w-full font-mono text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          )}
        </div>
      </Card>

      {/* Summary Key Points */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-bold font-cairo">📋 النقاط الرئيسية</h2></div>
        <div className="p-5 space-y-2">
          {form.keyPoints.map((kp, i) => (
            <Input key={i} placeholder={`النقطة ${i+1}`} value={kp}
              onChange={e => { const k = [...form.keyPoints]; k[i] = e.target.value; setForm(p => ({ ...p, keyPoints: k })); }} />
          ))}
          <button onClick={() => setForm(p => ({ ...p, keyPoints: [...p.keyPoints, ''] }))} className="text-sm text-primary-600 hover:underline">+ إضافة نقطة</button>
        </div>
      </Card>

      {/* Flashcards */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-bold font-cairo">🃏 بطاقات المراجعة</h2></div>
        <div className="p-5 space-y-3">
          {form.flashcardFront.map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <Input placeholder="السؤال (الأمامي)" value={form.flashcardFront[i]}
                onChange={e => { const f = [...form.flashcardFront]; f[i] = e.target.value; setForm(p => ({ ...p, flashcardFront: f })); }} />
              <Input placeholder="الإجابة (الخلفي)" value={form.flashcardBack[i]}
                onChange={e => { const b = [...form.flashcardBack]; b[i] = e.target.value; setForm(p => ({ ...p, flashcardBack: b })); }} />
            </div>
          ))}
          <button onClick={addFlashcard} className="text-sm text-primary-600 hover:underline">+ إضافة بطاقة</button>
        </div>
      </Card>

      {/* Tags */}
      <Card className="p-5">
        <Input label="الوسوم (مفصولة بفواصل)" placeholder="كسور، رياضيات، الصف السادس" value={form.tags} onChange={set('tags')} />
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" fullWidth size="lg" onClick={() => save(false)} loading={saving}>💾 حفظ كمسودة</Button>
        <Button fullWidth size="lg" onClick={() => save(true)} loading={saving}>🚀 نشر الدرس</Button>
      </div>
    </div>
  );
}
