import { getWorkspaceDisplayName, getWorkspaceSurfaceLabel } from "@/lib/admin/workspace-branding";
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

type TaskStatus = "todo" | "doing" | "blocked" | "done";
type TaskPriority = "high" | "medium" | "low";

type ExecutionTask = {
  title: string;
  owner: string;
  priority: TaskPriority;
  status: TaskStatus;
  week: string;
  notes: string;
};

type ExecutionPlan = {
  headline: string;
  summary: string;
  focusAreas: string[];
  tasks: ExecutionTask[];
  notes: string;
};

type ApiSummary = {
  total: number;
  todo: number;
  doing: number;
  blocked: number;
  done: number;
};

type ApiPayload = {
  ok: boolean;
  workspaceId: string | null;
  onboarding: {
    company_profile?: Record<string, unknown>;
    goals?: Record<string, unknown>;
    channels?: string[];
    brand?: Record<string, unknown>;
  };
  strategy: Record<string, unknown>;
  execution: ExecutionPlan;
  summary: ApiSummary;
  links: {
    admin: string;
    onboarding: string;
    strategy: string;
    execution: string;
  };
};

const emptyPlan: ExecutionPlan = {
  headline: "",
  summary: "",
  focusAreas: [],
  tasks: [],
  notes: "",
};

const statusOptions: TaskStatus[] = ["todo", "doing", "blocked", "done"];
const priorityOptions: TaskPriority[] = ["high", "medium", "low"];

