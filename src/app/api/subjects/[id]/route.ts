import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Subject } from '@/models/Content';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    await connectDB();
  const sub = await Subject.findById(id).lean();
  if (!sub) return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });
  return NextResponse.json({ success: true, data: sub });
}
