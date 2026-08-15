import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { IntegrationEvidenceMatrix } from '@/components/public/IntegrationEvidenceMatrix'
import { cmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return cmsMarketingMetadata(await getCmsMarketingPage('integrations'))
}

export default async function IntegrationsPage() {
  const page = await getCmsMarketingPage('integrations')
  return <><CmsMarketingPageView page={page} /><IntegrationEvidenceMatrix /></>
}
