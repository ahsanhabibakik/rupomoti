import mongoose, { Schema, Document } from 'mongoose'

export interface IWishlistItem extends Document {
  _id: string
  userId: string
  productId: string
  createdAt: Date
  updatedAt: Date
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  }
}, {
  timestamps: true,
  collection: 'WishlistItem'
})

// Create indexes
WishlistItemSchema.index({ userId: 1 })
WishlistItemSchema.index({ productId: 1 })
WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Static methods
WishlistItemSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).populate('productId')
}

WishlistItemSchema.statics.isInWishlist = function(userId: string, productId: string) {
  return this.findOne({ userId, productId })
}

WishlistItemSchema.statics.addToWishlist = function(userId: string, productId: string) {
  return this.create({ userId, productId })
}

WishlistItemSchema.statics.removeFromWishlist = function(userId: string, productId: string) {
  return this.deleteOne({ userId, productId })
}

WishlistItemSchema.statics.clearWishlist = function(userId: string) {
  return this.deleteMany({ userId })
}

export default mongoose.models.WishlistItem || mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema)
