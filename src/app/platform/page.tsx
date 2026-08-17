import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('platform'))
}

export default async function PlatformPage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('platform')} />
}
