import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Challenge } from '@/models/Analytics';
export async function GET(_: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  await connectDB();
  const c = await Challenge.findById(id).lean();
  if (!c) return NextResponse.json({ error: 'التحدي غير موجود' }, { status: 404 });
  return NextResponse.json({ success: true, data: c });
}
