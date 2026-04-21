import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Exercise } from '@/models/Content';
import { UserProgress } from '@/models/Analytics';
import { awardXP, checkAndAwardBadges } from '@/lib/gamification';
import { updateSkillMap, recordDailyActivity } from '@/lib/adaptive-engine';
import User from '@/models/User';

function gradeAnswer(question: any, userAnswer: any): { isCorrect: boolean; points: number; feedback: string } {
  const { type } = question;
  
  switch (type) {
    case 'multiple-choice': {
      const correct = question.options?.find((o: any) => o.isCorrect);
      const chosen = question.options?.find((o: any) => o._id?.toString() === userAnswer || o.text === userAnswer);
      const isCorrect = chosen?.isCorrect === true;
      return { isCorrect, points: isCorrect ? question.points : 0, feedback: chosen?.feedback || (isCorrect ? 'أحسنت!' : 'إجابة خاطئة') };
    }
    case 'true-false': {
      const isCorrect = userAnswer === question.correctBoolean || String(userAnswer) === String(question.correctBoolean);
      return { isCorrect, points: isCorrect ? question.points : 0, feedback: isCorrect ? 'صحيح!' : `خطأ - ${question.correction || ''}` };
    }
    case 'fill-blank': {
      const blanks = question.blanks || [];
      const userBlanks = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      let correct = 0;
      blanks.forEach((blank: any, i: number) => {
        const ans = (userBlanks[i] || '').trim();
        const accepted = blank.acceptedAnswers.map((a: string) => blank.caseSensitive ? a : a.toLowerCase());
        if (accepted.includes(blank.caseSensitive ? ans : ans.toLowerCase())) correct++;
      });
      const isCorrect = correct === blanks.length;
      const partialScore = Math.round((correct / Math.max(blanks.length, 1)) * question.points);
      return { isCorrect, points: partialScore, feedback: isCorrect ? 'ممتاز!' : `${correct}/${blanks.length} إجابات صحيحة` };
    }
    case 'short-answer': {
      const ans = (userAnswer || '').trim().toLowerCase().replace(/\s+/g, '');
      const accepted = (question.acceptedAnswers || []).map((a: string) => a.trim().toLowerCase().replace(/\s+/g, ''));
      const isCorrect = accepted.some((a: string) => ans === a || ans.includes(a) || a.includes(ans));
      return { isCorrect, points: isCorrect ? question.points : 0, feedback: isCorrect ? 'إجابة صحيحة!' : 'إجابة غير صحيحة' };
    }
    case 'ordering': {
      const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
      const correctOrder = [...(question.items || [])].sort((a: any, b: any) => a.correctOrder - b.correctOrder).map((i: any) => i.text);
      const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
      return { isCorrect, points: isCorrect ? question.points : 0, feedback: isCorrect ? 'ترتيب صحيح!' : 'الترتيب غير صحيح' };
    }
    case 'matching': {
      const userPairs = Array.isArray(userAnswer) ? userAnswer : [];
      const correctPairs = question.pairs || [];
      let correct = 0;
      userPairs.forEach((pair: any) => {
        const cp = correctPairs.find((p: any) => p.left.text === pair.left);
        if (cp && cp.right.text === pair.right) correct++;
      });
      const isCorrect = correct === correctPairs.length;
      return { isCorrect, points: Math.round((correct / Math.max(correctPairs.length, 1)) * question.points), feedback: `${correct}/${correctPairs.length} تطابقات صحيحة` };
    }
    default:
      return { isCorrect: false, points: 0, feedback: 'نوع سؤال غير معروف' };
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    await connectDB();
    const { answers, timeSpentMinutes = 0 } = await req.json();
    const exercise = await Exercise.findById(id);
    if (!exercise) return NextResponse.json({ error: 'التمرين غير موجود' }, { status: 404 });

    const userId = session.user.id;

    // Check attempt limit
    let progress = await UserProgress.findOne({ userId });
    if (!progress) progress = await UserProgress.create({ userId });

    const exProgress = progress.exercises.find((e: any) => e.exerciseId.toString() === id);
    if (exProgress && exercise.settings.maxAttempts > 0 && exProgress.totalAttempts >= exercise.settings.maxAttempts) {
      return NextResponse.json({ error: 'تم استنفاد عدد المحاولات المسموح بها' }, { status: 400 });
    }

    // Grade all answers
    const gradedAnswers = exercise.questions.map((q: any, i: number) => {
      const userAns = answers.find((a: any) => a.questionId === q._id.toString() || a.questionIndex === i);
      const result = gradeAnswer(q, userAns?.answer);
      return {
        questionId: q._id,
        userAnswer: userAns?.answer,
        isCorrect: result.isCorrect,
        partialScore: result.points,
        feedback: result.feedback,
        explanation: exercise.settings.showExplanation !== 'never' ? q.explanation : undefined,
        correctAnswer: exercise.settings.showCorrectAnswers ? getCorrectAnswer(q) : undefined,
        timeSpentSeconds: userAns?.timeSpent || 0,
        hintsUsed: userAns?.hintsUsed || 0,
      };
    });

    const totalPoints = exercise.questions.reduce((sum: number, q: any) => sum + q.points, 0);
    const earnedPoints = gradedAnswers.reduce((sum, a) => sum + (a.partialScore || 0), 0);
    const score = earnedPoints;
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= exercise.settings.passingScore;
    const isPerfect = percentage === 100;

    // XP calculation
    let xpEarned = 0;
    if (percentage > 0) xpEarned += Math.round(exercise.xpReward.completion * (percentage / 100));
    if (isPerfect) xpEarned += exercise.xpReward.perfect;
    if (timeSpentMinutes > 0 && exercise.settings.bonusForSpeed) xpEarned += exercise.xpReward.speed;

    // Save attempt
    const attemptData = {
      attemptNumber: (exProgress?.totalAttempts || 0) + 1,
      answers: gradedAnswers,
      score,
      percentage,
      timeSpentMinutes,
      xpEarned,
      completedAt: new Date(),
    };

    if (exProgress) {
      exProgress.attempts.push(attemptData);
      exProgress.totalAttempts += 1;
      exProgress.lastAttemptAt = new Date();
      if (score > exProgress.bestScore) exProgress.bestScore = score;
      if (percentage > exProgress.bestPercentage) exProgress.bestPercentage = percentage;
      exProgress.status = passed ? 'passed' : 'failed';
    } else {
      progress.exercises.push({
        exerciseId: id,
        status: passed ? 'passed' : 'failed',
        attempts: [attemptData],
        bestScore: score,
        bestPercentage: percentage,
        totalAttempts: 1,
        lastAttemptAt: new Date(),
      });
    }
    await progress.save();

    // Update exercise stats
    await Exercise.findByIdAndUpdate(id, {
      $inc: { 'stats.attempts': 1 },
      $set: { 'stats.avgScore': score },
    });

    // Update user stats
    await User.findByIdAndUpdate(userId, { $inc: { 'gamification.totalExercisesSolved': 1 } });

    // Award XP
    const { newXP, leveledUp, newLevel } = await awardXP(userId, xpEarned, `إكمال تمرين`);

    // Update skill map for each question
    for (const q of exercise.questions) {
      if (q.skill) {
        const answer = gradedAnswers.find((a) => a.questionId.toString() === q._id.toString());
        await updateSkillMap({
          userId, subjectId: exercise.subjectId.toString(),
          skill: q.skill, isCorrect: answer?.isCorrect || false,
          timeSpent: answer?.timeSpentSeconds || 0, hintsUsed: answer?.hintsUsed || 0,
        });
      }
    }

    // Record daily activity
    await recordDailyActivity(userId, {
      minutesStudied: timeSpentMinutes, lessonsCompleted: 0, exercisesCompleted: 1,
      questionsAnswered: exercise.questions.length,
      questionsCorrect: gradedAnswers.filter(a => a.isCorrect).length,
      xpEarned,
    });

    // Check badges
    const user = await User.findById(userId);
    const newBadges = await checkAndAwardBadges(userId, {
      totalExercises: user?.gamification.totalExercisesSolved || 0,
      accuracy: percentage,
    });

    return NextResponse.json({
      success: true,
      results: {
        score, percentage, passed, isPerfect, xpEarned, newXP, leveledUp, newLevel,
        totalQuestions: exercise.questions.length,
        correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
        gradedAnswers, newBadges,
        attemptNumber: attemptData.attemptNumber,
        canRetry: exercise.settings.allowRetry && attemptData.attemptNumber < exercise.settings.maxAttempts,
      },
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

function getCorrectAnswer(q: any): any {
  switch (q.type) {
    case 'multiple-choice': return q.options?.find((o: any) => o.isCorrect)?.text;
    case 'true-false': return q.correctBoolean;
    case 'fill-blank': return q.blanks?.map((b: any) => b.acceptedAnswers[0]);
    case 'short-answer': return q.acceptedAnswers?.[0];
    case 'ordering': return [...(q.items || [])].sort((a: any, b: any) => a.correctOrder - b.correctOrder).map((i: any) => i.text);
    default: return null;
  }
}
