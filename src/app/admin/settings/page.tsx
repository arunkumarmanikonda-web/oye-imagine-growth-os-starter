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
  action: "created" | "updated" | "deleted";
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
};

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Expected JSON response but received: " + text.slice(0, 200));
  }
}

export default function AdminWorkspaceSettingsPage() {
  const [active, setActive] = useState<ActiveContext | null>(null);
  const [items, setItems] = useState<SettingItem[]>([]);
  const [recentVersions, setRecentVersions] = useState<SettingVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SettingItem | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("{`n  `"mode`": `"dark`"`n}".Replace("`" + '"',"\"" ))
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const activeLabel = useMemo(() => {
    if (!active) return "";
    return [active.tenantName, active.brandName, active.workspaceName].filter(Boolean).join(" / ");
  }, [active]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.key.toLowerCase().includes(q));
  }, [items, search]);

  const filteredVersions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentVersions;
    return recentVersions.filter((item) => item.key.toLowerCase().includes(q));
  }, [recentVersions, search]);

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/workspace-settings", {
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
  }, []);

  function resetForm() {
    setSelected(null);
    setKeyInput("");
    setValueInput('{\n  "mode": "dark"\n}');
  }

  function startEdit(item: SettingItem) {
    setSelected(item);
    setKeyInput(item.key);
    setValueInput(JSON.stringify(item.value, null, 2));
    setMessage("");
    setError("");
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

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Workspace Settings Admin</h1>
          <p style={{ marginTop: 8, color: "#555" }}>
            Manage tenant-scoped workspace settings and inspect recent versions.
          </p>
        </div>
        <a href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          Back to /admin
        </a>
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fafafa" }}>
        <h2 style={{ marginTop: 0 }}>Active Context</h2>
        <div>{active ? activeLabel : "No active context loaded"}</div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>{selected ? "Edit Setting" : "Create Setting"}</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Key</span>
            <input
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="ui.theme"
              disabled={Boolean(selected)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>JSON Value</span>
            <textarea
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              rows={12}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontFamily: "Consolas, monospace" }}
            />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => void saveSetting()}
              disabled={saving}
              style={{ padding: "10px 14px", borderRadius: 8, border: 0, background: "#111827", color: "#fff", cursor: "pointer" }}
            >
              {saving ? "Saving..." : selected ? "Update Setting" : "Create Setting"}
            </button>

            <button
              onClick={resetForm}
              type="button"
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {message ? <div style={{ color: "#065f46", fontWeight: 600 }}>{message}</div> : null}
          {error ? <div style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</div> : null}
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Current Settings</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by key"
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button
              onClick={() => void loadSettings()}
              type="button"
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? <div>Loading...</div> : null}

        {!loading && filteredItems.length === 0 ? (
          <div>No workspace settings found.</div>
        ) : null}

        {!loading && filteredItems.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredItems.map((item) => (
              <article
                key={item.id}
                style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{item.key}</div>
                    <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                      updated by {item.updated_by_email ?? "unknown"} at {new Date(item.updated_at).toLocaleString()}
                    </div>
                    <pre
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 8,
                        background: "#0f172a",
                        color: "#e5e7eb",
                        overflowX: "auto",
                        fontSize: 12,
                      }}
                    >
{JSON.stringify(item.value, null, 2)}
                    </pre>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      onClick={() => startEdit(item)}
                      type="button"
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => void deleteSetting(item)}
                      disabled={deletingId === item.id}
                      type="button"
                      style={{ padding: "8px 12px", borderRadius: 8, border: 0, background: "#b91c1c", color: "#fff", cursor: "pointer" }}
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

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recent Setting Versions</h2>

        {loading ? <div>Loading...</div> : null}

        {!loading && filteredVersions.length === 0 ? (
          <div>No setting versions found.</div>
        ) : null}

        {!loading && filteredVersions.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredVersions.map((item) => (
              <article
                key={item.id}
                style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      {item.key} · {item.action}
                    </div>
                    <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                      {item.actor_email ?? "unknown"} at {new Date(item.created_at).toLocaleString()}
                    </div>
                    <pre
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 8,
                        background: "#111827",
                        color: "#e5e7eb",
                        overflowX: "auto",
                        fontSize: 12,
                      }}
                    >
{JSON.stringify(item.value, null, 2)}
                    </pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}