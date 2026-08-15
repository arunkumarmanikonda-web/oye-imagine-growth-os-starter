import { redirect } from 'next/navigation'
import { decidePermission } from '@/lib/auth/access-resolver'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { CONTACT_ENQUIRY_STATUSES, listPublicContactEnquiries } from '@/lib/public/contact-enquiries-admin'
import { assignEnquiryToSelf, setEnquiryStatus, unassignEnquiry } from './actions'

const INTERNAL_TENANT_ID = 'tenant_oye_internal'

function label(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function submittedAt(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value))
}

export default async function CommercialEnquiriesPage() {
  const identity = await requireWorkspaceIdentity({ lane: 'admin', redirectTo: '/admin/commercial/enquiries' })
  if (identity.membership.role_key !== 'platform_owner' && identity.membership.tenant_id !== INTERNAL_TENANT_ID) {
    redirect('/admin/commercial?error=internal_only')
  }

  const viewDecision = decidePermission({
    roleKey: identity.membership.role_key,
    membership: identity.membership,
    permissionSet: identity.permissionSet,
    permission: 'commercial.enquiry.view',
  })
  if (!viewDecision.allowed) redirect('/admin/commercial?error=permission')

  const manageDecision = decidePermission({
    roleKey: identity.membership.role_key,
    membership: identity.membership,
    permissionSet: identity.permissionSet,
    permission: 'commercial.enquiry.manage',
  })
  const enquiries = await listPublicContactEnquiries(150)
  const counts = CONTACT_ENQUIRY_STATUSES.reduce<Record<string, number>>((accumulator, status) => {
    accumulator[status] = enquiries.filter((enquiry) => enquiry.status === status).length
    return accumulator
  }, {})

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/30 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--oye-yellow)]">Oye commercial inbox</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Public enquiries</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">Every valid enquiry from the public Contact page lands here. Access is restricted to the Oye internal tenant and remains subject to explicit user-level permission overrides.</p>
            </div>
            <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/60">{enquiries.length} latest enquiries</div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CONTACT_ENQUIRY_STATUSES.map((status) => <div key={status} className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{label(status)}</p><p className="mt-2 text-3xl font-black">{counts[status] ?? 0}</p></div>)}
          </div>
        </header>

        {!enquiries.length ? <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center"><p className="text-2xl font-black">No enquiries yet.</p><p className="mt-3 text-sm text-white/55">The inbox is live. New valid submissions from the public Contact page will appear here.</p></section> : null}

        <section className="grid gap-5">
          {enquiries.map((enquiry) => (
            <article key={enquiry.enquiry_id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr_.8fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--oye-yellow)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">{label(enquiry.status)}</span><span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{label(enquiry.interest)}</span></div>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.035em]">{enquiry.full_name}</h2>
                  {enquiry.company_name ? <p className="mt-1 font-bold text-white/65">{enquiry.company_name}</p> : null}
                  <div className="mt-4 grid gap-1 text-sm text-white/65"><a className="hover:text-white" href={`mailto:${enquiry.email}`}>{enquiry.email}</a>{enquiry.phone ? <a className="hover:text-white" href={`tel:${enquiry.phone}`}>{enquiry.phone}</a> : null}<span>{submittedAt(enquiry.created_at)}</span><span>Language: {enquiry.preferred_language === 'hi' ? 'Hindi' : 'English'}</span></div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Customer brief</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/80">{enquiry.message}</p>{enquiry.source_path ? <p className="mt-4 text-xs text-white/35">Source: {enquiry.source_path}</p> : null}</div>

                <div className="grid content-start gap-3">
                  <div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Assignment</p><p className="mt-2 text-sm font-bold">{enquiry.assigned_user_id ? (enquiry.assigned_user_id === identity.subject ? 'Assigned to you' : 'Assigned') : 'Unassigned'}</p>{manageDecision.allowed ? <div className="mt-3 flex flex-wrap gap-2">{enquiry.assigned_user_id === identity.subject ? <form action={unassignEnquiry}><input type="hidden" name="enquiryId" value={enquiry.enquiry_id} /><button className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-black">Unassign</button></form> : <form action={assignEnquiryToSelf}><input type="hidden" name="enquiryId" value={enquiry.enquiry_id} /><button className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-black">Assign to me</button></form>}</div> : null}</div>

                  {manageDecision.allowed ? <form action={setEnquiryStatus} className="rounded-2xl border border-white/10 p-4"><input type="hidden" name="enquiryId" value={enquiry.enquiry_id} /><label className="grid gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Workflow status<select name="status" defaultValue={enquiry.status} className="rounded-xl border border-white/15 bg-neutral-900 px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-white">{CONTACT_ENQUIRY_STATUSES.map((status) => <option value={status} key={status}>{label(status)}</option>)}</select></label><button className="mt-3 w-full rounded-full bg-[var(--oye-pink)] px-4 py-2.5 text-xs font-black text-black">Update status</button></form> : <div className="rounded-2xl border border-white/10 p-4 text-xs leading-6 text-white/45">Your access allows viewing enquiries but not changing assignment or workflow status.</div>}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}