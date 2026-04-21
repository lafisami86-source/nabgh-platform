import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';
import { UserProgress } from '@/models/Analytics';
import { awardXP } from '@/lib/gamification';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { rating } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'تقييم غير صالح (1-5)' }, { status: 400 });
  await connectDB();
  const lesson = await Lesson.findById(id);
  if (!lesson) return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });

  // Update lesson average rating
  const newCount = lesson.stats.ratingsCount + 1;
  const newAvg = ((lesson.stats.avgRating * lesson.stats.ratingsCount) + rating) / newCount;
  await Lesson.findByIdAndUpdate(id, { 'stats.avgRating': newAvg, 'stats.ratingsCount': newCount });

  // Update user progress with rating
  await UserProgress.findOneAndUpdate(
    { userId: session.user.id, 'lessons.lessonId': id },
    { $set: { 'lessons.$.rating': rating } }
  );

  // Award XP for rating
  await awardXP(session.user.id, 15, 'تقييم درس');
  return NextResponse.json({ success: true, newAvgRating: newAvg });
}
