import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminRuntimePage from "../../src/app/admin/runtime/page";

describe("admin runtime page activation evidence bridge", () => {
  it("renders the evidence bridge and shared blockers when commercial inputs are present", async () => {
    const element = await AdminRuntimePage({
      searchParams: Promise.resolve({
        tenantId: "tenant_neejee",
        intakeId: "intake_neejee_3",
        companyName: "Neejee",
        legalName: "Neejee Retail Private Limited",
        websiteUrl: "neejee.com",
        industry: "Jewellery",
        country: ["IN"],
        service: ["brand_strategy", "seo"],
        lane: ["growth_strategy"],
        clientTradeName: "Neejee",
        clientPrimaryContactName: "Commercial Lead",
        clientPrimaryContactEmail: "finance@neejee.example",
        clientGstin: "29ABCDE1234F1Z5",
        businessEmail: "finance@neejee.example",
        domainVerified: "true",
        businessEmailVerified: "true",
        authorizedRepresentativeName: "Commercial Lead",
        authorizedRepresentativeEmail: "finance@neejee.example",
        authorizedRepresentativeVerified: "true",
        billingIdentityConfirmed: "true",
        billingModel: "monthly_retainer",
        baseFeeInr: "125000",
        paymentTerm: "net_15",
        contractSigned: "true",
        esignProviderReady: "true",
        subscriptionActive: "true",
        invoiceProfileReady: "true",
        paymentMethodReady: "true",
        approvalPolicyReady: "true",
        strategyGenerated: "true",
        strategyApproved: "true",
        invoiceStatus: "paid",
        approvalOpenCount: "0",
        auditCoverage: "0.95",
        mediaBalanceAmount: "50000",
        currency: "INR",
        esignCredentialsPresent: "true",
        esignBusinessVerified: "false",
        esignLiveAccountConnected: "true",
        esignWebhookConfigured: "true",
        esignCallbackVerified: "true",
        paymentGatewayCredentialsPresent: "true",
        paymentGatewayBusinessVerified: "true",
        paymentGatewayLiveAccountConnected: "true",
        paymentGatewayWebhookConfigured: "true",
        paymentGatewayCallbackVerified: "true",
      }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Activation evidence bridge");
    expect(html).toContain("Commercial review");
    expect(html).toContain("Providers");
    expect(html).toContain("Activation");
    expect(html).toContain("Continuity");
    expect(html).toContain("Shared blockers");
    expect(html).toContain("Required providers are not production ready");
    expect(html).toContain("eSign provider not ready");
    expect(html).toContain("\u2022 Required providers are not production ready");
    expect(html).not.toContain("â€¢");
    expect(html).not.toContain("Ã¢â‚¬Â¢");
  });

  it("omits the evidence bridge when no commercial query inputs are provided", async () => {
    const element = await AdminRuntimePage({
      searchParams: Promise.resolve({}),
    });

    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("Activation evidence bridge");
    expect(html).not.toContain("Shared blockers");
  });
});
