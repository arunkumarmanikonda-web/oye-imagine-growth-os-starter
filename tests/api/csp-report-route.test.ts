import { describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/api/security/csp-report/route'

describe('CSP report-only collector', () => {
  it('accepts a valid CSP report without echoing its contents', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const request = new Request('https://www.oyeimagine.com/api/security/csp-report', {
      method: 'POST',
      headers: { 'content-type': 'application/csp-report' },
      body: JSON.stringify({
        'csp-report': {
          'document-uri': 'https://www.oyeimagine.com/login',
          'effective-directive': 'connect-src',
          'blocked-uri': 'https://example-provider.invalid',
        },
      }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(info).toHaveBeenCalledWith(
      'csp_report_only_violation',
      expect.objectContaining({ effectiveDirective: 'connect-src' }),
    )
    info.mockRestore()
  })

  it('rejects unsupported content types', async () => {
    const request = new Request('https://www.oyeimagine.com/api/security/csp-report', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{}',
    })

    const response = await POST(request as never)
    expect(response.status).toBe(415)
  })

  it('rejects oversized reports before parsing', async () => {
    const request = new Request('https://www.oyeimagine.com/api/security/csp-report', {
      method: 'POST',
      headers: {
        'content-type': 'application/csp-report',
        'content-length': String(33 * 1024),
      },
      body: '{}',
    })

    const response = await POST(request as never)
    expect(response.status).toBe(413)
  })
})
