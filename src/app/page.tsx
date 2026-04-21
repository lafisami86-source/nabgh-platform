import Link from 'next/link';

export default function LandingPage() {
  const features = [
    { icon: '🤖', title: 'مساعد ذكي بالـ AI', desc: 'نبوغ يشرح ويحل ويختبرك بأسلوب محفز ومبسط مناسب لمستواك' },
    { icon: '🎯', title: 'تعلم تكيفي', desc: 'المنصة تتعلم منك وتقدم محتوى مخصصاً لنقاط قوتك وضعفك تلقائياً' },
    { icon: '🏆', title: 'نقاط وشارات', desc: 'نظام تلعيب كامل: XP، مستويات، شارات، تحديات ومسابقات' },
    { icon: '📊', title: 'تتبع التقدم', desc: 'إحصائيات دقيقة لك ولولي أمرك ومعلمك' },
    { icon: '🔥', title: 'سلاسل يومية', desc: 'تعلم يومياً وحافظ على سلسلتك لكسب مكافآت مضاعفة' },
    { icon: '⚔️', title: 'تحديات ومسابقات', desc: 'تحدَّ أصدقاءك أو المتعلمين حول العالم' },
  ];
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary rounded-xl flex items-center justify-center text-white font-black text-lg font-cairo">ن</div>
            <span className="font-black text-xl text-slate-800 font-cairo">نَبَغ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-primary-600 font-medium">دخول</Link>
            <Link href="/auth/register" className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition">ابدأ مجاناً</Link>
          </div>
        </div>
      </nav>
      <section className="pt-28 pb-16 px-4 text-center bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-2 text-sm font-medium mb-6">🚀 منصة تعليمية ذكية للعالم العربي</div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight font-cairo">تعلّم بذكاء<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary">تفوّق بتميّز</span></h1>
          <p className="text-xl text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed">منصة تعليمية عربية شاملة تجمع بين الذكاء الاصطناعي والتلعيب والتعلم التكيفي</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/auth/register" className="bg-primary-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-600 transition shadow-lg text-lg w-full sm:w-auto">ابدأ مجاناً 🚀</Link>
            <Link href="/auth/login" className="border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:border-primary-300 transition text-lg w-full sm:w-auto">عندي حساب ←</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14">
            {[{v:'10K+',l:'طالب'},{v:'500+',l:'درس'},{v:'50+',l:'مادة'},{v:'5',l:'دول'}].map(s=>(
              <div key={s.l} className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
                <div className="text-3xl font-black text-primary-600 font-cairo">{s.v}</div>
                <div className="text-sm text-slate-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 font-cairo mb-10">لماذا نَبَغ؟ 🌟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f=>(
              <div key={f.title} className="p-6 rounded-2xl border-2 border-slate-100 hover:border-primary-200 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-800 font-cairo mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-secondary text-white text-center">
        <h2 className="text-3xl font-black font-cairo mb-4">ابدأ رحلتك التعليمية اليوم! 🚀</h2>
        <p className="text-primary-100 mb-6">انضم لآلاف الطلاب الذين يتعلمون بذكاء</p>
        <Link href="/auth/register" className="bg-white text-primary-600 font-black px-8 py-3 rounded-xl hover:bg-primary-50 transition">سجّل مجاناً ←</Link>
      </section>
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-black text-white font-cairo">نَبَغ</span>
        </div>
        <p>© 2025 نَبَغ - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
