import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { createDefaultPilotFixture } from "@/lib/admin/pilot-fixtures";
import {
  createPilotRecord,
  type NeejeePilotInput,
  type NeejeePilotRecord,
} from "@/lib/admin/pilot-schema";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let pilotState: NeejeePilotRecord = createDefaultPilotFixture();

export function getPilot(): NeejeePilotRecord {
  return clone(pilotState);
}

export function createDefaultPilot(): NeejeePilotRecord {
  pilotState = createDefaultPilotFixture({
    workspaceDisplayName: getWorkspaceDisplayName(),
  });
  return getPilot();
}

export function savePilot(input: NeejeePilotInput = {}): NeejeePilotRecord {
  pilotState = createPilotRecord({
    ...pilotState,
    ...input,
    id: input.id ?? pilotState.id ?? "neejee-pilot",
    workspaceDisplayName: input.workspaceDisplayName ?? getWorkspaceDisplayName(),
    lastUpdatedAt: new Date().toISOString(),
  });

  return getPilot();
}

export function updatePilot(input: NeejeePilotInput = {}): NeejeePilotRecord {
  return savePilot(input);
}

export function resetPilotStore(
  seed?: NeejeePilotInput | NeejeePilotRecord,
): NeejeePilotRecord {
  if (seed) {
    pilotState = createPilotRecord({
      ...seed,
      workspaceDisplayName: seed.workspaceDisplayName ?? getWorkspaceDisplayName(),
    });

    return getPilot();
  }

  return createDefaultPilot();
}