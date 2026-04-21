import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Only include Google if env vars are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // Dynamic imports — Mongoose can't load in Edge Runtime
          const { default: connectDB } = await import('./mongodb');
          const { default: User } = await import('@/models/User');

          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select('+password');
          if (!user || !user.isActive) return null;
          const isValid = await user.comparePassword(credentials.password as string);
          if (!isValid) return null;
          user.lastLoginAt = new Date();
          await user.save();
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.profile.displayName,
            image: user.profile.avatar,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            subscription: user.subscription.plan,
          };
        } catch (e) {
          console.error('Auth error:', e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
        token.subscription = user.subscription;
      }
      if (trigger === 'update' && session) {
        token.onboardingCompleted = session.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).onboardingCompleted = token.onboardingCompleted;
        (session.user as any).subscription = token.subscription;
      }
      return session;
    },
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        try {
          // Dynamic import — only runs in Node.js runtime, not Edge
          const { default: connectDB } = await import('./mongodb');
          const { default: User } = await import('@/models/User');

          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            const parts = (user.name || 'مستخدم جديد').split(' ');
            await User.create({
              email: user.email,
              role: 'student',
              profile: {
                firstName: parts[0] || 'مستخدم',
                lastName: parts.slice(1).join(' ') || 'جديد',
                displayName: user.name,
                avatar: user.image,
                country: 'SA',
              },
              isVerified: true,
            });
          }
        } catch (e) {
          return false;
        }
      }
      return true;
    },
  },
  pages: { signIn: '/auth/login', error: '/auth/error' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
