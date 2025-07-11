import mongoose from 'mongoose';

/**
 * VerificationToken schema for email verification and password reset
 */
const VerificationTokenSchema = new mongoose.Schema({
  identifier: String,
  token: { 
    type: String,
    unique: true
  },
  expires: Date,
}, { timestamps: true });

// Create a compound index on identifier and token
VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

// Create index on expires for cleanup jobs
VerificationTokenSchema.index({ expires: 1 });

export default mongoose.models.VerificationToken || 
  mongoose.model('VerificationToken', VerificationTokenSchema);
