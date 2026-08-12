import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oyeimagine.com').replace(/\/$/, '')

const routes = [
  '/',
  '/platform',
  '/solutions',
  '/marketplace',
  '/trust',
  '/pricing',
  '/contact',
  '/demo',
  '/qualification',
  '/lead-capture',
  '/accessibility',
  '/case-studies',
  '/marketplace/ai',
  '/marketplace/specialists'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified
  }))
}