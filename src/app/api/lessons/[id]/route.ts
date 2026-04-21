import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const lesson = await Lesson.findById(id).lean();
  if (!lesson) return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
  await Lesson.findByIdAndUpdate(id, { $inc: { 'stats.views': 1 } });
  return NextResponse.json({ success: true, data: lesson });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const lesson = await Lesson.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
  return NextResponse.json({ success: true, data: lesson });
}
