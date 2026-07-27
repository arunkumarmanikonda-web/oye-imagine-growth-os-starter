import React from "react";

import { generateExecutionPlanDraft } from "@/lib/admin/execution-plan-generator";
import { getExecutionPlanDraft } from "@/lib/admin/execution-plan-store";

import { RegenerateButton } from "./regenerate-button";

type ExecutionPlanPageProps = {
  params: Promise<{
    pilotId: string;
  }>;
};

function renderList(items: string[]) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No items available.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function ExecutionPlanPage({
  params,
}: ExecutionPlanPageProps) {
  const { pilotId } = await params;

  const persistedDraft = getExecutionPlanDraft();
  const draft =
    persistedDraft && persistedDraft.pilotId === pilotId
      ? persistedDraft
      : generateExecutionPlanDraft({ pilotId });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Execution Plan
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {draft.campaignName}
        </h1>
        <p className="text-sm text-slate-600">
          Pilot: <span className="font-medium">{draft.pilotId}</span>
        </p>
        <p className="text-sm text-slate-600">
          Workspace: <span className="font-medium">{draft.workspaceId}</span>
        </p>
        <p className="text-sm text-slate-600">
          Status: <span className="font-medium">{draft.status}</span>
        </p>
        <p className="text-sm text-slate-600">
          Generated: <span className="font-medium">{draft.generatedAt}</span>
        </p>
        <p className="text-sm text-slate-600">
          Updated: <span className="font-medium">{draft.lastUpdatedAt}</span>
        </p>
        <div className="pt-2">
          <RegenerateButton pilotId={pilotId} />
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Launch window</h2>
        <p className="mt-2 text-sm text-slate-700">{draft.launchWindow}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
        <div className="mt-3">{renderList(draft.milestones)}</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Owners</h2>
        <div className="mt-3">{renderList(draft.owners)}</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Blockers</h2>
        <div className="mt-3">{renderList(draft.blockers)}</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Checklist</h2>
        <div className="mt-3">{renderList(draft.checklist)}</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
        <div className="mt-3">{renderList(draft.notes)}</div>
      </section>
    </main>
  );
}