import {CONCIERGE_RESOURCE_KINDS,type ConciergeAnswer,type ConciergeResource,type ConciergeScope,type ConciergeSearchMatch,type ConciergeSurface,type ConciergeWorkspaceSnapshot} from './concierge-retrieval-types'
import {conciergeResources} from './concierge-retrieval-registry'

const norm=(v:string)=>(v||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim()
const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','can','do','does','for','from','has','have',
  'how','i','in','is','it','me','my','of','on','or','our','should','tell','that','the',
  'their','this','to','was','we','what','where','which','who','why','with','you','your'
])
const tokens=(v:string)=>norm(v).split(' ').filter(Boolean).filter(token=>!STOPWORDS.has(token))
const txt=(r:ConciergeResource)=>norm([r.title,r.summary,r.tags.join(' '),r.keywords.join(' '),r.status??''].join(' '))
const has=(s:ConciergeScope,p:string)=>s.permissions.includes(p)

export function canAccessConciergeResource(scope:ConciergeScope,r:ConciergeResource):boolean{
  if(r.tenantId && r.tenantId!=='global' && r.tenantId!==scope.tenantId) return false
  if(r.workspaceId && scope.workspaceId && r.workspaceId!==scope.workspaceId) return false
  if(r.brandId && scope.brandId && r.brandId!==scope.brandId) return false
  if(!r.audiences.includes(scope.audience) && scope.audience!=='admin') return false
  if(r.visibility==='admin') return scope.audience==='admin' && has(scope,'view_admin_financials')
  if(r.visibility==='internal') return scope.audience==='admin' && has(scope,'view_internal_notes')
  if(r.visibility==='client') return scope.audience==='client' || scope.audience==='admin'
  if(r.visibility==='marketplace_client') return scope.audience==='marketplace_client' || scope.audience==='admin'
  return true
}

function score(r:ConciergeResource,q:string){
  const raw=norm(q)
  const t=tokens(q)
  const h=txt(r)
  if(!raw.length)return 1
  if(!t.length)return 0
  let s=0
  for(const x of t){
    if(norm(r.title).includes(x))s+=6
    if(r.keywords.some(k=>norm(k).includes(x)))s+=4
    if(r.tags.some(k=>norm(k).includes(x)))s+=3
    if(h.includes(x))s+=1
  }
  return s
}
function intent(q:string){const x=norm(q);if(x.includes('invoice')||x.includes('ledger')||x.includes('balance'))return'finance';if(x.includes('agreement')||x.includes('scope')||x.includes('term'))return'agreements';if(x.includes('report')||x.includes('performance')||x.includes('campaign'))return'reporting';if(x.includes('support')||x.includes('help'))return'support';if(x.includes('marketplace')||x.includes('proposal')||x.includes('specialist')||x.includes('request'))return'marketplace';if(x.includes('onboarding')||x.includes('next'))return'next_actions';return'general'}
function action(kind:ConciergeResource['kind']){if(kind==='invoice')return'open_invoice';if(kind==='report'||kind==='performance_summary'||kind==='campaign_status')return'open_report';if(kind==='agreement')return'open_agreement';if(kind==='signed_document'||kind==='approved_deliverable')return'open_document';if(kind==='support_message'||kind==='help_article')return'open_support';if(kind==='marketplace_request'||kind==='proposal')return'open_marketplace';return'open_settings'}

export function searchConciergeResources(scope:ConciergeScope,query:string,surface?:ConciergeSurface):{matches:ConciergeSearchMatch[];deniedCount:number}{
  const pool=conciergeResources.filter(r=>!surface||r.surfaces.includes(surface)).filter(r=>score(r,query)>0)
  const visible=pool.filter(r=>canAccessConciergeResource(scope,r)).map(r=>({resource:r,score:score(r,query),matchedTerms:tokens(query).filter(t=>txt(r).includes(t))})).sort((a,b)=>b.score-a.score||a.resource.title.localeCompare(b.resource.title))
  return{matches:visible,deniedCount:pool.length-visible.length}
}

export function getAccessibleConciergeResources(scope:ConciergeScope,surface?:ConciergeSurface){return conciergeResources.filter(r=>(!surface||r.surfaces.includes(surface))&&canAccessConciergeResource(scope,r))}
export function buildConciergeWorkspaceSnapshot(scope:ConciergeScope,surface?:ConciergeSurface):ConciergeWorkspaceSnapshot{
  const byKind=Object.fromEntries(CONCIERGE_RESOURCE_KINDS.map(k=>[k,0])) as ConciergeWorkspaceSnapshot['byKind']
  const rows=getAccessibleConciergeResources(scope,surface)
  for(const r of rows) byKind[r.kind]+=1
  return{totalResources:rows.length,overdueInvoices:rows.filter(r=>r.kind==='invoice'&&r.overdue).length,pendingApprovals:rows.reduce((n,r)=>n+Number(r.meta?.pendingApprovals??0),0),openSupportThreads:rows.filter(r=>r.kind==='support_message').length,openMarketplaceRequests:rows.filter(r=>r.kind==='marketplace_request').length,byKind}
}
function nextActions(rows:ConciergeResource[]){const out:string[]=[];if(rows.some(r=>r.overdue))out.push('Open the overdue invoice and clear the purchase order release blocker.');if(rows.some(r=>Number(r.meta?.pendingApprovals??0)>0))out.push('Review the pending approval items surfaced in the matching workspace.');if(rows.some(r=>r.kind==='support_message'))out.push('Reply to the open support thread with the requested confirmation.');if(rows.some(r=>r.kind==='onboarding_state'))out.push('Complete the remaining onboarding approval step.');return out.slice(0,3)}
export function answerConciergeQuery(scope:ConciergeScope,query:string,surface?:ConciergeSurface):ConciergeAnswer{
  const {matches,deniedCount}=searchConciergeResources(scope,query,surface)
  const results=matches.slice(0,5).map(x=>x.resource)
  const first=results[0]
  const narrative=!results.length?'No in-scope results were found for this query.':(first?.kind==='invoice'&&first.meta?.overdueReason?`Found ${results.length} in-scope result(s). The primary finance issue is ${first.title}, and it is overdue because ${String(first.meta.overdueReason)}.`:`Found ${results.length} in-scope result(s): ${results.map(r=>r.title).join('; ')}.`)
  const citations=results.map(r=>({label:r.title,href:r.href,kind:r.kind}))
  const shortcuts=results.flatMap(r=>r.links.slice(0,1).map(l=>({label:l.label,href:l.href,action:action(r.kind)}))).slice(0,5)
  return{query,intent:intent(query),narrative,permissionScoped:true,resultCount:results.length,deniedCount,results,citations,shortcuts,nextActions:nextActions(results)}
}