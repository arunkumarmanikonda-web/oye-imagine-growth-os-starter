"use client";

import { useEffect, useState } from "react";

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
};

const STATUSES = ["submitted", "reviewing", "assigned", "closed", "rejected"] as const;

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<MarketplaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/marketplace/requests", {
        headers: {
          "x-admin-secret": "OYE!MAGINE2026",
        },
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to load marketplace requests.");
      }

      setItems(json.requests ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function updateStatus(id: string, status: string) {
    setSavingId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/marketplace/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "OYE!MAGINE2026",
        },
        body: JSON.stringify({ id, status }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to update request.");
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
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
            Review incoming marketplace demand and move each request through a simple workflow.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          {loading ? (
            <p className="text-neutral-300">Loading�</p>
          ) : items.length === 0 ? (
            <p className="text-neutral-300">No marketplace requests yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                          {item.service_slug || "unmapped-service"}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300">
                          {item.status}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold">{item.full_name}</h2>
                      <p className="text-sm text-neutral-300">
                        {item.email}
                        {item.company_name ? ` � ${item.company_name}` : ""}
                        {item.budget_range ? ` � ${item.budget_range}` : ""}
                      </p>
                      <p className="text-sm leading-6 text-neutral-200">{item.brief}</p>
                    </div>

                    <div className="w-full lg:w-56">
                      <label className="mb-2 block text-sm font-medium text-neutral-300">Update status</label>
                      <select
                        className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-white"
                        value={item.status}
                        disabled={savingId === item.id}
                        onChange={(event) => updateStatus(item.id, event.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
