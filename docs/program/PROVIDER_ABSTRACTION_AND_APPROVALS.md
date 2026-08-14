# Oye !magine Provider Abstraction, Approval and Lifecycle Control

Status: expanded master product scope
Date: 14 August 2026

## Operating principle

Oye !magine is the product the client buys and interacts with. Third-party technology is implementation infrastructure and is not a client-facing dependency or brand surface unless disclosure is legally required.

The platform therefore separates **capability** from **provider**.

Examples:

- `ai.copy.generate` may route to OpenAI, Anthropic, Google or another future model.
- `email.transactional.send` may route to Resend or another approved mail provider.
- `sms.send` may route to Fast2SMS or another approved provider.
- `whatsapp.send` may route to AiSensy, Meta Cloud API or another approved provider.
- `payments.collect` may route to the configured payment gateway.
- `esign.execute` may route to the configured eSign provider.

Client surfaces say what Oye is doing and what the result is. They do not expose provider names, model names, API endpoints, credentials, routing order or infrastructure health unless a statutory/compliance disclosure requires it.

## Super Admin provider vault

The Super Admin configuration console is the canonical control point for application-provider credentials.

For each provider Oye stores:

- provider identity and category
- capability list
- adapter identity and version
- required and optional configuration fields
- account/documentation guidance
- environment
- encrypted credential values
- fingerprints for rotation detection
- configuration status
- verification state
- last verified time
- expiry/rotation status where available
- health evidence
- client-disclosure policy

Secrets are write-only in the browser. Existing secret values are never sent back to the UI. All credential values, including non-secret identifiers where stored in the vault, are encrypted at rest by the application vault layer.

## Bootstrap boundary

Not literally every secret can be stored inside the application-managed vault. Oye needs a minimal root of trust outside that vault so it can reach the database and decrypt provider credentials.

The bootstrap boundary contains only infrastructure-level secrets such as the database/runtime trust credentials and the vault encryption master secret. These stay in the deployment secret manager. Everything above that boundary is managed from the Super Admin console.

This avoids the circular security failure of storing the master vault key inside the vault it protects.

## Automatic wiring

When Super Admin enters the required credentials for a provider that already has an Oye adapter:

1. Oye encrypts and persists the values.
2. Oye determines whether all required fields are present.
3. Oye performs the provider's authenticated health check.
4. Oye records verification evidence.
5. The capability router evaluates the primary and fallback provider routes.
6. Once the configured provider is verified, the relevant capability becomes available to internal runtime services.
7. Client features continue to expose only Oye-labelled capability state.

No engineer should need to copy a provider key into client records or hardcode it into a workflow.

## Future technology discovery

The AI Evolution Engine continuously evaluates whether a new technology would materially improve quality, cost, latency, deliverability, coverage, reliability or a new capability.

When a future integration is warranted, Oye creates an **Integration Request** for Super Admin containing:

- required capability
- proposed provider or shortlist
- why the integration is useful
- expected measurable benefit
- official documentation reference
- official account-creation reference
- account prerequisites
- approval/review prerequisites
- required OAuth scopes
- required keys/secrets/IDs
- webhook requirements
- adapter/evaluation status

The platform then guides the administrator through the human-only external step: create/approve the external account and obtain the required credentials.

## New provider adapter lifecycle

A never-before-integrated provider cannot safely become production-connected from secrets alone. Oye handles the engineering work as an autonomous improvement candidate:

1. Read official provider/API documentation.
2. Generate a typed adapter against the Oye capability interface.
3. Generate credential schema and health check.
4. Generate mocked and contract tests.
5. Generate sandbox/read verification where supported.
6. Generate callback/webhook verification where needed.
7. Run security and secret-leak tests.
8. Run provider-concealment tests for client payloads.
9. Deploy to preview/canary.
10. Validate capability parity and fallback behavior.
11. Place the release behind the platform production gate.
12. After release, Super Admin credential entry becomes plug-and-run.

AI may generate and test adapter code automatically. Production deployment remains release-gated.

## Capability routing and fallback

Every capability has a provider-independent key, purpose and route. Routes can contain a primary provider and ordered fallbacks.

Routing can later optimize for:

- quality
- task suitability
- geography
- language
- latency
- current provider health
- quota
- cost ceiling
- model evaluation score
- policy/compliance constraints

Provider selection is an internal implementation detail. The result continues to be delivered as Oye !magine.

## Credential health and self-healing

Oye continuously checks configured provider health. The platform can automatically:

