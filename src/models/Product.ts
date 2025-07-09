import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  categoryId: string
  images: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  isFeatured: boolean
  isPopular: boolean
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  materials?: string[]
  colors?: string[]
  sizes?: string[]
  tags?: string[]
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  categoryId: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
    default: 'ACTIVE'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  materials: [String],
  colors: [String],
  sizes: [String],
  tags: [String],
  seo: {
    title: String,
    description: String,
    keywords: String
  }
}, {
  timestamps: true,
  collection: 'Product'
})

// Create indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', 'seo.keywords': 'text' })
ProductSchema.index({ categoryId: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ isFeatured: 1 })
ProductSchema.index({ isPopular: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
