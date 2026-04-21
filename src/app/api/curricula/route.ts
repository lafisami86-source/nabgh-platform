import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Curriculum } from '@/models/Content';
export async function GET() {
  await connectDB();
  const curricula = await Curriculum.find({ isActive: true }).lean();
  return NextResponse.json({ success: true, data: curricula });
}
