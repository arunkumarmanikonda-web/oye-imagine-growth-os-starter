import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PublicFormState } from '@/components/public/public-form-state'
import {
  PUBLIC_FORM_STATE_LIBRARY,
  PUBLIC_STATE_COPY,
  buildPublicFormMessage,
  getPublicStateCopy,
} from '@/lib/public/public-state-copy'

describe('public form state copy', () => {
  it('exposes the four required state variants', () => {
    expect(Object.keys(PUBLIC_STATE_COPY)).toEqual(['empty', 'loading', 'error', 'success'])
    expect(PUBLIC_FORM_STATE_LIBRARY.states).toEqual(['empty', 'loading', 'error', 'success'])
  })

  it('builds a compatibility message without empty values', () => {
    expect(
      buildPublicFormMessage([
        'Use case: qualification handoff',
        '',
        undefined,
        'Timeline: 30 days',
      ]),
    ).toBe('Use case: qualification handoff | Timeline: 30 days')
  })

  it('allows targeted copy overrides', () => {
    const copy = getPublicStateCopy('error', { title: 'Retry required' })
    expect(copy.title).toBe('Retry required')
    expect(copy.retryLabel).toBe('Try again')
  })

  it('renders a success state with request id', () => {
    const markup = renderToStaticMarkup(
      <PublicFormState
        state="success"
        title="Submitted"
        body="The request completed."
        requestId="lead_test_123"
      />,
    )

    expect(markup).toContain('Submitted')
    expect(markup).toContain('lead_test_123')
    expect(markup).toContain('success')
  })
})