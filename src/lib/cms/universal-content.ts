import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { resolveEvolutionTarget } from '@/lib/ai/evolution-store';

export type CmsContentType = 'text' | 'rich_text' | 'image' | 'video' | 'link' | 'cta' | 'json';
export type CmsLocale = 'en-IN' | 'hi-IN';
export type CmsScopeType = 'platform' | 'tenant' | 'workspace';

function digest(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export function cmsNodeId(input: {
  scopeType: CmsScopeType;
  tenantId?: string | null;
  workspaceId?: string | null;
  routeKey: string;
  surfaceKey: string;
  slotKey: string;
  locale: CmsLocale;
}) {
  return `cms_${digest([
    input.scopeType,
    input.tenantId ?? '',
    input.workspaceId ?? '',
    input.routeKey,
    input.surfaceKey,
    input.slotKey,
    input.locale,
  ].join('|'))}`;
}

export async function upsertWorkspaceContentNode(input: {
  access: ApiAccessContext;
  workspaceId?: string;
  routeKey: string;
  surfaceKey: string;
  slotKey: string;
  contentType: CmsContentType;
  locale: CmsLocale;
  contentValue: Record<string, unknown>;
  assetRef?: string | null;
  altText?: string | null;
  changeSource?: 'human' | 'ai' | 'import' | 'rollback' | 'system';
  changeReason?: string | null;
  promptRunId?: string | null;
  publish?: boolean;
}) {
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const routeKey = input.routeKey.trim();
  const surfaceKey = input.surfaceKey.trim();
  const slotKey = input.slotKey.trim();
  if (!routeKey || !surfaceKey || !slotKey) throw new Error('cms_content_address_required');

  const nodeId = cmsNodeId({
    scopeType: 'workspace',
    tenantId: target.tenantId,
    workspaceId: target.workspaceId,
    routeKey,
    surfaceKey,
    slotKey,
    locale: input.locale,
  });
  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin
    .from('cms_content_nodes')
    .select('node_id,version')
    .eq('node_id', nodeId)
    .maybeSingle();
  if (readError) throw new Error(`cms_content_read_failed:${readError.message}`);

  const version = Number(existing?.version ?? 0) + 1;
  const status = input.publish ? 'published' : 'draft';
  const timestamp = new Date().toISOString();
  const { data: node, error: writeError } = await admin
    .from('cms_content_nodes')
    .upsert({
      node_id: nodeId,
      scope_type: 'workspace',
      tenant_id: target.tenantId,
      workspace_id: target.workspaceId,
      route_key: routeKey,
      surface_key: surfaceKey,
      slot_key: slotKey,
      content_type: input.contentType,
      locale: input.locale,
      content_value: input.contentValue,
      asset_ref: input.assetRef?.trim() || null,
      alt_text: input.altText?.trim() || null,
      status,
      version,
      published_at: input.publish ? timestamp : null,
      updated_by: input.access.subject,
    }, { onConflict: 'node_id' })
    .select('*')
    .single();
  if (writeError) throw new Error(`cms_content_write_failed:${writeError.message}`);

  const { error: versionError } = await admin.from('cms_content_versions').insert({
    node_id: nodeId,
    version,
    content_value: input.contentValue,
    asset_ref: input.assetRef?.trim() || null,
    alt_text: input.altText?.trim() || null,
    change_source: input.changeSource ?? 'human',
    change_reason: input.changeReason?.trim() || null,
    actor_user_id: input.access.subject,
    ai_prompt_run_id: input.promptRunId ?? null,
  });
  if (versionError) throw new Error(`cms_content_version_write_failed:${versionError.message}`);

  return node;
}

export async function listWorkspaceContentNodes(input: {
  access: ApiAccessContext;
  workspaceId?: string;
  routeKey?: string;
  locale?: CmsLocale;
  publishedOnly?: boolean;
}) {
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const admin = createSupabaseAdminClient();
  let query = admin
    .from('cms_content_nodes')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', target.workspaceId)
    .order('route_key', { ascending: true })
    .order('surface_key', { ascending: true })
    .order('slot_key', { ascending: true });
  if (input.routeKey?.trim()) query = query.eq('route_key', input.routeKey.trim());
  if (input.locale) query = query.eq('locale', input.locale);
  if (input.publishedOnly) query = query.eq('status', 'published');
  const { data, error } = await query;
  if (error) throw new Error(`cms_content_list_failed:${error.message}`);
  return data ?? [];
}
