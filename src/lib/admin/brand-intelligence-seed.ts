export type ApprovalState = "approved" | "review_required" | "draft";
export type SignalState = "strong" | "watch" | "restricted";

export type BrandIdentityCard = {
  slug: string;
  title: string;
  summary: string;
  state: SignalState;
};

export type LanguageRule = {
  phrase: string;
  reason: string;
};

export type AudienceArchetype = {
  slug: string;
  title: string;
  summary: string;
  motivations: string[];
};

export type ProofGuardrail = {
  title: string;
  level: "high" | "medium" | "baseline";
  guidance: string;
};

export type CompetitorSignal = {
  brand: string;
  posture: string;
  signal: string;
};

export type BrandIntelligenceSnapshot = {
  workspace: {
    brand: string;
    slug: string;
    profileStatus: string;
    approvalState: ApprovalState;
    updatedAtLabel: string;
    owner: string;
  };
  positioning: {
    essence: string;
    promise: string;
    narrative: string;
    marketPosture: string;
  };
  identityCards: BrandIdentityCard[];
  approvedLanguage: LanguageRule[];
  prohibitedLanguage: LanguageRule[];
  audienceArchetypes: AudienceArchetype[];
  emotionalDrivers: string[];
  visualDirection: string[];
  channelPosture: string[];
  proofGuardrails: ProofGuardrail[];
  competitorSignals: CompetitorSignal[];
  decisions: string[];
};

