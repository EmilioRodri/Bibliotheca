import React, { useEffect, useState } from 'react';
// IMPORTANTE: Adicionei useLocation
import { useNavigate, useLocation } from 'react-router-dom';
import LivroCard from '../components/LivroCard';
import EstanteVirtual from '../components/EstanteVirtual'; 
import { Button } from '../components/ui/Button';
import { LayoutGrid, Library, Search, Calendar, Filter, BookOpen } from 'lucide-react'; 

// Firebase
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Historico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para pegar os parâmetros enviados
  
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de Visualização
  const [modoVisualizacao, setModoVisualizacao] = useState('grid');

  // Filtros
  const [busca, setBusca] = useState('');
  
  // --- MUDANÇA AQUI: Inicia o filtro com o que veio da navegação (se existir) ---
  // Se location.state.filtro for 'QUERO_LER', ele já abre filtrado.
  const [filtroStatus, setFiltroStatus] = useState(location.state?.filtro || 'todos');
  
  // Estados de Data
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [soFavoritos, setSoFavoritos] = useState(false);
  const [ordenacao, setOrdenacao] = useState('recente');

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, "livros"), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLivros(dados);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if(!window.confirm("Eliminar este livro?")) return;
    try { await deleteDoc(doc(db, "livros", id)); } 
    catch (error) { console.error(error); }
  };

  // Lógica de Filtragem
  const livrosFiltrados = livros
    .filter(l => {
        const textoMatch = l.titulo?.toLowerCase().includes(busca.toLowerCase()) || l.autor?.toLowerCase().includes(busca.toLowerCase());
        const statusMatch = filtroStatus === 'todos' ? true : l.status === filtroStatus;
        const favMatch = soFavoritos ? l.favorito === true : true;
        
        const dataInicioMatch = filtroDataInicio ? (l.dataInicio && l.dataInicio >= filtroDataInicio) : true;
        const dataFimMatch = filtroDataFim ? (l.dataFim && l.dataFim <= filtroDataFim) : true;

        return textoMatch && statusMatch && favMatch && dataInicioMatch && dataFimMatch;
    })
    .sort((a, b) => {
        if (ordenacao === 'nota') return (Number(b.classificacao) || 0) - (Number(a.classificacao) || 0);
        if (ordenacao === 'antigo') return new Date(a.dataAdicao) - new Date(b.dataAdicao);
        return new Date(b.dataAdicao) - new Date(a.dataAdicao);
    });

  const inputClass = "bg-rich-charcoal/50 border border-muted-silver/20 rounded-lg p-2.5 text-antique-white focus:ring-1 focus:ring-burnished-gold focus:border-burnished-gold outline-none placeholder-gray-600 transition-all text-sm";
  const labelClass = "text-xs font-bold text-muted-silver uppercase tracking-wider mb-1 block";

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white p-6 md:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-muted-silver/10 pb-6 gap-6">
          <div>
              <h1 className="font-serif-display text-4xl text-burnished-gold mb-2">Minha Coleção</h1>
              <p className="text-muted-silver font-light">Gerencie e organize sua jornada literária.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-surface border border-muted-silver/10 rounded-lg p-1 flex">
                 <button onClick={() => setModoVisualizacao('grid')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${modoVisualizacao === 'grid' ? 'bg-burnished-gold text-rich-charcoal' : 'text-muted-silver hover:text-white'}`}>
                    <LayoutGrid size={16} /> Grid
                 </button>
                 <button onClick={() => setModoVisualizacao('estante')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${modoVisualizacao === 'estante' ? 'bg-burnished-gold text-rich-charcoal' : 'text-muted-silver hover:text-white'}`}>
                    <Library size={16} /> Estante 3D
                 </button>
              </div>
              <Button onClick={() => navigate('/adicionar')} className="shadow-lg hover:shadow-burnished-gold/20">+ Novo Livro</Button>
          </div>
        </header>
        
        <div className="bg-surface p-6 rounded-xl border border-muted-silver/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-burnished-gold mb-2">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">Filtros Avançados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                    <label className={labelClass}>Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
                        <input type="text" placeholder="Título ou Autor..." className={`${inputClass} w-full pl-9`} value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </div>
                </div>

                <div className="lg:col-span-1 flex gap-2">
                    <div className="flex-1">
                        <label className={labelClass}>De</label>
                        <input type="date" className={inputClass + " w-full"} value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Até</label>
                        <input type="date" className={inputClass + " w-full"} value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
                    </div>
                </div>

                <div className="lg:col-span-1 flex gap-2">
                    <div className="flex-1">
                        <label className={labelClass}>Status</label>
                        <select className={inputClass + " w-full cursor-pointer"} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Todos</option>
                            <option value="LIDO">✅ Lidos</option>
                            <option value="LENDO">📖 Lendo</option>
                            <option value="QUERO_LER">🌟 Desejos</option>
                            <option value="ABANDONADO">❌ Abandonados</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Ordenar</label>
                        <select className={inputClass + " w-full cursor-pointer"} value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                            <option value="recente">Recentes</option>
                            <option value="antigo">Antigos</option>
                            <option value="nota">Melhor Nota</option>
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-1 flex items-end">
                    <button onClick={() => setSoFavoritos(!soFavoritos)} className={`w-full h-[42px] rounded-lg border transition-all flex items-center justify-center gap-2 text-sm font-medium ${soFavoritos ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'border-muted-silver/20 text-muted-silver hover:border-burnished-gold/50 hover:text-white'}`}>
                        {soFavoritos ? '❤️ Apenas Favoritos' : '🤍 Ver Favoritos'}
                    </button>
                </div>
            </div>
        </div>
        
        {loading ? (
           <div className="text-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burnished-gold mx-auto mb-4"></div>
             <p className="text-muted-silver animate-pulse">Carregando sua biblioteca...</p>
           </div>
        ) : livrosFiltrados.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-muted-silver/10 rounded-xl bg-surface/30">
              <BookOpen className="h-16 w-16 text-muted-silver/20 mx-auto mb-4" />
              <p className="text-xl text-muted-silver mb-2">Nenhum livro encontrado.</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros ou adicione um novo livro.</p>
           </div>
        ) : (
           <div className="animate-slide-up">
              {modoVisualizacao === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {livrosFiltrados.map(livro => (
                        <LivroCard key={livro.id} livro={livro} onDelete={handleDelete} onEdit={(id) => navigate(`/editar/${id}`)}/>
                    ))}
                </div>
              ) : (
                <div className="bg-surface border border-muted-silver/10 rounded-xl p-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
                    <EstanteVirtual livros={livrosFiltrados} />
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}