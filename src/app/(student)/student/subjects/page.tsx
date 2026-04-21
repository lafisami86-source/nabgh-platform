import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Subject } from '@/models/Content';
import { UserProgress } from '@/models/Analytics';
import { Card, ProgressBar, Badge } from '@/components/ui/index';
import Link from 'next/link';

export default async function SubjectsPage() {
  const session = await auth();
  await connectDB();

  const [user, progress] = await Promise.all([
    User.findById(session!.user.id).select('studentInfo').lean() as any,
    UserProgress.findOne({ userId: session!.user.id }).lean() as any,
  ]);

  const grade = user?.studentInfo?.grade || 'grade_6';
  const subjects = await Subject.find({ isActive: true, grade }).sort({ order: 1 }).lean() as unknown as any[];

  const subjectProgress = (progress?.subjects || []).reduce((acc: any, s: any) => {
    acc[s.subjectId?.toString()] = { progress: s.progress || 0, completedLessons: s.completedLessons?.length || 0, totalTime: s.totalTimeMinutes || 0 };
    return acc;
  }, {});

  const gradeLabel: Record<string, string> = {
    grade_1: 'الصف الأول', grade_2: 'الصف الثاني', grade_3: 'الصف الثالث',
    grade_4: 'الصف الرابع', grade_5: 'الصف الخامس', grade_6: 'الصف السادس',
    grade_7: 'أول متوسط', grade_8: 'ثاني متوسط', grade_9: 'ثالث متوسط',
    grade_10: 'أول ثانوي', grade_11: 'ثاني ثانوي', grade_12: 'ثالث ثانوي',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-cairo">📚 موادي الدراسية</h1>
        <p className="text-slate-500 text-sm mt-1">{gradeLabel[grade] || grade} • المنهج السعودي</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-700 font-cairo">لا توجد مواد متاحة</h2>
          <p className="text-slate-500 mt-2">سيتم إضافة مواد قريباً</p>
          <Link href="/api/seed" className="mt-4 inline-block text-sm text-primary-600 hover:underline">تهيئة البيانات التجريبية</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {subjects.map((sub: any) => {
            const sp = subjectProgress[sub._id?.toString()] || {};
            const prog = sp.progress || 0;
            const done = sp.completedLessons || 0;
            return (
              <Link key={sub._id} href={`/student/subjects/${sub._id}`}>
                <Card hover className="overflow-hidden">
                  {/* Color header */}
                  <div className="h-3" style={{ background: sub.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: sub.color + '20' }}>
                        {sub.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {prog >= 100 && <Badge color="success">مكتمل ✓</Badge>}
                        {prog > 0 && prog < 100 && <Badge color="primary">جارٍ</Badge>}
                        {prog === 0 && <Badge color="gray">لم يبدأ</Badge>}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg font-cairo">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4 line-clamp-2">{sub.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{done} / {sub.lessonsCount} درس</span>
                      <span className="font-numbers font-semibold" style={{ color: sub.color }}>{prog}%</span>
                    </div>
                    <ProgressBar value={prog} color={`bg-[${sub.color}]`} size="sm"
                      className="[&>div>div]:transition-all" />
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <span>⏱ ~{sub.estimatedHours} ساعة</span>
                      <span>{sub.unitsCount} وحدة</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
