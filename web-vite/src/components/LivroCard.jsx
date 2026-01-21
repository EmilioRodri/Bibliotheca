import React from 'react';
import { Link } from 'react-router-dom';
import StarRatingDisplay from './StarRatingDisplay';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Classificacao = ({ nota }) => {
  if (!nota) return null;
  return (
    <div className="absolute top-3 right-3 bg-rich-charcoal/90 backdrop-blur-md px-2 py-1 rounded border border-white/10 shadow-lg z-10">
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

  // Lógica para determinar a cor e texto da Tag
  const getStatusInfo = (status) => {
      switch(status) {
          case 'lendo': return { label: 'Lendo Agora', style: 'bg-burnished-gold text-rich-charcoal' };
          case 'quero-ler': return { label: 'Quero Ler', style: 'bg-purple-900/50 text-purple-200 border border-purple-500/30' };
          default: return { label: 'Lido', style: 'bg-muted-silver/20 text-muted-silver' };
      }
  };

  const statusInfo = getStatusInfo(livro.status);

  return (
    <div className="group relative flex flex-col bg-surface rounded-lg border border-muted-silver/10 shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full">
      
      <Link to={`/livro/${livro.id}`} className="flex-grow flex flex-col relative">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-rich-charcoal">
            <img
              src={livro.urlCapa || capaPadrao}
              alt={livro.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              onError={(e) => e.target.src = capaPadrao} 
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent opacity-80"></div>
            <Classificacao nota={livro.classificacao} />

            <button 
                onClick={toggleFavorito}
                className="absolute top-3 left-3 z-20 text-2xl drop-shadow-md hover:scale-110 transition-transform"
                title={livro.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                {livro.favorito ? "❤️" : "🤍"}
            </button>
        </div>

        <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-serif-display text-xl leading-tight text-antique-white mb-1 line-clamp-2">
              {livro.titulo}
            </h3>
            <p className="font-sans-modern text-sm text-muted-silver font-medium mb-3">
              {livro.autor}
            </p>
            
            {/* CORREÇÃO: Tag de Status Dinâmica */}
            <div className="mt-auto">
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${statusInfo.style}`}>
                    {statusInfo.label}
                </span>
            </div>
        </div>
      </Link>
      
      <div className="p-5 pt-0 mt-auto flex gap-3">
        <button onClick={() => onEdit(livro.id)} className="flex-1 py-2 px-3 rounded border border-muted-silver/20 text-muted-silver text-sm font-bold hover:border-burnished-gold hover:text-burnished-gold transition-colors">
          Editar
        </button>
        <button onClick={() => onDelete(livro.id)} className="flex-1 py-2 px-3 rounded border border-red-900/30 text-red-400/80 text-sm font-bold hover:bg-red-900/10 hover:text-red-400 transition-colors">
          Excluir
        </button>
      </div>
    </div>
  );
}