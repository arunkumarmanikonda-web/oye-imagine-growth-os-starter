'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type ProviderField = {
  provider_key: string;
  field_key: string;
  label: string;
  field_type: 'secret' | 'text' | 'url' | 'number' | 'boolean' | 'json';
  required: boolean;
  sensitive: boolean;
  help_text?: string | null;
  configured: boolean;
  configurationSource?: 'environment' | 'vault' | null;
  credential?: {
    status: string;
    last_verified_at?: string | null;
    verification_message?: string | null;
    updated_at?: string | null;
  } | null;
};

type Provider = {
  provider_key: string;
  display_name: string;
  provider_category: string;
  capabilities: string[];
  enabled: boolean;
  client_visible: boolean;
  fields: ProviderField[];
  activationCore: {
    totalRequired: number;
    configuredRequired: number;
    ready: boolean;
  };
};

type IntegrationRequest = {
  request_id: string;
  requested_capability: string;
  proposed_provider_name?: string | null;
  reason: string;
  expected_value?: string | null;
  status: string;
  required_account_steps?: string[];
  required_secret_fields?: Array<{ key: string; label?: string }>;
  official_docs_url?: string | null;
  official_account_url?: string | null;
};

type ProviderConfiguration = {
  providers: Provider[];
  routes: Array<{
    route_id: string;
    capability_key: string;
    purpose: string;
    primary_provider_key: string;
    fallback_provider_keys: string[];
    client_label: string;
    client_provider_disclosure: boolean;
    enabled: boolean;
  }>;
  integrationRequests: IntegrationRequest[];
  clientDisclosurePolicy: string;
};

export function ProviderVaultConsole() {
  const [configuration, setConfiguration] = useState<ProviderConfiguration | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Loading secure provider configuration…');

  async function load() {
    const response = await fetch('/api/admin/config/providers', { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.code === 'access_denied' ? 'Super Admin access is required.' : 'Provider configuration is unavailable.');
      return;
    }
    setConfiguration(payload.configuration);
    setMessage('Secrets are write-only. Runtime checks may use deployment environment values or encrypted Vault values; neither is returned to the browser.');
  }

  useEffect(() => {
    void load();
  }, []);

  const readiness = useMemo(() => {
    if (!configuration) return { ready: 0, total: 0 };
    return configuration.providers.reduce(
      (state, provider) => ({
        ready: state.ready + (provider.activationCore.ready ? 1 : 0),
        total: state.total + 1,
      }),
      { ready: 0, total: 0 },
    );
  }, [configuration]);

  async function save(event: FormEvent, providerKey: string, field: ProviderField) {
    event.preventDefault();
    const stateKey = `${providerKey}|${field.field_key}`;
    const value = values[stateKey]?.trim();
    if (!value) {
      setMessage(`Enter ${field.label} before saving.`);
      return;
    }
    setBusyKey(stateKey);
    setMessage(`Securing ${field.label}…`);
    try {
      const response = await fetch('/api/admin/config/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerKey, fieldKey: field.field_key, value, environment: 'production' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || 'save_failed');
      setValues((current) => ({ ...current, [stateKey]: '' }));
      setMessage(`${field.label} saved securely. Runtime validation can now verify the provider.`);
      await load();
    } catch {
      setMessage(`${field.label} could not be saved. No secret was exposed back to the browser.`);
    } finally {
      setBusyKey(null);
    }
  }

  if (!configuration) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
        <p className="text-sm text-slate-300">{message}</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.08] to-white/[0.03] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Oye provider fabric</p>
          <h2 className="mt-3 text-2xl font-semibold">One secure configuration desk. Every provider stays behind Oye !magine.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Add or rotate production credentials here. Runtime resolution prefers securely configured deployment values and falls back to the encrypted Provider Vault. Clients receive Oye outcomes, not vendor credentials.
          </p>
          <p className="mt-5 text-sm font-medium text-white">{message}</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Activation core present</p>
          <p className="mt-4 text-5xl font-semibold">{readiness.ready}/{readiness.total}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">Credential/configuration presence only. Provider authority, machine QA and execution proof are separate gates and cannot be inferred from this card.</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {configuration.providers.map((provider) => {
          const core = provider.activationCore;
          const badge = core.totalRequired === 0
            ? 'No activation contract'
            : core.ready
              ? 'Activation core present'
              : `${core.configuredRequired}/${core.totalRequired} required fields`;
          return (
            <article key={provider.provider_key} className="rounded-[2rem] border border-white/10 bg-black/20 p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{provider.provider_category}</p>
                  <h3 className="mt-2 text-xl font-semibold">{provider.display_name}</h3>
                  <p className="mt-2 text-xs text-slate-400">{provider.capabilities.join(' · ')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${core.ready ? 'bg-emerald-300/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>
                  {badge}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {provider.fields.map((field) => {
                  const stateKey = `${provider.provider_key}|${field.field_key}`;
                  const sourceLabel = field.configurationSource === 'environment'
                    ? 'Configured in environment'
                    : field.configurationSource === 'vault'
                      ? 'Configured in Vault'
                      : 'Not configured';
                  return (
                    <form key={field.field_key} onSubmit={(event) => save(event, provider.provider_key, field)} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium" htmlFor={stateKey}>{field.label}{field.required ? ' *' : ''}</label>
                        <span className={`text-xs ${field.configured ? 'text-emerald-200' : 'text-slate-500'}`}>{sourceLabel}</span>
                      </div>
                      {field.help_text ? <p className="mt-1 text-xs text-slate-500">{field.help_text}</p> : null}
                      <div className="mt-3 flex gap-2">
                        <input
                          id={stateKey}
                          type={field.sensitive ? 'password' : 'text'}
                          autoComplete="off"
                          value={values[stateKey] ?? ''}
                          onChange={(event) => setValues((current) => ({ ...current, [stateKey]: event.target.value }))}
                          placeholder={field.configured ? 'Enter a new value to rotate or override in Vault' : `Enter ${field.label}`}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                        />
                        <button
                          disabled={busyKey === stateKey}
                          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                          type="submit"
                        >
                          {busyKey === stateKey ? 'Saving…' : field.configurationSource === 'vault' ? 'Rotate' : 'Save to Vault'}
                        </button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Autonomous integration radar</p>
            <h2 className="mt-3 text-2xl font-semibold">What Oye wants next</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">When the evolution engine identifies a stronger future technology, it creates an admin action with the account, scope and credential requirements needed to integrate it.</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{configuration.integrationRequests.length} requests</span>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {configuration.integrationRequests.length ? configuration.integrationRequests.map((request) => (
            <article key={request.request_id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{request.requested_capability}</p>
                  <h3 className="mt-2 font-semibold">{request.proposed_provider_name || 'Provider to be selected by Oye'}</h3>
                </div>
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">{request.status.replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{request.reason}</p>
              {request.expected_value ? <p className="mt-2 text-xs leading-5 text-slate-500">Expected value: {request.expected_value}</p> : null}
              {request.required_account_steps?.length ? (
                <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs leading-5 text-slate-400">
                  {request.required_account_steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              ) : null}
            </article>
          )) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 p-6 text-sm text-slate-500">No future integration requires Super Admin action right now.</div>
          )}
        </div>
      </section>
    </div>
  );
}
