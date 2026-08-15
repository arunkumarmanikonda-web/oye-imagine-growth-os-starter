import { NextResponse } from 'next/server'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'oye-imagine-growth-os-starter',
    workspaceDisplayName: getWorkspaceDisplayName(),
  })
}
