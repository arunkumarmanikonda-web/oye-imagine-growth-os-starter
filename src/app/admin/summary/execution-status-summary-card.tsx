'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";

type ExecutionStatusSummary = {
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

function formatTimestamp(value: string) {
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Date(parsed).toLocaleString();
}

export function ExecutionStatusSummaryCard() {
  const [summary, setSummary] = useState<ExecutionStatusSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/admin/execution-status/summary", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ExecutionStatusSummary;

        if (!isActive) {
          return;
        }

        setSummary(payload);
        setError(null);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setSummary(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Execution status summary is unavailable.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section
        data-testid="execution-status-summary-card-loading"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Execution status
          </h2>
          <p className="text-sm text-slate-600">Loading execution statusâ€¦</p>
        </div>
      </section>
    );
  }

  if (!summary) {
    return (
      <section
        data-testid="execution-status-summary-card-unavailable"
        className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Execution status
          </h2>
          <p className="text-sm text-slate-700">
            {error ?? "Execution status summary is unavailable."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="execution-status-summary-card"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Execution status
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            {summary.campaignName}
          </h2>
          <p className="text-sm text-slate-600">
            Overall status:{" "}
            <span className="font-medium text-slate-900">
              {summary.overallStatus}
            </span>
          </p>
          <p className="text-sm text-slate-600">
            Last updated: {formatTimestamp(summary.lastUpdatedAt)}
          </p>
        </div>

        <Link
          href={summary.detailHref as `/admin/execution-status/${string}`}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View detail
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md bg-emerald-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Completed
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-emerald-900">
            {summary.completedCount}
          </dd>
        </div>

        <div className="rounded-md bg-sky-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-sky-700">
            In progress
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-sky-900">
            {summary.inProgressCount}
          </dd>
        </div>

        <div className="rounded-md bg-rose-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-rose-700">
            Blocked
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-rose-900">
            {summary.blockedCount}
          </dd>
        </div>

        <div className="rounded-md bg-amber-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Upcoming
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-amber-900">
            {summary.upcomingCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default ExecutionStatusSummaryCard;