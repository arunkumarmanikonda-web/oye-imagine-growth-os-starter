"use client";

import { useEffect, useMemo, useState } from "react";

type StrategyResponse = {
  ok: boolean;
  activeContext: {
    tenantId: string | null;
    brandId: string | null;
    workspaceId: string | null;
  };
  onboarding: {
    company_profile: Record<string, unknown>;
    goals: Record<string, unknown>;
    channels: string[];
    brand: Record<string, unknown>;
  };
  strategy: {
    headline: string;
    summary: string;
    priorities: string[];
    recommendedChannels: string[];
    ninetyDayPlan: Array<{
      phase: string;
      focus: string;
      actions: string[];
    }>;
    messaging: string[];
    metrics: string[];
    notes: string;
  } | null;
  error?: string;
};

function textValue(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

export default function AdminStrategyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<StrategyResponse | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/strategy", {
          cache: "no-store",
          credentials: "include",
        });

        const json = (await response.json()) as StrategyResponse;

        if (!response.ok || !json.ok) {
          throw new Error(json.error || "Failed to load strategy.");
        }

        if (!cancelled) {
          setData(json);
          setNotes(json.strategy?.notes ?? "");
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

  async function saveStrategy() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/admin/strategy", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
        }),
      });

      const json = (await response.json()) as StrategyResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to save strategy.");
      }

      setData(json);
      setNotes(json.strategy?.notes ?? "");
      setMessage("Strategy saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  const channelCount = useMemo(
    () => data?.onboarding.channels?.length ?? 0,
    [data],
  );

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Strategy workspace
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Turn onboarding into growth direction with{" "}
                <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Use this strategy view to align channels, messaging, priorities,
                and the next 90-day execution plan from onboarding inputs.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                  href="/admin/onboarding"
                >
                  Open onboarding
                </a>
                <a
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                  href="/admin"
                >
                  Back to admin
                </a>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Strategy scope
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Workspace ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">
                    {textValue(data?.activeContext.workspaceId)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Primary objective
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {textValue(data?.onboarding.goals.primaryObjective)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Primary market
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {textValue(data?.onboarding.company_profile.primaryMarket)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 oi-card p-6 text-sm text-slate-600">
            Loading strategy...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {data && data.strategy ? (
          <>
            <section className="mt-8 grid gap-6 md:grid-cols-4">
              <div className="oi-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                  Workspace
                </p>
                <p className="mt-3 break-all text-sm font-semibold text-slate-900">
                  {textValue(data.activeContext.workspaceId)}
                </p>
              </div>

              <div className="oi-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">
                  Primary objective
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {textValue(data.onboarding.goals.primaryObjective)}
                </p>
              </div>

              <div className="oi-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Active channels
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {channelCount}
                </p>
              </div>

              <div className="oi-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Primary market
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {textValue(data.onboarding.company_profile.primaryMarket)}
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="space-y-6">
                <div className="oi-card p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                    Strategy headline
                  </p>
                  <h2 className="oi-section-title mt-3 text-3xl">
                    {data.strategy.headline}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {data.strategy.summary}
                  </p>
                </div>

                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">Top priorities</h3>
                  <ul className="mt-4 space-y-3">
                    {data.strategy.priorities.map((item) => (
                      <li
                        key={item}
                        className="oi-card-soft px-4 py-3 text-sm text-slate-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">
                    90-day execution plan
                  </h3>
                  <div className="mt-4 grid gap-4">
                    {data.strategy.ninetyDayPlan.map((phase) => (
                      <div
                        key={phase.phase}
                        className="rounded-3xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {phase.phase}
                          </p>
                          <p className="text-lg font-semibold text-slate-900">
                            {phase.focus}
                          </p>
                        </div>

                        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
                          {phase.actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">
                    Messaging angles
                  </h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {data.strategy.messaging.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">
                    Recommended channels
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.strategy.recommendedChannels.map((channel) => (
                      <span
                        key={channel}
                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">Core metrics</h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {data.strategy.metrics.map((metric) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                </div>

                <div className="oi-card p-6">
                  <h3 className="oi-section-title text-xl">Strategy notes</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Add operator notes or planning context, then save the
                    strategy snapshot.
                  </p>

                  <textarea
                    className="oi-textarea mt-4 min-h-40 px-4 py-3 text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <button
                    className="oi-button-primary mt-4 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                    onClick={saveStrategy}
                    type="button"
                  >
                    {saving ? "Saving..." : "Save strategy"}
                  </button>
                </div>
              </aside>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}