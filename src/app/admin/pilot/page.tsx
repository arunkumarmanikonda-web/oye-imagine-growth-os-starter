import Link from "next/link";
import { getNeejeePilotControlSnapshotLive } from "@/lib/admin/neejee-live";
import { listToMultiline } from "@/lib/admin/neejee-editor-utils";
import AdminSaveButton from "@/app/admin/save-button";
import { savePilotFormAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countItems(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function firstAction(snapshot: any) {
  return Array.isArray(snapshot?.nextActions) && snapshot.nextActions.length > 0
    ? snapshot.nextActions[0]
    : null;
}

export default async function AdminPilotPage() {
  const snapshot: any = await getNeejeePilotControlSnapshotLive();
  const action = firstAction(snapshot);

  return (
    <main className="oi-stage-shell oi-editor-shell">
      <section className="oi-stage-hero oi-editor-hero">
        <div className="oi-stage-eyebrow">Neejee pilot</div>
        <h1>Unified pilot control tower</h1>
        <p>
          Update the live leadership brief and next guided action without breaking the pilot
          progression contract.
        </p>
        <div className="oi-editor-nav">
          <Link href="/admin/onboarding" className="oi-stage-button-secondary">
            Onboarding
          </Link>
          <Link href="/admin/brand-intelligence" className="oi-stage-button-ghost">
            Brand intelligence
          </Link>
        </div>
      </section>

      <section className="oi-editor-grid">
        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Current pilot state</div>
          <h2>Leadership signals</h2>
          <div className="oi-editor-stat-grid">
            <article className="oi-editor-stat">
              <span>Owner</span>
              <strong>{String(snapshot.workspace?.owner ?? "Neejee founder")}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Stages</span>
              <strong>{countItems(snapshot.stages)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Next actions</span>
              <strong>{countItems(snapshot.nextActions)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Brief lines</span>
              <strong>{countItems(snapshot.executiveBrief)}</strong>
            </article>
          </div>
          <p className="oi-editor-note">
            {Array.isArray(snapshot.executiveBrief) && snapshot.executiveBrief.length > 0
              ? String(snapshot.executiveBrief[0])
              : "Pilot brief not yet defined."}
          </p>
        </article>

        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Live edit</div>
          <h2>Update pilot control</h2>

          <form action={savePilotFormAction} className="oi-editor-form">
            <label className="oi-editor-field">
              <span>Workspace owner</span>
              <input name="owner" defaultValue={String(snapshot.workspace?.owner ?? "")} />
            </label>

            <label className="oi-editor-field">
              <span>Executive brief</span>
              <textarea
                name="executiveBrief"
                rows={7}
                defaultValue={listToMultiline(snapshot.executiveBrief)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Primary next-action label</span>
              <input name="nextActionLabel" defaultValue={String(action?.label ?? "")} />
            </label>

            <label className="oi-editor-field">
              <span>Primary next-action detail</span>
              <textarea
                name="nextActionDetail"
                rows={4}
                defaultValue={String(action?.detail ?? "")}
              />
            </label>

            <label className="oi-editor-field">
              <span>Primary next-action href</span>
              <input name="nextActionHref" defaultValue={String(action?.href ?? "/admin/pilot")} />
            </label>

            <div className="oi-editor-actions">
              <AdminSaveButton idleLabel="Save pilot control" pendingLabel="Saving pilot..." />
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}