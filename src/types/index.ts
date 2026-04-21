// ─── User Types ───────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'school';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  phone?: string;
  country: string;
  city?: string;
  bio?: string;
}

export interface StudentInfo {
  educationLevel: string;
  grade: string;
  curriculum: string;
  track?: string;
  school?: string;
  subjects: string[];
  learningStyle?: LearningStyle;
  dailyGoalMinutes: number;
  parentId?: string;
}

export interface TeacherInfo {
  specialization: string[];
  subjects: string[];
  grades: string[];
  experience?: number;
  qualifications?: string[];
  bio?: string;
  rating: { average: number; count: number };
  verified: boolean;
}

export interface ParentInfo {
  children: string[];
}

export interface Gamification {
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActiveDate?: Date;
    freezesRemaining: number;
  };
  badges: Array<{ badgeId: string; earnedAt: Date }>;
  totalLessonsCompleted: number;
  totalExercisesSolved: number;
  totalTimeMinutes: number;
  accuracy: number;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    email: boolean;
    push: boolean;
    dailyReminder: boolean;
    reminderTime: string;
    weeklyReport: boolean;
    achievements: boolean;
  };
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  studentInfo?: StudentInfo;
  teacherInfo?: TeacherInfo;
  parentInfo?: ParentInfo;
  gamification: Gamification;
  preferences: UserPreferences;
  subscription: UserSubscription;
  onboardingCompleted: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ─── Curriculum / Content Types ────────────────────────────────
export interface ICurriculum {
  _id: string;
  name: string;
  nameEn: string;
  country: string;
  description: string;
  logo?: string;
  levels: Array<{
    id: string;
    name: string;
    order: number;
    grades: Array<{ id: string; name: string; order: number; tracks: string[] }>;
  }>;
  isActive: boolean;
}

export interface ISubject {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  curriculumId: string;
  grade: string;
  track?: string;
  unitsCount: number;
  lessonsCount: number;
  estimatedHours: number;
  order: number;
  isActive: boolean;
  isFree: boolean;
}

export interface IUnit {
  _id: string;
  subjectId: string;
  title: string;
  description: string;
  thumbnail?: string;
  order: number;
  lessonsCount: number;
  estimatedMinutes: number;
  prerequisites: string[];
  isLocked: boolean;
  isActive: boolean;
}

export type ContentType = 'video' | 'interactive' | 'reading' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ILesson {
  _id: string;
  unitId: string;
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  content: {
    type: ContentType;
    video?: {
      url: string;
      duration: number;
      provider: string;
      thumbnailUrl?: string;
    };
    slides?: Array<{
      order: number;
      type: string;
      title: string;
      content: unknown;
      notes?: string;
    }>;
    article?: { html: string; readingTime: number };
  };
  flashcards: Array<{ front: string; back: string; image?: string }>;
  summary: { text: string; keyPoints: string[] };
  difficulty: DifficultyLevel;
  xpReward: number;
  estimatedMinutes: number;
  order: number;
  tags: string[];
  stats: { views: number; completions: number; avgRating: number };
  createdBy: string;
  isPublished: boolean;
  createdAt: Date;
}

// ─── Exercise / Question Types ─────────────────────────────────
export type QuestionType =
  | 'multiple-choice' | 'true-false' | 'fill-blank'
  | 'matching' | 'ordering' | 'short-answer' | 'essay'
  | 'drag-drop' | 'hotspot' | 'audio' | 'code';

export interface IQuestion {
  _id: string;
  order: number;
  type: QuestionType;
  text: string;
  richText?: string;
  image?: string;
  audio?: string;
  options?: Array<{ _id: string; text: string; image?: string; isCorrect: boolean; feedback?: string }>;
  correctBoolean?: boolean;
  correction?: string;
  blanks?: Array<{ position: number; acceptedAnswers: string[]; caseSensitive: boolean }>;
  pairs?: Array<{ left: { text: string; image?: string }; right: { text: string; image?: string } }>;
  items?: Array<{ text: string; correctOrder: number }>;
  acceptedAnswers?: string[];
  rubric?: Array<{ criteria: string; maxPoints: number; description: string }>;
  wordLimit?: { min: number; max: number };
  language?: string;
  codeTemplate?: string;
  solution?: string;
  testCases?: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  explanation?: string;
  hint?: string;
  hint2?: string;
  points: number;
  difficulty: DifficultyLevel;
  skill?: string;
  tags: string[];
}

export interface IExercise {
  _id: string;
  lessonId?: string;
  unitId?: string;
  subjectId: string;
  title: string;
  description: string;
  type: 'practice' | 'homework' | 'quiz' | 'exam' | 'placement';
  questions: IQuestion[];
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showExplanation: 'immediately' | 'after-submit' | 'never';
    allowRetry: boolean;
    maxAttempts: number;
    timeLimit: number;
    passingScore: number;
    showResults: boolean;
    showCorrectAnswers: boolean;
    penaltyForWrong: number;
  };
  xpReward: { completion: number; perfect: number; speed: number };
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
}

// ─── Progress Types ─────────────────────────────────────────────
export interface IUserProgress {
  userId: string;
  subjects: Array<{
    subjectId: string;
    progress: number;
    completedLessons: string[];
    currentUnit?: string;
    currentLesson?: string;
    startedAt: Date;
    lastAccessedAt: Date;
    totalTimeMinutes: number;
    averageScore: number;
  }>;
  lessons: Array<{
    lessonId: string;
    status: 'not-started' | 'in-progress' | 'completed';
    progress: number;
    videoProgress?: { watchedSeconds: number; totalSeconds: number; completed: boolean };
    rating?: number;
    notes?: string;
    bookmarked: boolean;
    completedAt?: Date;
    timeSpentMinutes: number;
  }>;
  exercises: Array<{
    exerciseId: string;
    status: 'not-started' | 'completed' | 'passed' | 'failed';
    attempts: Array<{
      attemptNumber: number;
      answers: Array<{ questionId: string; userAnswer: unknown; isCorrect: boolean; timeSpentSeconds: number; hintsUsed: number }>;
      score: number;
      percentage: number;
      timeSpentMinutes: number;
      xpEarned: number;
      completedAt: Date;
    }>;
    bestScore: number;
    bestPercentage: number;
    totalAttempts: number;
  }>;
}

// ─── Gamification Types ─────────────────────────────────────────
export interface IBadge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'exercises' | 'streak' | 'social' | 'achievement' | 'challenge' | 'special';
  criteria: { type: string; metric: string; threshold: number; condition: string };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  isSecret: boolean;
}

export interface IChallenge {
  _id: string;
  type: 'daily' | 'weekly' | 'friend' | 'tournament';
  title: string;
  description: string;
  subject?: string;
  grade?: string;
  difficulty: DifficultyLevel | 'mixed';
  questionCount: number;
  timeLimit: number;
  participants: Array<{
    userId: string;
    displayName: string;
    avatar?: string;
    score: number;
    rank: number;
    completedAt?: Date;
  }>;
  rewards: {
    participation: { xp: number };
    first: { xp: number; badge: string };
    second: { xp: number };
    third: { xp: number };
  };
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'completed';
}

// ─── API Response Types ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface XPEvent {
  amount: number;
  reason: string;
  timestamp: Date;
}
