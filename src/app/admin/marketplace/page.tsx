"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const ADMIN_SECRET = "OYE!MAGINE2026";

type RequestRow = {
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

type ProposalRow = {
  id: string;
  request_id: string;
  specialist_slug: string | null;
  specialist_name: string | null;
  title: string;
  scope_summary: string;
  deliverables: string[];
  price_inr: number;
  timeline_days: number;
  notes: string | null;
  status: string;
  created_at: string;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminMarketplacePage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [requestsRes, proposalsRes] = await Promise.all([
        fetch("/api/admin/marketplace/requests", {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
        fetch("/api/admin/marketplace/proposals", {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
      ]);

      const requestsJson = await requestsRes.json();
      const proposalsJson = await proposalsRes.json();

      if (!requestsRes.ok) {
        throw new Error(requestsJson?.detail || requestsJson?.error || "Failed to load requests.");
      }

      if (!proposalsRes.ok) {
        throw new Error(proposalsJson?.detail || proposalsJson?.error || "Failed to load proposals.");
      }

      setRequests(Array.isArray(requestsJson?.requests) ? requestsJson.requests : []);
      setProposals(Array.isArray(proposalsJson?.proposals) ? proposalsJson.proposals : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const proposalsByRequest = useMemo(() => {
    const map = new Map<string, ProposalRow[]>();

    for (const proposal of proposals) {
      const list = map.get(proposal.request_id) ?? [];
      list.push(proposal);
      map.set(proposal.request_id, list);
    }

    return map;
  }, [proposals]);

  async function updateProposal(proposalId: string, status: "accepted" | "rejected") {
    setBusyProposalId(proposalId);
    setError(null);

    try {
      const res = await fetch("/api/admin/marketplace/proposals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({ id: proposalId, status }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.detail || json?.error || "Failed to update proposal.");
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update proposal.");
    } finally {
      setBusyProposalId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Marketplace Admin</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Review incoming requests, inspect proposals, and accept or reject specialist proposals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">Loading marketplace admin data...</div>
      ) : null}

      {!loading && requests.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">No marketplace requests found.</div>
      ) : null}

      <div className="space-y-6">
        {requests.map((request) => {
          const requestProposals = proposalsByRequest.get(request.id) ?? [];

          return (
            <section key={request.id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
                      {request.status}
                    </span>
                    <span className="text-xs text-neutral-500">{request.service_slug ?? "service-unmapped"}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{request.full_name}</h2>
                  <p className="text-sm text-neutral-600">
                    {request.company_name || "No company"} · {request.email}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Assigned specialist: {request.assigned_specialist_name || "Unassigned"}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Link
                    href={"/admin/marketplace/requests/" + request.id}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                  >
                    Open detail
                  </Link>
                  <span className="text-xs text-neutral-500">
                    Created {new Date(request.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Budget</div>
                  <div className="text-sm text-neutral-800">{request.budget_range || "Not specified"}</div>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Brief</div>
                  <div className="text-sm text-neutral-800">{request.brief}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-neutral-900">Proposals</div>

                {requestProposals.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-500">No proposals yet.</div>
                ) : (
                  <div className="space-y-4">
                    {requestProposals.map((proposal) => {
                      const actionable = proposal.status === "sent";

                      return (
                        <article key={proposal.id} className="rounded-xl border p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold">{proposal.title}</h3>
                                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
                                  {proposal.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-neutral-600">
                                {proposal.specialist_name || "No specialist"} · {formatInr(proposal.price_inr)} · {proposal.timeline_days} days
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={!actionable || busyProposalId === proposal.id}
                                onClick={() => void updateProposal(proposal.id, "accepted")}
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={!actionable || busyProposalId === proposal.id}
                                onClick={() => void updateProposal(proposal.id, "rejected")}
                                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-neutral-800">{proposal.scope_summary}</p>

                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                            {proposal.deliverables.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>

                          {proposal.notes ? (
                            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                              {proposal.notes}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}