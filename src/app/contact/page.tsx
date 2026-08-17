import type { Metadata } from 'next'
import { CmsMarketingPageView } from '@/components/public/CmsMarketingPage'
import { PublicContactForm } from '@/components/public/PublicContactForm'
import { buildCmsMarketingMetadata, getCmsMarketingPage } from '@/lib/public/cms-marketing'

export async function generateMetadata(): Promise<Metadata> {
  return buildCmsMarketingMetadata(await getCmsMarketingPage('contact'))
}

export default async function ContactPage() {
  return (
    <>
      <CmsMarketingPageView page={await getCmsMarketingPage('contact')} />
      <PublicContactForm />
    </>
  )
}
