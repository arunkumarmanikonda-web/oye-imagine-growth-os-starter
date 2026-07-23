"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  pricing_model: string;
  price_label: string;
  sort_order: number;
};

type ApiResponse = {
  ok: boolean;
  services?: Service[];
  error?: string;
};

export default function MarketplacePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [serviceSlug, setServiceSlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [brief, setBrief] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/marketplace/services", { cache: "no-store" });
        const json = (await response.json()) as ApiResponse;

        if (!response.ok || !json.ok) {
          throw new Error(json.error || "Failed to load services.");
        }

        if (!active) return;

        const nextServices = json.services ?? [];
        setServices(nextServices);
        if (!serviceSlug && nextServices.length > 0) {
          setServiceSlug(nextServices[0].slug);
        }
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load services.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, [serviceSlug]);

  const selectedService = useMemo(
    () => services.find((service) => service.slug === serviceSlug) ?? null,
    [services, serviceSlug],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const response = await fetch("/api/marketplace/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceSlug,
          fullName,
          email,
          companyName,
          phone,
          website,
          budgetRange,
          brief,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to submit request.");
      }

      setSubmitMessage(
        json.request?.id
          ? `Request submitted successfully. Request ID: ${json.request.id}`
          : "Request submitted successfully.",
      );

      setCompanyName("");
      setPhone("");
      setWebsite("");
      setBudgetRange("");
      setBrief("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-fuchsia-300">
            Oye !magine Marketplace
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find execution partners without leaving the Growth OS
          </h1>
          <p className="mt-4 max-w-3xl text-base text-neutral-300 sm:text-lg">
            Browse specialist-led services, capture a structured brief, and route demand into a governed
            marketplace workflow.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-fuchsia-950/20">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Service catalog</h2>
              {loading ? <span className="text-sm text-neutral-400">Loading�</span> : null}
            </div>

            {loadError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {loadError}
              </div>
            ) : null}

            <div className="grid gap-4">
              {services.map((service) => {
                const active = service.slug === serviceSlug;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceSlug(service.slug)}
                    className={[
                      "rounded-2xl border p-5 text-left transition",
                      active
                        ? "border-fuchsia-400 bg-fuchsia-500/10"
                        : "border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                          {service.category}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">{service.title}</h3>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-200">
                        {service.price_label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-300">{service.description}</p>
                  </button>
                );
              })}

              {!loading && services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-neutral-400">
                  No marketplace services found.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white p-6 text-neutral-900 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Request this service</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Submit a structured brief for review and assignment.
              </p>
              {selectedService ? (
                <div className="mt-4 rounded-2xl bg-neutral-100 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Selected service</p>
                  <p className="mt-1 text-lg font-semibold">{selectedService.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{selectedService.price_label}</p>
                </div>
              ) : null}
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Company</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Budget range</label>
                  <input
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                    placeholder="?50k - ?1L"
                    value={budgetRange}
                    onChange={(event) => setBudgetRange(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Website</label>
                <input
                  type="url"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Brief</label>
                <textarea
                  className="min-h-[140px] w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 focus:border-neutral-900"
                  placeholder="What do you need, for which brand, by when, and what outcome matters most?"
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  required
                />
              </div>

              {submitMessage ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
                  {submitMessage}
                </div>
              ) : null}

              {submitError ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !serviceSlug}
                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting�" : "Submit marketplace request"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
