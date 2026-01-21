import React from 'react';

export default function WishlistCard({ livro, onComecarLeitura, onExcluir }) {
  const capaPadrao = "/image_3df126.jpg"; 

  const handleImageError = (e) => {
    e.target.src = capaPadrao;
    e.target.onerror = null;
  };

  return (
    <div className="group relative flex flex-col bg-surface rounded-lg border border-muted-silver/10 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-burnished-gold/10 hover:-translate-y-1 h-full">
      
      {/* Imagem Vertical (Capa do Livro) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-rich-charcoal">
        <img
          src={livro.urlCapa || capaPadrao}
          alt={`Capa do livro ${livro.titulo}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[30%] group-hover:grayscale-0"
          onError={handleImageError}
        />
        
        {/* CORREÇÃO: Tag de Status "QUERO LER" */}
        <div className="absolute top-3 left-3 z-10">
            <span className="bg-purple-900/90 text-purple-200 text-xs font-bold px-2 py-1 rounded border border-purple-500/30 shadow-lg uppercase tracking-wider">
                Quero Ler
            </span>
        </div>
        
        {/* Botão Excluir (X discreto no topo direito) */}
        <button
            onClick={(e) => { e.stopPropagation(); onExcluir(livro.id); }}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-900/90 text-white/70 hover:text-white rounded-full transition-all backdrop-blur-sm z-20"
            title="Remover da lista"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Tag de Páginas sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
             <span className="text-xs font-sans-modern text-muted-silver tracking-wider uppercase font-semibold">
                {livro.totalPaginas ? `${livro.totalPaginas} PÁGINAS` : ''}
             </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-serif-display text-lg text-antique-white leading-tight mb-1 group-hover:text-burnished-gold transition-colors line-clamp-2" title={livro.titulo}>
          {livro.titulo}
        </h3>
        <p className="text-sm text-muted-silver font-sans-modern mb-4 line-clamp-1">
          {livro.autor || 'Autor desconhecido'}
        </p>

        {/* Botão de Ação Principal */}
        <div className="mt-auto pt-2">
          <button
            onClick={() => onComecarLeitura(livro)}
            className="w-full py-2.5 px-4 bg-burnished-gold text-rich-charcoal font-bold font-sans-modern text-sm rounded shadow-lg shadow-burnished-gold/5 hover:bg-[#d4b485] hover:shadow-burnished-gold/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Ler Agora
          </button>
        </div>
      </div>
    </div>
  );
}