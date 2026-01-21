import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Star, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Importação corrigida para garantir que encontra o arquivo firebaseConfig.js criado acima
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ListaDesejos() {
  const navigate = useNavigate();
  const [livrosDesejados, setLivrosDesejados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Estado para adicionar novo desejo rápido
  const [novoDesejo, setNovoDesejo] = useState({
    titulo: '',
    autor: '',
    genero: '',
    status: 'QUERO_LER' // Padrão forçado
  });

  // 1. Autenticação e Busca
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDesejos(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDesejos = async (userId) => {
    try {
      const q = query(collection(db, "livros"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // FILTRO: Apenas 'QUERO_LER'
      const apenasDesejos = lista.filter(livro => livro.status === 'QUERO_LER');
      setLivrosDesejados(apenasDesejos);
    } catch (err) {
      console.error("Erro ao buscar desejos:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Adicionar Desejo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novoDesejo.titulo || !user) return;

    try {
      await addDoc(collection(db, "livros"), {
        ...novoDesejo,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'QUERO_LER' // Garante que entra como desejo
      });

      setNovoDesejo({ titulo: '', autor: '', genero: '', status: 'QUERO_LER' });
      fetchDesejos(user.uid);
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  // 3. Mover para Lendo/Lido (Atualizar Status)
  const moverParaHistorico = async (id, novoStatus) => {
    try {
      const livroRef = doc(db, "livros", id);
      await updateDoc(livroRef, {
        status: novoStatus,
        dataInicio: novoStatus === 'LENDO' ? new Date().toISOString().split('T')[0] : null
      });
      fetchDesejos(user.uid); // Recarrega a lista (o livro vai sumir daqui, o que é o esperado)
      alert(`Livro movido para "${novoStatus}"!`);
    } catch (err) {
      console.error("Erro ao mover:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover da lista de desejos?")) return;
    try {
      await deleteDoc(doc(db, "livros", id));
      fetchDesejos(user.uid);
    } catch (err) {
      console.error(err);
    }
  };

  // Estilos
  const inputStyle = "w-full bg-rich-charcoal/50 border border-muted-silver/20 rounded-lg p-2.5 text-antique-white focus:ring-1 focus:ring-burnished-gold outline-none placeholder-gray-600 transition-all text-sm";

  return (
    <div className="min-h-screen bg-rich-charcoal p-6 md:p-12 text-antique-white animate-fade-in pb-24">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 border-b border-muted-silver/10 pb-6">
          <h1 className="font-serif-display text-4xl text-burnished-gold mb-2 flex items-center gap-3">
             <Star className="h-8 w-8" /> Lista de Desejos
          </h1>
          <p className="text-muted-silver font-light">Livros que você pretende ler futuramente.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLUNA 1: ADICIONAR RÁPIDO */}
          <div className="lg:col-span-1">
            <div className="bg-surface p-6 rounded-xl border border-muted-silver/10 shadow-xl sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-burnished-gold" /> Adicionar Desejo
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    value={novoDesejo.titulo} 
                    onChange={e => setNovoDesejo({...novoDesejo, titulo: e.target.value})} 
                    className={inputStyle} 
                    placeholder="Título do Livro..." 
                    required 
                />
                <input 
                    value={novoDesejo.autor} 
                    onChange={e => setNovoDesejo({...novoDesejo, autor: e.target.value})} 
                    className={inputStyle} 
                    placeholder="Autor..." 
                />
                <input 
                    value={novoDesejo.genero} 
                    onChange={e => setNovoDesejo({...novoDesejo, genero: e.target.value})} 
                    className={inputStyle} 
                    placeholder="Gênero (Opcional)" 
                />
                <button type="submit" className="w-full bg-burnished-gold/10 hover:bg-burnished-gold/20 text-burnished-gold border border-burnished-gold/50 font-bold py-2 px-4 rounded-lg transition-all">
                  Salvar Desejo
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA 2: LISTA */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-10 opacity-50">Carregando desejos...</div>
            ) : livrosDesejados.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-muted-silver/10 rounded-xl">
                <BookOpen className="h-12 w-12 text-muted-silver/30 mx-auto mb-3" />
                <p className="text-muted-silver">Sua lista de desejos está vazia.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livrosDesejados.map((livro) => (
                  <div key={livro.id} className="group bg-surface p-5 rounded-xl border border-muted-silver/10 hover:border-burnished-gold/30 transition-all hover:shadow-lg relative">
                    
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-serif-display text-antique-white group-hover:text-burnished-gold transition-colors truncate pr-6">{livro.titulo}</h3>
                        <button onClick={() => handleDelete(livro.id)} className="text-muted-silver hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-silver mb-4">{livro.autor}</p>
                    
                    {/* AÇÕES RÁPIDAS: MOVER PARA OUTRAS LISTAS */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                        <button 
                            onClick={() => moverParaHistorico(livro.id, 'LENDO')}
                            className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold bg-blue-900/20 text-blue-400 rounded hover:bg-blue-900/40 transition-colors"
                            title="Começar a Ler"
                        >
                            <Clock size={14} /> Ler Agora
                        </button>
                        <button 
                            onClick={() => moverParaHistorico(livro.id, 'LIDO')}
                            className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold bg-green-900/20 text-green-400 rounded hover:bg-green-900/40 transition-colors"
                            title="Já Li"
                        >
                            <CheckCircle size={14} /> Já Li
                        </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}