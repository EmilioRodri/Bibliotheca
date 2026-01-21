import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export default function HeroSection() {
  return (
    <div className="relative h-screen w-full flex items-center overflow-hidden bg-rich-charcoal">
        
        {/* Imagem de Fundo (Alinhada à direita para não brigar com o texto) */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1920" 
                alt="Biblioteca Antiga" 
                className="w-full h-full object-cover opacity-40 bg-right"
            />
            {/* Gradiente suave para o texto ser legível */}
            <div className="absolute inset-0 bg-gradient-to-r from-rich-charcoal via-rich-charcoal/80 to-transparent"></div>
        </div>

        {/* Conteúdo (Alinhado à esquerda) */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex items-center">
            <div className="max-w-3xl space-y-8 animate-fade-in text-left">
                
                <span className="inline-block text-burnished-gold font-bold tracking-[0.2em] text-sm md:text-base uppercase border-b border-burnished-gold/50 pb-2">
                    Acervo Pessoal Digital
                </span>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif-display text-antique-white leading-tight drop-shadow-2xl">
                    Clássicos <br/> <span className="italic text-muted-silver">Imortais.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-silver/90 font-light leading-relaxed max-w-2xl drop-shadow-md">
                    Organize, acompanhe e redescubra suas leituras. Uma plataforma digital desenhada para quem vê em cada livro um universo particular.
                </p>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <Link to="/cadastro">
                        <Button className="px-8 py-4 text-lg shadow-lg shadow-burnished-gold/20 w-full sm:w-auto">
                            Criar Minha Biblioteca
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}