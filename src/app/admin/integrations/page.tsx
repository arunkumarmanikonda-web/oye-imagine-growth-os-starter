'use client'

import { useEffect, useMemo, useState } from 'react'

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

type OauthCandidate = {
  resourceId: string
  label: string
  secondary?: string | null
}

type OauthSelection = {
  sessionId: string
  provider: 'meta' | 'linkedin'
  candidates: OauthCandidate[]
  expiresAt: string
}

export default function IntegrationsAdminPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [notice, setNotice] = useState('')
  const [discovery, setDiscovery] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [oauthSelection, setOauthSelection] = useState<OauthSelection | null>(null)
  const [selectedOauthResource, setSelectedOauthResource] = useState('')
  const [busy, setBusy] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [siteUrl, setSiteUrl] = useState('https://neejee.com/')
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    void fetch('/api/admin/integrations/targets', { cache: 'no-store' }).then(r => r.json()).then(j => {
      if (!j.ok) return
      setWorkspaces(j.workspaces || [])
      const neejee = (j.workspaces || []).find((w: any) => String(w.slug).includes('neejee') || String(w.brands?.name || '').toLowerCase() === 'neejee')
      setWorkspaceId((neejee || j.workspaces?.[0])?.id || '')
    })

    const params = new URLSearchParams(window.location.search)
    const google = params.get('google')
    const meta = params.get('meta')
    const linkedin = params.get('linkedin')
    const selectionId = params.get('oauthSelection')
    if (google === 'connected') setNotice('Google account connected. Run resource discovery to verify Ads, GA4, Search Console and YouTube access.')
    else if (google) setNotice(`Google connection result: ${google.replaceAll('_', ' ')}`)
    else if (meta && meta !== 'select_resource') setNotice(`Meta connection result: ${meta.replaceAll('_', ' ')}`)
    else if (linkedin && linkedin !== 'select_resource') setNotice(`LinkedIn connection result: ${linkedin.replaceAll('_', ' ')}`)
    if (selectionId) void loadOauthSelection(selectionId)
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

  async function loadOauthSelection(sessionId: string) {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/integrations/oauth-selection?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!body.ok) {
        setNotice(`${body.code || 'oauth_selection_failed'}: ${body.error || 'Provider resource selection is unavailable.'}`)
        return
      }
      const selection: OauthSelection = {
        sessionId: body.sessionId,
        provider: body.provider,
        candidates: body.candidates || [],
        expiresAt: body.expiresAt,
      }
      setOauthSelection(selection)
      setSelectedOauthResource(selection.candidates[0]?.resourceId || '')
      setNotice(`${selection.provider === 'meta' ? 'Meta' : 'LinkedIn'} consent received. Choose the exact provider resource to bind to this workspace.`)
    } finally {
      setBusy(false)
    }
  }

  async function chooseOauthResource() {
    if (!oauthSelection || !selectedOauthResource) return
    setBusy(true)
    try {
      const response = await fetch('/api/admin/integrations/oauth-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: oauthSelection.sessionId, resourceId: selectedOauthResource }),
      })
      const body = await response.json().catch(() => ({}))
      if (!body.ok) {
        setNotice(`${body.code || 'oauth_selection_failed'}: ${body.error || 'Provider resource could not be bound.'}`)
        return
      }
      const provider = oauthSelection.provider
      setOauthSelection(null)
      setSelectedOauthResource('')
      window.history.replaceState({}, '', '/admin/integrations')
      setNotice(`${provider === 'meta' ? 'Meta' : 'LinkedIn'} authority was re-verified at the provider and the selected resource is now encrypted and bound. Provider QA is still required before publish readiness.`)
      await loadSocialStatus()
    } finally {
      setBusy(false)
    }
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

  async function connectSocialOauth(provider: 'meta' | 'linkedin') {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/integrations/${provider}/start?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (body.ok && body.authorizationUrl) window.location.href = body.authorizationUrl
      else setNotice(`${body.code || `${provider}_oauth_start_failed`}: ${body.error || 'Managed OAuth is not configured for this provider.'}`)
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
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#fdca5a]">Integrations & provider activation</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Connect. Verify. Discover. Arm.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">Managed OAuth is the primary activation path. Provider consent is completed on the provider domain, exact resources are selected here, and secrets are encrypted server-side. A connection is not publish-ready until provider QA passes.</p></div><div className="flex flex-wrap gap-2"><a href="/admin/autonomy" className="rounded-full border border-[#fdca5a]/60 px-4 py-2 text-sm font-bold text-[#fdca5a]">Autonomy cockpit</a><a href="/admin/config" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Provider vault</a><a href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Operator home</a></div></div>

    <section className="mt-8 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><label className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Operational workspace</label><select value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} className="ml-3 rounded-xl border border-white/15 bg-black px-4 py-3">{workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.brands?.name || workspace.name} · {workspace.tenants?.display_name || workspace.tenants?.slug}</option>)}</select><p className="mt-3 text-xs text-white/45">Selected: {selected?.name || 'none'} · {workspaceId || 'no workspace'}</p></section>

    {notice ? <p className="mt-5 rounded-xl bg-[#f7adc8] p-4 font-bold text-black" role="status">{notice}</p> : null}

    {oauthSelection ? <section className="mt-6 rounded-[2rem] border border-[#fdca5a]/50 bg-[#fdca5a]/10 p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#fdca5a]">Provider resource selection</p><h2 className="mt-2 text-2xl font-black">Choose the exact {oauthSelection.provider === 'meta' ? 'Meta Page' : 'LinkedIn organisation'}</h2><p className="mt-2 text-sm text-white/60">This short-lived session expires {new Date(oauthSelection.expiresAt).toLocaleString()}. Oye re-verifies provider authority before persisting the selected resource.</p><div className="mt-4 flex flex-wrap gap-3"><select className={`${input} min-w-[280px]`} value={selectedOauthResource} onChange={event => setSelectedOauthResource(event.target.value)}>{oauthSelection.candidates.map(candidate => <option key={candidate.resourceId} value={candidate.resourceId}>{candidate.label}{candidate.secondary ? ` · ${candidate.secondary}` : ''}</option>)}</select><button disabled={busy || !selectedOauthResource} onClick={() => void chooseOauthResource()} className="rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Verify & bind selected resource</button></div></section> : null}

    <section className="mt-6 grid gap-6 xl:grid-cols-3">
      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Google</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${discovery?.googleAds?.ok || discovery?.youtube?.ok ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{discovery?.googleAds?.ok || discovery?.youtube?.ok ? 'verified' : 'not discovered'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">One offline OAuth grant covers Google Ads, GA4, Search Console and YouTube. Unattended use depends on a refresh token, exact scopes and provider-side discovery.</p><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || !workspaceId} onClick={() => void connectGoogle()} className="rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Connect Google</button><button disabled={busy || !workspaceId} onClick={() => void discoverGoogle()} className="rounded-full bg-[#f7adc8] px-5 py-3 font-black text-black disabled:opacity-50">Discover resources</button></div>{discovery ? <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-xs text-white/65">{JSON.stringify({ googleAds: discovery.googleAds?.data, ga4: discovery.ga4?.data, searchConsole: discovery.searchConsole?.data, youtube: discovery.youtube?.data, youtubeChannel: discovery.youtubeChannel }, null, 2)}</pre> : null}</article>

      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Meta</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${metaAccount ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{metaAccount ? 'account verified' : 'not connected'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">Use delegated consent. Oye discovers Pages available to the signed-in administrator, shows the exact Page before binding, and verifies the linked Instagram professional account where present.</p><button disabled={busy || !workspaceId} onClick={() => void connectSocialOauth('meta')} className="mt-5 rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Connect Meta</button>{metaAccount ? <p className="mt-4 text-xs leading-5 text-emerald-200">{metaAccount.account_name || metaAccount.external_account_id} · verified {metaAccount.last_verified_at ? new Date(metaAccount.last_verified_at).toLocaleString() : 'provider-side'}{metaAccount.metadata?.instagramUserId ? ` · Instagram ${metaAccount.metadata.instagramUserId}` : ''}</p> : null}</article>

      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">LinkedIn</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${linkedinAccount ? 'bg-emerald-300 text-black' : 'bg-white/10 text-white/60'}`}>{linkedinAccount ? 'account verified' : 'not connected'}</span></div><p className="mt-3 text-sm leading-6 text-white/55">Use delegated consent. Oye discovers organisations where the authenticated member has approved administrator authority and re-checks that authority before the organisation is persisted.</p><button disabled={busy || !workspaceId} onClick={() => void connectSocialOauth('linkedin')} className="mt-5 rounded-full bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">Connect LinkedIn</button>{linkedinAccount ? <p className="mt-4 text-xs leading-5 text-emerald-200">{linkedinAccount.account_name || linkedinAccount.external_account_id} · verified {linkedinAccount.last_verified_at ? new Date(linkedinAccount.last_verified_at).toLocaleString() : 'provider-side'}</p> : null}</article>
    </section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2"><article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><h2 className="text-xl font-black">Source sync</h2><p className="mt-3 text-sm leading-6 text-white/55">After Google resource discovery, select the exact customer/property/site identifiers. Data is normalized into the growth data plane with lineage.</p><div className="mt-4 grid gap-3"><div className="grid grid-cols-2 gap-3"><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className={input}/><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className={input}/></div><input value={customerId} onChange={event => setCustomerId(event.target.value)} className={input} placeholder="Google Ads customer ID"/><button disabled={busy || !customerId} onClick={() => void sync('google_ads')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync Google Ads</button><input value={propertyId} onChange={event => setPropertyId(event.target.value)} className={input} placeholder="GA4 property ID"/><button disabled={busy || !propertyId} onClick={() => void sync('ga4')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync GA4</button><input value={siteUrl} onChange={event => setSiteUrl(event.target.value)} className={input} placeholder="Search Console property URL"/><button disabled={busy || !siteUrl} onClick={() => void sync('gsc')} className="rounded-full border border-white/20 px-4 py-2 font-bold disabled:opacity-50">Sync Search Console</button></div></article>

      <article className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Freshness & optimization evidence</h2><div className="flex gap-2"><button onClick={() => void loadHealth()} className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Refresh freshness</button><button onClick={() => void recommend()} className="rounded-full bg-[#fdca5a] px-4 py-2 text-sm font-black text-black">Generate guarded recommendation</button></div></div>{health ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{health.sources.map((source: any) => <div key={source.provider} className="rounded-xl border border-white/10 bg-black/30 p-4"><p className="font-black">{source.provider}</p><p className="mt-1 text-sm text-white/60">{source.state}</p><p className="mt-2 text-xs text-white/40">{source.freshnessAt || 'No authoritative sync yet'}</p></div>)}</div> : <p className="mt-4 text-sm text-white/45">Load freshness to distinguish no data, stale data and provider errors.</p>}<div className="mt-5 rounded-2xl border border-[#f7adc8]/30 bg-[#f7adc8]/10 p-4 text-sm leading-6 text-white/70"><strong>Activation order:</strong> delegated provider consent → exact resource selection → provider authority verification → automated provider QA → channel readiness → reconciled media funding → bounded pilot → kill-switch release.</div></article></section>
  </section></main>
}
