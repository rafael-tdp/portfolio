import mongoose, { Schema, Document } from 'mongoose'

export interface IApplication extends Document {
  company: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  jobTitle?: string
  jobDescription?: string
  requiredSkills?: string[]
  softSkills?: string[]
  hardSkills?: Record<string, string>
  coverLetter?: string
  coverLetterMeta?: Record<string, any>
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    jobTitle: { type: String },
    jobDescription: { type: String },
    requiredSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    hardSkills: { type: Schema.Types.Mixed, default: {} },
    coverLetter: { type: String },
    coverLetterMeta: { type: Schema.Types.Mixed },
    status: { type: String, default: 'draft' },
  },
  { timestamps: true }
)

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)
