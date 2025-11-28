import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import puppeteer from 'puppeteer'

// Google Fonts to embed in PDF for consistent rendering across environments
const GOOGLE_FONTS_CSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important; }
</style>
`

export default class PdfController {
  public async generatePdf({ request, response }: HttpContextContract) {
    const body = request.only(['slug', 'url', 'debug', 'html', 'baseUrl', 'title'])
    const slug = body.slug
    const explicitUrl = body.url
    const debug = !!body.debug
    const htmlPayload = body.html
    const pdfTitle = body.title || 'Document'
    const baseUrl =
      body.baseUrl ||
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      'http://localhost:3000'

    let browser: puppeteer.Browser | null = null
    try {
      console.log('[PdfController] Launching browser...')
      
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
      console.log('[PdfController] Browser launched successfully')
      const page = await browser.newPage()
      console.log('[PdfController] New page created')
      
      // Set longer timeout for the page
      page.setDefaultTimeout(60000)
      page.setDefaultNavigationTimeout(60000)
      
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 }) // A4 en 96dpi

      if (htmlPayload) {
        // If user sends a fragment (e.g. #cv-content innerHTML), wrap into a full document
        let fullHtml = String(htmlPayload)
        const trimmed = fullHtml.trim().toLowerCase()
        if (!trimmed.startsWith('<!doctype') && !trimmed.startsWith('<html')) {
          // Ensure base tag so relative URLs resolve (images, fonts)
          fullHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${pdfTitle}</title><base href="${baseUrl}">${GOOGLE_FONTS_CSS}</head><body>${fullHtml}</body></html>`
        } else {
          // Inject Google Fonts into existing HTML head
          fullHtml = fullHtml.replace(/<head([^>]*)>/i, `<head$1>${GOOGLE_FONTS_CSS}`)
        }

        // Set content and wait for DOM to be ready
        console.log('[PdfController] Setting HTML content...')
        await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 60000 })
        console.log('[PdfController] Content loaded')

        // Wait for rendering to complete
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('[PdfController] Generating PDF...')

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          scale: 1,
          margin: { top: 0, left: 0, right: 0, bottom: 0 },
          timeout: 60000,
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
        timeout: 60000,
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
