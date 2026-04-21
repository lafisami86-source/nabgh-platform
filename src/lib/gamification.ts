import connectDB from './mongodb';
import User from '@/models/User';
import { Badge, Notification } from '@/models/Analytics';

export const XP_REWARDS = {
  COMPLETE_LESSON: 50,
  CORRECT_ANSWER: 10,
  FIRST_TRY_BONUS: 5,
  COMPLETE_EXERCISE: 100,
  PERFECT_EXERCISE: 50,
  DAILY_LOGIN: 20,
  STREAK_7: 100,
  STREAK_30: 500,
  HELP_PEER: 30,
  WIN_CHALLENGE: 200,
  RATE_LESSON: 15,
  NEW_SUBJECT: 100,
  COMPLETE_UNIT: 300,
  COMPLETE_SUBJECT: 1000,
} as const;

export async function awardXP(userId: string, amount: number, reason: string): Promise<{ newXP: number; leveledUp: boolean; newLevel: number }> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oldLevel = user.gamification.level;
  user.gamification.xp += amount;

  // Recalculate level
  const thresholds = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000];
  let newLevel = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (user.gamification.xp >= thresholds[i]) { newLevel = i + 1; break; }
  }

  const leveledUp = newLevel > oldLevel;
  if (leveledUp) user.gamification.level = newLevel;

  await user.save();

  if (leveledUp) {
    await createNotification(userId, 'achievement', `🎉 مبروك! وصلت للمستوى ${newLevel}`, `أنت الآن في مستوى ${getLevelName(newLevel)}`);
  }

  return { newXP: user.gamification.xp, leveledUp, newLevel };
}

export async function updateStreak(userId: string): Promise<{ streak: number; bonus: number }> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = user.gamification.streak.lastActiveDate;
  let bonus = 0;

  if (lastActive) {
    const lastDay = new Date(lastActive);
    lastDay.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - lastDay.getTime()) / 86400000);

    if (diff === 0) {
      // Already logged today
      return { streak: user.gamification.streak.current, bonus: 0 };
    } else if (diff === 1) {
      // Consecutive day
      user.gamification.streak.current += 1;
    } else if (diff > 1 && user.gamification.streak.freezesRemaining > 0) {
      // Use freeze
      user.gamification.streak.freezesRemaining -= 1;
    } else {
      // Streak broken
      user.gamification.streak.current = 1;
    }
  } else {
    user.gamification.streak.current = 1;
  }

  // Update longest
  if (user.gamification.streak.current > user.gamification.streak.longest) {
    user.gamification.streak.longest = user.gamification.streak.current;
  }

  user.gamification.streak.lastActiveDate = new Date();

  // Streak bonuses
  const streak = user.gamification.streak.current;
  if (streak === 7) { bonus = XP_REWARDS.STREAK_7; user.gamification.xp += bonus; }
  else if (streak === 30) { bonus = XP_REWARDS.STREAK_30; user.gamification.xp += bonus; }

  await user.save();
  return { streak, bonus };
}

export async function checkAndAwardBadges(userId: string, context: Record<string, number>): Promise<string[]> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return [];

  const earnedBadgeIds = user.gamification.badges.map((b: { badgeId: string }) => b.badgeId);
  const newBadges: string[] = [];

  const checks: Array<{ id: string; condition: boolean }> = [
    { id: 'lesson_10', condition: user.gamification.totalLessonsCompleted >= 10 },
    { id: 'lesson_50', condition: user.gamification.totalLessonsCompleted >= 50 },
    { id: 'lesson_100', condition: user.gamification.totalLessonsCompleted >= 100 },
    { id: 'exercises_100', condition: user.gamification.totalExercisesSolved >= 100 },
    { id: 'streak_7', condition: user.gamification.streak.current >= 7 },
    { id: 'streak_30', condition: user.gamification.streak.current >= 30 },
    { id: 'streak_100', condition: user.gamification.streak.current >= 100 },
    { id: 'accuracy_95', condition: (context.accuracy || 0) >= 95 },
    { id: 'perfect_5', condition: (context.perfectExercises || 0) >= 5 },
    { id: 'level_5', condition: user.gamification.level >= 5 },
    { id: 'level_8', condition: user.gamification.level >= 8 },
  ];

  for (const check of checks) {
    if (check.condition && !earnedBadgeIds.includes(check.id)) {
      user.gamification.badges.push({ badgeId: check.id, earnedAt: new Date() });
      newBadges.push(check.id);
      const badge = await Badge.findById(check.id);
      if (badge) {
        await createNotification(userId, 'badge', `🏅 شارة جديدة: ${badge.name}`, badge.description);
        if (badge.xpBonus > 0) user.gamification.xp += badge.xpBonus;
      }
    }
  }

  if (newBadges.length > 0) await user.save();
  return newBadges;
}

async function createNotification(userId: string, type: string, title: string, body: string) {
  await Notification.create({ userId, type, title, body, channels: ['in-app', 'push'] });
}

function getLevelName(level: number): string {
  const names = ['مبتدئ', 'متعلم', 'دارس', 'متقدم', 'متميز', 'نابغة', 'عبقري', 'أسطورة'];
  return names[level - 1] || 'أسطورة';
}
