import type { Route } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import type { WorkspaceIdentity } from '@/lib/auth/workspace-access'

function initials(email: string | null) {
  if (!email) return 'OI'
  return email.split('@')[0].split(/[._-]/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'OI'
}

export default function PremiumWorkspaceShell({
  identity,
  children,
}: {
  identity: WorkspaceIdentity
  children: ReactNode
}) {
  const { role, membership, email } = identity
  const primaryAction = role.quickActions[0]
  const mobileNav = role.nav.slice(0, 5)

  return (
    <div className="app-shell" data-role={role.key}>
      <aside className="app-rail" aria-label={`${role.label} workspace navigation`}>
        <Link className="app-rail-brand" href="/workspace" aria-label="Oye !magine workspace">
          <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" />
        </Link>

        <nav className="app-rail-nav">
          {role.nav.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href as Route} className="app-rail-link">
              <span className="app-rail-glyph" aria-hidden="true">{item.glyph}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-rail-account">
          <span className="app-avatar">{initials(email)}</span>
          <span className="app-account-copy"><strong>{role.shortLabel}</strong><small>{email ?? 'Signed in'}</small></span>
          <form action="/api/auth/logout" method="post"><button type="submit" className="app-icon-button" aria-label="Sign out">↗</button></form>
        </div>
      </aside>

      <div className="app-stage">
        <header className="app-topbar">
          <div>
            <p className="app-topbar-eyebrow">{role.label}</p>
            <strong className="app-topbar-workspace">{membership.workspace_id}</strong>
          </div>
          <div className="app-topbar-actions">
            {role.lane === 'admin' ? <Link href="/admin/ai-concierge" className="app-search-pill"><span aria-hidden="true">⌕</span><span>Ask Oye</span><kbd>⌘K</kbd></Link> : null}
            {primaryAction ? <Link href={primaryAction.href as Route} className="app-create-button"><span aria-hidden="true">＋</span> {primaryAction.label}</Link> : null}
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>

      <nav className="app-mobile-dock" aria-label={`${role.label} mobile navigation`}>
        {mobileNav.map((item) => <Link key={`${item.href}-${item.label}-mobile`} href={item.href as Route}><b aria-hidden="true">{item.glyph}</b><span>{item.label}</span></Link>)}
      </nav>
    </div>
  )
}
