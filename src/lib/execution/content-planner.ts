import type {
  ContentPlan,
  ContentPlanInput,
  ContentPlanItem,
  ContentTheme,
  FunnelGoal,
} from './execution-types';

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildTitle(theme: ContentTheme, channel: string, brandName: string): string {
  const channelLabel =
    channel === 'seo' ? 'SEO' :
    channel === 'social' ? 'Social' :
    channel === 'email' ? 'Email' :
    channel === 'paid' ? 'Paid' :
    channel;

  return `${brandName}: ${theme.title} for ${channelLabel}`;
}

function mapChannelToFormat(channel: string): ContentPlanItem['format'] {
  switch (channel) {
    case 'seo':
      return 'blog';
    case 'website':
      return 'landing_page';
    case 'email':
      return 'email';
    case 'social':
      return 'social_post';
    case 'paid':
      return 'ad_creative';
    default:
      return 'blog';
  }
}

function defaultCta(funnelGoal: FunnelGoal, offer: string): string {
  switch (funnelGoal) {
    case 'awareness':
      return `Learn about ${offer}`;
    case 'consideration':
      return `Compare ${offer}`;
    case 'conversion':
      return `Get started with ${offer}`;
    case 'retention':
      return `Return to ${offer}`;
    default:
      return `Explore ${offer}`;
  }
}

export function buildContentPlan(input: ContentPlanInput): ContentPlan {
  const channelMix = unique(input.channels);
  const audienceSegments = ['founder', 'performance_marketer', 'decision_maker'];

  const items = channelMix.flatMap((channel) =>
    input.themes.map((theme) => ({
      title: buildTitle(theme, channel, input.brandName),
      channel,
      format: mapChannelToFormat(channel),
      funnelGoal: input.funnelGoal,
      theme: theme.title,
      primaryCta: defaultCta(input.funnelGoal, input.offer),
    })),
  );

  return {
    items,
    channelMix,
    audienceSegments,
  };
}

export function summarizeThemes(themes: ContentTheme[]): string[] {
  return unique(themes.flatMap((theme) => [theme.title, ...theme.keywords]));
}