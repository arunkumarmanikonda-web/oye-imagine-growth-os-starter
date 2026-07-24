import Image from "next/image";
import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function HomePage() {
  const status = getSetupStatus();
  const readyCount = status.ready;
  const readinessPercent =
    status.total > 0 ? Math.round((status.ready / status.total) * 100) : 0;

  const productPillars = [
    {
      title: "Strategy engine",
      body: "Convert inputs into channel plans, positioning, growth priorities, and execution guidance.",
    },
    {
      title: "Specialist marketplace",
      body: "Route governed briefs into a managed network of operators, reviewers, and delivery workflows.",
    },
    {
      title: "Execution control",
      body: "Run onboarding, strategy, execution, admin review, and audit visibility in one operating surface.",
    },
  ];

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell">
        <div className="oi-panel-dark overflow-hidden px-8 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="oi-chip bg-white/10 px-4 py-2 text-white/90">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Product shell overhaul
              </div>

              <Image
                src="/brand/oye-logo-dark.png"
                alt="Oye !magine"
                width={320}
                height={92}
                priority
                className="mt-7 h-12 w-auto object-contain sm:h-14"
              />

              <h1 className="mt-8 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Growth infrastructure built for brands that need clarity, speed,
                and accountable execution.
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
                Oye !magine is the operating layer for strategy, websites, SEO,
                paid media, analytics, specialist execution, and governed
                marketplace delivery.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="oi-button-primary px-6 py-3 text-sm font-semibold"
                >
                  Explore marketplace
                </Link>
                <Link
                  href="/admin"
                  className="rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Open admin workspace
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/16 bg-transparent px-6 py-3 text-sm font-semibold text-white/88 transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/54">
                  Setup readiness
                </p>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-semibold tracking-tight text-white">
                      {readinessPercent}%
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      operational readiness
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-right">
                    <p className="text-lg font-semibold text-white">
                      {readyCount}/{status.total}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/52">
                      checks ready
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${readinessPercent}%`,
                      background:
                        "linear-gradient(90deg, #58c6be 0%, #ef7f38 100%)",
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/54">
                    Strategy
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">Live</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/54">
                    Marketplace
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">Live</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/54">
                    Admin
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {productPillars.map((item) => (
            <div key={item.title} className="oi-card p-6">
              <p className="oi-kicker">Core surface</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="oi-card p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="oi-kicker">Environment checks</p>
                <h2 className="oi-section-title mt-3 text-3xl">
                  Current platform status
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
                    <p className="text-base font-semibold text-slate-950">
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

          <div className="space-y-6">
            <div className="oi-card p-8">
              <p className="oi-kicker">What ships now</p>
              <h2 className="oi-section-title mt-3 text-3xl">
                Live implementation base
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  "Marketplace service catalog and structured request intake",
                  "Specialist directory with governed admin assignment flows",
                  "Proposal creation, event timelines, and state transitions",
                  "Operational admin routes for onboarding, strategy, execution, settings, summary, and ops",
                ].map((item) => (
                  <div key={item} className="oi-card-soft flex gap-3 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-500)]" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="oi-card p-8">
              <p className="oi-kicker">Brand rule</p>
              <h2 className="oi-section-title mt-3 text-3xl">
                Single approved identity
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Customer-facing and admin surfaces should use the approved
                Oye !magine logo system consistently across light, dark, and
                compact placements.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <Image
                  src="/brand/oye-symbol.png"
                  alt="Oye !magine symbol"
                  width={88}
                  height={88}
                  className="h-16 w-16 rounded-2xl object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Approved brand assets loaded
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Light logo, dark logo, and icon-only symbol are now part of
                    the app shell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}