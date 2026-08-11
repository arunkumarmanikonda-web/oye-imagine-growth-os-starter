export default function AccessibilityPage() {
  return (
    <main className="oi-section">
      <div className="oi-container" style={{ maxWidth: 880 }}>
        <div className="oi-card">
          <p className="oi-eyebrow">Accessibility</p>
          <h1>Accessibility statement</h1>
          <p className="oi-lead">
            Oye !magine is committed to providing a website experience that is usable and accessible to the broadest
            possible audience, including people using assistive technology and keyboard-only navigation.
          </p>

          <section style={{ marginTop: 24 }}>
            <h2>Current accessibility support</h2>
            <ul className="oi-list">
              <li>Keyboard-accessible navigation and interactive controls on public routes</li>
              <li>Visible focus handling and skip-link support for main content</li>
              <li>Accessible page structure with headings and primary content landmarks</li>
              <li>Automated accessibility regression checks for key public routes</li>
            </ul>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Scope</h2>
            <p>
              This statement currently applies to the main public website routes, including the home page, contact,
              demo, qualification, lead-capture, and accessibility pages.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Feedback and support</h2>
            <p>
              If you encounter an accessibility barrier, please contact us at{" "}
              <a href="mailto:hello@oyeimagine.com">hello@oyeimagine.com</a>{" "}
              with the page URL, the issue you observed, and the assistive technology or browser you were using.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Ongoing improvement</h2>
            <p>
              We review accessibility findings continuously and prioritize remediation for issues affecting navigation,
              forms, content structure, and readability.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Last reviewed</h2>
            <p>2026-08-11</p>
          </section>
        </div>
      </div>
    </main>
  );
}