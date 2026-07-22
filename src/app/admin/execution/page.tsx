"use client";

import { useEffect, useMemo, useState } from "react";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
type TaskPriority = "high" | "medium" | "low";

type ExecutionTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueWeek: string;
  notes: string;
};

type ExecutionPlan = {
  headline: string;
  summary: string;
  focusAreas: string[];
  tasks: ExecutionTask[];
  notes: string;
};

type ApiResponse = {
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
  execution: ExecutionPlan | null;
  error?: string;
};

const STATUS_COLUMNS: Array<{ key: TaskStatus; label: string }> = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

function emptyPlan(): ExecutionPlan {
  return {
    headline: "",
    summary: "",
    focusAreas: [],
    tasks: [],
    notes: "",
  };
}

function badgeColor(priority: TaskPriority): string {
  if (priority === "high") return "bg-rose-100 text-rose-700";
  if (priority === "medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function AdminExecutionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan>(emptyPlan());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/execution", {
          cache: "no-store",
          credentials: "include",
        });

        const json = (await response.json()) as ApiResponse;

        if (!response.ok || !json.ok) {
          throw new Error(json.error || "Failed to load execution plan.");
        }

        if (!cancelled) {
          setData(json);
          setPlan(json.execution ?? emptyPlan());
          setSelectedTaskId(json.execution?.tasks?.[0]?.id ?? null);
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

  const selectedTask = useMemo(
    () => plan.tasks.find((task) => task.id === selectedTaskId) ?? null,
    [plan.tasks, selectedTaskId],
  );

  function updateTask(taskId: string, patch: Partial<ExecutionTask>) {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
    }));
  }

  async function savePlan() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/admin/execution", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const json = (await response.json()) as ApiResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to save execution plan.");
      }

      setData(json);
      setPlan(json.execution ?? emptyPlan());
      setSelectedTaskId((json.execution?.tasks?.[0]?.id as string | undefined) ?? null);
      setMessage("Execution plan saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Execution</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Weekly execution workspace</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Convert the strategy into actionable weekly tasks with owners, priorities, due weeks, and status tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/admin/onboarding">
            Open onboarding
          </a>
          <a className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/admin/strategy">
            Open strategy
          </a>
          <a className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" href="/admin">
            Back to Admin
          </a>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading execution workspace…</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">{message}</div>
      ) : null}

      {data && !loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
              <p className="mt-3 break-all text-sm font-semibold text-slate-900">{data.activeContext.workspaceId ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Focus areas</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{plan.focusAreas.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{plan.tasks.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Goal</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {typeof data.onboarding.goals.primaryObjective === "string" ? data.onboarding.goals.primaryObjective : "—"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">{plan.headline}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{plan.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.focusAreas.map((item) => (
                <span key={item} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="overflow-x-auto">
              <div className="grid min-w-[980px] gap-4 lg:grid-cols-4">
                {STATUS_COLUMNS.map((column) => (
                  <div key={column.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{column.label}</h3>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {plan.tasks.filter((task) => task.status === column.key).length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {plan.tasks
                        .filter((task) => task.status === column.key)
                        .map((task) => (
                          <button
                            key={task.id}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              selectedTaskId === task.id
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                            }`}
                            onClick={() => setSelectedTaskId(task.id)}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold">{task.title}</p>
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                                  selectedTaskId === task.id ? "bg-white/15 text-white" : badgeColor(task.priority)
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className={`mt-2 text-xs ${selectedTaskId === task.id ? "text-slate-200" : "text-slate-500"}`}>
                              {task.owner} • {task.dueWeek}
                            </p>
                            <p className={`mt-2 text-xs ${selectedTaskId === task.id ? "text-slate-200" : "text-slate-600"}`}>
                              {task.description}
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Plan notes</h3>
                <textarea
                  className="mt-4 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  value={plan.notes}
                  onChange={(e) => setPlan((prev) => ({ ...prev, notes: e.target.value }))}
                />
                <button
                  className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  onClick={savePlan}
                  type="button"
                >
                  {saving ? "Saving…" : "Save execution plan"}
                </button>
              </div>

              {selectedTask ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">Task editor</h3>

                  <div className="mt-4 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Title</span>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        value={selectedTask.title}
                        onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Description</span>
                      <textarea
                        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        value={selectedTask.description}
                        onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Owner</span>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        value={selectedTask.owner}
                        onChange={(e) => updateTask(selectedTask.id, { owner: e.target.value })}
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Status</span>
                        <select
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                          value={selectedTask.status}
                          onChange={(e) => updateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
                        >
                          <option value="todo">To do</option>
                          <option value="in_progress">In progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="done">Done</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Priority</span>
                        <select
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                          value={selectedTask.priority}
                          onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Due week</span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                          value={selectedTask.dueWeek}
                          onChange={(e) => updateTask(selectedTask.id, { dueWeek: e.target.value })}
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Notes</span>
                      <textarea
                        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        value={selectedTask.notes}
                        onChange={(e) => updateTask(selectedTask.id, { notes: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Select a task card to edit owner, status, priority, due week, and notes.
                </div>
              )}
            </aside>
          </section>
        </>
      ) : null}
    </main>
  );
}