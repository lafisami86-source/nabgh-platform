import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');
  const role = (session.user as any).role;
  if (role === 'student') redirect('/student/dashboard');
  if (role === 'teacher') redirect('/teacher/dashboard');
  await connectDB();
  const user = await User.findById(session.user.id).select('profile email').lean();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="parent" user={user} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
      <MobileNav role="parent" />
    </div>
  );
}
