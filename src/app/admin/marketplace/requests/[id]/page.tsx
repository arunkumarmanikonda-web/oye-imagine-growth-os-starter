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

type EventRow = {
  id: string;
  request_id: string;
  proposal_id: string | null;
  event_type: string;
  actor: string | null;
  payload: Record<string, unknown> | null;
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
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [busyRequestAction, setBusyRequestAction] = useState<string | null>(null);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    specialistSlug: "",
    title: "",
    scopeSummary: "",
    deliverablesText: "",
    priceInr: "",
    timelineDays: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const [requestRes, proposalsRes, eventsRes] = await Promise.all([
        fetch("/api/admin/marketplace/requests?id=" + requestId, {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
        fetch("/api/admin/marketplace/proposals?requestId=" + requestId, {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
        fetch("/api/admin/marketplace/events?requestId=" + requestId, {
          headers: { "x-admin-secret": ADMIN_SECRET },
          cache: "no-store",
        }),
      ]);

      const requestJson = await requestRes.json();
      const proposalsJson = await proposalsRes.json();
      const eventsJson = await eventsRes.json();

      if (!requestRes.ok) {
        throw new Error(requestJson?.detail || requestJson?.error || "Failed to load request.");
      }

      if (!proposalsRes.ok) {
        throw new Error(proposalsJson?.detail || proposalsJson?.error || "Failed to load proposals.");
      }

      if (!eventsRes.ok) {
        throw new Error(eventsJson?.detail || eventsJson?.error || "Failed to load events.");
      }

      setRequest(requestJson?.request ?? null);
      setProposals(Array.isArray(proposalsJson?.proposals) ? proposalsJson.proposals : []);
      setEvents(Array.isArray(eventsJson?.events) ? eventsJson.events : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request detail.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProposal() {
    if (!requestId) return;

    setCreatingProposal(true);
    setError(null);

    try {
      const deliverables = proposalForm.deliverablesText
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/marketplace/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({
          requestId,
          specialistSlug: proposalForm.specialistSlug.trim(),
          title: proposalForm.title.trim(),
          scopeSummary: proposalForm.scopeSummary.trim(),
          deliverables,
          priceInr: Number(proposalForm.priceInr),
          timelineDays: Number(proposalForm.timelineDays),
          notes: proposalForm.notes.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.detail || json?.error || "Failed to create proposal.");
      }

      setProposalForm({
        specialistSlug: "",
        title: "",
        scopeSummary: "",
        deliverablesText: "",
        priceInr: "",
        timelineDays: "",
        notes: "",
      });

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal.");
    } finally {
      setCreatingProposal(false);
    }
  }

  async function updateRequestStatus(status: "closed" | "reviewing" | "proposed") {
    if (!requestId || !request) return;

    setBusyRequestAction(status);
    setError(null);

    try {
      const res = await fetch("/api/admin/marketplace/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({
          id: requestId,
          status,
          specialistSlug: request.assigned_specialist_slug ?? undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.detail || json?.error || "Failed to update request.");
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setBusyRequestAction(null);
    }
  }

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

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold">{request.full_name}</h2>

              <div className="flex flex-wrap gap-2">
                {request.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => void updateRequestStatus("closed")}
                    disabled={busyRequestAction !== null}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyRequestAction === "closed" ? "Closing..." : "Close request"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void updateRequestStatus(proposals.length > 0 ? "proposed" : "reviewing")}
                    disabled={busyRequestAction !== null}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyRequestAction === "proposed" || busyRequestAction === "reviewing"
                      ? "Reopening..."
                      : "Reopen request"}
                  </button>
                )}
              </div>
            </div>

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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Create Proposal</h3>
              <span className="text-xs text-neutral-500">POST /api/admin/marketplace/proposals</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <div className="mb-1 font-medium text-neutral-700">Specialist slug</div>
                <input
                  value={proposalForm.specialistSlug}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, specialistSlug: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="rahul-performance"
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-neutral-700">Title</div>
                <input
                  value={proposalForm.title}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, title: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="90-day SEO recovery sprint"
                />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="mb-1 font-medium text-neutral-700">Scope summary</div>
                <textarea
                  value={proposalForm.scopeSummary}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, scopeSummary: e.target.value }))
                  }
                  className="min-h-24 w-full rounded-lg border px-3 py-2"
                  placeholder="Technical audit, keyword gap analysis, information architecture fixes, and weekly reporting."
                />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="mb-1 font-medium text-neutral-700">Deliverables</div>
                <textarea
                  value={proposalForm.deliverablesText}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, deliverablesText: e.target.value }))
                  }
                  className="min-h-24 w-full rounded-lg border px-3 py-2"
                  placeholder={"Technical SEO audit`nKeyword opportunity map`n90-day action plan"}
                />
                <div className="mt-1 text-xs text-neutral-500">One per line or comma-separated</div>
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-neutral-700">Price (INR)</div>
                <input
                  type="number"
                  value={proposalForm.priceInr}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, priceInr: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="45000"
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-neutral-700">Timeline (days)</div>
                <input
                  type="number"
                  value={proposalForm.timelineDays}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, timelineDays: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="21"
                />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="mb-1 font-medium text-neutral-700">Notes</div>
                <textarea
                  value={proposalForm.notes}
                  onChange={(e) =>
                    setProposalForm((current) => ({ ...current, notes: e.target.value }))
                  }
                  className="min-h-20 w-full rounded-lg border px-3 py-2"
                  placeholder="Optional internal notes"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void createProposal()}
                disabled={creatingProposal}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingProposal ? "Creating..." : "Create proposal"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Activity</h3>
              <span className="text-xs text-neutral-500">{events.length} event(s)</span>
            </div>

            {events.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-neutral-500">
                No request activity recorded yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {events.map((event) => (
                  <article key={event.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
                        {event.event_type}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {event.actor || "system"} · {new Date(event.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {event.payload ? (
                      <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
{JSON.stringify(event.payload, null, 2)}
                      </pre>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
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