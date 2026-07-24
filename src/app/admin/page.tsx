"use client";

import { useEffect, useMemo, useState } from "react";

type AdminWorkspaceContext = {
  tenantId: string;
  tenantSlug: string;
  tenantDisplayName: string;
  brandId: string;
  brandName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

type ContextResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string | null;
  };
  active?: AdminWorkspaceContext | null;
  options?: AdminWorkspaceContext[];
  error?: string;
};

type AuditItem = {
  id?: string;
  action?: string;
  actor_user_id?: string;
  actor_email?: string;
  tenant_id?: string;
  brand_id?: string;
  workspace_id?: string;
  target_type?: string;
  target_id?: string;
  payload?: Record<string, unknown>;
  created_at?: string;
};

type AuditResponse = {
  ok: boolean;
  items?: AuditItem[];
  error?: string;
};

type WorkspaceSummaryResponse = {
  ok: boolean;
  active?: AdminWorkspaceContext;
  counts?: {
    tenants: number;
    brands: number;
    workspaces: number;
  };
  error?: string;
};

type WorkspaceNote = {
  id: string;
  tenant_id: string;
  brand_id: string;
  workspace_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
};

type WorkspaceNotesResponse = {
  ok: boolean;
  items?: WorkspaceNote[];
  error?: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [active, setActive] = useState<AdminWorkspaceContext | null>(null);
  const [options, setOptions] = useState<AdminWorkspaceContext[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [summary, setSummary] = useState<{
    tenants: number;
    brands: number;
    workspaces: number;
  } | null>(null);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  async function loadContext() {
    const response = await fetch("/api/admin/context", {
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json()) as ContextResponse;

    if (!response.ok || !json.ok) {
      throw new Error(json.error || "Failed to load admin context");
    }

    setUserEmail(json.user?.email || "");
    setActive(json.active || null);
    setOptions(json.options || []);
    setSelectedWorkspaceId(json.active?.workspaceId || "");
  }

  async function loadAudit(actionFilter?: string) {
    const qs = new URLSearchParams();
    qs.set("limit", "25");

    if (actionFilter && actionFilter.trim()) {
      qs.set("action", actionFilter.trim());
    }

    const response = await fetch(`/api/admin/audit?${qs.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json()) as AuditResponse;

    if (!response.ok || !json.ok) {
      throw new Error(json.error || "Failed to load admin audit");
    }

    setAuditItems(json.items || []);
  }

  async function loadSummary() {
    const response = await fetch("/api/admin/workspace-summary", {
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json()) as WorkspaceSummaryResponse;

    if (!response.ok || !json.ok) {
      throw new Error(json.error || "Failed to load workspace summary");
    }

    setSummary(json.counts || null);
  }

  async function loadNotes(
    nextSearch?: string,
    nextIncludeArchived?: boolean,
  ) {
    const qs = new URLSearchParams();
    const q = typeof nextSearch === "string" ? nextSearch : noteSearch;
    const include =
      typeof nextIncludeArchived === "boolean"
        ? nextIncludeArchived
        : includeArchived;

    if (q.trim()) {
      qs.set("q", q.trim());
    }

    if (include) {
      qs.set("includeArchived", "true");
    }

    const response = await fetch(`/api/admin/workspace-notes?${qs.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json()) as WorkspaceNotesResponse;

    if (!response.ok || !json.ok) {
      throw new Error(json.error || "Failed to load workspace notes");
    }

    setNotes(json.items || []);
  }

  async function loadAll(
    nextAuditFilter?: string,
    nextSearch?: string,
    nextIncludeArchived?: boolean,
  ) {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadContext(),
        loadAudit(nextAuditFilter ?? auditActionFilter),
        loadSummary(),
        loadNotes(nextSearch, nextIncludeArchived),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll("", "", false);
  }, []);

  const activeLabel = useMemo(() => {
    if (!active) return "No active context";
    return `${active.tenantDisplayName} / ${active.brandName} / ${active.workspaceName}`;
  }, [active]);

  const latestSwitchEvent = useMemo(() => {
    return (
      auditItems.find((item) => item.action === "admin_context_switched") ?? null
    );
  }, [auditItems]);

  async function onSwitchContext() {
    if (!selectedWorkspaceId) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/select-context", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
        }),
      });

      const json = (await response.json()) as {
        ok: boolean;
        active?: AdminWorkspaceContext;
        error?: string;
      };

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to switch context");
      }

      setEditingNoteId("");
      setNoteTitle("");
      setNoteBody("");

      await loadAll(auditActionFilter, noteSearch, includeArchived);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch context");
    } finally {
      setSaving(false);
    }
  }

  async function applyAuditFilter() {
    setLoading(true);
    setError("");

    try {
      await loadAudit(auditActionFilter);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to filter admin audit",
      );
    } finally {
      setLoading(false);
    }
  }

  async function clearAuditFilter() {
    setAuditActionFilter("");
    setLoading(true);
    setError("");

    try {
      await loadAudit("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear admin audit filter",
      );
    } finally {
      setLoading(false);
    }
  }

  async function applyNoteFilter() {
    setLoading(true);
    setError("");

    try {
      await loadNotes(noteSearch, includeArchived);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to filter workspace notes",
      );
    } finally {
      setLoading(false);
    }
  }

  async function clearNoteFilter() {
    setNoteSearch("");
    setIncludeArchived(false);
    setLoading(true);
    setError("");

    try {
      await loadNotes("", false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to clear workspace note filter",
      );
    } finally {
      setLoading(false);
    }
  }

  function startCreateNote() {
    setEditingNoteId("");
    setNoteTitle("");
    setNoteBody("");
  }

  function startEditNote(note: WorkspaceNote) {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteBody(note.body);
  }

  async function saveNote() {
    if (!noteTitle.trim()) {
      setError("Note title is required");
      return;
    }

    setNoteSaving(true);
    setError("");

    try {
      const method = editingNoteId ? "PUT" : "POST";
      const body = editingNoteId
        ? { id: editingNoteId, title: noteTitle, body: noteBody }
        : { title: noteTitle, body: noteBody };

      const response = await fetch("/api/admin/workspace-notes", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to save workspace note");
      }

      setEditingNoteId("");
      setNoteTitle("");
      setNoteBody("");

      await Promise.all([
        loadNotes(noteSearch, includeArchived),
        loadAudit(auditActionFilter),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save workspace note",
      );
    } finally {
      setNoteSaving(false);
    }
  }

  async function archiveNote(noteId: string) {
    setNoteSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/workspace-notes?id=${encodeURIComponent(noteId)}&mode=archive`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to archive workspace note");
      }

      if (editingNoteId === noteId) {
        setEditingNoteId("");
        setNoteTitle("");
        setNoteBody("");
      }

      await Promise.all([
        loadNotes(noteSearch, includeArchived),
        loadAudit(auditActionFilter),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to archive workspace note",
      );
    } finally {
      setNoteSaving(false);
    }
  }

  async function restoreNote(noteId: string) {
    setNoteSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/workspace-notes?id=${encodeURIComponent(noteId)}&mode=restore`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to restore workspace note");
      }

      await Promise.all([
        loadNotes(noteSearch, includeArchived),
        loadAudit(auditActionFilter),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore workspace note",
      );
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Admin control plane
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Operate workspaces inside <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Manage context, review audit activity, work with notes, and move
                between onboarding, strategy, execution, and summary workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/admin/onboarding"
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Open onboarding
                </a>
                <a
                  href="/admin/marketplace"
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Open marketplace admin
                </a>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Admin identity
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {userEmail || "Unknown"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Active context:
              </p>
              <div className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                {activeLabel}
              </div>

              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading admin context...</p>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="oi-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Tenants
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-950">
              {summary?.tenants ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">in current scope</p>
          </div>

          <div className="oi-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
              Brands
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-950">
              {summary?.brands ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">in current scope</p>
          </div>

          <div className="oi-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Workspaces
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-950">
              {summary?.workspaces ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">available now</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="oi-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Active context
            </p>
            <h2 className="oi-section-title mt-2 text-2xl">
              Workspace switching
            </h2>

            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <div className="oi-card-soft p-4">
                <strong>Tenant:</strong> {active?.tenantDisplayName || "No active context"}
              </div>
              <div className="oi-card-soft p-4">
                <strong>Brand:</strong> {active?.brandName || "No active context"}
              </div>
              <div className="oi-card-soft p-4">
                <strong>Workspace:</strong> {active?.workspaceName || "No active context"}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Workspace
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(event) => setSelectedWorkspaceId(event.target.value)}
                className="oi-select px-4 py-3"
              >
                {options.map((item) => (
                  <option key={item.workspaceId} value={item.workspaceId}>
                    {`${item.tenantDisplayName} / ${item.brandName} / ${item.workspaceName}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onSwitchContext}
                disabled={saving || !selectedWorkspaceId}
                className="oi-button-primary mt-4 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Switching..." : "Switch context"}
              </button>
            </div>
          </section>

          <section className="oi-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
              Latest context switch
            </p>
            <h2 className="oi-section-title mt-2 text-2xl">
              Recent switch event
            </h2>

            {latestSwitchEvent ? (
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                {JSON.stringify(latestSwitchEvent, null, 2)}
              </pre>
            ) : (
              <div className="oi-card-soft mt-5 p-4 text-sm text-slate-600">
                No context switch audit found yet.
              </div>
            )}
          </section>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="oi-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                  Workspace notes
                </p>
                <h2 className="oi-section-title mt-2 text-2xl">
                  Capture operating context
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Scoped to: {activeLabel}
                </p>
              </div>
              <div className="oi-chip px-4 py-2">{notes.length} notes</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Search
                </label>
                <input
                  value={noteSearch}
                  onChange={(event) => setNoteSearch(event.target.value)}
                  placeholder="Search title or body"
                  className="oi-input px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(event) => setIncludeArchived(event.target.checked)}
                />
                Include archived
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyNoteFilter}
                  className="oi-button-secondary inline-flex items-center justify-center px-4 py-3 text-sm font-semibold"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={clearNoteFilter}
                  className="oi-button-secondary inline-flex items-center justify-center px-4 py-3 text-sm font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                  className="oi-input px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Body
                </label>
                <textarea
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  rows={6}
                  className="oi-textarea px-4 py-3"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={noteSaving}
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {noteSaving ? "Saving..." : editingNoteId ? "Update note" : "Create note"}
                </button>

                <button
                  type="button"
                  onClick={startCreateNote}
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  New note
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {notes.length === 0 ? (
                <div className="oi-card-soft p-4 text-sm text-slate-600">
                  No notes for this workspace yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={[
                      "rounded-3xl border p-5",
                      note.archived_at
                        ? "border-slate-200 bg-slate-50 opacity-80"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">
                          {note.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Updated: {note.updated_at}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          note.archived_at
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-100 text-emerald-700",
                        ].join(" ")}
                      >
                        {note.archived_at ? "Archived" : "Active"}
                      </span>
                    </div>

                    <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                      {note.body}
                    </pre>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditNote(note)}
                        className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                      >
                        Edit
                      </button>

                      {note.archived_at ? (
                        <button
                          type="button"
                          onClick={() => restoreNote(note.id)}
                          className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => archiveNote(note.id)}
                          className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-6">
            <section className="oi-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
                Audit filter
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Recent admin audit
              </h2>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Action
                </label>
                <input
                  value={auditActionFilter}
                  onChange={(event) => setAuditActionFilter(event.target.value)}
                  placeholder="admin_context_switched"
                  className="oi-input px-4 py-3"
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={applyAuditFilter}
                  className="oi-button-secondary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
                >
                  Apply filter
                </button>
                <button
                  type="button"
                  onClick={clearAuditFilter}
                  className="oi-button-secondary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
                >
                  Clear filter
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                {auditItems.length === 0 ? (
                  <div className="oi-card-soft p-4 text-sm text-slate-600">
                    No audit rows found.
                  </div>
                ) : (
                  auditItems.map((item, index) => {
                    const createdAt = item.created_at || "n/a";
                    const action = item.action || "n/a";

                    return (
                      <div
                        key={`${createdAt}-${index}`}
                        className="rounded-3xl border border-slate-200 bg-white p-5"
                      >
                        <div className="grid gap-1 text-sm text-slate-700">
                          <p><strong>Created:</strong> {createdAt}</p>
                          <p><strong>Action:</strong> {action}</p>
                          <p><strong>Actor:</strong> {item.actor_email || item.actor_user_id || "n/a"}</p>
                          <p><strong>Target:</strong> {item.target_type || "n/a"} / {item.target_id || "n/a"}</p>
                        </div>
                        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="oi-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Admin workstreams
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Continue execution
              </h2>

              <div className="mt-5 grid gap-4">
                {[
                  {
                    eyebrow: "Onboarding",
                    title: "Workspace onboarding",
                    body: "Capture workspace profile, goals, channels, and brand inputs.",
                    href: "/admin/onboarding",
                    cta: "Open onboarding",
                  },
                  {
                    eyebrow: "Strategy",
                    title: "Workspace strategy",
                    body: "Generate a working growth strategy from onboarding inputs, channels, messaging, and 90-day priorities.",
                    href: "/admin/strategy",
                    cta: "Open strategy",
                  },
                  {
                    eyebrow: "Execution",
                    title: "Weekly execution workspace",
                    body: "Turn strategy into weekly tasks, owners, statuses, priorities, and execution notes.",
                    href: "/admin/execution",
                    cta: "Open execution",
                  },
                  {
                    eyebrow: "Summary",
                    title: "Workspace summary",
                    body: "Review onboarding, strategy, execution, counts, and recent audit activity.",
                    href: "/admin/summary",
                    cta: "Open summary",
                  },
                ].map((item) => (
                  <div key={item.href} className="oi-card-soft p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                    <a
                      href={item.href}
                      className="oi-button-secondary mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                    >
                      {item.cta}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}