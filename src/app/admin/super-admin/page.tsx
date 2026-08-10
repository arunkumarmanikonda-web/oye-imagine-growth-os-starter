import Link from 'next/link'
import {
  assessEnterpriseReadiness,
  buildFeatureGovernanceRegister,
  buildPortfolioHealthRollup,
  buildTenantGovernanceSnapshot,
  canImpersonate,
  type FeatureFlagAssignment,
  type HealthSignal,
  type TenantRecord,
} from '@/lib/platform/h3-super-admin-enterprise-control-plane'

const tenant: TenantRecord = {
  tenantId: 'tenant-neejee-enterprise',
  displayName: 'Neejee Enterprise',
  plan: 'enterprise',
  status: 'active',
  deploymentMode: 'dedicated',
  brandMode: 'white_label',
  customDomain: true,
  ssoReady: true,
  scimReady: true,
  supportImpersonationEnabled: true,
  aiRoutingPolicy: 'tenant_pinned',
  financeOversightEnabled: true,
}

const featureFlags: FeatureFlagAssignment[] = [
  {
    key: 'advanced-routing',
    label: 'Advanced AI routing',
    state: 'enabled',
    source: 'manual_override',
    owner: 'platform-governance',
  },
  {
    key: 'partner-portal-beta',
    label: 'Partner portal beta',
    state: 'pilot',
    source: 'experiment',
    owner: 'enterprise-ops',
  },
]

const healthSignals: HealthSignal[] = [
  { area: 'platform', level: 'healthy', summary: 'Core controls healthy' },
  { area: 'security', level: 'healthy', summary: 'Security checks passing' },
  { area: 'finance', level: 'warning', summary: 'Finance oversight review pending' },
]

export default function SuperAdminControlPlanePage() {
  const readiness = assessEnterpriseReadiness(tenant)
  const snapshot = buildTenantGovernanceSnapshot(tenant, featureFlags, healthSignals)
  const register = buildFeatureGovernanceRegister([tenant], {
    [tenant.tenantId]: featureFlags,
  })
  const rollup = buildPortfolioHealthRollup([snapshot])
  const impersonation = canImpersonate(
    {
      actorRole: 'super_admin',
      ticketId: 'SUP-1042',
      reason: 'Investigate tenant admin access issue after entitlement update',
    },
    tenant,
  )

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Super-admin control plane</p>
        <h1 className="mt-4 text-4xl font-semibold">Enterprise tenant governance and audit control center</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">
          Tenant governance, feature flags, AI routing, health inspection, enterprise readiness, and support impersonation
          are formalized here for governed high-privilege operations.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Tenant count</div>
            <div className="mt-3 text-3xl font-semibold">{rollup.tenantCount}</div>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Enterprise ready</div>
            <div className="mt-3 text-3xl font-semibold">{rollup.enterpriseReadyCount}</div>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Warning tenants</div>
            <div className="mt-3 text-3xl font-semibold">{rollup.warningTenantCount}</div>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Critical tenants</div>
            <div className="mt-3 text-3xl font-semibold">{rollup.criticalTenantCount}</div>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Tenant governance snapshot</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div>Tenant: {snapshot.displayName}</div>
              <div>Deployment mode: {tenant.deploymentMode}</div>
              <div>Brand mode: {tenant.brandMode}</div>
              <div>AI routing policy: {tenant.aiRoutingPolicy}</div>
              <div>support impersonation: {tenant.supportImpersonationEnabled ? 'enabled' : 'disabled'}</div>
              <div>Active feature flags: {snapshot.activeFeatureFlags.join(', ')}</div>
              <div>Pilot feature flags: {snapshot.pilotFeatureFlags.join(', ')}</div>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Enterprise readiness</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div>Ready: {readiness.ready ? 'yes' : 'no'}</div>
              <div>Deployment ready: {readiness.deploymentReady ? 'yes' : 'no'}</div>
              <div>Identity ready: {readiness.identityReady ? 'yes' : 'no'}</div>
              <div>Brand isolation ready: {readiness.brandIsolationReady ? 'yes' : 'no'}</div>
              <div>Findings: {readiness.findings.length === 0 ? 'none' : readiness.findings.join('; ')}</div>
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Feature governance register</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div>Tenant: {register[0].displayName}</div>
              <div>Enabled count: {register[0].enabledCount}</div>
              <div>Pilot count: {register[0].pilotCount}</div>
              <div>Manual overrides: {register[0].manualOverrideCount}</div>
              <div>Flag labels: {featureFlags.map((flag) => flag.key).join(', ')}</div>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Impersonation gate</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div>Allowed: {impersonation.allowed ? 'yes' : 'no'}</div>
              <div>Actor role: super_admin</div>
              <div>Ticket: SUP-1042</div>
              <div>Reason: Investigate tenant admin access issue after entitlement update</div>
            </div>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Operator workspace
          </Link>
          <Link href="/operator" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Operator alias
          </Link>
          <Link href="/super-admin" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
            Super-admin alias
          </Link>
        </div>
      </section>
    </main>
  )
}