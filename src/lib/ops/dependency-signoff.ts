import type {
  DependencySignoffInput,
  DependencySignoffSummary,
} from './final-ops-types';

export function buildDependencySignoffSummary(
  input: DependencySignoffInput,
): DependencySignoffSummary {
  const unresolvedDependencies = input.dependencies
    .filter((dependency) => dependency.required && dependency.status !== 'ready')
    .map((dependency) => dependency.name);

  const blockingDependencies = input.dependencies
    .filter((dependency) => dependency.required && dependency.status === 'blocked')
    .map((dependency) => dependency.name);

  return {
    clearToLaunch: unresolvedDependencies.length === 0,
    unresolvedDependencies,
    blockingDependencies,
  };
}

export function dependencySignoffClear(
  summary: DependencySignoffSummary,
): boolean {
  return summary.clearToLaunch && summary.unresolvedDependencies.length === 0;
}