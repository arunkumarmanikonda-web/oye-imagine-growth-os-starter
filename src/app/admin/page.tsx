export default function AdminPage() {
  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>Oye !magine Admin</h1>
      <p>Authentication foundation is active. This route is protected by Supabase session middleware.</p>

      <ul style={{ lineHeight: 1.8 }}>
        <li>Login URL: <code>/login</code></li>
        <li>Bootstrap endpoint: <code>/api/bootstrap/admin</code></li>
        <li>Next build target: tenant bootstrap + seed workspace creation</li>
      </ul>
    </main>
  );
}