import { NextResponse } from 'next/server';
import { seedDatabase } from '@/data/seed/seedData';
export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : '';
    console.error('Seed error:', msg, stack);
    return NextResponse.json({ error: msg, details: stack?.slice(0, 500) }, { status: 500 });
  }
}
