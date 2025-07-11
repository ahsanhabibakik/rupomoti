import dbConnect from '@/lib/dbConnect';

export class AuditLogger {
  static async log({
    model,
    recordId,
    userId,
    action,
    field,
    oldValue,
    newValue,
    details
  }: {
    model: string
    recordId: string
    userId: string
    action: string
    field?: string
    oldValue?: string
    newValue?: string
    details?: any
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          model,
          recordId,
          userId,
          action,
          field,
          oldValue,
          newValue,
          details
        }
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
    }
  }

  static async logOrderStatusChange(
    orderId: string,
    userId: string,
    oldStatus: string,
    newStatus: string
  ) {
    await this.log({
      model: 'Order',
      recordId: orderId,
      userId,
      action: 'UPDATE_STATUS',
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus
    })
  }

  static async logOrderCreation(orderId: string, userId: string) {
    await this.log({
      model: 'Order',
      recordId: orderId,
      userId,
      action: 'CREATE'
    })
  }
}
