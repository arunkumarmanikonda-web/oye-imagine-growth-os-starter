import Link from 'next/link'
import { getLoginHubExperience } from '@/lib/recovery/surface-composer'

export default function LoginPage() {
  const experience = getLoginHubExperience()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Secure access</div>
            <h1 className="text-4xl font-semibold tracking-tight">{experience.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600">{experience.summary}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {experience.options.map((option) => (
            <Link key={option.id} href={option.href} className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm no-underline transition hover:border-neutral-300">
              <div className="text-xs uppercase tracking-wide text-neutral-500">{option.id}</div>
              <div className="mt-3 text-xl font-semibold text-neutral-950">{option.label}</div>
              <div className="mt-3 text-sm leading-6 text-neutral-600">{option.summary}</div>
            </Link>
          ))}
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Support</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {experience.supportChannels.map((channel) => (
              <a key={channel.id} href={channel.href} className="rounded-2xl bg-neutral-50 p-4 no-underline">
                <div className="text-sm font-semibold text-neutral-950">{channel.label}</div>
                <div className="mt-2 text-sm text-neutral-600">{channel.value}</div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}