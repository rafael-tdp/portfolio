import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  fullName?: string
  email: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
