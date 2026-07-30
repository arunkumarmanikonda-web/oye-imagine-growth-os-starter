import { describe, expect, it } from "vitest";
import { oyeImagineOrganizationProfile, oyeImagineSupportChannels, oyeImagineSupportMailLogSeed } from "../../src/lib/foundation/organization-profile";

describe("foundation organization profile", () => {
  it("keeps canonical legal identity", () => {
    expect(oyeImagineOrganizationProfile.legalName).toBe("OYE IMAGINE PRIVATE LIMITED");
    expect(oyeImagineOrganizationProfile.cin).toBe("U47190UP2025PTC220916");
    expect(oyeImagineOrganizationProfile.gstin).toBe("09AAECO6856D1Z8");
    expect(oyeImagineOrganizationProfile.supportMailbox).toBe("hello@oyeimagine.com");
    expect(oyeImagineOrganizationProfile.contactPhones[0]?.value).toBe("+91 8 988 988 988");
  });

  it("exposes support channels and mail-log seed", () => {
    expect(oyeImagineSupportChannels.length).toBeGreaterThan(0);
    expect(oyeImagineSupportMailLogSeed.length).toBe(1);
    expect(oyeImagineSupportMailLogSeed[0]?.provider).toBe("resend");
  });
});