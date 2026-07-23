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

type Specialist = {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  primary_category: string;
  bio: string;
  skills: string[];
  languages: string[];
  verified: boolean;
  sort_order: number;
};

type ServicesResponse = {
  ok: boolean;
  services?: Service[];
  error?: string;
};

type SpecialistsResponse = {
  ok: boolean;
  specialists?: Specialist[];
  error?: string;
};

export default function MarketplacePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
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

    async function loadData() {
      setLoading(true);
      setLoadError("");

      try {
        const [servicesResponse, specialistsResponse] = await Promise.all([
          fetch("/api/marketplace/services", { cache: "no-store" }),
          fetch("/api/marketplace/specialists", { cache: "no-store" }),
        ]);

        const servicesJson = (await servicesResponse.json()) as ServicesResponse;
        const specialistsJson = (await specialistsResponse.json()) as SpecialistsResponse;

        if (!servicesResponse.ok || !servicesJson.ok) {
          throw new Error(servicesJson.error || "Failed to load services.");
        }

        if (!specialistsResponse.ok || !specialistsJson.ok) {
          throw new Error(specialistsJson.error || "Failed to load specialists.");
        }

        if (!active) return;

        const nextServices = servicesJson.services ?? [];
        const nextSpecialists = specialistsJson.specialists ?? [];

        setServices(nextServices);
        setSpecialists(nextSpecialists);

        if (!serviceSlug && nextServices.length > 0) {
          setServiceSlug(nextServices[0].slug);
        }
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load marketplace data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

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
            Browse specialist-led services, discover vetted execution talent, and route demand into a governed
            marketplace workflow.
          </p>
        </div>

        {loadError ? (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {loadError}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-fuchsia-950/20">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Service catalog</h2>
              {loading ? <span className="text-sm text-neutral-400">Loading�</span> : null}
            </div>

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

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-fuchsia-950/20">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-300">Specialists</p>
            <h2 className="mt-2 text-3xl font-bold">Meet the execution bench</h2>
            <p className="mt-3 max-w-3xl text-neutral-300">
              Discover category specialists who can be assigned through the Oye !magine marketplace workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                      {specialist.primary_category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{specialist.full_name}</h3>
                    <p className="mt-1 text-sm text-neutral-300">{specialist.title}</p>
                  </div>
                  {specialist.verified ? (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Emerging
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-300">{specialist.bio}</p>

                <div className="mt-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-400">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {specialist.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-400">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {specialist.languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-300"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {!loading && specialists.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-neutral-400">
                No specialists found.
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
