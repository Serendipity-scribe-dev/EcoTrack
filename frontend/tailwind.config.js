/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Legacy matrix tokens (keep for other pages) ── */
        neon: '#00FF41',
        'neon-dim': '#00CC33',
        'neon-faint': 'rgba(0,255,65,0.15)',
        matrix: '#003B00',
        'matrix-dark': '#001A00',
        terminal: '#0D0D0D',

        /* ── New Eco Design System ── */
        eco: {
          bg:        '#080c08',
          surface:   '#111611',
          surface2:  '#1a2019',
          green:     '#00BF6F',
          'green-dim': '#009958',
          'green-bright': '#00E87F',
          text:      '#E8F5E9',
          muted:     '#6B8068',
          border:    'rgba(0,191,111,0.15)',
          'border-strong': 'rgba(0,191,111,0.35)',
        },
      },
      fontFamily: {
        /* ── New primary ── */
        poppins: ['"Poppins"', 'sans-serif'],
        /* ── Legacy ── */
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        display: ['"Orbitron"', 'monospace'],
      },
      boxShadow: {
        /* ── Legacy ── */
        neon: '0 0 8px #00FF41, 0 0 20px rgba(0,255,65,0.4)',
        'neon-lg': '0 0 15px #00FF41, 0 0 40px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)',
        glass: '0 4px 30px rgba(0,255,65,0.1)',
        /* ── New eco ── */
        'eco-card': '0 2px 16px rgba(0,0,0,0.5)',
        'eco-card-hover': '0 4px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,191,111,0.2)',
        'eco-glow': '0 0 20px rgba(0,191,111,0.25)',
      },
      animation: {
        /* ── Legacy ── */
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
        'scan': 'scan 4s linear infinite',
        'count-up': 'countUp 0.5s ease-out',
        /* ── New eco ── */
        'arc-fill': 'arcFill 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
      },
      keyframes: {
        /* ── Legacy ── */
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px #00FF41, 0 0 20px rgba(0,255,65,0.3)' },
          '50%': { boxShadow: '0 0 15px #00FF41, 0 0 40px rgba(0,255,65,0.6)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: 1 },
          '96%': { opacity: 0.8 },
          '97%': { opacity: 1 },
          '98%': { opacity: 0.6 },
          '99%': { opacity: 1 },
        },
        scan: {
          '0%': { backgroundPosition: '0 -100vh' },
          '100%': { backgroundPosition: '0 100vh' },
        },
        /* ── New eco ── */
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(24px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
};
