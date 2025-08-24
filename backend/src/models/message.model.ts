import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitorMessage extends Document {
  username: string;
  content: string;
  createdAt: Date;
}

const visitorMessageSchema = new Schema<IVisitorMessage>({
  username: { type: String, required: true },
  content: { type: String, required: true, maxlength: 60 },
  createdAt: { type: Date, default: Date.now },
});

export const VisitorMessage = mongoose.model<IVisitorMessage>('VisitorMessage', visitorMessageSchema);
