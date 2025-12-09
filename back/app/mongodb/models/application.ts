import mongoose, { Schema, Document } from 'mongoose'

// Timeline event types
export interface ITimelineEvent {
  type: 'created' | 'sent' | 'viewed' | 'interview_scheduled' | 'interview_done' | 'offer_received' | 'accepted' | 'rejected' | 'withdrawn' | 'note_added' | 'reminder_set' | 'status_changed'
  date: Date
  description?: string
  metadata?: Record<string, any>
}

// Reminder interface
export interface IReminder {
  id: string
  date: Date
  message: string
  completed: boolean
  createdAt: Date
}

// Private note interface
export interface IPrivateNote {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
}

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
  slug?: string
  selectedProjects?: string[]
  // New fields for enhanced tracking
  privateNotes?: IPrivateNote[]
  reminders?: IReminder[]
  timeline?: ITimelineEvent[]
  lastViewedAt?: Date
  viewCount?: number
  createdAt?: Date
  updatedAt?: Date
}

const TimelineEventSchema = new Schema<ITimelineEvent>({
  type: { 
    type: String, 
    enum: ['created', 'sent', 'viewed', 'interview_scheduled', 'interview_done', 'offer_received', 'accepted', 'rejected', 'withdrawn', 'note_added', 'reminder_set', 'status_changed'],
    required: true 
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { _id: false })

const ReminderSchema = new Schema<IReminder>({
  id: { type: String, required: true },
  date: { type: Date, required: true },
  message: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: false })

const PrivateNoteSchema = new Schema<IPrivateNote>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false })

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
    status: { type: String, default: 'sent' },
    slug: { type: String, index: true, unique: true, sparse: true },
    selectedProjects: { type: [String], default: [] },
    // New fields
    privateNotes: { type: [PrivateNoteSchema], default: [] },
    reminders: { type: [ReminderSchema], default: [] },
    timeline: { type: [TimelineEventSchema], default: [] },
    lastViewedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)
