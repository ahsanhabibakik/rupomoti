# Rupomoti Authentication System Guide

This guide covers the complete authentication system implementation for the Rupomoti jewelry e-commerce platform.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Google OAuth credentials (optional)

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/rupomoti"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Installation & Setup

```bash
# Install dependencies
npm install

# Set up authentication system
npm run setup-auth

# Start development server
npm run dev
```

## 🔐 Authentication Features

### ✅ Implemented Features

1. **Multi-Provider Authentication**
   - Email/Password authentication
   - Google OAuth integration
   - Automatic user creation for OAuth providers

2. **Role-Based Access Control**
   - USER: Regular customers
   - MANAGER: Store managers with limited admin access
   - ADMIN: Full administrative access

3. **Protected Routes**
   - `/admin/*` - Admin/Manager only
   - `/account` - Authenticated users only
   - Automatic redirects based on user roles

4. **User Management**
   - Admin can promote/demote user roles
   - User profile management
   - Session management with 30-day expiration

5. **Responsive UI Components**
   - Role-aware navigation bar
   - User dropdown menu with role indicators
   - Mobile-friendly authentication flows

## 🏗️ System Architecture

### Database Schema

```prisma
model User {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  password       String?   // For email/password auth
  role           Role      @default(USER)
  isAdmin        Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Relations
  accounts       Account[]
  sessions       Session[]
  // ... other relations
}

enum Role {
  USER
  MANAGER
  ADMIN
}
```

### API Routes

- `POST /api/auth/register` - User registration
- `GET /api/auth/users` - List all users (Admin only)
- `PATCH /api/auth/users` - Update user roles (Admin only)
- `[...nextauth]` - NextAuth.js endpoints

### Middleware Protection

```typescript
// middleware.ts
export const config = {
  matcher: ['/admin/:path*']
}
```

## 🎯 Usage Examples

### Demo Credentials

After running setup, use these credentials:

```
Email: admin@rupomoti.com
Password: admin123
```

### Authentication Flow

1. **Sign In**: Visit `/signin`
2. **Role-Based Redirect**: 
   - Admins/Managers → `/admin`
   - Regular users → `/account`
3. **Access Control**: Middleware protects admin routes
4. **User Management**: Admins can manage roles via `/admin/users`

### Component Usage

```tsx
// Check user role in components
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  
  return (
    <div>
      {isAdmin && <AdminButton />}
    </div>
  )
}
```

### Server-Side Role Checking

```tsx
// In API routes
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Admin-only logic here
}
```

## 🛡️ Security Features

1. **Password Hashing**: bcryptjs with 12 rounds
2. **JWT Sessions**: Secure token-based sessions
3. **CSRF Protection**: Built-in NextAuth.js protection
4. **Role Validation**: Server-side role checking
5. **Secure Redirects**: Prevents open redirect vulnerabilities

## 📱 UI Components

### Navigation Bar Features
- **User Authentication Status**: Shows sign-in button or user menu
- **Role Indicators**: Crown/Shield icons for admin/manager roles
- **Dashboard Access**: Direct link to admin dashboard for privileged users
- **Mobile Responsive**: Collapsible menu with authentication options

### Account Page Features
- **Profile Management**: Edit user information
- **Role Display**: Shows current user role
- **Admin Dashboard Link**: Quick access for admin/manager users
- **Sign Out**: Secure session termination

### Admin Dashboard
- **User Management**: View and modify user roles
- **Role Statistics**: Visual overview of user distribution
- **Protected Access**: Middleware and component-level protection

## 🔧 Customization

### Adding New Roles

1. Update the Prisma schema:
```prisma
enum Role {
  USER
  MANAGER
  ADMIN
  SUPER_ADMIN  // New role
}
```

2. Update middleware:
```typescript
return token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
```

3. Update UI components to handle new role

### Extending Authentication

1. **Add New Provider**:
```typescript
// In authOptions
providers: [
  // ... existing providers
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  })
]
```

2. **Custom Fields**:
```typescript
// Add to JWT callback
async jwt({ token, user }) {
  if (user) {
    token.customField = user.customField
  }
  return token
}
```

## 🚨 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Password Policy**: Implement strong password requirements
3. **Rate Limiting**: Add rate limiting to auth endpoints
4. **Session Security**: Use secure cookies in production
5. **Regular Updates**: Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MongoDB is accessible
2. **Environment Variables**: Verify all required variables are set
3. **Schema Mismatch**: Run `npx prisma generate` after schema changes
4. **Session Issues**: Clear browser cookies and restart server

### Debug Commands

```bash
# Check database connection
npm run db:studio

# Regenerate Prisma client
npm run db:generate

# Reset admin user
npm run seed-admin
```

## 📞 Support

For questions or issues with the authentication system:

1. Check the troubleshooting section above
2. Review the NextAuth.js documentation
3. Examine the browser developer tools for client-side issues
4. Check server logs for API errors

---

**Note**: This authentication system is production-ready but remember to:
- Change default passwords
- Configure proper OAuth credentials
- Set up proper monitoring and logging
- Implement additional security measures as needed