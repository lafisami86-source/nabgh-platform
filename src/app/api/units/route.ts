import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Unit } from '@/models/Content';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: any = { isActive: true };
  if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');
  const units = await Unit.find(query).sort({ order: 1 }).lean();
  return NextResponse.json({ success: true, data: units });
}
