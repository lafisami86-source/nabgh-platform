import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/Analytics';

export async function PUT(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  await Notification.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { isRead: true, readAt: new Date() }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  await Notification.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ success: true });
}
