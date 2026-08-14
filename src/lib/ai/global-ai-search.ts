import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { detectOyeConversationLanguage } from './bilingual-conversation';
import { resolveEvolutionTarget } from './evolution-store';

export type GlobalSearchDomain =
  | 'cms'
  | 'configuration'
  | 'brand_knowledge'
  | 'integrations'
  | 'strategy'
  | 'creative'
  | 'campaigns'
  | 'social'
  | 'seo'
  | 'analytics'
  | 'commercial'
  | 'marketplace'
  | 'support';

export type GlobalSearchIntent = 'find' | 'navigate' | 'explain' | 'create' | 'change' | 'research';

export type GlobalSearchPlan = {
  query: string;
  language: 'en' | 'hi' | 'hinglish';
  intent: GlobalSearchIntent;
  domains: GlobalSearchDomain[];
  requiresResearch: boolean;
  requiresMutationApproval: boolean;
};

const DOMAIN_HINTS: Array<{ domain: GlobalSearchDomain; terms: string[] }> = [
  { domain: 'cms', terms: ['page', 'copy', 'image', 'banner', 'cms', 'website', 'homepage', 'text', 'line'] },
  { domain: 'configuration', terms: ['setting', 'config', 'option', 'permission', 'role', 'dashboard'] },
  { domain: 'brand_knowledge', terms: ['brand', 'story', 'voice', 'guideline', 'product', 'audience'] },
  { domain: 'integrations', terms: ['google', 'meta', 'instagram', 'facebook', 'whatsapp', 'api', 'connect'] },
  { domain: 'strategy', terms: ['strategy', 'plan', 'positioning', 'market', 'competitor'] },
  { domain: 'creative', terms: ['creative', 'video', 'reel', 'design', 'visual', 'ad copy'] },
  { domain: 'campaigns', terms: ['campaign', 'boost', 'keyword', 'bid', 'budget', 'ads'] },
  { domain: 'social', terms: ['post', 'social', 'instagram', 'facebook', 'linkedin', 'reel', 'story'] },
  { domain: 'seo', terms: ['seo', 'sem', 'aeo', 'geo', 'search', 'ranking', 'keyword'] },
  { domain: 'analytics', terms: ['report', 'analytics', 'conversion', 'roas', 'cpa', 'ctr', 'revenue'] },
  { domain: 'commercial', terms: ['kyc', 'contract', 'agreement', 'invoice', 'payment', 'subscription', 'gst'] },
  { domain: 'marketplace', terms: ['partner', 'specialist', 'marketplace', 'designer', 'freelancer'] },
  { domain: 'support', terms: ['help', 'support', 'problem', 'issue', 'how do i', 'kaise', 'madad'] },
];

function words(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]+/g, ' ').split(/\s+/).filter(Boolean);
}

export function planGlobalAiSearch(query: string): GlobalSearchPlan {
  const trimmed = query.trim();
  if (!trimmed) throw new Error('global_search_query_required');
  const tokens = words(trimmed);
  const normalized = tokens.join(' ');

  const domains = DOMAIN_HINTS
    .filter(({ terms }) => terms.some((term) => normalized.includes(term)))
    .map(({ domain }) => domain);

  const uniqueDomains = [...new Set(domains)];
  if (!uniqueDomains.length) uniqueDomains.push('brand_knowledge', 'support');

  const mutationWords = ['change', 'update', 'create', 'publish', 'launch', 'boost', 'send', 'karo', 'banao', 'badlo'];
  const researchWords = ['best', 'today', 'latest', 'research', 'competitor', 'market', 'trend', 'right', 'sahi', 'aaj'];
  const explainWords = ['why', 'what', 'how', 'explain', 'kyun', 'kya', 'kaise'];

  const requiresMutationApproval = mutationWords.some((term) => normalized.includes(term));
  const requiresResearch = researchWords.some((term) => normalized.includes(term));

  let intent: GlobalSearchIntent = 'find';
  if (requiresMutationApproval) intent = 'change';
  else if (requiresResearch) intent = 'research';
  else if (explainWords.some((term) => normalized.includes(term))) intent = 'explain';
  else if (normalized.includes('go to') || normalized.includes('open') || normalized.includes('dikhao')) intent = 'navigate';

  return {
    query: trimmed,
    language: detectOyeConversationLanguage(trimmed),
    intent,
    domains: uniqueDomains,
    requiresResearch,
    requiresMutationApproval,
  };
}

export async function searchOyeControlPlane(input: {
  access: ApiAccessContext;
  query: string;
  workspaceId?: string;
  limit?: number;
}) {
  const plan = planGlobalAiSearch(input.query);
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const admin = createSupabaseAdminClient();
  const limit = Math.min(Math.max(input.limit ?? 12, 1), 40);

  const { data, error } = await admin
    .from('ai_global_search_documents')
    .select('document_id,domain,title,summary,deep_link,action_key,keywords,metadata,scope_type,tenant_id,workspace_id,updated_at')
    .in('domain', plan.domains)
    .or(
      `and(scope_type.eq.workspace,tenant_id.eq.${target.tenantId},workspace_id.eq.${target.workspaceId}),and(scope_type.eq.tenant,tenant_id.eq.${target.tenantId}),scope_type.eq.platform_public`,
    )
    .textSearch('search_text', input.query, { type: 'websearch', config: 'simple' })
    .limit(limit);

  if (error) throw new Error(`global_search_failed:${error.message}`);

  return {
    plan,
    target,
    results: data ?? [],
    guidance: plan.requiresResearch
      ? 'Research should be completed and cited before a recommendation or mutation is executed.'
      : 'Results are permission-scoped to the signed-in user and active workspace.',
  };
}
