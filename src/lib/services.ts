import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'
import Category from '@/models/Category'

export class ProductService {
  static async init() {
    await dbConnect()
  }

  // Advanced product queries using new static methods
  static async getFeaturedProducts(limit = 12) {
    await this.init()
    return Product.findFeatured(limit).populate('categoryId').lean()
  }

  static async getPopularProducts(limit = 12) {
    await this.init()
    return Product.findPopular(limit).populate('categoryId').lean()
  }

  static async getProductsOnSale(limit = 12) {
    await this.init()
    return Product.findOnSale(limit).populate('categoryId').lean()
  }

  static async searchProducts(query: string, limit = 20) {
    await this.init()
    return Product.searchProducts(query).limit(limit).populate('categoryId').lean()
  }

  static async getProductsByCategory(categoryId: string, limit = 12) {
    await this.init()
    return Product.findByCategory(categoryId).limit(limit).lean()
  }

  // Advanced filtering with price ranges
  static async getProductsInPriceRange(minPrice: number, maxPrice: number) {
    await this.init()
    return Product.find({
      status: 'ACTIVE',
      $or: [
        { discountPrice: { $gte: minPrice, $lte: maxPrice } },
        { 
          $and: [
            { discountPrice: { $exists: false } },
            { price: { $gte: minPrice, $lte: maxPrice } }
          ]
        }
      ]
    }).lean()
  }

  // Get products with computed fields
  static async getProductWithDetails(productId: string) {
    await this.init()
    const product = await Product.findById(productId).populate('categoryId')
    
    if (!product) return null

    return {
      ...product.toObject(),
      finalPrice: product.finalPrice,
      discountPercentage: product.discountPercentage,
      isOnSale: product.isOnSale,
      isInStock: product.isInStock,
      isLowStock: product.isLowStock
    }
  }

  // Bulk operations
  static async applyBulkDiscount(categoryId: string, percentage: number) {
    await this.init()
    const products = await Product.find({ categoryId, status: 'ACTIVE' })
    
    const results = await Promise.all(
      products.map(product => product.applyDiscount(percentage))
    )
    
    return results
  }

  static async updateBulkStock(updates: { productId: string; quantity: number }[]) {
    await this.init()
    const results = []
    
    for (const update of updates) {
      const product = await Product.findById(update.productId)
      if (product) {
        await product.updateStock(update.quantity)
        results.push({ productId: update.productId, success: true })
      } else {
        results.push({ productId: update.productId, success: false, error: 'Product not found' })
      }
    }
    
    return results
  }
}

export class CategoryService {
  static async init() {
    await dbConnect()
  }

  // Get categories with product counts
  static async getCategoriesWithCounts() {
    await this.init()
    return Category.findWithProducts()
  }

  // Get active categories
  static async getActiveCategories() {
    await this.init()
    return Category.findActive().lean()
  }

  // Get category by slug with products
  static async getCategoryWithProducts(slug: string, productLimit = 12) {
    await this.init()
    const category = await Category.findBySlug(slug)
    
    if (!category) return null

    const products = await category.getProducts(productLimit)
    
    return {
      ...category.toObject(),
      products: products.map(p => ({
        ...p.toObject(),
        finalPrice: p.finalPrice,
        discountPercentage: p.discountPercentage,
        isOnSale: p.isOnSale,
        isInStock: p.isInStock
      }))
    }
  }

  // Category analytics
  static async getCategoryAnalytics() {
    await this.init()
    
    const pipeline = [
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'Product',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products',
          pipeline: [{ $match: { status: 'ACTIVE' } }]
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: { $size: '$products' },
          totalValue: { $sum: '$products.price' },
          avgPrice: { $avg: '$products.price' },
          inStockProducts: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $gt: ['$$this.stock', 0] }
              }
            }
          }
        }
      },
      { $sort: { productCount: -1 } }
    ]
    
    return Category.aggregate(pipeline)
  }
}

// Export both services
export { ProductService as Products, CategoryService as Categories }
