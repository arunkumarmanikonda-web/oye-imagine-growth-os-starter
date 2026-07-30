import type { AnalyticsKpiInput, AnalyticsKpiSummary, KpiDeltaReport } from './reporting-types';

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildAnalyticsKpiSummary(input: AnalyticsKpiInput): AnalyticsKpiSummary {
  return {
    periodLabel: input.periodLabel,
    spend: round2(input.spend),
    revenue: round2(input.revenue),
    leads: input.leads,
    visitors: input.visitors,
    conversions: input.conversions,
    orders: input.orders,
    roas: round2(safeDivide(input.revenue, input.spend)),
    cpl: round2(safeDivide(input.spend, input.leads)),
    conversionRate: round2(safeDivide(input.conversions, input.visitors)),
    averageOrderValue: round2(safeDivide(input.revenue, input.orders)),
    revenuePerVisitor: round2(safeDivide(input.revenue, input.visitors)),
    leadToCustomerRate: round2(safeDivide(input.orders, input.leads)),
  };
}

export function compareKpiSummaries(
  current: AnalyticsKpiSummary,
  previous: AnalyticsKpiSummary,
): KpiDeltaReport {
  return {
    roasDelta: round2(current.roas - previous.roas),
    cplDelta: round2(current.cpl - previous.cpl),
    conversionRateDelta: round2(current.conversionRate - previous.conversionRate),
    revenueDelta: round2(current.revenue - previous.revenue),
    leadDelta: current.leads - previous.leads,
  };
}