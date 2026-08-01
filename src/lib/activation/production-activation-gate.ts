import type {
  ProductionActivationInput,
  ProductionActivationSummary,
} from './activation-types';

export function buildProductionActivationSummary(
  input: ProductionActivationInput,
): ProductionActivationSummary {
  const blockers: string[] = [...input.deployment.blockers];
  const externalDependencies: string[] = [];
  const evidenceBlockers = Array.from(new Set(input.deployment.evidenceBlockers ?? []));

  for (const provider of input.providerStatuses) {
    if (provider.status !== 'ready') {
      const dependency = `${provider.provider}: ${provider.blockers.join(', ')}`;
      blockers.push(dependency);
      externalDependencies.push(dependency);
    }
  }

  if (!input.legalSignoffReady) {
    blockers.push('legal signoff not complete');
    externalDependencies.push('legal signoff');
  }

  if (!input.financeSignoffReady) {
    blockers.push('finance signoff not complete');
    externalDependencies.push('finance signoff');
  }

  if (
    input.autonomyMode === 'guardrailed' ||
    input.autonomyMode === 'high_autonomy'
  ) {
    if (!input.financeSignoffReady) {
      blockers.push('autonomy requires finance signoff');
    }
  }

  for (const blocker of evidenceBlockers) {
    externalDependencies.push(`commercial evidence: ${blocker}`);
  }

  const uniqueBlockers = Array.from(new Set(blockers));
  const uniqueExternalDependencies = Array.from(new Set(externalDependencies));

  return {
    canProceed: uniqueBlockers.length === 0,
    blockers: uniqueBlockers,
    nextAction:
      uniqueBlockers.length === 0
        ? `${input.brandName}: ready for live activation`
        : `${input.brandName}: resolve external dependencies and deployment blockers`,
    externalDependencies: uniqueExternalDependencies,
    evidenceBlockers,
  };
}

export function productionActivationReady(
  summary: ProductionActivationSummary,
): boolean {
  return summary.canProceed && summary.blockers.length === 0;
}
