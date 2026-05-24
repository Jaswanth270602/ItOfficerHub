import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const site = (process.env.VITE_SITE_URL || 'https://itofficerhub.in').replace(/\/$/, '')
const lastmod = new Date().toISOString().slice(0, 10)

const catalog = JSON.parse(
  readFileSync(join(root, 'src/data/practice-catalog-seo.json'), 'utf8')
)

/** @param {string} path @param {number} priority @param {'daily'|'weekly'|'monthly'} changefreq */
function url(path, priority, changefreq = 'weekly') {
  const loc = path === '/' ? `${site}/` : `${site}${path.startsWith('/') ? path : `/${path}`}`
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`
}

const urls = [
  url('/', 1.0, 'daily'),
  url('/mocks', 0.9, 'daily'),
  url('/study', 0.9, 'daily'),
  url('/tcs-nqt', 0.75, 'weekly'),
  url('/syllabus', 0.75, 'weekly'),
  url('/ibps-so-it-officer', 0.88, 'weekly'),
]

for (const section of catalog.sections) {
  urls.push(url(`/study/${section.id}`, 0.85, 'weekly'))
  for (const sub of section.subtopics) {
    urls.push(url(`/study/${section.id}/${sub.slug}`, 0.8, 'weekly'))
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

const out = join(root, 'public/sitemap.xml')
writeFileSync(out, xml, 'utf8')
console.log(`[seo] Wrote ${urls.length} URLs to public/sitemap.xml (lastmod=${lastmod})`)
