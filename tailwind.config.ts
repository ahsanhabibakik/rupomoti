import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Premium Jewelry Color Palette
        primary: {
          DEFAULT: "#0D1E78", // Deep Sapphire Blue
          light: "#1A237E",
          dark: "#000051",
        },
        accent: {
          DEFAULT: "#E8CBAF", // Champagne Gold
          light: "#F5E6D3",
          dark: "#D4B483",
        },
        base: {
          DEFAULT: "#FDF9F4", // Ivory / Pearl White
          light: "#FFFDFA",
          dark: "#F8F6F0",
        },
        neutral: {
          DEFAULT: "#4A2E21", // Soft Cocoa Brown
          light: "#8B6E4F",
          dark: "#2D1B13",
        },
        highlight: {
          DEFAULT: "#F5E7DD", // Pearl Pink / Rose Beige
          light: "#FDF9F4",
          dark: "#E6D5C7",
        },
        // Legacy colors for backward compatibility
        pearl: {
          DEFAULT: "#FDF9F4", // Updated to Ivory/Pearl White
          light: "#FFFDFA",
          dark: "#F8F6F0",
        },
        gold: {
          DEFAULT: "#E8CBAF", // Updated to Champagne Gold
          light: "#F5E6D3",
          dark: "#D4B483",
          rose: "#B76E79",
        },
        sapphire: {
          DEFAULT: "#0D1E78", // Updated to Deep Sapphire Blue
          light: "#1A237E",
          dark: "#000051",
        },
        emerald: {
          DEFAULT: "#2E7D6A",
          light: "#60AD5E",
          dark: "#005005",
        },
        // Accent Colors
        blush: {
          DEFAULT: "#F7CAC9",
          light: "#FFE4E3",
          dark: "#E6A8A7",
        },
        amethyst: {
          DEFAULT: "#9B59B6",
          light: "#CE93D8",
          dark: "#6A1B9A",
        },
        // Text Colors
        charcoal: {
          DEFAULT: "#4A2E21", // Updated to Soft Cocoa Brown
          light: "#8B6E4F",
          dark: "#2D1B13",
        },
        slate: {
          DEFAULT: "#666666",
          light: "#888888",
          dark: "#444444",
        },
        // UI Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)', 'var(--font-cormorant)', 'serif'],
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "gold-sparkle": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(0) rotate(360deg)", opacity: "0" },
        },
        "pearl-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "slide-out": "slide-out 0.5s ease-out",
        "gold-sparkle": "gold-sparkle 1.5s ease-in-out infinite",
        "pearl-shimmer": "pearl-shimmer 3s ease-in-out infinite",
      },
      backgroundImage: {
        'pearl-pattern': "url('/images/pearl-pattern.svg')",
        'gem-pattern': "url('/images/gem-pattern.svg')",
        'gradient-gold': 'linear-gradient(135deg, #E8CBAF 0%, #D4B483 100%)',
        'gradient-pearl': 'linear-gradient(135deg, #FDF9F4 0%, #F5E7DD 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0D1E78 0%, #1A237E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E8CBAF 0%, #F5E6D3 100%)',
        'pearl-shimmer': 'linear-gradient(90deg, transparent, rgba(248, 246, 240, 0.4), transparent)',
      },
      boxShadow: {
        'pearl': '0 4px 14px 0 rgba(253, 249, 244, 0.39)',
        'gold': '0 4px 14px 0 rgba(232, 203, 175, 0.39)',
        'sapphire': '0 4px 14px 0 rgba(13, 30, 120, 0.39)',
        'premium': '0 8px 32px 0 rgba(13, 30, 120, 0.15)',
        'accent': '0 4px 20px 0 rgba(232, 203, 175, 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config 