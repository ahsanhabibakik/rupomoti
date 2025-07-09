import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  total: number
  sku?: string
  image?: string
}

export interface IShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  area: string
  postalCode?: string
  country: string
}

export interface IOrder extends Document {
  _id: string
  userId?: string
  orderNumber: string
  items: IOrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CASH_ON_DELIVERY' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'BANK_TRANSFER'
  shippingAddress: IShippingAddress
  notes?: string
  trackingNumber?: string
  courierService?: string
  steadfastConsignmentId?: string
  isFake?: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String
  },
  image: {
    type: String
  }
}, { _id: false })

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'Bangladesh'
  }
}, { _id: false })

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    ref: 'User'
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['CASH_ON_DELIVERY', 'BKASH', 'NAGAD', 'ROCKET', 'CARD', 'BANK_TRANSFER'],
    required: true
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  courierService: {
    type: String,
    trim: true
  },
  steadfastConsignmentId: {
    type: String,
    trim: true
  },
  isFake: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'Order'
})

// Create indexes
OrderSchema.index({ userId: 1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ deletedAt: 1 })
OrderSchema.index({ steadfastConsignmentId: 1 })

// Virtual fields
OrderSchema.virtual('isActive').get(function() {
  return !this.deletedAt
})

OrderSchema.virtual('itemCount').get(function() {
  return this.items.length
})

OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0)
})

// Instance methods
OrderSchema.methods.updateStatus = function(status: string) {
  this.status = status
  return this.save()
}

OrderSchema.methods.updatePaymentStatus = function(paymentStatus: string) {
  this.paymentStatus = paymentStatus
  return this.save()
}

OrderSchema.methods.cancel = function() {
  this.status = 'CANCELLED'
  return this.save()
}

OrderSchema.methods.softDelete = function() {
  this.deletedAt = new Date()
  return this.save()
}

// Static methods
OrderSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, deletedAt: null })
}

OrderSchema.statics.findByOrderNumber = function(orderNumber: string) {
  return this.findOne({ orderNumber, deletedAt: null })
}

OrderSchema.statics.findActive = function() {
  return this.find({ deletedAt: null })
}

OrderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}-${random}`
}

// Pre-save middleware
OrderSchema.pre('save', function(next) {
  // Auto-generate order number if not provided
  if (!this.orderNumber) {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    this.orderNumber = `ORD-${timestamp}-${random}`
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
  this.total = this.subtotal + this.tax + this.shippingCost
  
  next()
})

// Ensure virtuals are included when converting to JSON
OrderSchema.set('toJSON', { virtuals: true })
OrderSchema.set('toObject', { virtuals: true })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
