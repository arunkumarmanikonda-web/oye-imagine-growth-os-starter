import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DemoRequestForm } from '@/components/public/demo-request-form'
import { LeadCaptureForm } from '@/components/public/lead-capture-form'
import { QualificationForm } from '@/components/public/qualification-form'

describe('public form smoke render', () => {
  it('renders qualification form state shell', () => {
    const markup = renderToStaticMarkup(<QualificationForm />)
    expect(markup).toContain('Qualification flow')
    expect(markup).toContain('Completion state')
  })

  it('renders demo request form state shell', () => {
    const markup = renderToStaticMarkup(<DemoRequestForm />)
    expect(markup).toContain('Interactive demo request')
    expect(markup).toContain('Request demo')
  })

  it('renders lead capture form state shell', () => {
    const markup = renderToStaticMarkup(<LeadCaptureForm intent="demo" />)
    expect(markup).toContain('Shared lead capture')
    expect(markup).toContain('Submit request')
  })
})