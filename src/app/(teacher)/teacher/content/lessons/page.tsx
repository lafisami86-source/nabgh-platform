import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';
import { Card, Badge } from '@/components/ui/index';
import Link from 'next/link';

export default async function TeacherLessonsPage() {
  const session = await auth();
  await connectDB();
  const lessons = await Lesson.find({ createdBy: session!.user.id })
    .sort({ createdAt: -1 })
    .populate('subjectId', 'name icon color')
    .lean() as unknown as any[];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">📝 دروسي</h1>
          <p className="text-slate-500 text-sm mt-1">{lessons.length} درس</p>
        </div>
        <Link href="/teacher/content/lessons/new">
          <button className="bg-primary-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition text-sm">+ درس جديد</button>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-slate-700 font-cairo">لا توجد دروس بعد</h2>
          <p className="text-slate-500 mt-2 mb-6">ابدأ بإنشاء أول درس لطلابك</p>
          <Link href="/teacher/content/lessons/new">
            <button className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition">إنشاء درس جديد 🚀</button>
          </Link>
        </div>
      ) : (
        <Card className="divide-y divide-slate-100">
          {lessons.map(lesson => (
            <div key={lesson._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: (lesson.subjectId as any)?.color + '20' || '#f1f5f9' }}>
                {(lesson.subjectId as any)?.icon || '📖'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 truncate">{lesson.title}</h3>
                  <Badge color={lesson.isPublished ? 'success' : 'gray'} size="xs">
                    {lesson.isPublished ? '✓ منشور' : 'مسودة'}
                  </Badge>
                  <Badge color={lesson.difficulty === 'easy' ? 'success' : lesson.difficulty === 'medium' ? 'warning' : 'error'} size="xs">
                    {lesson.difficulty === 'easy' ? 'سهل' : lesson.difficulty === 'medium' ? 'متوسط' : 'متقدم'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span>📚 {(lesson.subjectId as any)?.name}</span>
                  <span>👁 {lesson.stats?.views || 0} مشاهدة</span>
                  <span>✓ {lesson.stats?.completions || 0} إتمام</span>
                  <span>⭐ {lesson.stats?.avgRating?.toFixed(1) || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/student/lesson/${lesson._id}`} target="_blank"
                  className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-100">معاينة</Link>
                <Link href={`/teacher/content/lessons/${lesson._id}`}
                  className="text-xs text-primary-600 border border-primary-200 rounded-lg px-2 py-1 hover:bg-primary-50">تعديل</Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
