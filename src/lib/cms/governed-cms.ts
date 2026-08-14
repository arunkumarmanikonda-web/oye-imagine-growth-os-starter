import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type EvidenceState = 'code_capability'|'configured'|'connected'|'read_verified'|'sandbox_executed'|'production_executed'
const rank: Record<EvidenceState, number> = { code_capability:0, configured:1, connected:2, read_verified:3, sandbox_executed:4, production_executed:5 }

type PageInput = { slug:string; title:string; audience:string; pageType:string; layoutKey:string; seo?:Record<string,unknown>; visibilityRules?:Record<string,unknown>; data?:Record<string,unknown> }

function flattenText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(flattenText).join(' ')
  if (value && typeof value === 'object') return Object.values(value as Record<string,unknown>).map(flattenText).join(' ')
  return ''
}

export async function validateClaims(payload: unknown) {
  const admin=createSupabaseAdminClient()
  const {data,error}=await admin.from('cms_claims_register').select('*')
  if(error) throw new Error(`cms_claims_read_failed:${error.message}`)
  const text=flattenText(payload).toLowerCase()
  const blockers=(data??[]).filter((claim:any)=>{
    const pattern=String(claim.claim_pattern||'').toLowerCase().trim()
    if(!pattern||!text.includes(pattern)) return false
    const current=rank[claim.current_state as EvidenceState]??0
    const minimum=rank[claim.minimum_state as EvidenceState]??5
    return current<minimum || (claim.approval_required && !claim.approved_at)
  }).map((claim:any)=>({ claimKey:claim.claim_key, capability:claim.capability, currentState:claim.current_state, minimumState:claim.minimum_state, approvalRequired:claim.approval_required, approvedAt:claim.approved_at }))
  return {ok:blockers.length===0,blockers}
}

export async function listPages() {
  const admin=createSupabaseAdminClient(); const {data,error}=await admin.from('cms_pages').select('*').order('updated_at',{ascending:false}); if(error) throw new Error(`cms_pages_read_failed:${error.message}`); return data??[]
}

export async function getPublishedPage(slug:string) {
  const admin=createSupabaseAdminClient(); const {data,error}=await admin.from('cms_pages').select('*').eq('slug',slug).eq('status','published').maybeSingle(); if(error) throw new Error(`cms_page_read_failed:${error.message}`); return data
}

export async function saveDraft(input:PageInput, actor:string) {
  const admin=createSupabaseAdminClient(); const payload={slug:input.slug,title:input.title,audience:input.audience,page_type:input.pageType,status:'draft',layout_key:input.layoutKey,seo:input.seo??{},visibility_rules:input.visibilityRules??{},data:input.data??{},updated_at:new Date().toISOString()};
  const {data,error}=await admin.from('cms_pages').upsert(payload,{onConflict:'slug'}).select('*').single(); if(error) throw new Error(`cms_draft_save_failed:${error.message}`)
  await admin.from('cms_audit_events').insert({entity_type:'page',entity_slug:input.slug,action:'draft_saved',actor,details:{title:input.title}})
  return data
}

export async function setPageStatus(slug:string,status:'draft'|'review'|'approved',actor:string) {
  const admin=createSupabaseAdminClient(); const {data,error}=await admin.from('cms_pages').update({status,updated_at:new Date().toISOString()}).eq('slug',slug).select('*').single(); if(error) throw new Error(`cms_status_failed:${error.message}`)
  await admin.from('cms_audit_events').insert({entity_type:'page',entity_slug:slug,action:`status_${status}`,actor,details:{}}); return data
}

export async function publishPage(slug:string,actor:string) {
  const admin=createSupabaseAdminClient(); const {data:page,error}=await admin.from('cms_pages').select('*').eq('slug',slug).maybeSingle(); if(error||!page) throw new Error('cms_page_not_found')
  if(page.status!=='approved') throw new Error('cms_page_not_approved')
  const claims=await validateClaims({title:page.title,seo:page.seo,data:page.data}); if(!claims.ok) return {ok:false,code:'claims_blocked',blockers:claims.blockers}
  const {count}=await admin.from('cms_publish_versions').select('*',{count:'exact',head:true}).eq('entity_type','page').eq('entity_slug',slug)
  const version=`v${Number(count||0)+1}`; const publishedAt=new Date().toISOString(); const payload={...page,status:'published',published_at:publishedAt}
  const {error:versionError}=await admin.from('cms_publish_versions').insert({entity_type:'page',entity_slug:slug,version_label:version,payload,published_by:actor,published_at:publishedAt}); if(versionError) throw new Error(`cms_version_failed:${versionError.message}`)
  const {data,error:updateError}=await admin.from('cms_pages').update({status:'published',published_at:publishedAt,updated_at:publishedAt}).eq('slug',slug).select('*').single(); if(updateError) throw new Error(`cms_publish_failed:${updateError.message}`)
  await admin.from('cms_audit_events').insert({entity_type:'page',entity_slug:slug,action:'published',actor,details:{version}})
  return {ok:true,page:data,version}
}

export async function rollbackPage(slug:string,versionLabel:string,actor:string) {
  const admin=createSupabaseAdminClient(); const {data:version,error}=await admin.from('cms_publish_versions').select('payload,version_label').eq('entity_type','page').eq('entity_slug',slug).eq('version_label',versionLabel).maybeSingle(); if(error||!version?.payload) throw new Error('cms_version_not_found')
  const prior=version.payload as any; const now=new Date().toISOString(); const {count}=await admin.from('cms_publish_versions').select('*',{count:'exact',head:true}).eq('entity_type','page').eq('entity_slug',slug); const newVersion=`v${Number(count||0)+1}`
  const restored={...prior,status:'published',published_at:now,updated_at:now}
  await admin.from('cms_publish_versions').insert({entity_type:'page',entity_slug:slug,version_label:newVersion,payload:restored,published_by:actor,published_at:now})
  const {data,error:updateError}=await admin.from('cms_pages').upsert(restored,{onConflict:'slug'}).select('*').single(); if(updateError) throw new Error(`cms_rollback_failed:${updateError.message}`)
  await admin.from('cms_audit_events').insert({entity_type:'page',entity_slug:slug,action:'rollback_published',actor,details:{from:versionLabel,to:newVersion}})
  return {ok:true,page:data,version:newVersion}
}

export async function listVersions(slug:string) { const admin=createSupabaseAdminClient(); const {data,error}=await admin.from('cms_publish_versions').select('version_label,published_by,published_at,payload').eq('entity_type','page').eq('entity_slug',slug).order('published_at',{ascending:false}); if(error) throw new Error(`cms_versions_failed:${error.message}`); return data??[] }
