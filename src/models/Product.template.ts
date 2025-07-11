import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface for Product Document
 */
export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  discount?: number;
  images: string[];
  categoryId?: mongoose.Types.ObjectId;
  inStock: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  rating?: number;
  sku?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for Product
 */
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, 'Please provide a product name'] },
    slug: { 
      type: String, 
      required: [true, 'Please provide a slug'],
      unique: true,
      index: true
    },
    description: { type: String },
    price: { 
      type: Number, 
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative']
    },
    salePrice: { 
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function(this: IProduct, val: number) {
          return !val || val <= this.price;
        },
        message: 'Sale price should be less than or equal to regular price'
      }
    },
    discount: { type: Number },
    images: { 
      type: [String],
      default: ['/images/placeholder.svg']
    },
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category' 
    },
    inStock: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isPopular: { 
      type: Boolean, 
      default: false 
    },
    rating: { 
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5']
    },
    sku: { type: String },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      default: 'ACTIVE'
    },
  }, 
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Middleware to auto-generate slug if not provided
 */
productSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for id
 */
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

/**
 * Create or get the model
 */
const Product = mongoose.models.Product as Model<IProduct> || 
  mongoose.model<IProduct>('Product', productSchema);

export default Product;
