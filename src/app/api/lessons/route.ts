import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Lesson } from '@/models/Content';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: any = { isPublished: true };
  if (searchParams.get('unitId')) query.unitId = searchParams.get('unitId');
  if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');
  const lessons = await Lesson.find(query).sort({ order: 1 }).select('-content.article.html').lean();
  return NextResponse.json({ success: true, data: lessons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin','teacher'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const lesson = await Lesson.create({ ...body, createdBy: session.user.id });
    return NextResponse.json({ success: true, data: lesson }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
