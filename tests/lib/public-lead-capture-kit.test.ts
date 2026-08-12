import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { POST } from '@/app/api/public/submissions/route'
import {
  LEAD_CAPTURE_INTENTS,
  buildLeadCaptureAuditEvent,
  buildLeadCaptureEmailProof,
  getLeadCaptureExperience,
  leadCaptureSubmissionSchema,
  maskLeadCaptureSubmission,
  normalizeLeadCaptureSubmission,
} from '@/lib/public/lead-capture-kit'

describe('public lead capture kit', () => {
  it('supports all 7 intents', () => {
    expect(LEAD_CAPTURE_INTENTS).toEqual([
      'contact',
      'demo',
      'audit',
      'onboarding',
      'qualify',
      'scope',
      'dsar',
    ])
  })

  it('normalizes submission safely', () => {
    const payload = normalizeLeadCaptureSubmission({
      intent: 'DEMO' as never,
      name: '  Alex Morgan  ',
      email: '  Alex@Example.COM ',
      company: '  Acme  ',
      message: '  Need a governed flow  ',
      useCase: '  Public launch  ',
    })

    expect(payload.intent).toBe('contact')
    expect(payload.name).toBe('Alex Morgan')
    expect(payload.email).toBe('alex@example.com')
    expect(payload.company).toBe('Acme')
    expect(payload.message).toBe('Need a governed flow')
    expect(payload.useCase).toBe('Public launch')
  })

  it('masks pii safely', () => {
    const masked = maskLeadCaptureSubmission({
      intent: 'demo',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      company: 'Acme',
      message: 'Need a demo',
      useCase: 'Marketplace',
      source: 'public-web',
      turnstileToken: 'secret-token',
    })

    expect(masked.email).toContain('@example.com')
    expect(masked.email).not.toContain('alex@example.com')
    expect(masked.message).toBe('[redacted-message]')
    expect(masked.useCase).toBe('[redacted-use-case]')
    expect(masked.hasTurnstileToken).toBe(true)
  })

  it('exposes shared experience copy', () => {
    const experience = getLeadCaptureExperience()

    expect(experience.intents).toHaveLength(7)
    expect(experience.support).toContain('@')
    expect(experience.legalIdentity).toContain('OYE Imagine')
    expect(experience.states).toEqual(['idle', 'loading', 'success', 'error'])
  })

  it('validates incomplete submissions', () => {
    const result = leadCaptureSubmissionSchema.safeParse({
      intent: 'demo',
      name: 'Alex',
    })

    expect(result.success).toBe(false)
  })

  it('builds audit and email proof', () => {
    const payload = normalizeLeadCaptureSubmission({
      intent: 'scope',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      company: 'Acme',
      message: 'Need scope review for launch',
      useCase: 'Marketplace launch',
    })

    const audit = buildLeadCaptureAuditEvent(payload, 'lead_123')
    const email = buildLeadCaptureEmailProof(payload, 'lead_123')

    expect(audit.event).toBe('public_lead_capture_submitted')
    expect(audit.requestId).toBe('lead_123')
    expect(email.requestId).toBe('lead_123')
    expect(email.intent).toBe('scope')
  })

  it('api returns 400 invalid and 200 valid, with persistence logs', async () => {
    const invalidRequest = new Request('http://localhost/api/public/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'demo', name: 'Alex' }),
    })

    const invalidResponse = await POST(invalidRequest)
    expect(invalidResponse.status).toBe(400)

    const validRequest = new Request('http://localhost/api/public/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'demo',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        company: 'Acme',
        message: 'Need a governed demo workflow with persistence and audit.',
        useCase: 'Pipeline capture',
        source: 'public-web',
      }),
    })

    const validResponse = await POST(validRequest)
    expect(validResponse.status).toBe(200)

    const body = await validResponse.json()
    expect(body.ok).toBe(true)
    expect(String(body.requestId)).toMatch(/^lead_/)

    const artifactDir = path.join(process.cwd(), 'artifacts', 'tracker-ui15')
    const submissionFile = path.join(artifactDir, 'submissions.ndjson')
    const emailFile = path.join(artifactDir, 'email-log.ndjson')
    const auditFile = path.join(artifactDir, 'audit-log.ndjson')

    expect(existsSync(submissionFile)).toBe(true)
    expect(existsSync(emailFile)).toBe(true)
    expect(existsSync(auditFile)).toBe(true)

    expect(readFileSync(submissionFile, 'utf8')).toContain('[redacted-message]')
    expect(readFileSync(emailFile, 'utf8')).toContain('queued-for-proof')
    expect(readFileSync(auditFile, 'utf8')).toContain('public_lead_capture_submitted')
  })
})