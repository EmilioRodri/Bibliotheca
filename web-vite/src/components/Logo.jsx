import React from 'react';

export default function Logo({ className = "text-4xl", showSubtitle = false }) {
    return (
        <div className="flex flex-col items-center select-none">
            {/* O NOME COM A COLUNA ALINHADA À BASE (BASELINE) */}
            <div className={`font-serif-display text-burnished-gold flex items-baseline tracking-tight group cursor-pointer ${className}`}>
                
                {/* Primeira parte da palavra */}
                <span>BIBL</span>
                
                {/* SVG da Coluna Grega */}
                {/* h-[0.82em] e translate-y-[0.12em] ajustam a coluna para sentar na mesma linha do texto */}
                <svg 
                    viewBox="0 0 24 80" 
                    fill="currentColor" 
                    className="h-[0.82em] w-auto mx-[0.08em] translate-y-[0.12em] group-hover:brightness-125 transition-all"
                >
                    {/* Capitel (Topo da Coluna) */}
                    <rect x="0" y="0" width="24" height="4" rx="0.5" />
                    <rect x="2" y="5" width="20" height="3" rx="0.5" />
                    <rect x="4" y="9" width="16" height="3" rx="0.5" />
                    
                    {/* Fuste (Corpo da Coluna) */}
                    <rect x="6" y="13" width="12" height="54" />
                    
                    {/* Caneluras (Ranhuras escuras) */}
                    <rect x="8.5" y="13" width="1" height="54" fill="#1a1817" opacity="0.6" />
                    <rect x="11.5" y="13" width="1" height="54" fill="#1a1817" opacity="0.6" />
                    <rect x="14.5" y="13" width="1" height="54" fill="#1a1817" opacity="0.6" />

                    {/* Base da Coluna */}
                    <rect x="4" y="68" width="16" height="3" rx="0.5" />
                    <rect x="2" y="72" width="20" height="3" rx="0.5" />
                    <rect x="0" y="76" width="24" height="4" rx="0.5" />
                </svg>
                
                {/* Segunda parte da palavra */}
                <span>OTHECA</span>
                <span className="text-burnished-gold/40 ml-[0.02em]">.</span>
            </div>
            
            {/* O SUBTÍTULO COM ALINHAMENTO REFINADO */}
            {showSubtitle && (
                <div className="mt-5 flex items-center gap-4 opacity-90">
                    <div className="h-[0.5px] w-10 md:w-16 bg-dark-gold/40"></div>
                    <span className="text-muted-silver font-sans-modern text-[10px] md:text-xs uppercase tracking-[0.5em] font-bold">
                        Cânone das Sombras
                    </span>
                    <div className="h-[0.5px] w-10 md:w-16 bg-dark-gold/40"></div>
                </div>
            )}
        </div>
    );
}