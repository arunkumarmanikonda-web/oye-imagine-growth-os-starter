import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { executeModelGateway } from '@/lib/ai/model-gateway'
import { retrieveBrandKnowledge, resolveKnowledgeTarget } from '@/lib/ai/brand-memory'

export type AgentPolicyPatch = {
  autonomyLevel?: number
  enabled?: boolean
  killSwitch?: boolean
  allowedToolClasses?: string[]
  maxRunCostUsd?: number
  maxToolCalls?: number
}

function id(prefix: string) { return `${prefix}_${crypto.randomUUID()}` }

async function policyFor(tenantId: string, workspaceId: string, agentKey: string) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('agent_autonomy_policies').select('*').eq('tenant_id', tenantId).eq('workspace_id', workspaceId).eq('agent_key', agentKey).maybeSingle()
  if (error) throw new Error(`agent_policy_read_failed:${error.message}`)
  return data || { tenant_id: tenantId, workspace_id: workspaceId, agent_key: agentKey, autonomy_level: 0, enabled: true, kill_switch: false, allowed_tool_classes: ['read'], max_run_cost_usd: 0.1, max_tool_calls: 2, requires_human_approval_for: ['draft_write','publish','external_mutation','spend','payment','message'] }
}

function allows(policy: any, toolClass: string) {
  return Array.isArray(policy.allowed_tool_classes) && policy.allowed_tool_classes.includes(toolClass)
}

async function toolCall(input: { runId: string; tenantId: string; workspaceId: string; toolKey: string; toolClass: string; inputSummary?: unknown; action: () => Promise<any> }) {
  const admin = createSupabaseAdminClient(); const toolCallId = crypto.randomUUID()
  await admin.from('agent_tool_calls').insert({ tool_call_id: toolCallId, run_id: input.runId, tenant_id: input.tenantId, workspace_id: input.workspaceId, tool_key: input.toolKey, tool_class: input.toolClass, input_summary: input.inputSummary || {}, status: 'started' })
  try {
    const output = await input.action()
    await admin.from('agent_tool_calls').update({ status: 'succeeded', output_summary: typeof output === 'object' ? output : { result: String(output) }, completed_at: new Date().toISOString() }).eq('tool_call_id', toolCallId)
    return output
  } catch (error) {
    await admin.from('agent_tool_calls').update({ status: 'failed', output_summary: { error: error instanceof Error ? error.message.slice(0,160) : 'tool_failed' }, completed_at: new Date().toISOString() }).eq('tool_call_id', toolCallId)
    throw error
  }
}

async function evaluateRun(input: { runId: string; tenantId: string; workspaceId: string; output: string; citations: any[] }) {
  const admin = createSupabaseAdminClient()
  const lower = input.output.toLowerCase()
  const citationMarkers = input.citations.map((_: any, index: number) => `[s${index + 1}]`)
  const cited = citationMarkers.filter((marker: string) => lower.includes(marker)).length
  const citationCoverage = input.citations.length ? Math.min(1, cited / Math.min(input.citations.length, 4)) : 0
  const forbidden = ['soc 2 certified','iso 27001 certified','fully autonomous','all integrations are live','automatic ad spend']
  const claimFindings = forbidden.filter((term) => lower.includes(term))
  const groundedness = input.citations.length > 0 ? Math.max(0.25, citationCoverage) : 0
  const toolSafety = 1
  const score = Number(((groundedness + citationCoverage + (claimFindings.length ? 0 : 1) + toolSafety) / 4).toFixed(4))
  const passed = score >= 0.72 && claimFindings.length === 0 && input.citations.length > 0
  const findings = [
    ...(input.citations.length ? [] : ['No knowledge citations were retrieved.']),
    ...(citationCoverage < 0.5 ? ['Citation coverage is below the review threshold.'] : []),
    ...claimFindings.map((term) => `Prohibited/unsupported capability claim detected: ${term}`),
  ]
  await admin.from('ai_evaluation_runs').insert({ tenant_id: input.tenantId, workspace_id: input.workspaceId, run_id: input.runId, evaluation_type: 'combined', score, passed, findings, evaluator: 'deterministic-agent-gate-v1' })
  return { score, passed, findings, citationCoverage, groundedness }
}

