import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import { Subject, Unit, Lesson, Exercise } from '@/models/Content';
import { Curriculum } from '@/models/Content';
import { Card, Badge, Button } from '@/components/ui/index';
import Link from 'next/link';

export default async function AdminContentPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') redirect('/student/dashboard');
  await connectDB();

  const [curricula, subjects, lessons, exercises] = await Promise.all([
    Curriculum.find({}).lean() as unknown as any[],
    Subject.find({}).sort({ grade: 1, order: 1 }).lean() as unknown as any[],
    Lesson.find({}).sort({ createdAt: -1 }).limit(10).lean() as unknown as any[],
    Exercise.find({}).sort({ createdAt: -1 }).limit(10).lean() as unknown as any[],
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">📚 إدارة المحتوى</h1>
          <p className="text-slate-500 text-sm mt-1">المناهج والمواد والدروس والتمارين</p>
        </div>
        <Link href="/api/seed">
          <button className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">🌱 تهيئة البيانات</button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'المناهج', value: curricula.length, icon: '🗂️', href: '#curricula' },
          { label: 'المواد', value: subjects.length, icon: '📖', href: '#subjects' },
          { label: 'الدروس', value: lessons.length, icon: '📝', href: '#lessons' },
          { label: 'التمارين', value: exercises.length, icon: '✏️', href: '#exercises' },
        ].map(s => (
          <a key={s.label} href={s.href}>
            <Card hover className="p-4 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-slate-800 font-numbers">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </Card>
          </a>
        ))}
      </div>

      {/* Curricula */}
      <Card id="curricula">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 font-cairo">🗂️ المناهج الدراسية</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {curricula.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">لا توجد مناهج. قم بتهيئة البيانات أولاً.</p>
              <Link href="/api/seed"><button className="mt-3 text-sm text-primary-600 hover:underline">تهيئة البيانات التجريبية ←</button></Link>
            </div>
          ) : curricula.map((c: any) => (
            <div key={c._id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-sm">🗂️</div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500">{c.country} • {c.levels?.length || 0} مراحل</p>
              </div>
              <Badge color={c.isActive ? 'success' : 'gray'} size="xs">{c.isActive ? 'نشط' : 'معطل'}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Subjects */}
      <Card id="subjects">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 font-cairo">📖 المواد الدراسية</h2>
          <span className="text-xs text-slate-500">{subjects.length} مادة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['المادة', 'الصف', 'الوحدات', 'الدروس', 'الحالة'].map(h => (
                  <th key={h} className="text-right text-xs font-bold text-slate-600 px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.map((s: any) => (
                <tr key={s._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: s.color + '20' }}>{s.icon}</div>
                      <span className="text-sm font-medium text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{s.grade}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 font-numbers">{s.unitsCount}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 font-numbers">{s.lessonsCount}</td>
                  <td className="px-4 py-2.5">
                    <Badge color={s.isActive ? 'success' : 'gray'} size="xs">{s.isActive ? 'نشط' : 'معطل'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Lessons */}
      <Card id="lessons">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 font-cairo">📝 آخر الدروس</h2>
          <span className="text-xs text-slate-500">آخر 10</span>
        </div>
        <div className="divide-y divide-slate-50">
          {lessons.map((l: any) => (
            <div key={l._id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">{l.title}</p>
                <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                  <span>👁 {l.stats?.views || 0}</span>
                  <span>✓ {l.stats?.completions || 0}</span>
                  <span>⭐ {l.stats?.avgRating?.toFixed(1) || '—'}</span>
                </div>
              </div>
              <Badge color={l.isPublished ? 'success' : 'gray'} size="xs">{l.isPublished ? 'منشور' : 'مسودة'}</Badge>
              <Link href={`/student/lesson/${l._id}`} target="_blank"
                className="text-xs text-primary-600 border border-primary-100 rounded-lg px-2 py-1 hover:bg-primary-50">معاينة</Link>
            </div>
          ))}
          {lessons.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">لا توجد دروس بعد</div>
          )}
        </div>
      </Card>

      {/* Recent Exercises */}
      <Card id="exercises">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-cairo">✏️ آخر التمارين</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {exercises.map((e: any) => (
            <div key={e._id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">{e.title}</p>
                <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                  <span>❓ {e.questions?.length || 0} سؤال</span>
                  <span>🔄 {e.stats?.attempts || 0} محاولة</span>
                </div>
              </div>
              <Badge color={e.isPublished ? 'success' : 'gray'} size="xs">{e.isPublished ? 'منشور' : 'مسودة'}</Badge>
              <Link href={`/student/exercise/${e._id}`} target="_blank"
                className="text-xs text-primary-600 border border-primary-100 rounded-lg px-2 py-1 hover:bg-primary-50">معاينة</Link>
            </div>
          ))}
          {exercises.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">لا توجد تمارين بعد</div>
          )}
        </div>
      </Card>
    </div>
  );
}
