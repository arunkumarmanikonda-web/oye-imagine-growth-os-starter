import {
  createLandingPageBriefRecord,
  type LandingPageBriefInput,
  type LandingPageBriefRecord,
} from "./landing-page-schema";
import { createDefaultLandingPageBriefFixture } from "./landing-page-fixtures";

let landingPageBriefState: LandingPageBriefRecord | null = null;

export function getLandingPageBrief(): LandingPageBriefRecord {
  if (!landingPageBriefState) {
    landingPageBriefState = createDefaultLandingPageBriefFixture();
  }

  return landingPageBriefState;
}

export function createDefaultLandingPageBrief(): LandingPageBriefRecord {
  landingPageBriefState = createDefaultLandingPageBriefFixture();
  return landingPageBriefState;
}

export function saveLandingPageBrief(
  input: LandingPageBriefInput,
): LandingPageBriefRecord {
  const current = getLandingPageBrief();

  landingPageBriefState = createLandingPageBriefRecord({
    ...current,
    ...input,
    id: input.id ?? current.id,
    generatedAt: input.generatedAt ?? current.generatedAt,
    lastUpdatedAt: new Date().toISOString(),
  });

  return landingPageBriefState;
}

export function updateLandingPageBrief(
  input: LandingPageBriefInput,
): LandingPageBriefRecord {
  return saveLandingPageBrief(input);
}

export function resetLandingPageBriefStore(
  seed?: LandingPageBriefInput | LandingPageBriefRecord | null,
): LandingPageBriefRecord | null {
  if (!seed) {
    landingPageBriefState = null;
    return landingPageBriefState;
  }

  landingPageBriefState = createLandingPageBriefRecord(seed);
  return landingPageBriefState;
}