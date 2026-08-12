'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { PublicFormState } from '@/components/public/public-form-state'
import { PUBLIC_FORM_STATE_LIBRARY } from '@/lib/public/public-state-copy'

const qualificationSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Valid email is required.'),
  company: z.string().trim().min(2, 'Company is required.'),
  budget: z.string().trim().min(2, 'Budget is required.'),
  services: z.string().trim().min(2, 'Select one or more services.'),
  geo: z.string().trim().min(2, 'Region is required.'),
  timeline: z.string().trim().min(2, 'Timeline is required.'),
  message: z.string().trim().min(10, 'Message is required.'),
})

type QualificationValues = z.infer<typeof qualificationSchema>

export type QualificationFormProps = {
  className?: string
  [key: string]: unknown
}

const defaultValues: QualificationValues = {
  name: '',
  email: '',
  company: '',
  budget: '',
  services: '',
  geo: '',
  timeline: '',
  message: '',
}

export function QualificationForm({ className = '' }: QualificationFormProps) {
  const [uiState, setUiState] = React.useState<'idle' | 'loading' | 'error' | 'success' | 'empty'>('idle')
  const [requestId, setRequestId] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<QualificationValues>({
    resolver: zodResolver(qualificationSchema),
    defaultValues,
  })

  const currentValues = form.watch()
  const progress = Math.round(
    (Object.values(currentValues).filter((value) => String(value ?? '').trim().length > 0).length / 8) * 100,
  )

  async function onSubmit(values: QualificationValues) {
    setUiState('loading')
    setRequestId('')
    setErrorMessage('')

    try {
      const response = await fetch('/api/public/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          services: values.services
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok || !json?.requestId) {
        throw new Error(json?.error || 'Qualification submission failed.')
      }

      setRequestId(json.requestId)
      setUiState('success')
      form.reset(defaultValues)
    } catch (error) {
      setUiState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Qualification submission failed.')
    }
  }

  const showEmpty = progress === 0
  return (
    <section id="qualification" className={`space-y-6 ${className}`.trim()}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Qualification flow
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Request pricing guidance</h2>
        <p className="text-sm leading-6 text-slate-600">
          Explicit empty, loading, error, and success states are now part of the shared public form system.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">Completion state: {progress}%</p>
      </div>

      {showEmpty ? (
        <PublicFormState
          state="empty"
          title="Start the qualification flow"
          body="Add your business context, pricing band, and priority services to unlock the qualification handoff."
        />
      ) : null}

      {uiState === 'loading' ? (
        <PublicFormState
          state="loading"
          title="Submitting qualification details"
          body="We are validating the payload and preparing the qualification record."
        />
      ) : null}

      {uiState === 'error' ? (
        <PublicFormState
          state="error"
          title="Qualification submission needs attention"
          body={errorMessage || 'The qualification request did not complete.'}
          onRetry={() => {
            setUiState('idle')
            setErrorMessage('')
          }}
        />
      ) : null}

      {uiState === 'success' ? (
        <PublicFormState
          state="success"
          title="Qualification request submitted"
          body="The pricing qualification flow completed successfully."
          requestId={requestId}
          detail={`${PUBLIC_FORM_STATE_LIBRARY.legalIdentity} â€¢ ${PUBLIC_FORM_STATE_LIBRARY.jurisdiction}`}
        />
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
            <span className="font-medium text-slate-700">Budget</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('budget')} />
            <span className="text-xs text-rose-600">{form.formState.errors.budget?.message}</span>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Services</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('services')} />
            <span className="text-xs text-rose-600">{form.formState.errors.services?.message}</span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Geo</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('geo')} />
            <span className="text-xs text-rose-600">{form.formState.errors.geo?.message}</span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Timeline</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('timeline')} />
            <span className="text-xs text-rose-600">{form.formState.errors.timeline?.message}</span>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Message</span>
            <textarea className="min-h-[120px] w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register('message')} />
            <span className="text-xs text-rose-600">{form.formState.errors.message?.message}</span>
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          {PUBLIC_FORM_STATE_LIBRARY.legalIdentity} â€¢ {PUBLIC_FORM_STATE_LIBRARY.jurisdiction} â€¢ {PUBLIC_FORM_STATE_LIBRARY.support} â€¢ {PUBLIC_FORM_STATE_LIBRARY.privacy}
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Submit qualification
        </button>
      </form>
    </section>
  )
}

export default QualificationForm