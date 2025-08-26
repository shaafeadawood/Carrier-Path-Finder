/**
 * Career Compass Design System
 * Export all design system components for easy import across the application
 */

import { colors, backgrounds, text } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles } from './typography';
import { spacing, borderRadius, shadows, layouts } from './layout';

// Custom CSS Classes
const utilityClasses = {
  // Buttons
  buttonPrimary: `
    inline-flex items-center justify-center px-6 py-3 
    bg-gradient-to-r from-primary-600 to-secondary-600 
    text-white font-medium rounded-xl
    shadow-lg shadow-primary-500/30
    hover:from-primary-700 hover:to-secondary-700 
    transform hover:scale-[1.02] active:scale-[0.98]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `,
  
  buttonSecondary: `
    inline-flex items-center justify-center px-6 py-3 
    bg-white dark:bg-neutral-800 
    text-primary-700 dark:text-primary-300 font-medium rounded-xl
    border border-primary-200 dark:border-neutral-700
    shadow-sm hover:shadow-md
    hover:bg-primary-50 dark:hover:bg-neutral-700
    transform hover:scale-[1.02] active:scale-[0.98]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `,
  
  buttonOutline: `
    inline-flex items-center justify-center px-6 py-3 
    bg-transparent 
    text-primary-700 dark:text-primary-300 font-medium rounded-xl
    border-2 border-primary-500 dark:border-primary-400
    hover:bg-primary-50 dark:hover:bg-primary-900/20
    transform hover:scale-[1.02] active:scale-[0.98]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `,

  // Cards
  card: `
    bg-white dark:bg-neutral-800 
    rounded-2xl shadow-card
    border border-neutral-100 dark:border-neutral-700
    hover:shadow-cardHover
    transition-all duration-300
  `,
  
  cardInteractive: `
    bg-white dark:bg-neutral-800 
    rounded-2xl shadow-card
    border border-neutral-100 dark:border-neutral-700
    hover:shadow-cardHover hover:scale-[1.02]
    transition-all duration-300
    cursor-pointer
  `,
  
  // Forms
  input: `
    w-full px-4 py-2 
    bg-white dark:bg-neutral-800 
    text-neutral-900 dark:text-white
    border border-neutral-300 dark:border-neutral-600 
    rounded-lg
    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    dark:focus:ring-primary-400 dark:focus:border-primary-400
    transition-colors duration-200
    outline-none
  `,

  // Common page sections
  section: `py-16 px-4 md:px-8`,
  container: `max-w-7xl mx-auto`,
  
  // Page headers
  pageHeader: `
    mb-8 pb-4
    border-b border-neutral-200 dark:border-neutral-700
  `,
};

// Export all design system elements
const designSystem = {
  colors,
  backgrounds,
  text,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  layouts,
  utilityClasses
};

export default designSystem;