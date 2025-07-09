# 🚀 Mongoose Advanced Features Usage Guide

## Overview
This guide demonstrates how to use all the advanced Mongoose features implemented in the Rupomoti jewelry e-commerce project. The migration from native MongoDB to Mongoose ODM brings powerful features like schema validation, virtual fields, middleware, and advanced querying capabilities.

## 🎯 Features Implemented

### 1. Enhanced Product Model (`src/models/Product.ts`)
- **Schema Validation**: Automatic data validation with required fields, min/max values
- **Virtual Fields**: Computed properties like `finalPrice`, `discountPercentage`, `isOnSale`
- **Instance Methods**: `applyDiscount()`, `updateStock()`, `getDisplayName()`
- **Static Methods**: `findByCategory()`, `findOnSale()`, `searchProducts()`
- **Middleware**: Auto-update `updatedAt` timestamp, slug generation
- **Indexes**: Optimized for search and filtering

### 2. Enhanced Category Model (`src/models/Category.ts`)
- **Virtual Fields**: `productCount`, `totalValue`, `averagePrice`
- **Instance Methods**: `getProductStats()`, `addProduct()`, `removeProduct()`
- **Static Methods**: `getAnalytics()`, `findWithProducts()`
- **Middleware**: Slug generation and validation

### 3. Service Layer (`src/lib/services.ts`)
- **ProductService**: Reusable business logic for product operations
- **CategoryService**: Category analytics and management
- **Advanced Queries**: Search, filtering, analytics

### 4. Enhanced API Endpoints

#### Products Enhanced API (`/api/products-enhanced`)
```typescript
// Search products
GET /api/products-enhanced?search=pearl&limit=12

// Get products by type
GET /api/products-enhanced?type=featured&limit=6
GET /api/products-enhanced?type=popular&limit=8
GET /api/products-enhanced?type=sale&limit=10

// Price range filtering
GET /api/products-enhanced?minPrice=100&maxPrice=500

// Category filtering
GET /api/products-enhanced?category=necklaces&limit=12

// Bulk operations
POST /api/products-enhanced
{
  "action": "bulk_discount",
  "data": {
    "categoryId": "category_id",
    "percentage": 10
  }
}
```

#### Categories Enhanced API (`/api/categories-enhanced`)
```typescript
// Get category analytics
GET /api/categories-enhanced?type=analytics

// Get categories with product counts
GET /api/categories-enhanced?type=with_products&limit=10
```

## 🎨 Frontend Components

### 1. Enhanced Product Card (`src/components/enhanced/EnhancedProductCard.tsx`)
Shows all computed fields and product states:
```tsx
<EnhancedProductCard 
  product={product}
  onAddToCart={(id) => console.log('Add to cart:', id)}
  onViewDetails={(id) => console.log('View details:', id)}
  onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
/>
```

**Features Displayed:**
- Sale badges with discount percentage
- Stock status (In Stock, Low Stock, Out of Stock)
- Final price calculation
- Featured/Popular badges
- Modern hover effects

### 2. Admin Enhanced Features (`src/components/enhanced/AdminEnhancedFeatures.tsx`)
Admin panel for bulk operations and analytics:
- Category analytics dashboard
- Bulk discount application
- Stock management tools
- Real-time feedback

### 3. Demo Page (`src/app/demo/page.tsx`)
Comprehensive showcase of all features:
- Interactive search with multiple filters
- Price range filtering
- Category analytics visualization
- Admin bulk operations interface

## 🚀 How to Use

### 1. Access the Demo Page
Visit `/demo` in your application to see all features in action.

### 2. Search Functionality
```typescript
// In your components
const searchProducts = async (searchTerm: string) => {
  const response = await fetch(`/api/products-enhanced?search=${encodeURIComponent(searchTerm)}`)
  const data = await response.json()
  return data.data
}
```

### 3. Price Range Filtering
```typescript
const filterByPrice = async (minPrice: number, maxPrice: number) => {
  const response = await fetch(`/api/products-enhanced?minPrice=${minPrice}&maxPrice=${maxPrice}`)
  const data = await response.json()
  return data.data
}
```

### 4. Category Analytics
```typescript
const getCategoryAnalytics = async () => {
  const response = await fetch('/api/categories-enhanced?type=analytics')
  const data = await response.json()
  return data.data
}
```

### 5. Bulk Operations (Admin)
```typescript
const applyBulkDiscount = async (categoryId: string, percentage: number) => {
  const response = await fetch('/api/products-enhanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bulk_discount',
      data: { categoryId, percentage }
    })
  })
  return await response.json()
}
```

## 📊 Virtual Fields Available

### Product Virtual Fields
- `finalPrice`: Calculated price after discount
- `discountPercentage`: Percentage discount amount
- `isOnSale`: Boolean indicating if product has discount
- `isInStock`: Boolean for stock availability
- `isLowStock`: Boolean for low stock warning (< 5 items)

### Category Virtual Fields
- `productCount`: Number of products in category
- `totalValue`: Total inventory value
- `averagePrice`: Average product price in category

## 🔧 Advanced Query Examples

### 1. Find Products with Complex Filters
```typescript
// Using Mongoose model directly
const products = await Product.find({
  price: { $gte: 100, $lte: 500 },
  stock: { $gt: 0 },
  isFeatured: true
}).populate('category').sort({ createdAt: -1 }).limit(10)
```

### 2. Category Analytics Query
```typescript
// Using aggregation pipeline
const analytics = await Category.aggregate([
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: 'category',
      as: 'products'
    }
  },
  {
    $addFields: {
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
  }
])
```

### 3. Text Search with Indexes
```typescript
const searchResults = await Product.find({
  $text: { $search: searchTerm }
}).populate('category').limit(limit)
```

## 🎯 Benefits of Mongoose Migration

1. **Type Safety**: Better TypeScript integration
2. **Data Validation**: Automatic schema validation
3. **Performance**: Optimized queries with indexes
4. **Maintainability**: Cleaner, more organized code
5. **Advanced Features**: Virtuals, middleware, methods
6. **Better Error Handling**: More descriptive error messages
7. **Analytics**: Built-in aggregation capabilities

## 🚦 Testing the Features

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the demo page**:
   ```
   http://localhost:3000/demo
   ```

3. **Test each tab**:
   - 🔍 Search: Try searching for "pearl", "necklace", etc.
   - ⭐ Featured: See featured products with computed fields
   - 🏷️ Sales: View products with discounts and sale badges
   - 📊 Analytics: Explore category statistics
   - ⚙️ Admin: Test bulk operations (admin features)

## 🔄 Integration with Existing Code

The enhanced endpoints are designed to be backward compatible. You can gradually migrate your existing components to use the new features:

```typescript
// Old way
const products = await fetch('/api/products-mongo')

// New way with enhanced features
const products = await fetch('/api/products-enhanced?type=featured&limit=12')
```

## 🎨 Customization

All components are built with Tailwind CSS and shadcn/ui, making them easy to customize:

```tsx
// Customize the EnhancedProductCard
<EnhancedProductCard 
  product={product}
  className="custom-card-styles"
  showFullDescription={true}
  enableWishlist={false}
/>
```

This migration brings your e-commerce platform to the next level with professional-grade features and improved performance! 🚀
