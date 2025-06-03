export const colors = {
  primary: {
    DEFAULT: '#B76E79', // A sophisticated rose gold
    light: '#D4A5AC',
    dark: '#8C4E57',
  },
  secondary: {
    DEFAULT: '#2C3E50', // Deep blue-gray
    light: '#34495E',
    dark: '#2C3E50',
  },
  accent: {
    DEFAULT: '#E5C3A6', // Warm gold
    light: '#F2D9C7',
    dark: '#C7A88D',
  },
  background: {
    DEFAULT: '#FFFFFF',
    paper: '#F8F9FA',
    dark: '#1A1A1A',
  },
  text: {
    primary: '#2C3E50',
    secondary: '#6C757D',
    light: '#FFFFFF',
  },
} as const;

export type ColorKeys = keyof typeof colors; 