import mongoose, { Schema, Document } from 'mongoose'

export interface IVisit extends Document {
  application: mongoose.Types.ObjectId
  company: mongoose.Types.ObjectId
  ip?: string
  userAgent?: string
  referer?: string
  country?: string
  city?: string
  createdAt?: Date
}

const VisitSchema = new Schema<IVisit>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    ip: { type: String },
    userAgent: { type: String },
    referer: { type: String },
    country: { type: String },
    city: { type: String },
  },
  { timestamps: true }
)

// Index for efficient queries
VisitSchema.index({ application: 1, createdAt: -1 })
VisitSchema.index({ company: 1, createdAt: -1 })

export default mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema)
