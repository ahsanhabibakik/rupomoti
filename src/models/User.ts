export const runtime = 'nodejs';

import { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  id: string
  name?: string
  email: string
  phone?: string
  emailVerified?: Date
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER'
  isAdmin: boolean
  isFlagged: boolean
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  isActive: boolean
  lastLogin?: Date
  twoFactorEnabled?: boolean
  twoFactorMethod?: string
  twoFactorSecret?: string
  twoFactorCode?: string
  twoFactorCodeExpires?: Date
  getDisplayName(): string
  isVerified(): boolean
  hasRole(role: string): boolean
}

export function getUserModel() {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const UserSchema = new Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'], default: 'USER' },
    isAdmin: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zipCode: { type: String, default: null },
    country: { type: String, default: 'Bangladesh' },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String },
    twoFactorSecret: { type: String },
    twoFactorCode: { type: String },
    twoFactorCodeExpires: { type: Date }
  }, {
    timestamps: true,
    collection: 'User'
  });

  UserSchema.index({ email: 1 });
  UserSchema.index({ role: 1 });
  UserSchema.index({ isAdmin: 1 });
  UserSchema.index({ createdAt: -1 });
  UserSchema.virtual('id').get(function() { return this._id.toString() });
  UserSchema.methods.getDisplayName = function() { return this.name || this.email.split('@')[0] };
  UserSchema.methods.isVerified = function() { return !!this.emailVerified };
  UserSchema.methods.hasRole = function(role) { return this.role === role || (role === 'ADMIN' && this.isAdmin) };
  UserSchema.methods.isAdminUser = function() { return this.role === 'ADMIN' || this.role === 'SUPER_ADMIN' || this.role === 'MANAGER' || this.isAdmin };
  UserSchema.methods.isSuperAdmin = function() { return this.role === 'SUPER_ADMIN' };
  UserSchema.methods.canManageUsers = function() { return this.role === 'SUPER_ADMIN' || this.role === 'MANAGER' };
  UserSchema.statics.findByEmail = function(email) { return this.findOne({ email: email.toLowerCase() }) };
  UserSchema.statics.findAdmins = function() { return this.find({ $or: [ { role: 'ADMIN' }, { role: 'SUPER_ADMIN' }, { isAdmin: true } ] }) };
  UserSchema.virtual('displayName').get(function() { return this.name || this.email.split('@')[0] });
  UserSchema.set('toJSON', { virtuals: true });
  UserSchema.set('toObject', { virtuals: true });
  UserSchema.statics.getStats = function() { return this.aggregate([ { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } }, verified: { $sum: { $cond: ['$emailVerified', 1, 0] } }, admins: { $sum: { $cond: [{ $in: ['$role', ['ADMIN', 'SUPER_ADMIN', 'MANAGER']] }, 1, 0] } } } } ]) };
  UserSchema.set('toJSON', { virtuals: true });
  UserSchema.set('toObject', { virtuals: true });

  return mongoose.models.User || mongoose.model('User', UserSchema);
}
