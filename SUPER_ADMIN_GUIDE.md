# Super Admin Setup Guide

This document describes the Super Admin functionality in the Rupomoti application.

## Super Admin Users

Two Super Admin accounts have been created:

### 1. Delwer Admin

- **Email:** `admin@delwer.com`
- **Password:** `SuperAdmin123!`
- **Role:** SUPER_ADMIN
- **Permissions:** Full access to all features

### 2. Akik Admin  

- **Email:** `admin@akik.com`
- **Password:** `SuperAdmin123!`
- **Role:** SUPER_ADMIN
- **Permissions:** Full access to all features

## Role Hierarchy

The application now supports the following roles:

1. **SUPER_ADMIN** - Full system access including user and role management
2. **ADMIN** - Access to most features except user management  
3. **MANAGER** - Access to product and order management
4. **USER** - Standard customer access

## Scripts Available

### Create/Update Super Admins

```bash
pnpm run seed:super-admins
```
This script will:

- Create new super admin users if they don't exist
- Update existing users to super admin role if they already exist
- Set proper permissions and admin flags

### Verify Super Admins

```bash
pnpm run verify:super-admins
```
This script will:
- List all super admin users in the database
- Show user statistics
- Verify permissions are set correctly

## Super Admin Permissions

Super Admins have full access to:

- ✅ **User Management** - Create, update, delete users
- ✅ **Role Management** - Create, update, delete roles
- ✅ **Product Management** - Full CRUD operations
- ✅ **Order Management** - Full CRUD operations
- ✅ **Customer Management** - Full CRUD operations
- ✅ **Category Management** - Full CRUD operations
- ✅ **Coupon Management** - Full CRUD operations
- ✅ **Review Management** - Full CRUD operations
- ✅ **Settings Management** - System configuration
- ✅ **Reports & Analytics** - All business reports
- ✅ **Data Export** - Export all data types

## Authentication Helper Functions

Use the utility functions in `src/lib/auth-utils.ts`:

```typescript
import { isSuperAdmin, isAdmin, permissions } from '@/lib/auth-utils'

// Check if user is super admin
if (isSuperAdmin(user)) {
  // Allow super admin actions
}

// Check specific permissions
if (permissions.canManageUsers(user)) {
  // Allow user management
}
```

## Security Notes

1. **Strong Passwords**: Default passwords are `SuperAdmin123!` - **Change these immediately in production**
2. **Email Verification**: Super admin accounts are automatically email verified
3. **Role Validation**: Always use the helper functions to check permissions
4. **Audit Logging**: All super admin actions should be logged for security

## Database Schema

The User model includes:
```prisma
model User {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  email    String  @unique
  name     String?
  role     Role    @default(USER)
  isAdmin  Boolean @default(false)
  // ... other fields
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
  MANAGER
}
```

## Production Deployment

Before deploying to production:

1. Change default passwords
2. Review super admin email addresses
3. Test authentication flow
4. Verify role-based access controls
5. Enable audit logging
6. Set up monitoring for super admin actions

## Troubleshooting

### Issue: Super admin can't access certain features
**Solution:** Verify the user has both `role: 'SUPER_ADMIN'` and `isAdmin: true`

### Issue: Role not updating
**Solution:** Run `pnpm run verify:super-admins` to check current state

### Issue: Authentication not working
**Solution:** Check if user exists with correct email and verify password hash

For additional support, check the application logs or run the verification script.
