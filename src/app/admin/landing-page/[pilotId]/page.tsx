import React from "react";
import { generateLandingPageBrief } from "@/lib/admin/landing-page-generator";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import { RegenerateButton } from "./regenerate-button";

type LandingPageProps = {
  params: Promise<{
    pilotId: string;
  }>;
};

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}

function asArray<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export default async function AdminLandingPageDetail({ params }: LandingPageProps) {
  const resolvedParams = await params;
  const pilotId = resolvedParams.pilotId;

  const existing = getLandingPageBrief();
  const existingRecord = asRecord(existing);

  const landingPage =
    existingRecord.pilotId === pilotId
      ? existing
      : generateLandingPageBrief({ pilotId, forceRegenerate: true });

  const record = asRecord(landingPage);
  const hero = asRecord(record.hero);
  const seo = asRecord(record.seo);
  const generatedFrom = asRecord(record.generatedFrom);

  const ctas = asArray(record.ctas);
  const sections = asArray(record.sections);
  const proofPoints = asArray(record.proofPoints);
  const assets = asArray(record.assets);

  const workspaceDisplayName = readString(record.workspaceDisplayName, "Oye Imagine");
  const brandName = readString(record.brandName, "Neejee Clinics");
  const status = readString(record.status, "draft");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {workspaceDisplayName} landing page brief
            </p>
            <h1 className="text-3xl font-semibold text-neutral-950">
              {readString(hero.headline, `${brandName} landing page brief`)}
            </h1>
            <p className="max-w-3xl text-sm text-neutral-600">
              {readString(
                hero.subheadline,
                "Landing page brief generated from pilot and strategy inputs.",
              )}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
              {status}
            </span>
            <RegenerateButton pilotId={pilotId} />
          </div>
        </div>

        <dl className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Brand</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{brandName}</dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Pilot ID</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{pilotId}</dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Primary CTA</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">
              {readString(hero.primaryCta, "Book a consultation")}
            </dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Positioning</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            {readString(record.positioningStatement, "No positioning statement available.")}
          </p>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Audience summary
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            {readString(record.audienceSummary, "No audience summary available.")}
          </p>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Objective
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            {readString(record.objective, "No objective available.")}
          </p>
        </article>

        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">SEO</h2>
          <dl className="mt-4 space-y-4 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Title</dt>
              <dd>{readString(seo.title, "Not set")}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Description</dt>
              <dd>{readString(seo.description, "Not set")}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Keywords</dt>
              <dd>{asArray<string>(seo.keywords).join(", ") || "Not set"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">Calls to action</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {ctas.length > 0 ? (
            ctas.map((cta, index) => {
              const item = asRecord(cta);
              return (
                <div key={`${readString(item.label, "cta")}-${index}`} className="rounded-lg border border-neutral-200 p-4">
                  <p className="text-sm font-medium text-neutral-900">{readString(item.label, "Untitled CTA")}</p>
                  <p className="mt-1 text-sm text-neutral-600">{readString(item.href, "#")}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                    {readString(item.variant, "primary")}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-neutral-600">No CTAs available.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">Page sections</h2>
        <div className="mt-4 grid gap-4">
          {sections.length > 0 ? (
            sections.map((section, index) => {
              const item = asRecord(section);
              const bullets = asArray<string>(item.bullets);
              return (
                <article key={`${readString(item.id, "section")}-${index}`} className="rounded-lg border border-neutral-200 p-4">
                  <h3 className="text-base font-semibold text-neutral-900">
                    {readString(item.title, "Untitled section")}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    {readString(item.description, "No description available.")}
                  </p>
                  {bullets.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                      {bullets.map((bullet, bulletIndex) => (
                        <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="text-sm text-neutral-600">No page sections available.</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Proof points</h2>
          <div className="mt-4 space-y-4">
            {proofPoints.length > 0 ? (
              proofPoints.map((proofPoint, index) => {
                const item = asRecord(proofPoint);
                return (
                  <div key={`${readString(item.label, "proof")}-${index}`} className="rounded-lg border border-neutral-200 p-4">
                    <p className="text-sm font-medium text-neutral-900">
                      {readString(item.label, "Untitled proof point")}
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {readString(item.value, "No value available.")}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-600">No proof points available.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Assets and generation context</h2>

          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Assets
          </h3>
          <div className="mt-3 space-y-3">
            {assets.length > 0 ? (
              assets.map((asset, index) => {
                const item = asRecord(asset);
                return (
                  <div key={`${readString(item.label, "asset")}-${index}`} className="rounded-lg border border-neutral-200 p-4">
                    <p className="text-sm font-medium text-neutral-900">
                      {readString(item.label, "Untitled asset")}
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">{readString(item.type, "asset")}</p>
                    <p className="mt-1 text-sm text-neutral-600">{readString(item.url, "No URL available")}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-600">No assets available.</p>
            )}
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Generated from
          </h3>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Strategy status</dt>
              <dd>{readString(generatedFrom.strategyStatus, "Not set")}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Strategy updated</dt>
              <dd>{readString(generatedFrom.strategyUpdatedAt, "Not set")}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Pilot updated</dt>
              <dd>{readString(generatedFrom.pilotUpdatedAt, "Not set")}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}