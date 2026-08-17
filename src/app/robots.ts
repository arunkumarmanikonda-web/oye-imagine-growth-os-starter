import type { MetadataRoute } from 'next'

const siteUrl = 'https://www.oyeimagine.com'

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
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
