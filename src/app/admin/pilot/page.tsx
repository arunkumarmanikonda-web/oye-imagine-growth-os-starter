import React from "react";

import { getPilot } from "@/lib/admin/pilot-store";
import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";

function FieldList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <section className="oi-admin-card">
      <div className="oi-admin-card-label">{title}</div>
      {items.length > 0 ? (
        <ul className="oi-admin-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="oi-admin-muted">{emptyLabel}</p>
      )}
    </section>
  );
}

function Value({
  label,
  value,
  emptyLabel = "Not set",
}: {
  label: string;
  value: string;
  emptyLabel?: string;
}) {
  return (
    <section className="oi-admin-card">
      <div className="oi-admin-card-label">{label}</div>
      <p>{value.trim().length > 0 ? value : emptyLabel}</p>
    </section>
  );
}

export default function AdminPilotPage() {
  const workspaceDisplayName = getWorkspaceDisplayName();
  const workspaceLabel = getWorkspaceSurfaceLabel("pilot");
  const pilot = getPilot();

  return (
    <main className="oi-page-shell oi-admin-page">
      <div className="oi-page-head">
        <p className="oi-stage-eyebrow">Workspace: {workspaceDisplayName}</p>
        <h1>{workspaceLabel}</h1>
        <p className="oi-page-subtitle">
          Persisted Neejee pilot profile, execution context, and readiness state.
        </p>
      </div>

      <section className="oi-admin-grid">
        <Value label="Pilot ID" value={pilot.id} />
        <Value label="Brand name" value={pilot.brandName} />
        <Value label="Website" value={pilot.website} />
        <Value label="Industry" value={pilot.industry} />
        <Value label="Geo" value={pilot.geo} />
        <Value label="Target audience" value={pilot.targetAudience} />
        <Value label="Offer" value={pilot.offer} />
        <Value label="Monthly budget" value={pilot.monthlyBudget} />
        <Value label="Status" value={pilot.status} />
        <Value label="Last updated" value={pilot.lastUpdatedAt} />
      </section>

      <section className="oi-admin-grid">
        <FieldList
          title="Primary channels"
          items={pilot.primaryChannels}
          emptyLabel="No channels selected"
        />
        <FieldList
          title="Competitors"
          items={pilot.competitors}
          emptyLabel="No competitors recorded"
        />
        <FieldList
          title="Goals"
          items={pilot.goals}
          emptyLabel="No goals recorded"
        />
        <FieldList
          title="Success metrics"
          items={pilot.successMetrics}
          emptyLabel="No success metrics recorded"
        />
      </section>
    </main>
  );
}