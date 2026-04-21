import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { LearningAnalytics } from '@/models/Analytics';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const analytics = await LearningAnalytics.findOne({ userId: session.user.id }).lean();
  return NextResponse.json({ success: true, data: (analytics as any)?.skillMap || [] });
}
