import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Challenge } from '@/models/Analytics';
import User from '@/models/User';
export async function POST(_: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const challenge = await Challenge.findById(id);
  if (!challenge) return NextResponse.json({ error: 'التحدي غير موجود' }, { status: 404 });
  const already = challenge.participants.find((p: any) => p.userId.toString() === session.user.id);
  if (already) return NextResponse.json({ success: true });
  const user = await User.findById(session.user.id).select('profile').lean() as any;
  challenge.participants.push({ userId: session.user.id, displayName: user?.profile?.displayName, score: 0, correctAnswers: 0, timeSpent: 0, joinedAt: new Date() });
  challenge.stats.totalParticipants = challenge.participants.length;
  await challenge.save();
  return NextResponse.json({ success: true });
}
