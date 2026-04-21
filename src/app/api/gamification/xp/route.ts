import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { awardXP } from '@/lib/gamification';
import { z } from 'zod';
const schema = z.object({ amount: z.number().min(1).max(1000), reason: z.string() });
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const result = await awardXP(session.user.id, body.amount, body.reason);
    return NextResponse.json({ success: true, data: result });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
