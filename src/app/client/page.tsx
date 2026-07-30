import Link from "next/link";
import { cookies } from "next/headers";
import { resolveCanonicalWorkspaceContext } from "@/lib/admin/canonical-workspace";
import { authCookieKeys, resolveAuthSessionFromCookieMap } from "@/lib/auth/session";
import { buildSupportStripModel } from "@/lib/foundation/public-shell";

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const session = resolveAuthSessionFromCookieMap({
    [authCookieKeys.lane]: cookieStore.get(authCookieKeys.lane)?.value,
    [authCookieKeys.email]: cookieStore.get(authCookieKeys.email)?.value,
    [authCookieKeys.workspaceSlug]: cookieStore.get(authCookieKeys.workspaceSlug)?.value,
    [authCookieKeys.tenantSlug]: cookieStore.get(authCookieKeys.tenantSlug)?.value,
    [authCookieKeys.brandSlug]: cookieStore.get(authCookieKeys.brandSlug)?.value,
    [authCookieKeys.issuedAt]: cookieStore.get(authCookieKeys.issuedAt)?.value,
  });

  const workspace = resolveCanonicalWorkspaceContext(session);
  const support = buildSupportStripModel();

  return (
    <main className="oi-shell">
      <div className="oi-main">
        <div className="oi-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="oi-grid oi-grid--two">
            <article className="oi-card">
              <div className="oi-pill">Client dashboard</div>
              <h1 className="oi-page-title" style={{ marginTop: 12 }}>
                Client access lane is now protected and workspace-aware
              </h1>
              <p className="oi-page-subtitle">
                This dashboard is the protected client landing surface for Batch A / A2.
              </p>

              <div className="oi-meta-line" style={{ marginTop: 18 }}>
                <strong>Lane:</strong> {session.lane}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Email:</strong> {session.email}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Workspace:</strong> {workspace.workspaceSlug}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Tenant:</strong> {workspace.tenantSlug}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Brand:</strong> {workspace.brandName}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                <Link className="oi-btn oi-btn--secondary" href="/marketplace">
                  Back to marketplace
                </Link>
                <a className="oi-btn oi-btn--primary" href="mailto:hello@oyeimagine.com">
                  Contact support
                </a>
              </div>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Support and next layers</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                <li>Commercial dashboards arrive in Mega Batch B</li>
                <li>AI concierge arrives in Mega Batch C</li>
                <li>Support email: {support.primaryEmail}</li>
                <li>Support phone: {support.primaryPhone}</li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}