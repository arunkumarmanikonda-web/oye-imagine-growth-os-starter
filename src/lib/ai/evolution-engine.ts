import crypto from 'node:crypto';
import type {
  AutonomousActionKind,
  AutonomousActionPolicy,
  EvolutionEventInput,
  EvolutionEventRecord,
  EvolutionOutcomeMetric,
  EvolutionReuseScope,
  LearningPatternCandidate,
  LearningPromotionDecision,
} from './evolution-types';

function id(prefix: string, seed: string) {
  return `${prefix}_${crypto.createHash('sha256').update(seed).digest('hex').slice(0, 24)}`;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeEvolutionEvent(
  input: EvolutionEventInput,
  now = new Date(),
): EvolutionEventRecord {
  const tenantId = input.tenantId.trim();
  const workspaceId = input.workspaceId.trim();
  const sourceEntityType = input.sourceEntityType.trim();
  const sourceEntityId = input.sourceEntityId.trim();
  if (!tenantId) throw new Error('evolution_tenant_required');
  if (!workspaceId) throw new Error('evolution_workspace_required');
  if (!sourceEntityType) throw new Error('evolution_source_type_required');
  if (!sourceEntityId) throw new Error('evolution_source_id_required');

  const containsPersonalData = Boolean(input.containsPersonalData);
  const containsClientSecrets = Boolean(input.containsClientSecrets);
  const sensitivity = input.sensitivity ?? 'internal';

  let reuseScope: EvolutionReuseScope = input.reuseScope ?? 'tenant_private';
  if (
    containsPersonalData ||
    containsClientSecrets ||
    sensitivity === 'confidential' ||
    sensitivity === 'personal' ||
    sensitivity === 'regulated'
  ) {
    reuseScope = 'tenant_private';
  }

  const occurredAt = now.toISOString();
  const eventId = id(
    'evo',
    [tenantId, workspaceId, input.activityType, sourceEntityType, sourceEntityId, occurredAt].join('|'),
  );

  return {
    ...input,
    tenantId,
    workspaceId,
    sourceEntityType,
    sourceEntityId,
    eventId,
    occurredAt,
    reuseScope,
    sensitivity,
    riskClass: input.riskClass ?? 'low',
    containsPersonalData,
    containsClientSecrets,
    metadata: input.metadata ?? {},
    outcomeMetrics: input.outcomeMetrics ?? [],
  };
}

export function eventCanContributeToPlatformLearning(event: EvolutionEventRecord) {
  return Boolean(
    event.reuseScope === 'platform_anonymized' &&
      !event.containsPersonalData &&
      !event.containsClientSecrets &&
      (event.sensitivity === 'public' || event.sensitivity === 'internal'),
  );
}

function normalizedMetric(metric: EvolutionOutcomeMetric) {
  if (!Number.isFinite(metric.value)) return null;
  const direction = metric.direction ??
    (metric.key === 'cpa' || metric.key === 'user_edit_distance'
      ? 'lower_is_better'
      : 'higher_is_better');

  const scaleByKey: Partial<Record<EvolutionOutcomeMetric['key'], number>> = {
    ctr: 0.1,
    cvr: 0.1,
    cpa: 500,
    roas: 8,
    revenue: 100000,
    engagement_rate: 0.2,
    lead_quality: 10,
    approval_rate: 1,
    brand_fit: 1,
    organic_visibility: 100,
    retention: 1,
    user_edit_distance: 1,
  };

  const scale = scaleByKey[metric.key] ?? Math.max(Math.abs(metric.value), 1);
  const magnitude = clamp(Math.abs(metric.value) / scale);
  return direction === 'lower_is_better' ? 1 - magnitude : magnitude;
}

export function scoreEvolutionOutcome(metrics: EvolutionOutcomeMetric[]) {
  const scored = metrics
    .map(normalizedMetric)
    .filter((value): value is number => value !== null);
  if (!scored.length) return null;
  return scored.reduce((total, value) => total + value, 0) / scored.length;
}

export function decideLearningPromotion(
  candidate: LearningPatternCandidate,
): LearningPromotionDecision {
  if (
    candidate.sensitivity === 'confidential' ||
    candidate.sensitivity === 'personal' ||
    candidate.sensitivity === 'regulated'
  ) {
    return {
      decision: 'reject',
      destination: 'none',
      autonomous: true,
      reason: 'Sensitive client material cannot be promoted into reusable cross-client intelligence.',
    };
  }

  if (candidate.reuseScope !== 'platform_anonymized') {
    return {
      decision: candidate.sampleCount >= 2 ? 'promote' : 'observe',
      destination: candidate.sampleCount >= 2 ? 'tenant_memory' : 'none',
      autonomous: true,
      reason:
        candidate.sampleCount >= 2
          ? 'Pattern has repeat evidence and remains inside the tenant boundary.'
          : 'More tenant evidence is required before promotion.',
    };
  }

  if (candidate.distinctTenantCount < 3 || candidate.sampleCount < 8) {
    return {
      decision: 'observe',
      destination: 'none',
      autonomous: true,
      reason: 'Cross-client promotion requires broader evidence to reduce overfitting.',
    };
  }

  if (candidate.confidence < 0.8) {
    return {
      decision: 'observe',
      destination: 'none',
      autonomous: true,
      reason: 'Confidence is below the platform-learning promotion threshold.',
    };
  }

  if (candidate.outcomeLift !== null && candidate.outcomeLift <= 0) {
    return {
      decision: 'reject',
      destination: 'none',
      autonomous: true,
      reason: 'Observed outcome lift is not positive.',
    };
  }

  if (candidate.riskClass === 'high' || candidate.riskClass === 'critical') {
    return {
      decision: 'observe',
      destination: 'none',
      autonomous: false,
      reason: 'High-risk patterns require governed evaluation before platform-wide adoption.',
    };
  }

  return {
    decision: 'promote',
    destination: 'platform_pattern_library',
    autonomous: true,
    reason: 'Anonymized multi-tenant evidence clears quality, confidence and risk gates.',
  };
}

const AUTONOMY_POLICIES: Record<AutonomousActionKind, AutonomousActionPolicy> = {
  regenerate_copy: {
    action: 'regenerate_copy',
    riskClass: 'low',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Draft regeneration is reversible and can stay inside brand and policy constraints.',
  },
  regenerate_creative: {
    action: 'regenerate_creative',
    riskClass: 'low',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Draft creative regeneration is reversible and does not itself publish or spend.',
  },
  adjust_prompt_route: {
    action: 'adjust_prompt_route',
    riskClass: 'medium',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Model or prompt routing may self-optimize only inside tested cost, safety and quality envelopes.',
  },
  adjust_keyword_bid_within_cap: {
    action: 'adjust_keyword_bid_within_cap',
    riskClass: 'medium',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Bid optimization is autonomous only inside explicit tenant budget and delta caps.',
  },
  pause_underperforming_asset: {
    action: 'pause_underperforming_asset',
    riskClass: 'medium',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Pausing is reversible and allowed when pre-agreed performance rules are met.',
  },
  publish_preapproved_content: {
    action: 'publish_preapproved_content',
    riskClass: 'medium',
    allowedWithoutHuman: true,
    requiresPreapprovedEnvelope: true,
    rationale: 'Publishing is allowed only for content and channels covered by explicit pre-approval policy.',
  },
  change_budget_cap: {
    action: 'change_budget_cap',
    riskClass: 'high',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'The system must never silently expand a client financial exposure ceiling.',
  },
  execute_payment: {
    action: 'execute_payment',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'Payment execution is governed by mandate, authorization and commercial controls.',
  },
  execute_contract: {
    action: 'execute_contract',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'The platform may prepare and route agreements but cannot impersonate a party signature.',
  },
  change_legal_template: {
    action: 'change_legal_template',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'Legal template changes require controlled approval and versioning.',
  },
  change_security_guardrail: {
    action: 'change_security_guardrail',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'Autonomous weakening or rewriting of security controls is prohibited.',
  },
  deploy_code: {
    action: 'deploy_code',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'AI may propose and test code, but production promotion remains release-gated.',
  },
  run_schema_migration: {
    action: 'run_schema_migration',
    riskClass: 'critical',
    allowedWithoutHuman: false,
    requiresPreapprovedEnvelope: false,
    rationale: 'Database mutations remain migration-gated with rollback and tenant-isolation verification.',
  },
};

export function autonomyPolicyFor(action: AutonomousActionKind) {
  return AUTONOMY_POLICIES[action];
}

export function allAutonomyPolicies() {
  return Object.values(AUTONOMY_POLICIES);
}
