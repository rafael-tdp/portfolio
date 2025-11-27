import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import puppeteer from 'puppeteer'

export default class PdfController {
  public async generatePdf({ request, response }: HttpContextContract) {
    const body = request.only(['slug', 'url', 'debug', 'html', 'baseUrl'])
    const slug = body.slug
    const explicitUrl = body.url
    const debug = !!body.debug
    const htmlPayload = body.html
    const baseUrl =
      body.baseUrl ||
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      'http://localhost:3000'

    let browser: puppeteer.Browser | null = null
    try {
      browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      const page = await browser.newPage()
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 }) // A4 en 96dpi

      if (htmlPayload) {
        // If user sends a fragment (e.g. #cv-content innerHTML), wrap into a full document
        let fullHtml = String(htmlPayload)
        const trimmed = fullHtml.trim().toLowerCase()
        if (!trimmed.startsWith('<!doctype') && !trimmed.startsWith('<html')) {
          // Ensure base tag so relative URLs resolve (images, fonts)
          fullHtml = `<!doctype html><html><head><meta charset="utf-8"><base href="${baseUrl}"></head><body>${fullHtml}</body></html>`
        }

        await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30000 })

        // Wait for images to load
        try {
          await page.evaluate(async () => {
            const imgs = Array.from(((globalThis as any).document?.images) || [])
            await Promise.all(
              imgs.map((img: any) => {
                if (img.complete) return Promise.resolve()
                return new Promise((resolve) => {
                  img.onload = img.onerror = () => resolve(null)
                })
              })
            )
          })
        } catch (e) {
          // ignore
        }

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          scale: 1,
          margin: { top: 0, left: 0, right: 0, bottom: 0 },
        })

        if (debug) {
          const asB64 = Buffer.from(pdfBuffer).toString('base64')
          return response.ok({ pdfBase64: asB64 })
        }

        response.header('Content-Type', 'application/pdf')
        const filename = slug ? `cv-${slug}.pdf` : 'cv.pdf'
        response.header('Content-Disposition', `attachment; filename="${filename}"`)
        return response.send(pdfBuffer)
      }

      // Otherwise, try to navigate to candidate URLs (fallback behavior)
      const FRONTEND =
        process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'
      const candidates: string[] = []
      if (explicitUrl) candidates.push(explicitUrl)
      if (slug) {
        candidates.push(`${FRONTEND}/public-view/${encodeURIComponent(slug)}`)
        candidates.push(`${FRONTEND}/${encodeURIComponent(slug)}`)
        candidates.push(`${FRONTEND}/public/${encodeURIComponent(slug)}`)
        candidates.push(`${FRONTEND}/public-view/${encodeURIComponent(slug)}/print`)
      }
      if (candidates.length === 0)
        return response.badRequest({ error: 'slug or url or html required' })

      let navError: any = null
      let successfulUrl: string | null = null
      let resp: puppeteer.HTTPResponse | null = null
      for (const url of candidates) {
        try {
          resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
          if (resp && resp.status() >= 400) {
            navError = new Error(`navigation failed: ${url} -> ${resp.status()}`)
            continue
          }
          successfulUrl = url
          break
        } catch (e) {
          navError = e
          continue
        }
      }

      if (!successfulUrl)
        return response
          .status(502)
          .send({ error: 'Could not load target page', details: String(navError) })

      try {
        await page.waitForSelector('#cv-content', { timeout: 10000 })
      } catch (e) {}

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      })

      if (debug) {
        const asB64 = Buffer.from(pdfBuffer).toString('base64')
        return response.ok({ url: successfulUrl, pdfBase64: asB64 })
      }

      response.header('Content-Type', 'application/pdf')
      const filename = slug ? `cv-${slug}.pdf` : 'page.pdf'
      response.header('Content-Disposition', `attachment; filename="${filename}"`)
      return response.send(pdfBuffer)
    } catch (err) {
      console.error('[PdfController] generatePdf error', err)
      return response.status(500).send({ error: 'pdf generation failed', details: String(err) })
    } finally {
      try {
        if (browser) await browser.close()
      } catch (e) {}
    }
  }
}
