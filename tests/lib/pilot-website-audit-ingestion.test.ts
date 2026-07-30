import { describe, expect, it } from 'vitest';
import {
  buildWebsiteAuditSummary,
  websiteAuditHealthy,
} from '../../src/lib/pilot/website-audit-ingestion';

describe('website-audit-ingestion', () => {
  it('summarizes healthy audited pages', () => {
    const summary = buildWebsiteAuditSummary({
      brandName: 'Neejee',
      pages: [
        {
          url: '/home',
          title: 'Home',
          statusCode: 200,
          hasAnalytics: true,
          hasMetaDescription: true,
          hasPrimaryCta: true,
        },
        {
          url: '/services',
          title: 'Services',
          statusCode: 200,
          hasAnalytics: true,
          hasMetaDescription: true,
          hasPrimaryCta: true,
        },
      ],
    });

    expect(summary.healthyPages).toBe(2);
    expect(summary.blockedPages).toBe(0);
    expect(summary.analyticsCoverage).toBe(100);
    expect(websiteAuditHealthy(summary)).toBe(true);
  });

  it('flags missing coverage and blocked pages', () => {
    const summary = buildWebsiteAuditSummary({
      brandName: 'Neejee',
      pages: [
        {
          url: '/home',
          title: 'Home',
          statusCode: 200,
          hasAnalytics: false,
          hasMetaDescription: true,
          hasPrimaryCta: true,
        },
        {
          url: '/broken',
          title: 'Broken',
          statusCode: 404,
          hasAnalytics: true,
          hasMetaDescription: false,
          hasPrimaryCta: false,
        },
      ],
    });

    expect(summary.blockedPages).toBe(1);
    expect(summary.priorityFixes.length).toBeGreaterThan(0);
  });
});