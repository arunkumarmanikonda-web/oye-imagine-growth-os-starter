import {answerConciergeQuery} from '@/lib/ai/concierge-retrieval'
import {buildDemoClientConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export default function HelpAssistPage(){
  const answer=answerConciergeQuery(buildDemoClientConciergeScope(),'contact support and tell me the next actions I should take','help_panel')
  return <div className="space-y-4 p-6">
    <h1 className="text-2xl font-semibold">Assist Panel</h1>
    <p className="text-sm text-neutral-600">Omnichannel help surface with guided answers, linked artifacts, and action shortcuts.</p>
    <div className="rounded-2xl border p-5"><div className="font-medium">{answer.narrative}</div><ul className="mt-3 list-disc space-y-2 pl-5">{answer.nextActions.map(x=><li key={x}>{x}</li>)}</ul></div>
  </div>
}