/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundo principal (quase preto)
        'rich-charcoal': '#0F1115', 
        // ADIÇÃO: Um tom levemente mais claro para inputs e cards
        'surface': '#181b21',       
        // Texto principal
        'antique-white': '#EAE6DD', 
        // Texto secundário / Bordas sutis
        'muted-silver': '#8A8F98',  
        // Cor de destaque (Dourado)
        'burnished-gold': '#C6A87C', 
      },
      fontFamily: {
        // Lembre-se de importar a Playfair Display no index.html ou css
        'serif-display': ['"Playfair Display"', 'serif'], 
        // Lembre-se de importar a Montserrat no index.html ou css
        'sans-modern': ['"Montserrat"', 'sans-serif'],   
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}