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

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function asString(value: unknown) {
  if (value === null || typeof value === "undefined" || value === "") return "—";
  return String(value);
}

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

      const payload = (await response.json()) as SummaryPayload & {
        detail?: string;
        error?: string;
      };

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
    void load();
  }, []);

  const channels = useMemo(() => {
    return Array.isArray(data?.onboarding?.channels) ? data.onboarding.channels : [];
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
      <main className="oi-shell mx-auto max-w-7xl px-6 py-10">
        <section className="oi-card rounded-[32px] p-8">
          <p className="oi-kicker">Executive summary</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Summary control center</h1>
          <p className="mt-3 text-sm text-slate-600">Loading workspace intelligence…</p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="oi-shell mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <p className="oi-kicker text-rose-600">Executive summary</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-rose-900">Summary control center unavailable</h1>
          <p className="mt-3 text-sm text-rose-700">{error || "Unknown error"}</p>
          <button type="button" onClick={() => void load()} className="oi-button-primary mt-6">
            Retry summary
          </button>
        </section>
      </main>
    );
  }

  const company = (data.onboarding.company_profile ?? {}) as Record<string, unknown>;
  const goals = (data.onboarding.goals ?? {}) as Record<string, unknown>;
  const brand = (data.onboarding.brand ?? {}) as Record<string, unknown>;

  const statCards = [
    { label: "Settings", value: data.counts.settings, tone: "from-fuchsia-500/15 via-white to-white" },
    { label: "Versions", value: data.counts.versions, tone: "from-sky-500/15 via-white to-white" },
    { label: "Audit", value: data.counts.audit, tone: "from-amber-500/15 via-white to-white" },
    { label: "Tasks", value: data.executionSummary.total, tone: "from-violet-500/15 via-white to-white" },
    { label: "Doing", value: data.executionSummary.doing, tone: "from-cyan-500/15 via-white to-white" },
    { label: "Blocked", value: data.executionSummary.blocked, tone: "from-rose-500/15 via-white to-white" },
  ];

  return (
    <main className="oi-shell mx-auto max-w-7xl px-6 py-10">
      <section className="oi-card overflow-hidden rounded-[32px] p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="oi-kicker">Executive summary</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Summary control center
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              One premium surface for onboarding context, strategic priorities, execution pulse, and the most recent admin activity.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={data.links.admin} className="oi-button-primary">
                Admin home
              </a>
              <a href={data.links.onboarding} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Onboarding
              </a>
              <a href={data.links.strategy} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Strategy
              </a>
              <a href={data.links.execution} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Execution
              </a>
            </div>
          </div>

          <div className="min-w-[280px] rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="oi-brand-gradient h-2 w-24 rounded-full" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace status</p>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4">
                <dt>Latest update</dt>
                <dd className="font-medium text-slate-950">{formatDateTime(data.latestUpdatedAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Completed</dt>
                <dd className="font-medium text-emerald-700">{data.executionSummary.done}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>To do</dt>
                <dd className="font-medium text-slate-950">{data.executionSummary.todo}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className={`oi-card rounded-[28px] bg-gradient-to-br ${card.tone} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="space-y-6">
          <section className="oi-card rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="oi-kicker">Workspace context</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Operating snapshot</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                live
              </span>
            </div>

            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Business</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{asString(company.businessName)}</dd>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Industry</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{asString(company.industry)}</dd>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Primary objective</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{asString(goals.primaryObjective)}</dd>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revenue target</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{asString(goals.monthlyRevenueTarget)}</dd>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Audience</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{asString(brand.audience)}</dd>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Updated</dt>
                <dd className="mt-2 text-sm font-medium text-slate-950">{formatDateTime(data.latestUpdatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="oi-card rounded-[28px] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="oi-kicker">Strategy signals</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Channel and planning highlights</h2>
              </div>
              <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                aligned
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Channels</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {channels.length > 0 ? (
                    channels.map((channel) => (
                      <span key={channel} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {channel}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No channels</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Priorities</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {priorities.length > 0 ? (
                    priorities.map((priority, index) => <li key={index}>• {String(priority)}</li>)
                  ) : (
                    <li className="text-slate-500">No priorities</li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Metrics</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {metrics.length > 0 ? (
                    metrics.map((metric, index) => <li key={index}>• {String(metric)}</li>)
                  ) : (
                    <li className="text-slate-500">No metrics</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="oi-card rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="oi-kicker">Execution pulse</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Execution pulse</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {data.executionSummary.total} tasks
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task, index) => {
                  const row = task as Record<string, unknown>;
                  return (
                    <article key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-950">{asString(row.title)}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{asString(row.notes)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            {asString(row.owner)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            {asString(row.priority)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            {asString(row.status)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            {asString(row.week)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No execution tasks available.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="oi-card rounded-[28px] p-6">
            <p className="oi-kicker">Active context</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Reference IDs</h2>

            <dl className="mt-6 space-y-4 break-all text-sm">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tenant</dt>
                <dd className="mt-2 font-medium text-slate-950">{asString(data.activeContext.tenantId)}</dd>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Brand</dt>
                <dd className="mt-2 font-medium text-slate-950">{asString(data.activeContext.brandId)}</dd>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</dt>
                <dd className="mt-2 font-medium text-slate-950">{asString(data.activeContext.workspaceId)}</dd>
              </div>
            </dl>
          </section>

          <section className="oi-card rounded-[28px] p-6">
            <p className="oi-kicker">Recent audit</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Latest admin activity</h2>

            <div className="mt-6 space-y-3">
              {data.recentAudit.length > 0 ? (
                data.recentAudit.map((event) => (
                  <article key={event.id} className="rounded-[22px] bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">{event.action}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      target {event.target_type ?? "—"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{formatDateTime(event.created_at)}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] bg-slate-50 p-4 text-sm text-slate-500">No recent audit events.</div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}