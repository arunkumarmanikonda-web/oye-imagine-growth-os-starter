import type {
  WebsiteAuditIngestionInput,
  WebsiteAuditSummary,
} from './pilot-integration-types';

export function buildWebsiteAuditSummary(
  input: WebsiteAuditIngestionInput,
): WebsiteAuditSummary {
  const healthyPages = input.pages.filter((page) => page.statusCode < 400).length;
  const blockedPages = input.pages.length - healthyPages;
  const analyticsPages = input.pages.filter((page) => page.hasAnalytics).length;
  const conversionReadyPages = input.pages.filter(
    (page) => page.hasMetaDescription && page.hasPrimaryCta && page.statusCode < 400,
  ).length;

  const priorityFixes: string[] = [];
  if (blockedPages > 0) priorityFixes.push('resolve broken or blocked pages');
  if (analyticsPages !== input.pages.length) priorityFixes.push('restore analytics coverage');
  if (conversionReadyPages !== input.pages.length) priorityFixes.push('improve CTA and metadata coverage');

  const analyticsCoverage =
    input.pages.length === 0 ? 0 : Number(((analyticsPages / input.pages.length) * 100).toFixed(2));

  return {
    healthyPages,
    blockedPages,
    analyticsCoverage,
    conversionReadyPages,
    priorityFixes,
  };
}

export function websiteAuditHealthy(summary: WebsiteAuditSummary): boolean {
  return summary.blockedPages === 0 && summary.analyticsCoverage >= 100;
}

export function websiteAuditNeedsRemediation(
  summary: WebsiteAuditSummary,
): boolean {
  return !websiteAuditHealthy(summary) || summary.priorityFixes.length > 0
}

export function websiteAuditReadyForSearchVisibility(
  summary: WebsiteAuditSummary,
): boolean {
  return Boolean(
    summary.blockedPages === 0 &&
    summary.analyticsCoverage >= 100 &&
    summary.conversionReadyPages >= summary.healthyPages
  );
}
