import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const CONTACT_ENQUIRY_STATUSES = ['new','qualified','in_progress','converted','closed','spam'] as const
export type ContactEnquiryStatus = (typeof CONTACT_ENQUIRY_STATUSES)[number]

export type PublicContactEnquiry = {
  enquiry_id: string
  full_name: string
  company_name: string | null
  email: string
  phone: string | null
  interest: string
  message: string
  preferred_language: 'en' | 'hi'
  consent_to_contact: boolean
  status: ContactEnquiryStatus
  assigned_user_id: string | null
  source_path: string | null
  source_context: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function listPublicContactEnquiries(limit = 100): Promise<PublicContactEnquiry[]> {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('public_contact_enquiries')
    .select('enquiry_id,full_name,company_name,email,phone,interest,message,preferred_language,consent_to_contact,status,assigned_user_id,source_path,source_context,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 250))
  if (error) throw new Error(`contact_enquiry_list_failed:${error.message}`)
  return (data ?? []) as PublicContactEnquiry[]
}

export async function updatePublicContactEnquiry(input: {
  enquiryId: string
  status?: ContactEnquiryStatus
  assignedUserId?: string | null
}) {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.status) update.status = input.status
  if ('assignedUserId' in input) update.assigned_user_id = input.assignedUserId ?? null
  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('public_contact_enquiries')
    .update(update)
    .eq('enquiry_id', input.enquiryId)
  if (error) throw new Error(`contact_enquiry_update_failed:${error.message}`)
}