import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateStreak } from '@/lib/gamification';
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const result = await updateStreak(session.user.id);
  return NextResponse.json({ success: true, data: result });
}
