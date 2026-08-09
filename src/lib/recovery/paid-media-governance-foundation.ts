import {
  getCommercialAuditEvents,
  getCommercialOverview,
  listLedgerEntries,
  listMediaBalanceAccounts,
  listPendingApprovalRequests,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store";
import {
  buildCreativeAssetDraft,
  creativeDraftNeedsLegalReview,
} from "@/lib/execution/creative-workflows";

function sumAvailable(accounts: Array<{ availableBalance: number }>): number {
  return accounts.reduce((sum, item) => sum + item.availableBalance, 0);
}

function sumReserved(accounts: Array<{ reservedBalance: number }>): number {
  return accounts.reduce((sum, item) => sum + item.reservedBalance, 0);
}

function sumDebits(entries: Array<{ direction: string; amount: number }>): number {
  return entries
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + item.amount, 0);
}

export function getPaidMediaGovernanceExperience() {
  seedNeejeeCommercialState();

  const overview = getCommercialOverview();
  const accounts = listMediaBalanceAccounts();
  const pendingApprovals = listPendingApprovalRequests();
  const ledgerEntries = listLedgerEntries().slice(-8).reverse();
  const auditEvents = getCommercialAuditEvents().slice(-8).reverse();

  const creativeDraft = buildCreativeAssetDraft({
    platform: "meta_ads",
    objective: "lead_generation",
    offer: "Managed growth operating system",
    audience: "founders scaling acquisition with governed execution",
    hooks: [
      "Creative approval lane with media guardrails",
      "Budget governance before campaign release",
      "Paid media execution tied to proof and approvals",
    ],
    formats: ["static", "carousel", "reel"],
    claims: ["Guaranteed growth outcomes", "Launch in 24 hours"],
    disclaimer: "Performance depends on budget, readiness, offer quality, and platform policy approval.",
  });

  const legalReviewRequired = creativeDraftNeedsLegalReview(creativeDraft);

  return {
    title: "Creative, paid media and budget governance",
    subtitle: "D2 closes brochure-level gaps by turning creative compliance, media balance visibility, approval queues and budget evidence into governed operating surfaces.",
    summary: {
      tenantCount: overview.tenantCount,
      pendingApprovalCount: pendingApprovals.length,
      mediaAccountCount: accounts.length,
      auditEventCount: auditEvents.length,
      totalAvailableBalance: sumAvailable(accounts),
      totalReservedBalance: sumReserved(accounts),
      recentDebitAmount: sumDebits(ledgerEntries),
      legalReviewRequired,
    },
    overview,
    accounts,
    pendingApprovals,
    ledgerEntries,
    auditEvents,
    creativeDraft,
    governanceChecklist: [
      "Creative claims require substantiation or disclaimers before activation.",
      "Reserved media balance must exist before campaign spend is released.",
      "Approval queues must be visible to operators before budget adjustment.",
      "Ledger and audit events must preserve every budget movement.",
      "Paid media release must stay tied to proof assets and operator sign-off.",
    ],
  };
}
