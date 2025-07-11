import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  _id: string
  id: string
  code: string
  name: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumOrderValue?: number
  maximumDiscountAmount?: number
  usageLimit?: number
  usageCount: number
  userUsageLimit?: number
  isActive: boolean
  startsAt: Date
  expiresAt: Date
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludedCategories?: string[]
  excludedProducts?: string[]
  createdAt: Date
  updatedAt: Date
  
  // Instance methods
  isValid(): boolean
  canBeUsed(orderValue?: number): boolean
  getDiscountAmount(orderValue: number): number
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderValue: {
    type: Number,
    min: 0,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 0
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    min: 0,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startsAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  applicableCategories: [{
    type: String,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: String,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: String,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: String,
    ref: 'Product'
  }]
}, {
  timestamps: true,
  collection: 'Coupon'
})

// Virtual field for ID
CouponSchema.virtual('id').get(function() {
  return this._id.toString()
})

// Instance methods
CouponSchema.methods.isValid = function(): boolean {
  const now = new Date()
  return this.isActive && 
         now >= this.startsAt && 
         now <= this.expiresAt &&
         (!this.usageLimit || this.usageCount < this.usageLimit)
}

CouponSchema.methods.canBeUsed = function(orderValue?: number): boolean {
  if (!this.isValid()) return false
  if (orderValue && this.minimumOrderValue && orderValue < this.minimumOrderValue) {
    return false
  }
  return true
}

CouponSchema.methods.getDiscountAmount = function(orderValue: number): number {
  if (!this.canBeUsed(orderValue)) return 0
  
  let discount = 0
  
  switch (this.type) {
    case 'PERCENTAGE':
      discount = (orderValue * this.value) / 100
      if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
        discount = this.maximumDiscountAmount
      }
      break
    case 'FIXED_AMOUNT':
      discount = Math.min(this.value, orderValue)
      break
    case 'FREE_SHIPPING':
      // This should be handled separately in shipping calculation
      discount = 0
      break
  }
  
  return discount
}

// Static methods
CouponSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase(), isActive: true })
}

CouponSchema.statics.getActiveCoupons = function() {
  const now = new Date()
  return this.find({
    isActive: true,
    startsAt: { $lte: now },
    expiresAt: { $gte: now }
  })
}

CouponSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        expired: { 
          $sum: { 
            $cond: [
              { $lt: ['$expiresAt', new Date()] }, 
              1, 0
            ] 
          } 
        },
        totalUsage: { $sum: '$usageCount' }
      }
    }
  ])
}

// Indexes
CouponSchema.index({ code: 1 }, { unique: true })
CouponSchema.index({ isActive: 1 })
CouponSchema.index({ startsAt: 1, expiresAt: 1 })
CouponSchema.index({ type: 1 })

// Ensure virtuals are included when converting to JSON
CouponSchema.set('toJSON', { virtuals: true })
CouponSchema.set('toObject', { virtuals: true })

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
