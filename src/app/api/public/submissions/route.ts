import { randomUUID } from 'node:crypto'
import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { NextResponse } from 'next/server'

import {
  buildLeadCaptureAuditEvent,
  buildLeadCaptureEmailProof,
  leadCaptureSubmissionSchema,
  maskLeadCaptureSubmission,
  normalizeLeadCaptureSubmission,
} from '@/lib/public/lead-capture-kit'

export const runtime = 'nodejs'

async function appendJsonLine(filePath: string, payload: unknown) {
  await appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8')
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildCompatibilityMessage(rawBody: Record<string, unknown>) {
  const explicitMessage = cleanString(rawBody.message)
  if (explicitMessage) return explicitMessage

  const segments = [
    cleanString(rawBody.useCase) ? `Use case: ${cleanString(rawBody.useCase)}` : '',
    cleanString(rawBody.painPoints) ? `Pain points: ${cleanString(rawBody.painPoints)}` : '',
    cleanString(rawBody.teamSize) ? `Team size: ${cleanString(rawBody.teamSize)}` : '',
    cleanString(rawBody.timeline) ? `Timeline: ${cleanString(rawBody.timeline)}` : '',
  ].filter(Boolean)

  return segments.join(' | ')
}

function coerceLeadCaptureBody(rawBody: unknown) {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return rawBody
  }

  const body = rawBody as Record<string, unknown>
  const compatibilityMessage = buildCompatibilityMessage(body)

  return {
    ...body,
    message: compatibilityMessage,
    useCase: cleanString(body.useCase),
    source: cleanString(body.source) || 'public-web',
    turnstileToken: cleanString(body.turnstileToken),
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null)
    const normalized = normalizeLeadCaptureSubmission(coerceLeadCaptureBody(rawBody) as any)
    const parsed = leadCaptureSubmissionSchema.safeParse(normalized)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Missing required submission fields.' },
        { status: 400 },
      )
    }

    const payload = parsed.data
    const requestId = `lead_${randomUUID()}`
    const createdAt = new Date().toISOString()

    const artifactDir = path.join(process.cwd(), 'artifacts', 'tracker-ui15')
    const submissionFile = path.join(artifactDir, 'submissions.ndjson')
    const emailFile = path.join(artifactDir, 'email-log.ndjson')
    const auditFile = path.join(artifactDir, 'audit-log.ndjson')

    await mkdir(artifactDir, { recursive: true })

    await appendJsonLine(submissionFile, {
      requestId,
      createdAt,
      ...maskLeadCaptureSubmission(payload),
    })

    await appendJsonLine(emailFile, {
      ...buildLeadCaptureEmailProof(payload, requestId),
      createdAt,
    })

    await appendJsonLine(auditFile, {
      ...buildLeadCaptureAuditEvent(payload, requestId),
      createdAt,
    })

    return NextResponse.json(
      {
        ok: true,
        requestId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Lead capture submission failed.', error)

    return NextResponse.json(
      { error: 'Unable to process submission.' },
      { status: 500 },
    )
  }
}