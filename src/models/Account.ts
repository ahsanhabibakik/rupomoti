import mongoose from 'mongoose';

/**
 * Account schema for OAuth accounts linked to a user
 */
const AccountSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
}, { timestamps: true });

// Create a compound index on provider and providerAccountId
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

// Create an index on userId for faster lookups
AccountSchema.index({ userId: 1 });

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);
