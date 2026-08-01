import Link from "next/link";
import type { CmsFaq, CmsPersonProfile } from "@/lib/foundation/cms-types";
import type {
  LoginLaneModel,
  MarketplaceOfferCard,
  PublicHeroModel,
  SupportStripModel,
} from "@/lib/foundation/public-shell";

function SectionHeader(props: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="oi-pill">{props.eyebrow}</div>
      <h2 className="oi-page-title" style={{ marginTop: 12 }}>
        {props.title}
      </h2>
      <p className="oi-page-subtitle">{props.description}</p>
    </div>
  );
}

export function PublicHeroSection(props: { hero: PublicHeroModel; trustMarkers: string[] }) {
  const { hero, trustMarkers } = props;

  return (
    <section className="oi-container" style={{ paddingTop: 40, paddingBottom: 24 }}>
      <div className="oi-grid oi-grid--two">
        <article className="oi-card">
          <div className="oi-pill">{hero.eyebrow}</div>
          <h1 className="oi-page-title" style={{ marginTop: 12 }}>
            {hero.heading}
          </h1>
          <p className="oi-page-subtitle">{hero.subheading}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <a className="oi-btn oi-btn--primary" href={hero.primaryCtaHref}>
              {hero.primaryCtaLabel}
            </a>
            <Link className="oi-btn oi-btn--secondary" href={hero.secondaryCtaHref}>
              {hero.secondaryCtaLabel}
            </Link>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
            <div className="oi-meta-line">
              <strong>Email:</strong> {hero.supportEmail}
            </div>
            <div className="oi-meta-line">
              <strong>Phone:</strong> {hero.supportPhone}
            </div>
          </div>
        </article>

        <article className="oi-card">
          <div className="oi-card-title">Why this shell exists</div>
          <ul className="oi-list" style={{ marginTop: 12 }}>
            {trustMarkers.map((marker) => (
              <li key={marker}>{marker}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export function LoginLaneSection(props: { lanes: LoginLaneModel[] }) {
  return (
    <section className="oi-container" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <SectionHeader
        eyebrow="Access lanes"
        title="Separate client and admin entry points"
        description="Clean, explicit entry surfaces designed for separate operating roles."
      />
      <div className="oi-grid oi-grid--two">
        {props.lanes.map((lane) => (
          <article key={lane.key} className="oi-card">
            <div className="oi-card-title">{lane.title}</div>
            <p className="oi-page-subtitle" style={{ marginTop: 8 }}>
              {lane.summary}
            </p>
            <ul className="oi-list" style={{ marginTop: 12 }}>
              {lane.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div style={{ marginTop: 20 }}>
              <Link className="oi-btn oi-btn--primary" href={lane.href}>
                Open {lane.title}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceOfferSection(props: { offers: MarketplaceOfferCard[] }) {
  return (
    <section className="oi-container" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <SectionHeader
        eyebrow="Marketplace"
        title="Managed digital growth services"
        description="Promotions, service pillars, and CTA surfaces controlled from the admin foundation."
      />
      <div className="oi-grid oi-grid--three">
        {props.offers.map((offer) => (
          <article key={offer.slug} className="oi-card">
            <div className="oi-card-title">{offer.title}</div>
            <p className="oi-page-subtitle" style={{ marginTop: 8 }}>
              {offer.subtitle}
            </p>
            <div className="oi-meta-line" style={{ marginTop: 12 }}>
              <strong>Placement:</strong> {offer.placement}
            </div>
            <div style={{ marginTop: 20 }}>
              <a className="oi-btn oi-btn--secondary" href={offer.ctaHref}>
                {offer.ctaLabel}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PeopleColumn(props: { title: string; description: string; profiles: CmsPersonProfile[] }) {
  return (
    <article className="oi-card">
      <div className="oi-card-title">{props.title}</div>
      <p className="oi-page-subtitle" style={{ marginTop: 8 }}>
        {props.description}
      </p>
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        {props.profiles.map((profile) => (
          <div key={profile.slug} className="oi-card" style={{ background: "rgba(255,255,255,0.55)" }}>
            <div className="oi-card-title">{profile.displayName}</div>
            <div className="oi-meta-line">{profile.title}</div>
            <div className="oi-meta-line">{profile.team}</div>
            <p className="oi-page-subtitle" style={{ marginTop: 8 }}>
              {profile.bio}
            </p>
            <ul className="oi-list" style={{ marginTop: 12 }}>
              {profile.expertise.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {profile.ctaHref ? (
              <div style={{ marginTop: 16 }}>
                <a className="oi-btn oi-btn--secondary" href={profile.ctaHref}>
                  {profile.ctaLabel ?? "Contact"}
                </a>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

export function PeopleDirectorySection(props: {
  leadership: CmsPersonProfile[];
  experts: CmsPersonProfile[];
}) {
  return (
    <section className="oi-container" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <SectionHeader
        eyebrow="People and expertise"
        title="Leadership and expert surfaces"
        description="Every visible people block is intended to become CMS-editable and publish-controlled."
      />
      <div className="oi-grid oi-grid--two">
        <PeopleColumn
          title="Leadership"
          description="Executive and leadership blocks."
          profiles={props.leadership}
        />
        <PeopleColumn
          title="Experts"
          description="Digital marketing, analytics, and delivery specialists."
          profiles={props.experts}
        />
      </div>
    </section>
  );
}

export function FaqSection(props: { faqs: CmsFaq[] }) {
  return (
    <section className="oi-container" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <SectionHeader
        eyebrow="FAQ"
        title="Core service and support answers"
        description="Public FAQ content prepared for CMS-backed governance."
      />
      <div style={{ display: "grid", gap: 14 }}>
        {props.faqs.map((faq) => (
          <article key={faq.slug} className="oi-card">
            <div className="oi-card-title">{faq.question}</div>
            <p className="oi-page-subtitle" style={{ marginTop: 8 }}>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SupportStrip(props: { support: SupportStripModel }) {
  return (
    <section className="oi-container" style={{ paddingTop: 8, paddingBottom: 40 }}>
      <article className="oi-card">
        <div className="oi-card-title">Contact, CTA, and support</div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12 }}>
          <div className="oi-meta-line">
            <strong>Email:</strong> {props.support.primaryEmail}
          </div>
          <div className="oi-meta-line">
            <strong>Phone:</strong> {props.support.primaryPhone}
          </div>
        </div>
        <ul className="oi-list" style={{ marginTop: 14 }}>
          {props.support.supportChannels.map((channel) => (
            <li key={channel}>{channel}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export function AuthFormShell(props: {
  lane: "client" | "admin";
  eyebrow: string;
  title: string;
  summary: string;
  supportEmail: string;
  supportPhone: string;
  helpHref: string;
  helpLabel: string;
  redirectTo: string;
}) {
  return (
    <section className="oi-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="oi-grid oi-grid--two">
        <article className="oi-card">
          <div className="oi-pill">{props.eyebrow}</div>
          <h1 className="oi-page-title" style={{ marginTop: 12 }}>
            {props.title}
          </h1>
          <p className="oi-page-subtitle">{props.summary}</p>

          <form method="post" action="/api/auth/session" style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <input type="hidden" name="lane" value={props.lane} />
            <input type="hidden" name="redirectTo" value={props.redirectTo} />

            <label className="oi-meta-line">
              <strong>Email</strong>
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.12)" }}
              />
            </label>

            <label className="oi-meta-line">
              <strong>Password</strong>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.12)" }}
              />
            </label>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <button className="oi-btn oi-btn--primary" type="submit">
                Continue to {props.lane === "admin" ? "admin workspace" : "client dashboard"}
              </button>
              <a className="oi-btn oi-btn--secondary" href={props.helpHref}>
                {props.helpLabel}
              </a>
            </div>
          </form>
        </article>

        <article className="oi-card">
          <div className="oi-card-title">Support and access help</div>
          <div className="oi-meta-line" style={{ marginTop: 12 }}>
            <strong>Email:</strong> {props.supportEmail}
          </div>
          <div className="oi-meta-line" style={{ marginTop: 8 }}>
            <strong>Phone:</strong> {props.supportPhone}
          </div>
          <ul className="oi-list" style={{ marginTop: 16 }}>
            <li>Separate client and admin surfaces</li>
            <li>Protected routing is active for client and admin lanes</li>
            <li>Canonical legal identity is already loaded</li>
          </ul>
        </article>
      </div>
    </section>
  );
}