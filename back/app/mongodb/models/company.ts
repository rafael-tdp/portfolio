import mongoose, { Schema, Document } from 'mongoose'

export interface ICompany extends Document {
  name: string
  logoUrl?: string
  colors?: Record<string, string>
  theme?: Record<string, string>
  publicSlug?: string
  createdBy?: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    colors: { type: Schema.Types.Mixed },
    theme: { type: Schema.Types.Mixed },
    publicSlug: { type: String, index: true, unique: true, sparse: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema)
