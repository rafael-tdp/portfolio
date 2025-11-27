import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from '../../mongodb/models/company.js'
import mongoose from 'mongoose'
import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import StorageService from '../../services/StorageService.js'

// Logo optimization settings
const LOGO_MAX_WIDTH = 400  // Max width in pixels
const LOGO_MAX_HEIGHT = 400 // Max height in pixels
const LOGO_QUALITY = 80     // WebP quality (0-100)

export default class CompaniesController {
  public async create({ request, response }: HttpContextContract) {
    const body = request.only(['name', 'logoUrl'])
    if (!body.name) return response.badRequest({ error: 'name is required' })

    // generate unique publicSlug
    const publicSlug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(6)}`

    const company = await Company.create({ ...body, publicSlug })
    return response.created({ company })
  }

  public async uploadLogo({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })

    const company = await Company.findById(id)
    if (!company) return response.notFound({ error: 'Company not found' })

    try {
      let tmpPath: string | null = null

      // Try to get the uploaded file via Adonis request.file API
      try {
        const adonisFile: any = typeof request.file === 'function' 
          ? request.file('logo') || request.file('file') 
          : null
        
        if (adonisFile) {
          tmpPath = adonisFile.tmpPath || adonisFile.tmpFilePath || adonisFile.path
        }
      } catch (adonisErr) {
        console.warn('[CompaniesController] adonis request.file handling failed', adonisErr)
      }

      if (!tmpPath) {
        return response.badRequest({ error: 'No file uploaded' })
      }

      // Convert image to optimized WebP format
      const optimizedBuffer = await sharp(tmpPath)
        .resize(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT, {
          fit: 'inside',           // Maintain aspect ratio, fit within bounds
          withoutEnlargement: true // Don't upscale small images
        })
        .webp({ quality: LOGO_QUALITY })
        .toBuffer()

      // Clean up original temp file
      try { await fs.promises.unlink(tmpPath) } catch {}

      // Fixed filename: companies/{companyId}/logo.webp
      // All logos are now WebP format for consistency and compression
      const gcsPath = `companies/${id}/logo.webp`
      let savedUrl: string | null = null

      // Check if GCS is configured
      if (StorageService.isGCSConfigured()) {
        // Upload optimized WebP to Google Cloud Storage
        savedUrl = await StorageService.uploadBuffer(optimizedBuffer, gcsPath, 'image/webp')
        console.log('[CompaniesController] Logo uploaded to GCS:', savedUrl)
      } else {
        // Fallback to local storage
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'companies', id.toString())
        await fs.promises.mkdir(uploadsDir, { recursive: true })
        
        const targetPath = path.join(uploadsDir, 'logo.webp')
        await fs.promises.writeFile(targetPath, optimizedBuffer)
        
        savedUrl = `/uploads/companies/${id}/logo.webp`
        console.log('[CompaniesController] Logo saved locally:', savedUrl)
      }

      // Add cache buster to URL to force browser refresh
      const cacheBuster = `?v=${Date.now()}`
      company.logoUrl = savedUrl + cacheBuster
      await company.save()

      return response.created({ logoUrl: company.logoUrl })
    } catch (err) {
      console.error('Upload error', err)
      return response.internalServerError({ error: 'Logo upload failed' })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })

    let company
    if (mongoose.isValidObjectId(id)) {
      company = await Company.findById(id).lean()
    }
    if (!company) {
      // try by publicSlug
      company = await Company.findOne({ publicSlug: id }).lean()
    }
    if (!company) return response.notFound({ error: 'Company not found' })
    return response.ok({ company })
  }

  public async list({ request, response }: HttpContextContract) {
    const q = request.input('q') || ''
    const companies = await Company.find({ name: { $regex: q, $options: 'i' } }).limit(50).lean()
    return response.ok({ companies })
  }

  public async extractColors({ params, request, response }: HttpContextContract) {
    const id = params.id
    const { logoUrl } = request.only(['logoUrl'])
    if (!id) return response.badRequest({ error: 'id required' })

    const company = await Company.findById(id)
    if (!company) return response.notFound({ error: 'Company not found' })

    const url = logoUrl || company.logoUrl
    if (!url) return response.badRequest({ error: 'logoUrl is required' })

    try {
      let source = url
      // if relative path (served from our public folder), convert to filesystem path
      if (typeof source === 'string' && source.startsWith('/')) {
        source = path.join(process.cwd(), 'public', source.replace(/^\//, ''))
      }
      // Server no longer performs palette extraction. Return any persisted
      // theme and (optionally) stored raw colors in a normalized shape.
      const normalizeColors = (cols: Record<string, string>) => {
        const vals = Object.values(cols).filter(Boolean)
        const out: Record<string, string> = {}
        for (let i = 0; i < vals.length; i++) {
          out[`color${i + 1}`] = vals[i]
        }
        return out
      }

      const normalized = (company as any).colors ? normalizeColors((company as any).colors) : null
      const theme = company.theme || null

      // Ensure we persist the requested logoUrl on the company record
      company.logoUrl = url
      await company.save()

      return response.ok({ colors: normalized, theme })
    } catch (err) {
      console.error('Color extraction error', err)
      return response.internalServerError({ error: 'Failed to extract colors' })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const id = params.id
    if (!id) return response.badRequest({ error: 'id required' })

    const company = await Company.findById(id)
    if (!company) return response.notFound({ error: 'Company not found' })

    try {
      // Accept only a small set of updatable fields to avoid accidental mass-updates
      // We persist only `theme` (not raw `colors`) going forward.
      const payload = request.only(['theme', 'logoUrl', 'name'])
      if (payload.name) company.name = payload.name
      if (payload.logoUrl) company.logoUrl = payload.logoUrl
      if (payload.theme) company.theme = payload.theme

      await company.save()
      return response.ok({ company })
    } catch (err) {
      console.error('[CompaniesController] update error', err)
      return response.internalServerError({ error: 'Failed to update company' })
    }
  }
}
