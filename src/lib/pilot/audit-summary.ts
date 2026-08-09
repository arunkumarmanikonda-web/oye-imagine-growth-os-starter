export type AuditSeverity = 'low' | 'medium' | 'high';

export interface WebsiteAuditInput {
  pagesCrawled: number;
  brokenLinks: number;
  duplicatePages: number;
  missingMetaPages: number;
  cwvStatus: 'good' | 'needs_improvement' | 'poor' | 'unknown';
  trackingCoveragePercent: number;
  conversionPathCount: number;
}

export interface WebsiteAuditSummary {
  severity: AuditSeverity;
  findings: string[];
  recommendations: string[];
  readinessScore: number;
}

export function summarizeWebsiteAudit(input: WebsiteAuditInput): WebsiteAuditSummary {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (input.brokenLinks > 0) {
    findings.push(`${input.brokenLinks} broken links detected`);
    recommendations.push('repair broken links affecting navigation or conversion flow');
    score -= Math.min(20, input.brokenLinks * 2);
  }

  if (input.duplicatePages > 0) {
    findings.push(`${input.duplicatePages} duplicate or overlapping pages detected`);
    recommendations.push('consolidate overlapping pages and align canonical targets');
    score -= Math.min(15, input.duplicatePages * 2);
  }

  if (input.missingMetaPages > 0) {
    findings.push(`${input.missingMetaPages} pages missing metadata`);
    recommendations.push('fill title, description, and schema gaps on critical pages');
    score -= Math.min(15, input.missingMetaPages);
  }

  if (input.cwvStatus === 'poor') {
    findings.push('core web vitals status is poor');
    recommendations.push('prioritize page speed, script weight, and layout stability fixes');
    score -= 25;
  } else if (input.cwvStatus === 'needs_improvement') {
    findings.push('core web vitals need improvement');
    recommendations.push('optimize media, JavaScript, and rendering performance');
    score -= 12;
  }

  if (input.trackingCoveragePercent < 80) {
    findings.push(`tracking coverage is only ${input.trackingCoveragePercent}%`);
    recommendations.push('complete analytics and conversion-event instrumentation');
    score -= 20;
  }

  if (input.conversionPathCount === 0) {
    findings.push('no measurable conversion path detected');
    recommendations.push('introduce at least one primary lead or commerce conversion flow');
    score -= 20;
  }

  if (findings.length === 0) {
    findings.push('no material website audit issues detected in this summary');
  }

  const readinessScore = Math.max(0, Math.min(100, score));
  const severity: AuditSeverity =
    readinessScore < 50 ? 'high' : readinessScore < 80 ? 'medium' : 'low';

  return {
    severity,
    findings,
    recommendations,
    readinessScore,
  };
}

export function websiteAuditNeedsImmediateAttention(
  summary: WebsiteAuditSummary,
): boolean {
  return summary.severity === 'high' || summary.readinessScore < 50
}
