"use client";

import { useEffect, useMemo, useState } from "react";

type SectionId = "company_profile" | "goals" | "channels" | "brand";

type OnboardingResponse = {
  ok: boolean;
  activeContext: {
    tenantId: string | null;
    brandId: string | null;
    workspaceId: string | null;
  };
  sections: Record<SectionId, unknown>;
  summary: {
    completedSections: number;
    totalSections: number;
    percentComplete: number;
  };
  error?: string;
};

const STEP_ORDER: Array<{
  id: SectionId;
  label: string;
  description: string;
}> = [
  {
    id: "company_profile",
    label: "Company Profile",
    description: "Business basics, size, website, and market.",
  },
  {
    id: "goals",
    label: "Goals",
    description: "Revenue, leads, priorities, and current business goals.",
  },
  {
    id: "channels",
    label: "Channels",
    description: "Choose the channels active for this workspace.",
  },
  {
    id: "brand",
    label: "Brand",
    description: "Tone, audience, value proposition, and positioning notes.",
  },
];

const CHANNEL_OPTIONS = [
  "Meta Ads",
  "Google Ads",
  "SEO",
  "Email",
  "WhatsApp",
  "Content",
  "Marketplace",
  "Sales team",
];

function emptySections() {
  return {
    company_profile: {
      businessName: "",
      industry: "",
      teamSize: "",
      website: "",
      primaryMarket: "",
    },
    goals: {
      primaryObjective: "",
      monthlyRevenueTarget: "",
      leadTarget: "",
      biggestChallenge: "",
      ninetyDayPriority: "",
    },
    channels: [] as string[],
    brand: {
      tone: "",
      audience: "",
      valueProposition: "",
      notes: "",
    },
  };
}

function normalizeSections(raw?: Record<SectionId, unknown>) {
  const base = emptySections();

  return {
    company_profile: {
      ...base.company_profile,
      ...((raw?.company_profile as Record<string, unknown>) ?? {}),
    },
    goals: {
      ...base.goals,
      ...((raw?.goals as Record<string, unknown>) ?? {}),
    },
    channels: Array.isArray(raw?.channels)
      ? (raw?.channels as unknown[]).filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    brand: {
      ...base.brand,
      ...((raw?.brand as Record<string, unknown>) ?? {}),
    },
  };
}

function previewValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not filled yet";
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => {
        if (typeof item === "string") return item.trim().length > 0;
        if (Array.isArray(item)) return item.length > 0;
        return Boolean(item);
      })
      .slice(0, 4);

    if (entries.length === 0) {
      return "Not filled yet";
    }

    return entries
      .map(
        ([key, item]) =>
          `${key}: ${String(Array.isArray(item) ? item.join(", ") : item)}`,
      )
      .join(" • ");
  }

  return value ? String(value) : "Not filled yet";
}

