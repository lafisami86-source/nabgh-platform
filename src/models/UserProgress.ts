import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  subjects: Array<{
    subjectId: mongoose.Types.ObjectId;
    progress: number;
    completedUnits: mongoose.Types.ObjectId[];
    completedLessons: mongoose.Types.ObjectId[];
    currentUnit?: mongoose.Types.ObjectId;
    currentLesson?: mongoose.Types.ObjectId;
    startedAt: Date;
    lastAccessedAt: Date;
    totalTimeMinutes: number;
    averageScore: number;
  }>;
  lessons: Array<{
    lessonId: mongoose.Types.ObjectId;
    status: 'not-started' | 'in-progress' | 'completed';
    progress: number;
    videoProgress?: { watchedSeconds: number; totalSeconds: number; completed: boolean };
    slidesProgress?: { viewedSlides: number[]; totalSlides: number };
    checkpointResults: Array<{ checkpointIndex: number; isCorrect: boolean; attempts: number; answeredAt: Date }>;
    rating?: number;
    notes?: string;
    bookmarked: boolean;
    startedAt?: Date;
    completedAt?: Date;
    timeSpentMinutes: number;
  }>;
  exercises: Array<{
    exerciseId: mongoose.Types.ObjectId;
    status: 'not-started' | 'in-progress' | 'completed' | 'passed' | 'failed';
    attempts: Array<{
      attemptNumber: number;
      answers: Array<{
        questionId: mongoose.Types.ObjectId;
        userAnswer: any;
        isCorrect: boolean;
        partialScore: number;
        timeSpentSeconds: number;
        hintsUsed: number;
      }>;
      score: number;
      percentage: number;
      timeSpentMinutes: number;
      xpEarned: number;
      completedAt: Date;
    }>;
    bestScore: number;
    bestPercentage: number;
    totalAttempts: number;
    lastAttemptAt?: Date;
  }>;
  flashcards: Array<{
    lessonId: mongoose.Types.ObjectId;
    cardIndex: number;
    confidence: 'low' | 'medium' | 'high';
    nextReviewDate?: Date;
    reviewCount: number;
    lastReviewedAt?: Date;
  }>;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subjects: [{
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      completedUnits: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
      completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
      currentUnit: { type: Schema.Types.ObjectId, ref: 'Unit' },
      currentLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
      startedAt: { type: Date, default: Date.now },
      lastAccessedAt: { type: Date, default: Date.now },
      totalTimeMinutes: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    }],
    lessons: [{
      lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
      status: { type: String, enum: ['not-started','in-progress','completed'], default: 'not-started' },
      progress: { type: Number, default: 0 },
      videoProgress: { watchedSeconds: Number, totalSeconds: Number, completed: { type: Boolean, default: false } },
      slidesProgress: { viewedSlides: [Number], totalSlides: Number },
      checkpointResults: [{ checkpointIndex: Number, isCorrect: Boolean, attempts: Number, answeredAt: Date }],
      rating: { type: Number, min: 1, max: 5 },
      notes: String,
      bookmarked: { type: Boolean, default: false },
      startedAt: Date,
      completedAt: Date,
      timeSpentMinutes: { type: Number, default: 0 },
    }],
    exercises: [{
      exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
      status: { type: String, enum: ['not-started','in-progress','completed','passed','failed'], default: 'not-started' },
      attempts: [{
        attemptNumber: Number,
        answers: [{
          questionId: Schema.Types.ObjectId,
          userAnswer: Schema.Types.Mixed,
          isCorrect: Boolean,
          partialScore: { type: Number, default: 0 },
          timeSpentSeconds: { type: Number, default: 0 },
          hintsUsed: { type: Number, default: 0 },
        }],
        score: Number, percentage: Number,
        timeSpentMinutes: Number, xpEarned: Number,
        completedAt: Date,
      }],
      bestScore: { type: Number, default: 0 },
      bestPercentage: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 },
      lastAttemptAt: Date,
    }],
    flashcards: [{
      lessonId: Schema.Types.ObjectId,
      cardIndex: Number,
      confidence: { type: String, enum: ['low','medium','high'], default: 'low' },
      nextReviewDate: Date,
      reviewCount: { type: Number, default: 0 },
      lastReviewedAt: Date,
    }],
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ 'subjects.subjectId': 1 });

const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
export default UserProgress;
