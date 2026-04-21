import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <div className="text-8xl font-black text-primary-200 font-numbers mb-4">404</div>
        <h1 className="text-2xl font-black text-slate-800 mb-2 font-cairo">الصفحة غير موجودة</h1>
        <p className="text-slate-500 mb-6">يبدو أن هذه الصفحة انتقلت إلى مكان آخر!</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-600 transition">
          العودة للرئيسية ←
        </Link>
      </div>
    </div>
  );
}
