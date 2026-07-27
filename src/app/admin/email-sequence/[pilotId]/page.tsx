import React from "react";

import { generateEmailSequenceDraft } from "@/lib/admin/email-sequence-generator";
import { getEmailSequenceDraft } from "@/lib/admin/email-sequence-store";

import RegenerateButton from "./regenerate-button";

interface EmailSequencePageProps {
  params: Promise<{
    pilotId: string;
  }>;
}

export default async function EmailSequenceDraftPage({
  params,
}: EmailSequencePageProps) {
  const { pilotId } = await params;

  const persistedDraft = getEmailSequenceDraft();
  const draft =
    persistedDraft && persistedDraft.pilotId === pilotId
      ? persistedDraft
      : generateEmailSequenceDraft(pilotId);

  return (
    <main className="space-y-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Email sequence draft
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {draft.sequenceName}
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600">
            {draft.strategySummary}
          </p>
        </div>

        <RegenerateButton pilotId={pilotId} />
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Sequence details
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Status</dt>
              <dd>{draft.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Sender</dt>
              <dd>
                {draft.senderName} ({draft.senderEmail})
              </dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Workspace</dt>
              <dd>{draft.workspaceId}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Landing page</dt>
              <dd>
                <a
                  href={draft.landingPageUrl}
                  className="text-blue-600 underline"
                >
                  {draft.landingPageUrl}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Audience
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Persona</dt>
              <dd>{draft.audience.persona}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Pain point</dt>
              <dd>{draft.audience.painPoint}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Desired outcome</dt>
              <dd>{draft.audience.desiredOutcome}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Emails</h2>
          <p className="text-sm text-neutral-600">
            Ordered sequence for lifecycle follow-up and reply conversion.
          </p>
        </div>

        <div className="grid gap-4">
          {draft.emails.map((email) => (
            <article
              key={email.id}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {email.id}
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {email.subject}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {email.previewText}
                  </p>
                </div>

                <div className="text-right text-sm text-neutral-600">
                  <p>Delay: Day {email.sendDelayDays}</p>
                  <p>Goal: {email.goal}</p>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {email.body}
              </div>

              <div className="mt-4 text-sm">
                <span className="font-medium text-neutral-900">CTA:</span>{" "}
                <a href={email.ctaHref} className="text-blue-600 underline">
                  {email.ctaLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Notes
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          {draft.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}