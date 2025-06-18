import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: string;
  views?: number;
  joinedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: '',
  },
  theme: {
    type: String,
    trim: true,
    default: 'default',
  },
  views: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
