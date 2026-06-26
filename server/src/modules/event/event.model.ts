import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  publicId?: string; // Cloudinary public ID for deletion
  originalName?: string;
  size?: number;
}

export interface ITargetAudience {
  type: 'school' | 'classes' | 'sections';
  classes?: string[];
  sections?: string[];
}

export interface IEventDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  eventDate: Date;
  targetAudience: ITargetAudience;
  media: IMediaItem[];
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema<IMediaItem>(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    thumbnail: { type: String },
    publicId: { type: String },
    originalName: { type: String },
    size: { type: Number },
  },
  { _id: true }
);

const targetAudienceSchema = new Schema<ITargetAudience>(
  {
    type: {
      type: String,
      enum: ['school', 'classes', 'sections'],
      required: true,
    },
    classes: { type: [String], default: [] },
    sections: { type: [String], default: [] },
  },
  { _id: false }
);

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    targetAudience: {
      type: targetAudienceSchema,
      required: true,
    },
    media: {
      type: [mediaItemSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ isPublished: 1, eventDate: -1 });
eventSchema.index({ 'targetAudience.type': 1 });

export const Event = mongoose.model<IEventDocument>('Event', eventSchema);
