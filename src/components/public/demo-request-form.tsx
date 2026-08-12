'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { PublicFormState } from '@/components/public/public-form-state'
import { PUBLIC_FORM_STATE_LIBRARY } from '@/lib/public/public-state-copy'

const demoRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Valid email is required.'),
  company: z.string().trim().min(2, 'Company is required.'),
  useCase: z.string().trim().min(5, 'Use case is required.'),
  painPoints: z.string().trim().min(5, 'Pain points are required.'),
  teamSize: z.string().trim().min(2, 'Team size is required.'),
  timeline: z.string().trim().min(2, 'Timeline is required.'),
})

type DemoRequestValues = z.infer<typeof demoRequestSchema>

export type DemoRequestFormProps = {
  className?: string
  [key: string]: unknown
}

const defaultValues: DemoRequestValues = {
  name: '',
  email: '',
  company: '',
  useCase: '',
  painPoints: '',
  teamSize: '',
  timeline: '',
}

export function DemoRequestForm({ className = '' }: DemoRequestFormProps) {
  const [uiState, setUiState] = React.useState<'idle' | 'loading' | 'error' | 'success' | 'empty'>('idle')
  const [requestId, setRequestId] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<DemoRequestValues>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues,
  })

  const values = form.watch()
  const progress = Math.round(
    (Object.values(values).filter((value) => String(value ?? '').trim().length > 0).length / 7) * 100,
  )

  async function onSubmit(values: DemoRequestValues) {
    setUiState('loading')
    setErrorMessage('')
    setRequestId('')

    try {
      const response = await fetch('/api/public/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok || !json?.requestId) {
        throw new Error(json?.error || 'Strategy call request failed.')
      }

      setRequestId(json.requestId)
      setUiState('success')
      form.reset(defaultValues)
    } catch (error) {
      setUiState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Strategy call request failed.')
    }
  }

  return (
    <section className={`space-y-6 ${className}`.trim()}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Interactive strategy call request
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Book a guided walkthrough</h2>
        <p className="text-sm leading-6 text-slate-600">
          Shared empty, loading, error, and success states now protect this public booking flow.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">Completion state: {progress}%</p>
      </div>

      {progress === 0 ? (
        <PublicFormState
          state="empty"
          title="Start your strategy call request"
          body="Add your team context and use case to unlock the booking handoff."
        />
      ) : null}

      {uiState === 'loading' ? (
        <PublicFormState
          state="loading"
          title="Submitting strategy call request"
          body="We are validating details, preparing the audit trail, and queuing the booking handoff."
        />
      ) : null}

      {uiState === 'error' ? (
        <PublicFormState
          state="error"
          title="Strategy call request needs attention"
          body={errorMessage || 'The strategy call request did not complete.'}
          onRetry={() => {
            setUiState('idle')
            setErrorMessage('')
          }}
        />
      ) : null}

      {uiState === 'success' ? (
        <div className="space-y-4">
          <PublicFormState
            state="success"
            title="Strategy call request submitted"
            body="The booking handoff is ready. Continue to the calendar step."
            requestId={requestId}
          />
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            Calendar handoff enabled. Embed or provider token can be attached later without changing the UX state system.
          </div>
        </div>
      ) : null}

      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('name')} />
            <span className="text-xs text-rose-600">{form.formState.errors.name?.message}</span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Work email</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('email')} />
            <span className="text-xs text-rose-600">{form.formState.errors.email?.message}</span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Company</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('company')} />
            <span className="text-xs text-rose-600">{form.formState.errors.company?.message}</span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Team size</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('teamSize')} />
            <span className="text-xs text-rose-600">{form.formState.errors.teamSize?.message}</span>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Use case</span>
            <textarea className="min-h-[96px] w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('useCase')} />
            <span className="text-xs text-rose-600">{form.formState.errors.useCase?.message}</span>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Pain points</span>
            <textarea className="min-h-[96px] w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('painPoints')} />
            <span className="text-xs text-rose-600">{form.formState.errors.painPoints?.message}</span>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Timeline</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('timeline')} />
            <span className="text-xs text-rose-600">{form.formState.errors.timeline?.message}</span>
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          {PUBLIC_FORM_STATE_LIBRARY.legalIdentity} • {PUBLIC_FORM_STATE_LIBRARY.jurisdiction} • {PUBLIC_FORM_STATE_LIBRARY.support} • {PUBLIC_FORM_STATE_LIBRARY.privacy}
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Request strategy call
        </button>
      </form>
    </section>
  )
}

export default DemoRequestForm