'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type Asset = {
  asset_id: string
  asset_kind: string
  title: string
  channel: string | null
  status: string
  signedUrl: string | null
  created_at: string
  mime_type: string | null
}
type Job = { generation_job_id: string; provider_key: string; model_key: string; status: string; external_job_id?: string | null }

const providers = [
  { value: 'openai_image', label: 'OpenAI Image', kind: 'image' },
  { value: 'fal', label: 'fal.ai Image', kind: 'image' },
  { value: 'openai_video', label: 'OpenAI Sora Video', kind: 'video' },
  { value: 'fal_video', label: 'fal.ai Video', kind: 'video' },
] as const

export default function CreativeLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [provider, setProvider] = useState<(typeof providers)[number]['value']>('openai_image')
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('instagram')
  const [kindFilter, setKindFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const kind = useMemo(() => providers.find((item) => item.value === provider)?.kind ?? 'image', [provider])

  const loadAssets = useCallback(async () => {
    const params = new URLSearchParams()
    if (kindFilter) params.set('kind', kindFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (query) params.set('q', query)
    const response = await fetch(`/api/admin/creative/assets?${params.toString()}`, { cache: 'no-store' })
    const payload = await response.json()
    if (payload.ok) setAssets(payload.assets || [])
    else setNotice(payload.error || 'Unable to load assets.')
  }, [kindFilter, statusFilter, query])

  useEffect(() => { void loadAssets() }, [loadAssets])

  async function generate(event: FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) return
    setBusy(true); setNotice('')
    try {
      const response = await fetch('/api/admin/creative/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider, kind, prompt: prompt.trim(), title: title.trim() || undefined,
          purpose: 'campaign_creative', channel,
          idempotencyKey: crypto.randomUUID(),
          seconds: kind === 'video' ? 4 : undefined,
          size: kind === 'video' ? '720x1280' : '1024x1024',
        }),
      })
      const payload = await response.json()
      if (!payload.ok) { setNotice(`${payload.code}: ${payload.error || 'Generation unavailable.'}`); return }
      if (payload.job) setJobs((current) => [payload.job, ...current.filter((job) => job.generation_job_id !== payload.job.generation_job_id)])
      setNotice(payload.asset ? 'Creative generated and stored in the private client library.' : 'Generation job started. Refresh the job until the provider completes it.')
      if (payload.asset) await loadAssets()
    } finally { setBusy(false) }
  }

  async function refreshJob(job: Job) {
    setBusy(true); setNotice('')
    try {
      const response = await fetch(`/api/admin/creative/jobs/${encodeURIComponent(job.generation_job_id)}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!payload.ok) { setNotice(`${payload.code}: ${payload.error || 'Unable to refresh job.'}`); return }
      if (payload.job) setJobs((current) => current.map((item) => item.generation_job_id === job.generation_job_id ? payload.job : item))
      if (payload.asset) { setNotice('Provider job completed and the asset is now in the private library.'); await loadAssets() }
    } finally { setBusy(false) }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-[#fffdf8]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#fdca5a]">Creative Asset Platform</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">Generate, govern and retain every client asset.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Generated media is stored in the signed-in tenant&apos;s private Supabase bucket with provider, model, job, hash, version and rights provenance. A configured provider is required; this screen never simulates a live generation.</p>
          </div>
          <a href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Operator home</a>
        </div>

        <section className="mt-9 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <form onSubmit={generate} className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6">
            <h2 className="text-xl font-black">New generation</h2>
            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value as any)} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3">
              {providers.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">Creative prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={7} className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3" placeholder="Describe the campaign asset, brand truth, product, composition and channel intent." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3" placeholder="Asset title" />
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3">
                {['instagram','facebook','linkedin','youtube','google_ads','whatsapp','website'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <button disabled={busy || !prompt.trim()} className="mt-5 w-full rounded-full border-2 border-black bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50">{busy ? 'Working…' : `Generate ${kind}`}</button>
            {notice ? <p className="mt-4 rounded-xl bg-[#f7adc8] p-4 text-sm font-bold text-black">{notice}</p> : null}
          </form>

          <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">Private content library</h2>
              <button onClick={() => void loadAssets()} className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Refresh</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3" placeholder="Search title" />
              <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3"><option value="">All types</option><option value="image">Images</option><option value="video">Videos</option></select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3"><option value="">All statuses</option>{['generated','review','approved','rejected','publishing_ready','archived'].map((item) => <option key={item}>{item}</option>)}</select>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => <article key={asset.asset_id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                {asset.signedUrl && asset.asset_kind === 'image' ? <img src={asset.signedUrl} alt={asset.title || ''} className="aspect-square w-full object-cover" /> : asset.signedUrl && asset.asset_kind === 'video' ? <video src={asset.signedUrl} controls className="aspect-[9/16] max-h-72 w-full bg-black object-contain" /> : <div className="grid aspect-square place-items-center text-white/40">No preview</div>}
                <div className="p-4"><p className="font-black">{asset.title}</p><p className="mt-2 text-xs text-white/55">{asset.asset_kind} · {asset.channel || 'general'} · {asset.status}</p></div>
              </article>)}
              {!assets.length ? <p className="text-sm text-white/50">No assets match the current filters.</p> : null}
            </div>
          </div>
        </section>

        {jobs.length ? <section className="mt-6 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><h2 className="text-xl font-black">Generation jobs</h2><div className="mt-4 grid gap-3">{jobs.map((job) => <div key={job.generation_job_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4"><div><p className="font-bold">{job.provider_key} · {job.model_key}</p><p className="text-xs text-white/50">{job.generation_job_id} · {job.status}</p></div>{job.status === 'running' || job.status === 'queued' ? <button disabled={busy} onClick={() => void refreshJob(job)} className="rounded-full bg-[#f7adc8] px-4 py-2 text-sm font-black text-black">Refresh provider</button> : null}</div>)}</div></section> : null}
      </div>
    </main>
  )
}
