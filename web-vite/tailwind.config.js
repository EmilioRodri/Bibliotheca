/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Um fundo escuro quente, lembrando couro gasto ou nanquim
        'rich-charcoal': '#1a1817', 
        // Superfícies levemente mais claras para criar relevo
        'surface': '#242220',      
        // Dourado fosco e envelhecido, sem parecer neon
        'burnished-gold': '#c2a878', 
        // Dourado mais escuro para bordas sutis
        'dark-gold': '#8a7653',    
        // Branco com tom de papiro/página velha para os textos
        'antique-white': '#f4eee0', 
        // Cinza quente para textos secundários
        'muted-silver': '#a39d93',   
      },
      fontFamily: {
        'serif-display': ['"Playfair Display"', 'serif'],
        'sans-modern': ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        // Sombra profunda e densa, em vez de sombras coloridas
        'editorial': '0 20px 40px -15px rgba(0,0,0,0.7)',
      }
    },
  },
  plugins: [],
}