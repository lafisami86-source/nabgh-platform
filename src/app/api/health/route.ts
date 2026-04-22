import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json({ status: 'error', message: 'MONGODB_URI not set' }, { status: 500 });
    }

    // Test raw connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
    });

    const admin = mongoose.connection.db?.admin();
    const result = await admin?.listDatabases();

    await mongoose.disconnect();

    return NextResponse.json({
      status: 'ok',
      dbCount: result?.databases?.length || 0,
      databases: result?.databases?.map((d: any) => d.name) || [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : '';
    console.error('Health check error:', msg, stack);
    return NextResponse.json({ status: 'error', error: msg, stack: stack?.slice(0, 500) }, { status: 500 });
  }
}
