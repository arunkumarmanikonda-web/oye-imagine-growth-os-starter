import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoMarketplaceConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export default function MarketplaceAiPage(){
  const scope=buildDemoMarketplaceConciergeScope()
  const snapshot=buildConciergeWorkspaceSnapshot(scope,'marketplace_surface')
  const answer=answerConciergeQuery(scope,'service lanes, specialist availability, proposal status, request status and approved deliverables','marketplace_surface')
  return <div className="space-y-6 p-6">
    <header><h1 className="text-2xl font-semibold">Marketplace AI Concierge</h1><p className="text-sm text-neutral-600">Native marketplace help surface for requests, proposals, deliverables, and specialist matching.</p></header>
    <section className="grid gap-3 md:grid-cols-4">{[
      ['Visible artifacts',snapshot.totalResources],['Open requests',snapshot.openMarketplaceRequests],['Pending approvals',snapshot.pendingApprovals],['Permission scoped','Yes'],
    ].map(([l,v])=><div key={String(l)} className="rounded-xl border p-4"><div className="text-xs text-neutral-500">{l}</div><div className="text-2xl font-semibold">{v}</div></div>)}</section>
    <section className="rounded-2xl border p-5"><h2 className="text-lg font-medium">{answer.narrative}</h2><ul className="mt-4 space-y-3">{answer.results.map(r=><li key={r.id} className="rounded-xl border p-3"><div className="font-medium">{r.title}</div><div className="text-sm text-neutral-600">{r.summary}</div><a className="mt-2 inline-block text-sm underline" href={r.href}>{r.links[0]?.label ?? 'Open'}</a></li>)}</ul></section>
  </div>
}