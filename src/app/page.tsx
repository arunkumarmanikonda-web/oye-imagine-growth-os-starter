import { getSetupStatus } from '@/lib/setup-status';

export default function HomePage() {
  const status = getSetupStatus();
  const readyCount = status.filter((item) => item.ready).length;

  return (
    <main>
      <section className="hero">
        <div className="kicker">Oye !magine · build starter</div>
        <h1>Vercel + Supabase + Resend + SMS + WhatsApp starter</h1>
        <p>
          This starter gives you the first buildable foundation for the Oye !magine Growth OS web app.
          It is prepared for GitHub → Vercel deployment, Supabase SQL/Auth integration, Resend email,
          Twilio SMS, and Meta WhatsApp Cloud API messaging.
        </p>
        <div className={`badge ${readyCount >= 4 ? 'ok' : 'note'}`}>Setup readiness: {readyCount}/{status.length}</div>
      </section>

      <section className="grid">
        {status.map((item) => (
          <div className="card" key={item.key}>
            <div className={`badge ${item.ready ? 'ok' : 'missing'}`}>{item.ready ? 'Ready' : 'Missing'}</div>
            <h3>{item.label}</h3>
            <p>{item.note}</p>
          </div>
        ))}
      </section>

      <section className="section card">
        <h2>Important setup note</h2>
        <p>
          Resend is for email. This starter keeps email on Resend, SMS on Twilio, and WhatsApp on Meta Cloud API.
          For India production SMS you still need DLT-compliant sender setup before live campaigns.
        </p>
      </section>

      <section className="section card">
        <h2>Immediate next actions</h2>
        <table className="table small">
          <thead>
            <tr>
              <th>Step</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Create GitHub repo and push this scaffold.</td></tr>
            <tr><td>2</td><td>Import the repo into Vercel and set project environment variables.</td></tr>
            <tr><td>3</td><td>Create Supabase project and run <code>supabase/migrations/0001_core.sql</code>.</td></tr>
            <tr><td>4</td><td>Verify your sending domain in Resend and set the API key.</td></tr>
            <tr><td>5</td><td>Configure Twilio sender or messaging service for SMS.</td></tr>
            <tr><td>6</td><td>Configure Meta WhatsApp Cloud API test phone + webhook callback.</td></tr>
          </tbody>
        </table>
      </section>

      <section className="section card">
        <h2>Available endpoints</h2>
        <pre>{`GET  /api/health
GET  /api/setup/check
POST /api/test/email     { to, subject, html }
POST /api/test/sms       { to, body }
POST /api/test/whatsapp  { to, body }
GET  /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
POST /api/webhooks/whatsapp`}</pre>
      </section>
    </main>
  );
}
