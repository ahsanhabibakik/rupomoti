import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import bcrypt from "bcryptjs";
import { z } from "zod";

// Query schema for filtering
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']).optional(),
  status: z.enum(['active', 'flagged', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'name', 'email', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// User creation schema
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']).default('USER'),
});

// User update schema
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']).optional(),
  isFlagged: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

// Helper function to check if user can manage roles
function canManageRole(currentUserRole: string, targetRole: string, currentUserId: string, targetUserId: string): boolean {
  // Super admins can manage all roles except other super admins (unless it's themselves)
  if (currentUserRole === 'SUPER_ADMIN') {
    // Super admin can't demote other super admins, but can modify their own profile
    if (targetRole === 'SUPER_ADMIN' && currentUserId !== targetUserId) {
      return false;
    }
    return true;
  }
  
  // Admins can only manage USER and other ADMIN roles, not SUPER_ADMIN or MANAGER
  if (currentUserRole === 'ADMIN') {
    return targetRole === 'USER' || targetRole === 'ADMIN';
  }
  
  // Managers can only view, not manage roles
  return false;
}

// Helper function to check if user can perform action
function canPerformAction(currentUserRole: string, targetUserId: string, currentUserId: string, targetUserRole: string): boolean {
  // Super admins can manage all users except other super admins
  if (currentUserRole === 'SUPER_ADMIN') {
    // Can't modify other super admins
    if (targetUserRole === 'SUPER_ADMIN' && currentUserId !== targetUserId) {
      return false;
    }
    return true;
  }
  
  // Admins can manage users and other admins but not super admins or managers
  if (currentUserRole === 'ADMIN') {
    if (targetUserRole === 'SUPER_ADMIN' || targetUserRole === 'MANAGER') {
      return false;
    }
    return targetUserId !== currentUserId; // Can't modify themselves
  }
  
  // Managers can only view, not modify
  return false;
}

// Helper function to check read permissions
function canReadUsers(userRole: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole);
}

// GET /api/admin/users - Get all users with filtering and pagination
export const GET = withMongoose(async (req) => {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    // Apply search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Apply role filter
    if (query.role) {
      where.role = query.role;
    }

    // Apply status filter
    if (query.status === 'active') {
      where.isFlagged = false;
    } else if (query.status === 'flagged') {
      where.isFlagged = true;
    }

    const skip = (query.page - 1) * query.limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          isFlagged: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      users,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export const POST = withMongoose(async (req) => {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Only Super Admin can create users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        isAdmin: ['ADMIN', 'SUPER_ADMIN'].includes(validatedData.role),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        isFlagged: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update a user
export const PATCH = withMongoose(async (req) => {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateUserSchema.parse(updateData);

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (!canPerformAction(session.user.role!, targetUser.id, session.user.id!)) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check role change permissions
    if (validatedData.role && !canManageRole(session.user.role!, validatedData.role)) {
      return NextResponse.json(
        { message: "Cannot assign this role" },
        { status: 403 }
      );
    }

    // Prevent changing Super Admin role by non-Super Admin
    if (targetUser.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Cannot modify Super Admin users" },
        { status: 403 }
      );
    }

    // Prevent non-Super Admins from making anyone else a Super Admin
    if (validatedData.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Only Super Admins can assign the Super Admin role" },
        { status: 403 }
      );
    }

    // Prevent a Super Admin from changing another Super Admin's role
    if (
      session.user.role === 'SUPER_ADMIN' &&
      targetUser.role === 'SUPER_ADMIN' &&
      targetUser.id !== session.user.id && // Can change their own role
      validatedData.role &&
      validatedData.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { message: "A Super Admin cannot change another Super Admin's role." },
        { status: 403 }
      );
    }

    // Prevent self-demotion from Super Admin
    if (targetUser.id === session.user.id && 
        session.user.role === 'SUPER_ADMIN' && 
        validatedData.role && 
        validatedData.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Cannot demote yourself from Super Admin" },
        { status: 400 }
      );
    }

    // Check if email already exists (if changing email)
    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateObject: Record<string, unknown> = { ...validatedData };

    // Hash password if provided
    if (validatedData.password) {
      updateObject.password = await bcrypt.hash(validatedData.password, 12);
    }

    // Update isAdmin flag based on role
    if (validatedData.role) {
      updateObject.isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(validatedData.role);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateObject,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        isFlagged: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete a user
export const DELETE = withMongoose(async (req) => {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Only Super Admin can delete users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
