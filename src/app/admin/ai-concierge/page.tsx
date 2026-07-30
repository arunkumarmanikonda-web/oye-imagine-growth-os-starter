import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoAdminConciergeScope,buildDemoClientConciergeScope,buildDemoMarketplaceConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export default function AdminAiConciergePage(){
  const admin=buildDemoAdminConciergeScope(), client=buildDemoClientConciergeScope(), market=buildDemoMarketplaceConciergeScope()
  const clientDenied=answerConciergeQuery(client,'margin health and secret config','help_panel')
  const adminVisible=answerConciergeQuery(admin,'margin health and secret config','help_panel')
  const marketSnap=buildConciergeWorkspaceSnapshot(market,'marketplace_surface')
  return <div className="space-y-6 p-6">
    <header><h1 className="text-2xl font-semibold">Admin AI Concierge Oversight</h1><p className="text-sm text-neutral-600">Audit permission-aware retrieval across client, marketplace, and internal help surfaces.</p></header>
    <section className="grid gap-3 md:grid-cols-3">{[
      ['Client denied results',clientDenied.deniedCount],['Admin visible results',adminVisible.resultCount],['Marketplace visible artifacts',marketSnap.totalResources],
    ].map(([l,v])=><div key={String(l)} className="rounded-xl border p-4"><div className="text-xs text-neutral-500">{l}</div><div className="text-2xl font-semibold">{v}</div></div>)}</section>
    <section className="rounded-2xl border p-5"><div className="font-medium">Permission guard proof</div><p className="mt-2 text-sm text-neutral-600">Client query for internal finance/config returns {clientDenied.resultCount} visible results with {clientDenied.deniedCount} denied matches. Admin sees {adminVisible.resultCount} internal/admin items.</p></section>
  </div>
}