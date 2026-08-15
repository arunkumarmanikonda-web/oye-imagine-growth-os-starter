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
  '/marketplace/specialists',
  '/pricing',
  '/trust',
  '/contact',
  '/signup',
  '/accessibility',
  '/privacy',
  '/terms',
  '/cookies',
  '/dpa',
  '/subprocessors',
  '/status'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified
  }))
}
