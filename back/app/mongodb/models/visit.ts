import mongoose, { Schema, Document } from 'mongoose'

export interface IVisit extends Document {
  application: mongoose.Types.ObjectId
  company: mongoose.Types.ObjectId
  ip?: string
  userAgent?: string
  referer?: string
  country?: string
  city?: string
  // New tracking fields
  source?: string // domain name (linkedin.com, mail.google.com, direct, etc.)
  utmSource?: string // UTM source parameter (linkedin, email, google, etc.)
  utmMedium?: string // UTM medium parameter (organic, paid, email, etc.)
  utmCampaign?: string // UTM campaign parameter
  timeSpent?: number // seconds spent on page
  sectionsViewed?: {
    cv?: boolean
    coverLetter?: boolean
    skills?: boolean
    experiences?: boolean
    projects?: boolean
  }
  scrollDepth?: number // percentage 0-100
  sessionId?: string // to group page views
  createdAt?: Date
  updatedAt?: Date
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
    // New tracking fields
    source: { type: String, default: 'direct' }, // Now stores domain name directly
    utmSource: { type: String }, // UTM source parameter
    utmMedium: { type: String }, // UTM medium parameter
    utmCampaign: { type: String }, // UTM campaign parameter
    timeSpent: { type: Number, default: 0 },
    sectionsViewed: {
      cv: { type: Boolean, default: false },
      coverLetter: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      experiences: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
    },
    scrollDepth: { type: Number, default: 0 },
    sessionId: { type: String },
  },
  { timestamps: true }
)

// Index for efficient queries
VisitSchema.index({ application: 1, createdAt: -1 })
VisitSchema.index({ company: 1, createdAt: -1 })
VisitSchema.index({ sessionId: 1 })

export default mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema)
