import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserProgress } from '@/models/Analytics';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const user = await User.findById(session.user.id).select('-password').lean();
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();

    // Handle onboarding completion
    if (body.onboardingCompleted && body.studentInfo) {
      const user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { onboardingCompleted: true, studentInfo: body.studentInfo, 'profile.country': body.country || 'SA' } },
        { new: true }
      ).select('-password').lean();

      // Create initial progress records for selected subjects
      await UserProgress.findOneAndUpdate(
        { userId: session.user.id },
        { $setOnInsert: { userId: session.user.id } },
        { upsert: true }
      );

      return NextResponse.json({ success: true, data: user });
    }

    const user = await User.findByIdAndUpdate(session.user.id, { $set: body }, { new: true, runValidators: true }).select('-password').lean();
    return NextResponse.json({ success: true, data: user });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
