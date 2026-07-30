import type { SocialCalendarEntry, SocialCalendarInput } from './execution-types';

const PILLARS = ['education', 'proof', 'offer', 'trust'] as const;

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate: string, days: number): string {
  const date = new Date(`${baseDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toUtcDateString(date);
}

export function buildSocialCalendar(input: SocialCalendarInput): SocialCalendarEntry[] {
  if (input.weeks <= 0) {
    throw new Error('weeks must be positive');
  }

  if (input.cadencePerWeek <= 0) {
    throw new Error('cadencePerWeek must be positive');
  }

  const totalEntries = input.weeks * input.cadencePerWeek;

  return Array.from({ length: totalEntries }, (_, index) => {
    const weekIndex = Math.floor(index / input.cadencePerWeek);
    const slotIndex = index % input.cadencePerWeek;
    const channel = input.channels[index % input.channels.length]!;
    const format = input.formats[index % input.formats.length]!;
    const pillar = PILLARS[index % PILLARS.length]!;
    const publishOn = addDays(input.startDate, weekIndex * 7 + slotIndex * 2);

    return {
      publishOn,
      channel,
      format,
      pillar,
      captionHook: `${input.brandName}: ${input.campaignTheme} through ${pillar}`,
      primaryCta: input.primaryCta,
    };
  });
}

export function socialCalendarHasCoverage(
  entries: SocialCalendarEntry[],
  channels: SocialCalendarInput['channels'],
): boolean {
  const covered = new Set(entries.map((entry) => entry.channel));
  return channels.every((channel) => covered.has(channel));
}