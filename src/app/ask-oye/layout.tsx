import { redirect } from 'next/navigation'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'

export default async function AskOyeLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireWorkspaceIdentity({ redirectTo: '/ask-oye' })
  const activationState = identity.membership.metadata?.activationState
  if (typeof activationState === 'string' && activationState !== 'active') redirect('/onboarding/activation')
  return children
}