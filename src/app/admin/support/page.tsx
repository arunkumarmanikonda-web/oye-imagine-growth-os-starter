import Link from "next/link";
import {
  buildAdminStudioHardeningChecklist,
  buildPublishGovernanceRules,
  buildSupportEscalationPlan,
  getSupportOperationsSnapshot,
} from "@/lib/support/support-operations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminSupportPage() {
  const snapshot = getSupportOperationsSnapshot();
  const resendPlan = buildSupportEscalationPlan("resend");
  const mailLogPlan = buildSupportEscalationPlan("mail_log");
  const governance = buildPublishGovernanceRules();
  const hardening = buildAdminStudioHardeningChecklist();

  return (
    <main className="oi-shell">
      <div className="oi-main">
        <div className="oi-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="oi-stage-head">
            <div>
              <div className="oi-pill">Mega Batch A · A4</div>
              <h1 className="oi-page-title">Admin support operations</h1>
              <p className="oi-page-subtitle">
                Support operations, Resend runtime readiness, support mail-log visibility, and Batch A closure hardening.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="oi-btn oi-btn--secondary" href="/admin/content">
                Content studio
              </Link>
              <Link className="oi-btn oi-btn--secondary" href="/admin/config">
                Config control
              </Link>
              <a className="oi-btn oi-btn--primary" href="mailto:hello@oyeimagine.com">
                Escalate via hello@oyeimagine.com
              </a>
            </div>
          </div>

          <section className="oi-grid oi-grid--stats" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-kpi-label">Support channels</div>
              <div className="oi-kpi-value">{snapshot.channelCount}</div>
            </article>
            <article className="oi-card">
              <div className="oi-kpi-label">Mail-log entries</div>
              <div className="oi-kpi-value">{snapshot.mailSummary.total}</div>
            </article>
            <article className="oi-card">
              <div className="oi-kpi-label">Resend status</div>
              <div className="oi-kpi-value">{snapshot.resend.status}</div>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Support runtime</div>
              <div className="oi-meta-line" style={{ marginTop: 12 }}>
                <strong>Mailbox:</strong> {snapshot.supportMailbox}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Phone:</strong> {snapshot.primaryPhone}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Sender:</strong> {snapshot.resend.fromEmail}
              </div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {snapshot.resend.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Mail-log summary</div>
              <div className="oi-meta-line" style={{ marginTop: 12 }}>
                <strong>Queued:</strong> {snapshot.mailSummary.queued}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Delivered:</strong> {snapshot.mailSummary.delivered}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Failed:</strong> {snapshot.mailSummary.failed}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Inbound:</strong> {snapshot.mailSummary.inbound}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Outbound:</strong> {snapshot.mailSummary.outbound}
              </div>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Support escalation plan</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {resendPlan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                {mailLogPlan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Publish governance and hardening</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {governance.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                {hardening.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Channels</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {snapshot.channels.map((channel) => (
                  <li key={channel.key}>
                    <strong>{channel.label}</strong> · {channel.destination} · {channel.type}
                  </li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Batch A closure readiness</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {snapshot.batchClosureReadiness.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}