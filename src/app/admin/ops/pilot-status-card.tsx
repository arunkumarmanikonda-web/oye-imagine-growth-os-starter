import React from "react";

export type PilotStatusSummary = {
  ok: boolean;
  workspaceDisplayName: string;
  pilotId: string;
  status: string;
  completedFields: number;
  totalFields: number;
  completionPercent: number;
  missingFields: string[];
  lastUpdatedAt: string | null;
};

function completionClass(percent: number): string {
  if (percent >= 80) {
    return "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700";
  }

  if (percent >= 50) {
    return "inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700";
  }

  return "inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700";
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatPilotFieldLabel(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

export function PilotStatusCard(props: {
  pilotStatus: PilotStatusSummary | null;
  loading: boolean;
  error: string | null;
}) {
  const { pilotStatus, loading, error } = props;

  if (loading) {
    return (
      <section className="oi-card rounded-[28px] p-6">
        <p className="oi-kicker">Pilot readiness</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Neejee pilot status
        </h2>
        <p className="mt-3 text-sm text-slate-600">Loading pilot readiness...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Pilot readiness unavailable. {error}
      </section>
    );
  }

  if (!pilotStatus) {
    return (
      <section className="oi-card rounded-[28px] p-6">
        <p className="oi-kicker">Pilot readiness</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Neejee pilot status
        </h2>
        <p className="mt-3 text-sm text-slate-600">Pilot readiness unavailable.</p>
      </section>
    );
  }

  const visibleMissingFields = pilotStatus.missingFields.slice(0, 4);
  const additionalMissingCount = Math.max(
    pilotStatus.missingFields.length - visibleMissingFields.length,
    0,
  );

  return (
    <section className="oi-card rounded-[28px] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="oi-kicker">Pilot readiness</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Neejee pilot status
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {pilotStatus.workspaceDisplayName} pilot completion snapshot.
          </p>
        </div>

        <span className={completionClass(pilotStatus.completionPercent)}>
          {pilotStatus.completionPercent}% complete
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pilot ID
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {pilotStatus.pilotId}
          </p>
        </div>

        <div className="rounded-[24px] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Status
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {pilotStatus.status}
          </p>
        </div>

        <div className="rounded-[24px] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Completed fields
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {pilotStatus.completedFields} / {pilotStatus.totalFields}
          </p>
        </div>

        <div className="rounded-[24px] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Last updated
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {formatDateTime(pilotStatus.lastUpdatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Missing fields
        </p>

        {pilotStatus.missingFields.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleMissingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
              >
                {formatPilotFieldLabel(field)}
              </span>
            ))}

            {additionalMissingCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                +{additionalMissingCount} more
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            All required pilot fields are filled.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a className="oi-button-primary" href="/admin/pilot">
          Review pilot
        </a>
        <a
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          href="/admin/onboarding"
        >
          Open onboarding
        </a>
      </div>
    </section>
  );
}