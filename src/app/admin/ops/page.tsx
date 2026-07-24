"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReleaseStatus = {
  ok: boolean;
  generatedAt: string;
  activeContext: {
    tenantId: string | null;
    brandId: string | null;
    workspaceId: string | null;
    source: string | null;
  };
  counts: {
    activeNotes: number | null;
    archivedNotes: number | null;
    workspaceSettings: number | null;
    settingVersions: number | null;
    recentAuditEvents: number | null;
  };
  latestActivity: {
    notes: string | null;
    settings: string | null;
    versions: string | null;
    audit: string | null;
  };
  env: Record<string, boolean>;
  links: {
    admin: string;
    settings: string;
    ops: string;
  };
  warnings?: string[];
};

function badgeClass(value: boolean): string {
  return value
    ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
    : "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700";
}

function formatValue(value: string | number | null): string {
  if (value === null || typeof value === "undefined") {
    return "—";
  }
  return String(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function AdminOpsPage() {
  const [data, setData] = useState<ReleaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const smokeChecklist = useMemo(
    () => [
      "Login page loads",
      "Admin dashboard loads",
      "Settings page loads",
      "Ops page loads",
      "CSV export links open",
      "Workspace settings save succeeds",
      "Version history renders",
    ],
    [],
  );

  const readinessChecklist = useMemo(
    () => [
      "Safe ops status endpoint deployed",
      "No secret values shown in UI",
      "CSV exports available",
      "Recent activity visible",
      "RLS hardening applied",
      "Production smoke test passes",
      "Secrets rotated outside the app",
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/release-status", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load release status.");
        }

        const json = (await response.json()) as ReleaseStatus;

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const exportLinks = [
    { label: "Export settings CSV", href: "/api/admin/exports?kind=settings" },
    { label: "Export versions CSV", href: "/api/admin/exports?kind=versions" },
    { label: "Export audit CSV", href: "/api/admin/exports?kind=audit" },
  ];

  const statCards = data
    ? [
        { label: "Active notes", value: formatValue(data.counts.activeNotes) },
        { label: "Archived notes", value: formatValue(data.counts.archivedNotes) },
        { label: "Workspace settings", value: formatValue(data.counts.workspaceSettings) },
        { label: "Setting versions", value: formatValue(data.counts.settingVersions) },
        { label: "Recent audit events", value: formatValue(data.counts.recentAuditEvents) },
      ]
    : [];

  const latestCards = data
    ? [
        { label: "Latest notes activity", value: formatDateTime(data.latestActivity.notes) },
        { label: "Latest settings activity", value: formatDateTime(data.latestActivity.settings) },
        { label: "Latest version snapshot", value: formatDateTime(data.latestActivity.versions) },
        { label: "Latest audit event", value: formatDateTime(data.latestActivity.audit) },
      ]
    : [];

  return (
    <main className="oi-shell mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="oi-card rounded-[32px] p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="oi-kicker">Operations console</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Release readiness dashboard
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Premium operational view for safe environment checks, recent activity, release gates, and export readiness across the admin surface.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="oi-button-primary" href="/admin">
                Open admin
              </Link>
              <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white" href="/admin/settings">
                Open settings
              </Link>
            </div>
          </div>

          <div className="min-w-[300px] rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="oi-brand-gradient h-2 w-24 rounded-full" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Release readiness</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Generated {data ? formatDateTime(data.generatedAt) : "—"}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="oi-card rounded-[28px] p-6 text-sm text-slate-600">Loading release status…</section>
      ) : null}

      {error ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</section>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <div key={card.label} className="oi-card rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <section className="oi-card rounded-[28px] p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="oi-kicker">Active context</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Safe context snapshot</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  live
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tenant ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-950">{formatValue(data.activeContext.tenantId)}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Brand ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-950">{formatValue(data.activeContext.brandId)}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-950">{formatValue(data.activeContext.workspaceId)}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Source</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-950">{formatValue(data.activeContext.source)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {latestCards.map((card) => (
                  <div key={card.label} className="rounded-[24px] border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">{card.value}</p>
                  </div>
                ))}
              </div>

              {data.warnings && data.warnings.length > 0 ? (
                <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {data.warnings.join(" ")}
                </div>
              ) : null}
            </section>

            <section className="oi-card rounded-[28px] p-6">
              <p className="oi-kicker">Environment flags</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Environment flags</h2>
              <p className="mt-3 text-sm text-slate-600">Presence only. No secret values are displayed.</p>

              <div className="mt-6 space-y-3">
                {Object.entries(data.env).map(([key, present]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{key}</span>
                    <span className={badgeClass(Boolean(present))}>{present ? "Present" : "Missing"}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick links</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white" href={data.links.admin}>
                    /admin
                  </a>
                  <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white" href={data.links.settings}>
                    /admin/settings
                  </a>
                  <a className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white" href={data.links.ops}>
                    /admin/ops
                  </a>
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <section className="oi-card rounded-[28px] p-6">
              <p className="oi-kicker">Smoke test</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Smoke test checklist</h2>
              <div className="mt-6 space-y-3">
                {smokeChecklist.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-[22px] border border-slate-200 p-4">
                    <input className="mt-1 h-4 w-4 rounded border-slate-300" type="checkbox" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="oi-card rounded-[28px] p-6">
              <p className="oi-kicker">Readiness</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Release readiness checklist</h2>
              <div className="mt-6 space-y-3">
                {readinessChecklist.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-[22px] border border-slate-200 p-4">
                    <input className="mt-1 h-4 w-4 rounded border-slate-300" type="checkbox" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </section>
          </section>

          <section className="oi-card rounded-[28px] p-6">
            <p className="oi-kicker">Exports</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">CSV exports</h2>
            <p className="mt-3 text-sm text-slate-600">Use the current admin export endpoints for downloadable release artifacts.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {exportLinks.map((item) => (
                <a
                  key={item.href}
                  className="oi-button-primary"
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}