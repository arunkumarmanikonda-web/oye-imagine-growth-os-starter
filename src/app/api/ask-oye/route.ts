import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireAskOyeAccess, AskOyeAccessError } from '@/lib/ai/ask-oye-access'
import { askOyeIsHighImpact, askOyeNeedsResearch, searchAskOye } from '@/lib/ai/ask-oye-search'
import { synthesizeAskOye } from '@/lib/ai/ask-oye-answer'
import { clientCapabilityEnvelope } from '@/lib/client/provider-abstraction'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAskOyeAccess()
    const body = await request.json()
    const query = typeof body.message === 'string' ? body.message.trim().slice(0, 800) : ''
    if (!query) return NextResponse.json({ ok: false, code: 'message_required' }, { status: 400 })

    const search = await searchAskOye({ query, membership: access.membership, permissionSet: access.permissionSet })
    const researchRequired = askOyeNeedsResearch(query)
    const highImpact = askOyeIsHighImpact(query)
    const answer = await synthesizeAskOye({ query, language: search.language, results: search.results, researchRequired, highImpact })

    const eventId = `ask_${crypto.randomUUID().replaceAll('-', '')}`
    const admin = createSupabaseAdminClient()
    await admin.from('ai_evolution_events').insert({
      event_id: eventId,
      tenant_id: access.membership.tenant_id,
      brand_id: access.membership.brand_id,
      workspace_id: access.membership.workspace_id,
      activity_type: 'ai_search',
      source_entity_type: 'ask_oye',
      source_entity_id: eventId,
      channel: 'in_product',
      language: search.language,
      intent: highImpact ? 'high_impact_command' : researchRequired ? 'research_question' : 'navigation_or_question',
      input_fingerprint: hash(query),
      output_fingerprint: hash(answer.text),
      metadata: {
        resultCount: search.results.length,
        resultDomains: Array.from(new Set(search.results.map((result) => result.domain))),
        researchRequired,
        highImpact,
        answerMode: 'provider_abstracted_or_safe_fallback',
      },
      reuse_scope: 'tenant_private',
      sensitivity: 'internal',
      contains_personal_data: false,
      contains_client_secrets: false,
      risk_class: highImpact ? 'high' : researchRequired ? 'medium' : 'low',
      actor_user_id: access.subject,
    })

    return NextResponse.json({
      ok: true,
      eventId,
      response: clientCapabilityEnvelope({
        capability: 'Ask Oye',
        status: highImpact ? 'awaiting_approval' : 'generating',
        result: {
          answer: answer.text,
          language: answer.language,
          researchRequired: answer.researchRequired,
          highImpact: answer.highImpact,
          executionState: answer.executionState,
          results: search.results,
        },
      }),
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    if (error instanceof AskOyeAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
    return NextResponse.json({ ok: false, code: 'ask_oye_unavailable' }, { status: 500 })
  }
}