export function getNeejeeBrandIntelligenceSnapshot(): BrandIntelligenceSnapshot {
  return {
    workspace: {
      brand: "Neejee",
      slug: "neejee-brand-intelligence",
      profileStatus: "Structured pilot profile",
      approvalState: "review_required",
      updatedAtLabel: "25 Jul 2026 · 09:10 UTC",
      owner: "Brand Intelligence",
    },
    positioning: {
      essence: "FOUND. PERSONAL.",
      promise:
        "Neejee helps people discover deeply personal objects, gifts and craft-rooted products with emotional meaning and premium restraint.",
      narrative:
        "Neejee should not sound like a generic e-commerce catalogue or discount-led marketplace. It should feel founder-led, culturally rooted, emotionally intelligent and quietly premium.",
      marketPosture:
        "Quiet luxury, provenance and thoughtful discovery — not loud hype, mass-bazaar language or trend-chasing urgency.",
    },
    identityCards: [
      {
        slug: "meaning",
        title: "Meaning of the brand",
        summary:
          "Neejee means personal. The brand should feel intimate, considered and emotionally resonant rather than transactional.",
        state: "strong",
      },
      {
        slug: "tone",
        title: "Tone of voice",
        summary:
          "Warm, assured and elegant. Human in emotion, precise in product description, never juvenile or aggressively salesy.",
        state: "strong",
      },
      {
        slug: "craft",
        title: "Craft and provenance",
        summary:
          "Highlight materiality, artisan context and authenticity carefully without becoming folkloric, decorative or tourist-facing.",
        state: "strong",
      },
      {
        slug: "commerce",
        title: "Commerce posture",
        summary:
          "Premium commerce with trust, clarity and restraint. Offers may exist, but should not dominate the brand voice.",
        state: "watch",
      },
      {
        slug: "claims",
        title: "Claims discipline",
        summary:
          "Avoid unsupported superlatives, unverified heritage claims and vague quality statements unless backed by evidence.",
        state: "restricted",
      },
      {
        slug: "visual-language",
        title: "Visual language",
        summary:
          "Calm layouts, elegant spacing, tactile imagery and confident typography over loud campaign clutter.",
        state: "strong",
      },
    ],
    approvedLanguage: [
      {
        phrase: "personal, considered, crafted, rooted, rare, thoughtful",
        reason: "Matches the founder-led, intimate and premium posture.",
      },
      {
        phrase: "provenance, material, artisanal, quietly premium, enduring",
        reason: "Supports elevated commerce storytelling without sounding inflated.",
      },
      {
        phrase: "gift-worthy, meaningful, collected, carefully chosen",
        reason: "Works for emotional purchase framing and curated discovery.",
      },
      {
        phrase: "found, personal, crafted for memory and meaning",
        reason: "Extends the core brand essence consistently.",
      },
    ],
    prohibitedLanguage: [
      {
        phrase: "cheap, best price, crazy deal, lowest price, must buy now",
        reason: "Breaks the premium and emotionally intelligent brand posture.",
      },
      {
        phrase: "royal, heritage, authentic, handmade",
        reason: "Use only when product-specific proof exists; do not generalise.",
      },
      {
        phrase: "viral, trending, hottest, mass favourite",
        reason: "Feels generic and marketplace-led rather than Neejee-led.",
      },
      {
        phrase: "luxury for everyone",
        reason: "Dilutes the quiet-premium stance and weakens positioning.",
      },
    ],
    audienceArchetypes: [
      {
        slug: "intentional-gifter",
        title: "Intentional gifter",
        summary:
          "A buyer looking for emotionally meaningful, distinctive gifts that feel personal rather than generic.",
        motivations: [
          "Wants emotional resonance",
          "Values originality over mass familiarity",
          "Needs confidence in quality and taste",
        ],
      },
      {
        slug: "taste-led-home-buyer",
        title: "Taste-led home buyer",
        summary:
          "A customer drawn to products that signal refinement, craft sensitivity and thoughtful interior or lifestyle choices.",
        motivations: [
          "Seeks aesthetic calm",
          "Prefers material and craft depth",
          "Avoids over-commercial styling",
        ],
      },
      {
        slug: "culture-aware-premium-shopper",
        title: "Culture-aware premium shopper",
        summary:
          "A buyer who values Indian rootedness and authenticity, but expects contemporary presentation and premium trust signals.",
        motivations: [
          "Wants modern presentation of rooted products",
          "Values authenticity with restraint",
          "Prefers curation over catalogue overload",
        ],
      },
    ],
    emotionalDrivers: [
      "Belonging through personal objects",
      "Taste and identity expression",
      "Meaningful gifting over convenience gifting",
      "Calm confidence rather than status shouting",
      "Trust in curation, materiality and origin",
    ],
    visualDirection: [
      "Use restrained premium spacing, generous white space and tactile close-up imagery.",
      "Prefer grounded, elegant product framing over busy campaign collage compositions.",
      "Typography should feel editorial and assured, not flashy or novelty-driven.",
      "Colours should support warmth, craft and quiet sophistication rather than neon or hype-led gradients.",
    ],
    channelPosture: [
      "Website and landing pages should feel editorial-commerce, not coupon-commerce.",
      "Organic social should emphasize story, detail, texture and emotional context.",
      "Paid creative should test hooks carefully without abandoning the quiet-premium brand core.",
      "Video direction should focus on detail, gesture, texture, origin and emotional use moments.",
    ],
    proofGuardrails: [
      {
        title: "Craft, artisan and origin claims",
        level: "high",
        guidance:
          "Only use product-specific provenance, material or artisan claims when verified in source data or approved brand inputs.",
      },
      {
        title: "Premium quality language",
        level: "medium",
        guidance:
          "Use premium descriptors carefully and anchor them to material, finish, process or design intent.",
      },
      {
        title: "Emotional storytelling",
        level: "baseline",
        guidance:
          "Emotional language is allowed when it remains human, tasteful and non-manipulative.",
      },
    ],
    competitorSignals: [
      {
        brand: "Mainstream marketplace incumbents",
        posture: "Price-led scale",
        signal:
          "Neejee should differentiate through curation, taste and meaning rather than trying to out-shout price-based platforms.",
      },
      {
        brand: "Generic handcrafted gift stores",
        posture: "Craft-led but often visually cluttered",
        signal:
          "Neejee should retain craft depth while presenting a calmer, more premium digital experience.",
      },
      {
        brand: "Aspirational premium lifestyle brands",
        posture: "Strong aesthetic confidence",
        signal:
          "Neejee can borrow the restraint and composure, but should remain warmer and more personal.",
      },
    ],
    decisions: [
      "Which product categories define the first public articulation of Neejee’s premium identity?",
      "Which claims require source verification before they can appear in SEO, ads or campaign pages?",
      "How far should performance marketing creatives stretch beyond the quiet-premium brand posture?",
      "Which language rules are mandatory platform-wide versus channel-specific exceptions?",
    ],
  };
}