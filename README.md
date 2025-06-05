# Rupomoti E-commerce Platform

A modern e-commerce platform built with Next.js 14, featuring a powerful admin dashboard and Steadfast Courier integration.

## Features

### Admin Dashboard
- Secure authentication with role-based access control
- Comprehensive order management system
- Product and category management
- Customer management
- Media library with Cloudinary integration
- Real-time analytics and reporting
- Inventory tracking
- Promotion and discount management

### Order Management
- Complete order lifecycle management
- Steadfast Courier integration for shipping
- Real-time order tracking
- Automated shipping label generation
- Order status updates
- Payment status tracking
- Detailed order history

### Product Management
- Rich product information management
- Multiple product images
- Category and tag organization
- Stock tracking
- Price management with discount support
- SEO optimization fields

### Customer Management
- Customer profiles and history
- Order tracking for customers
- Wishlist management
- Account settings
- Communication preferences

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Image Storage**: Cloudinary
- **Shipping**: Steadfast Courier API
- **State Management**: React Context
- **Forms**: React Hook Form
- **Validation**: Zod
- **Date Handling**: date-fns

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rupomoti.git
   cd rupomoti
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your configuration values

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="your_mongodb_url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Steadfast API
STEADFAST_API_KEY="your_steadfast_api_key"
STEADFAST_SECRET_KEY="your_steadfast_secret_key"
STEADFAST_WEBHOOK_TOKEN="your_webhook_auth_token"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## API Routes

### Admin API

- `GET /api/admin/orders` - List orders with pagination and filters
- `POST /api/admin/orders` - Update order status and shipping information
- `GET /api/admin/products` - List products with pagination and filters
- `POST /api/admin/products` - Create or update products
- `GET /api/admin/customers` - List customers with pagination and filters
- `GET /api/admin/analytics` - Get dashboard analytics and reports

### Steadfast Integration

- `POST /api/shipping/create` - Create a new shipment
- `GET /api/shipping/track/:id` - Track shipment status
- `POST /api/shipping/cancel/:id` - Cancel a shipment
- `POST /api/shipping/price` - Calculate shipping price

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Steadfast Courier](https://steadfast.com.bd/)
- [Cloudinary](https://cloudinary.com/)
- [Prisma](https://www.prisma.io/)
