import { NextRequest, NextResponse } from 'next/server'
import { getClientFinanceWorkspace } from '@/lib/finance/client-finance'

export async function GET(request: NextRequest) {
  const workspaceKey = request.nextUrl.searchParams.get('workspaceKey') ?? 'neejee'
  const referenceDate = request.nextUrl.searchParams.get('referenceDate') ?? '2026-08-01T00:00:00.000Z'

  return NextResponse.json({
    workspace: getClientFinanceWorkspace(workspaceKey, referenceDate),
  })
}