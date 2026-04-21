'use client';
import { useState, useRef, useEffect } from 'react';
import { Button, Card } from '@/components/ui/index';

const SUGGESTIONS = [
  'اشرح لي مفهوم الكسور بطريقة بسيطة',
  'ساعدني في حل هذه المسألة الرياضية',
  'ما الفرق بين الكسور العشرية والاعتيادية؟',
  'اختبرني في مادة الرياضيات',
  'أعطني خطة مراجعة ليوم الاختبار',
  'شرح قانون نيوتن الثاني',
];

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'مرحباً! أنا نبوغ 🤖 مساعدك التعليمي الذكي.\n\nيمكنني مساعدتك في:\n- شرح المفاهيم الصعبة بطريقة مبسطة 💡\n- حل المسائل خطوة بخطوة 🔢\n- تلخيص الدروس 📝\n- اختبارك وتقييم مستواك ✅\n\nما الذي تريد تعلمه اليوم؟ 😊',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg, timestamp: new Date() }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, chatId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(p => [...p, { role: 'assistant', content: data.message, timestamp: new Date() }]);
        if (data.chatId) setChatId(data.chatId);
      } else {
        setMessages(p => [...p, { role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.', timestamp: new Date() }]);
      }
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'لا يمكن الاتصال بالمساعد الآن. تأكد من إعداد مفتاح OpenAI.', timestamp: new Date() }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatMessage(content: string) {
    return content.split('\n').map((line, i) => (
      <span key={i}>{line}{i < content.split('\n').length - 1 && <br />}</span>
    ));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary rounded-2xl flex items-center justify-center text-2xl shadow-glow">🤖</div>
        <div>
          <h1 className="font-black text-slate-800 font-cairo text-lg">نبوغ - مساعدك الذكي</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">متصل ومستعد للمساعدة</span>
          </div>
        </div>
        <button onClick={() => { setMessages([{ role:'assistant', content:'تم بدء محادثة جديدة! 🌟 كيف يمكنني مساعدتك؟', timestamp:new Date() }]); setChatId(null); }}
          className="mr-auto text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5">
          محادثة جديدة
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary-500 to-secondary text-white' : 'bg-slate-200 text-slate-600'}`}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white border border-slate-100 shadow-card text-slate-700' : 'bg-primary-500 text-white'}`}>
              {formatMessage(msg.content)}
              <div className={`text-xs mt-1.5 opacity-60`}>
                {msg.timestamp.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary text-white flex items-center justify-center text-sm">🤖</div>
            <div className="bg-white border border-slate-100 shadow-card rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="pb-3">
          <p className="text-xs text-slate-500 mb-2 font-medium">اقتراحات سريعة:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-3 py-1.5 hover:bg-primary-100 transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex gap-3 items-end bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-primary-500 transition">
          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="اكتب سؤالك هنا... (Enter للإرسال)" rows={1} disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none max-h-32" />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-9 h-9 bg-primary-500 text-white rounded-xl flex items-center justify-center transition hover:bg-primary-600 disabled:opacity-40 shrink-0 text-lg">
            ↑
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">نبوغ مخصص للمساعدة في التعليم فقط • نبغ 2025</p>
      </div>
    </div>
  );
}
