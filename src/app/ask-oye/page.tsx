import PremiumWorkspaceShell from '@/components/app/PremiumWorkspaceShell'
import { AskOyeConsole } from '@/components/app/AskOyeConsole'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { decidePermission } from '@/lib/auth/access-resolver'
import { redirect } from 'next/navigation'

export default async function AskOyePage() {
  const identity = await requireWorkspaceIdentity({ redirectTo: '/ask-oye' })
  const decision = decidePermission({
    roleKey: identity.membership.role_key,
    membership: identity.membership,
    permissionSet: identity.permissionSet,
    permission: 'ai.search',
  })
  if (!decision.allowed) redirect('/workspace?error=permission')

  return (
    <PremiumWorkspaceShell identity={identity}>
      <AskOyeConsole />
    </PremiumWorkspaceShell>
  )
}