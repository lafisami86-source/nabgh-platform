export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 font-cairo animate-pulse">ن</div>
        <div className="flex items-center gap-1.5 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
