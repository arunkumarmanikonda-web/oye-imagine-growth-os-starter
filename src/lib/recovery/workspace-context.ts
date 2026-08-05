import type {
  RecoveryAuthSession,
  RecoveryWorkspaceContext,
  RecoveryWorkspaceOption,
} from './auth-types'
import { getNeejeeCanonicalProfile } from './neejee-canonical'

const oyeImagineControlWorkspace: RecoveryWorkspaceOption = {
  workspaceId: 'workspace_oye_control',
  tenantId: 'tenant_oye_imagine',
  brandId: 'brand_oye_imagine',
  label: 'Oye !magine Control',
  description: 'Primary operator workspace for platform recovery, config and commercial control.',
}

export function listRecoveryWorkspaceOptions(): RecoveryWorkspaceOption[] {
  const neejee = getNeejeeCanonicalProfile()

  return [
    oyeImagineControlWorkspace,
    {
      workspaceId: neejee.workspaceId,
      tenantId: neejee.tenantId,
      brandId: neejee.brandId,
      label: `${neejee.brandName} Canonical Pilot`,
      description: `${neejee.industry} · ${neejee.verificationStatus}`,
    },
  ]
}

export function resolveRecoveryWorkspaceContext(
  session: RecoveryAuthSession,
  selectedWorkspaceId?: string | null
): RecoveryWorkspaceContext {
  const options = listRecoveryWorkspaceOptions()
  const explicit = selectedWorkspaceId
    ? options.find((option) => option.workspaceId === selectedWorkspaceId)
    : null

  const active = explicit ?? options[0]

  return {
    workspaceId: active.workspaceId,
    tenantId: active.tenantId,
    brandId: active.brandId,
    label: active.label,
    description: active.description,
    source: explicit ? 'explicit_selection' : 'default_canonical',
    actorEmail: session.email,
    sessionRole: session.role,
  }
}

export function recoveryWorkspaceUsesCanonicalSelection(
  context: RecoveryWorkspaceContext,
): boolean {
  return context.source === 'default_canonical' || context.source === 'explicit_selection';
}
