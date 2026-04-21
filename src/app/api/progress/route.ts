import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { UserProgress, LearningAnalytics } from '@/models/Analytics';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const userId = (req.nextUrl.searchParams.get('userId') || session.user.id);
  const [progress, analytics, user] = await Promise.all([
    UserProgress.findOne({ userId }).lean(),
    LearningAnalytics.findOne({ userId }).lean(),
    User.findById(userId).select('gamification profile').lean(),
  ]);
  return NextResponse.json({ success: true, data: { progress, analytics, gamification: (user as any)?.gamification } });
}
