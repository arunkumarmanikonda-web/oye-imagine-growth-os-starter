import { describe, expect, it } from "vitest";
import { getResendRuntimeStatus } from "../../src/lib/support/resend-runtime";

describe("foundation resend runtime", () => {
  it("reports configuration required when api key is missing", () => {
    const status = getResendRuntimeStatus({});

    expect(status.configured).toBe(false);
    expect(status.status).toBe("configuration_required");
    expect(status.fromEmail).toBe("hello@oyeimagine.com");
  });

  it("reports ready when resend environment is present", () => {
    const status = getResendRuntimeStatus({
      RESEND_API_KEY: "re_test_key",
      RESEND_FROM_EMAIL: "ops@oyeimagine.com",
    });

    expect(status.configured).toBe(true);
    expect(status.status).toBe("ready");
    expect(status.fromEmail).toBe("ops@oyeimagine.com");
  });
});