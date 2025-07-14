import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
  _id: string
  id: string
  model: string
  recordId: string
  userId: string
  action: string
  oldValue?: string
  newValue?: string
  details?: any
  createdAt: Date
  updatedAt: Date
}

const auditLogSchema = new Schema<IAuditLog>({
  model: {
    type: String,
    required: true,
    index: true
  },
  recordId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE']
  },
  oldValue: {
    type: String,
    required: false
  },
  newValue: {
    type: String,
    required: false
  },
  details: {
    type: Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true,
  collection: 'auditlogs'
})

// Virtual for id
auditLogSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Ensure virtual fields are serialised
auditLogSchema.set('toJSON', {
  virtuals: true
})

// Indexes for performance
auditLogSchema.index({ model: 1, recordId: 1 })
auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })

const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema)

export default AuditLog

export function getAuditLogModel() {
  return mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
}
