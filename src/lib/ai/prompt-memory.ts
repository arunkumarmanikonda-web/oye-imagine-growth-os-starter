import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { encryptSecret } from '@/lib/config-control/crypto';
import { resolveEvolutionTarget } from './evolution-store';
import type { EvolutionReuseScope } from './evolution-types';

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function memoryKey() {
  const key = process.env.AI_MEMORY_ENCRYPTION_KEY;
  if (!key || key.length < 32) throw new Error('ai_memory_encryption_key_unavailable');
  return key;
}

export async function recordPromptLineage(input: {
  access: ApiAccessContext;
  workspaceId?: string;
  eventId?: string | null;
  taskKey: string;
  prompt: string;
  response?: string | null;
  templateKey?: string | null;
  templateVersion?: string | null;
  provider?: string | null;
  model?: string | null;
  inputContextFingerprint?: string | null;
  outputArtifactType?: string | null;
  outputArtifactId?: string | null;
  language?: 'en' | 'hi' | 'hinglish' | 'other';
  reuseScope?: EvolutionReuseScope;
  containsPersonalData?: boolean;
  containsClientSecrets?: boolean;
}) {
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error('prompt_memory_prompt_required');
  const taskKey = input.taskKey.trim();
  if (!taskKey) throw new Error('prompt_memory_task_key_required');
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const createdAt = new Date().toISOString();
  const promptHash = sha(prompt);
  const promptRunId = `prompt_${sha(`${target.tenantId}|${target.workspaceId}|${taskKey}|${promptHash}|${createdAt}`).slice(0, 24)}`;
  const containsPersonalData = Boolean(input.containsPersonalData);
  const containsClientSecrets = Boolean(input.containsClientSecrets);
  const requestedReuse = input.reuseScope ?? 'tenant_private';
  const reuseScope = containsPersonalData || containsClientSecrets ? 'tenant_private' : requestedReuse;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('ai_prompt_runs').insert({
    prompt_run_id: promptRunId,
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    brand_id: target.brandId,
    event_id: input.eventId ?? null,
    task_key: taskKey,
    template_key: input.templateKey?.trim() || null,
    template_version: input.templateVersion?.trim() || null,
    provider: input.provider?.trim() || null,
    model: input.model?.trim() || null,
    prompt_ciphertext: encryptSecret(memoryKey(), prompt),
    prompt_sha256: promptHash,
    response_sha256: input.response ? sha(input.response) : null,
    input_context_fingerprint: input.inputContextFingerprint?.trim() || null,
    output_artifact_type: input.outputArtifactType?.trim() || null,
    output_artifact_id: input.outputArtifactId?.trim() || null,
    language: input.language ?? 'en',
    reuse_scope: reuseScope,
    contains_personal_data: containsPersonalData,
    contains_client_secrets: containsClientSecrets,
  });
  if (error) throw new Error(`prompt_memory_write_failed:${error.message}`);

  return {
    promptRunId,
    promptHash,
    reuseScope,
    encrypted: true,
  };
}
