/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        background: "#ffffff",
        foreground: "#000000",
        border: "#e2e8f0",
      },
      fontFamily: {
        macos: 'ChiKareGo2, ui-serif', // Adds a new `font-display` class
      },
      cursor: {
        'default': 'url(/macos_assets/cursor.png), auto',
      },
      backgroundImage: {
        'chessboard': 'url(/macos_assets/background.png)',
        'pattern-grid-lg': 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
        'pattern-grid-dark': 'linear-gradient(to right, #4a5568 1px, transparent 1px), linear-gradient(to bottom, #4a5568 1px, transparent 1px)'
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

