import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LivroCard from '../components/LivroCard';
import EstanteVirtual from '../components/EstanteVirtual'; 
import { Button } from '../components/ui/Button';
import { LayoutGrid, Library, Search, Filter, BookOpen, Feather } from 'lucide-react'; 

// Firebase
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Historico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de Visualização
  const [modoVisualizacao, setModoVisualizacao] = useState('grid');

  // Filtros
  const [busca, setBusca] = useState('');
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
    if(!window.confirm("Deseja expurgar esta obra do seu acervo?")) return;
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

  // Estilos tipográficos clássicos para os formulários
  const inputClass = "bg-surface/50 border border-dark-gold/20 rounded-sm p-3 text-antique-white focus:border-burnished-gold outline-none transition-colors font-sans-modern text-sm w-full";
  const labelClass = "text-[10px] font-bold text-muted-silver uppercase tracking-[0.2em] mb-2 block";

  return (
    // Removido bg-rich-charcoal para vazar a textura
    <div className="min-h-screen bg-transparent text-antique-white pb-24 animate-fade-in relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        
        {/* CABEÇALHO EDITORIAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-dark-gold/20 pb-8 gap-6">
          <div>
              <h1 className="font-serif-display text-5xl text-burnished-gold mb-3 tracking-tight">Acervo Pessoal</h1>
              <p className="text-muted-silver font-light text-lg">Catálogo histórico das suas jornadas literárias.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-surface/60 border border-dark-gold/20 rounded-sm p-1 flex shadow-editorial">
                 <button onClick={() => setModoVisualizacao('grid')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-medium transition-all ${modoVisualizacao === 'grid' ? 'bg-burnished-gold text-rich-charcoal' : 'text-muted-silver hover:text-antique-white'}`}>
                    <LayoutGrid size={14} /> Índice
                 </button>
                 <button onClick={() => setModoVisualizacao('estante')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-medium transition-all ${modoVisualizacao === 'estante' ? 'bg-burnished-gold text-rich-charcoal' : 'text-muted-silver hover:text-antique-white'}`}>
                    <Library size={14} /> Estante
                 </button>
              </div>
              <Button onClick={() => navigate('/adicionar')} className="bg-transparent border border-burnished-gold text-burnished-gold hover:bg-burnished-gold hover:text-rich-charcoal rounded-sm uppercase tracking-widest text-xs py-3 px-6 transition-all">
                  Catalogar Nova Obra
              </Button>
          </div>
        </header>
        
        {/* PAINEL DE BUSCA - Estilo Ficha de Biblioteca */}
        <div className="bg-surface/40 p-8 rounded-sm border border-dark-gold/10 shadow-editorial space-y-6">
            <div className="flex items-center gap-3 text-burnished-gold mb-4 border-b border-dark-gold/10 pb-4">
                <Filter size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Filtros de Catalogação</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <label className={labelClass}>Consultar Registros</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-dark-gold h-4 w-4" />
                        <input type="text" placeholder="Título ou Autor..." className={`${inputClass} pl-10`} value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </div>
                </div>

                <div className="lg:col-span-1 flex gap-4">
                    <div className="flex-1">
                        <label className={labelClass}>Início (De)</label>
                        <input type="date" className={inputClass} value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Término (Até)</label>
                        <input type="date" className={inputClass} value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
                    </div>
                </div>

                <div className="lg:col-span-1 flex gap-4">
                    <div className="flex-1">
                        <label className={labelClass}>Status</label>
                        <select className={inputClass + " cursor-pointer appearance-none"} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Todo o Acervo</option>
                            <option value="LIDO">Obras Lidas</option>
                            <option value="LENDO">Leitura Atual</option>
                            <option value="QUERO_LER">Lista de Desejos</option>
                            <option value="ABANDONADO">Abandonados</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Ordem</label>
                        <select className={inputClass + " cursor-pointer appearance-none"} value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                            <option value="recente">Mais Recentes</option>
                            <option value="antigo">Mais Antigos</option>
                            <option value="nota">Maior Nota</option>
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-1 flex items-end">
                    <button 
                        onClick={() => setSoFavoritos(!soFavoritos)} 
                        className={`w-full h-[46px] rounded-sm border transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold ${
                            soFavoritos 
                            ? 'bg-burnished-gold/10 border-burnished-gold text-burnished-gold' 
                            : 'bg-transparent border-dark-gold/20 text-muted-silver hover:border-burnished-gold/50 hover:text-antique-white'
                        }`}
                    >
                        {soFavoritos ? 'Obras Favoritas' : 'Filtrar Favoritos'}
                    </button>
                </div>
            </div>
        </div>
        
        {/* EXIBIÇÃO DE RESULTADOS */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-silver opacity-60 animate-pulse gap-4">
               <Feather size={32} className="text-burnished-gold" />
               <p className="font-serif-display text-sm tracking-widest uppercase text-burnished-gold">Explorando estantes...</p>
            </div>
        ) : livrosFiltrados.length === 0 ? (
           <div className="text-center py-24 border border-dark-gold/10 rounded-sm bg-surface/30 shadow-editorial">
              <BookOpen className="h-12 w-12 text-dark-gold/40 mx-auto mb-6" />
              <p className="font-serif-display text-2xl text-antique-white mb-2">Nenhum registro encontrado.</p>
              <p className="text-sm font-light text-muted-silver">Ajuste os filtros de busca ou catalogue uma nova obra.</p>
           </div>
        ) : (
           <div className="animate-slide-up pt-4">
              {modoVisualizacao === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {livrosFiltrados.map(livro => (
                        <LivroCard key={livro.id} livro={livro} onDelete={handleDelete} onEdit={(id) => navigate(`/editar/${id}`)}/>
                    ))}
                </div>
              ) : (
                <div className="bg-surface/80 border border-dark-gold/10 rounded-sm p-8 shadow-editorial overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-rich-charcoal/40 to-transparent pointer-events-none"></div>
                    <EstanteVirtual livros={livrosFiltrados} />
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}