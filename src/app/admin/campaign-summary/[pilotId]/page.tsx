import React from "react";

import { generateCampaignSummaryDraft } from "@/lib/admin/campaign-summary-generator";
import { getCampaignSummaryDraft } from "@/lib/admin/campaign-summary-store";

import { RegenerateButton } from "./regenerate-button";

type CampaignSummaryPageProps = {
  params: Promise<{
    pilotId: string;
  }>;
};

function resolveDraft(pilotId: string) {
  const existingDraft = getCampaignSummaryDraft();

  if (existingDraft && existingDraft.pilotId === pilotId) {
    return existingDraft;
  }

  return generateCampaignSummaryDraft(pilotId);
}

export default async function CampaignSummaryPage({
  params,
}: CampaignSummaryPageProps) {
  const { pilotId } = await params;
  const draft = resolveDraft(pilotId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
              Campaign Summary
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              {draft.campaignName}
            </h1>
          </div>

          <dl className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-zinc-900">Pilot ID</dt>
              <dd>{draft.pilotId}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Status</dt>
              <dd className="capitalize">{draft.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Workspace</dt>
              <dd>{draft.workspaceId}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-900">Primary Goal</dt>
              <dd>{draft.primaryGoal}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-zinc-900">Core Offer</dt>
              <dd>{draft.coreOffer}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-start gap-3">
          <RegenerateButton pilotId={pilotId} />
          <p className="text-sm text-zinc-500">
            Refresh this summary from the latest pilot, strategy, and channel assets.
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Channels</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
            {draft.channels.map((channel, index) => (
              <li key={`${draft.id}-channel-${index}`}>{channel}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Key Messages</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
            {draft.keyMessages.map((message, index) => (
              <li key={`${draft.id}-message-${index}`}>{message}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Next Steps</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-700">
            {draft.nextSteps.map((step, index) => (
              <li key={`${draft.id}-step-${index}`}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Notes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
            {draft.notes.map((note, index) => (
              <li key={`${draft.id}-note-${index}`}>{note}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}