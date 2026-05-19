import { join } from 'path'
import { slugify } from '@/lib/utils'

export async function takeScreenshot(url: string, title: string): Promise<string | null> {
  if (!url) return null

  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    const slug = slugify(title)
    const filename = `${slug}.png`
    const destPath = join(process.cwd(), 'public', 'covers', filename)

    await page.screenshot({ path: destPath, type: 'png' })
    await browser.close()

    return `/covers/${filename}`
  } catch (err) {
    console.error('Screenshot failed:', err)
    return null
  }
}
