import React from "react";
import { buildCommercialEvidenceBridgeFromSearchParamRecord } from "@/lib/ops/commercial-evidence-bridge";
import { organizationProfile } from "../../../lib/recovery/organization-profile";
import { getRuntimeShellAudit } from "../../../lib/recovery/runtime-enforcement-foundation";

type SearchParamValue = string | string[] | undefined;
type SearchParamsShape = Record<string, SearchParamValue>;

function toneClass(status: "ready" | "verified" | "blocked"): string {
  return status === "ready" || status === "verified"
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
    : "border-rose-400/30 bg-rose-500/10 text-rose-200";
}

export default async function AdminRuntimePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsShape>;
}) {
  const audit = getRuntimeShellAudit();
  const resolved = (await searchParams) ?? {};

  const evidenceBridge = buildCommercialEvidenceBridgeFromSearchParamRecord(resolved);
  const workspace = evidenceBridge.workspace;
  const sharedBlockers = evidenceBridge.sharedBlockers;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Runtime enforcement</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{audit.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{audit.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Route guards</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {audit.flags.guardsEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Live session mode</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {audit.flags.liveSessionEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Protected prefixes</p>
              <p className="mt-3 text-3xl font-semibold text-white">{audit.protectedPrefixes.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Canonical trust binding</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>{organizationProfile.legalName}</p>
                <p>GSTIN: {organizationProfile.gstin}</p>
                <p>{organizationProfile.principalPlaceOfBusiness}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Public entry points</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {audit.publicEntryPoints.map((entryPoint) => (
                  <li key={entryPoint} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {entryPoint}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Governance rules</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {audit.governanceRules.map((rule) => (
                  <li key={rule} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Protected runtime policies</h2>
              <div className="mt-5 space-y-4">
                {audit.policies.map((policy) => (
                  <article key={policy.key} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-amber-300">{policy.surface}</p>
                        <h3 className="mt-2 text-lg font-medium text-white">{policy.prefix}</h3>
                      </div>
                      <div className="text-right text-sm text-white/70">
                        <p>Redirect: {policy.redirectTo}</p>
                        <p>Workspace required: {policy.requiresWorkspace ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {workspace ? (
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                      Activation evidence bridge
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">{workspace.intake.companyName}</h2>
                    <p className="mt-2 text-sm text-white/70">
                      Shared commercial-review, provider, activation, and continuity evidence for operator-facing runtime triage.
                    </p>
                  </div>
                  <div className="text-sm text-white/60">
                    <p>Tenant: {workspace.intake.tenantId}</p>
                    <p>Intake: {workspace.intake.intakeId}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <div className={`rounded-2xl border p-4 ${toneClass(workspace.readyForCommercialReview ? "ready" : "blocked")}`}>
                    <p className="text-xs uppercase tracking-[0.24em]">Commercial review</p>
                    <p className="mt-3 text-2xl font-semibold">
                      {workspace.readyForCommercialReview ? "ready" : "blocked"}
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${toneClass(workspace.providerReadiness.status === "ready" ? "ready" : "blocked")}`}>
                    <p className="text-xs uppercase tracking-[0.24em]">Providers</p>
                    <p className="mt-3 text-2xl font-semibold">{workspace.providerReadiness.status}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${toneClass(workspace.activationSummary.status === "ready" ? "ready" : "blocked")}`}>
                    <p className="text-xs uppercase tracking-[0.24em]">Activation</p>
                    <p className="mt-3 text-2xl font-semibold">{workspace.activationSummary.status}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${toneClass(workspace.continuitySummary.readyForActivation ? "ready" : "blocked")}`}>
                    <p className="text-xs uppercase tracking-[0.24em]">Continuity</p>
                    <p className="mt-3 text-2xl font-semibold">
                      {workspace.continuitySummary.readyForActivation ? "ready" : "blocked"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg font-medium text-white">Shared blockers</h3>
                    {sharedBlockers.length ? (
                      <ul className="mt-4 space-y-2 text-sm text-rose-200">
                        {sharedBlockers.map((blocker) => (
                          <li key={blocker}>• {blocker}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-emerald-200">None</p>
                    )}
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg font-medium text-white">Evidence sources</h3>
                    <div className="mt-4 space-y-4 text-sm text-white/75">
                      <div>
                        <p className="font-medium text-white">Commercial review blockers</p>
                        <ul className="mt-2 space-y-1">
                          {(workspace.commercialReviewBlockers.length
                            ? workspace.commercialReviewBlockers
                            : ["None"]).map((item) => (
                            <li key={`commercial-${item}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-white">Activation blockers</p>
                        <ul className="mt-2 space-y-1">
                          {(workspace.activationSummary.blockers.length
                            ? workspace.activationSummary.blockers
                            : ["None"]).map((item) => (
                            <li key={`activation-${item}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-white">Continuity blockers</p>
                        <ul className="mt-2 space-y-1">
                          {(workspace.continuitySummary.blockers.length
                            ? workspace.continuitySummary.blockers
                            : ["None"]).map((item) => (
                            <li key={`continuity-${item}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              </section>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}