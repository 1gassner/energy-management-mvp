/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Production CSS optimization (Tailwind v3 compatible)
  ...(process.env.NODE_ENV === 'production' && {
    safelist: [
      // Keep dynamic classes that might be generated
      'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-900',
      'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-900',
      'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-900',
      'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-900',
      'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-900',
      'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700', 'bg-cyan-900',
      'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700', 'bg-emerald-900',
      'text-blue-600', 'text-blue-700', 'text-green-600', 'text-green-700',
      'text-orange-600', 'text-orange-700', 'text-red-600', 'text-red-700',
      'text-purple-600', 'text-purple-700', 'text-cyan-600', 'text-cyan-700',
      'text-emerald-600', 'text-emerald-700',
      'border-blue-500', 'border-green-500', 'border-orange-500', 'border-red-500',
      'border-purple-500', 'border-cyan-500', 'border-emerald-500',
      // Animation classes
      'animate-pulse', 'animate-spin', 'animate-bounce', 'animate-fade-in',
      'animate-slide-up', 'animate-slide-in-right', 'animate-pulse-slow',
      'animate-bounce-subtle', 'animate-scale-in',
      // Grid classes
      'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5',
      'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5',
      'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4',
      // Mobile-specific classes
      'min-h-[120px]', 'min-h-[200px]', 'min-h-[250px]', 'min-h-[300px]',
      'max-w-[85vw]', 'max-w-[90vw]', 'max-w-[95vw]',
      'min-w-[500px]', 'min-w-[600px]',
      // Glass effect classes
      'backdrop-blur-xs', 'backdrop-blur-sm', 'backdrop-blur-md',
      // Responsive breakpoints
      'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-5',
      'sm:gap-2', 'sm:gap-3', 'sm:gap-4', 'sm:gap-6',
      'sm:p-4', 'sm:p-6', 'sm:px-4', 'sm:py-6',
      'sm:text-lg', 'sm:text-xl', 'sm:text-2xl',
      'sm:w-7', 'sm:h-7', 'sm:w-8', 'sm:h-8',
      'lg:w-8', 'lg:h-8', 'lg:text-2xl', 'lg:text-3xl'
    ]
  }),
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // Stadt Hechingen Official Brand Colors
        hechingen: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe', 
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#2563eb', // Official Hechingen Blue
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#172554',
          },
          accent: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Official Hechingen Grey
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#16a34a', // Sustainability Green
            600: '#15803d',
            700: '#166534',
            900: '#14532d',
          },
          heritage: {
            50: '#fefce8',
            100: '#fef3c7',
            500: '#eab308', // Zollernstadt Gold
            600: '#ca8a04',
            700: '#a16207',
            900: '#713f12',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Mobile-first breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
      },
      backgroundImage: {
        'hechingen-gradient': 'linear-gradient(135deg, #2563eb 0%, #64748b 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(100, 116, 139, 0.8) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        'mobile-gradient': 'linear-gradient(180deg, rgba(37, 99, 235, 0.05) 0%, rgba(248, 250, 252, 0.1) 100%)',
      },
      boxShadow: {
        'hechingen': '0 10px 25px -5px rgba(37, 99, 235, 0.15), 0 4px 6px -2px rgba(37, 99, 235, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'mobile-active': '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}