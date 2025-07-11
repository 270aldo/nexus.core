/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
      'josefin': ["Josefin Sans", "sans-serif"], // For NGX agents names
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Shadcn/ui base colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        
        // NGX Brand Colors - Professional Identity System
        ngx: {
          // Primary Brand Colors
          'black-onyx': '#0D0D0D',      // Base NGX black
          'electric-violet': '#8B5CF6',  // Primary accent
          'deep-purple': '#6366F1',      // Secondary accent
          
          // Extended Brand Palette
          'slate': {
            50: '#F8FAFC',
            100: '#F1F5F9', 
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          
          // Program-specific Colors
          'prime': {
            50: '#FDF4FF',
            100: '#FAE8FF',
            500: '#A855F7',   // Electric Violet variant for PRIME
            600: '#9333EA',
            700: '#7C3AED',
            800: '#6B21A8',
            900: '#581C87',
          },
          
          'longevity': {
            50: '#EEF2FF',
            100: '#E0E7FF',
            500: '#6366F1',   // Deep Purple for LONGEVITY
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
          },
          
          // Agent Colors (for 9 NGX Agents)
          'agents': {
            'nexus': '#8B5CF6',     // Main orchestrator - Electric Violet
            'blaze': '#EF4444',     // Intensity - Red
            'sage': '#22C55E',      // Wisdom - Green
            'wave': '#06B6D4',      // Flow - Cyan
            'spark': '#F59E0B',     // Energy - Amber
            'stella': '#EC4899',    // Precision - Pink
            'nova': '#8B5CF6',      // Innovation - Purple
            'code': '#6B7280',      // Technical - Gray
            'luna': '#6366F1',      // Intuition - Indigo
          },
          
          // Status & Feedback Colors
          'success': '#22C55E',
          'warning': '#F59E0B', 
          'error': '#EF4444',
          'info': '#3B82F6',
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};