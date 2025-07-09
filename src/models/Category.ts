import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  _id: string
  name: string
  description?: string
  slug: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String
  },
  parentId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: String
  }
}, {
  timestamps: true,
  collection: 'Category'
})

// Create indexes
CategorySchema.index({ slug: 1 })
CategorySchema.index({ isActive: 1 })
CategorySchema.index({ sortOrder: 1 })
CategorySchema.index({ parentId: 1 })

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
