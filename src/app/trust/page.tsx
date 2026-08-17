import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('trust'))
}

export default async function TrustCenterPage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('trust')} />
}
