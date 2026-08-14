import PremiumWorkspaceShell from '@/components/app/PremiumWorkspaceShell'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireWorkspaceIdentity({ lane: 'admin', redirectTo: '/workspace' })
  return <PremiumWorkspaceShell identity={identity}>{children}</PremiumWorkspaceShell>
}
