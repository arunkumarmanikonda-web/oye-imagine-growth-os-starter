import { describe, expect, it } from "vitest";
import { buildCmsAiSuggestionBundle, listCmsAiCapabilities } from "../../src/lib/cms/ai-assist";

describe("foundation cms ai assist", () => {
  it("returns AI suggestion bundles for content generation", () => {
    const suggestion = buildCmsAiSuggestionBundle({
      entityType: "promotion",
      prompt: "premium performance marketing launch",
    });

    expect(suggestion.title).toContain("Premium performance marketing launch");
    expect(suggestion.ctaHref).toBe("mailto:hello@oyeimagine.com");
    expect(suggestion.bullets.length).toBe(3);
    expect(suggestion.complianceNotes.length).toBeGreaterThan(0);
  });

  it("lists supported AI-assisted operations", () => {
    const capabilities = listCmsAiCapabilities();

    expect(capabilities.length).toBeGreaterThanOrEqual(5);
    expect(capabilities.some((item) => item.includes("CTA"))).toBe(true);
  });
});