import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Badge } from '@/models/Analytics';
import User from '@/models/User';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const [allBadges, user] = await Promise.all([
    Badge.find({ isActive: true }).sort({ order: 1 }).lean(),
    User.findById(session.user.id).select('gamification.badges').lean() as any,
  ]);
  const earned = new Set((user?.gamification?.badges || []).map((b: any) => b.badgeId));
  const result = allBadges.map((b: any) => ({
    ...b,
    earned: earned.has(b._id),
    earnedAt: user?.gamification?.badges?.find((ub: any) => ub.badgeId === b._id)?.earnedAt,
  }));
  return NextResponse.json({ success: true, data: result });
}
