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

function actionBadgeColor(action: SettingVersionItem["action"]) {
  if (action === "created") return "#065f46";
  if (action === "updated") return "#1d4ed8";
  if (action === "deleted") return "#b91c1c";
  return "#7c3aed";
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
    if (!active) return "";
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
    if (!confirmed) {
      return;
    }

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
    if (!confirmed) {
      return;
    }

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

  return (
    <main style={{ padding: 24, maxWidth: 1320, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Workspace Settings Admin</h1>
          <p style={{ marginTop: 8, color: "#555", maxWidth: 820 }}>
            Manage tenant-scoped workspace settings, inspect version history, restore prior versions,
            export operational data, and work with larger data sets more efficiently.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/admin"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            Back to /admin
          </a>
        </div>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fafafa" }}>
          <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Active Context</div>
          <div style={{ marginTop: 8, fontWeight: 700 }}>{active ? activeLabel : "No active context"}</div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fafafa" }}>
          <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Visible Settings</div>
          <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24 }}>{items.length}</div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fafafa" }}>
          <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Visible Versions</div>
          <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24 }}>{recentVersions.length}</div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>Exports</h2>
            <p style={{ marginTop: 6, color: "#666" }}>Download CSV snapshots for settings, versions, and audit activity.</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => exportCsv("settings")}
              type="button"
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            >
              Export Settings CSV
            </button>
            <button
              onClick={() => exportCsv("versions")}
              type="button"
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            >
              Export Versions CSV
            </button>
            <button
              onClick={() => exportCsv("audit")}
              type="button"
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            >
              Export Audit CSV
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Search key</span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ui.theme"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Version action</span>
            <select
              value={versionAction}
              onChange={(e) => setVersionAction(e.target.value as "" | "created" | "updated" | "deleted" | "restored")}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff" }}
            >
              <option value="">All</option>
              <option value="created">created</option>
              <option value="updated">updated</option>
              <option value="deleted">deleted</option>
              <option value="restored">restored</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Settings limit</span>
            <select
              value={settingsLimit}
              onChange={(e) => setSettingsLimit(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff" }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Versions limit</span>
            <select
              value={versionsLimit}
              onChange={(e) => setVersionsLimit(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff" }}
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <button
            onClick={() => setQuery(searchInput.trim())}
            type="button"
            style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: "#111827", color: "#fff", cursor: "pointer" }}
          >
            Apply
          </button>

          <button
            onClick={clearFilters}
            type="button"
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
          >
            Clear
          </button>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            background: "#fff",
            position: "sticky",
            top: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>{selected ? "Edit Setting" : "Create Setting"}</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Key</span>
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="ui.theme"
                disabled={Boolean(selected)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>JSON Value</span>
              <textarea
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                rows={14}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontFamily: "Consolas, monospace",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => void saveSetting()}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: 0,
                  background: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : selected ? "Update Setting" : "Create Setting"}
              </button>

              <button
                onClick={resetForm}
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            {message ? (
              <div style={{ color: "#065f46", fontWeight: 600, background: "#ecfdf5", padding: 10, borderRadius: 10 }}>
                {message}
              </div>
            ) : null}

            {error ? (
              <div style={{ color: "#b91c1c", fontWeight: 600, background: "#fef2f2", padding: 10, borderRadius: 10 }}>
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Current Settings</h2>
              <button
                onClick={() => void loadSettings()}
                type="button"
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
              >
                Refresh
              </button>
            </div>

            {loading ? <div>Loading...</div> : null}

            {!loading && items.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 12, background: "#f8fafc", color: "#475569" }}>
                No settings matched the current filters.
              </div>
            ) : null}

            {!loading && items.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {items.map((item) => (
                  <article
                    key={item.id}
                    style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{item.key}</div>
                        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                          updated by {item.updated_by_email ?? "unknown"} at {new Date(item.updated_at).toLocaleString()}
                        </div>
                        <pre
                          style={{
                            marginTop: 10,
                            padding: 12,
                            borderRadius: 10,
                            background: "#0f172a",
                            color: "#e5e7eb",
                            overflowX: "auto",
                            fontSize: 12,
                          }}
                        >
{formatJson(item.value)}
                        </pre>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        <button
                          onClick={() => startEdit(item)}
                          type="button"
                          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => void deleteSetting(item)}
                          disabled={deletingId === item.id}
                          type="button"
                          style={{ padding: "8px 12px", borderRadius: 10, border: 0, background: "#b91c1c", color: "#fff", cursor: "pointer" }}
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

          <section
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Recent Setting Versions</h2>

            {loading ? <div>Loading...</div> : null}

            {!loading && recentVersions.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 12, background: "#f8fafc", color: "#475569" }}>
                No version history matched the current filters.
              </div>
            ) : null}

            {!loading && recentVersions.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {recentVersions.map((item) => (
                  <article
                    key={item.id}
                    style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700 }}>{item.key}</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#fff",
                              background: actionBadgeColor(item.action),
                              borderRadius: 999,
                              padding: "4px 8px",
                              textTransform: "uppercase",
                              letterSpacing: 0.3,
                            }}
                          >
                            {item.action}
                          </span>
                        </div>
                        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                          {item.actor_email ?? "unknown"} at {new Date(item.created_at).toLocaleString()}
                        </div>
                        <pre
                          style={{
                            marginTop: 10,
                            padding: 12,
                            borderRadius: 10,
                            background: "#111827",
                            color: "#e5e7eb",
                            overflowX: "auto",
                            fontSize: 12,
                          }}
                        >
{formatJson(item.value)}
                        </pre>
                      </div>

                      <div>
                        <button
                          onClick={() => void restoreVersion(item)}
                          disabled={restoringVersionId === item.id}
                          type="button"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: 0,
                            background: "#2563eb",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          {restoringVersionId === item.id ? "Restoring..." : "Restore This Version"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}