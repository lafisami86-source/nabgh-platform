import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Lesson } from '@/models/Content';
export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  await connectDB();
  const [totalUsers, totalStudents, totalTeachers, totalLessons, publishedLessons] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
  ]);
  return NextResponse.json({ success: true, data: { totalUsers, totalStudents, totalTeachers, totalLessons, publishedLessons } });
}
