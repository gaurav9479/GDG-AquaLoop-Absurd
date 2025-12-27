/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure this points to your pages folder!
  ],
  theme: {
    extend: {
      colors: {
        // Deep Backgrounds
        'aqua-dark': '#0b141a',      // Darkest background
        'aqua-surface': '#15222b',   // Card / Section background
        'aqua-border': '#22343f',    // Subtle borders
        
        // Accents & Glows
        'aqua-cyan': '#00e5ff',      // Neon cyan buttons/gauges
        'aqua-teal': '#008b9a',      // Primary teal for active states
        'aqua-blue': '#22d3ee',      // Secondary sky blue
        
        // Status Colors
        'aqua-warning': '#f59e0b',   // Warning orange
        'aqua-success': '#10b981',   // Success green
      },
      backgroundImage: {
        'aqua-gradient': 'radial-gradient(circle at top left, #1a2e38 0%, #0b141a 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 229, 255, 0.3)',
      }
    },
  },
  plugins: [],
};
