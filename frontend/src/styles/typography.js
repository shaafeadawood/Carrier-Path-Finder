/**
 * Career Compass Design System - Typography
 * A consistent typography system that scales appropriately across device sizes
 */

const fontFamily = {
  sans: ["'Inter'", "'Segoe UI'", 'Roboto', 'Arial', 'sans-serif'],
  display: ["'Poppins'", "'Segoe UI'", 'Roboto', 'Arial', 'sans-serif'],
  mono: ["'Roboto Mono'", 'monospace'],
};

const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px  
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
};

const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

const textStyles = {
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.display.join(', '),
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.display.join(', '),
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.display.join(', '),
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.display.join(', '),
  },
  h5: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.display.join(', '),
  },
  h6: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.display.join(', '),
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.sans.join(', '),
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.sans.join(', '),
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans.join(', '),
  },
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans.join(', '),
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.sans.join(', '),
  },
};

export { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles };