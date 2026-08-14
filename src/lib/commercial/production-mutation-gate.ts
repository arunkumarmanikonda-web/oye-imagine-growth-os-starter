import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'

export async function commercialMutationFrozenResponse(action: string) {
  try {
    await requireApiAccess({ lane: 'admin' })

    return NextResponse.json(
      {
        ok: false,
        code: 'commercial_mutation_frozen',
        executionState: 'frozen',
        action,
        message:
          'This irreversible commercial action is frozen until maker-checker, payment/eSign, reconciliation and production acceptance gates are verified.',
        externalMutationPerformed: false,
      },
      {
        status: 423,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        {
          status: error.status,
          headers: { 'Cache-Control': 'private, no-store' },
        },
      )
    }

    return NextResponse.json(
      { ok: false, code: 'mutation_gate_error', error: 'Commercial mutation gate failed closed.' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  }
}
