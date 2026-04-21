import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const role = (session.user as any).role;
  if (role === 'teacher') redirect('/teacher/dashboard');
  if (role === 'parent') redirect('/parent/dashboard');

  const onboarded = (session.user as any).onboardingCompleted;
  if (!onboarded) redirect('/onboarding');

  await connectDB();
  const user = await User.findById(session.user.id).select('profile gamification subscription email').lean();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="student" user={user} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <MobileNav role="student" />
    </div>
  );
}
