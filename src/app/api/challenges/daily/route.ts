import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Challenge } from '@/models/Analytics';
export async function GET() {
  await connectDB();
  const now = new Date();
  let daily = await Challenge.findOne({ type: 'daily', status: 'active', startTime: { $lte: now }, endTime: { $gte: now } }).lean();
  if (!daily) {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    daily = await Challenge.create({ type:'daily', title:`تحدي اليوم`, description:'5 أسئلة يومية', difficulty:'mixed', questionCount:5, timeLimit:180, rewards:{participation:{xp:10},completion:{xp:30,badge:''},first:{xp:200,badge:'daily_champ',prize:''},second:{xp:100,badge:''},third:{xp:50,badge:''},perfect:{xp:75,badge:''}}, startTime:start, endTime:end, status:'active' });
  }
  return NextResponse.json({ success:true, data:daily });
}
