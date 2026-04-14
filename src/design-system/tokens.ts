/**
 * CrowdSignal — Sentient Terminal Design System
 * TypeScript token exports — mirrors index.css CSS custom properties.
 * Import from components so values never diverge from CSS.
 */

/* --------------------------------------------------------------------------
   COLOR TOKENS
   -------------------------------------------------------------------------- */
export const colors = {
  // Primary accent
  primary:              'hsl(243, 72%, 60%)',
  primaryHover:         'hsl(243, 72%, 55%)',
  primaryContainer:     'hsl(243, 60%, 75%)',
  onPrimary:            'hsl(0, 0%, 100%)',
  onPrimaryContainer:   'hsl(243, 40%, 20%)',

  // Surfaces (tonal stack)
  surfaceLowest:        'hsl(220, 25%, 93%)',
  surfaceLow:           'hsl(220, 22%, 89%)',
  surface:              'hsl(220, 20%, 85%)',
  surfaceHigh:          'hsl(220, 18%, 80%)',
  surfaceHighest:       'hsl(220, 16%, 76%)',
  surfaceBase:          'hsl(220, 24%, 91%)',
  surfaceVariant:       'hsla(220, 22%, 88%, 0.72)',
  surfaceBright:        'hsl(220, 30%, 97%)',
  surfaceDim:           'hsl(220, 18%, 82%)',

  // Content
  onSurface:            'hsl(220, 20%, 14%)',
  onSurfaceVariant:     'hsl(220, 14%, 40%)',
  onSurfaceMuted:       'hsl(220, 10%, 58%)',

  // Outline
  outline:              'hsl(220, 12%, 55%)',
  outlineVariant:       'hsla(220, 15%, 45%, 0.22)',

  // Secondary (Bullish / Success)
  secondary:            'hsl(158, 60%, 35%)',
  secondaryContainer:   'hsl(158, 50%, 88%)',
  onSecondary:          'hsl(0, 0%, 100%)',
  onSecondaryContainer: 'hsl(158, 60%, 12%)',

  // Tertiary (Bearish / Error)
  tertiary:             'hsl(4, 68%, 50%)',
  tertiaryContainer:    'hsl(4, 70%, 91%)',
  onTertiary:           'hsl(0, 0%, 100%)',
  onTertiaryContainer:  'hsl(4, 60%, 18%)',

  // Warning / Hold
  warning:              'hsl(38, 88%, 46%)',
  warningContainer:     'hsl(38, 90%, 90%)',
  onWarning:            'hsl(0, 0%, 100%)',
  onWarningContainer:   'hsl(38, 70%, 14%)',
} as const;

/* --------------------------------------------------------------------------
   SIGNAL SEMANTIC COLORS
   -------------------------------------------------------------------------- */
export const signalColors = {
  BUY:  { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
  SELL: { bg: colors.tertiaryContainer,  text: colors.onTertiaryContainer  },
  HOLD: { bg: colors.warningContainer,   text: colors.onWarningContainer   },
} as const;

export type Signal = keyof typeof signalColors;

export const sentimentColors = {
  bullish: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
  bearish: { bg: colors.tertiaryContainer,  text: colors.onTertiaryContainer  },
  neutral: { bg: colors.surfaceHigh,        text: colors.onSurfaceVariant     },
} as const;

export type SentimentLabel = keyof typeof sentimentColors;

/* --------------------------------------------------------------------------
   SPACING TOKENS
   -------------------------------------------------------------------------- */
export const space = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

/* --------------------------------------------------------------------------
   TYPOGRAPHY TOKENS
   -------------------------------------------------------------------------- */
export const typography = {
  fontDisplay: "'Inter', system-ui, sans-serif",
  fontBody:    "'Inter', system-ui, sans-serif",
  fontMono:    "'JetBrains Mono', 'Consolas', monospace",

  size: {
    displayLg:  'clamp(2.5rem, 5vw, 3.75rem)',
    displayMd:  'clamp(2rem, 4vw, 3rem)',
    displaySm:  'clamp(1.75rem, 3vw, 2.25rem)',
    headlineLg: '1.75rem',
    headlineMd: '1.375rem',
    headlineSm: '1.125rem',
    titleLg:    '1rem',
    titleMd:    '0.875rem',
    bodyLg:     '1rem',
    bodyMd:     '0.875rem',
    bodySm:     '0.8125rem',
    labelLg:    '0.875rem',
    labelMd:    '0.75rem',
    labelSm:    '0.6875rem',
    monoLg:     '0.9375rem',
    monoMd:     '0.8125rem',
    monoSm:     '0.75rem',
  },

  weight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold:800,
    black:    900,
  },

  tracking: {
    display:   '-0.02em',
    headline:  '-0.015em',
    body:       '0',
    labelPro:  '+0.05em',
    mono:      '-0.01em',
  },

  leading: {
    tight:   1.15,
    snug:    1.30,
    normal:  1.50,
    relaxed: 1.65,
  },
} as const;

/* --------------------------------------------------------------------------
   RADIUS TOKENS
   -------------------------------------------------------------------------- */
export const radius = {
  xs:   '4px',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl':'28px',
  full: '9999px',
} as const;

/* --------------------------------------------------------------------------
   SHADOW TOKENS
   -------------------------------------------------------------------------- */
export const shadow = {
  xs:      '0 1px 2px hsla(220, 20%, 40%, 0.08)',
  sm:      '0 2px 6px hsla(220, 20%, 35%, 0.10), 0 1px 2px hsla(220, 20%, 35%, 0.06)',
  md:      '0 4px 16px hsla(220, 20%, 30%, 0.12), 0 2px 4px hsla(220, 20%, 30%, 0.06)',
  lg:      '0 8px 32px hsla(220, 22%, 25%, 0.14), 0 4px 8px hsla(220, 22%, 25%, 0.06)',
  ambient: '0 20px 40px hsla(220, 22%, 25%, 0.08)',
  glowPrimary: '0 0 0 4px hsla(243, 72%, 60%, 0.10)',
} as const;

/* --------------------------------------------------------------------------
   MOTION TOKENS
   -------------------------------------------------------------------------- */
export const motion = {
  easeOut:    'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut:  'cubic-bezier(0.4, 0, 0.2, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  durationFast:   '120ms',
  durationBase:   '220ms',
  durationSlow:   '380ms',
  durationSlower: '550ms',
} as const;

/* --------------------------------------------------------------------------
   LAYOUT TOKENS
   -------------------------------------------------------------------------- */
export const layout = {
  sidebarWidth:  '240px',
  topbarHeight:  '60px',
  contentMax:   '1280px',
  contentNarrow: '800px',
} as const;

/* --------------------------------------------------------------------------
   Z-INDEX SCALE
   -------------------------------------------------------------------------- */
export const zIndex = {
  base:     0,
  raised:   10,
  overlay:  100,
  dropdown: 200,
  modal:    300,
  toast:    400,
  tooltip:  500,
} as const;
