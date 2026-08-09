import { describe, expect, it } from 'vitest';
import {
  buildRoleAwareExplainer,
  buildGovernedActionDecisions,
  resolveRoleAwareMode,
} from '../../src/lib/ai/role-aware-explainer-action';

describe('g2 role-aware explainer and action layer', () => {
  it('explains invoice reasons for finance mode with governed next steps', () => {
    const summary = buildRoleAwareExplainer(
      {
        role: 'finance',
        allowedActions: ['resend_invoice', 'request_statement'],
        tenantLabel: 'Neejee',
      },
      {
        recordKind: 'invoice',
        title: 'Invoice INV-100',
        status: 'overdue',
        amountDue: 224200,
        overdueReason: 'payment terms expired',
        nextStep: 'resend invoice and request statement',
      },
    );

    expect(summary.role).toBe('finance');
    expect(summary.explanation).toContain('Invoice INV-100 is overdue');
    expect(summary.explanation).toContain('payment terms expired');
    expect(summary.pendingActions).toContain('resend_invoice');
  });

  it('enforces role-aware action permissions', () => {
    const decisions = buildGovernedActionDecisions(
      {
        role: 'client',
        allowedActions: ['request_statement', 'request_agreement_copy'],
        tenantLabel: 'Neejee',
      },
      ['request_statement', 'escalate_issue'],
    );

    expect(decisions.find((d) => d.action === 'request_statement')?.allowed).toBe(true);
    expect(decisions.find((d) => d.action === 'request_statement')?.route).toBe('/client/finance/request-statement');
    expect(decisions.find((d) => d.action === 'escalate_issue')?.allowed).toBe(false);
  });

  it('adapts framing and escalation path by role', () => {
    const supportMode = resolveRoleAwareMode('support');
    const prospectMode = resolveRoleAwareMode('prospect');

    expect(supportMode.answerFraming).toContain('support explanation');
    expect(supportMode.escalationPath).toBe('support_lead');
    expect(prospectMode.answerFraming).toContain('prospect-safe explanation');
    expect(prospectMode.escalationPath).toBe('sales_consultant');
  });
});