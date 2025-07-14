export const runtime = 'nodejs';

import mongoose from 'mongoose';

/**
 * Session schema for user sessions
 */
const SessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expires: Date,
  sessionToken: { 
    type: String,
    unique: true
  },
}, { timestamps: true });

// Create index on sessionToken for faster lookups
SessionSchema.index({ sessionToken: 1 });

// Create index on userId for faster lookups
SessionSchema.index({ userId: 1 });

// Create index on expires for cleanup jobs
SessionSchema.index({ expires: 1 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
