import Link from "next/link";
import { getNeejeeOnboardingSnapshotLive } from "@/lib/admin/neejee-live";
import { listToMultiline } from "@/lib/admin/neejee-editor-utils";
import AdminSaveButton from "@/app/admin/save-button";
import { saveOnboardingFormAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countItems(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

export default async function AdminOnboardingPage() {
  const snapshot: any = await getNeejeeOnboardingSnapshotLive();
  const workspace = snapshot.workspace ?? {};

  return (
    <main className="oi-stage-shell oi-editor-shell">
      <section className="oi-stage-hero oi-editor-hero">
        <div className="oi-stage-eyebrow">Neejee pilot</div>
        <h1>Onboarding command center</h1>
        <p>
          Update operational readiness, blockers, services, and integration notes for the live
          Neejee pilot workspace.
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
            {String(workspace.stageSummary ?? "Controlled activation preparation is in progress.")}
          </p>
        </article>

        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Live edit</div>
          <h2>Update onboarding workspace</h2>

          <form action={saveOnboardingFormAction} className="oi-editor-form">
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
                defaultValue={listToMultiline(snapshot.integrations, ["label", "title", "name"])}
              />
            </label>

            <div className="oi-editor-actions">
              <AdminSaveButton idleLabel="Save onboarding" pendingLabel="Saving onboarding..." />
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}