import { describe, expect, it } from 'vitest';
import { buildContentPlan, summarizeThemes } from '../../src/lib/execution/content-planner';

describe('execution content planner', () => {
  it('builds a cross-channel content plan', () => {
    const plan = buildContentPlan({
      brandName: 'Neejee',
      planningWindow: 'monthly',
      funnelGoal: 'conversion',
      channels: ['seo', 'social', 'email'],
      offer: 'bridal jewellery consultations',
      themes: [
        {
          title: 'bridal craftsmanship',
          angle: 'heritage and premium design',
          keywords: ['bridal jewellery', 'craftsmanship'],
        },
        {
          title: 'gift discovery',
          angle: 'occasion-led purchase journeys',
          keywords: ['gifting', 'premium jewellery'],
        },
      ],
    });

    expect(plan.items.length).toBe(6);
    expect(plan.channelMix).toEqual(['seo', 'social', 'email']);
    expect(plan.items[0]?.primaryCta).toContain('Get started');
  });

  it('summarizes unique themes and keywords', () => {
    const values = summarizeThemes([
      { title: 'theme a', angle: 'x', keywords: ['one', 'two'] },
      { title: 'theme b', angle: 'y', keywords: ['two', 'three'] },
    ]);

    expect(values).toEqual(['theme a', 'one', 'two', 'theme b', 'three']);
  });
});