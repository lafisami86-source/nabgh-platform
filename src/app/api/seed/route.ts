import { NextResponse } from 'next/server';
import { seedDatabase } from '@/data/seed/seedData';
export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
