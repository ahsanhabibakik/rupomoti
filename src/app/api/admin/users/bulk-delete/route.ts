import { NextResponse } from "next/server";
import { auth } from "@/app/auth";


import { z } from "zod";

const bulkDeleteSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: "Only Super Admin can bulk delete users" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { userIds } = bulkDeleteSchema.parse(body);
    if (userIds.includes(session.user.id!)) {
      return NextResponse.json(
        { message: "Cannot delete yourself" },
        { status: 400 }
      );
    }
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });
    if (usersToDelete.length === 0) {
      return NextResponse.json(
        { message: "No users found to delete" },
        { status: 404 }
      );
    }
    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`Bulk delete performed by ${session.user.email}:`, {
      deletedCount: deleteResult.count,
      deletedUsers: usersToDelete.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name
      }))
    });
    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} users`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to delete users" },
      { status: 500 }
    );
  }
}