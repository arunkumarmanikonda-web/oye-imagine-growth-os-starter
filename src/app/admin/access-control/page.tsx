import PremiumWorkspaceShell from '@/components/app/PremiumWorkspaceShell'
import { AccessControlConsole } from '@/components/admin/AccessControlConsole'
import { CustomRoleConsole } from '@/components/admin/CustomRoleConsole'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { decidePermission } from '@/lib/auth/access-resolver'
import { redirect } from 'next/navigation'

export default async function AccessControlPage() {
  const identity = await requireWorkspaceIdentity({ lane: 'admin', redirectTo: '/admin/access-control' })
  const decision = decidePermission({ roleKey: identity.membership.role_key, membership: identity.membership, permissionSet: identity.permissionSet, permission: 'platform.access' })
  if (!decision.allowed) redirect('/workspace?error=permission')

  return (
    <PremiumWorkspaceShell identity={identity}>
      <section className="rounded-[2.5rem] bg-[#111] p-6 text-white shadow-2xl md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#fdca5a]">Super Admin · Access OS</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Every person. Every role. Every permission.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/60">Create identities, build custom roles, assign default groups, suspend access, issue temporary credentials and override individual permissions at platform or workspace scope. All changes are auditable.</p>
        <div className="mt-9 space-y-7"><AccessControlConsole /><CustomRoleConsole /></div>
      </section>
    </PremiumWorkspaceShell>
  )
}
