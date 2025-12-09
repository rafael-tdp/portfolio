import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '../../mongodb/models/application.js'
import Company from '../../mongodb/models/company.js'
import Visit from '../../mongodb/models/visit.js'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { generateUniqueApplicationSlug } from '../../utils/slugGenerator.js'

export default class ApplicationsController {
  public async create({ request, response }: HttpContextContract) {
    const body = request.only(['company', 'user', 'jobTitle', 'jobDescription', 'requiredSkills', 'coverLetter', 'softSkills', 'hardSkills', 'status', 'selectedProjects'])
    // `company` is required; `user` is optional to allow anonymous submissions
    if (!body.company) return response.badRequest({ error: 'company is required' })

    // Fetch company to get its name for slug generation
    const company = await Company.findById(body.company).lean() as any
    if (!company || typeof company !== 'object' || !company.name) {
      return response.badRequest({ error: 'company not found' })
    }

    // Generate unique slug for application
    const slug = await generateUniqueApplicationSlug(company.name)

    // create application with initial timeline event
    const app = await Application.create({
      company: body.company,
      user: body.user || undefined,
      jobTitle: body.jobTitle,
      jobDescription: body.jobDescription,
      requiredSkills: body.requiredSkills || [],
      softSkills: body.softSkills || [],
      hardSkills: body.hardSkills || {},
      coverLetter: body.coverLetter,
      selectedProjects: body.selectedProjects || [],
      status: body.status || 'draft',
      slug,
      timeline: [{ type: 'created', date: new Date(), description: 'Candidature créée' }],
      privateNotes: [],
      reminders: [],
    } as any)

    return response.created({ application: app })
  }

  public async show({ params, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })

    let application
    if (mongoose.isValidObjectId(id)) {
      application = await Application.findById(id).populate('company').populate('user').lean()
    }
    if (!application) return response.notFound({ error: 'Application not found' })

    return response.ok({ application })
  }

  public async list({ request, response }: HttpContextContract) {
    // optional filters: user, company
    const qUser = request.input('user')
    const qCompany = request.input('company')

    const filter: any = {}
    if (qUser) filter.user = qUser
    if (qCompany) filter.company = qCompany

    const apps = await Application.find(filter).sort({ createdAt: -1 }).populate('company').populate('user').lean()
    return response.ok({ applications: apps })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })
    if (!mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const body = request.only(['company', 'user', 'jobTitle', 'jobDescription', 'requiredSkills', 'coverLetter', 'softSkills', 'hardSkills', 'status', 'selectedProjects'])

    // Check if status changed to add timeline event
    const currentApp = await Application.findById(id).lean()
    const updateData: any = { $set: body }
    
    if (currentApp && body.status && body.status !== (currentApp as any).status) {
      updateData.$push = {
        timeline: {
          type: 'status_changed',
          date: new Date(),
          description: `Statut changé vers "${body.status}"`,
          metadata: { oldStatus: (currentApp as any).status, newStatus: body.status }
        }
      }
    }

    const updated = await Application.findByIdAndUpdate(id, updateData, { new: true }).populate('company').populate('user').lean()
    if (!updated) return response.notFound({ error: 'Application not found' })

    return response.ok({ application: updated })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })
    if (!mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const deleted = await Application.findByIdAndDelete(id)
    if (!deleted) return response.notFound({ error: 'Application not found' })

    // Also delete associated visits, but NOT the company
    await Visit.deleteMany({ application: id })

    return response.ok({ deleted: true })
  }

  // ========== Private Notes ==========
  public async addNote({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const { content } = request.only(['content'])
    if (!content) return response.badRequest({ error: 'content is required' })

    const note = {
      id: uuidv4(),
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { 
        $push: { 
          privateNotes: note,
          timeline: { type: 'note_added', date: new Date(), description: 'Note ajoutée' }
        } 
      },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application not found' })
    return response.ok({ application: updated, note })
  }

  public async updateNote({ params, request, response }: HttpContextContract) {
    const { id, noteId } = params
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const { content } = request.only(['content'])
    if (!content) return response.badRequest({ error: 'content is required' })

    const updated = await Application.findOneAndUpdate(
      { _id: id, 'privateNotes.id': noteId },
      { 
        $set: { 
          'privateNotes.$.content': content,
          'privateNotes.$.updatedAt': new Date()
        } 
      },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application or note not found' })
    return response.ok({ application: updated })
  }

  public async deleteNote({ params, response }: HttpContextContract) {
    const { id, noteId } = params
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const updated = await Application.findByIdAndUpdate(
      id,
      { $pull: { privateNotes: { id: noteId } } },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application not found' })
    return response.ok({ application: updated })
  }

  // ========== Reminders ==========
  public async addReminder({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const { date, message } = request.only(['date', 'message'])
    if (!date || !message) return response.badRequest({ error: 'date and message are required' })

    const reminder = {
      id: uuidv4(),
      date: new Date(date),
      message,
      completed: false,
      createdAt: new Date(),
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { 
        $push: { 
          reminders: reminder,
          timeline: { type: 'reminder_set', date: new Date(), description: `Rappel programmé pour le ${new Date(date).toLocaleDateString('fr-FR')}` }
        } 
      },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application not found' })
    return response.ok({ application: updated, reminder })
  }

  public async completeReminder({ params, response }: HttpContextContract) {
    const { id, reminderId } = params
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const updated = await Application.findOneAndUpdate(
      { _id: id, 'reminders.id': reminderId },
      { $set: { 'reminders.$.completed': true } },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application or reminder not found' })
    return response.ok({ application: updated })
  }

  public async deleteReminder({ params, response }: HttpContextContract) {
    const { id, reminderId } = params
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const updated = await Application.findByIdAndUpdate(
      id,
      { $pull: { reminders: { id: reminderId } } },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application not found' })
    return response.ok({ application: updated })
  }

  // ========== Timeline ==========
  public async addTimelineEvent({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id || !mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const { type, description, metadata } = request.only(['type', 'description', 'metadata'])
    if (!type) return response.badRequest({ error: 'type is required' })

    const event = {
      type,
      date: new Date(),
      description,
      metadata,
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { $push: { timeline: event } },
      { new: true }
    ).populate('company').populate('user').lean()

    if (!updated) return response.notFound({ error: 'Application not found' })
    return response.ok({ application: updated })
  }

  // ========== Pending Reminders (for notifications) ==========
  public async getPendingReminders({ response }: HttpContextContract) {
    const now = new Date()
    const apps = await Application.find({
      'reminders': {
        $elemMatch: {
          completed: false,
          date: { $lte: now }
        }
      }
    }).populate('company').lean()

    const pendingReminders = apps.flatMap((app: any) => 
      (app.reminders || [])
        .filter((r: any) => !r.completed && new Date(r.date) <= now)
        .map((r: any) => ({
          ...r,
          applicationId: app._id,
          companyName: app.company?.name,
          jobTitle: app.jobTitle,
        }))
    )

    return response.ok({ reminders: pendingReminders })
  }
}
