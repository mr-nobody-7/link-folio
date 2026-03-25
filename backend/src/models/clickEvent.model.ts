import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClickEvent extends Document {
  linkId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  referrer?: string;
  createdAt: Date;
}

const clickEventSchema = new Schema<IClickEvent>({
  linkId: {
    type: Schema.Types.ObjectId,
    ref: 'Link',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  referrer: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

clickEventSchema.index({ linkId: 1, createdAt: -1 });
clickEventSchema.index({ userId: 1, createdAt: -1 });
clickEventSchema.index({ username: 1, createdAt: -1 });

export const ClickEvent = mongoose.model<IClickEvent>('ClickEvent', clickEventSchema);
