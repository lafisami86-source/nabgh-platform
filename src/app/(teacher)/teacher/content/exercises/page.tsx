import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Content';
import { Card, Badge } from '@/components/ui/index';
import Link from 'next/link';

export default async function TeacherExercisesPage() {
  const session = await auth();
  await connectDB();
  const exercises = await Exercise.find({ createdBy: session!.user.id })
    .sort({ createdAt: -1 })
    .populate('subjectId', 'name icon color')
    .lean() as unknown as any[];

  const typeLabels: Record<string, string> = { practice: 'تدريب', homework: 'واجب', quiz: 'اختبار', exam: 'امتحان' };
  const typeColors: Record<string, any> = { practice: 'primary', homework: 'warning', quiz: 'purple', exam: 'error' };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">✏️ تمارينـي</h1>
          <p className="text-slate-500 text-sm mt-1">{exercises.length} تمرين</p>
        </div>
        <Link href="/teacher/content/exercises/new">
          <button className="bg-primary-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition text-sm">+ تمرين جديد</button>
        </Link>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✏️</div>
          <h2 className="text-xl font-bold text-slate-700 font-cairo">لا توجد تمارين بعد</h2>
          <p className="text-slate-500 mt-2 mb-6">أنشئ أول تمرين لطلابك</p>
          <Link href="/teacher/content/exercises/new">
            <button className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition">إنشاء تمرين جديد 🚀</button>
          </Link>
        </div>
      ) : (
        <Card className="divide-y divide-slate-100">
          {exercises.map((ex: any) => (
            <div key={ex._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: (ex.subjectId as any)?.color + '20' || '#f1f5f9' }}>
                ✏️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 truncate">{ex.title}</h3>
                  <Badge color={ex.isPublished ? 'success' : 'gray'} size="xs">{ex.isPublished ? '✓ منشور' : 'مسودة'}</Badge>
                  <Badge color={typeColors[ex.type] || 'gray'} size="xs">{typeLabels[ex.type] || ex.type}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span>📚 {(ex.subjectId as any)?.name}</span>
                  <span>❓ {ex.questions?.length || 0} سؤال</span>
                  <span>🔄 {ex.stats?.attempts || 0} محاولة</span>
                  <span>📊 متوسط {Math.round(ex.stats?.avgScore || 0)}%</span>
                  <span className="text-amber-500">+{ex.xpReward?.completion || 100} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/student/exercise/${ex._id}`} target="_blank" className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-100">معاينة</Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
