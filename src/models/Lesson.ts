import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  unitId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  content: {
    type: 'video' | 'interactive' | 'reading' | 'mixed';
    video?: {
      url: string;
      duration: number;
      provider: 'mux' | 'cloudflare' | 'youtube';
      thumbnailUrl?: string;
      captions?: Array<{ language: string; url: string }>;
    };
    slides?: Array<{
      order: number;
      type: 'text' | 'image' | 'video' | 'quiz' | 'activity' | 'code';
      title?: string;
      content: any;
      notes?: string;
      animation?: string;
      duration?: number;
    }>;
    article?: { html: string; readingTime: number };
  };
  checkpoints: Array<{
    afterMinute?: number;
    afterSlide?: number;
    question: {
      type: string;
      text: string;
      image?: string;
      options: Array<{ text: string; isCorrect: boolean; feedback?: string }>;
      correctAnswer?: any;
      explanation: string;
    };
  }>;
  resources: Array<{
    title: string;
    type: 'pdf' | 'doc' | 'ppt' | 'link' | 'video';
    url: string;
    size?: number;
  }>;
  summary: { text: string; keyPoints: string[]; mindMap?: any };
  flashcards: Array<{ front: string; back: string; image?: string }>;
  prerequisites: mongoose.Types.ObjectId[];
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  estimatedMinutes: number;
  order: number;
  tags: string[];
  grade: string;
  stats: {
    views: number;
    completions: number;
    avgRating: number;
    ratingsCount: number;
    avgCompletionTime?: number;
  };
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    objectives: [String],
    content: {
      type: { type: String, enum: ['video', 'interactive', 'reading', 'mixed'], default: 'mixed' },
      video: {
        url: String,
        duration: Number,
        provider: { type: String, enum: ['mux', 'cloudflare', 'youtube'] },
        thumbnailUrl: String,
        captions: [{ language: String, url: String }],
      },
      slides: [{
        order: Number,
        type: { type: String, enum: ['text', 'image', 'video', 'quiz', 'activity', 'code'] },
        title: String,
        content: Schema.Types.Mixed,
        notes: String,
        animation: String,
        duration: Number,
      }],
      article: { html: String, readingTime: Number },
    },
    checkpoints: [{
      afterMinute: Number,
      afterSlide: Number,
      question: {
        type: String,
        text: String,
        image: String,
        options: [{ text: String, isCorrect: Boolean, feedback: String }],
        correctAnswer: Schema.Types.Mixed,
        explanation: String,
      },
    }],
    resources: [{ title: String, type: String, url: String, size: Number }],
    summary: { text: String, keyPoints: [String], mindMap: Schema.Types.Mixed },
    flashcards: [{ front: String, back: String, image: String }],
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    xpReward: { type: Number, default: 50 },
    estimatedMinutes: { type: Number, default: 15 },
    order: { type: Number, default: 0 },
    tags: [String],
    grade: String,
    stats: {
      views: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      ratingsCount: { type: Number, default: 0 },
      avgCompletionTime: Number,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

LessonSchema.index({ unitId: 1, order: 1 });
LessonSchema.index({ subjectId: 1 });
LessonSchema.index({ isPublished: 1 });

const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;
