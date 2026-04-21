'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ lessons: any[]; subjects: any[] }>({ lessons: [], subjects: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults({ lessons: [], subjects: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) setResults(data.data);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl px-3 py-2 text-sm transition">
      <span>🔍</span>
      <span className="hidden md:block">بحث... (Ctrl+K)</span>
    </button>
  );

  const hasResults = results.lessons.length > 0 || results.subjects.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <span className="text-slate-400 text-lg">🔍</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ابحث عن دروس، مواد، أسئلة..." dir="rtl"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent" />
          {loading && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shrink-0" />}
          <kbd className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <div className="p-6 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">🔍</div>
              ابحث عن أي شيء في المنصة
            </div>
          )}
          {query && !hasResults && !loading && (
            <div className="p-6 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">😕</div>
              لا توجد نتائج لـ "{query}"
            </div>
          )}
          {results.subjects.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50">المواد</div>
              {results.subjects.map((s: any) => (
                <Link key={s._id} href={`/student/subjects/${s._id}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: s.color + '20' }}>{s.icon}</div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.grade}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.lessons.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50">الدروس</div>
              {results.lessons.map((l: any) => (
                <Link key={l._id} href={`/student/lesson/${l._id}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition border-t border-slate-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-sm shrink-0">📖</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{l.title}</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{l.difficulty === 'easy' ? 'سهل' : l.difficulty === 'medium' ? 'متوسط' : 'متقدم'}</span>
                      <span className="text-amber-500">+{l.xpReward} XP</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
          <span>↵ للانتقال</span>
          <span>Esc للإغلاق</span>
          <span>Ctrl+K للفتح</span>
        </div>
      </div>
    </div>
  );
}
