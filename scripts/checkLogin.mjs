import { chromium } from 'playwright'

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('console', (msg) => {
    console.log(`[browser:${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => {
    console.error(`[browser:error] ${err.message}`)
  })
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'login.png', fullPage: true })
  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
