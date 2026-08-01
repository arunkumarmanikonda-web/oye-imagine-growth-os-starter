import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CommercialEvidencePanel } from "../../src/app/admin/ops/commercial-evidence-panel";

describe("admin ops commercial evidence panel", () => {
  it("renders canonical evidence statuses and blockers", () => {
    const html = renderToStaticMarkup(
      <CommercialEvidencePanel
        companyName="Neejee"
        evidence={{
          companyName: "Neejee",
          commercialReviewStatus: "blocked",
          commercialReviewBlockers: ["Required providers are not production ready"],
          providerReadinessStatus: "blocked",
          providerReadinessBlockers: ["esign: business verification incomplete"],
          activationStatus: "blocked",
          activationBlockers: ["eSign provider not ready"],
          continuityReady: true,
          continuityBlockers: [],
          sharedBlockers: [
            "Required providers are not production ready",
            "eSign provider not ready",
          ],
        }}
      />,
    );

    expect(html).toContain("Commercial evidence bridge");
    expect(html).toContain("Neejee");
    expect(html).toContain("Commercial review: blocked");
    expect(html).toContain("Providers: blocked");
    expect(html).toContain("Activation: blocked");
    expect(html).toContain("Continuity: ready");
    expect(html).toContain("Required providers are not production ready");
    expect(html).toContain("esign: business verification incomplete");
    expect(html).toContain("eSign provider not ready");
    expect(html).toContain("• Required providers are not production ready");
    expect(html).not.toContain("\u00E2\u20AC\u00A2");
  });

  it("returns no markup when evidence is absent", () => {
    const html = renderToStaticMarkup(
      <CommercialEvidencePanel companyName={null} evidence={null} />,
    );

    expect(html).toBe("");
  });
});