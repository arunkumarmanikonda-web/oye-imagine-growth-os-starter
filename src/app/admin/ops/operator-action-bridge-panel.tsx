import React from "react";
import type { OperatorLaunchActionBridgeSummary } from "@/lib/ops/operator-launch-action-bridge";

function toneClass(value: boolean): string {
  return value
    ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
    : "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700";
}

function priorityClass(priority: string): string {
  if (priority === "critical") return "text-rose-700 bg-rose-100";
  if (priority === "high") return "text-amber-700 bg-amber-100";
  if (priority === "medium") return "text-sky-700 bg-sky-100";
  return "text-slate-700 bg-slate-100";
}

type OperatorActionBridgePanelProps = {
  companyName: string | null;
  bridge: OperatorLaunchActionBridgeSummary | null | undefined;
};

export function OperatorActionBridgePanel({
  companyName,
  bridge,
}: OperatorActionBridgePanelProps) {
  if (!bridge) {
    return null;
  }

  return (
    <section className="oi-card rounded-[32px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="oi-kicker">Operator action bridge</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {companyName ?? "Selected workspace"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Operator-facing launch action summary derived from release evidence, continuity state,
            managed-services queue pressure, and launch-readiness blockers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(bridge.highestPriority)}`}>
            Highest priority: {bridge.highestPriority}
          </span>
          <span className={toneClass(bridge.launchReady)}>
            Launch ready: {bridge.launchReady ? "yes" : "no"}
          </span>
          <span className={toneClass(bridge.managedQueueActionable)}>
            Queue actionable: {bridge.managedQueueActionable ? "yes" : "no"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Operator queues
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{bridge.operatorQueueCount}</div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Activation queues
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{bridge.activationQueueCount}</div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Queue owner
          </div>
          <div className="mt-3 text-lg font-semibold text-slate-950">{bridge.nextBestActionOwnerRole}</div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Queue types
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {bridge.operatorQueueTypes.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>


      <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-950">Queue summary</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Open approvals
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {bridge.queueSummary.openApprovals}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pending reports
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {bridge.queueSummary.pendingReports}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pending campaigns
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {bridge.queueSummary.pendingCampaigns}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pending strategy tasks
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {bridge.queueSummary.pendingStrategyTasks}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Active blockers
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {bridge.queueSummary.activeBlockers}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Next best action</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">{bridge.nextBestAction}</p>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Blocking checks</h3>
          {bridge.blockingChecks.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {bridge.blockingChecks.map((item) => (
                <li key={item}>{"\u2022 "}{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">No blocking checks.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Shared blockers</h3>
          {bridge.sharedBlockers.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {bridge.sharedBlockers.map((item) => (
                <li key={item}>{"\u2022 "}{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">No shared blockers.</p>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Continuity</h3>
          <p className="mt-3">
            <span className={toneClass(bridge.continuityReady)}>
              {bridge.continuityReady ? "Continuity ready" : "Continuity blocked"}
            </span>
          </p>
        </section>
      </div>
    </section>
  );
}
