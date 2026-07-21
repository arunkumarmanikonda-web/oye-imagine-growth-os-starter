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

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [active, setActive] = useState<AdminWorkspaceContext | null>(null);
  const [options, setOptions] = useState<AdminWorkspaceContext[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

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

  async function loadAudit() {
    const response = await fetch("/api/admin/audit", {
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json()) as AuditResponse;

    if (!response.ok || !json.ok) {
      throw new Error(json.error || "Failed to load admin audit");
    }

    setAuditItems(json.items || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadContext(), loadAudit()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
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

      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch context");
    } finally {
      setSaving(false);
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
          <p>No context available.</p>
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
        <h2>Latest Context Switch</h2>
        {latestSwitchEvent ? (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: 12 }}>
            {JSON.stringify(latestSwitchEvent, null, 2)}
          </pre>
        ) : (
          <p>No context switch audit found yet.</p>
        )}
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
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: 12 }}>
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}