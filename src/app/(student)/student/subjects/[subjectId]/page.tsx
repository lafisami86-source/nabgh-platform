import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Subject, Unit, Lesson } from '@/models/Content';
import { UserProgress } from '@/models/Analytics';
import { Card, ProgressBar, Badge } from '@/components/ui/index';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const session = await auth();
  await connectDB();

  const [subject, units, progress] = await Promise.all([
    Subject.findById(params.subjectId).lean() as any,
    Unit.find({ subjectId: params.subjectId, isActive: true }).sort({ order: 1 }).lean() as unknown as any[],
    UserProgress.findOne({ userId: session!.user.id }).lean() as any,
  ]);

  if (!subject) notFound();

  const completedLessons = new Set(
    progress?.lessons?.filter((l: any) => l.status === 'completed').map((l: any) => l.lessonId?.toString()) || []
  );

  const subjectProg = progress?.subjects?.find((s: any) => s.subjectId?.toString() === params.subjectId);

  // Get lessons for each unit
  const unitsWithLessons = await Promise.all(
    units.map(async (unit: any) => {
      const lessons = await Lesson.find({ unitId: unit._id, isPublished: true }).sort({ order: 1 })
        .select('title slug difficulty xpReward estimatedMinutes content.type stats.avgRating').lean() as unknown as any[];
      const completedCount = lessons.filter(l => completedLessons.has(l._id?.toString())).length;
      return { ...unit, lessons, completedCount, progress: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0 };
    })
  );

  const difficultyLabel: Record<string, string> = { easy: 'سهل', medium: 'متوسط', hard: 'متقدم' };
  const difficultyColor: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'error' };
  const typeIcon: Record<string, string> = { video: '🎬', interactive: '🖱', reading: '📖', mixed: '🎯' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Subject Header */}
      <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}40)` }}>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-white/80 shadow-sm">{subject.icon}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-800 font-cairo">{subject.name}</h1>
              <p className="text-slate-600 text-sm mt-1">{subject.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                <span>📚 {subject.lessonsCount} درس</span>
                <span>📦 {subject.unitsCount} وحدة</span>
                <span>⏱ ~{subject.estimatedHours} ساعة</span>
              </div>
            </div>
          </div>
          {subjectProg && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>تقدمك الكلي</span>
                <span className="font-numbers font-bold">{subjectProg.progress || 0}%</span>
              </div>
              <ProgressBar value={subjectProg.progress || 0} color="bg-white opacity-80" size="md" />
            </div>
          )}
        </div>
      </div>

      {/* Units */}
      {unitsWithLessons.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📦</div>
          <p>لا توجد وحدات بعد في هذه المادة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unitsWithLessons.map((unit: any, ui: number) => (
            <Card key={unit._id} className="overflow-hidden">
              {/* Unit Header */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">{ui + 1}</div>
                  <div>
                    <h2 className="font-bold text-slate-800 font-cairo">{unit.title}</h2>
                    <p className="text-xs text-slate-500">{unit.completedCount}/{unit.lessons.length} درس • ~{unit.estimatedMinutes} دقيقة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={unit.progress} size="sm" className="w-20" />
                  <span className="text-xs font-numbers font-bold text-primary-600">{unit.progress}%</span>
                </div>
              </div>

              {/* Lessons List */}
              <div className="divide-y divide-slate-50">
                {unit.lessons.map((lesson: any) => {
                  const done = completedLessons.has(lesson._id?.toString());
                  return (
                    <Link key={lesson._id} href={`/student/lesson/${lesson._id}`}>
                      <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${done ? 'opacity-80' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {done ? '✓' : typeIcon[lesson.content?.type] || '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium text-sm truncate ${done ? 'text-slate-500' : 'text-slate-800'}`}>{lesson.title}</h3>
                            {done && <Badge color="success" size="xs">مكتمل</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-400">⏱ {lesson.estimatedMinutes} دقيقة</span>
                            <span className="text-xs text-amber-500">+{lesson.xpReward} XP</span>
                            {lesson.stats?.avgRating > 0 && (
                              <span className="text-xs text-yellow-500">⭐ {lesson.stats.avgRating.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                        <Badge color={(difficultyColor[lesson.difficulty] as any) || 'gray'} size="xs">
                          {difficultyLabel[lesson.difficulty] || lesson.difficulty}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
