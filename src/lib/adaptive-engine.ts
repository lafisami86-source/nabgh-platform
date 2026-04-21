/**
 * Adaptive Learning Engine
 * Analyzes student performance and generates personalized recommendations
 */
import connectDB from './mongodb';
import { LearningAnalytics, UserProgress } from '@/models/Analytics';
import { Lesson, Exercise } from '@/models/Content';

interface PerformanceData {
  userId: string;
  subjectId: string;
  skill: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
}

export async function updateSkillMap(data: PerformanceData): Promise<void> {
  await connectDB();
  let analytics = await LearningAnalytics.findOne({ userId: data.userId });
  if (!analytics) {
    analytics = await LearningAnalytics.create({ userId: data.userId });
  }

  const skillEntry = analytics.skillMap.find(
    (s: any) => s.subject === data.subjectId && s.skill === data.skill
  );

  if (skillEntry) {
    skillEntry.questionsAttempted += 1;
    if (data.isCorrect) skillEntry.questionsCorrect += 1;
    const accuracy = (skillEntry.questionsCorrect / skillEntry.questionsAttempted) * 100;
    const prevLevel = skillEntry.level;
    skillEntry.level = Math.round(accuracy);
    skillEntry.trend = accuracy > prevLevel ? 'improving' : accuracy < prevLevel ? 'declining' : 'stable';
    skillEntry.lastUpdated = new Date();
  } else {
    analytics.skillMap.push({
      subject: data.subjectId,
      skill: data.skill,
      level: data.isCorrect ? 100 : 0,
      questionsAttempted: 1,
      questionsCorrect: data.isCorrect ? 1 : 0,
      trend: 'stable',
      lastUpdated: new Date(),
    });
  }

  await analytics.save();
}

export async function generateRecommendations(userId: string): Promise<{
  type: string; title: string; reason: string; itemId?: string; priority: number
}[]> {
  await connectDB();
  const [analytics, progress] = await Promise.all([
    LearningAnalytics.findOne({ userId }),
    UserProgress.findOne({ userId }),
  ]);

  if (!analytics || !progress) return [];

  const recommendations = [];

  // Find weak skills (< 60%)
  const weakSkills = analytics.skillMap
    .filter((s: any) => s.level < 60 && s.questionsAttempted > 2)
    .sort((a: any, b: any) => a.level - b.level)
    .slice(0, 3);

  for (const skill of weakSkills) {
    recommendations.push({
      type: 'review',
      title: `راجع مهارة: ${skill.skill}`,
      reason: `دقتك في هذه المهارة ${skill.level}% - تحتاج مراجعة`,
      priority: 9,
    });
  }

  // Find uncompleted lessons in enrolled subjects
  for (const subject of (progress.subjects || []).slice(0, 3)) {
    const completedIds = subject.completedLessons?.map((id: any) => id.toString()) || [];
    const nextLesson = await Lesson.findOne({
      subjectId: subject.subjectId,
      isPublished: true,
      _id: { $nin: completedIds },
    }).sort({ order: 1 });

    if (nextLesson) {
      recommendations.push({
        type: 'advance',
        title: nextLesson.title,
        reason: 'الدرس التالي في مسارك التعليمي',
        itemId: nextLesson._id.toString(),
        priority: 7,
      });
    }
  }

  // Spaced repetition: find lessons due for review
  const reviewDue = analytics.skillMap
    .filter((s: any) => {
      if (!s.lastUpdated) return false;
      const daysSince = (Date.now() - new Date(s.lastUpdated).getTime()) / 86400000;
      return daysSince >= 3 && s.level < 80;
    })
    .slice(0, 2);

  for (const skill of reviewDue) {
    recommendations.push({
      type: 'practice',
      title: `مراجعة: ${skill.skill}`,
      reason: 'التكرار المتباعد يساعد على الحفظ طويل المدى',
      priority: 6,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

export function getAdaptiveDifficulty(userAccuracy: number, currentDifficulty: string): string {
  if (userAccuracy > 85 && currentDifficulty !== 'hard') {
    return currentDifficulty === 'easy' ? 'medium' : 'hard';
  }
  if (userAccuracy < 50 && currentDifficulty !== 'easy') {
    return currentDifficulty === 'hard' ? 'medium' : 'easy';
  }
  return currentDifficulty;
}

export async function recordDailyActivity(userId: string, stats: {
  minutesStudied: number; lessonsCompleted: number; exercisesCompleted: number;
  questionsAnswered: number; questionsCorrect: number; xpEarned: number;
}): Promise<void> {
  await connectDB();
  let analytics = await LearningAnalytics.findOne({ userId });
  if (!analytics) analytics = await LearningAnalytics.create({ userId });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIdx = analytics.dailyStats.findIndex(
    (d: any) => new Date(d.date).toDateString() === today.toDateString()
  );

  if (todayIdx >= 0) {
    const d = analytics.dailyStats[todayIdx];
    d.minutesStudied += stats.minutesStudied;
    d.lessonsCompleted += stats.lessonsCompleted;
    d.exercisesCompleted += stats.exercisesCompleted;
    d.questionsAnswered += stats.questionsAnswered;
    d.questionsCorrect += stats.questionsCorrect;
    d.xpEarned += stats.xpEarned;
  } else {
    analytics.dailyStats.push({ date: today, ...stats });
    // Keep last 90 days
    if (analytics.dailyStats.length > 90) analytics.dailyStats.shift();
  }

  await analytics.save();
}
