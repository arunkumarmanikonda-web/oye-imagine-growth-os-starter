import {
  createStrategyBriefRecord,
  type StrategyBriefInput,
  type StrategyBriefRecord,
} from "./strategy-schema";
import { createDefaultStrategyBriefFixture } from "./strategy-fixtures";

let strategyBriefState: StrategyBriefRecord | null = null;

export function getStrategyBrief(): StrategyBriefRecord {
  if (!strategyBriefState) {
    strategyBriefState = createDefaultStrategyBriefFixture();
  }

  return strategyBriefState;
}

export function createDefaultStrategyBrief(): StrategyBriefRecord {
  strategyBriefState = createDefaultStrategyBriefFixture();
  return strategyBriefState;
}

export function saveStrategyBrief(input: StrategyBriefInput): StrategyBriefRecord {
  const current = getStrategyBrief();

  strategyBriefState = createStrategyBriefRecord({
    ...current,
    ...input,
    id: input.id ?? current.id,
    generatedAt: input.generatedAt ?? current.generatedAt,
    lastUpdatedAt: new Date().toISOString(),
  });

  return strategyBriefState;
}

export function updateStrategyBrief(input: StrategyBriefInput): StrategyBriefRecord {
  return saveStrategyBrief(input);
}

export function resetStrategyBriefStore(
  seed?: StrategyBriefInput | StrategyBriefRecord | null,
): StrategyBriefRecord | null {
  if (!seed) {
    strategyBriefState = null;
    return strategyBriefState;
  }

  strategyBriefState = createStrategyBriefRecord(seed);
  return strategyBriefState;
}