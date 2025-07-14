import { Schema, Document } from 'mongoose'

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

export function getCategoryModel() {
  const mongoose = require('mongoose');
  
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

  // Virtual fields
  CategorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId',
    count: true,
    match: { status: 'ACTIVE' }
  })

  CategorySchema.virtual('hasProducts').get(function() {
    return this.productCount > 0
  })

  CategorySchema.virtual('displayName').get(function() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1)
  })

  // Instance methods
  CategorySchema.methods.getProducts = function(limit = 12) {
    return mongoose.model('Product').find({ 
      categoryId: this._id.toString(), 
      status: 'ACTIVE' 
    }).limit(limit)
  }

  CategorySchema.methods.toggleActive = function() {
    this.isActive = !this.isActive
    return this.save()
  }

  CategorySchema.methods.updateSortOrder = function(newOrder: number) {
    this.sortOrder = newOrder
    return this.save()
  }

  // Static methods
  CategorySchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
  }

  CategorySchema.statics.findBySlug = function(slug: string) {
    return this.findOne({ slug, isActive: true })
  }

  CategorySchema.statics.findWithProducts = function() {
    return this.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'Product',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products',
          pipeline: [
            { $match: { status: 'ACTIVE' } },
            { $count: 'count' }
          ]
        }
      },
      {
        $addFields: {
          productCount: { $ifNull: [{ $arrayElemAt: ['$products.count', 0] }, 0] }
        }
      },
      { $project: { products: 0 } },
      { $sort: { sortOrder: 1, name: 1 } }
    ])
  }

  // Pre-save middleware
  CategorySchema.pre('save', function(next) {
    // Auto-generate slug if not provided
    if (!this.slug && this.name) {
      this.slug = this.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    // Ensure slug is unique (basic check)
    if (this.isNew || this.isModified('slug')) {
      const timestamp = Date.now().toString().slice(-3)
      if (this.slug.length < 3) {
        this.slug = `category-${timestamp}`
      }
    }
    
    next()
  })

  // Pre-remove middleware (if using remove operations)
  CategorySchema.pre('deleteOne', { document: true, query: false }, async function() {
    // Check if category has products
    const productCount = await mongoose.model('Product').countDocuments({ 
      categoryId: this._id.toString() 
    })
    
    if (productCount > 0) {
      throw new Error(`Cannot delete category "${this.name}" as it contains ${productCount} products`)
    }
  })

  // Post-save middleware
  CategorySchema.post('save', function(doc) {
    console.log(`Category saved: ${doc.name} (${doc.slug})`)
  })

  // Ensure virtuals are included when converting to JSON
  CategorySchema.set('toJSON', { virtuals: true })
  CategorySchema.set('toObject', { virtuals: true })

  return mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
}
