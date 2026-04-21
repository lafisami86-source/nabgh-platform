import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';
import { UserProgress } from '@/models/Analytics';
import { awardXP, updateStreak, checkAndAwardBadges } from '@/lib/gamification';
import User from '@/models/User';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  try {
    await connectDB();
    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const userId = session.user.id;

    // Update user progress
    let progress = await UserProgress.findOne({ userId });
    if (!progress) progress = await UserProgress.create({ userId });

    const lessonProgress = progress.lessons.find((l: any) => l.lessonId.toString() === id);
    if (!lessonProgress) {
      progress.lessons.push({ lessonId: id, status: 'completed', progress: 100, completedAt: new Date(), timeSpentMinutes: body.timeSpent || 0, bookmarked: false });
    } else {
      lessonProgress.status = 'completed';
      lessonProgress.progress = 100;
      lessonProgress.completedAt = new Date();
      if (body.timeSpent) lessonProgress.timeSpentMinutes = body.timeSpent;
    }

    // Update subject progress
    const subjectProgress = progress.subjects.find((s: any) => s.subjectId.toString() === lesson.subjectId.toString());
    if (subjectProgress) {
      if (!subjectProgress.completedLessons.includes(id)) {
        subjectProgress.completedLessons.push(id);
        subjectProgress.lastAccessedAt = new Date();
      }
    }
    await progress.save();

    // Update lesson stats
    await Lesson.findByIdAndUpdate(id, { $inc: { 'stats.completions': 1 } });

    // Update user gamification
    await User.findByIdAndUpdate(userId, { $inc: { 'gamification.totalLessonsCompleted': 1 } });

    // Award XP
    const { newXP, leveledUp, newLevel } = await awardXP(userId, lesson.xpReward, `إكمال درس: ${lesson.title}`);
    const { streak } = await updateStreak(userId);
    const user = await User.findById(userId);
    const newBadges = await checkAndAwardBadges(userId, { totalLessons: user?.gamification.totalLessonsCompleted || 0 });

    return NextResponse.json({
      success: true,
      xpEarned: lesson.xpReward,
      newXP,
      leveledUp,
      newLevel,
      streak,
      newBadges,
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
