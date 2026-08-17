import { PolicyPage } from '@/components/public/PolicyPage'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/accessibility',
  'Accessibility Statement | Oye !magine',
  'Review the Oye !magine accessibility commitment, WCAG 2.2 AA target, current scope and feedback route.'
)

export default function AccessibilityPage() {
  return (
    <PolicyPage
      eyebrow="Accessibility"
      title="Accessibility statement"
      summary="Oye !magine is committed to making its public website and core product experiences usable by as many people as reasonably possible, including people who navigate with a keyboard, screen reader, zoom or other assistive technology."
      lastUpdated="15 August 2026"
      sections={[
        {
          title: 'Accessibility target',
          body: 'Our target for customer-facing web experiences is WCAG 2.2 Level AA. This is an ongoing engineering and content standard rather than a claim that every current route has already completed independent WCAG conformance certification.'
        },
        {
          title: 'Current design and engineering practices',
          bullets: [
            'Keyboard-operable navigation and form controls on customer-facing routes.',
            'Visible focus handling and a skip link to the primary page content.',
            'Semantic headings, labels and primary content landmarks.',
            'Responsive layouts intended to support zoom and smaller viewports.',
            'Accessibility regressions treated as release defects when they affect core customer journeys.'
          ]
        },
        {
          title: 'Scope',
          body: 'This statement covers the primary public website, account access and customer-facing Growth OS experiences. Third-party services connected by a customer may have separate accessibility characteristics that are controlled by those providers.'
        },
        {
          title: 'Known limitations and verification',
          body: 'Accessibility testing is a continuing release activity. A complete independent WCAG audit, assistive-technology matrix and formal conformance report should not be inferred from this statement unless such evidence is published separately.'
        },
        {
          title: 'Feedback and support',
          body: <>If you encounter an accessibility barrier, please contact us at <a href="mailto:hello@oyeimagine.com">hello@oyeimagine.com</a> or through the Contact page with the affected URL, a description of the issue and, if relevant, the browser or assistive technology you were using.</>
        }
      ]}
    />
  )
}
