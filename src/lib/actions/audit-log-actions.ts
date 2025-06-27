import { prisma } from "@/lib/prisma";

export async function getAuditLogs(orderId: string) {
    if (!orderId) {
        return [];
    }
    try {
        const auditLogs = await prisma.auditLog.findMany({
            where: {
                recordId: orderId,
                model: 'Order'
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });
        return auditLogs;
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return [];
    }
} 