import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Visit from '../../mongodb/models/visit.js'
import Company from '../../mongodb/models/company.js'
import Application from '../../mongodb/models/application.js'

export default class VisitsController {
  /**
   * Track a visit to a public candidature page.
   * POST /api/visits/track
   * Body: { slug: string }
   */
  public async track({ request, response }: HttpContextContract) {
    const { slug } = request.body() || {}
    if (!slug) {
      return response.badRequest({ error: 'slug required' })
    }

    // Find company by slug
    const company = await Company.findOne({ publicSlug: slug }).lean()
    if (!company) {
      return response.notFound({ error: 'Company not found' })
    }

    // Find associated application
    const companyId = (company as any)._id
    const application = await Application.findOne({ company: companyId })
      .sort({ createdAt: -1 })
      .lean()
    if (!application) {
      return response.notFound({ error: 'Application not found' })
    }

    // Extract visitor info from request
    const ip = request.ip?.() || request.header?.('x-forwarded-for') || request.header?.('x-real-ip') || 'unknown'
    const userAgent = request.header?.('user-agent') || ''
    const referer = request.header?.('referer') || ''

    // Create visit record
    const visit = await Visit.create({
      application: (application as any)._id,
      company: companyId,
      ip: typeof ip === 'function' ? ip() : ip,
      userAgent,
      referer,
    })

    return response.ok({ success: true, visitId: visit._id })
  }

  /**
   * Get visit statistics for the authenticated user's applications.
   * GET /api/visits/stats
   */
  public async stats({ request, response }: HttpContextContract) {
    const user = (request as any).user
    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    // Get all applications for this user
    const applications = await Application.find({ user: user._id }).lean()
    const appIds = applications.map((a: any) => a._id)

    if (appIds.length === 0) {
      return response.ok({ visits: [], totalVisits: 0, applications: [] })
    }

    // Get all visits for these applications
    const visits = await Visit.find({ application: { $in: appIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('company', 'name logoUrl publicSlug')
      .populate('application', 'jobTitle')
      .lean()

    // Aggregate stats per application
    const statsAgg = await Visit.aggregate([
      { $match: { application: { $in: appIds } } },
      {
        $group: {
          _id: '$application',
          totalVisits: { $sum: 1 },
          lastVisit: { $max: '$createdAt' },
          uniqueIps: { $addToSet: '$ip' },
        },
      },
    ])

    // Map stats to applications
    const appStats = applications.map((app: any) => {
      const stat = statsAgg.find((s: any) => String(s._id) === String(app._id))
      return {
        applicationId: app._id,
        jobTitle: app.jobTitle,
        companyId: app.company,
        totalVisits: stat?.totalVisits || 0,
        uniqueVisitors: stat?.uniqueIps?.length || 0,
        lastVisit: stat?.lastVisit || null,
      }
    })

    const totalVisits = statsAgg.reduce((sum: number, s: any) => sum + s.totalVisits, 0)

    return response.ok({
      visits,
      totalVisits,
      applications: appStats,
    })
  }

  /**
   * Get visits for a specific application.
   * GET /api/visits/application/:id
   */
  public async byApplication({ params, request, response }: HttpContextContract) {
    const user = (request as any).user
    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const appId = params.id
    if (!appId) {
      return response.badRequest({ error: 'Application ID required' })
    }

    // Verify the application belongs to the user
    const application = await Application.findById(appId).lean()
    if (!application) {
      return response.notFound({ error: 'Application not found' })
    }
    if (String((application as any).user) !== String(user._id)) {
      return response.forbidden({ error: 'Access denied' })
    }

    const visits = await Visit.find({ application: appId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const totalVisits = await Visit.countDocuments({ application: appId })
    const uniqueIps = await Visit.distinct('ip', { application: appId })

    return response.ok({
      visits,
      totalVisits,
      uniqueVisitors: uniqueIps.length,
    })
  }
}
