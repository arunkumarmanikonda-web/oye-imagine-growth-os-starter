import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function applyGuardedDeliveryCallback(input: {
  providerMessageId: string
  providerStatus: string
  metadata?: Record<string, unknown>
}) {
  const providerMessageId = input.providerMessageId.trim()
  const providerStatus = input.providerStatus.trim()
  if (!providerMessageId) throw new Error('provider_message_id_required')
  if (!providerStatus) throw new Error('provider_status_required')

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc('apply_lifecycle_delivery_callback_guarded', {
    p_provider_message_id: providerMessageId,
    p_provider_status: providerStatus,
    p_metadata: input.metadata || {},
  })

  if (error) {
    const message = error.message || ''
    if (message.includes('provider_status_invalid')) throw new Error('provider_status_invalid')
    if (message.includes('provider_message_id_required')) throw new Error('provider_message_id_required')
    throw new Error('lifecycle_callback_write_failed')
  }

  return data as { applied?: boolean; job?: Record<string, unknown> | null } | null
}