function statusClasses(status: TaskStatus) {
  switch (status) {
    case "done":
      return "bg-emerald-100 text-emerald-700";
    case "doing":
      return "bg-indigo-100 text-indigo-700";
    case "blocked":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function priorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "bg-rose-100 text-rose-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}


function countExecutionStatusItems(items: unknown) {
  return Array.isArray(items) ? items.filter(Boolean).length : 0;
}

function ExecutionStatusSummaryCard() {
  const executionStatusDraft = useMemo(() => {
    const storedDraft = getExecutionStatusDraft();
    return storedDraft ?? generateExecutionStatusDraft({});
  }, []);

  const completedCount = countExecutionStatusItems(executionStatusDraft.completedItems);
  const inProgressCount = countExecutionStatusItems(executionStatusDraft.inProgressItems);
  const blockedCount = countExecutionStatusItems(executionStatusDraft.blockedItems);
  const upcomingCount = countExecutionStatusItems(executionStatusDraft.upcomingItems);
  const detailHref = `/admin/execution-status/${executionStatusDraft.pilotId}` as Route;

  return (
    <section>
      <h2>Execution status</h2>
      <p>{executionStatusDraft.campaignName}</p>
      <p>{executionStatusDraft.overallStatus}</p>
      <dl>
        <div>
          <dt>Completed</dt>
          <dd>{completedCount}</dd>
        </div>
        <div>
          <dt>In progress</dt>
          <dd>{inProgressCount}</dd>
        </div>
        <div>
          <dt>Blocked</dt>
          <dd>{blockedCount}</dd>
        </div>
        <div>
          <dt>Upcoming</dt>
          <dd>{upcomingCount}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{executionStatusDraft.lastUpdatedAt}</dd>
        </div>
      </dl>
      <Link href={detailHref}>Open execution status draft</Link>
    </section>
  );
}
export default function AdminExecutionPage() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan>(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadExecution() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/execution", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.detail || payload.error || "Failed to load execution workspace",
        );
      }

      setData(payload);
      setPlan(payload.execution);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load execution workspace",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExecution();
  }, []);

  const groupedCounts = useMemo(() => {
    return {
      total: plan.tasks.length,
      todo: plan.tasks.filter((task) => task.status === "todo").length,
      doing: plan.tasks.filter((task) => task.status === "doing").length,
      blocked: plan.tasks.filter((task) => task.status === "blocked").length,
      done: plan.tasks.filter((task) => task.status === "done").length,
    };
  }, [plan]);

  function updateTask(index: number, field: keyof ExecutionTask, value: string) {
    setPlan((current) => {
      const tasks = [...current.tasks];
      tasks[index] = { ...tasks[index], [field]: value } as ExecutionTask;
      return { ...current, tasks };
    });
  }

  function updateFocusAreas(value: string) {
    const focusAreas = value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    setPlan((current) => ({ ...current, focusAreas }));
  }

  function addTask() {
    setPlan((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          title: "",
          owner: "Operator",
          priority: "medium",
          status: "todo",
          week: `Week ${current.tasks.length + 1}`,
          notes: "",
        },
      ],
    }));
  }

  function removeTask(index: number) {
    setPlan((current) => ({
      ...current,
      tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  }

  async function savePlan() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/execution", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: data?.workspaceId ?? null,
          execution: plan,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.detail || payload.error || "Failed to save execution workspace",
        );
      }

      setPlan(payload.execution);
      setMessage("Execution workspace saved.");
      await loadExecution();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save execution workspace",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen text-slate-900">
        <section className="oi-shell py-10">
          <div className="oi-card p-8">
            <p className="text-sm text-slate-500">
              Loading execution workspace...
            </p>
          </div>
        </section>
            <ExecutionStatusSummaryCard />
    </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen text-slate-900">
        <section className="oi-shell py-10">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-red-700">
              Execution workspace unavailable
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadExecution}
              className="oi-button-primary mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        </section>
            <ExecutionStatusSummaryCard />
    </main>
    );
  }

  const company = (data?.onboarding?.company_profile ?? {}) as Record<
    string,
    unknown
  >;
  const goals = (data?.onboarding?.goals ?? {}) as Record<string, unknown>;
  const channels = (data?.onboarding?.channels ?? []) as string[];
  const links = data?.links ?? {
    admin: "/admin",
    onboarding: "/admin/onboarding",
    strategy: "/admin/strategy",
    execution: "/admin/execution",
  };

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Execution workspace
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Turn strategy into delivery with{" "}
                <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Convert onboarding and strategy inputs into weekly work, owner
                accountability, priorities, and execution status.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={links.admin}
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Admin home
                </a>
                <a
                  href={links.onboarding}
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Onboarding
                </a>
                <a
                  href={links.strategy}
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Strategy
                </a>
                <button
                  type="button"
                  onClick={savePlan}
                  disabled={saving}
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save execution workspace"}
                </button>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Execution scope
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Workspace ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">
                    {data?.workspaceId ?? "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Task volume
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {groupedCounts.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Active channels
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {channels.length > 0 ? channels.join(", ") : "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 md:grid-cols-5">
          <div className="oi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {groupedCounts.total}
            </p>
          </div>
          <div className="oi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
              To do
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {groupedCounts.todo}
            </p>
          </div>
          <div className="oi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Doing
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {groupedCounts.doing}
            </p>
          </div>
          <div className="oi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
              Blocked
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {groupedCounts.blocked}
            </p>
          </div>
          <div className="oi-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Done
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {groupedCounts.done}
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="oi-card p-6">
              <label className="block text-sm font-medium text-slate-700">
                Headline
              </label>
              <input
                value={plan.headline}
                onChange={(event) =>
                  setPlan((current) => ({
                    ...current,
                    headline: event.target.value,
                  }))
                }
                className="oi-input mt-2 px-4 py-3 text-sm"
                placeholder="Execution headline"
              />

              <label className="mt-5 block text-sm font-medium text-slate-700">
                Summary
              </label>
              <textarea
                value={plan.summary}
                onChange={(event) =>
                  setPlan((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                rows={4}
                className="oi-textarea mt-2 px-4 py-3 text-sm"
                placeholder="Execution summary"
              />

              <label className="mt-5 block text-sm font-medium text-slate-700">
                Focus areas
              </label>
              <textarea
                value={plan.focusAreas.join("`r`n")}
                onChange={(event) => updateFocusAreas(event.target.value)}
                rows={5}
                className="oi-textarea mt-2 px-4 py-3 text-sm"
                placeholder={"Acquisition consistency`r`nLanding page conversion`r`nWeekly revenue pacing"}
              />

              <label className="mt-5 block text-sm font-medium text-slate-700">
                Operator notes
              </label>
              <textarea
                value={plan.notes}
                onChange={(event) =>
                  setPlan((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={5}
                className="oi-textarea mt-2 px-4 py-3 text-sm"
                placeholder="Operator notes, review cadence, blockers, and context"
              />
            </div>

            <div className="oi-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="oi-section-title text-xl">Execution board</h2>
                  <p className="text-sm text-slate-500">
                    Define weekly tasks with owner, priority, and status.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTask}
                  className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                >
                  Add task
                </button>
              </div>

              <div className="space-y-4">
                {plan.tasks.map((task, index) => (
                  <div
                    key={`${task.title}-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          priorityClasses(task.priority),
                        ].join(" ")}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          statusClasses(task.status),
                        ].join(" ")}
                      >
                        {task.status}
                      </span>
                      <span className="oi-chip px-3 py-1">{task.week}</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Task title
                        </label>
                        <input
                          value={task.title}
                          onChange={(event) =>
                            updateTask(index, "title", event.target.value)
                          }
                          className="oi-input mt-2 px-3 py-2 text-sm"
                          placeholder="Task title"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Owner
                        </label>
                        <input
                          value={task.owner}
                          onChange={(event) =>
                            updateTask(index, "owner", event.target.value)
                          }
                          className="oi-input mt-2 px-3 py-2 text-sm"
                          placeholder="Owner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Priority
                        </label>
                        <select
                          value={task.priority}
                          onChange={(event) =>
                            updateTask(index, "priority", event.target.value)
                          }
                          className="oi-select mt-2 px-3 py-2 text-sm"
                        >
                          {priorityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Status
                        </label>
                        <select
                          value={task.status}
                          onChange={(event) =>
                            updateTask(index, "status", event.target.value)
                          }
                          className="oi-select mt-2 px-3 py-2 text-sm"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Week / cadence
                        </label>
                        <input
                          value={task.week}
                          onChange={(event) =>
                            updateTask(index, "week", event.target.value)
                          }
                          className="oi-input mt-2 px-3 py-2 text-sm"
                          placeholder="Week 1 / Weekly / Sprint 2"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Notes
                        </label>
                        <textarea
                          value={task.notes}
                          onChange={(event) =>
                            updateTask(index, "notes", event.target.value)
                          }
                          rows={3}
                          className="oi-textarea mt-2 px-3 py-2 text-sm"
                          placeholder="Definition of done, blockers, dependencies"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Remove task
                      </button>
                    </div>
                  </div>
                ))}

                {plan.tasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    No tasks yet. Add the first execution task to start the weekly plan.
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="oi-card p-6">
              <h2 className="oi-section-title text-xl">Execution snapshot</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="oi-card-soft p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {groupedCounts.total}
                  </p>
                </div>
                <div className="oi-card-soft p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Done
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {groupedCounts.done}
                  </p>
                </div>
                <div className="oi-card-soft p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Doing
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {groupedCounts.doing}
                  </p>
                </div>
                <div className="oi-card-soft p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Blocked
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {groupedCounts.blocked}
                  </p>
                </div>
              </div>
            </div>

            <div className="oi-card p-6">
              <h2 className="oi-section-title text-xl">Workspace inputs</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-slate-500">Business</dt>
                  <dd className="text-slate-900">
                    {String(company.businessName ?? "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥")}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Industry</dt>
                  <dd className="text-slate-900">
                    {String(company.industry ?? "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥")}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Primary objective</dt>
                  <dd className="text-slate-900">
                    {String(goals.primaryObjective ?? "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥")}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Revenue target</dt>
                  <dd className="text-slate-900">
                    {String(goals.monthlyRevenueTarget ?? "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥")}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Channels</dt>
                  <dd className="text-slate-900">
                    {channels.length > 0 ? channels.join(", ") : "â”œÃ³Î“Ã©Â¼Î“Ã‡Â¥"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="oi-card p-6">
              <h2 className="oi-section-title text-xl">Save checklist</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>â”œÃ³Î“Ã©Â¼â”¬Ã³ Headline and summary reflect the current strategy</li>
                <li>â”œÃ³Î“Ã©Â¼â”¬Ã³ Focus areas are clear and limited</li>
                <li>â”œÃ³Î“Ã©Â¼â”¬Ã³ Every task has an owner and a week/cadence</li>
                <li>â”œÃ³Î“Ã©Â¼â”¬Ã³ Status values are current before review</li>
                <li>â”œÃ³Î“Ã©Â¼â”¬Ã³ Notes capture blockers and operator context</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
          <ExecutionStatusSummaryCard />
    </main>
  );
}