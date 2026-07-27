import { FormFlash } from "@/app/admin/form-flash";
import { ActionButton } from "@/app/admin/action-button";
import Link from "next/link";

import { getPilot } from "@/lib/admin/pilot-store";
import { listToMultiline } from "@/lib/admin/workspace-editor-utils";
import { getWorkspaceOnboardingSnapshotLive } from "@/lib/admin/workspace-live";
import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";
import { submitOnboardingEditorAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countItems(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

export default async function AdminOnboardingPage() {
  const snapshot: any = await getWorkspaceOnboardingSnapshotLive();
  const pilot = getPilot();
  const workspaceName = getWorkspaceDisplayName();
  const workspaceLabel = getWorkspaceSurfaceLabel("onboarding", workspaceName);
  const workspace = snapshot.workspace ?? {};

  return (
    <main className="oi-stage-shell oi-editor-shell">
      <section className="oi-stage-hero oi-editor-hero">
        <div className="oi-stage-eyebrow">{workspaceLabel}</div>
        <h1>Onboarding command center</h1>
        <p>
          Update operational readiness, blockers, services, integration notes,
          and the persisted Neejee pilot profile for the current workspace.
        </p>
        <div className="oi-editor-nav">
          <Link href="/admin/brand-intelligence" className="oi-stage-button-secondary">
            Brand intelligence
          </Link>
          <Link href="/admin/pilot" className="oi-stage-button-ghost">
            Pilot control tower
          </Link>
        </div>
      </section>

      <section className="oi-editor-grid">
        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Current workspace</div>
          <h2>Activation snapshot</h2>
          <div className="oi-editor-stat-grid">
            <article className="oi-editor-stat">
              <span>Owner</span>
              <strong>{String(workspace.owner ?? "Neejee founder")}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Blockers</span>
              <strong>{countItems(snapshot.blockers)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Services</span>
              <strong>{countItems(snapshot.services)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Integrations</span>
              <strong>{countItems(snapshot.integrations)}</strong>
            </article>
          </div>
          <p className="oi-editor-note">
            {String(
              workspace.stageSummary ??
                "Controlled activation preparation is in progress.",
            )}
          </p>

          <div className="oi-editor-stat-grid">
            <article className="oi-editor-stat">
              <span>Pilot brand</span>
              <strong>{pilot.brandName || "Neejee"}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Pilot status</span>
              <strong>{pilot.status}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Channels</span>
              <strong>{pilot.primaryChannels.length}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Goals</span>
              <strong>{pilot.goals.length}</strong>
            </article>
          </div>
        </article>

        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Live edit</div>
          <h2>Update onboarding workspace</h2>

          <FormFlash />
          <form action={submitOnboardingEditorAction} className="oi-editor-form">
            <label className="oi-editor-field">
              <span>Workspace owner</span>
              <input name="owner" defaultValue={String(workspace.owner ?? "")} />
            </label>

            <label className="oi-editor-field">
              <span>Stage summary</span>
              <textarea
                name="stageSummary"
                rows={4}
                defaultValue={String(workspace.stageSummary ?? "")}
              />
            </label>

            <label className="oi-editor-field">
              <span>Pilot brand name</span>
              <input name="pilotBrandName" defaultValue={pilot.brandName} />
            </label>

            <label className="oi-editor-field">
              <span>Pilot website</span>
              <input name="pilotWebsite" defaultValue={pilot.website} />
            </label>

            <label className="oi-editor-field">
              <span>Industry</span>
              <input name="pilotIndustry" defaultValue={pilot.industry} />
            </label>

            <label className="oi-editor-field">
              <span>Geo</span>
              <input name="pilotGeo" defaultValue={pilot.geo} />
            </label>

            <label className="oi-editor-field">
              <span>Target audience</span>
              <textarea
                name="pilotTargetAudience"
                rows={4}
                defaultValue={pilot.targetAudience}
              />
            </label>

            <label className="oi-editor-field">
              <span>Offer</span>
              <textarea
                name="pilotOffer"
                rows={4}
                defaultValue={pilot.offer}
              />
            </label>

            <label className="oi-editor-field">
              <span>Monthly budget</span>
              <input
                name="pilotMonthlyBudget"
                defaultValue={pilot.monthlyBudget}
              />
            </label>

            <label className="oi-editor-field">
              <span>Pilot status</span>
              <select name="pilotStatus" defaultValue={pilot.status}>
                <option value="draft">draft</option>
                <option value="in_progress">in_progress</option>
                <option value="ready_for_review">ready_for_review</option>
                <option value="approved">approved</option>
              </select>
            </label>

            <label className="oi-editor-field">
              <span>Primary channels</span>
              <textarea
                name="pilotPrimaryChannels"
                rows={4}
                defaultValue={listToMultiline(pilot.primaryChannels)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Competitors</span>
              <textarea
                name="pilotCompetitors"
                rows={4}
                defaultValue={listToMultiline(pilot.competitors)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Goals</span>
              <textarea
                name="pilotGoals"
                rows={4}
                defaultValue={listToMultiline(pilot.goals)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Success metrics</span>
              <textarea
                name="pilotSuccessMetrics"
                rows={4}
                defaultValue={listToMultiline(pilot.successMetrics)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Blockers</span>
              <textarea
                name="blockers"
                rows={6}
                defaultValue={listToMultiline(snapshot.blockers)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Tasks</span>
              <textarea
                name="tasks"
                rows={6}
                defaultValue={listToMultiline(snapshot.tasks)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Services</span>
              <textarea
                name="services"
                rows={5}
                defaultValue={listToMultiline(snapshot.services, ["label", "title", "name"])}
              />
            </label>

            <label className="oi-editor-field">
              <span>Integrations</span>
              <textarea
                name="integrations"
                rows={5}
                defaultValue={listToMultiline(
                  snapshot.integrations,
                  ["label", "title", "name"],
                )}
              />
            </label>

            <div className="oi-editor-actions">
              <div className="admin-action-row">
                <label className="admin-publish-confirm">
                  <input type="checkbox" name="confirmPublish" value="yes" />
                  <span>
                    Publishing confirms this workspace is ready for downstream
                    admin use.
                  </span>
                </label>

                <div className="admin-action-row__buttons">
                  <ActionButton
                    label="Save draft"
                    pendingLabel="Saving draft..."
                    variant="secondary"
                    name="intent"
                    value="save"
                  />
                  <ActionButton
                    label="Publish"
                    pendingLabel="Publishing..."
                    variant="primary"
                    name="intent"
                    value="publish"
                  />
                </div>
              </div>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}