'use client';

import { useEffect, useMemo, useState } from 'react';

type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
type TaskPriority = 'high' | 'medium' | 'low';

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
  headline: '',
  summary: '',
  focusAreas: [],
  tasks: [],
  notes: '',
};

const statusOptions: TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];
const priorityOptions: TaskPriority[] = ['high', 'medium', 'low'];

export default function AdminExecutionPage() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [plan, setPlan] = useState<ExecutionPlan>(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadExecution() {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/execution', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.detail || payload.error || 'Failed to load execution workspace');
      }

      setData(payload);
      setPlan(payload.execution);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load execution workspace');
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
      todo: plan.tasks.filter((task) => task.status === 'todo').length,
      doing: plan.tasks.filter((task) => task.status === 'doing').length,
      blocked: plan.tasks.filter((task) => task.status === 'blocked').length,
      done: plan.tasks.filter((task) => task.status === 'done').length,
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
          title: '',
          owner: 'Operator',
          priority: 'medium',
          status: 'todo',
          week: `Week ${current.tasks.length + 1}`,
          notes: '',
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
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/execution', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: data?.workspaceId ?? null,
          execution: plan,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.detail || payload.error || 'Failed to save execution workspace');
      }

      setPlan(payload.execution);
      setMessage('Execution workspace saved.');
      await loadExecution();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save execution workspace');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-neutral-500">Loading execution workspace…</p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">Execution workspace unavailable</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadExecution}
            className="mt-4 rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const company = (data?.onboarding?.company_profile ?? {}) as Record<string, unknown>;
  const goals = (data?.onboarding?.goals ?? {}) as Record<string, unknown>;
  const channels = (data?.onboarding?.channels ?? []) as string[];
  const links = data?.links ?? {
    admin: '/admin',
    onboarding: '/admin/onboarding',
    strategy: '/admin/strategy',
    execution: '/admin/execution',
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">Admin execution</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Weekly execution workspace</h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600">
            Turn onboarding and strategy inputs into weekly work, owner accountability, and execution status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={links.admin} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Admin home
          </a>
          <a href={links.onboarding} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Onboarding
          </a>
          <a href={links.strategy} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Strategy
          </a>
          <button
            type="button"
            onClick={savePlan}
            disabled={saving}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save execution workspace'}
          </button>
        </div>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-neutral-700">Headline</label>
            <input
              value={plan.headline}
              onChange={(event) => setPlan((current) => ({ ...current, headline: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-black"
              placeholder="Execution headline"
            />

            <label className="mt-5 block text-sm font-medium text-neutral-700">Summary</label>
            <textarea
              value={plan.summary}
              onChange={(event) => setPlan((current) => ({ ...current, summary: event.target.value }))}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-black"
              placeholder="Execution summary"
            />

            <label className="mt-5 block text-sm font-medium text-neutral-700">Focus areas</label>
            <textarea
              value={plan.focusAreas.join('\n')}
              onChange={(event) => updateFocusAreas(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-black"
              placeholder={'Acquisition consistency\nLanding page conversion\nWeekly revenue pacing'}
            />

            <label className="mt-5 block text-sm font-medium text-neutral-700">Operator notes</label>
            <textarea
              value={plan.notes}
              onChange={(event) => setPlan((current) => ({ ...current, notes: event.target.value }))}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-black"
              placeholder="Operator notes, review cadence, blockers, and context"
            />
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">Execution board</h2>
                <p className="text-sm text-neutral-500">Define weekly tasks with owner, priority, and status.</p>
              </div>
              <button
                type="button"
                onClick={addTask}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Add task
              </button>
            </div>

            <div className="space-y-4">
              {plan.tasks.map((task, index) => (
                <div key={`${task.title}-${index}`} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Task title</label>
                      <input
                        value={task.title}
                        onChange={(event) => updateTask(index, 'title', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                        placeholder="Task title"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Owner</label>
                      <input
                        value={task.owner}
                        onChange={(event) => updateTask(index, 'owner', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                        placeholder="Owner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Priority</label>
                      <select
                        value={task.priority}
                        onChange={(event) => updateTask(index, 'priority', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</label>
                      <select
                        value={task.status}
                        onChange={(event) => updateTask(index, 'status', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Week / cadence</label>
                      <input
                        value={task.week}
                        onChange={(event) => updateTask(index, 'week', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                        placeholder="Week 1 / Weekly / Sprint 2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</label>
                      <textarea
                        value={task.notes}
                        onChange={(event) => updateTask(index, 'notes', event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-black"
                        placeholder="Definition of done, blockers, dependencies"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove task
                    </button>
                  </div>
                </div>
              ))}

              {plan.tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                  No tasks yet. Add the first execution task to start the weekly plan.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Execution snapshot</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Total</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">{groupedCounts.total}</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Done</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">{groupedCounts.done}</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Doing</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">{groupedCounts.doing}</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Blocked</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">{groupedCounts.blocked}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Workspace inputs</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-neutral-500">Business</dt>
                <dd className="text-neutral-900">{String(company.businessName ?? '—')}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Industry</dt>
                <dd className="text-neutral-900">{String(company.industry ?? '—')}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Primary objective</dt>
                <dd className="text-neutral-900">{String(goals.primaryObjective ?? '—')}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Revenue target</dt>
                <dd className="text-neutral-900">{String(goals.monthlyRevenueTarget ?? '—')}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Channels</dt>
                <dd className="text-neutral-900">{channels.length > 0 ? channels.join(', ') : '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Save checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700">
              <li>• Headline and summary reflect the current strategy</li>
              <li>• Focus areas are clear and limited</li>
              <li>• Every task has an owner and a week/cadence</li>
              <li>• Status values are current before review</li>
              <li>• Notes capture blockers and operator context</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}