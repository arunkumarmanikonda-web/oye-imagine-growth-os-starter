import { describe, expect, it } from "vitest";
import {
  buildCommercialEvidenceBridgeFromSearchParamRecord,
  buildCommercialEvidenceBridgeFromUrlSearchParams,
} from "../../src/lib/ops/commercial-evidence-bridge";

describe("commercial evidence bridge", () => {
  it("builds shared commercial evidence and operator action bridge from url search params", () => {
    const result = buildCommercialEvidenceBridgeFromUrlSearchParams(
      new URLSearchParams([
        ["tenantId", "tenant_neejee"],
        ["intakeId", "intake_neejee_3"],
        ["companyName", "Neejee"],
        ["legalName", "Neejee Retail Private Limited"],
        ["websiteUrl", "neejee.com"],
        ["industry", "Jewellery"],
        ["country", "IN"],
        ["service", "brand_strategy"],
        ["service", "seo"],
        ["lane", "growth_strategy"],
        ["clientTradeName", "Neejee"],
        ["clientPrimaryContactName", "Commercial Lead"],
        ["clientPrimaryContactEmail", "finance@neejee.example"],
        ["clientGstin", "29ABCDE1234F1Z5"],
        ["businessEmail", "finance@neejee.example"],
        ["domainVerified", "true"],
        ["businessEmailVerified", "true"],
        ["authorizedRepresentativeName", "Commercial Lead"],
        ["authorizedRepresentativeEmail", "finance@neejee.example"],
        ["authorizedRepresentativeVerified", "true"],
        ["billingIdentityConfirmed", "true"],
        ["billingModel", "monthly_retainer"],
        ["baseFeeInr", "125000"],
        ["paymentTerm", "net_15"],
        ["contractSigned", "true"],
        ["esignProviderReady", "true"],
        ["subscriptionActive", "true"],
        ["invoiceProfileReady", "true"],
        ["paymentMethodReady", "true"],
        ["approvalPolicyReady", "true"],
        ["strategyGenerated", "true"],
        ["strategyApproved", "true"],
        ["invoiceStatus", "paid"],
        ["approvalOpenCount", "0"],
        ["auditCoverage", "0.95"],
        ["mediaBalanceAmount", "50000"],
        ["currency", "INR"],
        ["esignCredentialsPresent", "true"],
        ["esignBusinessVerified", "false"],
        ["esignLiveAccountConnected", "true"],
        ["esignWebhookConfigured", "true"],
        ["esignCallbackVerified", "true"],
        ["paymentGatewayCredentialsPresent", "true"],
        ["paymentGatewayBusinessVerified", "true"],
        ["paymentGatewayLiveAccountConnected", "true"],
        ["paymentGatewayWebhookConfigured", "true"],
        ["paymentGatewayCallbackVerified", "true"],
      ]),
    );

    expect(result.workspace?.intake.companyName).toBe("Neejee");
    expect(result.commercialEvidence).toMatchObject({
      companyName: "Neejee",
      commercialReviewStatus: "blocked",
      providerReadinessStatus: "blocked",
      activationStatus: "blocked",
      continuityReady: true,
    });
    expect(result.sharedBlockers).toContain("Required providers are not production ready");
    expect(result.operatorActionBridge).toMatchObject({
      operatorQueueCount: 1,
      activationQueueCount: 1,      queueSummary: {
        openApprovals: 0,
        pendingReports: 0,
        pendingCampaigns: 0,
        pendingStrategyTasks: 0,
        activeBlockers: 2,
      },
      nextBestAction: "Neejee: resolve 2 active blocker(s)",
      nextBestActionOwnerRole: "PROGRAM_MANAGER",
      launchReady: false,
    });
  });

  it("returns null summaries when no commercial signal is present", () => {
    const result = buildCommercialEvidenceBridgeFromSearchParamRecord({});

    expect(result.workspace).toBeNull();
    expect(result.commercialEvidence).toBeNull();
    expect(result.operatorActionBridge).toBeNull();
    expect(result.sharedBlockers).toEqual([]);
  });
});