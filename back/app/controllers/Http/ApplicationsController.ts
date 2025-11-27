import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '../../mongodb/models/application.js'
import mongoose from 'mongoose'

export default class ApplicationsController {
  public async create({ request, response }: HttpContextContract) {
    const body = request.only(['company', 'user', 'jobTitle', 'jobDescription', 'requiredSkills', 'coverLetter'])
    // `company` is required; `user` is optional to allow anonymous submissions
    if (!body.company) return response.badRequest({ error: 'company is required' })

    // create application
    const app = await Application.create({
      company: body.company,
      user: body.user || undefined,
      jobTitle: body.jobTitle,
      jobDescription: body.jobDescription,
      requiredSkills: body.requiredSkills || [],
      coverLetter: body.coverLetter,
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

    const body = request.only(['company', 'user', 'jobTitle', 'jobDescription', 'requiredSkills', 'coverLetter'])

    const updated = await Application.findByIdAndUpdate(id, { $set: body }, { new: true }).populate('company').populate('user').lean()
    if (!updated) return response.notFound({ error: 'Application not found' })

    return response.ok({ application: updated })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })
    if (!mongoose.isValidObjectId(id)) return response.badRequest({ error: 'invalid id' })

    const deleted = await Application.findByIdAndDelete(id)
    if (!deleted) return response.notFound({ error: 'Application not found' })

    return response.ok({ deleted: true })
  }
}
