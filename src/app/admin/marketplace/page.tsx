"use client";

import Link from "next/link";
import type { Route } from "next";
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

function requestStatusClasses(status: string) {
  switch (status) {
    case "closed":
      return "bg-neutral-900 text-white";
    case "assigned":
      return "bg-emerald-100 text-emerald-800";
    case "proposed":
      return "bg-amber-100 text-amber-800";
    case "reviewing":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function proposalStatusClasses(status: string) {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "sent":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialistFilter, setSpecialistFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

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
  const specialistOptions = useMemo(() => {
    return Array.from(
      new Set(
        requests
          .map((request) => request.assigned_specialist_name || "Unassigned")
          .filter(Boolean),
      ),
    );
  }, [requests]);

  const serviceOptions = useMemo(() => {
    return Array.from(
      new Set(
        requests
          .map((request) => request.service_slug || "service-unmapped")
          .filter(Boolean),
      ),
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return requests.filter((request) => {
      const specialistName = request.assigned_specialist_name || "Unassigned";
      const serviceSlug = request.service_slug || "service-unmapped";

      const matchesSearch =
        needle.length === 0 ||
        request.full_name.toLowerCase().includes(needle) ||
        request.email.toLowerCase().includes(needle) ||
        (request.company_name || "").toLowerCase().includes(needle) ||
        specialistName.toLowerCase().includes(needle) ||
        serviceSlug.toLowerCase().includes(needle);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const matchesSpecialist =
        specialistFilter === "all" || specialistName === specialistFilter;

      const matchesService =
        serviceFilter === "all" || serviceSlug === serviceFilter;

      return matchesSearch && matchesStatus && matchesSpecialist && matchesService;
    });
  }, [requests, search, statusFilter, specialistFilter, serviceFilter]);

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
    <main className="mx-auto mt-6 max-w-6xl rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10 text-slate-900 shadow-2xl shadow-slate-900/10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Marketplace Admin</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review incoming requests, inspect proposals, and accept or reject specialist proposals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm">
            <div className="mb-1 font-medium text-slate-700">Search</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, company, specialist, service"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 font-medium text-slate-700">Status</div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All statuses</option>
              <option value="submitted">submitted</option>
              <option value="reviewing">reviewing</option>
              <option value="proposed">proposed</option>
              <option value="assigned">assigned</option>
              <option value="closed">closed</option>
              <option value="rejected">rejected</option>
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 font-medium text-slate-700">Specialist</div>
            <select
              value={specialistFilter}
              onChange={(e) => setSpecialistFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All specialists</option>
              {specialistOptions.map((specialist) => (
                <option key={specialist} value={specialist}>
                  {specialist}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 font-medium text-slate-700">Service</div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All services</option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Showing {filteredRequests.length} of {requests.length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Status: {statusFilter}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Specialist: {specialistFilter}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Service: {serviceFilter}
          </span>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-sm text-slate-600 shadow-xl shadow-slate-200/70">Loading marketplace admin data...</div>
      ) : null}

      {!loading && requests.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-sm text-slate-600 shadow-xl shadow-slate-200/70">No marketplace requests match the current filters.</div>
      ) : null}

      <div className="space-y-6">
        {filteredRequests.map((request) => {
          const requestProposals = proposalsByRequest.get(request.id) ?? [];

          return (
            <section key={request.id} className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${requestStatusClasses(request.status)}`}
                    >
                      {request.status}
                    </span>
                    <span className="text-xs text-slate-500">{request.service_slug ?? "service-unmapped"}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{request.full_name}</h2>
                  <p className="text-sm text-slate-600">
                    {request.company_name || "No company"} Â· {request.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    Assigned specialist: {request.assigned_specialist_name || "Unassigned"}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {request.assigned_specialist_name ? "Assigned" : "Unassigned"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {requestProposals.length} proposal(s)
                    </span>
                    {request.status === "closed" ? (
                      <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs text-white">
                        Closed
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Link
                    href={`/admin/marketplace/requests/${request.id}` as Route}
                    className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  >
                    Open detail
                  </Link>
                  <span className="text-xs text-slate-500">
                    Created {new Date(request.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Budget</div>
                  <div className="text-sm text-slate-800">{request.budget_range || "Not specified"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Brief</div>
                  <div className="text-sm text-slate-800">{request.brief}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-slate-900">Proposals</div>

                {requestProposals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-500">No proposals yet.</div>
                ) : (
                  <div className="space-y-4">
                    {requestProposals.map((proposal) => {
                      const actionable = proposal.status === "sent";

                      return (
                        <article key={proposal.id} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-200/60">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold">{proposal.title}</h3>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${proposalStatusClasses(proposal.status)}`}
                                >
                                  {proposal.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {proposal.specialist_name || "No specialist"} Â· {formatInr(proposal.price_inr)} Â· {proposal.timeline_days} days
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={!actionable || busyProposalId === proposal.id}
                                onClick={() => void updateProposal(proposal.id, "accepted")}
                                className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={!actionable || busyProposalId === proposal.id}
                                onClick={() => void updateProposal(proposal.id, "rejected")}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-slate-800">{proposal.scope_summary}</p>

                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
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