- detect missing required fields
- detect authentication failure
- detect expiry where the provider supplies it
- detect quota or policy warnings
- fail over to a verified fallback where policy permits
- raise a Super Admin action with exact remediation steps
- mark affected capabilities degraded without exposing vendor internals to clients

Oye never fabricates a connection state. Configured, verified and production-executed are separate evidence states.

## Role and CRUD approval architecture

AI is a maker, researcher, optimizer and operator. It does not bypass accountability.

Each client workspace has explicit role assignments and each publish/execute action has an approval route.

Core role examples include:

- Designer / Creative
- Digital Marketer
- Brand Manager
- Content Approver
- Finance Approver
- Analyst
- Partner / Specialist
- Client Operator
- Tenant Administrator
- Platform Owner / Super Admin

Role labels can evolve without changing the approval principle.

## Creative approval

AI may research, ideate, generate images/video/copy, regenerate variants and rank candidates autonomously.

A client-facing creative publication action routes to the assigned **Designer** approval responsibility before publication unless a specifically pre-approved low-risk rule says otherwise.

Approval captures:

- artifact version
- prompt/evidence lineage
- approver identity
- role
- timestamp
- decision
- comments/reason where relevant
- approved destination/channel

A regeneration creates a new version and never overwrites the approved evidence history.

## Campaign approval

AI may build the strategy, audience, keyword plan, budget allocation inside the allowed envelope, campaign structure, creative mapping, landing-page mapping, negatives, experiments and optimization rules.

Final launch/sign-off is routed to the **primary Digital Marketer / assigned growth partner** for that client workspace.

The assigned-partner requirement prevents a generic administrator from accidentally approving work for a client they do not own.

## Spend approval

The AI may optimize bids and allocations inside the already authorized spend envelope.

Increasing the commercial exposure or changing a client budget ceiling is a finance-governed action and does not occur silently.

## Social and lifecycle approval

AI may draft the entire calendar and prepare posts, reels, stories, email, WhatsApp and SMS journeys.

Actual publishing/sending is governed by:

- workspace role authority
- brand/content approval policy
- consent/suppression rules
- assigned partner where required
- pre-approved automation envelope
- channel policy and availability

## Automatic reports

Periodic reports are generated automatically from verified data while the client subscription and relevant module entitlement remain active.

The reporting system can schedule daily, weekly, monthly, campaign, performance, spend, attribution and executive summaries according to plan and role.

A client can also generate an on-demand report while:

- the workspace is commercially active
- the subscription is currently valid
- the reporting feature is included in the current entitlement
- the requested data is within the client's workspace authority

Expired/suspended subscriptions stop client self-service and scheduled client delivery according to policy. Historical records remain governed by retention and contractual rules.

## Super Admin reporting authority

Platform Owner / Super Admin retains authorized platform-lifecycle reporting capability irrespective of a client's self-service state for legitimate operations such as finance, audit, support, dispute, compliance, system health and internal business management.

This does not mean bypassing tenant isolation. Super Admin access is explicit, privileged, MFA-protected and audited.

## Client wizard experience

The client-facing assistant behaves as one Oye intelligence layer.

A client can ask:

- "Make a campaign for this product."
- "Mujhe kal ke liye premium reel chahiye."
- "Why did spend increase?"
- "Generate this month's report."
- "Improve this post."

The assistant may use several providers internally but responds as Oye !magine. The wizard exposes status such as researching, generating, awaiting approval, approved, scheduled, live and measured, not vendor names.

## Super Admin full lifecycle

Super Admin controls or can inspect the full platform lifecycle, including:

- provider catalogue
- provider credentials
- capability routes
- fallback order
- health
- future integration requests
- tenant/workspace configuration
- role assignments
- approval policies
- subscription/module entitlements
- automation envelopes
- prompt/model routing policy
- spend guardrails
- CMS
- privacy/retention controls
- audit evidence
- platform improvement candidates
- release readiness

Security-sensitive actions remain audited and, where appropriate, maker-checker or release-gated even for Super Admin.

## Definition of done

This capability is not complete because a config page renders. Production completion requires:

- Super Admin-only access proven with MFA
- encrypted credential write and rotation proof
- no secret readback to browser/client APIs
- provider health verification
- capability routing and fallback proof
- at least one real provider activation from config input to verified runtime use
- future-integration request generation proof
- provider-concealment tests across client APIs/logical surfaces
- assigned Designer creative approval proof
- assigned Digital Marketer campaign sign-off proof
- finance spend-boundary proof
- report generation entitlement tests
- automatic report delivery proof
- invalid/expired subscription denial proof
- audit evidence for configuration and approvals
- staging/canary/rollback proof before unrestricted production declaration
