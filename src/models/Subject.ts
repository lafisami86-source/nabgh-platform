import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
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
  branches: string[];
  unitsCount: number;
  lessonsCount: number;
  estimatedHours: number;
  order: number;
  isActive: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#6366F1' },
    image: String,
    curriculumId: { type: Schema.Types.ObjectId, ref: 'Curriculum' },
    grade: { type: String, required: true },
    track: String,
    branches: [String],
    unitsCount: { type: Number, default: 0 },
    lessonsCount: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubjectSchema.index({ curriculumId: 1, grade: 1 });
SubjectSchema.index({ slug: 1 });

const Subject: Model<ISubject> = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;
