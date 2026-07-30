import type {
  OptimizationEscalation,
  OptimizationEscalationInput,
} from './closeout-types';

export function buildOptimizationEscalation(
  input: OptimizationEscalationInput,
): OptimizationEscalation {
  const highPriorityCount = input.recommendations.filter(
    (item) => item.priority === 'high',
  ).length;

  if (input.activeIncidents > 0 || input.spendAtRisk >= 50000 || highPriorityCount >= 3) {
    return {
      severity: 'critical',
      ownerRole: 'PERFORMANCE_DIRECTOR',
      escalationReason: 'Critical optimization risk detected across incidents, spend, or recommendation volume',
      dueHours: 4,
    };
  }

  if (input.spendAtRisk >= 25000 || highPriorityCount >= 2) {
    return {
      severity: 'high',
      ownerRole: 'PERFORMANCE_LEAD',
      escalationReason: 'High optimization risk requires immediate performance review',
      dueHours: 8,
    };
  }

  if (highPriorityCount >= 1 || input.recommendations.length >= 2) {
    return {
      severity: 'medium',
      ownerRole: 'CHANNEL_MANAGER',
      escalationReason: 'Optimization work should be scheduled into the next execution window',
      dueHours: 24,
    };
  }

  return {
    severity: 'low',
    ownerRole: 'CHANNEL_MANAGER',
    escalationReason: 'No material optimization escalation currently required',
    dueHours: 48,
  };
}

export function optimizationNeedsImmediateAction(
  escalation: OptimizationEscalation,
): boolean {
  return escalation.severity === 'critical' || escalation.severity === 'high';
}