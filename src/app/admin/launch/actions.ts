'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { launchChecklistSections } from '@/lib/launch/checklist-seed';
import { buildRecoveryAuthSessionFromCookieStore } from '@/lib/recovery/auth-session-server';
import { getRouteAccessDecision } from '@/lib/recovery/route-guards';
import { saveLaunchSignoff } from '@/lib/launch/signoff-store';
import type { LaunchRole } from '@/lib/launch/types';

const allowedRoles: LaunchRole[] = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Legal',
  'Operations',
];

function parseEvidenceUrls(raw: FormDataEntryValue | null) {
  return String(raw ?? '')
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function submitLaunchSignoff(formData: FormData) {
  const cookieStore = await cookies();
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore);
  const decision = getRouteAccessDecision(session, 'operator');

  if (!decision.allow) {
    throw new Error('Unauthorized launch signoff submission.');
  }

  const sectionId = String(formData.get('sectionId') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() as LaunchRole;
  const signerName = String(formData.get('signerName') ?? '').trim();
  const signerEmail = String(formData.get('signerEmail') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const evidenceUrls = parseEvidenceUrls(formData.get('evidenceUrls'));

  if (!launchChecklistSections.some((section) => section.id === sectionId)) {
    throw new Error(`Unknown sectionId: ${sectionId}`);
  }

  if (!allowedRoles.includes(role)) {
    throw new Error(`Unsupported role: ${role}`);
  }

  await saveLaunchSignoff({
    sectionId,
    role,
    signerName,
    signerEmail,
    evidenceUrls,
    notes: notes || undefined,
  });

  redirect('/admin/launch');
}