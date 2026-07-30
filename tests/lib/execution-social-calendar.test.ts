import { describe, expect, it } from 'vitest';
import { buildSocialCalendar, socialCalendarHasCoverage } from '../../src/lib/execution/social-calendar';

describe('execution social calendar', () => {
  it('builds a calendar with the requested cadence', () => {
    const entries = buildSocialCalendar({
      brandName: 'Neejee',
      campaignTheme: 'bridal storytelling',
      startDate: '2026-08-03',
      weeks: 2,
      cadencePerWeek: 3,
      channels: ['instagram', 'facebook', 'email'],
      formats: ['static', 'carousel', 'email'],
      primaryCta: 'Book a consultation',
    });

    expect(entries.length).toBe(6);
    expect(entries[0]?.publishOn).toBe('2026-08-03');
    expect(entries[3]?.publishOn).toBe('2026-08-10');
  });

  it('verifies requested channel coverage', () => {
    const entries = buildSocialCalendar({
      brandName: 'Neejee',
      campaignTheme: 'festive gifting',
      startDate: '2026-09-01',
      weeks: 1,
      cadencePerWeek: 3,
      channels: ['instagram', 'linkedin', 'email'],
      formats: ['static', 'carousel', 'email'],
      primaryCta: 'Explore collections',
    });

    expect(socialCalendarHasCoverage(entries, ['instagram', 'linkedin', 'email'])).toBe(true);
  });
});