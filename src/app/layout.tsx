import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: { default: 'نبغ - تعلّم بذكاء، تفوّق بتميّز', template: '%s | نبغ' },
  description: 'منصة تعليمية ذكية تجمع بين جودة المحتوى والذكاء الاصطناعي وعناصر التلعيب لتحقيق أفضل نتائج تعلم',
  keywords: ['تعليم', 'منصة تعليمية', 'ذكاء اصطناعي', 'تلعيب', 'مناهج سعودية'],
  authors: [{ name: 'نبغ' }],
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
  openGraph: {
    title: 'نبغ - تعلّم بذكاء، تفوّق بتميّز',
    description: 'منصة تعليمية ذكية عربية شاملة',
    locale: 'ar_SA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-tajawal antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
