import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { cmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return cmsMarketingMetadata(await getCmsMarketingPage('integrations'))
}

export default async function IntegrationsPage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('integrations')} />
}
