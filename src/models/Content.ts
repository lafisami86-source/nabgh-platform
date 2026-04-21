import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Curriculum ───────────────────────────────────────────────────
export interface ICurriculumDocument extends Document {
  name: string;
  nameEn: string;
  country: string;
  description: string;
  logo?: string;
  levels: Array<{ id: string; name: string; order: number; grades: Array<{ id: string; name: string; order: number; tracks: string[] }> }>;
  isActive: boolean;
}

const CurriculumSchema = new Schema<ICurriculumDocument>({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
  logo: String,
  levels: [{
    id: String, name: String, order: Number,
    grades: [{ id: String, name: String, order: Number, tracks: [String] }],
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Subject ──────────────────────────────────────────────────────
export interface ISubjectDocument extends Document {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  curriculumId: mongoose.Types.ObjectId;
  grade: string;
  track?: string;
  unitsCount: number;
  lessonsCount: number;
  estimatedHours: number;
  order: number;
  isActive: boolean;
  isFree: boolean;
}

const SubjectSchema = new Schema<ISubjectDocument>({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, default: '📚' },
  color: { type: String, default: '#6366F1' },
  image: String,
  curriculumId: { type: Schema.Types.ObjectId, ref: 'Curriculum', required: true },
  grade: { type: String, required: true },
  track: String,
  unitsCount: { type: Number, default: 0 },
  lessonsCount: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFree: { type: Boolean, default: false },
}, { timestamps: true });

SubjectSchema.index({ curriculumId: 1, grade: 1 });

// ─── Unit ─────────────────────────────────────────────────────────
export interface IUnitDocument extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  thumbnail?: string;
  order: number;
  lessonsCount: number;
  estimatedMinutes: number;
  prerequisites: mongoose.Types.ObjectId[];
  isLocked: boolean;
  unlockCondition?: { type: string; value: unknown };
  isActive: boolean;
}

const UnitSchema = new Schema<IUnitDocument>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  order: { type: Number, default: 0 },
  lessonsCount: { type: Number, default: 0 },
  estimatedMinutes: { type: Number, default: 0 },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
  isLocked: { type: Boolean, default: false },
  unlockCondition: { type: { type: String }, value: Schema.Types.Mixed },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UnitSchema.index({ subjectId: 1, order: 1 });

// ─── Lesson ───────────────────────────────────────────────────────
export interface ILessonDocument extends Document {
  unitId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  content: {
    type: 'video' | 'interactive' | 'reading' | 'mixed';
    video?: { url: string; duration: number; provider: string; thumbnailUrl?: string };
    slides?: Array<{ order: number; type: string; title: string; content: unknown; notes?: string; duration?: number }>;
    article?: { html: string; readingTime: number };
  };
  checkpoints: Array<{
    afterSlide?: number;
    afterMinute?: number;
    question: {
      type: string; text: string; image?: string;
      options?: Array<{ text: string; isCorrect: boolean; feedback?: string }>;
      correctAnswer?: unknown; explanation?: string;
    };
  }>;
  resources: Array<{ title: string; type: string; url: string; size?: number }>;
  summary: { text: string; keyPoints: string[] };
  flashcards: Array<{ front: string; back: string; image?: string }>;
  prerequisites: mongoose.Types.ObjectId[];
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  estimatedMinutes: number;
  order: number;
  tags: string[];
  grade: string;
  stats: { views: number; completions: number; avgRating: number; ratingsCount: number };
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date;
}

const LessonSchema = new Schema<ILessonDocument>({
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  objectives: [String],
  content: {
    type: { type: String, enum: ['video', 'interactive', 'reading', 'mixed'], default: 'mixed' },
    video: { url: String, duration: Number, provider: String, thumbnailUrl: String },
    slides: [{ order: Number, type: String, title: String, content: Schema.Types.Mixed, notes: String, duration: Number }],
    article: { html: String, readingTime: Number },
  },
  checkpoints: [{
    afterSlide: Number, afterMinute: Number,
    question: {
      type: String, text: String, image: String,
      options: [{ text: String, isCorrect: Boolean, feedback: String }],
      correctAnswer: Schema.Types.Mixed, explanation: String,
    },
  }],
  resources: [{ title: String, type: String, url: String, size: Number }],
  summary: { text: String, keyPoints: [String] },
  flashcards: [{ front: String, back: String, image: String }],
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  xpReward: { type: Number, default: 50 },
  estimatedMinutes: { type: Number, default: 15 },
  order: { type: Number, default: 0 },
  tags: [String],
  grade: String,
  stats: { views: { type: Number, default: 0 }, completions: { type: Number, default: 0 }, avgRating: { type: Number, default: 0 }, ratingsCount: { type: Number, default: 0 } },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true });

LessonSchema.index({ unitId: 1, order: 1 });
LessonSchema.index({ slug: 1 });
LessonSchema.index({ tags: 1 });

// ─── Exercise ─────────────────────────────────────────────────────
export interface IExerciseDocument extends Document {
  lessonId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'practice' | 'homework' | 'quiz' | 'exam' | 'placement';
  questions: Array<{
    _id: mongoose.Types.ObjectId;
    order: number;
    type: string;
    text: string;
    richText?: string;
    image?: string;
    audio?: string;
    options?: Array<{ _id: mongoose.Types.ObjectId; text: string; image?: string; isCorrect: boolean; feedback?: string }>;
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
    difficulty: string;
    skill?: string;
    tags: string[];
  }>;
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showExplanation: string;
    allowRetry: boolean;
    maxAttempts: number;
    timeLimit: number;
    passingScore: number;
    showResults: boolean;
    showCorrectAnswers: boolean;
    penaltyForWrong: number;
    bonusForSpeed: boolean;
  };
  xpReward: { completion: number; perfect: number; speed: number };
  deadline?: Date;
  assignedTo: mongoose.Types.ObjectId[];
  assignedToClass?: string;
  stats: { attempts: number; avgScore: number; highestScore: number; completionRate: number };
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const ExerciseSchema = new Schema<IExerciseDocument>({
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['practice', 'homework', 'quiz', 'exam', 'placement'], default: 'practice' },
  questions: [{
    order: Number,
    type: { type: String, required: true },
    text: { type: String, required: true },
    richText: String,
    image: String,
    audio: String,
    options: [{ text: String, image: String, isCorrect: Boolean, feedback: String }],
    correctBoolean: Boolean,
    correction: String,
    blanks: [{ position: Number, acceptedAnswers: [String], caseSensitive: Boolean }],
    pairs: [{ left: { text: String, image: String }, right: { text: String, image: String } }],
    items: [{ text: String, correctOrder: Number }],
    acceptedAnswers: [String],
    rubric: [{ criteria: String, maxPoints: Number, description: String }],
    wordLimit: { min: Number, max: Number },
    language: String,
    codeTemplate: String,
    solution: String,
    testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
    explanation: String,
    hint: String,
    hint2: String,
    points: { type: Number, default: 10 },
    difficulty: { type: String, default: 'medium' },
    skill: String,
    tags: [String],
  }],
  settings: {
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    showExplanation: { type: String, default: 'immediately' },
    allowRetry: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
    timeLimit: { type: Number, default: 0 },
    passingScore: { type: Number, default: 60 },
    showResults: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    penaltyForWrong: { type: Number, default: 0 },
    bonusForSpeed: { type: Boolean, default: false },
  },
  xpReward: {
    completion: { type: Number, default: 100 },
    perfect: { type: Number, default: 50 },
    speed: { type: Number, default: 25 },
  },
  deadline: Date,
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedToClass: String,
  stats: { attempts: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 }, highestScore: { type: Number, default: 0 }, completionRate: { type: Number, default: 0 } },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ExerciseSchema.index({ lessonId: 1 });
ExerciseSchema.index({ subjectId: 1 });

// ─── Exports ──────────────────────────────────────────────────────
export const Curriculum: Model<ICurriculumDocument> =
  mongoose.models.Curriculum || mongoose.model('Curriculum', CurriculumSchema);
export const Subject: Model<ISubjectDocument> =
  mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const Unit: Model<IUnitDocument> =
  mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
export const Lesson: Model<ILessonDocument> =
  mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
export const Exercise: Model<IExerciseDocument> =
  mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
