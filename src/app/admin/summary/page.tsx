"use client";

import { useEffect, useMemo, useState } from "react";

type SummaryPayload = {
  ok: boolean;
  activeContext: {
    tenantId: string | null;
    brandId: string | null;
    workspaceId: string | null;
  };
  onboarding: {
    company_profile?: Record<string, unknown>;
    goals?: Record<string, unknown>;
    channels?: string[];
    brand?: Record<string, unknown>;
  };
  strategy: Record<string, unknown>;
  execution: Record<string, unknown>;
  executionSummary: {
    total: number;
    todo: number;
    doing: number;
    blocked: number;
    done: number;
  };
  counts: {
    settings: number;
    versions: number;
    audit: number;
  };
  latestUpdatedAt: string | null;
  recentAudit: Array<{
    id: string;
    action: string;
    target_type?: string | null;
    target_id?: string | null;
    created_at?: string | null;
  }>;
  links: {
    admin: string;
    onboarding: string;
    strategy: string;
    execution: string;
    summary: string;
  };
};

export default function AdminSummaryPage() {
  const [data, setData] = useState<SummaryPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/summary", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.detail || payload.error || "Failed to load admin summary");
      }

      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const channels = useMemo(() => {
    if (!data?.onboarding?.channels) return [];
    return data.onboarding.channels;
  }, [data]);

  const priorities = useMemo(() => {
    const value = data?.strategy?.priorities;
    return Array.isArray(value) ? value : [];
  }, [data]);

  const metrics = useMemo(() => {
    const value = data?.strategy?.metrics;
    return Array.isArray(value) ? value : [];
  }, [data]);

  const tasks = useMemo(() => {
    const value = data?.execution?.tasks;
    return Array.isArray(value) ? value : [];
  }, [data]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-neutral-500">Loading admin summary…</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">Admin summary unavailable</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Unknown error"}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const company = (data.onboarding.company_profile ?? {}) as Record<string, unknown>;
  const goals = (data.onboarding.goals ?? {}) as Record<string, unknown>;
  const brand = (data.onboarding.brand ?? {}) as Record<string, unknown>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">Admin summary</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Workspace summary dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600">
            Review onboarding, strategy, execution, counts, and recent audit activity in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={data.links.admin} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Admin home
          </a>
          <a href={data.links.onboarding} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Onboarding
          </a>
          <a href={data.links.strategy} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Strategy
          </a>
          <a href={data.links.execution} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Execution
          </a>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Settings</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.counts.settings}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Versions</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.counts.versions}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Audit</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.counts.audit}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.executionSummary.total}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Doing</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.executionSummary.doing}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Blocked</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{data.executionSummary.blocked}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Workspace context</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <dt className="font-medium text-neutral-500">Business</dt>
                <dd className="text-neutral-900">{String(company.businessName ?? "—")}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Industry</dt>
                <dd className="text-neutral-900">{String(company.industry ?? "—")}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Primary objective</dt>
                <dd className="text-neutral-900">{String(goals.primaryObjective ?? "—")}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Revenue target</dt>
                <dd className="text-neutral-900">{String(goals.monthlyRevenueTarget ?? "—")}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Audience</dt>
                <dd className="text-neutral-900">{String(brand.audience ?? "—")}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Last updated</dt>
                <dd className="text-neutral-900">{data.latestUpdatedAt ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Channel and strategy highlights</h2>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Channels</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {channels.length > 0 ? channels.map((channel) => (
                  <span key={channel} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
                    {channel}
                  </span>
                )) : <span className="text-sm text-neutral-500">No channels</span>}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Priorities</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                {priorities.length > 0 ? priorities.map((priority, index) => (
                  <li key={index}>• {String(priority)}</li>
                )) : <li className="text-neutral-500">No priorities</li>}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Metrics</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                {metrics.length > 0 ? metrics.map((metric, index) => (
                  <li key={index}>• {String(metric)}</li>
                )) : <li className="text-neutral-500">No metrics</li>}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-950">Execution tasks</h2>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {data.executionSummary.total} tasks
              </span>
            </div>

            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task, index) => {
                const row = task as Record<string, unknown>;
                return (
                  <div key={index} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-neutral-950">{String(row.title ?? "Untitled task")}</h3>
                        <p className="mt-1 text-sm text-neutral-600">{String(row.notes ?? "—")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{String(row.owner ?? "—")}</span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{String(row.priority ?? "—")}</span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{String(row.status ?? "—")}</span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{String(row.week ?? "—")}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                  No execution tasks available.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Active IDs</h2>
            <dl className="mt-4 space-y-3 text-sm break-all">
              <div>
                <dt className="font-medium text-neutral-500">Tenant</dt>
                <dd className="text-neutral-900">{data.activeContext.tenantId ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Brand</dt>
                <dd className="text-neutral-900">{data.activeContext.brandId ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Workspace</dt>
                <dd className="text-neutral-900">{data.activeContext.workspaceId ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Recent audit</h2>
            <div className="mt-4 space-y-3">
              {data.recentAudit.length > 0 ? data.recentAudit.map((event) => (
                <div key={event.id} className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-900">{event.action}</p>
                  <p className="mt-1 text-xs text-neutral-500">target: {event.target_type ?? "—"}</p>
                  <p className="mt-1 text-xs text-neutral-500">{event.created_at ?? "—"}</p>
                </div>
              )) : (
                <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-500">
                  No recent audit events.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}