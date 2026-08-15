import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oyeimagine.com').replace(/\/$/, '')

const routes = [
  '/',
  '/about',
  '/platform',
  '/solutions',
  '/customers',
  '/customers/neejee',
  '/integrations',
  '/marketplace',
  '/pricing',
  '/trust',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/dpa',
  '/subprocessors',
  '/accessibility',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
