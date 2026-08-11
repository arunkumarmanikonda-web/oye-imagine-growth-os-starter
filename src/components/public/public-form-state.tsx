import * as React from 'react'

import {
  getPublicStateCopy,
  type PublicUiState,
} from '@/lib/public/public-state-copy'

export type PublicFormStateProps = {
  state: PublicUiState
  title?: string
  body?: string
  detail?: string
  actionLabel?: string
  retryLabel?: string
  requestId?: string
  onRetry?: () => void
  className?: string
}

const toneClassMap: Record<PublicUiState, string> = {
  empty: 'border-slate-300 bg-slate-50 text-slate-800',
  loading: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-rose-300 bg-rose-50 text-rose-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
}

export function PublicFormState({
  state,
  title,
  body,
  detail,
  actionLabel,
  retryLabel,
  requestId,
  onRetry,
  className = '',
}: PublicFormStateProps) {
  const copy = getPublicStateCopy(state, {
    title,
    body,
    actionLabel,
    retryLabel,
  })

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${toneClassMap[state]} ${className}`.trim()}
      data-public-ui-state={state}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
            {copy.eyebrow}
          </p>
          <h3 className="text-lg font-semibold">{copy.title}</h3>
          <p className="text-sm leading-6 opacity-90">{copy.body}</p>
          {detail ? <p className="text-xs leading-5 opacity-80">{detail}</p> : null}
          {requestId ? (
            <p className="text-xs font-medium opacity-80">Request ID: {requestId}</p>
          ) : null}
        </div>

        {state === 'loading' ? (
          <div
            aria-label="Loading"
            className="mt-1 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
      </div>

      {state === 'error' && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-xl border border-current px-3 py-2 text-sm font-medium"
        >
          {copy.retryLabel ?? 'Try again'}
        </button>
      ) : null}
    </div>
  )
}

export function PublicViewState(props: PublicFormStateProps) {
  return <PublicFormState {...props} className={`min-h-[120px] ${props.className ?? ''}`.trim()} />
}