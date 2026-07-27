import React from "react";
import { generateGoogleAdsDraft } from "@/lib/admin/google-ads-generator";
import { getGoogleAdsDraft } from "@/lib/admin/google-ads-store";
import { RegenerateButton } from "./regenerate-button";

type GoogleAdsPageProps = {
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

export default async function AdminGoogleAdsDetailPage({ params }: GoogleAdsPageProps) {
  const resolvedParams = await params;
  const pilotId = resolvedParams.pilotId;

  const existing = getGoogleAdsDraft();
  const existingRecord = asRecord(existing);

  const googleAdsDraft =
    existingRecord.pilotId === pilotId
      ? existing
      : generateGoogleAdsDraft({ pilotId, forceRegenerate: true });

  const record = asRecord(googleAdsDraft);

  const workspaceDisplayName = readString(record.workspaceDisplayName, "Oye Imagine");
  const brandName = readString(record.brandName, "Neejee Clinics");
  const status = readString(record.status, "draft");
  const objective = readString(record.objective, "No objective available.");
  const landingPageUrl = readString(record.landingPageUrl, "/landing/neejee-pilot");
  const budgetDailyUsd =
    typeof record.budgetDailyUsd === "number" ? record.budgetDailyUsd : 0;

  const geoTargets = asArray<string>(record.geoTargets);
  const sitelinks = asArray<string>(record.sitelinks);
  const keywordClusters = asArray(record.keywordClusters);
  const adCopy = asArray(record.adCopy);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {workspaceDisplayName} Google Ads draft
            </p>
            <h1 className="text-3xl font-semibold text-neutral-950">
              {brandName} Google Ads campaign
            </h1>
            <p className="max-w-3xl text-sm text-neutral-600">{objective}</p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
              {status}
            </span>
            <RegenerateButton pilotId={pilotId} />
          </div>
        </div>

        <dl className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Brand</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{brandName}</dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Pilot ID</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{pilotId}</dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Daily budget</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">${budgetDailyUsd}</dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Landing page</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{landingPageUrl}</dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Geo targets</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {geoTargets.length > 0 ? (
              geoTargets.map((target, index) => (
                <span
                  key={`${target}-${index}`}
                  className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
                >
                  {target}
                </span>
              ))
            ) : (
              <p className="text-sm text-neutral-600">No geo targets available.</p>
            )}
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Sitelinks
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {sitelinks.length > 0 ? (
              sitelinks.map((sitelink, index) => (
                <span
                  key={`${sitelink}-${index}`}
                  className="inline-flex rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700"
                >
                  {sitelink}
                </span>
              ))
            ) : (
              <p className="text-sm text-neutral-600">No sitelinks available.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Campaign summary</h2>
          <dl className="mt-4 space-y-4 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-900">Objective</dt>
              <dd>{objective}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Status</dt>
              <dd>{status}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-900">Landing page URL</dt>
              <dd>{landingPageUrl}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">Keyword clusters</h2>
        <div className="mt-4 grid gap-4">
          {keywordClusters.length > 0 ? (
            keywordClusters.map((cluster, index) => {
              const item = asRecord(cluster);
              const keywords = asArray<string>(item.keywords);
              return (
                <article
                  key={`${readString(item.theme, "cluster")}-${index}`}
                  className="rounded-lg border border-neutral-200 p-4"
                >
                  <h3 className="text-base font-semibold text-neutral-900">
                    {readString(item.theme, "Untitled cluster")}
                  </h3>
                  {keywords.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                      {keywords.map((keyword, keywordIndex) => (
                        <li key={`${keyword}-${keywordIndex}`}>{keyword}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-600">No keywords available.</p>
                  )}
                </article>
              );
            })
          ) : (
            <p className="text-sm text-neutral-600">No keyword clusters available.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">Ad copy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {adCopy.length > 0 ? (
            adCopy.map((ad, index) => {
              const item = asRecord(ad);
              return (
                <article
                  key={`${readString(item.headline1, "ad-copy")}-${index}`}
                  className="rounded-lg border border-neutral-200 p-4"
                >
                  <p className="text-sm font-semibold text-neutral-900">
                    {readString(item.headline1, "Headline 1")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-700">
                    {readString(item.headline2, "Headline 2")}
                  </p>
                  <p className="mt-3 text-sm text-neutral-700">
                    {readString(item.description1, "Description 1")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">
                    {readString(item.description2, "Description 2")}
                  </p>
                </article>
              );
            })
          ) : (
            <p className="text-sm text-neutral-600">No ad copy available.</p>
          )}
        </div>
      </section>
    </main>
  );
}