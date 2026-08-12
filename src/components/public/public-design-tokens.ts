export const publicDesignTokens = {
  color: {
    bg: "var(--oi-color-bg)",
    surface: "var(--oi-color-surface)",
    surfaceAlt: "var(--oi-color-surface-alt)",
    text: "var(--oi-color-text)",
    textMuted: "var(--oi-color-text-muted)",
    brand: "var(--oi-color-brand)",
    brandAlt: "var(--oi-color-brand-alt)",
    border: "var(--oi-color-border)"
  },
  space: {
    xs: "var(--oi-space-2)",
    sm: "var(--oi-space-3)",
    md: "var(--oi-space-4)",
    lg: "var(--oi-space-6)",
    xl: "var(--oi-space-8)",
    xxl: "var(--oi-space-10)"
  },
  radius: {
    sm: "var(--oi-radius-sm)",
    md: "var(--oi-radius-md)",
    lg: "var(--oi-radius-lg)",
    pill: "var(--oi-radius-pill)"
  },
  shadow: {
    soft: "var(--oi-shadow-soft)",
    card: "var(--oi-shadow-card)"
  },
  typography: {
    body: "var(--oi-font-body)",
    display: "var(--oi-font-display)",
    leading: "var(--oi-leading-body)",
    tracking: "var(--oi-tracking-display)"
  }
} as const;