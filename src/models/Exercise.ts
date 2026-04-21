import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuestionType =
  | 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching'
  | 'ordering' | 'short-answer' | 'essay' | 'drag-drop' | 'hotspot'
  | 'audio' | 'code';

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  order: number;
  type: QuestionType;
  text: string;
  richText?: string;
  image?: string;
  audio?: string;
  video?: string;
  // Multiple Choice
  options?: Array<{ _id?: mongoose.Types.ObjectId; text: string; image?: string; isCorrect: boolean; feedback?: string }>;
  // True/False
  correctBoolean?: boolean;
  correction?: string;
  // Fill Blank
  blanks?: Array<{ position: number; acceptedAnswers: string[]; caseSensitive: boolean }>;
  // Matching
  pairs?: Array<{ left: { text: string; image?: string }; right: { text: string; image?: string } }>;
  // Ordering
  items?: Array<{ text: string; correctOrder: number }>;
  // Short Answer
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  // Essay
  rubric?: Array<{ criteria: string; maxPoints: number; description: string }>;
  wordLimit?: { min?: number; max?: number };
  // Code
  language?: string;
  codeTemplate?: string;
  solution?: string;
  testCases?: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  // Hotspot
  hotspotImage?: string;
  hotspotAreas?: Array<{ shape: 'circle' | 'rect'; coords: number[]; isCorrect: boolean; label?: string }>;
  // Common
  explanation?: string;
  explanationImage?: string;
  explanationVideo?: string;
  hint?: string;
  hint2?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  skill?: string;
  tags?: string[];
  adaptiveRules?: {
    onCorrect: 'next' | 'harder' | 'skip';
    onWrong: 'hint' | 'easier' | 'explain' | 'retry';
    maxAttempts: number;
  };
}

export interface IExercise extends Document {
  lessonId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'practice' | 'homework' | 'quiz' | 'exam' | 'placement';
  questions: IQuestion[];
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showExplanation: 'immediately' | 'after-submit' | 'after-deadline' | 'never';
    allowRetry: boolean;
    maxAttempts: number;
    timeLimit: number; // minutes, 0 = unlimited
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
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  order: { type: Number, default: 0 },
  type: { type: String, enum: ['multiple-choice','true-false','fill-blank','matching','ordering','short-answer','essay','drag-drop','hotspot','audio','code'], required: true },
  text: { type: String, required: true },
  richText: String, image: String, audio: String, video: String,
  options: [{ text: String, image: String, isCorrect: Boolean, feedback: String }],
  correctBoolean: Boolean, correction: String,
  blanks: [{ position: Number, acceptedAnswers: [String], caseSensitive: Boolean }],
  pairs: [{ left: { text: String, image: String }, right: { text: String, image: String } }],
  items: [{ text: String, correctOrder: Number }],
  acceptedAnswers: [String], caseSensitive: Boolean,
  rubric: [{ criteria: String, maxPoints: Number, description: String }],
  wordLimit: { min: Number, max: Number },
  language: String, codeTemplate: String, solution: String,
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
  hotspotImage: String,
  hotspotAreas: [{ shape: String, coords: [Number], isCorrect: Boolean, label: String }],
  explanation: String, explanationImage: String, explanationVideo: String,
  hint: String, hint2: String,
  points: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  skill: String, tags: [String],
  adaptiveRules: {
    onCorrect: { type: String, enum: ['next','harder','skip'], default: 'next' },
    onWrong: { type: String, enum: ['hint','easier','explain','retry'], default: 'hint' },
    maxAttempts: { type: Number, default: 3 },
  },
});

const ExerciseSchema = new Schema<IExercise>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['practice','homework','quiz','exam','placement'], default: 'practice' },
    questions: [QuestionSchema],
    settings: {
      shuffleQuestions: { type: Boolean, default: true },
      shuffleOptions: { type: Boolean, default: true },
      showExplanation: { type: String, enum: ['immediately','after-submit','after-deadline','never'], default: 'immediately' },
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
    stats: {
      attempts: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
    },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ExerciseSchema.index({ lessonId: 1 });
ExerciseSchema.index({ subjectId: 1 });

const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);
export default Exercise;
