import mongoose, { Schema, Document } from 'mongoose'

export interface IMedia extends Document {
  _id: string
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  section: 'HERO_SLIDER' | 'LOGO' | 'BANNER' | 'PRODUCT' | 'CATEGORY' | 'GENERAL'
  isActive: boolean
  altText?: string
  caption?: string
  description?: string
  tags?: string[]
  sortOrder?: number
  uploadedBy?: string
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
  
  // Instance methods
  getFileExtension(): string
  isImage(): boolean
  getDisplayUrl(): string
}

const MediaSchema = new Schema<IMedia>({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  section: {
    type: String,
    enum: ['HERO_SLIDER', 'LOGO', 'BANNER', 'PRODUCT', 'CATEGORY', 'GENERAL'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  altText: {
    type: String,
    trim: true
  },
  caption: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Media'
})

// Virtual field for ID
MediaSchema.virtual('id').get(function() {
  return this._id.toString()
})

// Instance methods
MediaSchema.methods.getFileExtension = function(): string {
  return this.filename.split('.').pop()?.toLowerCase() || ''
}

MediaSchema.methods.isImage = function(): boolean {
  return this.mimeType.startsWith('image/')
}

MediaSchema.methods.getDisplayUrl = function(): string {
  return this.url
}

// Static methods
MediaSchema.statics.findBySection = function(section: string) {
  return this.find({ section, isActive: true }).sort({ sortOrder: 1, createdAt: -1 })
}

MediaSchema.statics.findActiveImages = function() {
  return this.find({ 
    isActive: true, 
    mimeType: { $regex: '^image/' } 
  }).sort({ createdAt: -1 })
}

MediaSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$section',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ])
}

// Indexes
MediaSchema.index({ section: 1, isActive: 1 })
MediaSchema.index({ filename: 1 })
MediaSchema.index({ mimeType: 1 })
MediaSchema.index({ uploadedAt: -1 })
MediaSchema.index({ sortOrder: 1 })

// Ensure virtuals are included when converting to JSON
MediaSchema.set('toJSON', { virtuals: true })
MediaSchema.set('toObject', { virtuals: true })

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)

export function getMediaModel() {
  return mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)
}