export async function runBrandStrategist(input: { access: ApiAccessContext; workspaceId?: string; objective: string; preferredProvider?: 'openai'|'anthropic' }) {
  const target = await resolveKnowledgeTarget(input.access, input.workspaceId)
  const policy = await policyFor(target.tenantId, target.workspaceId, 'brand-strategist')
  const admin = createSupabaseAdminClient(); const runId = crypto.randomUUID(); const now = new Date().toISOString()
  if (!policy.enabled || policy.kill_switch) {
    await admin.from('agent_runs').insert({ run_id: runId, tenant_id: target.tenantId, brand_id: target.brandId, workspace_id: target.workspaceId, agent_key: 'brand-strategist', autonomy_level: Number(policy.autonomy_level || 0), objective: input.objective, status: 'blocked', input_payload: {}, safe_error_code: policy.kill_switch ? 'agent_kill_switch_active' : 'agent_disabled', created_by: input.access.email || input.access.subject, completed_at: now })
    throw new Error(policy.kill_switch ? 'agent_kill_switch_active' : 'agent_disabled')
  }
  if (!allows(policy, 'read') || !allows(policy, 'draft_write')) throw new Error('agent_policy_tool_denied')
  const maxTools = Number(policy.max_tool_calls || 2); if (maxTools < 2) throw new Error('agent_tool_budget_insufficient')
  await admin.from('agent_runs').insert({ run_id: runId, tenant_id: target.tenantId, brand_id: target.brandId, workspace_id: target.workspaceId, agent_key: 'brand-strategist', autonomy_level: Number(policy.autonomy_level || 0), objective: input.objective, status: 'running', input_payload: { objective: input.objective }, approval_required: true, approval_status: 'pending', created_by: input.access.email || input.access.subject, started_at: now })
  try {
    const retrieval = await toolCall({ runId, tenantId: target.tenantId, workspaceId: target.workspaceId, toolKey: 'brand_knowledge.retrieve', toolClass: 'read', inputSummary: { objective: input.objective }, action: () => retrieveBrandKnowledge({ access: input.access, workspaceId: target.workspaceId, query: input.objective, limit: 8 }) })
    if (!retrieval.citations.length) throw new Error('agent_grounding_required')
    const sources = retrieval.citations.map((citation: any, index: number) => `[S${index + 1}] ${citation.sourceTitle} (${citation.version}, ${citation.freshness})\n${citation.content}`).join('\n\n')
    const prompt = `You are the bounded Oye !magine Brand Strategist agent. Produce a concise evidence-grounded strategy draft for the objective below.\n\nOBJECTIVE:\n${input.objective}\n\nSOURCE EVIDENCE:\n${sources}\n\nRULES:\n- Use only the supplied evidence for factual brand/business claims.\n- Cite material claims with [S1], [S2], etc.\n- Do not claim certifications, live integrations, autonomous spend, measured outcomes, or external execution unless those facts are explicitly in the evidence.\n- Return a decision-ready draft with sections: Situation, Audience, Positioning, Priorities, Channel Hypotheses, Measurement, Risks, Next Human Decisions.\n- This is a DRAFT requiring human approval.`
    const model = await executeModelGateway({ tenantId: target.tenantId, workspaceId: target.workspaceId, taskType: 'brand_strategy_agent', prompt, preferredProvider: input.preferredProvider, maxCostUsd: Number(policy.max_run_cost_usd || 0.25), monthlyCostCapUsd: 100, maxOutputTokens: 1800 })
    const evaluation = await evaluateRun({ runId, tenantId: target.tenantId, workspaceId: target.workspaceId, output: model.content, citations: retrieval.citations })
    const artifactId = id('strategy')
    const artifact = await toolCall({ runId, tenantId: target.tenantId, workspaceId: target.workspaceId, toolKey: 'strategy_artifact.write_draft', toolClass: 'draft_write', inputSummary: { evaluation: evaluation.score }, action: async () => {
      const { data, error } = await admin.from('strategy_artifacts').insert({ artifact_id: artifactId, tenant_id: target.tenantId, brand_id: target.brandId, workspace_id: target.workspaceId, artifact_type: 'strategy_deck', title: `AI strategy draft — ${input.objective.slice(0,90)}`, status: 'draft', version: 1, summary: { objective: input.objective, evaluation, citations: retrieval.citations.map((c: any, i: number) => ({ marker: `S${i+1}`, sourceId: c.sourceId, sourceTitle: c.sourceTitle, sourceUri: c.sourceUri, freshness: c.freshness })) }, sections: [{ key: 'draft', content: model.content }], generated_by: `brand-strategist:${model.provider}:${model.model || 'unknown'}`, metadata: { runId, approvalRequired: true } }).select('*').single()
      if (error) throw new Error(`strategy_artifact_write_failed:${error.message}`); return data
    } })
    const status = evaluation.passed ? 'needs_review' : 'needs_review'
    await admin.from('agent_runs').update({ status, model_provider: model.provider, model_key: model.model || null, output_payload: { artifactId, draft: model.content, evaluation }, citation_refs: retrieval.citations.map((c: any, i: number) => ({ marker:`S${i+1}`,sourceId:c.sourceId,chunkId:c.chunkId,uri:c.sourceUri })), tool_call_count: 2, estimated_cost_usd: model.estimatedCostUsd, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('run_id', runId)
    return { runId, artifact, draft: model.content, citations: retrieval.citations, evaluation, approvalRequired: true }
  } catch (error) {
    await admin.from('agent_runs').update({ status: 'failed', safe_error_code: error instanceof Error ? error.message.split(':')[0] : 'agent_failed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('run_id', runId)
    throw error
  }
}

export async function getAgentPolicies(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveKnowledgeTarget(access, workspaceId); const admin = createSupabaseAdminClient(); const { data, error } = await admin.from('agent_autonomy_policies').select('*').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).order('agent_key'); if (error) throw new Error(`agent_policy_read_failed:${error.message}`); return { target, policies: data || [] }
}

export async function updateAgentPolicy(input: { access: ApiAccessContext; workspaceId?: string; agentKey: string; patch: AgentPolicyPatch }) {
  const target = await resolveKnowledgeTarget(input.access, input.workspaceId); const admin = createSupabaseAdminClient(); const autonomyLevel = input.patch.autonomyLevel == null ? undefined : Math.min(Math.max(Math.trunc(input.patch.autonomyLevel),0),4)
  const patch: any = { updated_at: new Date().toISOString() }
  if (autonomyLevel != null) patch.autonomy_level = autonomyLevel
  if (input.patch.enabled != null) patch.enabled = input.patch.enabled
  if (input.patch.killSwitch != null) patch.kill_switch = input.patch.killSwitch
  if (Array.isArray(input.patch.allowedToolClasses)) patch.allowed_tool_classes = input.patch.allowedToolClasses
  if (input.patch.maxRunCostUsd != null) patch.max_run_cost_usd = Math.max(0,input.patch.maxRunCostUsd)
  if (input.patch.maxToolCalls != null) patch.max_tool_calls = Math.min(Math.max(Math.trunc(input.patch.maxToolCalls),0),100)
  const { data, error } = await admin.from('agent_autonomy_policies').upsert({ tenant_id: target.tenantId, workspace_id: target.workspaceId, agent_key: input.agentKey, ...patch }, { onConflict: 'tenant_id,workspace_id,agent_key' }).select('*').single(); if (error) throw new Error(`agent_policy_write_failed:${error.message}`); return { target, policy: data }
}
