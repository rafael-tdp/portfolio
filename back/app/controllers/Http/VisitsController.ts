import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Visit from '../../mongodb/models/visit.js'
import Company from '../../mongodb/models/company.js'
import Application from '../../mongodb/models/application.js'

export default class VisitsController {
  /**
   * Extract domain from referer URL
   */
  private extractDomain(referer: string): string {
    if (!referer) return 'direct'
    try {
      const url = new URL(referer)
      // Remove www. prefix for cleaner display
      return url.hostname.replace(/^www\./, '')
    } catch {
      return 'direct'
    }
  }

  /**
   * Track a visit to a public candidature page.
   * POST /api/visits/track
   * Body: { slug: string, sessionId?: string }
   */
  public async track({ request, response }: HttpContextContract) {
    const { slug, sessionId } = request.body() || {}
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
    const ipRaw = request.header('x-forwarded-for') || request.header('x-real-ip') || request.ip() || 'unknown'
    const ip = typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown'
    const userAgent = request.header('user-agent') || ''
    const referer = request.header('referer') || ''
    const source = this.extractDomain(referer)

    // Ignore localhost visits (local development)
    const localhostIps = ['::1', '127.0.0.1', 'localhost', '::ffff:127.0.0.1']
    if (localhostIps.includes(ip)) {
      return response.ok({ success: true, skipped: true, reason: 'localhost' })
    }

    // Create visit record
    const visit = await Visit.create({
      application: (application as any)._id,
      company: companyId,
      ip,
      userAgent,
      referer,
      source,
      sessionId: sessionId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timeSpent: 0,
      sectionsViewed: {
        cv: false,
        coverLetter: false,
        skills: false,
        experiences: false,
        projects: false,
      },
      scrollDepth: 0,
    })

    return response.ok({ success: true, visitId: visit._id, sessionId: visit.sessionId })
  }

