import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── UserProgress ─────────────────────────────────────────────────
const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjects: [{
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    progress: { type: Number, default: 0 },
    completedUnits: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    currentUnit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    currentLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    startedAt: Date,
    lastAccessedAt: Date,
    totalTimeMinutes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  }],
  lessons: [{
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
    progress: { type: Number, default: 0 },
    videoProgress: {
      watchedSeconds: { type: Number, default: 0 },
      totalSeconds: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
    slidesProgress: { viewedSlides: [Number], totalSlides: Number },
    checkpointResults: [{
      checkpointIndex: Number,
      isCorrect: Boolean,
      attempts: { type: Number, default: 0 },
      answeredAt: Date,
    }],
    rating: { type: Number, min: 1, max: 5 },
    notes: String,
    bookmarked: { type: Boolean, default: false },
    startedAt: Date,
    completedAt: Date,
    timeSpentMinutes: { type: Number, default: 0 },
  }],
  exercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    status: { type: String, enum: ['not-started', 'in-progress', 'completed', 'passed', 'failed'], default: 'not-started' },
    attempts: [{
      attemptNumber: Number,
      answers: [{
        questionId: { type: Schema.Types.ObjectId },
        userAnswer: Schema.Types.Mixed,
        isCorrect: Boolean,
        partialScore: Number,
        timeSpentSeconds: Number,
        hintsUsed: { type: Number, default: 0 },
      }],
      score: Number,
      percentage: Number,
      timeSpentMinutes: Number,
      xpEarned: Number,
      completedAt: Date,
    }],
    bestScore: { type: Number, default: 0 },
    bestPercentage: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    lastAttemptAt: Date,
  }],
  flashcards: [{
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    cardIndex: Number,
    confidence: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    nextReviewDate: Date,
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: Date,
  }],
}, { timestamps: true });

UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ 'lessons.lessonId': 1 });

// ─── LearningAnalytics ─────────────────────────────────────────────
const LearningAnalyticsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skillMap: [{
    subject: String,
    skill: String,
    subSkill: String,
    level: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
    lastUpdated: Date,
  }],
  learningStyle: {
    visual: { type: Number, default: 25 },
    auditory: { type: Number, default: 25 },
    reading: { type: Number, default: 25 },
    kinesthetic: { type: Number, default: 25 },
    determinedAt: Date,
  },
  patterns: {
    preferredTimes: [{ dayOfWeek: Number, hour: Number, frequency: Number }],
    averageSessionMinutes: { type: Number, default: 0 },
    sessionsPerWeek: { type: Number, default: 0 },
    mostProductiveTime: String,
    bestSubject: String,
    weakestSubject: String,
    completionRate: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 },
  },
  recommendations: [{
    type: { type: String, enum: ['review', 'practice', 'advance', 'challenge', 'break'] },
    category: { type: String, enum: ['lesson', 'exercise', 'subject', 'general'] },
    itemId: Schema.Types.ObjectId,
    title: String,
    reason: String,
    priority: Number,
    status: { type: String, enum: ['pending', 'viewed', 'completed', 'dismissed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  }],
  dailyStats: [{
    date: Date,
    minutesStudied: { type: Number, default: 0 },
    lessonsStarted: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    exercisesCompleted: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    streakDay: Number,
  }],
  weeklyStats: [{
    weekStart: Date,
    totalMinutes: Number,
    totalLessons: Number,
    totalExercises: Number,
    averageAccuracy: Number,
    totalXP: Number,
    subjectBreakdown: [{ subject: String, minutes: Number, accuracy: Number }],
  }],
}, { timestamps: true });

LearningAnalyticsSchema.index({ userId: 1 });

// ─── Badge ─────────────────────────────────────────────────────────
const BadgeSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  nameEn: String,
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['learning', 'exercises', 'streak', 'social', 'achievement', 'challenge', 'special'], required: true },
  criteria: { type: { type: String }, metric: String, threshold: Number, condition: String },
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
  xpBonus: { type: Number, default: 0 },
  order: Number,
  isActive: { type: Boolean, default: true },
  isSecret: { type: Boolean, default: false },
});

