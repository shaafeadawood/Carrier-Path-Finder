/**
 * Career Compass Design System - Color Palette
 * A professional color system that ensures consistency across the application
 */

const colors = {
  // Primary brand colors
  primary: {
    50: '#EEF2FF',  // Lightest shade
    100: '#E0E7FF', 
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',  // Darkest shade
  },
  
  // Secondary colors for accents
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main secondary color
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  
  // Success colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Warning colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Neutral colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // Main neutral color
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Background colors for light/dark modes
const backgrounds = {
  light: {
    primary: '#FFFFFF',
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  dark: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2D2D2D',
  }
};

// Text colors for light/dark modes
const text = {
  light: {
    primary: colors.neutral[900],
    secondary: colors.neutral[700],
    tertiary: colors.neutral[500],
    inverse: '#FFFFFF',
  },
  dark: {
    primary: '#FFFFFF',
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    inverse: colors.neutral[900],
  }
};

export { colors, backgrounds, text };
