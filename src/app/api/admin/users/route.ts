import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50;

  const query: any = { isActive: true };
  if (role) query.role = role;
  if (search) query['profile.displayName'] = { $regex: search, $options: 'i' };

  const [users, total] = await Promise.all([
    User.find(query)
      .select('profile role gamification subscription lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return NextResponse.json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  const { userId, updates } = await req.json();
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean();
  return NextResponse.json({ success: true, data: user });
}
