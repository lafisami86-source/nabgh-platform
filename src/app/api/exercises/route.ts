import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Content';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: any = { isPublished: true };
  if (searchParams.get('lessonId')) query.lessonId = searchParams.get('lessonId');
  if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');
  const exercises = await Exercise.find(query).lean();
  return NextResponse.json({ success: true, data: exercises });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin','teacher'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const exercise = await Exercise.create({ ...body, createdBy: session.user.id });
    return NextResponse.json({ success: true, data: exercise }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
