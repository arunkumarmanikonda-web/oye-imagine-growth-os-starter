"use client";

import Link from "next/link";
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
        const specialistsJson =
          (await specialistsResponse.json()) as SpecialistsResponse;

        if (!servicesResponse.ok || !servicesJson.ok) {
          throw new Error(servicesJson.error || "Failed to load services.");
        }

        if (!specialistsResponse.ok || !specialistsJson.ok) {
          throw new Error(
            specialistsJson.error || "Failed to load specialists.",
          );
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
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load marketplace data.",
        );
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

  const featuredSpecialists = useMemo(
    () => specialists.slice(0, 6),
    [specialists],
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
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                Oye !magine Marketplace
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Find verified growth specialists without leaving{" "}
                <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Browse packaged services, submit structured briefs, and route work
                into a governed marketplace workflow built for scale.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="oi-chip px-4 py-2">Governed intake</div>
                <div className="oi-chip px-4 py-2">Specialist marketplace</div>
                <div className="oi-chip px-4 py-2">Human accountability</div>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Marketplace snapshot
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {services.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">services</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {specialists.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">specialists</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {selectedService ? "1" : "0"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">selected service</p>
                </div>
              </div>

              {selectedService ? (
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                    Active service
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedService.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedService.price_label}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="oi-card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                  Service catalog
                </p>
                <h2 className="oi-section-title mt-2 text-2xl">
                  Choose the right execution lane
                </h2>
              </div>
              {loading ? (
                <span className="text-sm text-slate-500">Loading...</span>
              ) : null}
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
                      "rounded-3xl border p-5 text-left transition duration-150",
                      active
                        ? "border-indigo-300 bg-indigo-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">
                          {service.category}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">
                          {service.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {service.price_label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>
                  </button>
                );
              })}

              {!loading && services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No marketplace services found.
                </div>
              ) : null}
            </div>
          </div>

          <div className="oi-card p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
                Structured intake
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Request this service
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Submit a structured brief for review, routing, and specialist
                assignment.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Service
                </label>
                <select
                  className="oi-select px-4 py-3"
                  value={serviceSlug}
                  onChange={(event) => setServiceSlug(event.target.value)}
                  required
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.slug}>
                      {service.title} — {service.price_label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    className="oi-input px-4 py-3"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="oi-input px-4 py-3"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company
                </label>
                <input
                  className="oi-input px-4 py-3"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    className="oi-input px-4 py-3"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Budget range
                  </label>
                  <input
                    className="oi-input px-4 py-3"
                    placeholder="₹50k - ₹1L"
                    value={budgetRange}
                    onChange={(event) => setBudgetRange(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Website
                </label>
                <input
                  type="url"
                  className="oi-input px-4 py-3"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Brief
                </label>
                <textarea
                  className="oi-textarea min-h-[150px] px-4 py-3"
                  placeholder="What do you need, for which brand, by when, and what outcome matters most?"
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  required
                />
              </div>

              {submitMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {submitMessage}
                </div>
              ) : null}

              {submitError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || loading || !serviceSlug}
                className="oi-button-primary inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit marketplace request"}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8 oi-card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Specialist directory
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Meet verified operators
              </h2>
            </div>
            <div className="oi-chip px-4 py-2">
              {specialists.length} listed
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredSpecialists.map((specialist) => (
              <Link
                key={specialist.id}
                href={`/marketplace/specialists/${specialist.slug}`}
                className="oi-card-soft block p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {specialist.full_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {specialist.title}
                    </p>
                  </div>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      specialist.verified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {specialist.verified ? "Verified" : "Profile"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {specialist.primary_category}
                  </span>
                  {specialist.languages.slice(0, 2).map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {language}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {specialist.bio}
                </p>

                {specialist.skills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialist.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}

            {!loading && featuredSpecialists.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No specialists found.
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}