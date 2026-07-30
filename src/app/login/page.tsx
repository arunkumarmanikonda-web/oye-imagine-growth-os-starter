import { LoginLaneSection, SupportStrip } from "@/components/foundation/public-shell";
import { buildLoginLaneModels, buildSupportStripModel } from "@/lib/foundation/public-shell";

export default function LoginPage() {
  return (
    <>
      <section className="oi-container" style={{ paddingTop: 40, paddingBottom: 12 }}>
        <article className="oi-card">
          <div className="oi-pill">Access</div>
          <h1 className="oi-page-title" style={{ marginTop: 12 }}>
            Choose the right access surface
          </h1>
          <p className="oi-page-subtitle">
            Client and admin entry points are now visually separated so the public shell no longer mixes marketplace and operator intent.
          </p>
        </article>
      </section>

      <LoginLaneSection lanes={buildLoginLaneModels()} />
      <SupportStrip support={buildSupportStripModel()} />
    </>
  );
}