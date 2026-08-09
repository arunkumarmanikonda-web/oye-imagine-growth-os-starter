import type { MetadataRoute } from 'next'

const baseUrl = 'https://oyeimagine.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: baseUrl + '/', lastModified: now, changeFrequency: 'daily' as const, priority: 1 },
    { url: baseUrl + '/platform', lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: baseUrl + '/solutions', lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: baseUrl + '/contact', lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: baseUrl + '/marketplace', lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }
  ]
}
