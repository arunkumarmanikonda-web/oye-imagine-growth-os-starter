'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type Workspace = {
  id: string
  name: string
  slug: string
  tenant_id: string
  brands?: { name?: string }
  tenants?: { slug?: string; display_name?: string }
}

type SocialAccount = {
  id: string
  provider: string
  external_account_id: string
  account_name?: string | null
  status: string
  scopes?: string[]
  metadata?: Record<string, any>
  last_verified_at?: string | null
}

export default function IntegrationsAdminPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [notice, setNotice] = useState('')
  const [discovery, setDiscovery] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [busy, setBusy] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [siteUrl, setSiteUrl] = useState('https://neejee.com/')
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))

  const [metaToken, setMetaToken] = useState('')
  const [metaApiVersion, setMetaApiVersion] = useState('')
  const [metaPageId, setMetaPageId] = useState('')
  const [metaInstagramId, setMetaInstagramId] = useState('')
  const [metaScopes, setMetaScopes] = useState('pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish')

  const [linkedinToken, setLinkedinToken] = useState('')
  const [linkedinApiVersion, setLinkedinApiVersion] = useState('')
  const [linkedinOrganizationUrn, setLinkedinOrganizationUrn] = useState('')
  const [linkedinMemberUrn, setLinkedinMemberUrn] = useState('')
  const [linkedinScopes, setLinkedinScopes] = useState('w_organization_social, r_organization_admin')

  useEffect(() => {
    void fetch('/api/admin/integrations/targets', { cache: 'no-store' }).then(r => r.json()).then(j => {
      if (!j.ok) return
      setWorkspaces(j.workspaces || [])
      const neejee = (j.workspaces || []).find((w: any) => String(w.slug).includes('neejee') || String(w.brands?.name || '').toLowerCase() === 'neejee')
      setWorkspaceId((neejee || j.workspaces?.[0])?.id || '')
    })
    const params = new URLSearchParams(window.location.search)
    const google = params.get('google')
    if (google === 'connected') setNotice('Google account connected. Run resource discovery to verify Ads, GA4, Search Console and YouTube access.')
    else if (google) setNotice(`Google connection result: ${google.replaceAll('_', ' ')}`)
  }, [])

  useEffect(() => {
    if (!workspaceId) return
    void loadSocialStatus(workspaceId)
  }, [workspaceId])

  const selected = useMemo(() => workspaces.find(w => w.id === workspaceId), [workspaces, workspaceId])
  const metaAccount = socialAccounts.find(account => account.provider === 'meta')
  const linkedinAccount = socialAccounts.find(account => account.provider === 'linkedin')

  async function loadSocialStatus(targetWorkspaceId = workspaceId) {
    if (!targetWorkspaceId) return
    const response = await fetch(`/api/admin/integrations/social?workspaceId=${encodeURIComponent(targetWorkspaceId)}`, { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (body.ok) setSocialAccounts(body.accounts || [])
  }

  async function connectGoogle() {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/integrations/google/start?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (body.ok && body.authorizationUrl) window.location.href = body.authorizationUrl
      else setNotice(`${body.code || 'google_oauth_start_failed'}: ${body.error || 'Google OAuth is not configured.'}`)
    } finally {
      setBusy(false)
    }
  }

  async function discoverGoogle() {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/integrations/google/discover?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (body.ok) {
        setDiscovery(body)
        setNotice('Google resources discovered. Provider truth is shown below; select the exact account/property/site before syncing or arming autonomy.')
      } else setNotice(`${body.code || 'google_discovery_failed'}: ${body.error || 'Discovery failed.'}`)
    } finally {
      setBusy(false)
    }
  }

  async function connectSocial(event: FormEvent, provider: 'meta' | 'linkedin') {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = provider === 'meta'
        ? {
            provider,
            workspaceId,
            accessToken: metaToken,
            apiVersion: metaApiVersion,
            facebookPageId: metaPageId,
            instagramUserId: metaInstagramId || null,
            scopes: metaScopes.split(',').map(value => value.trim()).filter(Boolean),
          }
        : {
            provider,
            workspaceId,
            accessToken: linkedinToken,
            apiVersion: linkedinApiVersion,
            organizationUrn: linkedinOrganizationUrn,
            memberUrn: linkedinMemberUrn,
            scopes: linkedinScopes.split(',').map(value => value.trim()).filter(Boolean),
          }
      const response = await fetch('/api/admin/integrations/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (provider === 'meta') setMetaToken('')
      else setLinkedinToken('')
      if (body.ok) {
        setNotice(`${provider === 'meta' ? 'Meta' : 'LinkedIn'} account authority verified and encrypted for this workspace. Run a real provider QA test before marking the channel publish-ready.`)
        await loadSocialStatus()
      } else setNotice(`${body.code || 'social_connection_failed'}: ${body.error || 'Provider verification failed.'}`)
    } finally {
      setBusy(false)
    }
  }

  async function sync(provider: string) {
    setBusy(true)
    try {
      const payload: any = { workspaceId, provider, startDate, endDate }
      if (provider === 'google_ads') payload.customerId = customerId
      if (provider === 'ga4') payload.propertyId = propertyId
      if (provider === 'gsc') payload.siteUrl = siteUrl
      const response = await fetch('/api/admin/integrations/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const body = await response.json().catch(() => ({}))
      setNotice(body.ok ? `${provider} sync completed: ${body.rowsWritten} row(s) normalized.` : `${body.code || 'sync_failed'}: ${body.error || 'Sync failed.'}`)
      if (body.ok) await loadHealth()
    } finally {
      setBusy(false)
    }
  }

  async function loadHealth() {
    const response = await fetch(`/api/admin/integrations/health?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (body.ok) setHealth(body)
  }

  async function recommend() {
    setBusy(true)
    try {
      const response = await fetch('/api/admin/integrations/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, startDate, endDate }) })
      const body = await response.json().catch(() => ({}))
      setNotice(body.ok ? `${body.recommendation} No provider mutation was performed.` : `${body.code || 'recommendation_failed'}: recommendation failed.`)
    } finally {
      setBusy(false)
    }
  }

  const input = 'rounded-xl border border-white/15 bg-black p-3 text-sm outline-none focus:border-[#fdca5a]'

  return <main className="min-h-screen bg-[#111] px-6 py-10 text-[#fffdf8]"><section className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#fdca5a]">Integrations & provider activation</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Connect. Verify. Discover. Arm.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">Provider capability stays separate from a tenant-specific connection. OAuth and access tokens are encrypted server-side; this UI never reads a persisted secret back. Do not paste provider secrets into chat, email or client-facing forms.</p></div><div className="flex flex-wrap gap-2"><a href="/admin/autonomy" className="rounded-full border border-[#fdca5a]/60 px-4 py-2 text-sm font-bold text-[#fdca5a]">Autonomy cockpit</a><a href="/admin/config" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Provider vault</a><a href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Operator home</a></div></div>

    <section className="mt-8 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><label className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Operational workspace</label><select value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} className="ml-3 rounded-xl border border-white/15 bg-black px-4 py-3">{workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.brands?.name || workspace.name} · {workspace.tenants?.display_name || workspace.tenants?.slug}</option>)}</select><p className="mt-3 text-xs text-white/45">Selected: {selected?.name || 'none'} · {workspaceId || 'no workspace'}</p></section>

    {notice ? <p className="mt-5 rounded-xl bg-[#f7adc8] p-4 font-bold text-black" role="status">{notice}</p> : null}

    <section className="mt-6 grid gap-6 xl:grid-cols-3">
      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Google</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${discovery?.googleAds?.ok || discovery?.youtube?.ok ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{discovery?.googleAds?.ok || discovery?.youtube?.ok ? 'verified' : 'not discovered'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">One offline OAuth grant covers Google Ads, GA4, Search Console and YouTube. Unattended use depends on a refresh token, exact scopes and provider-side discovery.</p><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || !workspaceId} onClick={() => void connectGoogle()} className="rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Connect Google</button><button disabled={busy || !workspaceId} onClick={() => void discoverGoogle()} className="rounded-full bg-[#f7adc8] px-5 py-3 font-black text-black disabled:opacity-50">Discover resources</button></div>{discovery ? <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-xs text-white/65">{JSON.stringify({ googleAds: discovery.googleAds?.data, ga4: discovery.ga4?.data, searchConsole: discovery.searchConsole?.data, youtube: discovery.youtube?.data, youtubeChannel: discovery.youtubeChannel }, null, 2)}</pre> : null}</article>

      <form onSubmit={event => void connectSocial(event, 'meta')} autoComplete="off" className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Meta</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${metaAccount ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{metaAccount ? 'account verified' : 'not connected'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">Connect a Page-scoped token. Oye verifies the Page identity and linked Instagram professional account before encrypting the credential for this workspace.</p><div className="mt-4 grid gap-3"><input className={input} value={metaApiVersion} onChange={event => setMetaApiVersion(event.target.value)} placeholder="Graph API version, e.g. vXX.X" required/><input className={input} value={metaPageId} onChange={event => setMetaPageId(event.target.value)} placeholder="Facebook Page ID" inputMode="numeric" required/><input className={input} value={metaInstagramId} onChange={event => setMetaInstagramId(event.target.value)} placeholder="Instagram professional account ID (optional)" inputMode="numeric"/><input className={input} type="password" value={metaToken} onChange={event => setMetaToken(event.target.value)} placeholder="Page access token" autoComplete="new-password" required/><input className={input} value={metaScopes} onChange={event => setMetaScopes(event.target.value)} placeholder="Granted scopes, comma separated"/><button disabled={busy || !workspaceId || !metaToken} className="rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Verify & encrypt Meta account</button></div>{metaAccount ? <p className="mt-4 text-xs leading-5 text-emerald-200">{metaAccount.account_name || metaAccount.external_account_id} · verified {metaAccount.last_verified_at ? new Date(metaAccount.last_verified_at).toLocaleString() : 'provider-side'}{metaAccount.metadata?.instagramUserId ? ` · Instagram ${metaAccount.metadata.instagramUserId}` : ''}</p> : null}</form>

      <form onSubmit={event => void connectSocial(event, 'linkedin')} autoComplete="off" className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">LinkedIn</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${linkedinAccount ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{linkedinAccount ? 'account verified' : 'not connected'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">Connect a member-authorized token for an organisation. Oye verifies `ORGANIC_SHARE_CREATE` authority before storing the token.</p><div className="mt-4 grid gap-3"><input className={input} value={linkedinApiVersion} onChange={event => setLinkedinApiVersion(event.target.value)} placeholder="Supported LinkedIn API version, YYYYMM" inputMode="numeric" required/><input className={input} value={linkedinOrganizationUrn} onChange={event => setLinkedinOrganizationUrn(event.target.value)} placeholder="urn:li:organization:123456" required/><input className={input} value={linkedinMemberUrn} onChange={event => setLinkedinMemberUrn(event.target.value)} placeholder="urn:li:person:..." required/><input className={input} type="password" value={linkedinToken} onChange={event => setLinkedinToken(event.target.value)} placeholder="Member OAuth access token" autoComplete="new-password" required/><input className={input} value={linkedinScopes} onChange={event => setLinkedinScopes(event.target.value)} placeholder="Granted scopes, comma separated"/><button disabled={busy || !workspaceId || !linkedinToken} className="rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Verify & encrypt LinkedIn account</button></div>{linkedinAccount ? <p className="mt-4 text-xs leading-5 text-emerald-200">{linkedinAccount.account_name || linkedinAccount.external_account_id} · verified {linkedinAccount.last_verified_at ? new Date(linkedinAccount.last_verified_at).toLocaleString() : 'provider-side'}</p> : null}</form>
    </section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2"><article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><h2 className="text-xl font-black">Source sync</h2><p className="mt-3 text-sm leading-6 text-white/55">After Google resource discovery, select the exact customer/property/site identifiers. Data is normalized into the growth data plane with lineage.</p><div className="mt-4 grid gap-3"><div className="grid grid-cols-2 gap-3"><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className={input}/><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className={input}/></div><input value={customerId} onChange={event => setCustomerId(event.target.value)} className={input} placeholder="Google Ads customer ID"/><button disabled={busy || !customerId} onClick={() => void sync('google_ads')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync Google Ads</button><input value={propertyId} onChange={event => setPropertyId(event.target.value)} className={input} placeholder="GA4 property ID"/><button disabled={busy || !propertyId} onClick={() => void sync('ga4')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync GA4</button><input value={siteUrl} onChange={event => setSiteUrl(event.target.value)} className={input} placeholder="Search Console property URL"/><button disabled={busy || !siteUrl} onClick={() => void sync('gsc')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync Search Console</button></div></article>

      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Freshness & optimization evidence</h2><div className="flex gap-2"><button onClick={() => void loadHealth()} className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Refresh freshness</button><button onClick={() => void recommend()} className="rounded-full bg-[#fdca5a] px-4 py-2 text-sm font-black text-black">Generate guarded recommendation</button></div></div>{health ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{health.sources.map((source: any) => <div key={source.provider} className="rounded-xl border border-white/10 bg-black/30 p-4"><p className="font-black">{source.provider}</p><p className="mt-1 text-sm text-white/60">{source.state}</p><p className="mt-2 text-xs text-white/40">{source.freshnessAt || 'No authoritative sync yet'}</p></div>)}</div> : <p className="mt-4 text-sm text-white/45">Load freshness to distinguish no data, stale data and provider errors.</p>}<div className="mt-5 rounded-2xl border border-[#f7adc8]/30 bg-[#f7adc8]/10 p-4 text-sm leading-6 text-white/70"><strong>Activation order:</strong> connect provider → discover/verify authority → run real provider QA → record channel readiness in the autonomy cockpit → fund the prepaid media wallet through reconciled commercial/payment evidence → release the kill switch.</div></article></section>
  </section></main>
}
