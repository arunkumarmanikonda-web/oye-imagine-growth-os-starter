# Assumptions and Risk Register — Batch 01

## Assumptions
1. Neejee.com remains the first pilot tenant.
2. India-first compliance is mandatory, but the architecture must remain globally extensible.
3. The product launches with autonomy Levels 0-2 first.
4. Google + Meta + CMS/commerce + analytics + payments + eSign are the highest-priority integration tier.
5. WhatsApp and SMS are architecture-ready but feature-flagged until formal activation.
6. Oye !magine will support SaaS, managed services, marketplace, and white-label from one codebase through entitlements and feature flags.
7. AI routing must remain provider-agnostic.
8. Commercial auditability is a first-class requirement, not post-launch polish.

## Top risks
### 1. Tenant leakage
Risk:
- AI memory, retrieval, support tooling, or exports leak one tenant's data to another.
Mitigation:
- tenant-scoped retrieval, row-level isolation, access-checked tool calls, export controls, audit logging.

### 2. Unsupported automation claims
Risk:
- product claims that channels or actions can be automated when APIs or permissions do not allow it.
Mitigation:
- maintain API feasibility matrix and guided setup fallbacks.

### 3. Uncontrolled money movement
Risk:
- media balance feature behaves like a wallet without appropriate structure or approvals.
Mitigation:
- use ledgered Client Media Balance terminology, maker-checker controls, reconciliation, legal review.

### 4. Weak signing evidence
Risk:
- agreements rely on image signatures or weak acceptance evidence.
Mitigation:
- integrate compliant signing workflows with audit trail and evidence artifacts.

### 5. Platform review dependency
Risk:
- Meta/WhatsApp or other providers delay app review, business verification, or production permissions.
Mitigation:
- plan draft-mode first, maintain dependency register, support guided/manual fallback.

### 6. Scope explosion
Risk:
- building too many modules before the core operating backbone is stable.
Mitigation:
- sequence by macro-batch and hold feature flags for non-core modules.

### 7. Over-building commodity tooling
Risk:
- wasting time rebuilding generic PM, payments, or signing stacks.
Mitigation:
- build the orchestration and governance layer; buy the commodity primitives.

## External dependencies to track
- Meta business verification / app review / tech-provider status as applicable
- payment gateway onboarding and production credentials
- India eSign vendor onboarding
- channel-specific business verification
- final legal position on media-balance structure and terminology