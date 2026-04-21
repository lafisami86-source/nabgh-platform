import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Content';
import { shuffleArray } from '@/lib/utils';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    await connectDB();
  const exercise = await Exercise.findById(id).lean() as any;
  if (!exercise) return NextResponse.json({ error: 'التمرين غير موجود' }, { status: 404 });

  // Shuffle if configured
  if (exercise.settings?.shuffleQuestions) {
    exercise.questions = shuffleArray(exercise.questions);
  }
  if (exercise.settings?.shuffleOptions) {
    exercise.questions = exercise.questions.map((q: any) => ({
      ...q,
      options: q.options ? shuffleArray(q.options) : q.options,
    }));
  }

  // Hide correct answers for delivery
  const safeQuestions = exercise.questions.map((q: any) => {
    const { solution, testCases, ...safe } = q;
    return {
      ...safe,
      options: q.options?.map(({ isCorrect, feedback, ...opt }: any) => opt),
    };
  });

  return NextResponse.json({ success: true, data: { ...exercise, questions: safeQuestions } });
}
