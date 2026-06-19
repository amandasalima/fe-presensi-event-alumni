// Alumni Brand Colors
export const COLORS = {
  primary: '#41A07E',
  secondary: '#B2DE96',
  primaryDark: '#357f65',
  primaryLight: '#5ab494',
} as const;

// Admin Brand Colors
export const ADMIN_COLORS = {
  main: '#2D7EA0',        // Main bold color
  support: '#3EBDAF',     // Accent/highlight
  light: '#7AB2B2',       // Light backgrounds
  mainDark: '#236175',    // Hover states
  supportLight: '#A8D5D5', // Very light backgrounds
} as const;

// Gradient styles for buttons and backgrounds
export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
  secondary: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
  light: `linear-gradient(160deg, #f0fdf4 0%, #dcfce7 40%, ${COLORS.secondary} 100%)`,
} as const;
