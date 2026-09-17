import fs from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = path.resolve('dist')
const basePath = '/c1-trainer/'

async function readOutput(fileName) {
  return fs.readFile(path.join(outputDirectory, fileName), 'utf8')
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message)
}

const manifest = JSON.parse(await readOutput('manifest.webmanifest'))
const html = await readOutput('index.html')
const registration = await readOutput('registerSW.js')
const serviceWorker = await readOutput('sw.js')
const icon192 = await fs.stat(path.join(outputDirectory, 'icons/c1-trainer-192.png'))
const icon512 = await fs.stat(path.join(outputDirectory, 'icons/c1-trainer-512.png'))

assertCondition(manifest.name === 'C1 Trainer' && manifest.short_name === 'C1 Trainer', 'manifest name is incorrect')
assertCondition(manifest.start_url === basePath && manifest.scope === basePath, 'manifest base path is incorrect')
assertCondition(manifest.display === 'standalone' && manifest.lang === 'en', 'manifest display or language is incorrect')
assertCondition(manifest.icons.some((icon) => icon.sizes === '192x192'), '192x192 manifest icon is missing')
assertCondition(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose.includes('maskable')), '512x512 maskable manifest icon is missing')
assertCondition(html.includes(`${basePath}manifest.webmanifest`), 'manifest link does not use the configured base path')
assertCondition(html.includes(`${basePath}icons/c1-trainer-192.png`), 'Apple touch icon does not use the configured base path')
assertCondition(registration.includes(`${basePath}sw.js`) && registration.includes(`scope: '${basePath}'`), 'service-worker registration path is incorrect')
assertCondition(serviceWorker.includes('precacheAndRoute') && !serviceWorker.includes('http://') && !serviceWorker.includes('https://'), 'service worker contains unexpected network URLs')

const precacheEntries = serviceWorker.match(/url:/g)?.length ?? 0
const outputBytes = icon192.size + icon512.size + Buffer.byteLength(html) + Buffer.byteLength(registration) + Buffer.byteLength(serviceWorker)
assertCondition(precacheEntries > 0 && precacheEntries <= 12, `unexpected precache entry count: ${precacheEntries}`)
console.log(`PWA output verified: ${precacheEntries} precache entries; ${outputBytes} bytes across manifest/registration/service-worker/icons.`)