  /**
   * Update visit with engagement data (time spent, sections viewed, etc.)
   * POST /api/visits/update
   * Body: { visitId: string, timeSpent?: number, sectionsViewed?: object, scrollDepth?: number }
   */
  public async update({ request, response }: HttpContextContract) {
    const { visitId, timeSpent, sectionsViewed, scrollDepth } = request.body() || {}
    
    if (!visitId) {
      return response.badRequest({ error: 'visitId required' })
    }

    const updateData: any = {}
    if (typeof timeSpent === 'number') updateData.timeSpent = timeSpent
    if (typeof scrollDepth === 'number') updateData.scrollDepth = scrollDepth
    if (sectionsViewed) {
      // Merge with existing sections (don't overwrite true values with false)
      updateData['sectionsViewed.cv'] = sectionsViewed.cv || undefined
      updateData['sectionsViewed.coverLetter'] = sectionsViewed.coverLetter || undefined
      updateData['sectionsViewed.skills'] = sectionsViewed.skills || undefined
      updateData['sectionsViewed.experiences'] = sectionsViewed.experiences || undefined
      updateData['sectionsViewed.projects'] = sectionsViewed.projects || undefined
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key]
      })
    }

    if (Object.keys(updateData).length === 0) {
      return response.ok({ success: true, message: 'Nothing to update' })
    }

    await Visit.findByIdAndUpdate(visitId, { $set: updateData })
    
    return response.ok({ success: true })
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

    // Get all applications for this user (or all if none are linked)
    let applications = await Application.find({ user: user._id }).lean()
    
    // Fallback: if no applications are linked to user, get all applications
    // This handles legacy data where user wasn't set
    if (applications.length === 0) {
      applications = await Application.find({}).lean()
    }
    
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
   * Get detailed analytics for the authenticated user.
   * GET /api/visits/analytics
   */
  public async analytics({ request, response }: HttpContextContract) {
    const user = (request as any).user
    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    // Get all applications for this user
    let applications = await Application.find({ user: user._id }).lean()
    if (applications.length === 0) {
      applications = await Application.find({}).lean()
    }
    
    const appIds = applications.map((a: any) => a._id)

    if (appIds.length === 0) {
      return response.ok({
        visitsByDay: [],
        visitsByHour: [],
        deviceStats: [],
        browserStats: [],
        topApplications: [],
        recentActivity: [],
        totalVisits: 0,
        uniqueVisitors: 0,
        avgVisitsPerDay: 0,
      })
    }

    // Get date 30 days ago for time-based analytics
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Visits by day (last 30 days)
    const visitsByDay = await Visit.aggregate([
      { 
        $match: { 
          application: { $in: appIds },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ip' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      }
    ])

    // Visits by hour of day
    const visitsByHour = await Visit.aggregate([
      { $match: { application: { $in: appIds } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: '$_id',
          count: 1,
          _id: 0
        }
      }
    ])

    // Device stats from user agent
    const allVisits = await Visit.find({ application: { $in: appIds } })
      .select('userAgent source timeSpent sectionsViewed scrollDepth')
      .lean()

    const deviceCounts: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 }
    const browserCounts: Record<string, number> = {}
    const sourceCounts: Record<string, number> = { linkedin: 0, email: 0, direct: 0, google: 0, twitter: 0, other: 0 }
    const sectionCounts = { cv: 0, coverLetter: 0, skills: 0, experiences: 0, projects: 0 }
    let totalTimeSpent = 0
    let totalScrollDepth = 0
    let visitsWithTime = 0

    allVisits.forEach((v: any) => {
      const ua = v.userAgent || ''
      
      // Device detection
      if (/mobile/i.test(ua) && !/tablet/i.test(ua)) {
        deviceCounts.Mobile++
      } else if (/tablet|ipad/i.test(ua)) {
        deviceCounts.Tablet++
      } else if (ua) {
        deviceCounts.Desktop++
      } else {
        deviceCounts.Unknown++
      }

      // Browser detection
      let browser = 'Autre'
      if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'Chrome'
      else if (/firefox/i.test(ua)) browser = 'Firefox'
      else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
      else if (/edge|edg/i.test(ua)) browser = 'Edge'
      else if (/opera|opr/i.test(ua)) browser = 'Opera'
      
      browserCounts[browser] = (browserCounts[browser] || 0) + 1

      // Source tracking
      const source = v.source || 'direct'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1

      // Time spent tracking
      if (v.timeSpent && v.timeSpent > 0) {
        totalTimeSpent += v.timeSpent
        visitsWithTime++
      }

      // Scroll depth tracking
      if (v.scrollDepth && v.scrollDepth > 0) {
        totalScrollDepth += v.scrollDepth
      }

      // Sections viewed tracking
      if (v.sectionsViewed) {
        if (v.sectionsViewed.cv) sectionCounts.cv++
        if (v.sectionsViewed.coverLetter) sectionCounts.coverLetter++
        if (v.sectionsViewed.skills) sectionCounts.skills++
        if (v.sectionsViewed.experiences) sectionCounts.experiences++
        if (v.sectionsViewed.projects) sectionCounts.projects++
      }
    })

    const deviceStats = Object.entries(deviceCounts)
      .filter(([, count]) => count > 0)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)

    const browserStats = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top applications by visits
    const topApplications = await Visit.aggregate([
      { $match: { application: { $in: appIds } } },
      {
        $group: {
          _id: '$application',
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ip' },
          lastVisit: { $max: '$createdAt' }
        }
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: '_id',
          as: 'application'
        }
      },
      { $unwind: '$application' },
      {
        $lookup: {
          from: 'companies',
          localField: 'application.company',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          applicationId: '$_id',
          jobTitle: '$application.jobTitle',
          companyName: '$company.name',
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          lastVisit: 1,
          _id: 0
        }
      }
    ])

    // Recent activity (visits grouped by day with details)
    const recentActivity = await Visit.aggregate([
      { 
        $match: { 
          application: { $in: appIds },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyData'
        }
      },
      { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'applicationData'
        }
      },
      { $unwind: { path: '$applicationData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          userAgent: 1,
          source: 1,
          timeSpent: 1,
          sectionsViewed: 1,
          companyName: '$companyData.name',
          jobTitle: '$applicationData.jobTitle'
        }
      }
    ])

    // Calculate totals
    const totalVisits = allVisits.length
    const uniqueIps = new Set(allVisits.map((v: any) => v.ip)).size
    const daysWithVisits = visitsByDay.length || 1
    const avgVisitsPerDay = Math.round((totalVisits / Math.max(daysWithVisits, 1)) * 10) / 10
    const avgTimeSpent = visitsWithTime > 0 ? Math.round(totalTimeSpent / visitsWithTime) : 0
    const avgScrollDepth = totalVisits > 0 ? Math.round(totalScrollDepth / totalVisits) : 0

    // Source stats
    const sourceStats = Object.entries(sourceCounts)
      .filter(([, count]) => count > 0)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    // Section stats
    const sectionStats = [
      { section: 'CV', count: sectionCounts.cv, key: 'cv' },
      { section: 'Lettre de motivation', count: sectionCounts.coverLetter, key: 'coverLetter' },
      { section: 'Compétences', count: sectionCounts.skills, key: 'skills' },
      { section: 'Expériences', count: sectionCounts.experiences, key: 'experiences' },
      { section: 'Projets', count: sectionCounts.projects, key: 'projects' },
    ].sort((a, b) => b.count - a.count)

    return response.ok({
      visitsByDay,
      visitsByHour,
      deviceStats,
      browserStats,
      sourceStats,
      sectionStats,
      topApplications,
      recentActivity,
      totalVisits,
      uniqueVisitors: uniqueIps,
      avgVisitsPerDay,
      avgTimeSpent,
      avgScrollDepth,
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

  /**
   * Delete all visits.
   * DELETE /api/visits/all
   */
  public async deleteAll({ request, response }: HttpContextContract) {
    const user = (request as any).user
    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const result = await Visit.deleteMany({})
    
    return response.ok({
      success: true,
      deletedCount: result.deletedCount,
    })
  }
}
