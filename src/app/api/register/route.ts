import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),
  role: z.enum(['student', 'teacher', 'parent']).default('student'),
  country: z.string().default('SA'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();

    const exists = await User.findOne({ email: data.email });
    if (exists) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });

    const user = await User.create({
      email: data.email,
      password: data.password,
      role: data.role,
      profile: { firstName: data.firstName, lastName: data.lastName, displayName: `${data.firstName} ${data.lastName}`, country: data.country },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: { id: user._id, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
  }
}
