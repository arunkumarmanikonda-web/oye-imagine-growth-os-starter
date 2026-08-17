import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('marketplace'))
}

export default async function MarketplacePage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('marketplace')} />
}
