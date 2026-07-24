"use client";

import { useEffect, useMemo, useState } from "react";

type ActiveContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  brandId: string | null;
  brandName: string | null;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string | null;
};

type SettingItem = {
  id: string;
  key: string;
  value: unknown;
  created_by_email: string | null;
  updated_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type SettingVersionItem = {
  id: string;
  workspace_setting_id: string | null;
  key: string;
  action: "created" | "updated" | "deleted" | "restored";
  value: unknown;
  actor_email: string | null;
  created_at: string;
};

type SettingsResponse = {
  ok: boolean;
  error?: string;
  active?: ActiveContext;
  items?: SettingItem[];
  item?: SettingItem;
  recentVersions?: SettingVersionItem[];
  deletedId?: string;
  deletedKey?: string;
  restoredFromVersionId?: string;
  filters?: {
    q: string;
    versionAction: "created" | "updated" | "deleted" | "restored" | null;
    settingsLimit: number;
    versionsLimit: number;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Expected JSON response but received: " + text.slice(0, 200));
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function actionTone(action: SettingVersionItem["action"]) {
  if (action === "created") return "bg-emerald-100 text-emerald-700";
  if (action === "updated") return "bg-sky-100 text-sky-700";
  if (action === "deleted") return "bg-rose-100 text-rose-700";
  return "bg-violet-100 text-violet-700";
}

export default function AdminWorkspaceSettingsPage() {
  const [active, setActive] = useState<ActiveContext | null>(null);
  const [items, setItems] = useState<SettingItem[]>([]);
  const [recentVersions, setRecentVersions] = useState<SettingVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SettingItem | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState('{\n  "mode": "dark"\n}');
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [versionAction, setVersionAction] = useState<"" | "created" | "updated" | "deleted" | "restored">("");
  const [settingsLimit, setSettingsLimit] = useState("25");
  const [versionsLimit, setVersionsLimit] = useState("30");

  const activeLabel = useMemo(() => {
    if (!active) return "No active context";
    return [active.tenantName, active.brandName, active.workspaceName].filter(Boolean).join(" / ");
  }, [active]);

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (versionAction) params.set("versionAction", versionAction);
      params.set("settingsLimit", settingsLimit);
      params.set("versionsLimit", versionsLimit);

      const response = await fetch("/api/admin/workspace-settings?" + params.toString(), {
        credentials: "include",
      });

      const data = await readJson<SettingsResponse>(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to load workspace settings");
      }

      setActive(data.active ?? null);
      setItems(data.items ?? []);
      setRecentVersions(data.recentVersions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, [query, versionAction, settingsLimit, versionsLimit]);

  function resetForm() {
    setSelected(null);
    setKeyInput("");
    setValueInput('{\n  "mode": "dark"\n}');
  }

  function clearFilters() {
    setSearchInput("");
    setQuery("");
    setVersionAction("");
    setSettingsLimit("25");
    setVersionsLimit("30");
  }

  function startEdit(item: SettingItem) {
    setSelected(item);
    setKeyInput(item.key);
    setValueInput(formatJson(item.value));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSetting() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      let parsedValue: unknown;

      try {
        parsedValue = JSON.parse(valueInput);
      } catch {
        throw new Error("value must be valid JSON");
      }

      const response = await fetch("/api/admin/workspace-settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: keyInput,
          value: parsedValue,
        }),
      });

      const data = await readJson<SettingsResponse>(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to save setting");
      }

      setMessage(selected ? "Setting updated." : "Setting created.");
      resetForm();
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setting");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSetting(item: SettingItem) {
    const confirmed = window.confirm('Delete setting "' + item.key + '"?');
    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/workspace-settings", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
        }),
      });

      const data = await readJson<SettingsResponse>(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to delete setting");
      }

      if (selected?.id === item.id) {
        resetForm();
      }

      setMessage('Deleted setting "' + item.key + '".');
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete setting");
    } finally {
      setDeletingId(null);
    }
  }

  async function restoreVersion(item: SettingVersionItem) {
    const confirmed = window.confirm('Restore version for "' + item.key + '"?');
    if (!confirmed) return;

    setRestoringVersionId(item.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/workspace-settings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          versionId: item.id,
        }),
      });

      const data = await readJson<SettingsResponse>(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to restore setting version");
      }

      setMessage('Restored version for "' + item.key + '".');
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore setting version");
    } finally {
      setRestoringVersionId(null);
    }
  }

  function exportCsv(kind: "settings" | "versions" | "audit") {
    window.open("/api/admin/exports?kind=" + kind, "_blank");
  }

  const statCards = [
    { label: "Visible settings", value: items.length },
    { label: "Visible versions", value: recentVersions.length },
    { label: "Settings limit", value: settingsLimit },
    { label: "Versions limit", value: versionsLimit },
  ];

  return (
    <main className="oi-shell mx-auto max-w-7xl px-6 py-10">
      <section className="oi-card rounded-[32px] p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="oi-kicker">Workspace settings</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Workspace settings control
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Manage tenant-scoped settings, inspect version history, restore previous states, and export operational snapshots from a unified premium workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/admin" className="oi-button-primary">
                Back to admin
              </a>
              <button type="button" onClick={() => exportCsv("settings")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Export settings CSV
              </button>
              <button type="button" onClick={() => exportCsv("versions")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Export versions CSV
              </button>
              <button type="button" onClick={() => exportCsv("audit")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Export audit CSV
              </button>
            </div>
          </div>

          <div className="min-w-[300px] rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="oi-brand-gradient h-2 w-24 rounded-full" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active context</p>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-900">{activeLabel}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="oi-card rounded-[28px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 oi-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="grid flex-1 gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search key</span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ui.theme"
              className="oi-input"
            />
          </label>

          <label className="grid min-w-[180px] gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Version action</span>
            <select
              value={versionAction}
              onChange={(e) => setVersionAction(e.target.value as "" | "created" | "updated" | "deleted" | "restored")}
              className="oi-select"
            >
              <option value="">All</option>
              <option value="created">created</option>
              <option value="updated">updated</option>
              <option value="deleted">deleted</option>
              <option value="restored">restored</option>
            </select>
          </label>

          <label className="grid min-w-[150px] gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Settings limit</span>
            <select value={settingsLimit} onChange={(e) => setSettingsLimit(e.target.value)} className="oi-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <label className="grid min-w-[150px] gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Versions limit</span>
            <select value={versionsLimit} onChange={(e) => setVersionsLimit(e.target.value)} className="oi-select">
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => setQuery(searchInput.trim())} className="oi-button-primary">
              Apply
            </button>
            <button type="button" onClick={clearFilters} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <section className="oi-card rounded-[28px] p-6 xl:sticky xl:top-6">
          <p className="oi-kicker">Editor</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {selected ? "Update setting" : "Create setting"}
          </h2>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Key</span>
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="ui.theme"
                disabled={Boolean(selected)}
                className="oi-input"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">JSON value</span>
              <textarea
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                rows={14}
                className="oi-textarea"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void saveSetting()} disabled={saving} className="oi-button-primary">
                {saving ? "Saving..." : selected ? "Update setting" : "Create setting"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Reset
              </button>
            </div>

            {message ? (
              <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="oi-card rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="oi-kicker">Current state</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Current settings</h2>
              </div>
              <button type="button" onClick={() => void loadSettings()} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                Refresh
              </button>
            </div>

            {loading ? <p className="mt-6 text-sm text-slate-500">Loading settings…</p> : null}

            {!loading && items.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No settings matched the current filters.
              </div>
            ) : null}

            {!loading && items.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {items.map((item) => (
                  <article key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-950">{item.key}</h3>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                            updated {formatDateTime(item.updated_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          updated by {item.updated_by_email ?? "unknown"}
                        </p>
                        <pre className="mt-4 overflow-x-auto rounded-[20px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{formatJson(item.value)}
                        </pre>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:flex-col">
                        <button type="button" onClick={() => startEdit(item)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteSetting(item)}
                          disabled={deletingId === item.id}
                          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="oi-card rounded-[28px] p-6">
            <div>
              <p className="oi-kicker">Version history</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Restore version history</h2>
            </div>

            {loading ? <p className="mt-6 text-sm text-slate-500">Loading versions…</p> : null}

            {!loading && recentVersions.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No version history matched the current filters.
              </div>
            ) : null}

            {!loading && recentVersions.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {recentVersions.map((item) => (
                  <article key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-950">{item.key}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${actionTone(item.action)}`}>
                            {item.action}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.actor_email ?? "unknown"} at {formatDateTime(item.created_at)}
                        </p>
                        <pre className="mt-4 overflow-x-auto rounded-[20px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{formatJson(item.value)}
                        </pre>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => void restoreVersion(item)}
                          disabled={restoringVersionId === item.id}
                          className="oi-button-primary"
                        >
                          {restoringVersionId === item.id ? "Restoring..." : "Restore version"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}