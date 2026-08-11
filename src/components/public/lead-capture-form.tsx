'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  LEAD_CAPTURE_FORM_FIELDS,
  getLeadCaptureExperience,
  leadCaptureSubmissionSchema,
  type LeadCaptureIntent,
  type LeadCaptureSubmission,
} from '@/lib/public/lead-capture-kit'

type LeadCaptureFormProps = {
  intent: LeadCaptureIntent
  title: string
  description: string
  endpoint?: string
  submitLabel?: string
}

export default function LeadCaptureForm({
  intent,
  title,
  description,
  endpoint = '/api/public/submissions',
  submitLabel = 'Submit',
}: LeadCaptureFormProps) {
  const experience = getLeadCaptureExperience()
  const [requestId, setRequestId] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureSubmission>({
    resolver: zodResolver(leadCaptureSubmissionSchema),
    defaultValues: {
      intent,
      name: '',
      email: '',
      company: '',
      message: '',
      useCase: '',
      source: 'public-web',
      turnstileToken: '',
    },
  })

  const watchedValues = watch()

  const progress = useMemo(() => {
    const requiredKeys: (keyof LeadCaptureSubmission)[] = ['name', 'email', 'company', 'message']
    const completed = requiredKeys.filter((key) => {
      const value = watchedValues[key]
      return typeof value === 'string' && value.trim().length > 0
    }).length
    return Math.round((completed / requiredKeys.length) * 100)
  }, [watchedValues])

  async function onSubmit(values: LeadCaptureSubmission) {
    setSubmitError('')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      setSubmitError(body?.error || 'Unable to submit form.')
      return
    }

    setRequestId(body?.requestId || '')
    setIsSubmitted(true)
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white">
      <div className="mb-6 border-b border-white/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
          Shared form kit · {intent}
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-400">Progress {progress}%</p>
      </div>

      {!isSubmitted ? (
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" value={intent} {...register('intent')} />
          <input type="hidden" value="public-web" {...register('source')} />

          {LEAD_CAPTURE_FORM_FIELDS.map((field) => {
            const commonClass =
              'w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none'
            const error = errors[field.key]

            return (
              <label key={field.key} className="grid gap-2 text-sm text-slate-200">
                <span className="font-medium">
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>

                {field.kind === 'textarea' ? (
                  <textarea
                    {...register(field.key)}
                    rows={5}
                    className={commonClass}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    {...register(field.key)}
                    type={field.kind}
                    className={commonClass}
                    placeholder={field.placeholder}
                  />
                )}

                {error ? <span className="text-xs text-rose-300">{String(error.message)}</span> : null}
              </label>
            )
          })}

          <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Turnstile-ready slot</p>
            <p className="mt-1">
              Add token wiring when secrets are available. Logging stays masked and provider-ready.
            </p>
          </div>

          {submitError ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting…' : submitLabel}
            </button>

            <span className="text-xs text-slate-400">
              States: {experience.states.join(' · ')} · Support: {experience.support}
            </span>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
            Success state
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">Submission received</h3>
          <p className="mt-2 text-sm text-slate-200">
            Confirmation proof, audit proof, and persistence logs have been created.
          </p>
          <p className="mt-3 text-sm text-cyan-200">Request ID: {requestId}</p>
        </div>
      )}

      <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-sm text-slate-300 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{experience.legalIdentity}</p>
          <p className="mt-1">{experience.privacy}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Support</p>
          <p className="mt-1">{experience.support}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Intent coverage</p>
          <p className="mt-1">{experience.intents.map((item) => item.intent).join(', ')}</p>
        </div>
      </div>
    </section>
  )
}