"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ADMIN_SECRET = "OYE!MAGINE2026";

type RequestRow = {
  id: string;
  service_slug: string | null;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  website: string | null;
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

export default function MarketplaceRequestDetailPage() {
  const params = useParams();
  const requestId = String(params?.id ?? "");

  const [request, setRequest] = useState<RequestRow | null>(null);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const [requestRes, proposalsRes] = await Promise.all([
        fetch("/api/admin/marketplace/requests?id=" + requestId, {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
        fetch("/api/admin/marketplace/proposals?requestId=" + requestId, {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
      ]);

      const requestJson = await requestRes.json();
      const proposalsJson = await proposalsRes.json();

      if (!requestRes.ok) {
        throw new Error(requestJson?.detail || requestJson?.error || "Failed to load request.");
      }

      if (!proposalsRes.ok) {
        throw new Error(proposalsJson?.detail || proposalsJson?.error || "Failed to load proposals.");
      }

      setRequest(requestJson?.request ?? null);
      setProposals(Array.isArray(proposalsJson?.proposals) ? proposalsJson.proposals : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request detail.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/marketplace" className="text-sm text-neutral-600 hover:text-black">
            ← Back to marketplace admin
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Marketplace Request Detail</h1>
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
        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">Loading request detail...</div>
      ) : null}

      {!loading && !request ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">Request not found.</div>
      ) : null}

      {!loading && request ? (
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
                {request.status}
              </span>
              <span className="text-xs text-neutral-500">{request.service_slug ?? "service-unmapped"}</span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold">{request.full_name}</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4 text-sm">
                <div><strong>Email:</strong> {request.email}</div>
                <div><strong>Company:</strong> {request.company_name || "Not specified"}</div>
                <div><strong>Phone:</strong> {request.phone || "Not specified"}</div>
                <div><strong>Website:</strong> {request.website || "Not specified"}</div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4 text-sm">
                <div><strong>Budget:</strong> {request.budget_range || "Not specified"}</div>
                <div><strong>Assigned specialist:</strong> {request.assigned_specialist_name || "Unassigned"}</div>
                <div><strong>Created:</strong> {new Date(request.created_at).toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-800">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Brief</div>
              {request.brief}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Proposals</h3>

            {proposals.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-neutral-500">No proposals found.</div>
            ) : (
              <div className="mt-4 space-y-4">
                {proposals.map((proposal) => {
                  const actionable = proposal.status === "sent";

                  return (
                    <article key={proposal.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-semibold">{proposal.title}</h4>
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
          </section>
        </div>
      ) : null}
    </main>
  );
}