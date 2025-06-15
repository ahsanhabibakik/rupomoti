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
        // Primary Colors
        pearl: {
          DEFAULT: "#F8F6F0",
          light: "#FFFDFA",
          dark: "#E6E2D8",
        },
        gold: {
          DEFAULT: "#E6CBA8",
          light: "#F5E6D3",
          dark: "#D4B483",
          rose: "#B76E79",
        },
        sapphire: {
          DEFAULT: "#1A237E",
          light: "#534BAE",
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
          DEFAULT: "#222222",
          light: "#444444",
          dark: "#000000",
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
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "slide-out": "slide-out 0.5s ease-out",
      },
      backgroundImage: {
        'pearl-pattern': "url('/images/pearl-pattern.svg')",
        'gem-pattern': "url('/images/gem-pattern.svg')",
        'gradient-gold': 'linear-gradient(135deg, #E6CBA8 0%, #B76E79 100%)',
        'gradient-pearl': 'linear-gradient(135deg, #F8F6F0 0%, #E6E2D8 100%)',
      },
      boxShadow: {
        'pearl': '0 4px 14px 0 rgba(248, 246, 240, 0.39)',
        'gold': '0 4px 14px 0 rgba(230, 203, 168, 0.39)',
        'sapphire': '0 4px 14px 0 rgba(26, 35, 126, 0.39)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config 