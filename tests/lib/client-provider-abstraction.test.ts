import { describe, expect, it } from 'vitest';
import {
  CLIENT_CAPABILITY_BRAND,
  clientCapabilityEnvelope,
  concealInternalProviderMetadata,
} from '../../src/lib/client/provider-abstraction';

describe('client provider abstraction', () => {
  it('removes provider, model, endpoint and credential metadata recursively', () => {
    const payload = concealInternalProviderMetadata({
      title: 'Campaign ready',
      provider: 'openai',
      model: 'example-model',
      nested: {
        endpoint: 'https://provider.example/api',
        apiKey: 'secret',
        output: 'Use this campaign',
      },
      rows: [{ provider_key: 'resend', status: 'sent' }],
    });

    expect(payload).toEqual({
      title: 'Campaign ready',
      nested: { output: 'Use this campaign' },
      rows: [{ status: 'sent' }],
    });
  });

  it('brands client capability state as Oye only', () => {
    const envelope = clientCapabilityEnvelope({
      capability: 'creative.generate',
      status: 'awaiting_approval',
      result: { providerName: 'hidden-provider', creativeId: 'creative-1' },
    });

    expect(envelope.brand).toBe(CLIENT_CAPABILITY_BRAND);
    expect(envelope.result).toEqual({ creativeId: 'creative-1' });
  });
});
