import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lesson, Subject } from '@/models/Content';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ success: true, data: { lessons: [], subjects: [] } });
  
  await connectDB();
  const regex = new RegExp(q, 'i');
  
  const [lessons, subjects] = await Promise.all([
    Lesson.find({ isPublished: true, $or: [{ title: regex }, { description: regex }, { tags: regex }] })
      .select('title description difficulty xpReward subjectId unitId').limit(10).lean(),
    Subject.find({ isActive: true, $or: [{ name: regex }, { nameEn: regex }, { description: regex }] })
      .select('name icon color grade').limit(5).lean(),
  ]);
  
  return NextResponse.json({ success: true, data: { lessons, subjects } });
}
