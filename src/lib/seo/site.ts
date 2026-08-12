import type { Metadata } from 'next'

export const siteName = 'OYE Imagine'
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3060').replace(/\/$/, '')
export const defaultDescription =
  'OYE Imagine helps enterprise teams launch guided demos, qualification flows, marketplaces, and conversion-ready public experiences.'
export const defaultOgImage = '/favicon.ico'

export type FaqItem = {
  question: string
  answer: string
}

export function absoluteUrl(path: string) {
  return path === '/' ? siteUrl : `${siteUrl}${path}`
}

export function buildMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      type: 'website',
      images: [{ url: defaultOgImage }]
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [defaultOgImage]
    }
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl
  }
}

export function faqPageJsonLd(path: string, title: string, items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: title,
    url: absoluteUrl(path),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}

export function productJsonLd(path: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: absoluteUrl(path),
    brand: {
      '@type': 'Brand',
      name: siteName
    }
  }
}