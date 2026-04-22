import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  profile: {
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
  };
  studentInfo?: {
    educationLevel: string;
    grade: string;
    curriculum: string;
    track?: string;
    school?: string;
    subjects: mongoose.Types.ObjectId[];
    learningStyle?: string;
    dailyGoalMinutes: number;
    parentId?: mongoose.Types.ObjectId;
  };
  teacherInfo?: {
    specialization: string[];
    subjects: string[];
    grades: string[];
    experience?: number;
    rating: { average: number; count: number };
    verified: boolean;
  };
  parentInfo?: { children: mongoose.Types.ObjectId[] };
  gamification: {
    xp: number;
    level: number;
    streak: { current: number; longest: number; lastActiveDate?: Date; freezesRemaining: number };
    badges: Array<{ badgeId: string; earnedAt: Date }>;
    totalLessonsCompleted: number;
    totalExercisesSolved: number;
    totalTimeMinutes: number;
    accuracy: number;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    notifications: { email: boolean; push: boolean; dailyReminder: boolean; reminderTime: string; weeklyReport: boolean; achievements: boolean };
  };
  subscription: { plan: 'free' | 'basic' | 'premium' | 'school'; status: 'active' | 'expired' | 'cancelled'; startDate?: Date; endDate?: Date; autoRenew: boolean };
  onboardingCompleted: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  comparePassword(pw: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], required: true },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      displayName: String,
      avatar: String,
      dateOfBirth: Date,
      gender: { type: String, enum: ['male', 'female'] },
      phone: String,
      country: { type: String, default: 'SA' },
      city: String,
      bio: String,
    },
    studentInfo: {
      educationLevel: String,
      grade: String,
      curriculum: String,
      track: String,
      school: String,
      subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
      learningStyle: String,
      dailyGoalMinutes: { type: Number, default: 30 },
      parentId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    teacherInfo: {
      specialization: [String],
      subjects: [String],
      grades: [String],
      experience: Number,
      rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      verified: { type: Boolean, default: false },
    },
    parentInfo: { children: [{ type: Schema.Types.ObjectId, ref: 'User' }] },
    gamification: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: { current: { type: Number, default: 0 }, longest: { type: Number, default: 0 }, lastActiveDate: Date, freezesRemaining: { type: Number, default: 1 } },
      badges: [{ badgeId: String, earnedAt: { type: Date, default: Date.now } }],
      totalLessonsCompleted: { type: Number, default: 0 },
      totalExercisesSolved: { type: Number, default: 0 },
      totalTimeMinutes: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
    },
    preferences: {
      language: { type: String, default: 'ar' },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        dailyReminder: { type: Boolean, default: true },
        reminderTime: { type: String, default: '16:00' },
        weeklyReport: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
      },
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'school'], default: 'free' },
      status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
      startDate: Date,
      endDate: Date,
      autoRenew: { type: Boolean, default: false },
    },
    onboardingCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ 'gamification.xp': -1 });

UserSchema.pre('save', async function (next: (err?: Error) => void) {
  if (this.isModified('password') && this.password && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (!this.profile.displayName) {
    this.profile.displayName = `${this.profile.firstName} ${this.profile.lastName}`;
  }
  next();
});

UserSchema.methods.comparePassword = async function (pw: string) {
  return bcrypt.compare(pw, this.password ?? '');
};

export const LEVEL_THRESHOLDS = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000];
export const LEVEL_NAMES = ['مبتدئ', 'متعلم', 'دارس', 'متقدم', 'متميز', 'نابغة', 'عبقري', 'أسطورة'];
export const LEVEL_ICONS = ['🌱', '🌿', '🌳', '⭐', '🌟', '👑', '💎', '🏆'];

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export default User;