// ─── Challenge ─────────────────────────────────────────────────────
const ChallengeSchema = new Schema({
  type: { type: String, enum: ['daily', 'weekly', 'friend', 'tournament', 'course'], required: true },
  title: { type: String, required: true },
  description: String,
  image: String,
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  grade: String,
  topic: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  questionIds: [{ type: Schema.Types.ObjectId }],
  questionCount: { type: Number, default: 5 },
  timeLimit: { type: Number, default: 180 },
  rules: {
    minParticipants: { type: Number, default: 1 },
    maxParticipants: Number,
    registrationDeadline: Date,
    allowLateJoin: { type: Boolean, default: false },
  },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    displayName: String,
    avatar: String,
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    rank: Number,
    completedAt: Date,
    joinedAt: { type: Date, default: Date.now },
  }],
  rewards: {
    participation: { xp: { type: Number, default: 10 } },
    completion: { xp: { type: Number, default: 30 }, badge: String },
    first: { xp: { type: Number, default: 200 }, badge: String, prize: String },
    second: { xp: { type: Number, default: 100 }, badge: String },
    third: { xp: { type: Number, default: 50 }, badge: String },
    perfect: { xp: { type: Number, default: 75 }, badge: String },
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  stats: { totalParticipants: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 }, completionRate: { type: Number, default: 0 } },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ChallengeSchema.index({ type: 1, status: 1 });
ChallengeSchema.index({ startTime: 1, endTime: 1 });

// ─── Notification ──────────────────────────────────────────────────
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['achievement', 'badge', 'streak', 'reminder', 'challenge', 'message', 'progress', 'system', 'social', 'parent-report'], required: true },
  title: { type: String, required: true },
  body: String,
  icon: String,
  image: String,
  action: { type: { type: String, enum: ['navigate', 'open-url', 'none'] }, target: String },
  data: Schema.Types.Mixed,
  channels: [{ type: String, enum: ['push', 'email', 'in-app', 'sms'] }],
  isRead: { type: Boolean, default: false },
  readAt: Date,
  scheduledFor: Date,
  sentAt: Date,
  expiresAt: Date,
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1 });

// ─── ChatHistory ───────────────────────────────────────────────────
const ChatHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  context: {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    topic: String,
    grade: String,
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    attachments: [{ type: { type: String }, url: String, name: String }],
    metadata: { tokensUsed: Number, model: String, responseTime: Number },
    timestamp: { type: Date, default: Date.now },
  }],
  tokensUsed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ChatHistorySchema.index({ userId: 1 });

// ─── Leaderboard ───────────────────────────────────────────────────
const LeaderboardSchema = new Schema({
  type: { type: String, enum: ['global', 'country', 'school', 'class', 'subject', 'friends'], required: true },
  scope: String,
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  grade: String,
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'all-time'], required: true },
  rankings: [{
    rank: Number,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    displayName: String,
    avatar: String,
    country: String,
    xp: Number,
    score: Number,
    streak: Number,
    level: Number,
    change: { type: Number, default: 0 },
  }],
  lastUpdated: { type: Date, default: Date.now },
  nextUpdate: Date,
});

LeaderboardSchema.index({ type: 1, period: 1, scope: 1 });

// ─── Payment ───────────────────────────────────────────────────────
const PaymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['subscription', 'one-time', 'upgrade'], required: true },
  plan: { type: String, enum: ['basic', 'premium', 'school'], required: true },
  duration: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  discount: { type: Number, default: 0 },
  couponCode: String,
  paymentMethod: String,
  provider: { type: String, enum: ['stripe', 'moyasar', 'tap'] },
  transactionId: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], default: 'pending' },
  invoice: { number: String, url: String },
  completedAt: Date,
}, { timestamps: true });

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ transactionId: 1 });

// ─── Exports ───────────────────────────────────────────────────────
export const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
export const LearningAnalytics = mongoose.models.LearningAnalytics || mongoose.model('LearningAnalytics', LearningAnalyticsSchema);
export const Badge = mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);
export const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);
export const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
