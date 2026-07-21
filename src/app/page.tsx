import { getSetupStatus } from "@/lib/setup-status";

export default function HomePage() {
  const status = getSetupStatus();
  const readyCount = status.ready;

  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>Oye !magine Growth OS Starter</h1>
      <p>
        Setup readiness: <strong>{readyCount}/{status.total}</strong>
      </p>

      <ul style={{ lineHeight: 1.8 }}>
        {status.checks.map((item) => (
          <li key={item.key}>
            <strong>{item.label}</strong>: {item.ready ? "Ready" : "Pending"} — {item.note}
          </li>
        ))}
      </ul>
    </main>
  );
}