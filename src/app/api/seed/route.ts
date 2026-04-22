import { NextResponse } from 'next/server';
import { seedDatabase } from '@/data/seed/seedData';
export async function GET() {
  try {
    // VERSION MARKER - if you see v5, this is the latest code
    const result = await seedDatabase();
    return NextResponse.json({ _version: 'v5', ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : '';
    console.error('Seed error:', msg, stack);
    return NextResponse.json({ _version: 'v5', error: msg, details: stack?.slice(0, 800) }, { status: 500 });
  }
}
