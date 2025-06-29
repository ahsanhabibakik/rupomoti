# Deployment Guide for Rupomoti

## Environment Variables Required for Production

Create these environment variables on your server:

### Database
```bash
DATABASE_URL="your-production-mongodb-connection-string"
```

### NextAuth Configuration
```bash
NEXTAUTH_SECRET="your-long-random-secret-key-for-production"
NEXTAUTH_URL="https://your-domain.com"  # Your actual domain
```

### OAuth (if using Google login)
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Email Service (if using)
```bash
EMAIL_SERVER_HOST="your-smtp-host"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@your-domain.com"
```

### Payment Gateway (if using)
```bash
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

### File Upload (if using cloud storage)
```bash
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

## Deployment Steps

### 1. Build the Application
```bash
pnpm build
```

### 2. For Vercel Deployment
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### 3. For Custom Server Deployment
```bash
# Install dependencies
pnpm install --production

# Build the application
pnpm build

# Start the production server
pnpm start
```

### 4. Database Migration
Make sure your production database has the same schema:
```bash
npx prisma db push
npx prisma generate
```

## Important Notes

1. **NEXTAUTH_URL**: Must match your actual domain (not localhost)
2. **NEXTAUTH_SECRET**: Generate a secure random string for production
3. **Database**: Use MongoDB Atlas or another cloud database
4. **File uploads**: Configure cloud storage (Cloudinary, AWS S3, etc.)
5. **SSL Certificate**: Ensure your domain has HTTPS enabled

## Testing Deployment

1. Test all authentication flows
2. Test product browsing with slugs
3. Test user account features
4. Test admin panel functionality
5. Test order placement and tracking

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring (Vercel Analytics)
- Uptime monitoring
