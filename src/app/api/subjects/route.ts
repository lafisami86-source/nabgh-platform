import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Subject } from '@/models/Content';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query: any = { isActive: true };
    if (searchParams.get('curriculumId')) query.curriculumId = searchParams.get('curriculumId');
    if (searchParams.get('grade')) query.grade = searchParams.get('grade');
    if (searchParams.get('track')) query.track = searchParams.get('track');
    const subjects = await Subject.find(query).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, data: subjects });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin','teacher'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const subject = await Subject.create(body);
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
