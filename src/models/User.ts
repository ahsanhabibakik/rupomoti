import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name?: string
  email: string
  phone?: string
  emailVerified?: Date
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isAdmin: boolean
  isFlagged: boolean
  
  // Two-Factor Authentication fields
  twoFactorEnabled?: boolean
  twoFactorMethod?: string
  twoFactorSecret?: string
  twoFactorCode?: string
  twoFactorCodeExpires?: Date
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  emailVerified: {
    type: Date
  },
  image: {
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'USER'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  // Two-Factor Authentication fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorMethod: {
    type: String
  },
  twoFactorSecret: {
    type: String
  },
  twoFactorCode: {
    type: String
  },
  twoFactorCodeExpires: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'User'
})

// Create indexes (email index is already created by unique: true)
UserSchema.index({ role: 1 })
UserSchema.index({ isAdmin: 1 })
UserSchema.index({ createdAt: -1 })

// Instance methods
UserSchema.methods.isAdminUser = function() {
  return this.role === 'ADMIN' || this.role === 'SUPER_ADMIN' || this.isAdmin
}

UserSchema.methods.isSuperAdmin = function() {
  return this.role === 'SUPER_ADMIN'
}

UserSchema.methods.canManageUsers = function() {
  return this.role === 'SUPER_ADMIN'
}

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

UserSchema.statics.findAdmins = function() {
  return this.find({ 
    $or: [
      { role: 'ADMIN' },
      { role: 'SUPER_ADMIN' },
      { isAdmin: true }
    ]
  })
}

// Virtual fields
UserSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0]
})

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
