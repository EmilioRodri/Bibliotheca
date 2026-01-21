import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button'; // Importando nosso botão novo

export default function LandingNavbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 py-6">
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* Logo Novo (Alinhado à esquerda) */}
        <div className="text-2xl md:text-3xl font-serif-display text-antique-white tracking-wider font-bold">
          BIBLIOTHECA<span className="text-burnished-gold">.</span>
        </div>

        {/* Botões à direita */}
        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="text-antique-white hover:text-burnished-gold font-medium transition-colors text-base px-4 py-2">
              Entrar
            </button>
          </Link>
          <Link to="/cadastro">
            <Button className="px-6 py-2 shadow-lg shadow-burnished-gold/20 text-base">
              Começar Coleção
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}