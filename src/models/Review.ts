import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userId?: string;
  anonymousToken?: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatorId?: string;
  moderatedAt?: Date;
  moderationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
  },
  anonymousToken: {
    type: String,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    maxlength: 100,
  },
  comment: {
    type: String,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  moderatorId: {
    type: String,
  },
  moderatedAt: {
    type: Date,
  },
  moderationNote: {
    type: String,
  },
}, {
  timestamps: true,
});

// Ensure either userId or anonymousToken is present, but not both
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
ReviewSchema.index({ productId: 1, anonymousToken: 1 }, { unique: true, partialFilterExpression: { anonymousToken: { $exists: true } } });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);