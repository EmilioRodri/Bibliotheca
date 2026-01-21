import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Edit, ShoppingCart, Star, Quote, BookOpen, Plus } from 'lucide-react';

// --- SEUS IMPORTS REAIS (Certifique-se que os caminhos estão corretos) ---
import StarRatingDisplay from '../components/StarRatingDisplay'; 
import { db } from '../firebaseConfig';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// ==================================================================================
// 1. COMPONENTE DE IMAGEM SEGURA
// Garante que o layout 3D nunca quebre, mesmo se a imagem da capa falhar
// ==================================================================================
const SafeCoverImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  // Se der erro ou não tiver URL, mostra um placeholder elegante
  if (error || !src) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/10 to-transparent opacity-30" />
        <BookOpen size={48} className="text-[#d4af37] mb-4 opacity-50" />
        <h3 className="text-white/80 font-serif text-lg leading-tight line-clamp-3 z-10">{alt || "Sem Título"}</h3>
        <span className="text-[10px] text-white/30 mt-4 uppercase tracking-widest border-t border-white/10 pt-2 w-12 text-center">Capa</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-700"
      onError={() => setError(true)}
    />
  );
};

// ==================================================================================
// 2. COMPONENTE VISUAL (VIEW)
// Responsável apenas pelo design, animações 3D e renderização
// ==================================================================================
const DetalhesLivroView = ({ 
  livro, 
  handleDelete, 
  novaCitacao, 
  setNovaCitacao, 
  handleAddCitacao, 
  handleRemoveCitacao, 
  adicionandoCitacao, 
  navigate,
  amazonLink,
  backgroundImage 
}) => {
  
  // --- FÍSICA DO TILT 3D ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const sheenOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.5]);
  const sheenGradient = useTransform(
    mouseX, 
    [-0.5, 0.5], 
    ["linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.0) 50%, transparent 55%)", 
     "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.0) 50%, transparent 55%)"]
  );

  const shadowX = useTransform(mouseX, [-0.5, 0.5], ["-30px", "30px"]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], ["-30px", "30px"]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = (event.clientX - rect.left) / width - 0.5;
    const mouseYFromCenter = (event.clientY - rect.top) / height - 0.5;
    x.set(mouseXFromCenter);
    y.set(mouseYFromCenter);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] font-sans overflow-hidden relative selection:bg-[#d4af37] selection:text-black">
      
      {/* FUNDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img 
            src={backgroundImage} 
            alt="Library Background" 
            className="w-full h-full object-cover opacity-30 blur-[2px]"
            onError={(e) => e.target.style.display = 'none'} // Fallback silencioso
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
         <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>
      </div>

      {/* BOTÃO VOLTAR */}
      <div className="absolute top-8 left-8 z-50">
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/50 hover:text-[#d4af37] transition-colors uppercase text-xs tracking-widest group bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Acervo
        </button>
      </div>

      {/* ÁREA PRINCIPAL */}
      <main 
        className="relative z-10 container mx-auto min-h-screen px-6 py-20 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 perspective-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1200px" }}
      >
        
        {/* ESQUERDA: CAPA 3D */}
        <motion.div 
            initial={{ opacity: 0, x: -50, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-sm shrink-0 relative perspective-1000 group"
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full aspect-[2/3] relative"
            >
                {/* Sombra Dinâmica */}
                <motion.div 
                    style={{ x: shadowX, y: shadowY, opacity: 0.6 }}
                    className="absolute top-10 left-10 w-full h-full bg-black blur-2xl -z-10 rounded-sm"
                />

                {/* Capa */}
                <div className="relative w-full h-full rounded-sm overflow-hidden border border-white/10 bg-[#121212] shadow-2xl">
                    <SafeCoverImage src={livro.urlCapa} alt={livro.titulo} />
                    
                    <motion.div 
                        style={{ background: sheenGradient, opacity: sheenOpacity }}
                        className="absolute inset-0 z-30 pointer-events-none mix-blend-plus-lighter"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none opacity-60" />
                </div>

                {/* Lombada/Páginas (Detalhe 3D) */}
                <motion.div 
                    style={{ translateZ: "-20px" }}
                    className="absolute top-1 bottom-1 right-1 w-4 bg-[#e5e5e5] -z-10 rounded-r-sm"
                />
            </motion.div>

            {/* Botões de Ação */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-col gap-3"
            >
                <a 
                    href={amazonLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-3 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest text-center hover:bg-[#e5c15d] transition-all rounded shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={16} /> Comprar Físico
                </a>
                <div className="flex gap-3">
                    <button onClick={() => navigate(`/editar/${livro.id}`)} className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-white/40 text-white/80 hover:text-white text-xs uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2">
                        <Edit size={14} /> Editar
                    </button>
                    <button onClick={handleDelete} className="flex-1 py-3 bg-red-500/10 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-200 text-xs uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2">
                        <Trash2 size={14} /> Excluir
                    </button>
                </div>
            </motion.div>
        </motion.div>

        {/* DIREITA: INFORMAÇÕES */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full max-w-2xl"
        >
            <div className="mb-10 border-b border-white/10 pb-8">
                <div className="flex items-center gap-4 text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                    <div className="flex items-center gap-1 bg-[#d4af37]/10 px-2 py-1 rounded">
                        <Star size={12} fill="#d4af37" />
                        <StarRatingDisplay rating={livro.classificacao} />
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{livro.totalPaginas ? `${livro.totalPaginas} Páginas` : 'N/D'}</span>
                    {livro.status === 'lendo' && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="text-green-400 animate-pulse">Lendo Agora</span>
                        </>
                    )}
                </div>

                <h1 className="text-5xl md:text-7xl font-serif text-white leading-[0.9] mb-4 tracking-tight">
                    {livro.titulo}
                </h1>
                <p className="text-xl md:text-2xl text-white/50 font-serif italic">
                    por <span className="text-white/80">{livro.autor}</span>
                </p>
            </div>

            {/* Resenha */}
            {livro.opiniao && (
                <div className="mb-12">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
                        <BookOpen size={14} /> Resenha Pessoal
                    </h3>
                    <div className="text-lg text-white/80 leading-relaxed font-serif pl-6 border-l-2 border-[#d4af37]/50">
                        "{livro.opiniao}"
                    </div>
                </div>
            )}

            {/* Citações */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/5 backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2"><Quote size={14} /> Citações Favoritas</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">{livro.citacoes?.length || 0}</span>
                </h3>

                <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                    <AnimatePresence>
                        {livro.citacoes && livro.citacoes.map((citacao, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group relative bg-black/40 p-4 rounded border border-white/5 hover:border-[#d4af37]/30 transition-colors"
                            >
                                <p className="text-white/70 italic font-serif text-sm">"{citacao}"</p>
                                <button onClick={() => handleRemoveCitacao(citacao)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 p-1 rounded">
                                    <Trash2 size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {(!livro.citacoes || livro.citacoes.length === 0) && (
                        <p className="text-white/20 text-sm italic text-center py-4">Nenhuma citação salva ainda.</p>
                    )}
                </div>

                <div className="mt-6 relative">
                    <input 
                        type="text" 
                        value={novaCitacao}
                        onChange={(e) => setNovaCitacao(e.target.value)}
                        onKeyDown={handleAddCitacao}
                        disabled={adicionandoCitacao}
                        placeholder="Adicionar nova citação (Enter)..."
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
};

// ==================================================================================
// 3. COMPONENTE LÓGICO (CONTAINER)
// ==================================================================================
export default function DetalhesLivro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Assume que retorna { user: { uid: ... } } ou null
  
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novaCitacao, setNovaCitacao] = useState('');
  const [adicionandoCitacao, setAdicionandoCitacao] = useState(false);

  const backgroundImage = "https://images.unsplash.com/photo-1507842217153-e52879d2b466?q=80&w=1920";

  // --- BUSCA DADOS ---
  useEffect(() => {
    // 1. Se não houver usuário, nem tenta buscar.
    if (!user) {
        setLoading(false); 
        return;
    }

    setLoading(true);

    const fetchLivro = async () => {
      try {
        const docRef = doc(db, "livros", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLivro({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn("Livro não encontrado.");
          navigate('/historico');
        }
      } catch (error) {
        console.error("Erro ao buscar livro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLivro();
  }, [id, user?.uid, navigate]); // CORREÇÃO CRÍTICA: use 'user?.uid' em vez de 'user'

  // --- AÇÕES ---
  const handleDelete = async () => {
    if (!window.confirm("Deseja remover esta obra do acervo?")) return;
    try {
      await deleteDoc(doc(db, "livros", id));
      navigate('/historico');
    } catch (error) { alert("Erro ao excluir."); }
  };

  const handleAddCitacao = async (e) => {
    if (e.key === 'Enter' && novaCitacao.trim()) {
        setAdicionandoCitacao(true);
        try {
            const docRef = doc(db, "livros", id);
            await updateDoc(docRef, { citacoes: arrayUnion(novaCitacao) });
            setLivro(prev => ({ ...prev, citacoes: [...(prev.citacoes || []), novaCitacao] }));
            setNovaCitacao('');
        } catch (error) { console.error(error); } 
        finally { setAdicionandoCitacao(false); }
    }
  };

  const handleRemoveCitacao = async (citacao) => {
      try {
        const docRef = doc(db, "livros", id);
        await updateDoc(docRef, { citacoes: arrayRemove(citacao) });
        setLivro(prev => ({ ...prev, citacoes: prev.citacoes.filter(c => c !== citacao) }));
      } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#d4af37] font-serif gap-4">
            <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
            <span className="text-xl animate-pulse">Carregando obra...</span>
        </div>
    );
  }

  if (!user) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
            <h2 className="text-xl">Faça login para ver detalhes</h2>
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200">Login</button>
        </div>
      );
  }

  if (!livro) return null;

  const amazonLink = livro.isbn 
    ? `https://www.amazon.com.br/s?k=${livro.isbn}`
    : `https://www.amazon.com.br/s?k=${encodeURIComponent(livro.titulo + ' ' + livro.autor)}`;

  return (
    <DetalhesLivroView 
        livro={livro}
        handleDelete={handleDelete}
        novaCitacao={novaCitacao}
        setNovaCitacao={setNovaCitacao}
        handleAddCitacao={handleAddCitacao}
        handleRemoveCitacao={handleRemoveCitacao}
        adicionandoCitacao={adicionandoCitacao}
        navigate={navigate}
        amazonLink={amazonLink}
        backgroundImage={backgroundImage}
    />
  );
}