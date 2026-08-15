import { buildMetadata } from '@/lib/seo/site'
import {
  PublicCard,
  PublicContainer,
  PublicMain,
  PublicSectionBlock
} from '../../components/public/PublicPrimitives'

export const metadata = buildMetadata(
  '/accessibility',
  'Accessibility Statement | Oye !magine',
  'Review the Oye !magine accessibility commitment, WCAG 2.2 AA target, current scope and feedback route.'
)

export default function AccessibilityPage() {
  return (
    <PublicMain>
      <PublicContainer className="oi-page-width-md">
        <PublicCard>
          <p className="oi-eyebrow">Accessibility</p>
          <h1>Accessibility statement</h1>
          <p className="oi-lead">
            Oye !magine is committed to making its public website and core product experiences usable by as many people as reasonably possible, including people who navigate with a keyboard, screen reader, zoom or other assistive technology.
          </p>

          <PublicSectionBlock>
            <h2>Accessibility target</h2>
            <p>
              Our target for customer-facing web experiences is WCAG 2.2 Level AA. This is an ongoing engineering and content standard rather than a claim that every current route has already completed independent WCAG conformance certification.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Current design and engineering practices</h2>
            <ul className="oi-list">
              <li>Keyboard-operable navigation and form controls on customer-facing routes</li>
              <li>Visible focus handling and a skip link to the primary page content</li>
              <li>Semantic headings, labels and primary content landmarks</li>
              <li>Responsive layouts intended to support zoom and smaller viewports</li>
              <li>Accessibility regressions treated as release defects when they affect core customer journeys</li>
            </ul>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Scope</h2>
            <p>
              This statement covers the primary public website, account access and customer-facing Growth OS experiences. Third-party services connected by a customer may have separate accessibility characteristics that are controlled by those providers.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Known limitations and verification</h2>
            <p>
              Accessibility testing is a continuing release activity. A complete independent WCAG audit, assistive-technology matrix and formal conformance report should not be inferred from this statement unless such evidence is published separately.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Feedback and support</h2>
            <p>
              If you encounter an accessibility barrier, please contact us at{' '}
              <a href="mailto:hello@oyeimagine.com">hello@oyeimagine.com</a>{' '}
              or through the Contact page with the affected URL, a description of the issue and, if relevant, the browser or assistive technology you were using.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Last reviewed</h2>
            <p>15 August 2026</p>
          </PublicSectionBlock>
        </PublicCard>
      </PublicContainer>
    </PublicMain>
  )
}
