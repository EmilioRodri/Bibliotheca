import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EstanteVirtual({ livros }) {
  const navigate = useNavigate();

  // Se não houver livros, não quebra o layout
  if (!livros || livros.length === 0) {
    return <div className="text-center py-10 text-muted-silver">A estante está vazia.</div>;
  }

  // Calcula a espessura do livro (largura)
  const getEspessura = (paginas) => {
    // Garante que seja um número, padrão 200 se falhar
    const p = parseInt(paginas) || 200;
    // Mínimo 30px, Máximo 80px para ser bem visível
    return Math.max(30, Math.min(80, p / 8));
  };

  // Calcula a altura (aleatória baseada no ID para parecer natural)
  const getAltura = (id) => {
    if (!id) return "90%"; // Fallback se não tiver ID
    try {
        const seed = id.charCodeAt(0) + (id.length > 1 ? id.charCodeAt(1) : 0);
        // Entre 85% e 98% da altura da prateleira
        return `${85 + (seed % 14)}%`;
    } catch (e) {
        return "90%";
    }
  };

  // Cor de fallback para a lombada
  const getCorLombada = (id) => {
    if (!id) return '#2c3e50';
    const cores = ['#3E2723', '#212121', '#1A237E', '#004D40', '#B71C1C', '#4A148C'];
    const index = id.charCodeAt(0) % cores.length;
    return cores[index];
  };

  return (
    <div className="w-full py-12 px-2 md:px-8 animate-fade-in">
      
      {/* MOLDURA DA ESTANTE */}
      <div className="relative w-full max-w-7xl mx-auto bg-[#1e1815] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-t border-white/10 overflow-hidden">
        
        {/* Fundo escuro atrás dos livros */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a1614] to-[#0f0b0a] z-0"></div>

        {/* --- A PRATELEIRA (FLEXBOX) --- */}
        {/* min-h-[400px] garante que haja espaço vertical suficiente */}
        <div className="relative z-10 w-full min-h-[400px] flex items-end justify-start px-6 md:px-12 pb-5 gap-[2px] md:gap-[4px] overflow-x-auto custom-scrollbar">
            
            {livros.map((livro) => (
              <div
                key={livro.id}
                onClick={() => navigate(`/livro/${livro.id}`)}
                className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:z-20 flex-shrink-0"
                style={{
                  width: `${getEspessura(livro.totalPaginas)}px`,
                  height: getAltura(livro.id),
                  // Altura mínima garantida caso o cálculo falhe
                  minHeight: "200px"
                }}
                title={`${livro.titulo} - ${livro.autor}`}
              >
                {/* --- A LOMBADA FÍSICA --- */}
                <div 
                    className="absolute inset-0 rounded-sm overflow-hidden shadow-lg border-l border-white/5 border-r border-black/50"
                    style={{ backgroundColor: getCorLombada(livro.id) }}
                >
                    
                    {/* 1. Imagem da capa como textura (com aspas na URL para segurança) */}
                    {livro.urlCapa && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity"
                            style={{ backgroundImage: `url('${livro.urlCapa}')` }}
                        ></div>
                    )}
                    
                    {/* 2. Efeito de Couro/Textura Antiga (CSS puro) */}
                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)] mix-blend-overlay"></div>

                    {/* 3. Iluminação (Volume Cilíndrico) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-white/5 to-black/70"></div>

                    {/* 4. Detalhes Dourados (Linhas no topo e base) */}
                    <div className="absolute top-4 left-0 right-0 h-[1px] bg-[#d4af37] opacity-60 shadow-[0_0_2px_#d4af37]"></div>
                    <div className="absolute bottom-6 left-0 right-0 h-[1px] bg-[#d4af37] opacity-60 shadow-[0_0_2px_#d4af37]"></div>

                    {/* 5. Título Vertical */}
                    <div className="absolute inset-0 flex items-center justify-center p-1 writing-vertical-rl">
                        <span className="rotate-180 font-serif-display text-[10px] md:text-xs tracking-widest text-white/90 uppercase truncate max-h-[80%] drop-shadow-md group-hover:text-[#d4af37] transition-colors">
                            {livro.titulo && livro.titulo.length > 40 ? livro.titulo.substring(0, 40) + '...' : livro.titulo}
                        </span>
                    </div>
                </div>

                {/* --- TOOLTIP (Ao passar o mouse) --- */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-32 hidden group-hover:block z-30 animate-fade-in pointer-events-none">
                    <div className="bg-black/90 p-2 rounded border border-[#d4af37] shadow-2xl text-center">
                         {livro.urlCapa && (
                             <img src={livro.urlCapa} alt="Capa" className="w-full aspect-[2/3] object-cover rounded mb-1 border border-white/10"/>
                         )}
                         <p className="text-[10px] text-[#d4af37] font-bold leading-tight line-clamp-2">{livro.titulo}</p>
                    </div>
                    {/* Triângulo indicador */}
                    <div className="w-2 h-2 bg-[#d4af37] transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>

              </div>
            ))}
        </div>

        {/* BASE DA PRATELEIRA (Madeira Sólida) */}
        <div className="relative w-full h-10 bg-[#2a1b15] shadow-2xl z-20 border-t border-[#3e2723]">
             <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
             <div className="absolute top-1 left-0 right-0 h-[1px] bg-[#5d4037] opacity-50"></div>
        </div>

      </div>
    </div>
  );
}