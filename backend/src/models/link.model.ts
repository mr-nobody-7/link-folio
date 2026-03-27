import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILink extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  isTemporary?: boolean;
  expiresAt?: Date;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
    },
    isTemporary: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

linkSchema.index({ expiresAt: 1 }, { sparse: true });

export const Link = mongoose.model<ILink>('Link', linkSchema);
