import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Notification ───────────────────────────────────────────────
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'achievement' | 'badge' | 'streak' | 'reminder' | 'challenge' | 'message' | 'progress' | 'system' | 'social' | 'parent-report';
  title: string;
  body: string;
  icon?: string;
  image?: string;
  action?: { type: 'navigate' | 'open-url' | 'none'; target?: string };
  data?: any;
  channels: string[];
  isRead: boolean;
  readAt?: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['achievement','badge','streak','reminder','challenge','message','progress','system','social','parent-report'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    icon: String,
    image: String,
    action: { type: { type: String, enum: ['navigate','open-url','none'] }, target: String },
    data: Schema.Types.Mixed,
    channels: [String],
    isRead: { type: Boolean, default: false },
    readAt: Date,
    scheduledFor: Date,
    sentAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

// ─── ChatHistory ─────────────────────────────────────────────────
export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  context?: {
    subjectId?: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    topic?: string;
    grade?: string;
  };
  messages: Array<{
    _id?: mongoose.Types.ObjectId;
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: Array<{ type: 'image' | 'file' | 'voice'; url: string; name?: string }>;
    metadata?: { tokensUsed?: number; model?: string; responseTime?: number };
    timestamp: Date;
  }>;
  tokensUsed: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'محادثة جديدة' },
    context: {
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
      lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
      topic: String,
      grade: String,
    },
    messages: [{
      role: { type: String, enum: ['user','assistant','system'], required: true },
      content: { type: String, required: true },
      attachments: [{ type: { type: String, enum: ['image','file','voice'] }, url: String, name: String }],
      metadata: { tokensUsed: Number, model: String, responseTime: Number },
      timestamp: { type: Date, default: Date.now },
    }],
    tokensUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChatHistorySchema.index({ userId: 1, createdAt: -1 });

export const ChatHistory: Model<IChatHistory> = mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
