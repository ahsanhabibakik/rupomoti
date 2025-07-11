/**
 * Global type definitions for Mongoose models and connection
 */

import mongoose, { Document, Model } from 'mongoose';

// Global mongoose connection declaration
declare global {
  var mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

/**
 * Base document interface with common fields
 */
export interface BaseDocument extends Document {
  id: string; // Virtual getter that returns _id as string
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User document interface
 */
export interface UserDocument extends BaseDocument {
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  accounts?: any[];
  sessions?: any[];
}

/**
 * Category document interface
 */
export interface CategoryDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured?: boolean;
  parentId?: string;
}

/**
 * Product document interface
 */
export interface ProductDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  discount?: number;
  images: string[];
  categoryId?: string;
  category?: CategoryDocument;
  inStock: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  rating?: number;
  sku?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

// Export model types
export type UserModel = Model<UserDocument>;
export type CategoryModel = Model<CategoryDocument>;
export type ProductModel = Model<ProductDocument>;
