import mongoose, { Schema, Document } from 'mongoose'

export interface ISettings extends Document {
  _id: string
  id: string
  key: string
  value: any
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY'
  category: 'GENERAL' | 'PAYMENT' | 'SHIPPING' | 'EMAIL' | 'SEO' | 'SOCIAL' | 'ANALYTICS'
  description?: string
  isPublic: boolean
  isEditable: boolean
  createdAt: Date
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettings>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY'],
    required: true
  },
  category: {
    type: String,
    enum: ['GENERAL', 'PAYMENT', 'SHIPPING', 'EMAIL', 'SEO', 'SOCIAL', 'ANALYTICS'],
    default: 'GENERAL'
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'Settings'
})

// Virtual field for ID
SettingsSchema.virtual('id').get(function() {
  return this._id.toString()
})

// Static methods
SettingsSchema.statics.getSetting = function(key: string) {
  return this.findOne({ key })
}

SettingsSchema.statics.getPublicSettings = function() {
  return this.find({ isPublic: true })
}

SettingsSchema.statics.getSettingsByCategory = function(category: string) {
  return this.find({ category })
}

SettingsSchema.statics.updateSetting = function(key: string, value: any) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedAt: new Date() },
    { new: true, upsert: true }
  )
}

// Indexes
SettingsSchema.index({ key: 1 }, { unique: true })
SettingsSchema.index({ category: 1 })
SettingsSchema.index({ isPublic: 1 })

// Ensure virtuals are included when converting to JSON
SettingsSchema.set('toJSON', { virtuals: true })
SettingsSchema.set('toObject', { virtuals: true })

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)
