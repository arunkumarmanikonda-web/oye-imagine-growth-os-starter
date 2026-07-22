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
  const [summary, setSummary] = useState<{ tenants: number; brands: number; workspaces: number } | null>(null);
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

  async function loadNotes(nextSearch?: string, nextIncludeArchived?: boolean) {
    const qs = new URLSearchParams();
    const q = typeof nextSearch === "string" ? nextSearch : noteSearch;
    const include = typeof nextIncludeArchived === "boolean" ? nextIncludeArchived : includeArchived;

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

  async function loadAll(nextAuditFilter?: string, nextSearch?: string, nextIncludeArchived?: boolean) {
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
    return auditItems.find((item) => item.action === "admin_context_switched") ?? null;
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
      setError(err instanceof Error ? err.message : "Failed to filter admin audit");
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
      setError(err instanceof Error ? err.message : "Failed to clear admin audit filter");
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
      setError(err instanceof Error ? err.message : "Failed to filter workspace notes");
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
      setError(err instanceof Error ? err.message : "Failed to clear workspace note filter");
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
      setError(err instanceof Error ? err.message : "Failed to save workspace note");
    } finally {
      setNoteSaving(false);
    }
  }

  async function archiveNote(noteId: string) {
    setNoteSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/workspace-notes?id=${encodeURIComponent(noteId)}&mode=archive`, {
        method: "DELETE",
        credentials: "include",
      });

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
      setError(err instanceof Error ? err.message : "Failed to archive workspace note");
    } finally {
      setNoteSaving(false);
    }
  }

  async function restoreNote(noteId: string) {
    setNoteSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/workspace-notes?id=${encodeURIComponent(noteId)}&mode=restore`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to restore workspace note");
      }

      await Promise.all([
        loadNotes(noteSearch, includeArchived),
        loadAudit(auditActionFilter),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore workspace note");
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Platform Admin</h1>

      {loading ? <p>Loading admin context...</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Admin Identity</h2>
        <p><strong>Email:</strong> {userEmail || "Unknown"}</p>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Active Context</h2>
        {active ? (
          <>
            <p><strong>Tenant:</strong> {active.tenantDisplayName}</p>
            <p><strong>Brand:</strong> {active.brandName}</p>
            <p><strong>Workspace:</strong> {active.workspaceName}</p>
            <p><strong>Summary:</strong> {activeLabel}</p>
          </>
        ) : (
          <p>No active context.</p>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Context-Scoped Summary</h2>
        {summary ? (
          <>
            <p><strong>Tenants in scope:</strong> {summary.tenants}</p>
            <p><strong>Brands in scope:</strong> {summary.brands}</p>
            <p><strong>Workspaces in scope:</strong> {summary.workspaces}</p>
          </>
        ) : (
          <p>No summary available.</p>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Switch Workspace</h2>
        <label htmlFor="workspaceId"><strong>Workspace</strong></label>
        <br />
        <select
          id="workspaceId"
          value={selectedWorkspaceId}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
          style={{ minWidth: 420, padding: 8, marginTop: 8, marginBottom: 12 }}
        >
          {options.map((item) => (
            <option key={item.workspaceId} value={item.workspaceId}>
              {`${item.tenantDisplayName} / ${item.brandName} / ${item.workspaceName}`}
            </option>
          ))}
        </select>
        <br />
        <button
          type="button"
          onClick={onSwitchContext}
          disabled={saving || !selectedWorkspaceId}
          style={{ padding: "8px 14px", cursor: "pointer" }}
        >
          {saving ? "Switching..." : "Switch Context"}
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Workspace Notes</h2>
        <p><strong>Scoped to:</strong> {activeLabel}</p>

        <label htmlFor="noteSearch"><strong>Search</strong></label>
        <br />
        <input
          id="noteSearch"
          value={noteSearch}
          onChange={(e) => setNoteSearch(e.target.value)}
          placeholder="Search title or body"
          style={{ minWidth: 320, padding: 8, marginTop: 8, marginBottom: 12 }}
        />
        <br />

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          Include archived
        </label>
        <br />

        <button type="button" onClick={applyNoteFilter} style={{ padding: "8px 14px", cursor: "pointer", marginRight: 8 }}>
          Apply Note Filter
        </button>
        <button type="button" onClick={clearNoteFilter} style={{ padding: "8px 14px", cursor: "pointer", marginBottom: 16 }}>
          Clear Note Filter
        </button>

        <hr style={{ margin: "16px 0" }} />

        <label htmlFor="noteTitle"><strong>Title</strong></label>
        <br />
        <input
          id="noteTitle"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          style={{ minWidth: 420, padding: 8, marginTop: 8, marginBottom: 12 }}
        />
        <br />

        <label htmlFor="noteBody"><strong>Body</strong></label>
        <br />
        <textarea
          id="noteBody"
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={5}
          style={{ minWidth: 420, width: "100%", maxWidth: 700, padding: 8, marginTop: 8, marginBottom: 12 }}
        />
        <br />

        <button
          type="button"
          onClick={saveNote}
          disabled={noteSaving}
          style={{ padding: "8px 14px", cursor: "pointer", marginRight: 8 }}
        >
          {noteSaving ? "Saving..." : editingNoteId ? "Update Note" : "Create Note"}
        </button>

        <button
          type="button"
          onClick={startCreateNote}
          style={{ padding: "8px 14px", cursor: "pointer" }}
        >
          New Note
        </button>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {notes.length === 0 ? (
            <p>No notes for this workspace yet.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 12,
                  background: note.archived_at ? "#f3f3f3" : "#fafafa",
                  opacity: note.archived_at ? 0.8 : 1,
                }}
              >
                <p><strong>Title:</strong> {note.title}</p>
                <p><strong>Updated:</strong> {note.updated_at}</p>
                <p><strong>Archived:</strong> {note.archived_at || "No"}</p>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: 12 }}>
                  {note.body}
                </pre>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => startEditNote(note)}
                    style={{ padding: "8px 14px", cursor: "pointer", marginRight: 8 }}
                  >
                    Edit
                  </button>

                  {note.archived_at ? (
                    <button
                      type="button"
                      onClick={() => restoreNote(note.id)}
                      style={{ padding: "8px 14px", cursor: "pointer" }}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => archiveNote(note.id)}
                      style={{ padding: "8px 14px", cursor: "pointer" }}
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

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Latest Context Switch</h2>
        {latestSwitchEvent ? (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: 12 }}>
            {JSON.stringify(latestSwitchEvent, null, 2)}
          </pre>
        ) : (
          <p>No context switch audit found yet.</p>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2>Audit Filter</h2>
        <label htmlFor="auditAction"><strong>Action</strong></label>
        <br />
        <input
          id="auditAction"
          value={auditActionFilter}
          onChange={(e) => setAuditActionFilter(e.target.value)}
          placeholder="admin_context_switched"
          style={{ minWidth: 320, padding: 8, marginTop: 8, marginBottom: 12 }}
        />
        <br />
        <button type="button" onClick={applyAuditFilter} style={{ padding: "8px 14px", cursor: "pointer", marginRight: 8 }}>
          Apply Filter
        </button>
        <button type="button" onClick={clearAuditFilter} style={{ padding: "8px 14px", cursor: "pointer" }}>
          Clear Filter
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <h2>Recent Admin Audit</h2>
        {auditItems.length === 0 ? (
          <p>No audit rows found.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {auditItems.map((item, index) => {
              const createdAt = item.created_at || "n/a";
              const action = item.action || "n/a";

              return (
                <div
                  key={`${createdAt}-${index}`}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 6,
                    padding: 12,
                    background: "#fafafa",
                  }}
                >
                  <p><strong>Created:</strong> {createdAt}</p>
                  <p><strong>Action:</strong> {action}</p>
                  <p><strong>Actor:</strong> {item.actor_email || item.actor_user_id || "n/a"}</p>
                  <p><strong>Target:</strong> {item.target_type || "n/a"} / {item.target_id || "n/a"}</p>
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: 12 }}>
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </section>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Onboarding</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Workspace onboarding</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Capture workspace profile, goals, channels, and brand inputs.
            </p>
          </div>
          <a
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            href="/admin/onboarding"
          >
            Open onboarding
          </a>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Strategy</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Workspace strategy</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Generate a working growth strategy from onboarding inputs, channels, messaging, and 90-day priorities.
            </p>
          </div>
          <a
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            href="/admin/strategy"
          >
            Open strategy
          </a>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Execution</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Weekly execution workspace</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Turn strategy into weekly tasks, owners, statuses, priorities, and execution notes.
            </p>
          </div>
          <a
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            href="/admin/execution"
          >
            Open execution
          </a>
        </div>
      </section>
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">Summary</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">Workspace summary</h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-600">
              Review onboarding, strategy, execution, counts, and recent audit activity.
            </p>
          </div>
          <a
            href="/admin/summary"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
          >
            Open summary
          </a>
        </div>
      </section>
</main>
  );
}