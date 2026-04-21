import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Challenge } from '@/models/Analytics';
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const query: any = { status: { $in: ['upcoming','active'] } };
  if (type) query.type = type;
  const challenges = await Challenge.find(query).sort({ startTime: 1 }).limit(20).lean();
  return NextResponse.json({ success: true, data: challenges });
}
