import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUnit extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  thumbnail?: string;
  order: number;
  lessonsCount: number;
  estimatedMinutes: number;
  prerequisites: mongoose.Types.ObjectId[];
  isLocked: boolean;
  unlockCondition: {
    type: 'previous_unit' | 'xp_threshold' | 'date' | 'none';
    value?: any;
  };
  isActive: boolean;
  createdAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    order: { type: Number, default: 0 },
    lessonsCount: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 60 },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    isLocked: { type: Boolean, default: false },
    unlockCondition: {
      type: { type: String, enum: ['previous_unit', 'xp_threshold', 'date', 'none'], default: 'none' },
      value: Schema.Types.Mixed,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UnitSchema.index({ subjectId: 1, order: 1 });

const Unit: Model<IUnit> = mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);
export default Unit;
