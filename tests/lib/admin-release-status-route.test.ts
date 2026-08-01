import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin-route", () => ({
  requireAdmin: vi.fn(() => null),
}));

import { GET } from "../../src/app/api/admin/release-status/route";

const originalEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

describe("admin release-status route commercial evidence bridge", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.SUPABASE_SERVICE_ROLE_KEY;
    process.env.ADMIN_PASSWORD = originalEnv.ADMIN_PASSWORD;
  });

  it("returns bridged commercial evidence and shared blockers when a commercial signal is present", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/admin/release-status?" +
          [
            "tenantId=tenant_neejee",
            "intakeId=intake_neejee_3",
            "companyName=Neejee",
            "legalName=Neejee%20Retail%20Private%20Limited",
            "websiteUrl=neejee.com",
            "industry=Jewellery",
            "country=IN",
            "service=brand_strategy",
            "service=seo",
            "lane=growth_strategy",
            "clientTradeName=Neejee",
            "clientPrimaryContactName=Commercial%20Lead",
            "clientPrimaryContactEmail=finance%40neejee.example",
            "clientGstin=29ABCDE1234F1Z5",
            "businessEmail=finance%40neejee.example",
            "domainVerified=true",
            "businessEmailVerified=true",
            "authorizedRepresentativeName=Commercial%20Lead",
            "authorizedRepresentativeEmail=finance%40neejee.example",
            "authorizedRepresentativeVerified=true",
            "billingIdentityConfirmed=true",
            "billingModel=monthly_retainer",
            "baseFeeInr=125000",
            "paymentTerm=net_15",
            "contractSigned=true",
            "esignProviderReady=true",
            "subscriptionActive=true",
            "invoiceProfileReady=true",
            "paymentMethodReady=true",
            "approvalPolicyReady=true",
            "strategyGenerated=true",
            "strategyApproved=true",
            "invoiceStatus=paid",
            "approvalOpenCount=0",
            "auditCoverage=0.95",
            "mediaBalanceAmount=50000",
            "currency=INR",
            "esignCredentialsPresent=true",
            "esignBusinessVerified=false",
            "esignLiveAccountConnected=true",
            "esignWebhookConfigured=true",
            "esignCallbackVerified=true",
            "paymentGatewayCredentialsPresent=true",
            "paymentGatewayBusinessVerified=true",
            "paymentGatewayLiveAccountConnected=true",
            "paymentGatewayWebhookConfigured=true",
            "paymentGatewayCallbackVerified=true",
          ].join("&"),
      ),
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.commercialEvidence).toMatchObject({
      companyName: "Neejee",
      commercialReviewStatus: "blocked",
      providerReadinessStatus: "blocked",
      activationStatus: "blocked",
      continuityReady: true,
    });
    expect(body.commercialEvidence.commercialReviewBlockers).toContain(
      "Required providers are not production ready",
    );
    expect(body.commercialEvidence.providerReadinessBlockers).toContain(
      "esign: business verification incomplete",
    );
    expect(body.commercialEvidence.activationBlockers).toContain("eSign provider not ready");
    expect(body.commercialEvidence.sharedBlockers).toContain(
      "Required providers are not production ready",
    );

    expect(body.operatorActionBridge).toMatchObject({
      operatorQueueCount: 1,
      highestPriority: "medium",
      activationQueueCount: 1,
      nextBestAction: "Neejee: resolve 2 active blocker(s)",
      nextBestActionOwnerRole: "PROGRAM_MANAGER",
      managedQueueActionable: true,
      launchReady: false,
      continuityReady: true,
    });
    expect(body.operatorActionBridge.operatorQueueTypes).toContain("activation");
    expect(body.operatorActionBridge.blockingChecks).toContain(
      "commercial: commercial review",
    );
    expect(body.operatorActionBridge.blockingChecks).toContain(
      "providers: provider readiness",
    );
    expect(body.operatorActionBridge.blockingChecks).toContain(
      "activation: activation gate",
    );

    expect(body.warnings[0]).toMatch(/SUPABASE_SERVICE_ROLE_KEY/i);
  });

  it("returns null commercialEvidence when no commercial query signal is provided", async () => {
    const response = await GET(new Request("http://localhost/api/admin/release-status"));

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.commercialEvidence).toBeNull();
    expect(body.operatorActionBridge).toBeNull();
  });
});
