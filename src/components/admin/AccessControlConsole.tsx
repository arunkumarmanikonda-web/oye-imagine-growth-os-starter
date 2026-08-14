'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type Snapshot = {
  users: Array<{ id: string; email: string | null; fullName: string | null; mustChangePassword: boolean; demoAccount: boolean; lastSignInAt: string | null }>
  memberships: Array<{ membership_id: string; user_id: string; tenant_id: string; brand_id: string | null; workspace_id: string | null; role_key: string; status: string }>
  roles: Array<{ role_key: string; role_name: string; permissions: string[]; system_role: boolean }>
  overrides: Array<{ override_id: string; user_id: string; permission_key: string; effect: string; status: string; reason: string; tenant_id: string | null; brand_id: string | null; workspace_id: string | null }>
  permissionCatalog: Array<{ permission_key: string; category: string; label: string; description: string; risk_class: string }>
}
const emptySnapshot: Snapshot = { users: [], memberships: [], roles: [], overrides: [], permissionCatalog: [] }

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const body = await response.json()
  if (!response.ok || !body.ok) throw new Error(body.message ?? body.code ?? 'Request failed')
  return body
}

export function AccessControlConsole() {
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issuedCredential, setIssuedCredential] = useState<{ email: string; password: string } | null>(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [nextRole, setNextRole] = useState('')

  const load = useCallback(async () => {
    try {
      const body = await api('/api/admin/access/users')
      const next: Snapshot = { users: body.users ?? [], memberships: body.memberships ?? [], roles: body.roles ?? [], overrides: body.overrides ?? [], permissionCatalog: body.permissionCatalog ?? [] }
      setSnapshot(next)
      setSelectedUser((current) => current || next.users[0]?.id || '')
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load access control.') }
  }, [])
  useEffect(() => { void load() }, [load])

  const membershipByUser = useMemo(() => new Map(snapshot.memberships.map((item) => [item.user_id, item])), [snapshot.memberships])
  const selected = snapshot.users.find((user) => user.id === selectedUser) ?? null
  const selectedMembership = selected ? membershipByUser.get(selected.id) ?? null : null
  const selectedOverrides = snapshot.overrides.filter((item) => item.user_id === selectedUser && item.status === 'active')

  useEffect(() => { setNextRole(selectedMembership?.role_key ?? '') }, [selectedMembership?.role_key])

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setIssuedCredential(null)
    const form = new FormData(event.currentTarget)
    try {
      const body = await api('/api/admin/access/users', { method: 'POST', body: JSON.stringify({ email: form.get('email'), fullName: form.get('fullName'), roleKey: form.get('roleKey'), tenantId: form.get('tenantId'), brandId: form.get('brandId'), workspaceId: form.get('workspaceId'), demoAccount: form.get('demoAccount') === 'on' }) })
      setIssuedCredential({ email: body.result.email, password: body.result.temporaryPassword }); event.currentTarget.reset(); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'User creation failed.') }
    finally { setBusy(false) }
  }

  async function resetPassword() {
    if (!selected) return
    setBusy(true); setError(null); setIssuedCredential(null)
    try {
      const body = await api('/api/admin/access/users', { method: 'PATCH', body: JSON.stringify({ action: 'require_password_reset', userId: selected.id, reason: 'Super Admin issued a temporary credential.' }) })
      setIssuedCredential({ email: selected.email ?? selected.id, password: body.result.temporaryPassword }); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Password reset failed.') }
    finally { setBusy(false) }
  }

  async function updateMembership(patch: Record<string, unknown>, reason: string) {
    if (!selected || !selectedMembership) return
    setBusy(true); setError(null)
    try {
      await api('/api/admin/access/users', { method: 'PATCH', body: JSON.stringify({ userId: selected.id, membershipId: selectedMembership.membership_id, ...patch, reason }) })
      await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Membership update failed.') }
    finally { setBusy(false) }
  }

  async function deleteUser() {
    if (!selected || !selected.demoAccount) { setError('Deletion from this console is limited to accounts explicitly marked as disposable demo accounts.'); return }
    if (!window.confirm(`Delete ${selected.email}? This permanently removes the disposable demo identity.`)) return
    setBusy(true); setError(null)
    try { await api('/api/admin/access/users', { method: 'DELETE', body: JSON.stringify({ userId: selected.id, reason: 'Super Admin deleted disposable demo account.' }) }); setSelectedUser(''); await load() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Delete failed.') }
    finally { setBusy(false) }
  }

  async function addOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return
    const form = new FormData(event.currentTarget); setBusy(true); setError(null)
    try {
      await api('/api/admin/access/overrides', { method: 'POST', body: JSON.stringify({ userId: selected.id, permissionKey: form.get('permissionKey'), effect: form.get('effect'), reason: form.get('reason'), tenantId: form.get('scope') === 'workspace' ? selectedMembership?.tenant_id : null, brandId: form.get('scope') === 'workspace' ? selectedMembership?.brand_id : null, workspaceId: form.get('scope') === 'workspace' ? selectedMembership?.workspace_id : null }) })
      event.currentTarget.reset(); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Permission change failed.') }
    finally { setBusy(false) }
  }

  async function revokeOverride(overrideId: string) {
    setBusy(true); setError(null)
    try { await api('/api/admin/access/overrides', { method: 'DELETE', body: JSON.stringify({ overrideId, reason: 'Super Admin revoked the explicit override.' }) }); await load() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Override revoke failed.') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-7">
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
      {issuedCredential ? <div className="rounded-[1.75rem] border border-amber-300/30 bg-amber-200/10 p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Show once · temporary credential</p><p className="mt-3 text-sm text-white">{issuedCredential.email}</p><code className="mt-2 block rounded-xl bg-black/40 p-3 text-lg text-amber-200">{issuedCredential.password}</code><p className="mt-3 text-xs text-white/55">The user must replace this password at first login. Oye does not keep this plaintext value.</p></div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1.6fr]">
        <form onSubmit={createUser} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Create identity</p><h2 className="mt-2 text-2xl font-semibold">User + default role</h2>
          <div className="mt-5 grid gap-3"><input name="fullName" required placeholder="Full name" className="rounded-xl bg-black/30 px-4 py-3" /><input name="email" required type="email" placeholder="user@company.com" className="rounded-xl bg-black/30 px-4 py-3" /><select name="roleKey" required className="rounded-xl bg-black/30 px-4 py-3">{snapshot.roles.map((role) => <option key={role.role_key} value={role.role_key}>{role.role_name}</option>)}</select><input name="tenantId" required defaultValue="tenant_oye_internal" placeholder="Tenant ID" className="rounded-xl bg-black/30 px-4 py-3" /><input name="brandId" required defaultValue="brand_oye_imagine" placeholder="Brand ID" className="rounded-xl bg-black/30 px-4 py-3" /><input name="workspaceId" required defaultValue="workspace_oye_internal" placeholder="Workspace ID" className="rounded-xl bg-black/30 px-4 py-3" /><label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" name="demoAccount" /> Disposable demo account</label><button disabled={busy} className="rounded-full bg-[#fdca5a] px-5 py-3 font-semibold text-black">Create user and temporary password</button></div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Identity control</p><h2 className="mt-2 text-2xl font-semibold">Account lifecycle</h2></div><select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className="max-w-sm rounded-xl bg-black/30 px-4 py-3">{snapshot.users.map((user) => <option key={user.id} value={user.id}>{user.email ?? user.id}</option>)}</select></div>
          {selected ? <div className="mt-6 rounded-2xl bg-black/25 p-5"><div className="grid gap-3 md:grid-cols-2"><span><small className="block text-white/45">Name</small>{selected.fullName ?? '—'}</span><span><small className="block text-white/45">Status</small>{selectedMembership?.status ?? '—'}</span><span><small className="block text-white/45">First-login reset</small>{selected.mustChangePassword ? 'Required' : 'Completed'}</span><span><small className="block text-white/45">Demo account</small>{selected.demoAccount ? 'Yes · disposable' : 'No'}</span></div>{selectedMembership ? <div className="mt-5 flex flex-wrap items-center gap-2"><select value={nextRole} onChange={(event) => setNextRole(event.target.value)} className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm">{snapshot.roles.map((role) => <option key={role.role_key} value={role.role_key}>{role.role_name}</option>)}</select><button onClick={() => void updateMembership({ roleKey: nextRole }, `Super Admin reassigned role to ${nextRole}.`)} disabled={busy || nextRole === selectedMembership.role_key} className="rounded-full border border-white/15 px-4 py-2 text-sm">Apply role</button></div> : null}<div className="mt-5 flex flex-wrap gap-2"><button onClick={resetPassword} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-sm">Issue new temporary password</button><button onClick={() => void updateMembership({ status: 'active' }, 'Super Admin activated account.')} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-sm">Activate</button><button onClick={() => void updateMembership({ status: 'suspended' }, 'Super Admin suspended account.')} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-sm">Suspend</button>{selected.demoAccount ? <button onClick={deleteUser} disabled={busy} className="rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-200">Delete demo</button> : null}</div></div> : null}
        </section>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Granular rights</p><h2 className="mt-2 text-2xl font-semibold">Allow or revoke any permission</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Role permissions remain the default group. Explicit denies override role defaults; explicit allows can extend a non-Super-Admin role. Super Admin self-lockout from platform access is blocked.</p>
        <datalist id="oye-permission-catalog">{snapshot.permissionCatalog.map((item) => <option key={item.permission_key} value={item.permission_key}>{item.category} · {item.label}</option>)}</datalist>
        {selected ? <form onSubmit={addOverride} className="mt-6 grid gap-3 md:grid-cols-[1.3fr_.65fr_.65fr_1.5fr_auto]"><input list="oye-permission-catalog" name="permissionKey" required placeholder="creative.publish or finance.*" className="rounded-xl bg-black/30 px-4 py-3" /><select name="effect" className="rounded-xl bg-black/30 px-4 py-3"><option value="allow">Allow</option><option value="deny">Deny</option></select><select name="scope" className="rounded-xl bg-black/30 px-4 py-3"><option value="platform">Global</option><option value="workspace">This workspace</option></select><input name="reason" required placeholder="Reason for override" className="rounded-xl bg-black/30 px-4 py-3" /><button disabled={busy} className="rounded-full bg-white px-5 py-3 font-semibold text-black">Apply</button></form> : null}
        <div className="mt-5 grid gap-3">{selectedOverrides.length ? selectedOverrides.map((item) => <article key={item.override_id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black/25 p-4"><div><b className={item.effect === 'deny' ? 'text-red-200' : 'text-emerald-200'}>{item.effect.toUpperCase()}</b> <code className="ml-2">{item.permission_key}</code><p className="mt-1 text-xs text-white/45">{item.reason}</p></div><button onClick={() => revokeOverride(item.override_id)} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-xs">Revoke override</button></article>) : <p className="text-sm text-white/45">No explicit overrides for the selected identity. Role defaults apply.</p>}</div>
      </section>
    </div>
  )
}
