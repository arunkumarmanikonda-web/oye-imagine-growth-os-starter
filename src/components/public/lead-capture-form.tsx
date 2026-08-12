'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { PublicFormState } from '@/components/public/public-form-state'
import {
  PUBLIC_FORM_STATE_LIBRARY,
  buildPublicFormMessage,
} from '@/lib/public/public-state-copy'

const leadCaptureSchema = z.object({
  intent: z.enum(['contact', 'demo', 'audit', 'onboarding', 'qualify', 'scope', 'dsar']),
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Valid email is required.'),
  company: z.string().trim().min(2, 'Company is required.'),
  useCase: z.string().trim().min(5, 'Use case is required.'),
  painPoints: z.string().trim().min(5, 'Pain points are required.'),
  teamSize: z.string().trim().min(2, 'Team size is required.'),
  timeline: z.string().trim().min(2, 'Timeline is required.'),
})

type LeadCaptureValues = z.infer<typeof leadCaptureSchema>

export type LeadCaptureFormProps = {
  className?: string
  intent?: LeadCaptureValues['intent']
  title?: string
  description?: string
  submitLabel?: string
  [key: string]: unknown
}

export function LeadCaptureForm({
  className = '',
  intent = 'contact',
  title = 'Shared public intake',
  description = 'Unified empty, loading, error, and success states for public lead capture.',
  submitLabel = 'Submit request',
}: LeadCaptureFormProps) {
  const [uiState, setUiState] = React.useState<'idle' | 'loading' | 'error' | 'success' | 'empty'>('idle')
  const [requestId, setRequestId] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<LeadCaptureValues>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      intent,
      name: '',
      email: '',
      company: '',
      useCase: '',
      painPoints: '',
      teamSize: '',
      timeline: '',
    },
  })

  React.useEffect(() => {
    form.setValue('intent', intent)
  }, [form, intent])

  const values = form.watch()
  const progress = Math.round(
    (Object.values(values).filter((value) => String(value ?? '').trim().length > 0).length / 8) * 100,
  )

  async function onSubmit(values: LeadCaptureValues) {
    setUiState('loading')
    setErrorMessage('')
    setRequestId('')

    const payload = {
      ...values,
      message: buildPublicFormMessage([
        `Use case: ${values.useCase}`,
        `Pain points: ${values.painPoints}`,
        `Team size: ${values.teamSize}`,
        `Timeline: ${values.timeline}`,
      ]),
      source: 'public-web',
    }

    try {
      const response = await fetch('/api/public/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok || !json?.requestId) {
        throw new Error(json?.error || 'Lead capture submission failed.')
      }

      setRequestId(json.requestId)
      setUiState('success')
      form.reset({
        intent,
        name: '',
        email: '',
        company: '',
        useCase: '',
        painPoints: '',
        teamSize: '',
        timeline: '',
      })
    } catch (error) {
      setUiState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Lead capture submission failed.')
    }
  }

  return (
    <section className={`space-y-6 ${className}`.trim()}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Shared lead capture
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">Completion state: {progress}%</p>
      </div>

      {progress === 0 ? (
        <PublicFormState
          state="empty"
          title="Start the intake"
          body="Choose the intent and add enough context for persistence, audit trail, and confirmation logging."
        />
      ) : null}

      {uiState === 'loading' ? (
        <PublicFormState
          state="loading"
          title="Submitting intake"
          body="We are validating the shared submission payload and writing the submission logs."
        />
      ) : null}

      {uiState === 'error' ? (
        <PublicFormState
          state="error"
          title="Submission needs attention"
          body={errorMessage || 'The public intake request did not complete.'}
          onRetry={() => {
            setUiState('idle')
            setErrorMessage('')
          }}
        />
      ) : null}

      {uiState === 'success' ? (
        <PublicFormState
          state="success"
          title="Submission completed"
          body="The shared public intake flow finished successfully."
          requestId={requestId}
        />
      ) : null}

      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Intent</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('intent')}>
              {PUBLIC_FORM_STATE_LIBRARY.intents.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <span className="text-xs text-rose-600">{form.formState.errors.intent?.message}</span>
          </label>

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
          {submitLabel}
        </button>
      </form>
    </section>
  )
}

export default LeadCaptureForm