import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('customers'))
}

export default async function CustomersPage() {
  return <CmsMarketingPageView page={await getCmsMarketingPage('customers')} />
}
