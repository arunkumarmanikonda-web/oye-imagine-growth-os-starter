"use client";

import { useEffect, useMemo, useState } from "react";

type MarketplaceRequest = {
  id: string;
  service_slug: string | null;
  full_name: string;
  email: string;
  company_name: string | null;
  budget_range: string | null;
  brief: string;
  status: string;
  created_at: string;
  assigned_specialist_slug: string | null;
  assigned_specialist_name: string | null;
};

type Specialist = {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  primary_category: string;
  verified: boolean;
};

type DraftState = {
  status: string;
  specialistSlug: string;
};

const STATUSES = ["submitted", "reviewing", "assigned", "closed", "rejected"] as const;

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<MarketplaceRequest[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const specialistOptions = useMemo(
    () => specialists.map((s) => ({ value: s.slug, label: `${s.full_name} — ${s.primary_category}` })),
    [specialists],
  );

  function buildDrafts(requests: MarketplaceRequest[]) {
    const next: Record<string, DraftState> = {};
    for (const item of requests) {
      next[item.id] = {
        status: item.status,
        specialistSlug: item.assigned_specialist_slug ?? "",
      };
    }
    return next;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [requestsResponse, specialistsResponse] = await Promise.all([
        fetch("/api/admin/marketplace/requests", {
          headers: { "x-admin-secret": "OYE!MAGINE2026" },
          cache: "no-store",
        }),
        fetch("/api/marketplace/specialists", {
          cache: "no-store",
        }),
      ]);

      const requestsJson = await requestsResponse.json();
      const specialistsJson = await specialistsResponse.json();

      if (!requestsResponse.ok || !requestsJson.ok) {
        throw new Error(requestsJson.error || "Failed to load marketplace requests.");
      }

      if (!specialistsResponse.ok || !specialistsJson.ok) {
        throw new Error(specialistsJson.error || "Failed to load specialists.");
      }

      const nextItems = requestsJson.requests ?? [];
      const nextSpecialists = specialistsJson.specialists ?? [];

      setItems(nextItems);
      setSpecialists(nextSpecialists);
      setDrafts(buildDrafts(nextItems));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateDraft(id: string, patch: Partial<DraftState>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        status: current[id]?.status ?? "submitted",
        specialistSlug: current[id]?.specialistSlug ?? "",
        ...patch,
      },
    }));
  }

  async function saveItem(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/marketplace/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "OYE!MAGINE2026",
        },
        body: JSON.stringify({
          id,
          status: draft.status,
          specialistSlug: draft.specialistSlug,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to update request.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: json.request?.status ?? draft.status,
                assigned_specialist_slug: json.request?.assigned_specialist_slug ?? (draft.specialistSlug || null),
                assigned_specialist_name:
                  json.request?.assigned_specialist_name ??
                  specialists.find((s) => s.slug === draft.specialistSlug)?.full_name ??
                  null,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-300">Admin</p>
          <h1 className="mt-2 text-4xl font-bold">Marketplace Requests</h1>
          <p className="mt-3 text-neutral-300">
            Review incoming marketplace demand, assign specialists, and move each request through a workflow.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          {loading ? (
            <p className="text-neutral-300">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-neutral-300">No marketplace requests yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const draft = drafts[item.id] ?? {
                  status: item.status,
                  specialistSlug: item.assigned_specialist_slug ?? "",
                };

                return (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3 xl:max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                            {item.service_slug || "unmapped-service"}
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300">
                            {item.status}
                          </span>
                          {item.assigned_specialist_name ? (
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
                              {item.assigned_specialist_name}
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold">{item.full_name}</h2>
                          <p className="mt-1 text-sm text-neutral-300">
                            {item.email}
                            {item.company_name ? ` • ${item.company_name}` : ""}
                            {item.budget_range ? ` • ${item.budget_range}` : ""}
                          </p>
                        </div>

                        <p className="text-sm leading-6 text-neutral-200">{item.brief}</p>
                      </div>

                      <div className="grid w-full gap-4 xl:w-80">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-neutral-300">Status</label>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-white"
                            value={draft.status}
                            disabled={savingId === item.id}
                            onChange={(event) => updateDraft(item.id, { status: event.target.value })}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-neutral-300">Assign specialist</label>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-white"
                            value={draft.specialistSlug}
                            disabled={savingId === item.id}
                            onChange={(event) => updateDraft(item.id, { specialistSlug: event.target.value })}
                          >
                            <option value="">Unassigned</option>
                            {specialistOptions.map((specialist) => (
                              <option key={specialist.value} value={specialist.value}>
                                {specialist.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={savingId === item.id}
                          onClick={() => saveItem(item.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === item.id ? "Saving…" : "Save changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}