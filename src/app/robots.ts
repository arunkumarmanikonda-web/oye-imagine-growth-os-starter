import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/client/',
          '/workspace/',
          '/auth/',
          '/login',
          '/signup',
          '/onboarding/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://oyeimagine.com/sitemap.xml',
    host: 'https://oyeimagine.com',
  }
}
