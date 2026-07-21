"use client";

import { useEffect, useState } from "react";

type AdminContextResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string | null;
    role: string | null;
    full_name: string | null;
  };
  context?: {
    tenant?: {
      id: string;
      slug: string;
      legal_name: string | null;
      display_name: string | null;
      created_at: string;
    } | null;
    brand?: {
      id: string;
      tenant_id: string;
      name: string;
      website_url: string | null;
      created_at: string;
    } | null;
    workspace?: {
      id: string;
      tenant_id: string;
      brand_id: string | null;
      name: string;
      slug: string;
      created_at: string;
      updated_at: string;
    } | null;
  };
  error?: string;
};

export default function AdminPage() {
  const [data, setData] = useState<AdminContextResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/context", { cache: "no-store" });
        const json = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (error) {
        if (!cancelled) {
          setData({
            ok: false,
            error: error instanceof Error ? error.message : "Failed to load admin context",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>Oye !magine Admin</h1>
      <p>Platform-admin guard is active. Tenant-aware admin context is loading from the live Supabase seed.</p>

      {loading ? (
        <p>Loading admin context...</p>
      ) : !data?.ok ? (
        <div style={{ color: "#b42318", background: "#fef3f2", padding: "12px", borderRadius: "8px" }}>
          {data?.error ?? "Failed to load admin context"}
        </div>
      ) : (
        <>
          <section style={{ marginTop: "24px" }}>
            <h2>Admin Identity</h2>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Name:</strong> {data.user?.full_name ?? "-"}</li>
              <li><strong>Email:</strong> {data.user?.email ?? "-"}</li>
              <li><strong>Role:</strong> {data.user?.role ?? "-"}</li>
              <li><strong>User ID:</strong> {data.user?.id ?? "-"}</li>
            </ul>
          </section>

          <section style={{ marginTop: "24px" }}>
            <h2>Tenant Context</h2>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Tenant:</strong> {data.context?.tenant?.display_name ?? data.context?.tenant?.legal_name ?? "-"}</li>
              <li><strong>Tenant Slug:</strong> {data.context?.tenant?.slug ?? "-"}</li>
              <li><strong>Tenant ID:</strong> {data.context?.tenant?.id ?? "-"}</li>
              <li><strong>Brand:</strong> {data.context?.brand?.name ?? "-"}</li>
              <li><strong>Brand ID:</strong> {data.context?.brand?.id ?? "-"}</li>
              <li><strong>Workspace:</strong> {data.context?.workspace?.name ?? "-"}</li>
              <li><strong>Workspace Slug:</strong> {data.context?.workspace?.slug ?? "-"}</li>
              <li><strong>Workspace ID:</strong> {data.context?.workspace?.id ?? "-"}</li>
            </ul>
          </section>

          <section style={{ marginTop: "24px" }}>
            <h2>Next Build Targets</h2>
            <ul style={{ lineHeight: 1.8 }}>
              <li>Neejee tenant / brand / workspace seed</li>
              <li>0004 RLS hardening migration</li>
              <li>Platform-admin action audit trail</li>
              <li>Tenant-aware admin UI shell</li>
            </ul>
          </section>
        </>
      )}
    </main>
  );
}