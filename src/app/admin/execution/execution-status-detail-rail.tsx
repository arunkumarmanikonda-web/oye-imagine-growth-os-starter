'use client'

import React from "react";
import Link from "next/link";

export type ExecutionStatusDetailRailSummary = {
  pilotId: string;
  campaignName: string;
  overallStatus: string;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  upcomingCount: number;
  lastUpdatedAt: string;
  detailHref: string;
};

type ExecutionStatusDetailRailProps = {
  loading: boolean;
  summary: ExecutionStatusDetailRailSummary | null;
};

function formatUtcTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}

export function ExecutionStatusDetailRail({
  loading,
  summary,
}: ExecutionStatusDetailRailProps) {
  if (loading) {
    return (
      <section
        data-testid="execution-status-detail-rail-loading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="text-sm font-medium text-slate-500">Execution status detail</p>
        <p className="mt-2 text-sm text-slate-600">Loading latest execution status…</p>
      </section>
    );
  }

  if (!summary) {
    return (
      <section
        data-testid="execution-status-detail-rail-unavailable"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
      >
        <p className="text-sm font-semibold text-amber-900">Execution status detail unavailable</p>
        <p className="mt-2 text-sm text-amber-800">
          Execution status summary is not available in the current hub payload.
        </p>
      </section>
    );
  }

  const counts = [
    { label: "Completed", value: summary.completedCount },
    { label: "In progress", value: summary.inProgressCount },
    { label: "Blocked", value: summary.blockedCount },
    { label: "Upcoming", value: summary.upcomingCount },
  ];

  return (
    <section
      data-testid="execution-status-detail-rail"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Execution status detail
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{summary.campaignName}</h2>
          <p className="text-sm text-slate-600">
            Overall status: <span className="font-medium text-slate-900">{summary.overallStatus}</span>
          </p>
          <p className="text-sm text-slate-500">
            Last updated {formatUtcTimestamp(summary.lastUpdatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={summary.detailHref as `/admin/execution-status/${string}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open execution status
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}