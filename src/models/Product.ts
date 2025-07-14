import { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  categoryId: mongoose.Types.ObjectId
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

export function getProductModel() {
  const mongoose = require('mongoose');
  
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
      type: Schema.Types.ObjectId,
      ref: 'Category',
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

  // Virtual fields (computed properties)
  ProductSchema.virtual('finalPrice').get(function() {
    return this.discountPrice || this.price
  })

  ProductSchema.virtual('discountPercentage').get(function() {
    if (!this.discountPrice) return 0
    return Math.round(((this.price - this.discountPrice) / this.price) * 100)
  })

  ProductSchema.virtual('isOnSale').get(function() {
    return this.discountPrice && this.discountPrice < this.price
  })

  ProductSchema.virtual('isInStock').get(function() {
    return this.stock > 0
  })

  ProductSchema.virtual('isLowStock').get(function() {
    return this.stock > 0 && this.stock <= 5
  })

  // Virtual for category population
  ProductSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
    justOne: true
  })

  // Instance methods
  ProductSchema.methods.updateStock = function(quantity: number) {
    this.stock = Math.max(0, this.stock + quantity)
    return this.save()
  }

  ProductSchema.methods.applyDiscount = function(percentage: number) {
    this.discountPrice = Math.round(this.price * (1 - percentage / 100))
    return this.save()
  }

  ProductSchema.methods.removeDiscount = function() {
    this.discountPrice = undefined
    return this.save()
  }

  // Static methods
  ProductSchema.statics.findByCategory = function(categoryId: string) {
    return this.find({ categoryId, status: 'ACTIVE' })
  }

  ProductSchema.statics.findFeatured = function(limit = 12) {
    return this.find({ isFeatured: true, status: 'ACTIVE' }).limit(limit)
  }

  ProductSchema.statics.findPopular = function(limit = 12) {
    return this.find({ isPopular: true, status: 'ACTIVE' }).limit(limit)
  }

  ProductSchema.statics.findOnSale = function(limit = 12) {
    return this.find({ 
      discountPrice: { $exists: true, $gt: 0 }, 
      status: 'ACTIVE' 
    }).limit(limit)
  }

  ProductSchema.statics.searchProducts = function(query: string) {
    return this.find({
      $and: [
        { status: 'ACTIVE' },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
            { 'seo.keywords': { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
  }

  // Pre-save middleware
  ProductSchema.pre('save', function(this: IProduct, next) {
    // Auto-generate SKU if not provided
    if (!this.sku && this.name) {
      this.sku = this.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) + '-' + Date.now().toString().slice(-4)
    }
    
    // Ensure discount price is not higher than regular price
    if (this.discountPrice && this.discountPrice >= this.price) {
      this.discountPrice = undefined
    }
    
    next()
  })

  // Post-save middleware for logging
  ProductSchema.post('save', function(this: IProduct, doc) {
    console.log(`Product saved: ${doc.name} (${doc._id})`)
  })

  // Ensure virtuals are included when converting to JSON
  ProductSchema.set('toJSON', { virtuals: true })
  ProductSchema.set('toObject', { virtuals: true })

  return mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
}
