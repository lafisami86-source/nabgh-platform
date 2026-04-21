import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { lessonId } = await req.json();
  await connectDB();
  const lesson = await Lesson.findById(lessonId).lean() as any;
  if (!lesson) return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
  return NextResponse.json({ success:true, summary: lesson.summary?.text || lesson.title, keyPoints: lesson.summary?.keyPoints || [], flashcards: lesson.flashcards || [] });
}
