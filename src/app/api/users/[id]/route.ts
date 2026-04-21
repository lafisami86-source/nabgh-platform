import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
export async function GET(_: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const user = await User.findById(id).select('-password').lean();
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}
