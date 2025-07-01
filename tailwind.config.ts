import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ensure white is explicitly defined
        white: "#ffffff",
        black: "#000000",
        
        // --- CENTRALIZED THEME SYSTEM ---
        // 🎨 These colors now use CSS custom properties from globals.css
        // 🔄 Change theme by editing globals.css :root variables only!
        
        // MASTER BRAND COLORS (maps to CSS custom properties)
        'theme': {
          // Pearl/Background system - Used in: Page backgrounds, cards, sections
          'pearl-50': 'var(--pearl-primary)',       // #FDF9F4 - Main backgrounds
          'pearl-100': 'var(--pearl-secondary)',    // #F8F6F0 - Card backgrounds  
          'pearl-200': 'var(--pearl-tertiary)',     // #F0EDE5 - Subtle backgrounds
          
          // Gold/Text system - Used in: Typography, borders, accents
          'gold-400': 'var(--gold-primary)',        // #C8B38A - Primary gold
          'gold-600': 'var(--gold-secondary)',      // #8C7760 - Body text
          'gold-700': 'var(--gold-tertiary)',       // #4A2E21 - Headers
          'gold-800': 'var(--gold-dark)',           // #2D1B13 - Strong emphasis
          
          // Rose gold system - Used in: Accents, highlights, special features
          'rose-50': 'var(--rose-gold-light)',      // #FDF5F3 - Light backgrounds
          'rose-400': 'var(--rose-gold-primary)',   // #D7AFA4 - Main accent
          'rose-500': 'var(--rose-gold-secondary)', // #C89A8A - Secondary accent
          'rose-600': 'var(--rose-gold-dark)',      // #A06B52 - Dark accent
          
          // Mist blue system - Used in: Cool sections, info panels
          'mist-50': 'var(--mist-blue-light)',      // #F7FAFB - Light blue
          'mist-200': 'var(--mist-blue-primary)',   // #D0E0E7 - Primary blue
          'mist-300': 'var(--mist-blue-secondary)', // #B5CDD8 - Secondary blue
        },
        
        // FUNCTIONAL COLORS (semantic colors for status, alerts, etc.)
        'status': {
          // Success colors - Used in: Success messages, completed orders
          'success': 'var(--success-primary)',      // #10B981
          'success-bg': 'var(--success-secondary)', // #D1FAE5
          
          // Warning colors - Used in: Warnings, pending states
          'warning': 'var(--warning-primary)',      // #F59E0B
          'warning-bg': 'var(--warning-secondary)', // #FEF3C7
          
          // Error colors - Used in: Errors, failed states
          'error': 'var(--error-primary)',          // #EF4444
          'error-bg': 'var(--error-secondary)',     // #FEE2E2
          
          // Info colors - Used in: Information, help tooltips
          'info': 'var(--info-primary)',            // #3B82F6
          'info-bg': 'var(--info-secondary)',       // #DBEAFE
        },
        
        // COMPONENT-SPECIFIC COLORS (for specific UI components)
        'ui': {
          // Backgrounds - Used in: Page layouts, overlays
          'bg-primary': 'var(--background)',
          'bg-secondary': 'var(--background-secondary)',
          'bg-muted': 'var(--background-muted)',
          
          // Text colors - Used in: All text elements
          'text-primary': 'var(--foreground)',
          'text-secondary': 'var(--foreground-secondary)',
          'text-muted': 'var(--foreground-muted)',
          
          // Borders - Used in: Dividers, outlines
          'border-primary': 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
          'border-muted': 'var(--border-muted)',
          
          // Interactive states - Used in: Hover, focus, active
          'hover-bg': 'var(--hover-background)',
          'hover-text': 'var(--hover-foreground)',
          'active-bg': 'var(--active-background)',
          'active-text': 'var(--active-foreground)',
          'focus-ring': 'var(--focus-ring)',
        },
        
        // JEWELRY-SPECIFIC COLORS (for product displays)
        'jewelry': {
          // Metal colors - Used in: Product cards, category filters
          'gold': 'var(--jewelry-gold)',            // Gold jewelry
          'silver': 'var(--jewelry-silver)',        // Silver jewelry
          'rose-gold': 'var(--jewelry-rose-gold)',  // Rose gold jewelry
          'diamond': 'var(--jewelry-diamond)',      // Diamond/precious stones
          'pearl': 'var(--jewelry-pearl)',          // Pearl products
        },
        
        // ECOMMERCE-SPECIFIC COLORS (for shopping features)
        'commerce': {
          // Cart & Shopping - Used in: Cart, badges, counts
          'cart-badge': 'var(--cart-count)',        // Cart item count
          
          // Pricing - Used in: Product prices, discounts
          'price-regular': 'var(--price-original)',  // Regular prices
          'price-sale': 'var(--price-sale)',        // Sale prices
          'price-discount': 'var(--price-discount)', // Discount labels
          
          // Shipping - Used in: Shipping info, delivery
          'shipping-free': 'var(--shipping-free)',   // Free shipping
        },
        
        // ADMIN COLORS (for admin/dashboard areas)
        'admin': {
          'primary': 'var(--admin-primary)',
          'secondary': 'var(--admin-secondary)',
          'accent': 'var(--admin-accent)',
        },
        
        // LEGACY PEARL ESSENCE COLORS (for backward compatibility)
        // These maintain the old naming but now use CSS custom properties
        'pearl-essence': {
          50: 'var(--pearl-primary)',      // Main pearl white
          100: 'var(--pearl-secondary)',   // Warm pearl
          200: 'var(--pearl-tertiary)',    // Deep pearl
          300: 'var(--pearl-tertiary)',    // Borders
          400: 'var(--gold-primary)',      // Gold accents
          500: 'var(--gold-primary)',      // Primary gold
          600: 'var(--gold-secondary)',    // Secondary gold
          700: 'var(--gold-tertiary)',     // Dark gold/brown
          800: 'var(--gold-dark)',         // Deep brown
          900: '#1A0F0A',                  // Rich espresso
        },
        
        'rose-gold': {
          50: 'var(--rose-gold-light)',
          100: 'var(--rose-gold-light)',
          200: 'var(--rose-gold-light)',
          300: 'var(--rose-gold-primary)',
          400: 'var(--rose-gold-primary)',
          500: 'var(--rose-gold-secondary)',
          600: 'var(--rose-gold-dark)',
          700: 'var(--rose-gold-dark)',
          800: '#7D5240',
          900: '#5A3B2E',
        },
        
        'mist-blue': {
          50: 'var(--mist-blue-light)',
          100: 'var(--mist-blue-light)',
          200: 'var(--mist-blue-primary)',
          300: 'var(--mist-blue-secondary)',
          400: '#9ABAC9',
          500: '#7FA7BA',
          600: '#6494AB',
          700: '#4F7B8C',
          800: '#3A5B6D',
          900: '#253C4E',
        },
        // Premium Jewelry Color Palette
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
          DEFAULT: "#0D1E78", // Deep Sapphire Blue
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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        // Courier Colors
        pathao: {
          light: '#fce8e6', // A light, pale red
          dark: '#e63946',  // The official Pathao red
        },
        redx: {
          DEFAULT: '#d90429', // A strong, royal red
        },
        carrybee: {
          DEFAULT: '#ffca3a', // A vibrant yellow
          dark: '#c47d00',
        },
        'steadfast-green': {
          DEFAULT: '#2a9d8f', // A calm, steady green
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
        
        // DYNAMIC GRADIENTS (using CSS custom properties)
        // 🎨 These automatically update when you change colors in globals.css
        
        // Primary brand gradients - Used in: Hero sections, main CTAs
        'gradient-pearl-essence': 'linear-gradient(135deg, var(--pearl-primary) 0%, var(--pearl-secondary) 50%, var(--pearl-tertiary) 100%)',
        'gradient-champagne': 'linear-gradient(135deg, var(--pearl-tertiary) 0%, var(--gold-primary) 100%)',
        'gradient-rose-gold': 'linear-gradient(135deg, var(--rose-gold-light) 0%, var(--rose-gold-primary) 100%)',
        'gradient-mist': 'linear-gradient(135deg, var(--mist-blue-primary) 0%, var(--mist-blue-secondary) 100%)',
        
        // Warm gradients - Used in: Cards, buttons, highlights
        'gradient-warm-pearl': 'linear-gradient(135deg, var(--pearl-primary) 0%, var(--pearl-secondary) 50%, var(--pearl-tertiary) 100%)',
        'gradient-gold-accent': 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%)',
        'gradient-button-primary': 'linear-gradient(135deg, var(--btn-primary) 0%, var(--gold-dark) 100%)',
        'gradient-button-accent': 'linear-gradient(135deg, var(--btn-accent) 0%, var(--rose-gold-secondary) 100%)',
        
        // Legacy gradients (maintained for compatibility)
        'gradient-gold': 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%)',
        'gradient-pearl': 'linear-gradient(135deg, var(--pearl-primary) 0%, var(--pearl-tertiary) 100%)',
        'gradient-primary': 'linear-gradient(135deg, var(--gold-tertiary) 0%, var(--gold-dark) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--rose-gold-primary) 0%, var(--rose-gold-secondary) 100%)',
        
        // Utility gradients
        'pearl-shimmer': 'linear-gradient(90deg, transparent, rgba(253, 249, 244, 0.4), transparent)',
      },
      boxShadow: {
        // DYNAMIC SHADOWS (using CSS custom properties)
        // 🎨 These automatically update when you change colors in globals.css
        
        // Brand shadows - Used in: Cards, modals, dropdowns
        'pearl-essence': '0 4px 20px 0 rgba(253, 249, 244, 0.6)',
        'champagne': '0 4px 20px 0 color-mix(in srgb, var(--gold-primary) 40%, transparent)',
        'rose-gold': '0 4px 20px 0 color-mix(in srgb, var(--rose-gold-primary) 30%, transparent)',
        'mist-blue': '0 4px 20px 0 color-mix(in srgb, var(--mist-blue-primary) 30%, transparent)',
        'cocoa': '0 8px 32px 0 color-mix(in srgb, var(--gold-tertiary) 15%, transparent)',
        
        // Functional shadows - Used in: Interactive elements
        'hover': '0 8px 25px 0 color-mix(in srgb, var(--shadow-color) 20%, transparent)',
        'focus': '0 0 0 3px color-mix(in srgb, var(--focus-ring) 30%, transparent)',
        'active': '0 2px 10px 0 color-mix(in srgb, var(--active-background) 40%, transparent)',
        
        // Legacy shadows (maintained for compatibility)
        'pearl': '0 4px 14px 0 rgba(253, 249, 244, 0.39)',
        'gold': '0 4px 14px 0 color-mix(in srgb, var(--gold-primary) 39%, transparent)',
        'sapphire': '0 4px 14px 0 rgba(13, 30, 120, 0.39)',
        'premium': '0 8px 32px 0 color-mix(in srgb, var(--gold-tertiary) 15%, transparent)',
        'accent': '0 4px 20px 0 color-mix(in srgb, var(--rose-gold-primary) 30%, transparent)',
      },
    },
  },
  plugins: [
    tailwindcssAnimate
  ],
} satisfies Config

export default config