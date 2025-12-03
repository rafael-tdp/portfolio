import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from '../../mongodb/models/company.js'
import Application from '../../mongodb/models/application.js'

export default class PublicController {
  public async showCompany({ params, response }: HttpContextContract) {
    const slug = params.slug
    if (!slug) return response.badRequest({ error: 'slug required' })

    // First, try to find an application with this slug
    let application = await Application.findOne({ slug }).populate('company').lean()
    if (application) {
      const company = (application as any).company
      return response.ok({ company, application })
    }

    // Fallback: try to find a company with this publicSlug (backward compatibility)
    const company = await Company.findOne({ publicSlug: slug }).lean()
    if (!company) return response.notFound({ error: 'Not found' })

    // fetch latest application for company if exists
    const companyId = (company as any)._id
    application = await Application.findOne({ company: companyId }).sort({ createdAt: -1 }).lean()

    return response.ok({ company, application })
  }
}
