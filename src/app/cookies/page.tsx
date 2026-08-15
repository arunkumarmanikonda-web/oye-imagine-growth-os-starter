import { PolicyPage } from '@/components/public/PolicyPage'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/cookies',
  'Cookie Policy | Oye !magine',
  'Review how Oye !magine uses essential, preference, analytics and marketing cookies and similar technologies.'
)

export default function CookiesPage() {
  return (
    <PolicyPage
      eyebrow="Legal and privacy"
      title="Cookie Policy"
      summary="This policy explains how Oye Imagine Private Limited uses cookies and similar browser technologies on oyeimagine.com and related product surfaces."
      lastUpdated="15 August 2026"
      sections={[
        {
          title: 'How we use cookies',
          bullets: [
            'Strictly necessary cookies may be used for authentication, session continuity, security, preference persistence and core product operation.',
            'Preference cookies may remember choices such as language or interface settings where enabled.',
            'Analytics cookies or equivalent technologies should only be used where configured to measure product and website usage.',
            'Marketing or advertising technologies, if introduced, should be activated only in accordance with applicable consent requirements.'
          ]
        },
        {
          title: 'Essential technologies',
          body: 'Some technologies are required for sign-in, fraud prevention, secure navigation and core service delivery. Where applicable law permits, these may operate without optional marketing consent because the requested service cannot function reliably without them.'
        },
        {
          title: 'Optional technologies and consent',
          body: 'Where Oye !magine deploys non-essential analytics, advertising or cross-site technologies, the website should provide an appropriate consent or preference mechanism before those technologies are activated where required by law.'
        },
        {
          title: 'Managing your choices',
          body: 'You may also control cookies through your browser. Blocking essential cookies can prevent authentication or other product features from working correctly. If a dedicated consent manager is enabled, its preference controls should be used for optional technologies.'
        },
        {
          title: 'Third-party services',
          body: 'Connected services may use their own cookies or similar technologies when a customer deliberately connects or embeds those services. Their use is also governed by the relevant provider terms and privacy notices.'
        },
        {
          title: 'Contact',
          body: 'Questions about cookies or privacy can be submitted through the Contact page or to hello@oyeimagine.com. Material changes to this policy should be reflected by updating the date shown above.'
        }
      ]}
    />
  )
}
