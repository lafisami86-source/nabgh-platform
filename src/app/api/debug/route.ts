import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    _version: 'v5',
    timestamp: new Date().toISOString(),
    message: 'If you see v5, the latest code is deployed',
  });
}
