'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

type Role = { role_key: string; role_name: string; role_scope: string; permissions: string[]; system_role: boolean; metadata?: Record<string, unknown> }
type Permission = { permission_key: string; category: string; label: string; description: string; risk_class: string }

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const body = await response.json()
  if (!response.ok || !body.ok) throw new Error(body.message ?? body.code ?? 'Request failed')
  return body
}

export function CustomRoleConsole() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const body = await api('/api/admin/access/users')
      setRoles(body.roles ?? [])
      setPermissions(body.permissionCatalog ?? [])
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load roles.') }
  }, [])
  useEffect(() => { void load() }, [load])

  async function createRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null)
    const form = new FormData(event.currentTarget)
    const selected = form.getAll('permissions').map(String)
    try {
      await api('/api/admin/access/roles', { method: 'POST', body: JSON.stringify({
        roleKey: form.get('roleKey'), roleName: form.get('roleName'), roleScope: form.get('roleScope'),
        baseRoleKey: form.get('baseRoleKey'), permissions: selected, reason: form.get('reason'),
      }) })
      event.currentTarget.reset(); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Role creation failed.') }
    finally { setBusy(false) }
  }

  async function deleteRole(roleKey: string) {
    if (!window.confirm(`Delete custom role ${roleKey}? It must have no active/invited/suspended members.`)) return
    setBusy(true); setError(null)
    try {
      await api('/api/admin/access/roles', { method: 'DELETE', body: JSON.stringify({ roleKey, reason: 'Super Admin deleted unused custom role.' }) })
      await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Role deletion failed.') }
    finally { setBusy(false) }
  }

  const builtIns = roles.filter((role) => role.system_role)
  const custom = roles.filter((role) => !role.system_role)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Role builder</p>
      <h2 className="mt-2 text-2xl font-semibold">Create a role from an experience template</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-white/55">The base template controls dashboard family, lane and MFA. Permissions are independent and chosen here. Individual user overrides can still add or deny rights later.</p>
      {error ? <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
      <form onSubmit={createRole} className="mt-6 grid gap-4 lg:grid-cols-2">
        <input name="roleName" required placeholder="Role name, e.g. Performance Media Lead" className="rounded-xl bg-black/30 px-4 py-3" />
        <input name="roleKey" required placeholder="performance_media_lead" className="rounded-xl bg-black/30 px-4 py-3" />
        <select name="baseRoleKey" required className="rounded-xl bg-black/30 px-4 py-3">{builtIns.filter((role) => role.role_key !== 'platform_owner').map((role) => <option key={role.role_key} value={role.role_key}>Experience: {role.role_name}</option>)}</select>
        <select name="roleScope" className="rounded-xl bg-black/30 px-4 py-3"><option value="workspace">Workspace scope</option><option value="brand">Brand scope</option><option value="tenant">Tenant scope</option><option value="campaign">Campaign scope</option></select>
        <label className="lg:col-span-2"><span className="mb-2 block text-sm font-semibold">Default permissions</span><select name="permissions" multiple size={12} className="w-full rounded-xl bg-black/30 px-4 py-3">{permissions.map((permission) => <option key={permission.permission_key} value={permission.permission_key}>{permission.category} · {permission.label} · {permission.permission_key}</option>)}</select><small className="mt-2 block text-white/40">Use Ctrl/Cmd to select multiple permissions.</small></label>
        <input name="reason" required defaultValue="New operating role required by the organisation." className="rounded-xl bg-black/30 px-4 py-3 lg:col-span-2" />
        <button disabled={busy} className="rounded-full bg-[#fdca5a] px-5 py-3 font-semibold text-black lg:col-span-2">Create custom role</button>
      </form>

      <div className="mt-7 grid gap-3">{custom.length ? custom.map((role) => <article key={role.role_key} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black/25 p-4"><div><strong>{role.role_name}</strong><code className="ml-3 text-xs text-cyan-200">{role.role_key}</code><p className="mt-1 text-xs text-white/45">{role.permissions.length} default permissions · {role.role_scope} scope</p></div><button disabled={busy} onClick={() => deleteRole(role.role_key)} className="rounded-full border border-red-400/30 px-4 py-2 text-xs text-red-200">Delete unused role</button></article>) : <p className="text-sm text-white/45">No custom roles yet. Built-in roles remain protected.</p>}</div>
    </section>
  )
}
