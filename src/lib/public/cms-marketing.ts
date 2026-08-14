import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import { getPublishedPage } from '@/lib/cms/governed-cms'

export type MarketingLink = { label: string; href: string }
export type MarketingCard = { eyebrow?: string; title: string; body: string; href?: string; linkLabel?: string; bullets?: string[] }
export type MarketingSection = {
  type: 'cards' | 'steps' | 'split' | 'proof' | 'cta'
  eyebrow?: string
  title?: string
  body?: string
  cards?: MarketingCard[]
  bullets?: string[]
  primary?: MarketingLink
  secondary?: MarketingLink
  tone?: 'paper' | 'yellow' | 'pink' | 'ink'
  asset?: { src: string; alt: string }
}
export type MarketingPageDocument = {
  eyebrow: string
  title: string
  body: string
  primary?: MarketingLink
  secondary?: MarketingLink
  badges?: string[]
  heroAsset?: { src: string; alt: string }
  sections: MarketingSection[]
}
export type CmsMarketingPage = {
  slug: string
  title: string
  seo: { title?: string; description?: string }
  data: MarketingPageDocument
  published_at: string | null
}

export async function getCmsMarketingPage(slug: string): Promise<CmsMarketingPage> {
  noStore()
  const page = await getPublishedPage(slug)
  if (!page) throw new Error(`published_cms_page_missing:${slug}`)
  const data = page.data as MarketingPageDocument
  if (!data || !Array.isArray(data.sections) || typeof data.title !== 'string') throw new Error(`published_cms_page_invalid:${slug}`)
  return { slug: page.slug, title: page.title, seo: page.seo ?? {}, data, published_at: page.published_at }
}
