import { NextResponse } from 'next/server';
import { seedDatabase } from '@/data/seed/seedData';
export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
