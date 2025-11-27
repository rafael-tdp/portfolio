import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from '../../mongodb/models/company.js'
import Application from '../../mongodb/models/application.js'

export default class PublicController {
  public async showCompany({ params, response }: HttpContextContract) {
    const slug = params.slug
    if (!slug) return response.badRequest({ error: 'slug required' })

    const company = await Company.findOne({ publicSlug: slug }).lean()
    if (!company) return response.notFound({ error: 'Company not found' })

    // fetch latest application for company if exists
    const companyId = (company as any)._id
    const application = await Application.findOne({ company: companyId }).sort({ createdAt: -1 }).lean()

    return response.ok({ company, application })
  }
}
