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

// Primary profile-page query path: list links for a user in display order.
linkSchema.index({ userId: 1, order: 1 });

// Public profile path with enabled filter and stable ordering.
linkSchema.index({ userId: 1, enabled: 1, order: 1 });

// Supports expiration job scans for temporary, still-enabled links.
linkSchema.index({ isTemporary: 1, enabled: 1, expiresAt: 1 }, { sparse: true });

// Supports top-clicked link sorting per user.
linkSchema.index({ userId: 1, clicks: -1 });

export const Link = mongoose.model<ILink>('Link', linkSchema);
