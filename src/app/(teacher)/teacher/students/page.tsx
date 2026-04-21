import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Avatar, Card, Badge, ProgressBar } from '@/components/ui/index';
import { getLevel, getLevelIcon, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default async function TeacherStudentsPage() {
  await auth();
  await connectDB();

  const students = await User.find({ role: 'student', isActive: true })
    .select('profile gamification studentInfo createdAt lastLoginAt')
    .sort({ 'gamification.xp': -1 })
    .limit(50)
    .lean() as unknown as any[];

  const now = new Date();

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">👥 الطلاب</h1>
          <p className="text-slate-500 text-sm mt-1">{students.length} طالب مسجل</p>
        </div>
        <input placeholder="ابحث عن طالب..." className="border border-slate-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلاب', value: students.length, icon: '👥' },
          { label: 'نشطون اليوم', value: students.filter(s => s.lastLoginAt && (now.getTime() - new Date(s.lastLoginAt).getTime()) < 86400000).length, icon: '✅' },
          { label: 'متوسط XP', value: formatNumber(Math.round(students.reduce((s, u) => s + (u.gamification?.xp || 0), 0) / Math.max(students.length, 1))), icon: '💎' },
          { label: 'متوسط السلسلة', value: Math.round(students.reduce((s, u) => s + (u.gamification?.streak?.current || 0), 0) / Math.max(students.length, 1)) + ' يوم', icon: '🔥' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-slate-800 font-numbers">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Students table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-right text-xs font-bold text-slate-600 px-5 py-3">#</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">الطالب</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">الصف</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">XP</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">الدروس</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">السلسلة</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">آخر نشاط</th>
                <th className="text-right text-xs font-bold text-slate-600 px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student, i) => {
                const level = getLevel(student.gamification?.xp || 0);
                const lastActive = student.lastLoginAt ? new Date(student.lastLoginAt) : null;
                const daysSince = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / 86400000) : 999;
                const isActive = daysSince <= 3;
                const gradeMap: Record<string,string> = { grade_6:'الصف السادس', grade_7:'أول متوسط', grade_8:'ثاني متوسط', grade_9:'ثالث متوسط', grade_10:'أول ثانوي', grade_11:'ثاني ثانوي', grade_12:'ثالث ثانوي' };
                return (
                  <tr key={student._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 text-sm text-slate-400 font-numbers">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={student.profile?.avatar} name={student.profile?.displayName || '?'} size="sm" level={level} />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{student.profile?.displayName}</p>
                          <p className="text-xs text-slate-400">{student.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{gradeMap[student.studentInfo?.grade] || student.studentInfo?.grade || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-primary-600 font-numbers">{formatNumber(student.gamification?.xp || 0)}</span>
                        <span className="text-xs">{getLevelIcon(level)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-numbers">{student.gamification?.totalLessonsCompleted || 0}</td>
                    <td className="px-4 py-3">
                      {student.gamification?.streak?.current > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                          🔥 {student.gamification.streak.current}
                        </span>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {lastActive ? (daysSince === 0 ? 'اليوم' : daysSince === 1 ? 'أمس' : `${daysSince} أيام`) : 'لم يسجل دخول'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={isActive ? 'success' : daysSince <= 7 ? 'warning' : 'error'} size="xs">
                        {isActive ? 'نشط' : daysSince <= 7 ? 'متقاعس' : 'غائب'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
