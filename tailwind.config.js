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
  		colors: {},
      fontFamily: {
        macos: 'ChiKareGo2, ui-serif', // Adds a new `font-display` class
      },
      cursor: {
        'default': 'url(/macos_assets/cursor.png), auto',
      },
      backgroundImage: {
        'chessboard': 'url(/macos_assets/background.png)'
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

