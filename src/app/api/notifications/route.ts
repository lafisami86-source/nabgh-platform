import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/Analytics';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  await connectDB();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 }).limit(50).lean();
  const unread = notifications.filter(n => !n.isRead).length;
  return NextResponse.json({ success: true, data: { notifications, unread } });
}
