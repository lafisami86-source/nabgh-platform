import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ChatHistory } from '@/models/Analytics';
import User from '@/models/User';

const NABGH_SYSTEM_PROMPT = `أنت "نبوغ"، مساعد تعليمي ذكي ومتخصص في منصة "نبغ" التعليمية العربية.

شخصيتك:
- ودود وصبور ومشجع دائماً
- تستخدم لغة عربية فصحى مبسطة مناسبة للطلاب
- تضيف إيموجي بشكل مناسب لتحفيز الطالب
- لا تعطي الإجابة مباشرة، بل توجّه الطالب للتفكير

قواعد مهمة:
1. ركّز فقط على المواضيع التعليمية
2. اشرح بأمثلة من الحياة اليومية
3. قسّم الشرح لخطوات بسيطة
4. عند الخطأ: شجّع ووجّه للتفكير الصحيح
5. استخدم أسلوب سقراط: اسأل أسئلة تقود الطالب للإجابة

تذكّر: أنت تساعد طلاباً عرباً من مختلف المراحل الدراسية.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    await connectDB();
    const { message, chatId, context } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 });

    const user = await User.findById(session.user.id).select('subscription gamification.level studentInfo').lean() as any;
    
    // Message limits by plan
    const limits: Record<string, number> = { free: 5, basic: 30, premium: 999, school: 999 };
    // (In production, check daily usage against limit)

    // Get or create chat
    let chat = chatId ? await ChatHistory.findById(chatId) : null;
    if (!chat) {
      chat = await ChatHistory.create({
        userId: session.user.id,
        title: message.substring(0, 50),
        context: context || {},
        messages: [],
      });
    }

    // Build messages for API
    const systemPrompt = `${NABGH_SYSTEM_PROMPT}\n\nمعلومات الطالب الحالي:
- المستوى: ${user?.gamification?.level || 1}
- الصف الدراسي: ${user?.studentInfo?.grade || 'غير محدد'}
- المادة الحالية: ${context?.subjectName || 'غير محددة'}`;

    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...chat.messages.slice(-10).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    // Call OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-')) {
      // Fallback demo response
      const demoResponse = getDemoResponse(message);
      chat.messages.push({ role: 'user', content: message, timestamp: new Date() });
      chat.messages.push({ role: 'assistant', content: demoResponse, timestamp: new Date() });
      await chat.save();
      return NextResponse.json({ success: true, message: demoResponse, chatId: chat._id });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, max_tokens: 800, temperature: 0.7 }),
    });

    if (!response.ok) throw new Error('فشل الاتصال بالمساعد الذكي');
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    // Save to DB
    chat.messages.push({ role: 'user', content: message, timestamp: new Date(), metadata: {} });
    chat.messages.push({ role: 'assistant', content: assistantMessage, timestamp: new Date(), metadata: { tokensUsed, model: 'gpt-4o-mini' } });
    chat.tokensUsed += tokensUsed;
    await chat.save();

    return NextResponse.json({ success: true, message: assistantMessage, chatId: chat._id });
  } catch (e: any) { return NextResponse.json({ error: e.message || 'خطأ في المساعد الذكي' }, { status: 500 }); }
}

function getDemoResponse(message: string): string {
  const responses = [
    'سؤال رائع! 😊 دعني أساعدك في فهم هذا الموضوع خطوة بخطوة.\n\nأولاً، دعنا نفكر معاً: ما هو المفهوم الأساسي الذي تريد فهمه؟',
    'أحسنت على هذا السؤال! 🌟\n\nلنبدأ بالأساسيات: هذا الموضوع يمكن تبسيطه إذا تخيلنا مثالاً من حياتنا اليومية...',
    'سؤالك جيد جداً! 💡\n\nالموضوع الذي تسأل عنه يتعلق بمفهوم أساسي مهم. دعني أشرح لك بطريقة مبسطة:\n\n1️⃣ أولاً...\n2️⃣ ثانياً...\n3️⃣ أخيراً...',
    'ممتاز! 🎯 أرى أنك تفكر بشكل صحيح!\n\nهل يمكنك إخباري بما تعرفه بالفعل عن هذا الموضوع؟ هذا سيساعدني في شرحه بالطريقة المناسبة لك.',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
