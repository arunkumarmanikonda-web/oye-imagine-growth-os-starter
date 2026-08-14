import { describe, expect, it } from 'vitest';
import {
  detectOyeConversationLanguage,
  normalizeConversationInput,
  oyeVoiceCapabilities,
} from '../../src/lib/ai/bilingual-conversation';
import { planGlobalAiSearch } from '../../src/lib/ai/global-ai-search';
import { evaluateResearchEvidence } from '../../src/lib/ai/research-policy';

describe('Oye bilingual AI command layer', () => {
  it('detects English, Hindi and Hinglish', () => {
    expect(detectOyeConversationLanguage('Create an Instagram campaign')).toBe('en');
    expect(detectOyeConversationLanguage('मुझे एक नया अभियान बनाना है')).toBe('hi');
    expect(detectOyeConversationLanguage('Mujhe premium reel banao')).toBe('hinglish');
  });

  it('normalizes voice and text through one conversational contract', () => {
    const turn = normalizeConversationInput({
      text: '  Mujhe   premium reel banao  ',
      inputMode: 'voice',
    });
    expect(turn.language).toBe('hinglish');
    expect(turn.normalizedText).toBe('Mujhe premium reel banao');
    expect(turn.inputMode).toBe('voice');
  });

  it('requires explicit microphone consent and prohibits always-on listening', () => {
    const stt = oyeVoiceCapabilities().find((item) => item.capability === 'speech_to_text');
    expect(stt?.requiresExplicitMicrophoneConsent).toBe(true);
    expect(stt?.alwaysOnListeningAllowed).toBe(false);
  });

  it('routes natural language to relevant dashboard domains and research', () => {
    const plan = planGlobalAiSearch('What is the best Google Ads keyword strategy today? Research first.');
    expect(plan.domains).toContain('campaigns');
    expect(plan.domains).toContain('seo');
    expect(plan.requiresResearch).toBe(true);
    expect(plan.intent).toBe('research');
  });

  it('challenges an idea when current evidence weighs against it', () => {
    const now = new Date('2026-08-14T12:00:00.000Z');
    const decision = evaluateResearchEvidence([
      {
        evidenceId: 'e1',
        title: 'Primary evidence',
        sourceUri: 'https://example.test/primary',
        sourceTier: 'primary',
        retrievedAt: '2026-08-14T10:00:00.000Z',
        freshnessClass: 'daily',
        claim: 'The requested direction is not supported.',
        supports: false,
      },
      {
        evidenceId: 'e2',
        title: 'Authoritative evidence',
        sourceUri: 'https://example.test/authority',
        sourceTier: 'authoritative',
        retrievedAt: '2026-08-14T09:00:00.000Z',
        freshnessClass: 'daily',
        claim: 'A different approach is stronger.',
        supports: false,
      },
    ], now);

    expect(decision.recommendation).toBe('challenge');
  });
});
