import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Unit } from '@/models/Content';
export async function GET(_: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  await connectDB();
  const unit = await Unit.findById(id).lean();
  if (!unit) return NextResponse.json({ error: 'الوحدة غير موجودة' }, { status: 404 });
  return NextResponse.json({ success: true, data: unit });
}
