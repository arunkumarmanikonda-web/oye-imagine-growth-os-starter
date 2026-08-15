import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsMarketingPage('marketplace')
  return { title: page.seo.title ?? page.title, description: page.seo.description }
}

export default async function MarketplacePage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('marketplace')} />
}
