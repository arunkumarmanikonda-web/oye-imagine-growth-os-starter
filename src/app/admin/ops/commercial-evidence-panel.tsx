import React from "react";
import type { CommercialEvidenceSummary } from "@/lib/ops/commercial-evidence-bridge";

function toneClass(value: boolean): string {
  return value
    ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
    : "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700";
}

function statusClass(status: "ready" | "blocked"): string {
  return status === "ready"
    ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
    : "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700";
}

type CommercialEvidencePanelProps = {
  companyName: string | null;
  evidence: CommercialEvidenceSummary | null | undefined;
};

export function CommercialEvidencePanel({
  companyName,
  evidence,
}: CommercialEvidencePanelProps) {
  if (!evidence) {
    return null;
  }

  return (
    <section className="oi-card rounded-[32px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="oi-kicker">Commercial evidence bridge</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {companyName ?? evidence.companyName}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Canonical commercial-review, provider, activation, and continuity evidence
            derived from the shared bridge foundation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={statusClass(evidence.commercialReviewStatus)}>
            Commercial review: {evidence.commercialReviewStatus}
          </span>
          <span className={statusClass(evidence.providerReadinessStatus)}>
            Providers: {evidence.providerReadinessStatus}
          </span>
          <span className={statusClass(evidence.activationStatus)}>
            Activation: {evidence.activationStatus}
          </span>
          <span className={toneClass(evidence.continuityReady)}>
            Continuity: {evidence.continuityReady ? "ready" : "blocked"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Shared blockers</h3>
          {evidence.sharedBlockers.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {evidence.sharedBlockers.map((item) => (
                <li key={item}>{"\u2022 "}{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">No shared blockers.</p>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Continuity blockers</h3>
          {evidence.continuityBlockers.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {evidence.continuityBlockers.map((item) => (
                <li key={item}>{"\u2022 "}{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">No continuity blockers.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Commercial review blockers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(evidence.commercialReviewBlockers.length
              ? evidence.commercialReviewBlockers
              : ["None"]).map((item) => (
              <li key={`commercial-${item}`}>{"\u2022 "}{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Provider blockers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(evidence.providerReadinessBlockers.length
              ? evidence.providerReadinessBlockers
              : ["None"]).map((item) => (
              <li key={`provider-${item}`}>{"\u2022 "}{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Activation blockers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(evidence.activationBlockers.length
              ? evidence.activationBlockers
              : ["None"]).map((item) => (
              <li key={`activation-${item}`}>{"\u2022 "}{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}