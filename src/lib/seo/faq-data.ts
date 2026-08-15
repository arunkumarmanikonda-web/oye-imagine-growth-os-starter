import type { FaqItem } from './site'

export const pricingFaqItems: FaqItem[] = [
  { question: 'How does Oye !magine pricing work?', answer: 'Plans are priced by edition and billing cycle. Platform fees are separate from media spend, pass-through third-party charges and any separately scoped specialist or implementation services unless an order expressly includes them.' },
  { question: 'Can a team start with a smaller edition and upgrade later?', answer: 'Yes. A customer can start with the edition that fits its current operating model and move to a broader edition as brands, workspaces, governance, managed support or integration requirements grow.' },
  { question: 'What should I confirm before choosing a plan?', answer: 'Confirm the number of brands and users, required workflows, approval model, integration needs, managed-service scope, expected AI or creative usage and any enterprise security or commercial requirements.' },
]

export const platformFaqItems: FaqItem[] = [
  { question: 'What does the Oye !magine platform centralize?', answer: 'Oye !magine connects brand intelligence, research, strategy, creative and content work, campaign operations, approvals, analytics, commercial controls and AI-assisted search inside one governed workspace.' },
  { question: 'Does Oye !magine automatically publish or spend money?', answer: 'High-impact actions are designed to remain permission and approval bound. A draft or recommendation is not treated as external execution until the relevant connected provider returns evidence of the action.' },
  { question: 'How does Ask Oye use customer context?', answer: 'Ask Oye resolves the signed-in user’s tenant, workspace and permissions before searching authorised system information. Deeper tenant knowledge ingestion and semantic retrieval depend on the knowledge sources actually configured for that customer.' },
]

export const solutionsFaqItems: FaqItem[] = [
  { question: 'Which operating models does Oye !magine support?', answer: 'The current product is designed for e-commerce, growing businesses, enterprise teams, agencies, managed-growth engagements and white-label operating models.' },
  { question: 'Can capabilities be introduced progressively?', answer: 'Yes. Customers can begin with a suitable edition and activate additional integrations, governance and managed services as requirements become clear.' },
  { question: 'How does Oye !magine measure whether work is live?', answer: 'Oye distinguishes internal capability from configured, connected, executed and reconciled external evidence. Provider-side readback and outcome data are required before external activity is treated as verified.' },
]

export const marketplaceFaqItems: FaqItem[] = [
  { question: 'What is the Oye !magine marketplace?', answer: 'It is the operating model for bringing assigned specialist execution into the same customer briefs, permissions, approvals and delivery evidence as the Growth OS.' },
  { question: 'Can a marketplace specialist see every customer?', answer: 'No. Marketplace access is intended to be limited to the tenant, workspace and work assignment granted to that specialist, with role defaults and explicit permission overrides controlling access.' },
  { question: 'Are marketplace specialists currently a public directory?', answer: 'The public marketplace currently explains the managed specialist operating model. Individual specialist listings should be published only after the relevant onboarding, scope and governance records are production-ready.' },
]
