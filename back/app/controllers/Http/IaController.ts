import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import env from '#start/env'
// Use global fetch when available (Node 18+). Fallback to dynamic import of node-fetch.
async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis)
  const mod = await import('node-fetch')
  return mod.default || mod
}
import Application from '../../mongodb/models/application.js'
import User from '../../mongodb/models/user.js'
import Company from '../../mongodb/models/company.js'

const GOOGLE_API_KEY = env.get('GOOGLE_API_KEY') || env.get('GOOGLE_KEY')
const GOOGLE_MODEL = env.get('GOOGLE_MODEL') || 'gemini-2.5-flash'

export default class IaController {
  public async generateCover({ request, response }: HttpContextContract) {
    const {
      userId,
      companyId,
      applicationId,
      jobTitle,
      jobDescription,
      tone = 'professionnel',
      length = 300,
      saveApplication = false,
    } = request.all()
    if (!companyId || !jobDescription)
      return response.badRequest({ error: 'companyId and jobDescription are required' })

    // prefer authenticated user attached by verifyAuth middleware, fall back to userId if provided
    const authUser = (request as any).user || null
    let user: any = null
    if (authUser) {
      user = authUser
    } else if (userId) {
      user = (await User.findById(userId).lean()) as any
    }
    const company = (await Company.findById(companyId).lean()) as any
    if (!company) return response.badRequest({ error: 'Invalid company' })

    // build prompt
    const prompt = `Rédige une lettre de motivation en français pour le poste "${jobTitle || 'poste non précisé'}" chez ${company.name}.\n\n
    Informations candidat: Rafael Tavares De Pinho.\n\n
    Description du poste:\n${jobDescription}\n\n
    Consignes: 
    Commence par "Madame, Monsieur,". Pas besoin de sujet, de date ou d'autres informations d'en-tête. Pas besoin non plus de signer la lettre.
    Ton: ${tone}. 
    Longueur: environ ${length} mots. 
    Base-toi exclusivement sur ces informations, sans ajouter de faits non fournis et sans inventer de compétences ou d’expériences.
    Je suis un récent diplômé de master en Ingénierie du Web avec 2 ans d'expérience en développement full-stack chez Ownest où j'ai travaillé avec Node.js (Express.js et NestJS), MongoDB, Jest et Vue.js.
    J'ai aussi réalisé des projets personnels et étudiants utilisant d'autres technologies (voir ci-après).
    La liste de mes compétences: 
    Langages principaux: JavaScript / TypeScript, HTML / CSS, Sass, (PHP, Java, Go, Twig)
    Cloud & DevOps: Git, GitHub Actions, Docker, AWS (EC2, PM2), GCS, Vercel / Heroku / Render
    Méthodologies & Standards: Agile/SCRUM, API REST, CI/CD, TDD, GitFlow, Clean Code
    Bases de données: PostgreSQL, MySQL, MongoDB
    Front-end: Vue.js, React, Next.js, Tailwind CSS
    Back-end: Node.js, NestJS, (Symfony, API Platform)
    Tests: Jest, PHPUnit
    Mobile: Android Studio, Flutter`
    try {
      if (!GOOGLE_API_KEY) {
        // fallback: simple template
        const fallback = `Bonjour ${company.name},\n\nJe suis ${user?.fullName || user?.email || 'candidat(e)'}... (version de fallback)\n\nCordialement.`
        
        // Only save if explicitly requested
        if (saveApplication) {
          if (applicationId) {
            const app = await Application.findByIdAndUpdate(
              applicationId,
              { coverLetter: fallback, coverLetterMeta: { model: 'fallback' } },
              { new: true }
            )
            return response.ok({ application: app, coverLetter: fallback, generated: true })
          }
          const app = await Application.create({
            company: company._id,
            user: user?._id,
            jobTitle,
            jobDescription,
            coverLetter: fallback,
            coverLetterMeta: { model: 'fallback' },
            status: 'draft',
          } as any)
          return response.ok({ application: app, coverLetter: fallback, generated: true })
        }
        return response.ok({ coverLetter: fallback, generated: true })
      }

      // Use official Google GenAI SDK (Gemini) when available. If SDK isn't
      // installed or fails, fall back to a single HTTP call.
      let content: string = ''
      try {
        const mod = await import('@google/genai')
        const GoogleGenAI = (mod as any).GoogleGenAI || (mod as any).default || mod
        const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY })
        // `generateContent` accepts `model` and `contents` per the SDK examples
        const sdkResp: any = await ai.models.generateContent({
          model: GOOGLE_MODEL,
          contents: prompt,
        })
        content = sdkResp?.text || sdkResp?.output?.[0]?.content || JSON.stringify(sdkResp)
      } catch (sdkErr) {
        console.warn('GenAI SDK unavailable or failed, falling back to HTTP call', sdkErr)

        // Minimal HTTP fallback (single attempt). This is less robust than
        // the SDK but helps when the package isn't installed.
        const fetcher = await getFetch()
        const url = `https://generativelanguage.googleapis.com/v1/models/${GOOGLE_MODEL}:generate?key=${GOOGLE_API_KEY}`
        let r: any = null
        try {
          r = await fetcher(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: { text: prompt },
              temperature: 0.2,
              maxOutputTokens: Math.min(1024, Math.floor(length * 2)),
            }),
          })
        } catch (err) {
          console.error('Gen AI fetch error', err)
          return response.internalServerError({
            error: 'IA generation failed',
            details: String(err),
          })
        }
        if (!r.ok) {
          const txt = await r.text().catch(() => '')
          console.error('Gen AI error', r.status, txt)
          return response.internalServerError({ error: 'IA generation failed', details: txt })
        }
        const json: any = await r.json()
        content =
          json?.candidates?.[0]?.content ||
          json?.output?.[0]?.content ||
          json?.result?.[0]?.content ||
          JSON.stringify(json)
      }

      // Only save if explicitly requested
      if (saveApplication) {
        if (applicationId) {
          const application = await Application.findByIdAndUpdate(
            applicationId,
            { coverLetter: content, coverLetterMeta: { model: GOOGLE_MODEL, prompt } },
            { new: true }
          )
          return response.ok({ application, coverLetter: content, generated: true })
        }
        const application = await Application.create({
          company: company._id,
          user: user?._id,
          jobTitle,
          jobDescription,
          coverLetter: content,
          coverLetterMeta: { model: GOOGLE_MODEL, prompt },
          status: 'draft',
        } as any)
        return response.ok({ application, coverLetter: content, generated: true })
      }
      return response.ok({ coverLetter: content, generated: true })
    } catch (err) {
      console.error('IA generation error', err)
      return response.internalServerError({ error: 'Generation failed' })
    }
  }
}
