import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'all-time';
  const type = searchParams.get('type') || 'global';
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const users = await User.find({ role: 'student', isActive: true })
    .select('profile.displayName profile.avatar profile.country gamification.xp gamification.level gamification.streak')
    .sort({ 'gamification.xp': -1 })
    .limit(limit)
    .lean();
  
  const rankings = users.map((u: any, i) => ({
    rank: i + 1,
    userId: u._id,
    displayName: u.profile.displayName,
    avatar: u.profile.avatar,
    country: u.profile.country,
    xp: u.gamification.xp,
    level: u.gamification.level,
    streak: u.gamification.streak?.current || 0,
  }));
  
  return NextResponse.json({ success: true, data: rankings });
}
