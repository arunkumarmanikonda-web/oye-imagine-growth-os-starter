import { FormFlash } from "@/app/admin/form-flash";
import { ActionButton } from "@/app/admin/action-button";
import Link from "next/link";
import { getNeejeeBrandIntelligenceSnapshotLive } from "@/lib/admin/neejee-live";
import { listToMultiline } from "@/lib/admin/neejee-editor-utils";
import AdminSaveButton from "@/app/admin/save-button";
import { submitBrandIntelligenceEditorAction } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countItems(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

export default async function BrandIntelligencePage() {
  const snapshot: any = await getNeejeeBrandIntelligenceSnapshotLive();

  return (
    <main className="oi-stage-shell oi-editor-shell">
      <section className="oi-stage-hero oi-editor-hero">
        <div className="oi-stage-eyebrow">Neejee pilot</div>
        <h1>Brand intelligence workspace</h1>
        <p>
          Refine live positioning, language rules, and audience signals while preserving the
          approved API contract.
        </p>
        <div className="oi-editor-nav">
          <Link href="/admin/onboarding" className="oi-stage-button-secondary">
            Onboarding
          </Link>
          <Link href="/admin/pilot" className="oi-stage-button-ghost">
            Pilot control tower
          </Link>
        </div>
      </section>

      <section className="oi-editor-grid">
        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Current profile</div>
          <h2>Brand posture</h2>
          <div className="oi-editor-stat-grid">
            <article className="oi-editor-stat">
              <span>Profile status</span>
              <strong>{String(snapshot.profileStatus ?? "review_required")}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Approved language</span>
              <strong>{countItems(snapshot.approvedLanguage)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Prohibited language</span>
              <strong>{countItems(snapshot.prohibitedLanguage)}</strong>
            </article>
            <article className="oi-editor-stat">
              <span>Audience cues</span>
              <strong>{countItems(snapshot.audienceArchetypes)}</strong>
            </article>
          </div>
          <p className="oi-editor-note">
            {String(snapshot.positioning?.essence ?? "FOUND. PERSONAL.")}
          </p>
        </article>

        <article className="oi-editor-panel">
          <div className="oi-stage-eyebrow">Live edit</div>
          <h2>Update brand intelligence</h2>

          <FormFlash />
<form action={submitBrandIntelligenceEditorAction} className="oi-editor-form">
            <label className="oi-editor-field">
              <span>Profile status</span>
              <input name="profileStatus" defaultValue={String(snapshot.profileStatus ?? "")} />
            </label>

            <label className="oi-editor-field">
              <span>Brand essence</span>
              <textarea
                name="essence"
                rows={4}
                defaultValue={String(snapshot.positioning?.essence ?? "")}
              />
            </label>

            <label className="oi-editor-field">
              <span>Approved language</span>
              <textarea
                name="approvedLanguage"
                rows={5}
                defaultValue={listToMultiline(snapshot.approvedLanguage)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Prohibited language</span>
              <textarea
                name="prohibitedLanguage"
                rows={5}
                defaultValue={listToMultiline(snapshot.prohibitedLanguage)}
              />
            </label>

            <label className="oi-editor-field">
              <span>Audience archetypes</span>
              <textarea
                name="audienceArchetypes"
                rows={5}
                defaultValue={listToMultiline(snapshot.audienceArchetypes)}
              />
            </label>

            <div className="oi-editor-actions">
              <div className="admin-action-row">
  <label className="admin-publish-confirm">
    <input type="checkbox" name="confirmPublish" value="yes" />
    <span>Publishing confirms this workspace is ready for downstream admin use.</span>
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