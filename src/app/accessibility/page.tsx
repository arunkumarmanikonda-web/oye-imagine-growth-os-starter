import {
  PublicCard,
  PublicContainer,
  PublicMain,
  PublicSectionBlock
} from "../../components/public/PublicPrimitives";

export default function AccessibilityPage() {
  return (
    <PublicMain>
      <PublicContainer className="oi-page-width-md">
        <PublicCard>
          <p className="oi-eyebrow">Accessibility</p>
          <h1>Accessibility statement</h1>
          <p className="oi-lead">
            Oye !magine is committed to providing a website experience that is usable and accessible to the broadest
            possible audience, including people using assistive technology and keyboard-only navigation.
          </p>

          <PublicSectionBlock>
            <h2>Current accessibility support</h2>
            <ul className="oi-list">
              <li>Keyboard-accessible navigation and interactive controls on public routes</li>
              <li>Visible focus handling and skip-link support for main content</li>
              <li>Accessible page structure with headings and primary content landmarks</li>
              <li>Automated accessibility regression checks for key public routes</li>
            </ul>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Scope</h2>
            <p>
              This statement currently applies to the main public website routes, including the home page, contact,
              demo, qualification, lead-capture, and accessibility pages.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Feedback and support</h2>
            <p>
              If you encounter an accessibility barrier, please contact us at{" "}
              <a href="mailto:hello@oyeimagine.com">hello@oyeimagine.com</a>{" "}
              with the page URL, the issue you observed, and the assistive technology or browser you were using.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Ongoing improvement</h2>
            <p>
              We review accessibility findings continuously and prioritize remediation for issues affecting navigation,
              forms, content structure, and readability.
            </p>
          </PublicSectionBlock>

          <PublicSectionBlock>
            <h2>Last reviewed</h2>
            <p>2026-08-11</p>
          </PublicSectionBlock>
        </PublicCard>
      </PublicContainer>
    </PublicMain>
  );
}