export default function AdminOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] =
    useState<SectionId>("company_profile");
  const [summary, setSummary] = useState({
    completedSections: 0,
    totalSections: 4,
    percentComplete: 0,
  });
  const [activeContext, setActiveContext] = useState<{
    tenantId: string | null;
    brandId: string | null;
    workspaceId: string | null;
  }>({
    tenantId: null,
    brandId: null,
    workspaceId: null,
  });

  const [drafts, setDrafts] = useState(() => emptySections());

  const currentIndex = STEP_ORDER.findIndex((step) => step.id === currentStep);
  const currentStepMeta = STEP_ORDER[currentIndex];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/onboarding", {
          cache: "no-store",
          credentials: "include",
        });

        const json = (await response.json()) as OnboardingResponse;

        if (!response.ok || !json.ok) {
          throw new Error(json.error || "Failed to load onboarding.");
        }

        if (!cancelled) {
          setDrafts(normalizeSections(json.sections));
          setSummary(json.summary);
          setActiveContext(json.activeContext);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateObjectField(
    section: "company_profile" | "goals" | "brand",
    key: string,
    value: string,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [key]: value,
      },
    }));
  }

  function toggleChannel(option: string) {
    setDrafts((prev) => {
      const current = new Set(prev.channels);

      if (current.has(option)) {
        current.delete(option);
      } else {
        current.add(option);
      }

      return {
        ...prev,
        channels: Array.from(current),
      };
    });
  }

  async function saveStep(stepId: SectionId) {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/admin/onboarding", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: stepId,
          value: drafts[stepId],
        }),
      });

      const json = (await response.json()) as OnboardingResponse;

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to save onboarding step.");
      }

      setDrafts(normalizeSections(json.sections));
      setSummary(json.summary);
      setActiveContext(json.activeContext);
      setMessage(
        `${STEP_ORDER.find((step) => step.id === stepId)?.label ?? "Step"} saved.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1].id);
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1].id);
    }
  }

  const summaryItems = useMemo(
    () =>
      STEP_ORDER.map((step) => ({
        ...step,
        preview: previewValue(drafts[step.id]),
      })),
    [drafts],
  );

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="oi-chip px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Guided onboarding
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Configure workspace context inside{" "}
                <span className="oi-brand-gradient">Oye !magine</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Capture company profile, business goals, preferred channels, and
                brand inputs for the active workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/admin"
                  className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Back to admin
                </a>
                <a
                  href="/admin/strategy"
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Open strategy
                </a>
              </div>
            </div>

            <div className="oi-card-soft p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Workspace scope
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Tenant ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">
                    {activeContext.tenantId ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Brand ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">
                    {activeContext.brandId ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Workspace ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">
                    {activeContext.workspaceId ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 oi-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Progress
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Workspace onboarding wizard
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {summary.completedSections} of {summary.totalSections} sections
                completed
              </p>
            </div>

            <div className="w-full max-w-xl">
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-pink-500 transition-all"
                  style={{ width: `${summary.percentComplete}%` }}
                />
              </div>
              <p className="mt-2 text-right text-sm font-semibold text-slate-700">
                {summary.percentComplete}% complete
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {STEP_ORDER.map((step, index) => {
              const isActive = step.id === currentStep;
              const stepNumber = index + 1;

              return (
                <button
                  key={step.id}
                  className={[
                    "rounded-3xl border px-4 py-4 text-left transition",
                    isActive
                      ? "border-indigo-300 bg-indigo-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                  onClick={() => setCurrentStep(step.id)}
                  type="button"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Step {stepNumber}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {step.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="mt-8 oi-card p-6 text-sm text-slate-600">
            Loading onboarding data...
          </div>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="oi-card p-6 sm:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current step
                </p>
                <h2 className="oi-section-title text-2xl">
                  {currentStepMeta.label}
                </h2>
                <p className="text-sm text-slate-500">
                  {currentStepMeta.description}
                </p>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                {currentStep === "company_profile" ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Business name
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.company_profile.businessName}
                          onChange={(e) =>
                            updateObjectField(
                              "company_profile",
                              "businessName",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Industry
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.company_profile.industry}
                          onChange={(e) =>
                            updateObjectField(
                              "company_profile",
                              "industry",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Team size
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.company_profile.teamSize}
                          onChange={(e) =>
                            updateObjectField(
                              "company_profile",
                              "teamSize",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Website
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.company_profile.website}
                          onChange={(e) =>
                            updateObjectField(
                              "company_profile",
                              "website",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Primary market
                      </span>
                      <input
                        className="oi-input px-4 py-3 text-sm"
                        value={drafts.company_profile.primaryMarket}
                        onChange={(e) =>
                          updateObjectField(
                            "company_profile",
                            "primaryMarket",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  </>
                ) : null}

                {currentStep === "goals" ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Primary objective
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.goals.primaryObjective}
                          onChange={(e) =>
                            updateObjectField(
                              "goals",
                              "primaryObjective",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Monthly revenue target
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.goals.monthlyRevenueTarget}
                          onChange={(e) =>
                            updateObjectField(
                              "goals",
                              "monthlyRevenueTarget",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Lead target
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.goals.leadTarget}
                          onChange={(e) =>
                            updateObjectField(
                              "goals",
                              "leadTarget",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Biggest challenge
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.goals.biggestChallenge}
                          onChange={(e) =>
                            updateObjectField(
                              "goals",
                              "biggestChallenge",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        90-day priority
                      </span>
                      <input
                        className="oi-input px-4 py-3 text-sm"
                        value={drafts.goals.ninetyDayPriority}
                        onChange={(e) =>
                          updateObjectField(
                            "goals",
                            "ninetyDayPriority",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  </>
                ) : null}

                {currentStep === "channels" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {CHANNEL_OPTIONS.map((option) => {
                      const selected = drafts.channels.includes(option);

                      return (
                        <button
                          key={option}
                          className={[
                            "rounded-3xl border px-4 py-4 text-left transition",
                            selected
                              ? "border-indigo-300 bg-indigo-50 text-slate-900 shadow-sm"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                          ].join(" ")}
                          onClick={() => toggleChannel(option)}
                          type="button"
                        >
                          <p className="text-sm font-semibold">{option}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {selected
                              ? "Selected for onboarding"
                              : "Click to include this channel"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {currentStep === "brand" ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Tone
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.brand.tone}
                          onChange={(e) =>
                            updateObjectField("brand", "tone", e.target.value)
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                          Audience
                        </span>
                        <input
                          className="oi-input px-4 py-3 text-sm"
                          value={drafts.brand.audience}
                          onChange={(e) =>
                            updateObjectField(
                              "brand",
                              "audience",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Value proposition
                      </span>
                      <input
                        className="oi-input px-4 py-3 text-sm"
                        value={drafts.brand.valueProposition}
                        onChange={(e) =>
                          updateObjectField(
                            "brand",
                            "valueProposition",
                            e.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Notes
                      </span>
                      <textarea
                        className="oi-textarea min-h-28 px-4 py-3 text-sm"
                        value={drafts.brand.notes}
                        onChange={(e) =>
                          updateObjectField("brand", "notes", e.target.value)
                        }
                      />
                    </label>
                  </>
                ) : null}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <button
                    className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentIndex === 0 || saving}
                    onClick={goBack}
                    type="button"
                  >
                    Back
                  </button>

                  <button
                    className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={
                      currentIndex === STEP_ORDER.length - 1 || saving
                    }
                    onClick={goNext}
                    type="button"
                  >
                    Next
                  </button>
                </div>

                <button
                  className="oi-button-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  onClick={() => saveStep(currentStep)}
                  type="button"
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="oi-card p-6">
                <h2 className="oi-section-title text-lg">
                  Completion summary
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="oi-card-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Completed
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {summary.completedSections}/{summary.totalSections}
                    </p>
                  </div>

                  <div className="oi-card-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workspace ID
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-900">
                      {activeContext.workspaceId ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="oi-card p-6">
                <h2 className="oi-section-title text-lg">Step summary</h2>

                <div className="mt-4 space-y-3">
                  {summaryItems.map((item, index) => (
                    <button
                      key={item.id}
                      className={[
                        "w-full rounded-3xl border p-4 text-left transition",
                        item.id === currentStep
                          ? "border-indigo-300 bg-indigo-50 text-slate-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                      ].join(" ")}
                      onClick={() => setCurrentStep(item.id)}
                      type="button"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {item.preview}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}