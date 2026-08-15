'use server'

import { revalidatePath } from 'next/cache'
import { decidePermission } from '@/lib/auth/access-resolver'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import {
  CONTACT_ENQUIRY_STATUSES,
  type ContactEnquiryStatus,
  updatePublicContactEnquiry,
} from '@/lib/public/contact-enquiries-admin'

const INTERNAL_TENANT_ID = 'tenant_oye_internal'

async function requireEnquiryManager() {
  const identity = await requireWorkspaceIdentity({ lane: 'admin', redirectTo: '/admin/commercial/enquiries' })
  if (identity.membership.role_key !== 'platform_owner' && identity.membership.tenant_id !== INTERNAL_TENANT_ID) {
    throw new Error('commercial_enquiry_internal_only')
  }
  const decision = decidePermission({
    roleKey: identity.membership.role_key,
    membership: identity.membership,
    permissionSet: identity.permissionSet,
    permission: 'commercial.enquiry.manage',
  })
  if (!decision.allowed) throw new Error('commercial_enquiry_manage_denied')
  return identity
}

function enquiryId(formData: FormData) {
  return String(formData.get('enquiryId') ?? '').trim().slice(0, 180)
}

export async function setEnquiryStatus(formData: FormData) {
  await requireEnquiryManager()
  const id = enquiryId(formData)
  const status = String(formData.get('status') ?? '') as ContactEnquiryStatus
  if (!id || !CONTACT_ENQUIRY_STATUSES.includes(status)) throw new Error('invalid_enquiry_update')
  await updatePublicContactEnquiry({ enquiryId: id, status })
  revalidatePath('/admin/commercial/enquiries')
}

export async function assignEnquiryToSelf(formData: FormData) {
  const identity = await requireEnquiryManager()
  const id = enquiryId(formData)
  if (!id) throw new Error('invalid_enquiry_update')
  await updatePublicContactEnquiry({ enquiryId: id, assignedUserId: identity.subject })
  revalidatePath('/admin/commercial/enquiries')
}

export async function unassignEnquiry(formData: FormData) {
  await requireEnquiryManager()
  const id = enquiryId(formData)
  if (!id) throw new Error('invalid_enquiry_update')
  await updatePublicContactEnquiry({ enquiryId: id, assignedUserId: null })
  revalidatePath('/admin/commercial/enquiries')
}