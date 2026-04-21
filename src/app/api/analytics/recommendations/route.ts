import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateRecommendations } from '@/lib/adaptive-engine';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const recs = await generateRecommendations(session.user.id);
  return NextResponse.json({ success: true, data: recs });
}
