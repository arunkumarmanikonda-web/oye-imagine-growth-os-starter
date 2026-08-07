export type IntelligenceRole =
  | 'client'
  | 'prospect'
  | 'marketplace'
  | 'operator'
  | 'support'
  | 'finance'
  | 'account_management';

export type GovernedRecordKind =
  | 'invoice'
  | 'agreement'
  | 'service_state'
  | 'performance_report'
  | 'approval'
  | 'support_case'
  | 'marketplace_brief';

export type GovernedActionKind =
  | 'resend_invoice'
  | 'request_statement'
  | 'request_agreement_copy'
  | 'raise_support_case'
  | 'escalate_issue'
  | 'request_callback_demo'
  | 'request_proposal_revision'
  | 'create_marketplace_brief';

export interface GovernedRecordContext {
  recordKind: GovernedRecordKind;
  title: string;
  status: string;
  inScope?: boolean;
  amountDue?: number;
  holdReason?: string | null;
  overdueReason?: string | null;
  pendingApprovals?: number;
  performanceChange?: string | null;
  nextStep?: string | null;
}

export interface RoleAwareContext {
  role: IntelligenceRole;
  allowedActions: GovernedActionKind[];
  tenantLabel: string;
}

export interface ExplainerSummary {
  role: IntelligenceRole;
  title: string;
  explanation: string;
  visibleGuidance: string;
  nextStepGuidance: string;
  pendingActions: GovernedActionKind[];
}

export interface ActionDecision {
  role: IntelligenceRole;
  action: GovernedActionKind;
  allowed: boolean;
  reason: 'allowed' | 'forbidden';
  route?: string;
}

function formatCurrency(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A';
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

function routeForAction(action: GovernedActionKind): string {
  switch (action) {
    case 'resend_invoice':
      return '/client/finance/resend-invoice';
    case 'request_statement':
      return '/client/finance/request-statement';
    case 'request_agreement_copy':
      return '/client/legal/request-agreement-copy';
    case 'raise_support_case':
      return '/support/new';
    case 'escalate_issue':
      return '/support/escalations/new';
    case 'request_callback_demo':
      return '/demo/request-callback';
    case 'request_proposal_revision':
      return '/marketplace/proposals/request-revision';
    case 'create_marketplace_brief':
      return '/marketplace/briefs/new';
    default:
      return '/';
  }
}

export function buildRoleAwareExplainer(
  context: RoleAwareContext,
  record: GovernedRecordContext,
): ExplainerSummary {
  const baseParts: string[] = [];

  if (record.recordKind === 'invoice') {
    baseParts.push(
      `${record.title} is ${record.status} with amount due ${formatCurrency(record.amountDue)}.`,
    );
    if (record.overdueReason) {
      baseParts.push(`Overdue reason: ${record.overdueReason}.`);
    }
    if (record.holdReason) {
      baseParts.push(`Hold reason: ${record.holdReason}.`);
    }
  } else if (record.recordKind === 'service_state') {
    baseParts.push(`${record.title} is currently ${record.status}.`);
    if (record.performanceChange) {
      baseParts.push(`Performance changed because ${record.performanceChange}.`);
    }
    if (typeof record.pendingApprovals === 'number' && record.pendingApprovals > 0) {
      baseParts.push(`${record.pendingApprovals} approval(s) are still pending.`);
    }
  } else {
    baseParts.push(`${record.title} is ${record.status}.`);
  }

  if (record.inScope === false) {
    baseParts.push('This item is currently outside your approved service scope.');
  } else if (record.inScope === true) {
    baseParts.push('This item is in approved service scope.');
  }

  const roleLabel = context.role.replace(/_/g, ' ');
  const visibleGuidance = `${context.tenantLabel}: ${roleLabel} mode guidance is active.`;
  const nextStepGuidance = record.nextStep
    ? `Next step: ${record.nextStep}`
    : 'Next step: review governed actions below.';

  return {
    role: context.role,
    title: record.title,
    explanation: baseParts.join(' '),
    visibleGuidance,
    nextStepGuidance,
    pendingActions: context.allowedActions,
  };
}

export function buildGovernedActionDecisions(
  context: RoleAwareContext,
  requestedActions: GovernedActionKind[],
): ActionDecision[] {
  const allowedSet = new Set(context.allowedActions);

  return requestedActions.map((action) => {
    const allowed = allowedSet.has(action);
    return {
      role: context.role,
      action,
      allowed,
      reason: allowed ? 'allowed' : 'forbidden',
      route: allowed ? routeForAction(action) : undefined,
    };
  });
}

export function resolveRoleAwareMode(
  role: IntelligenceRole,
): {
  answerFraming: string;
  escalationPath: string;
} {
  switch (role) {
    case 'client':
      return {
        answerFraming: 'client-safe explanation with account-specific next steps',
        escalationPath: 'account_manager',
      };
    case 'prospect':
      return {
        answerFraming: 'prospect-safe explanation with demo and proposal guidance',
        escalationPath: 'sales_consultant',
      };
    case 'marketplace':
      return {
        answerFraming: 'marketplace-safe explanation with request and revision guidance',
        escalationPath: 'marketplace_ops',
      };
    case 'operator':
      return {
        answerFraming: 'operator explanation with governed internal actions',
        escalationPath: 'program_manager',
      };
    case 'support':
      return {
        answerFraming: 'support explanation with issue and escalation workflow',
        escalationPath: 'support_lead',
      };
    case 'finance':
      return {
        answerFraming: 'finance explanation with billing and statement actions',
        escalationPath: 'finance_controller',
      };
    case 'account_management':
      return {
        answerFraming: 'account-management explanation with relationship next steps',
        escalationPath: 'account_director',
      };
    default:
      return {
        answerFraming: 'generic governed explanation',
        escalationPath: 'program_manager',
      };
  }
}