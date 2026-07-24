import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function HomePage() {
  const status = getSetupStatus();
  const readyCount = status.ready;
  const readinessPercent =
    status.total > 0 ? Math.round((status.ready / status.total) * 100) : 0;

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI-first Growth OS
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Build and operate modern growth systems with{" "}
                <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                A premium operating layer for strategy, websites, SEO, paid media,
                analytics, specialist execution, and governed marketplace delivery.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/marketplace"
                  className="oi-button-primary inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
                >
                  Open marketplace
                </Link>
                <Link
                  href="/admin/marketplace"
                  className="oi-button-secondary inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
                >
                  Open admin workspace
                </Link>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Setup readiness
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold text-slate-950">
                    {readyCount}/{status.total}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    checks marked ready
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-700">
                    {readinessPercent}%
                  </p>
                  <p className="text-sm text-slate-500">completion</p>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-pink-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                This starter is now structured for operational rollout and the next
                wave of productization. Use the marketplace and admin layers as the
                active execution core.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="oi-card p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                  Environment checks
                </p>
                <h2 className="oi-section-title mt-2 text-2xl">
                  Current starter status
                </h2>
              </div>
              <div className="oi-chip px-4 py-2">
                <span className="font-semibold text-slate-700">
                  {readyCount} ready
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {status.checks.map((item) => (
                <div
                  key={item.key}
                  className="oi-card-soft flex items-start justify-between gap-4 p-5"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.note}
                    </p>
                  </div>
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      item.ready
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {item.ready ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="oi-card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
              What this starter already enables
            </p>
            <h2 className="oi-section-title mt-2 text-2xl">
              Live implementation base
            </h2>

            <div className="mt-6 space-y-4">
              {[
                "Marketplace service catalog and request intake",
                "Specialist directory and admin triage workflows",
                "Proposal creation, accept/reject, and event timelines",
                "Governed admin operations with build-verified routes",
              ].map((item) => (
                <div key={item} className="oi-card-soft flex gap-3 p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
              <p className="text-sm font-semibold text-indigo-700">
                Brand rule
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Customer-facing surfaces should use the exact branding{" "}
                <strong>Oye !magine</strong>.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}