import type { Route } from 'next'
import Link from 'next/link'
import PremiumWorkspaceShell from '@/components/app/PremiumWorkspaceShell'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { decidePermission } from '@/lib/auth/access-resolver'
import { permissionForPathname } from '@/lib/auth/permissions'

const operationalCards = [
  { label: 'Brand truth', value: 'Grounded', note: 'Approved context first', tone: 'yellow' },
  { label: 'Creative queue', value: 'Ready', note: 'Assets stay versioned', tone: 'pink' },
  { label: 'Approvals', value: 'Guarded', note: 'Human control on impact', tone: 'mint' },
  { label: 'Evidence', value: 'Traceable', note: 'Sources and freshness visible', tone: 'ink' },
]

export default async function WorkspacePage() {
  const identity = await requireWorkspaceIdentity({ redirectTo: '/workspace' })
  const { role, membership, email } = identity
  const allowed = (href: string) => {
    const permission = permissionForPathname(href)
    return !permission || decidePermission({ roleKey: membership.role_key, membership, permissionSet: identity.permissionSet, permission }).allowed
  }
  const quickActions = role.quickActions.filter((action) => allowed(action.href))
  const askOyeAllowed = allowed('/admin/ai-concierge')

  return (
    <PremiumWorkspaceShell identity={identity}>
      <section className="workspace-home">
        <header className="workspace-hero">
          <div><p className="workspace-kicker">{role.label} workspace</p><h1>{role.headline}</h1><p>{role.description}</p></div>
          <div className={`workspace-role-card tone-${role.accent}`}><span className="workspace-role-dot" aria-hidden="true">✦</span><div><small>Signed in as</small><strong>{email ?? 'Verified user'}</strong><span>{role.label}</span></div></div>
        </header>
        <section className="workspace-story-row" aria-label="Workspace operating signals">{operationalCards.map((card) => <article key={card.label} className={`workspace-story tone-${card.tone}`}><span className="workspace-story-ring"><i /></span><strong>{card.label}</strong><b>{card.value}</b><small>{card.note}</small></article>)}</section>
        <div className="workspace-grid">
          <section className="workspace-feed-card">
            <div className="workspace-section-head"><div><small>Today</small><h2>Your operating feed</h2></div><span className="live-pill"><i /> live workspace</span></div>
            <article className="workspace-feed-item feature"><div className="feed-icon">✺</div><div><small>Oye intelligence</small><h3>Start from the business truth, then decide the next best action.</h3><p>Your role and any explicit Super Admin overrides control which tools can act, which require approval and which are read-only.</p><div className="feed-actions">{quickActions[0] ? <Link href={quickActions[0].href as Route}>Open next action</Link> : null}{askOyeAllowed ? <Link href="/admin/ai-concierge">Ask Oye</Link> : null}</div></div></article>
            <article className="workspace-feed-item"><div className="feed-icon yellow">◎</div><div><small>Workspace scope</small><h3>{membership.workspace_id}</h3><p>Tenant, brand and effective permissions are revalidated from your signed-in identity rather than a browser-selected role.</p></div></article>
            <article className="workspace-feed-item"><div className="feed-icon pink">◈</div><div><small>Governance</small><h3>High-impact actions stay approval-bound.</h3><p>Publishing, spend, messaging, commercial mutations and autonomous tools respect the configured control plane.</p></div></article>
          </section>
          <aside className="workspace-side-stack">
            <section className="workspace-quick-card"><div className="workspace-section-head"><div><small>Quick actions</small><h2>Move work forward</h2></div></div><div className="workspace-quick-list">{quickActions.length ? quickActions.map((action, index) => <Link href={action.href as Route} key={action.label}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{action.label}</strong><small>{action.detail}</small></div><b>→</b></Link>) : <p className="p-4 text-sm text-black/55">No mutation actions are granted to this identity. Read-only access remains available where permitted.</p>}</div></section>
            <section className="workspace-scope-card"><small>Access scope</small><h2>{role.shortLabel}</h2><p>This workspace is personalised from role defaults plus explicit user-level grants or revocations.</p><div className="workspace-scope-meta"><span>Tenant <b>{membership.tenant_id}</b></span><span>Brand <b>{membership.brand_id}</b></span></div></section>
          </aside>
        </div>
      </section>
    </PremiumWorkspaceShell>
  )
}
