import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoClientConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export default function ClientConciergePage(){
  const scope=buildDemoClientConciergeScope()
  const snapshot=buildConciergeWorkspaceSnapshot(scope,'client_dashboard')
  const answer=answerConciergeQuery(scope,'where is my overdue invoice, latest report, active agreement and next steps','client_dashboard')
  return <div className="space-y-6 p-6">
    <header><h1 className="text-2xl font-semibold">AI Concierge</h1><p className="text-sm text-neutral-600">Permission-aware retrieval for client finance, reports, agreements, support, and next actions.</p></header>
    <section className="grid gap-3 md:grid-cols-4">{[
      ['Visible artifacts',snapshot.totalResources],['Overdue invoices',snapshot.overdueInvoices],['Pending approvals',snapshot.pendingApprovals],['Support threads',snapshot.openSupportThreads],
    ].map(([l,v])=><div key={String(l)} className="rounded-xl border p-4"><div className="text-xs text-neutral-500">{l}</div><div className="text-2xl font-semibold">{v}</div></div>)}</section>
    <section className="rounded-2xl border p-5"><div className="text-xs uppercase tracking-wide text-neutral-500">Ask anything</div><h2 className="mt-1 text-lg font-medium">{answer.narrative}</h2><ul className="mt-4 space-y-3">{answer.results.map(r=><li key={r.id} className="rounded-xl border p-3"><div className="font-medium">{r.title}</div><div className="text-sm text-neutral-600">{r.summary}</div><a className="mt-2 inline-block text-sm underline" href={r.href}>{r.links[0]?.label ?? 'Open'}</a></li>)}</ul></section>
  </div>
}