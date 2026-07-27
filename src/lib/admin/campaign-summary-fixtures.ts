import { createCampaignSummaryDraftRecord } from "@/lib/admin/campaign-summary-schema";

export const campaignSummaryDraftFixture = createCampaignSummaryDraftRecord({
  id: "campaign-summary-pilot-demo",
  pilotId: "pilot-demo",
  workspaceId: "workspace-demo",
  status: "draft",
  campaignName: "Pilot Demo Campaign Summary",
  primaryGoal: "Book more qualified demos",
  coreOffer: "A connected growth system that turns traffic into conversations",
  channels: [
    "Landing Page",
    "Google Ads",
    "Email Sequence",
    "SMS",
    "WhatsApp",
  ],
  keyMessages: [
    "Lead with the strongest value proposition across every touchpoint.",
    "Keep proof and CTA progression consistent by channel.",
    "Reduce friction between first click and booked conversation.",
  ],
  nextSteps: [
    "Confirm campaign goals and launch window.",
    "Review asset consistency across owned and paid channels.",
    "Finalize execution checklist for launch.",
  ],
  notes: [
    "Fixture for campaign-summary tests and local development.",
  ],
});