# Mongoose Models Quick Reference

This guide provides a quick reference for using Mongoose models in the Rupomoti application after migrating from Prisma.

## Connection

```javascript
import dbConnect from '@/lib/dbConnect';

// Connect to the database
await dbConnect();
```

## User

```javascript
import User from '@/models/User';

// Find a user by email
const user = await User.findOne({ email: 'user@example.com' });

// Create a user
const newUser = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: hashedPassword,
  role: 'USER'
});

// Update a user
await User.updateOne(
  { _id: userId },
  { $set: { name: 'Updated Name' } }
);

// Delete a user
await User.deleteOne({ _id: userId });
```

## Product

```javascript
import Product from '@/models/Product';

// Find all products
const products = await Product.find();

// Find products with populated category
const products = await Product.find().populate('categoryId');

// Create a product
const newProduct = await Product.create({
  name: 'New Product',
  slug: 'new-product',
  description: 'Product description',
  price: 100,
  categoryId: categoryId,
  images: ['/images/products/product1.jpg'],
  inStock: true,
  isFeatured: false,
  isPopular: false
});

// Update a product
await Product.updateOne(
  { _id: productId },
  { $set: { price: 120 } }
);

// Delete a product
await Product.deleteOne({ _id: productId });
```

## Category

```javascript
import Category from '@/models/Category';

// Find all categories
const categories = await Category.find();

// Find a category by slug
const category = await Category.findOne({ slug: 'necklaces' });

// Create a category
const newCategory = await Category.create({
  name: 'New Category',
  slug: 'new-category',
  description: 'Category description',
  image: '/images/categories/category1.jpg'
});

// Update a category
await Category.updateOne(
  { _id: categoryId },
  { $set: { name: 'Updated Category' } }
);

// Delete a category
await Category.deleteOne({ _id: categoryId });
```

## Order

```javascript
import Order from '@/models/Order';

// Find all orders
const orders = await Order.find();

// Find orders for a specific user
const userOrders = await Order.find({ userId });

// Create an order
const newOrder = await Order.create({
  userId: userId,
  items: [{
    productId: productId,
    name: 'Product Name',
    quantity: 1,
    price: 100,
    image: '/images/products/product1.jpg'
  }],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'Dhaka',
    postalCode: '1000',
    country: 'Bangladesh'
  },
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'PENDING',
  status: 'PROCESSING',
  total: 100
});

// Update an order status
await Order.updateOne(
  { _id: orderId },
  { $set: { status: 'SHIPPED' } }
);
```

## Common Patterns

### Pagination

```javascript
// Paginate products
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const products = await Product.find()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('categoryId');

const total = await Product.countDocuments();
```

### Aggregation

```javascript
// Get product counts by category
const categoryCounts = await Product.aggregate([
  { $group: { _id: '$categoryId', count: { $sum: 1 } } }
]);
```

### Transaction

```javascript
import mongoose from 'mongoose';

// Using transactions
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Perform operations
  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: -1 } },
    { session }
  );
  
  await Order.create([{ /* order data */ }], { session });
  
  // Commit the transaction
  await session.commitTransaction();
} catch (error) {
  // Abort on error
  await session.abortTransaction();
  throw error;
} finally {
  // End the session
  session.endSession();
}
```
