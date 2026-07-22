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
    return "â€”";
  }
  return String(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "â€”";
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
    { label: "Export Settings CSV", href: "/api/admin/exports?kind=settings" },
    { label: "Export Versions CSV", href: "/api/admin/exports?kind=versions" },
    { label: "Export Audit CSV", href: "/api/admin/exports?kind=audit" },
  ];

  const statCards = data
    ? [
        { label: "Active Notes", value: formatValue(data.counts.activeNotes) },
        { label: "Archived Notes", value: formatValue(data.counts.archivedNotes) },
        { label: "Workspace Settings", value: formatValue(data.counts.workspaceSettings) },
        { label: "Setting Versions", value: formatValue(data.counts.settingVersions) },
        { label: "Recent Audit Events", value: formatValue(data.counts.recentAuditEvents) },
      ]
    : [];

  const latestCards = data
    ? [
        { label: "Latest Notes Activity", value: formatDateTime(data.latestActivity.notes) },
        { label: "Latest Settings Activity", value: formatDateTime(data.latestActivity.settings) },
        { label: "Latest Version Snapshot", value: formatDateTime(data.latestActivity.versions) },
        { label: "Latest Audit Event", value: formatDateTime(data.latestActivity.audit) },
      ]
    : [];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Admin Ops</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Release readiness dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Operational view for admin routes, safe environment checks, activity visibility, CSV exports, and release smoke validation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" href="/admin">
            Open Admin
          </Link>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/admin/settings">
            Open Settings
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading release statusâ€¦</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Active context</h2>
                  <p className="text-sm text-slate-500">Safe context snapshot from production data.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Generated {formatDateTime(data.generatedAt)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tenant ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-900">{formatValue(data.activeContext.tenantId)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-900">{formatValue(data.activeContext.brandId)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-900">{formatValue(data.activeContext.workspaceId)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-900">{formatValue(data.activeContext.source)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {latestCards.map((card) => (
                  <div key={card.label} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {data.warnings && data.warnings.length > 0 ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {data.warnings.join(" ")}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Environment flags</h2>
              <p className="mt-1 text-sm text-slate-500">Presence only. No secret values are displayed.</p>

              <div className="mt-5 space-y-3">
                {Object.entries(data.env).map(([key, present]) => (
                  <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{key}</span>
                    <span className={badgeClass(Boolean(present))}>{present ? "Present" : "Missing"}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick links</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <a className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={data.links.admin}>
                    /admin
                  </a>
                  <a className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={data.links.settings}>
                    /admin/settings
                  </a>
                  <a className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={data.links.ops}>
                    /admin/ops
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Smoke-test checklist</h2>
              <div className="mt-4 space-y-3">
                {smokeChecklist.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                    <input className="mt-1 h-4 w-4 rounded border-slate-300" type="checkbox" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Release-readiness checklist</h2>
              <div className="mt-4 space-y-3">
                {readinessChecklist.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                    <input className="mt-1 h-4 w-4 rounded border-slate-300" type="checkbox" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">CSV exports</h2>
            <p className="mt-1 text-sm text-slate-500">Use the current admin export endpoints for downloadable release artifacts.</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {exportLinks.map((item) => (
                <a
                  key={item.href}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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