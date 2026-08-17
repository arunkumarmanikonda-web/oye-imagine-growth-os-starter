import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { LeadershipSection } from '@/components/public/LeadershipSection'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('about'))
}

export default async function AboutPage() {
  const page = await getCmsMarketingPage('about')
  return (
    <>
      <CmsMarketingPageView page={page} />
      <LeadershipSection />
    </>
  )
}
