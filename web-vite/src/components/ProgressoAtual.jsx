import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export default function ProgressoAtual() {
  const { user } = useAuth();
  const [lendo, setLendo] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado local para inputs de atualização (para não salvar a cada dígito)
  const [editando, setEditando] = useState({});

  useEffect(() => {
    if (!user) return;

    // Busca apenas livros com status 'lendo'
    const q = query(
      collection(db, "livros"), 
      where("uid", "==", user.uid),
      where("status", "==", "lendo")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Garante que paginasLidas existe, senão começa com 0
        paginasLidas: doc.data().paginasLidas || 0
      }));
      setLendo(dados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const atualizarPagina = async (id, novaPagina, total) => {
    const paginaLimpa = Math.min(Math.max(0, Number(novaPagina)), Number(total));
    
    try {
        await updateDoc(doc(db, "livros", id), {
            paginasLidas: paginaLimpa
        });
        
        // Limpa o estado de edição para fechar o input
        setEditando(prev => ({ ...prev, [id]: false }));
    } catch (error) {
        console.error("Erro ao atualizar progresso:", error);
    }
  };

  const concluirLeitura = async (livro) => {
    if(!window.confirm(`Parabéns! Deseja marcar "${livro.titulo}" como concluído?`)) return;

    try {
        await updateDoc(doc(db, "livros", livro.id), {
            status: 'lido',
            paginasLidas: livro.totalPaginas,
            dataTermino: new Date().toISOString()
        });
    } catch (error) {
        console.error("Erro ao concluir:", error);
    }
  };

  if (loading) return null; // Ou um spinner pequeno
  if (lendo.length === 0) return null; // Se não estiver lendo nada, não mostra o componente

  return (
    <section className="space-y-6 animate-fade-in mb-12">
      <h2 className="font-serif-display text-2xl text-antique-white border-l-4 border-burnished-gold pl-4">
        Lendo Atualmente
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lendo.map(livro => {
            const porcentagem = Math.round((livro.paginasLidas / livro.totalPaginas) * 100) || 0;
            
            return (
                <div key={livro.id} className="bg-surface p-6 rounded-xl border border-muted-silver/10 shadow-lg flex gap-6 items-center">
                    
                    {/* Capa Pequena */}
                    <div className="w-20 h-28 flex-shrink-0 bg-rich-charcoal rounded shadow overflow-hidden">
                        <img 
                            src={livro.urlCapa} 
                            alt={livro.titulo} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>

                    {/* Dados e Controles */}
                    <div className="flex-grow space-y-3">
                        <div>
                            <h3 className="text-lg font-bold text-antique-white leading-tight mb-1">{livro.titulo}</h3>
                            <p className="text-xs text-muted-silver uppercase tracking-wider">{livro.autor}</p>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-burnished-gold font-bold">
                                <span>{porcentagem}% Concluído</span>
                                <span>{livro.paginasLidas} / {livro.totalPaginas} pág</span>
                            </div>
                            <div className="w-full h-2 bg-rich-charcoal rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-burnished-gold transition-all duration-500"
                                    style={{ width: `${porcentagem}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 pt-1">
                            {editando[livro.id] ? (
                                <div className="flex gap-2 w-full animate-fade-in">
                                    <input 
                                        type="number" 
                                        className="w-20 bg-rich-charcoal border border-burnished-gold/50 rounded px-2 text-sm text-white focus:outline-none"
                                        defaultValue={livro.paginasLidas}
                                        id={`input-${livro.id}`}
                                    />
                                    <button 
                                        onClick={() => {
                                            const val = document.getElementById(`input-${livro.id}`).value;
                                            atualizarPagina(livro.id, val, livro.totalPaginas);
                                        }}
                                        className="text-xs bg-burnished-gold text-rich-charcoal font-bold px-2 rounded hover:bg-white transition"
                                    >
                                        OK
                                    </button>
                                    <button 
                                        onClick={() => setEditando(prev => ({ ...prev, [livro.id]: false }))}
                                        className="text-xs text-red-400 px-1"
                                    >
                                        X
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setEditando(prev => ({ ...prev, [livro.id]: true }))}
                                        className="text-xs border border-muted-silver/30 text-muted-silver hover:text-white hover:border-white px-3 py-1 rounded transition"
                                    >
                                        Atualizar Pág.
                                    </button>
                                    
                                    {porcentagem >= 90 && (
                                        <button 
                                            onClick={() => concluirLeitura(livro)}
                                            className="text-xs bg-burnished-gold/10 text-burnished-gold border border-burnished-gold/30 hover:bg-burnished-gold hover:text-rich-charcoal px-3 py-1 rounded transition ml-auto"
                                        >
                                            Concluir
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </section>
  );
}