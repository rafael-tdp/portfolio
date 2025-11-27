/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { verifyAuth } from '#middleware/jwt_auth_middleware'
import fs from 'fs'
import path from 'path'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Serve uploaded assets from `public/uploads/...` (simple streaming route)
router.get('/uploads/companies/:companyId/:file', async (ctx: any) => {
  const { companyId, file } = ctx.params || {}
  if (!companyId || !file) return ctx.response.notFound()
  const fp = path.join(process.cwd(), 'public', 'uploads', 'companies', String(companyId), String(file))
  try {
    await fs.promises.access(fp, fs.constants.R_OK)
  } catch (e) {
    return ctx.response.notFound({ error: 'File not found' })
  }
  const ext = path.extname(fp).toLowerCase()
  const contentTypes: any = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml' }
  const ct = contentTypes[ext] || 'application/octet-stream'
  const data = await fs.promises.readFile(fp)
  // Allow cross-origin access to uploaded images so client-side canvas
  // can read pixels when using `crossOrigin="anonymous"` on <img>.
  ctx.response.header('Access-Control-Allow-Origin', '*')
  ctx.response.header('Content-Type', ct)
  ctx.response.header('Content-Length', String(data.length))
  return ctx.response.send(data)
})

// Note: CORS headers and OPTIONS preflight handling are applied in the
// `handler` wrapper for API routes. Avoid using `router.options` because
// the router implementation may not expose an `options` method.

// Helper to lazily import controllers using the #controllers/* import map
// and optionally run pre-handlers (like auth). `options.auth === true`
// will invoke `verifyAuth(ctx)` before calling the controller.
const handler = (controllerPath: string, method: string, options: { auth?: boolean } = {}) => {
  return async function (ctx: any) {
    // Allow cross-origin requests for API endpoints handled via this helper.
    // This sets CORS headers on responses and handles preflight OPTIONS requests.
    try {
      ctx.response.header('Access-Control-Allow-Origin', '*')
      ctx.response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      ctx.response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With')
    } catch (e) {
      // ignore if response helper not available for some reason
    }

    // Quick response for preflight requests. Some frameworks expose
    // `request.method` as a function, others as a string — handle both.
    try {
      let reqMethod = ''
      if (ctx.request) {
        if (typeof ctx.request.method === 'function') {
          reqMethod = String(ctx.request.method())
        } else if (typeof ctx.request.method === 'string') {
          reqMethod = ctx.request.method
        }
      }
      if (reqMethod && reqMethod.toUpperCase() === 'OPTIONS') {
        return ctx.response.status(204).send('')
      }
    } catch (e) {
      // If anything unexpected happens reading the method, continue to
      // normal handler flow rather than crashing the server.
      console.warn('[routes] could not read request.method for OPTIONS check', e)
    }
    if (options.auth) {
      const res = await verifyAuth(ctx)
      if (res) return res
    }

    // controllerPath should follow the import map, e.g. '#controllers/Http/AuthController.js'
    const mod = await import(controllerPath)
    const Controller = mod.default
    // If the controller is a class, instantiate it. Otherwise keep undefined.
    let inst: any = undefined
    try {
      if (typeof Controller === 'function') inst = new Controller()
    } catch (e) {
      // ignore instantiation errors; we'll try other call patterns below
    }

    // Try common patterns to call the handler:
    // 1) instance method: inst[method](ctx)
    // 2) static/class method: Controller[method](ctx)
    // 3) named export function: mod[method](ctx)
    const candidate = (inst && inst[method]) || Controller && Controller[method] || mod && (mod[method] || mod.default && mod.default[method])
    if (typeof candidate === 'function') {
      try {
        // If it's an instance method we should bind the instance
        if (inst && inst[method] === candidate) return candidate.call(inst, ctx)
        return candidate.call(Controller || mod, ctx)
      } catch (e) {
        // rethrow to let outer handler return a 500
        throw e
      }
    }

    // Provide a clearer error when the method is not found/callable.
    const details = {
      controllerPath,
      availableKeys: Object.keys(mod || {}),
      hasDefault: !!mod && !!mod.default,
      typeofDefault: typeof (mod && mod.default),
      requestedMethod: method,
    }
    console.error('[routes] controller method not callable', details)
    return ctx.response.status(500).send({ error: 'controller method not found', details })
  }
}

// Auth
router.post('/api/auth/register', handler('#controllers/Http/AuthController.js', 'register'))
router.post('/api/auth/login', handler('#controllers/Http/AuthController.js', 'login'))
router.get('/api/auth/me', handler('#controllers/Http/AuthController.js', 'me', { auth: true }))

// Companies (protect creation)
router.post('/api/companies', handler('#controllers/Http/CompaniesController.js', 'create', { auth: true }))
router.get('/api/companies', handler('#controllers/Http/CompaniesController.js', 'list'))
router.get('/api/companies/:id', handler('#controllers/Http/CompaniesController.js', 'show'))
// Protect logo upload with auth
router.post('/api/companies/:id/upload-logo', handler('#controllers/Http/CompaniesController.js', 'uploadLogo', { auth: true }))
// Allow authenticated updates to company (persist theme/colors)
router.patch('/api/companies/:id', handler('#controllers/Http/CompaniesController.js', 'update', { auth: true }))

// Applications (protect creation)
router.post('/api/applications', handler('#controllers/Http/ApplicationsController.js', 'create', { auth: true }))
router.get('/api/applications/:id', handler('#controllers/Http/ApplicationsController.js', 'show'))
router.get('/api/applications', handler('#controllers/Http/ApplicationsController.js', 'list', { auth: true }))
router.delete('/api/applications/:id', handler('#controllers/Http/ApplicationsController.js', 'destroy', { auth: true }))
router.patch('/api/applications/:id', handler('#controllers/Http/ApplicationsController.js', 'update', { auth: true }))

// Company logo processing - protected
router.post('/api/companies/:id/extract-colors', handler('#controllers/Http/CompaniesController.js', 'extractColors', { auth: true }))

// IA generation
router.post('/api/ia/generate-cover', handler('#controllers/Http/IaController.js', 'generateCover', { auth: true }))

// Public view
router.get('/public/:slug', handler('#controllers/Http/PublicController.js', 'showCompany'))

// Visit tracking (public endpoint for tracking, protected for stats)
router.post('/api/visits/track', handler('#controllers/Http/VisitsController.js', 'track'))
router.get('/api/visits/stats', handler('#controllers/Http/VisitsController.js', 'stats', { auth: true }))
router.get('/api/visits/application/:id', handler('#controllers/Http/VisitsController.js', 'byApplication', { auth: true }))

// PDF generation
router.post('/api/pdf/generate', handler('#controllers/Http/PdfController.js', 'generatePdf'))