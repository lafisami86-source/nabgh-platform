import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { concept, grade, subject } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return NextResponse.json({ success: true, explanation: `شرح "${concept}": هذا المفهوم مهم في ${subject || 'مادتك'}. الفكرة الأساسية هي... 💡` });
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body: JSON.stringify({ model:'gpt-4o-mini', max_tokens:600, messages:[
      {role:'system',content:'أنت مساعد تعليمي. اشرح بطريقة مبسطة مع أمثلة.'},
      {role:'user',content:`اشرح "${concept}" لطالب ${grade} في ${subject}`}
    ]})
  });
  const data = await res.json();
  return NextResponse.json({ success:true, explanation: data.choices[0].message.content });
}
