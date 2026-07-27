import React from "react";
import Link from "next/link";

import RegenerateStrategyButton from "./regenerate-button";
import { generateStrategyBrief } from "@/lib/admin/strategy-generator";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

type StrategyPageProps = {
  params: Promise<{
    pilotId: string;
  }>;
};

function Value(props: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {props.label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950">{props.value}</p>
    </div>
  );
}

function StringList(props: { title: string; items: string[] }) {
  return (
    <section className="rounded-[28px] border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-950">{props.title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {props.items.map((item) => (
          <li key={item} className="rounded-[18px] bg-slate-50 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionCard(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="oi-card rounded-[28px] p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {props.title}
      </h2>
      <div className="mt-6">{props.children}</div>
    </section>
  );
}

export default async function AdminStrategyBriefPage({ params }: StrategyPageProps) {
  const { pilotId } = await params;
  const workspaceDisplayName = getWorkspaceDisplayName();
  const strategy = generateStrategyBrief(pilotId);

  return (
    <main className="oi-shell mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <section className="oi-card rounded-[32px] p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="oi-kicker">Strategy brief</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {strategy.brandName} strategy brief
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {workspaceDisplayName} operator view for positioning, messaging, channel priorities, and 30/60/90 day execution planning.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="oi-button-primary" href="/admin/strategy">
                Back to strategy hub
              </Link>
              <Link
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                href="/admin/pilot"
              >
                Open pilot summary
              </Link>
            </div>
          </div>

          <div className="min-w-[280px] rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Strategy status
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {strategy.status}
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Generated {new Date(strategy.generatedAt).toLocaleString()}
            </p>

            <div className="mt-6">
              <RegenerateStrategyButton pilotId={pilotId} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Value label="Pilot ID" value={strategy.pilotId} />
        <Value label="Brand" value={strategy.brandName} />
        <Value label="Workspace" value={strategy.workspaceDisplayName} />
        <Value label="Last updated" value={new Date(strategy.lastUpdatedAt).toLocaleString()} />
      </section>

      <SectionCard title="Positioning">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>{strategy.positioning}</p>
          <p>{strategy.offerSummary}</p>
          <p>{strategy.marketSummary}</p>
        </div>
      </SectionCard>

      <SectionCard title="Messaging pillars">
        <div className="grid gap-4 lg:grid-cols-3">
          {strategy.messagingPillars.map((pillar) => (
            <div key={pillar.title} className="rounded-[24px] border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{pillar.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Audience segments">
        <div className="grid gap-4 lg:grid-cols-2">
          {strategy.audienceSegments.map((segment) => (
            <div key={segment.name} className="rounded-[24px] border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{segment.name}</h3>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pain points
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {segment.painPoints.map((item) => (
                    <li key={item} className="rounded-[18px] bg-slate-50 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Buying signals
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {segment.buyingSignals.map((item) => (
                    <li key={item} className="rounded-[18px] bg-slate-50 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Channel recommendations">
        <div className="grid gap-4 lg:grid-cols-3">
          {strategy.channelRecommendations.map((entry) => (
            <div key={entry.channel} className="rounded-[24px] border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{entry.channel}</h3>
              <p className="mt-3 text-sm font-medium text-slate-900">{entry.objective}</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{entry.rationale}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-6 lg:grid-cols-3">
        <StringList
          title="30 days"
          items={strategy.plan30Days.flatMap((phase) => [phase.label, ...phase.actions])}
        />
        <StringList
          title="60 days"
          items={strategy.plan60Days.flatMap((phase) => [phase.label, ...phase.actions])}
        />
        <StringList
          title="90 days"
          items={strategy.plan90Days.flatMap((phase) => [phase.label, ...phase.actions])}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <StringList title="Success metrics" items={strategy.successMetrics} />
        <StringList title="Assumptions" items={strategy.assumptions} />
        <StringList title="Blockers" items={strategy.blockers} />
      </section>
    </main>
  );
}