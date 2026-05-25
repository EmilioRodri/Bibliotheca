import React from 'react';
import { Link } from 'react-router-dom';
import StarRatingDisplay from './StarRatingDisplay';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Bookmark } from 'lucide-react'; 

const Classificacao = ({ nota }) => {
  if (!nota) return null;
  return (
    <div className="absolute top-3 right-3 bg-rich-charcoal/95 px-2 py-1 rounded-sm border border-dark-gold/20 shadow-editorial z-10">
      <StarRatingDisplay rating={nota} />
    </div>
  );
};

export default function LivroCard({ livro, onDelete, onEdit }) {
  const capaPadrao = "/image_3df126.jpg";
  
  const toggleFavorito = async (e) => {
    e.preventDefault(); 
    try {
        const docRef = doc(db, "livros", livro.id);
        await updateDoc(docRef, { favorito: !livro.favorito });
    } catch (error) { console.error("Erro ao favoritar", error); }
  };

  // Lógica de tags com estética editorial, sem cores neon
  const getStatusInfo = (status) => {
      const s = status?.toLowerCase();
      switch(s) {
          case 'lendo': 
              return { label: 'Leitura Atual', style: 'bg-burnished-gold text-rich-charcoal border-burnished-gold' };
          case 'quero-ler': 
          case 'quero_ler':
              return { label: 'Lista de Desejos', style: 'bg-transparent text-muted-silver border-dark-gold/40' };
          case 'abandonado':
              return { label: 'Abandonado', style: 'bg-transparent text-red-400/50 border-red-900/30' };
          default: 
              return { label: 'Obra Lida', style: 'bg-surface text-muted-silver border-dark-gold/10' };
      }
  };

  const statusInfo = getStatusInfo(livro.status);

  return (
    <div className="group relative flex flex-col bg-surface rounded-sm border border-dark-gold/10 shadow-editorial overflow-hidden transition-all duration-500 hover:border-burnished-gold/40 hover:-translate-y-1 h-full">
      
      <Link to={`/livro/${livro.id}`} className="flex-grow flex flex-col relative">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-rich-charcoal">
            <img
              src={livro.urlCapa || capaPadrao}
              alt={livro.titulo}
              // Efeito fotográfico: levemente opaco e com mais contraste até o hover
              className="w-full h-full object-cover filter brightness-90 contrast-125 grayscale-[15%] transition-all duration-700 group-hover:scale-105 group-hover:brightness-100 group-hover:grayscale-0"
              onError={(e) => e.target.src = capaPadrao} 
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface via-surface/80 to-transparent opacity-95"></div>
            
            <Classificacao nota={livro.classificacao} />

            {/* MARCADOR DE FAVORITO FÍSICO */}
            <button 
                onClick={toggleFavorito}
                className={`absolute top-3 left-3 z-20 p-2 rounded-sm border transition-all duration-300 backdrop-blur-md ${
                    livro.favorito 
                    ? 'bg-burnished-gold text-rich-charcoal border-burnished-gold shadow-[0_0_15px_rgba(194,168,120,0.3)]' 
                    : 'bg-rich-charcoal/60 text-muted-silver border-dark-gold/30 hover:text-burnished-gold hover:border-burnished-gold/50'
                }`}
                title={livro.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                <Bookmark size={14} fill={livro.favorito ? "currentColor" : "none"} />
            </button>
        </div>

        <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-serif-display text-xl leading-tight text-antique-white mb-2 line-clamp-2 group-hover:text-burnished-gold transition-colors">
              {livro.titulo}
            </h3>
            <p className="font-sans-modern text-[10px] text-burnished-gold uppercase tracking-[0.2em] font-bold mb-4">
              {livro.autor}
            </p>
            
            <div className="mt-auto">
                <span className={`text-[10px] px-2 py-1 border rounded-sm font-bold uppercase tracking-widest ${statusInfo.style}`}>
                    {statusInfo.label}
                </span>
            </div>
        </div>
      </Link>
      
      {/* BOTÕES DE AÇÃO - Rodapé Editorial */}
      <div className="flex border-t border-dark-gold/10 mt-auto bg-surface/50">
        <button 
            onClick={() => onEdit(livro.id)} 
            className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-silver hover:text-burnished-gold hover:bg-rich-charcoal/30 transition-colors border-r border-dark-gold/10"
        >
          Editar
        </button>
        <button 
            onClick={() => onDelete(livro.id)} 
            className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-silver hover:text-red-400 hover:bg-red-900/10 transition-colors"
        >
          Expurgar
        </button>
      </div>
    </div>
  );
}