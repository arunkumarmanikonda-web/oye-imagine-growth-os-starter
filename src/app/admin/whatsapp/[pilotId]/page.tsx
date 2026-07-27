import React from "react";
import { generateWhatsappDraft } from "@/lib/admin/whatsapp-generator";
import { getWhatsappDraft } from "@/lib/admin/whatsapp-store";

import { RegenerateButton } from "./regenerate-button";

type WhatsappDraftPageProps = {
  params: Promise<{
    pilotId: string;
  }>;
};

function resolveDraft(pilotId: string) {
  const existingDraft = getWhatsappDraft();

  if (existingDraft && existingDraft.pilotId === pilotId) {
    return existingDraft;
  }

  return generateWhatsappDraft(pilotId);
}

export default async function WhatsappDraftPage({
  params,
}: WhatsappDraftPageProps) {
  const { pilotId } = await params;
  const draft = resolveDraft(pilotId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              WhatsApp Draft
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              {draft.senderName}
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
              <dt className="font-medium text-zinc-900">Goal</dt>
              <dd>{draft.goal}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-start gap-3">
          <RegenerateButton pilotId={pilotId} />
          <p className="text-sm text-zinc-500">
            Refresh this draft from the latest pilot, strategy, and channel assets.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-zinc-900">Messages</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Conversational WhatsApp follow-up aligned with your broader campaign system.
          </p>
        </div>

        <div className="grid gap-4">
          {draft.messages.map((message, index) => (
            <article
              key={message.id}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-zinc-900">
                  Message {index + 1}
                </h3>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {message.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">Notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600">
          {draft.notes.map((note, index) => (
            <li key={`${draft.id}-note-${index}`}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}