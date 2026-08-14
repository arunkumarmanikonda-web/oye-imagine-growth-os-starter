import Link from 'next/link'
import { getContactExperience } from '../../lib/recovery/public-premium-experience'

export default function ContactPage() {
  const experience = getContactExperience()
  return (
    <main className="premium-page-shell">
      <section className="premium-contact-hero">
        <div><p className="premium-eyebrow">Contact Oye !magine</p><h1>Tell us what growth should feel like from your side of the table.</h1><p>{experience.intro}</p><div className="contact-channel-grid">{experience.supportChannels.map((channel) => <a key={channel.label} href={channel.href}><small>{channel.label}</small><strong>{channel.value}</strong><span>{channel.supportWindow}</span><b>↗</b></a>)}</div></div>
        <aside className="contact-conversation-card"><div className="conversation-head"><span className="conversation-avatar">O!</span><div><strong>Oye concierge</strong><small>Business & platform enquiries</small></div><i /></div><div className="conversation-bubble incoming">What are you trying to change about the way your brand grows?</div><div className="conversation-bubble outgoing">We want one system for strategy, creative, campaigns, reporting and approvals.</div><div className="conversation-bubble incoming accent">That is exactly the conversation we should have.</div><Link href="mailto:hello@oyeimagine.com" className="conversation-action">Start the conversation <span>→</span></Link></aside>
      </section>

      <section className="premium-section-block contact-trust-block"><div><p className="premium-eyebrow">Company & trust</p><h2>A real operating company behind the software.</h2></div><div className="contact-trust-grid"><article><small>Legal entity</small><strong>{experience.trustPanel.legalName}</strong></article><article><small>GSTIN</small><strong>{experience.trustPanel.gstin}</strong></article><article className="wide"><small>Registered address</small><strong>{experience.trustPanel.principalAddress}</strong></article></div></section>

      <section className="premium-cta-panel"><div><p className="premium-eyebrow">Prefer to explore first?</p><h2>See how the operating system is organised before you talk to us.</h2></div><div className="premium-hero-actions"><Link href="/platform" className="premium-secondary-cta">Explore platform</Link><Link href="/signup" className="premium-primary-cta">Create workspace</Link></div></section>
    </main>
  )
}
