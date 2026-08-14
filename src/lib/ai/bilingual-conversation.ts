export type OyeConversationLanguage = 'en' | 'hi' | 'hinglish';

export type ConversationInputMode = 'text' | 'voice';

export type ConversationTurn = {
  text: string;
  language: OyeConversationLanguage;
  inputMode: ConversationInputMode;
  normalizedText: string;
};

const DEVANAGARI = /[\u0900-\u097F]/;
const HINGLISH_MARKERS = [
  'mujhe',
  'mera',
  'meri',
  'hum',
  'hamara',
  'kaise',
  'kya',
  'kyun',
  'chahiye',
  'banana',
  'banao',
  'dikhao',
  'batao',
  'accha',
  'acha',
  'karna',
  'karo',
  'wali',
  'wala',
];

export function detectOyeConversationLanguage(text: string): OyeConversationLanguage {
  const value = text.trim();
  if (!value) return 'en';
  if (DEVANAGARI.test(value)) return 'hi';

  const tokens = value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const markerCount = tokens.filter((token) => HINGLISH_MARKERS.includes(token)).length;
  return markerCount >= 1 ? 'hinglish' : 'en';
}

export function normalizeConversationInput(input: {
  text: string;
  inputMode?: ConversationInputMode;
  language?: OyeConversationLanguage;
}): ConversationTurn {
  const text = input.text.trim();
  if (!text) throw new Error('conversation_text_required');

  return {
    text,
    inputMode: input.inputMode ?? 'text',
    language: input.language ?? detectOyeConversationLanguage(text),
    normalizedText: text.replace(/\s+/g, ' ').trim(),
  };
}

export type VoiceCapability = {
  capability: 'speech_to_text' | 'text_to_speech';
  languages: OyeConversationLanguage[];
  requiresExplicitMicrophoneConsent: boolean;
  alwaysOnListeningAllowed: boolean;
};

export function oyeVoiceCapabilities(): VoiceCapability[] {
  return [
    {
      capability: 'speech_to_text',
      languages: ['en', 'hi', 'hinglish'],
      requiresExplicitMicrophoneConsent: true,
      alwaysOnListeningAllowed: false,
    },
    {
      capability: 'text_to_speech',
      languages: ['en', 'hi', 'hinglish'],
      requiresExplicitMicrophoneConsent: false,
      alwaysOnListeningAllowed: false,
    },
  ];
}

export function bilingualSystemInstruction(language: OyeConversationLanguage) {
  if (language === 'hi') {
    return 'उत्तर स्पष्ट, सरल और पेशेवर हिंदी में दें। आवश्यक ब्रांड, विज्ञापन और तकनीकी शब्द अंग्रेज़ी में रखे जा सकते हैं।';
  }
  if (language === 'hinglish') {
    return 'Reply in natural, premium Hinglish. Keep technical and marketing terms in English and avoid awkward literal translation.';
  }
  return 'Reply in clear, premium English. Prefer short, action-oriented language over internal platform jargon.';
}
