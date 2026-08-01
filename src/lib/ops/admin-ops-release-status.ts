export function buildReleaseStatusRequestPath(search: string | null | undefined): string {
  const normalized = (search ?? '').trim();

  if (!normalized) {
    return '/api/admin/release-status';
  }

  return normalized.startsWith('?')
    ? `/api/admin/release-status${normalized}`
    : `/api/admin/release-status?${normalized}`;
}
