import React from "react";

import { generateSmsDraft } from "@/lib/admin/sms-generator";
import { getSmsDraft } from "@/lib/admin/sms-store";

import RegenerateButton from "./regenerate-button";

interface SmsPageProps {
  params: Promise<{
    pilotId: string;
  }>;
}

export default async function SmsDraftPage({
  params,
}: SmsPageProps) {
  const { pilotId } = await params;

  const persistedDraft = getSmsDraft();
  const draft =
    persistedDraft && persistedDraft.pilotId === pilotId
      ? persistedDraft
      : generateSmsDraft(pilotId);

  return (
    <main className="space-y-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            SMS draft
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {draft.senderName}
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600">{draft.goal}</p>
        </div>

        <RegenerateButton pilotId={pilotId} />
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Draft details
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Status</dt>
              <dd>{draft.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Sender</dt>
              <dd>{draft.senderName}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Workspace</dt>
              <dd>{draft.workspaceId}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Pilot</dt>
              <dd>{draft.pilotId}</dd>
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
          <h2 className="text-xl font-semibold text-neutral-900">Messages</h2>
          <p className="text-sm text-neutral-600">
            Short staged SMS follow-ups aligned to the broader campaign message.
          </p>
        </div>

        <div className="grid gap-4">
          {draft.messages.map((message) => (
            <article
              key={message.id}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {message.id}
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Delay: {message.sendDelayHours}h
                  </h3>
                  <p className="text-sm text-neutral-600">{message.goal}</p>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {message.body}
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