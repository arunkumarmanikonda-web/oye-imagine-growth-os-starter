import { describe, expect, it } from 'vitest';
import {
  buildUniversalSearchIndex,
  searchUniversalKnowledge,
  openGovernedResult,
  fuseKnowledgeRecords,
} from '../../src/lib/concierge/universal-search-foundation';

describe('g1 universal search foundation', () => {
  const records = [
    {
      id: 'inv-100',
      type: 'invoice',
      title: 'Invoice INV-100',
      content: 'Due amount for August retainer and managed services execution',
      keywords: ['due amount', 'retainer', 'managed services'],
      permissionScope: ['finance', 'operator'],
      openTarget: '/invoices/INV-100',
      groundedSources: ['invoice', 'ledger_entry'],
    },
    {
      id: 'agr-200',
      type: 'agreement',
      title: 'Master Services Agreement',
      content: 'Signed agreement for specialist marketplace and delivery governance',
      keywords: ['signed doc', 'agreement', 'specialist'],
      permissionScope: ['legal', 'operator'],
      openTarget: '/agreements/MSA-200',
      groundedSources: ['agreement', 'signed_doc'],
    },
    {
      id: 'sup-300',
      type: 'support_thread',
      title: 'Support history for Neejee',
      content: 'Escalation history, hold reason, and communication trail',
      keywords: ['support history', 'hold reason', 'escalation'],
      permissionScope: ['support', 'operator'],
      openTarget: '/support/threads/sup-300',
      groundedSources: ['support_thread', 'help'],
    },
  ] as const;

  it('finds governed records across invoices, agreements, and support knowledge', () => {
    const index = buildUniversalSearchIndex([...records]);
    const results = searchUniversalKnowledge(index, 'due amount managed services', ['finance']);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('inv-100');
    expect(results[0].openTarget).toBe('/invoices/INV-100');
  });

  it('enforces permission scope when opening exact records from AI flows', () => {
    const index = buildUniversalSearchIndex([...records]);

    const forbidden = openGovernedResult(index, 'agr-200', { allowedScopes: ['finance'] });
    expect(forbidden.allowed).toBe(false);
    expect(forbidden.reason).toBe('forbidden');

    const allowed = openGovernedResult(index, 'agr-200', { allowedScopes: ['legal'] });
    expect(allowed.allowed).toBe(true);
    expect(allowed.target).toBe('/agreements/MSA-200');
  });

  it('fuses record/document/help results into grounded action routing', () => {
    const index = buildUniversalSearchIndex([...records]);
    const results = searchUniversalKnowledge(index, 'hold reason escalation history', ['support', 'operator']);
    const summary = fuseKnowledgeRecords(results, 'hold reason escalation history');

    expect(summary.resultCount).toBe(1);
    expect(summary.groundedSourceTypes).toContain('support_thread');
    expect(summary.actionRoute).toBe('open_support_history');
  });
});