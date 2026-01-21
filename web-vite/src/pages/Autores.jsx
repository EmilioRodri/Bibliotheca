import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
// Se der erro nestes imports, certifique-se de rodar: npm install lucide-react
import { Search, Library, Quote, ArrowRight, Book } from 'lucide-react'; 

// --- IMPORTS REAIS DO SEU PROJETO ---
// Descomente e verifique se os caminhos estão corretos
import { Button } from '../components/ui/Button'; 
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// ==================================================================================
// 1. COMPONENTE DE APRESENTAÇÃO (VIEW)
// Responsável APENAS pelo visual 3D. Só recebe dados prontos.
// ==================================================================================
const AutoresView = ({ autores, selecionado, setSelecionado, wikiData, loadingWiki }) => {
  // --- HOOKS DE ANIMAÇÃO (Seguros aqui pois o componente só renderiza com dados) ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]); 
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

  const sheenOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.4]);
  const sheenGradient = useTransform(
    mouseX, 
    [-0.5, 0.5], 
    ["linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.6) 50%, transparent 55%)", 
     "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.0) 50%, transparent 55%)"]
  );

  const shadowX = useTransform(mouseX, [-0.5, 0.5], ["-30px", "30px"]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], ["-30px", "30px"]);

  const defaultImage = "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop"; 

  // Preparação de dados para renderização
  const dadosAtuais = useMemo(() => {
    if (!selecionado) return null;
    const data = {
      ...selecionado,
      bio: wikiData?.bio || selecionado.bio,
      imagem: wikiData?.imagem || selecionado.imagem,
      anos: wikiData?.anos || selecionado.anos,
      local: wikiData?.local || selecionado.local
    };
    if (!data.imagem) data.imagem = defaultImage;
    return data;
  }, [selecionado, wikiData]);

  // Handlers
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-orange-500/30">
      
      {/* Background Noise */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mix-blend-overlay" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0f0f0f] to-[#1a1a1a] -z-10"></div>

      {/* Sidebar Esquerda (Navegação) */}
      <nav className="w-full md:w-24 border-r border-white/5 z-30 flex md:flex-col items-center py-6 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mb-8 hidden md:block">
          <Library className="w-8 h-8 text-orange-100/80" />
        </div>
        
        <div className="flex md:flex-col gap-6 overflow-x-auto md:overflow-visible px-4 md:px-0 scrollbar-hide w-full md:w-auto items-center">
          {autores.map((autor) => {
             const thumb = (selecionado?.id === autor.id && wikiData?.imagem) ? wikiData.imagem : autor.imagem;
             const isActive = selecionado?.id === autor.id;
             return (
                <button
                    key={autor.id}
                    onClick={() => setSelecionado(autor)}
                    className={`relative group shrink-0 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                >
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-orange-200/60 scale-110 shadow-[0_0_20px_rgba(255,210,180,0.2)]' : 'border-white/10 grayscale'}`}>
                        <img src={thumb || defaultImage} alt={autor.nome} className="w-full h-full object-cover" onError={(e) => e.target.src = defaultImage} />
                    </div>
                </button>
             );
          })}
        </div>
      </nav>

      {/* Palco Principal 3D */}
      <main 
        className="flex-1 relative flex flex-col md:flex-row items-center justify-center p-6 md:p-12 lg:p-20 overflow-hidden perspective-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1200px" }} 
      >
        {/* Topbar */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-40 pointer-events-none px-12">
            <div className="text-xs font-bold tracking-[0.3em] uppercase pointer-events-auto text-white/30 border-b border-white/10 pb-2"></div>
            <div className="pointer-events-auto flex items-center gap-4">
                <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors text-white/60" />
            </div>
        </div>

        <AnimatePresence mode='wait'>
          {dadosAtuais && (
            <div key={dadosAtuais.id} className="flex flex-col md:flex-row w-full h-full items-center justify-center gap-8 md:gap-16 lg:gap-24 relative z-10 max-w-7xl mx-auto">
                
                {/* Texto (Esquerda) */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col justify-center items-start text-left max-w-xl z-20 pointer-events-none md:pointer-events-auto"
                >
                    <div className="flex items-center gap-3 text-orange-200/50 font-mono text-xs tracking-widest uppercase mb-6">
                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{dadosAtuais.anos || "Autor"}</span>
                        <span className="w-px h-3 bg-white/20"></span>
                        <span>{dadosAtuais.local || "Biblioteca"}</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-white leading-[0.9] tracking-tight mb-8">
                        {dadosAtuais.nome ? dadosAtuais.nome.split(" ").slice(0, 3).map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        )) : "Sem Nome"}
                    </h1>

                    <div className="relative pl-6 border-l-2 border-orange-500/30">
                        <p className="text-white/60 text-sm md:text-lg leading-relaxed font-sans line-clamp-6">
                             {loadingWiki ? "Buscando informações..." : dadosAtuais.bio}
                        </p>
                    </div>

                    <div className="mt-12 flex gap-12 border-t border-white/5 pt-8 w-full">
                        <div>
                            <span className="block text-4xl font-serif text-white">{dadosAtuais.livros ? dadosAtuais.livros.length : 0}</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Obras</span>
                        </div>
                    </div>
                </motion.div>

                {/* Imagem 3D (Direita) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 w-full max-w-md aspect-[3/4] relative perspective-1000 group z-30"
                >
                    <motion.div
                        style={{ 
                            rotateX: rotateX, 
                            rotateY: rotateY,
                            transformStyle: "preserve-3d" 
                        }}
                        className="w-full h-full relative"
                    >
                        {/* Shadow com variáveis de transform seguras */}
                        <motion.div 
                            style={{ 
                                x: shadowX, 
                                y: shadowY,
                                opacity: 0.5
                            }}
                            className="absolute top-8 left-8 w-full h-full bg-black blur-3xl -z-10 rounded-sm"
                        />

                        {/* Imagem Container */}
                        <div className="relative w-full h-full rounded-[2px] overflow-hidden border border-white/10 bg-[#121212] shadow-2xl">
                            <motion.img 
                                src={dadosAtuais.imagem} 
                                alt={dadosAtuais.nome}
                                className="w-full h-full object-cover object-top filter brightness-[0.85] contrast-[1.1] group-hover:brightness-100 transition-all duration-700 ease-out"
                                onError={(e) => e.target.src = defaultImage}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-90" />
                            
                            <div className="absolute bottom-10 left-8 right-8 z-20 transform translate-z-10">
                                <Quote className="text-orange-400 w-8 h-8 mb-4 opacity-80" />
                                <p className="font-serif text-2xl md:text-3xl text-white leading-tight italic drop-shadow-lg text-pretty">
                                    "{dadosAtuais.citacao || (dadosAtuais.livros[0] && dadosAtuais.livros[0].titulo) || "Coleção Pessoal"}"
                                </p>
                                <div className="h-1 w-12 bg-orange-500 mt-6 rounded-full"></div>
                            </div>

                            <motion.div 
                                style={{ background: sheenGradient, opacity: sheenOpacity }}
                                className="absolute inset-0 z-30 pointer-events-none mix-blend-plus-lighter"
                            />
                        </div>

                        {/* Elementos flutuantes */}
                        <motion.div 
                            style={{ translateZ: "50px" }}
                            className="absolute -inset-6 border border-white/5 rounded-sm z-40 pointer-events-none hidden lg:block"
                        />
                    </motion.div>
                </motion.div>

            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar Direita (Livros) */}
      <aside className="hidden xl:flex w-80 border-l border-white/5 z-30 bg-[#0a0a0a]/50 backdrop-blur-sm p-8 flex-col h-full">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Bibliografia</h3>
             <ArrowRight size={14} className="text-white/30" />
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2">
            {/* REMOVIDO AnimatePresence complexo para evitar bugs de lista */}
            <div className="flex flex-col gap-4">
                {dadosAtuais && dadosAtuais.livros && dadosAtuais.livros.map((livro, index) => (
                    <div
                        key={`${dadosAtuais.id}-${livro.id}`}
                        className="group cursor-pointer flex gap-4 items-center p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                        <div className="w-12 h-16 shrink-0 rounded-[2px] overflow-hidden shadow-lg bg-white/10 relative">
                            <img src={livro.capa} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => e.target.src = "https://via.placeholder.com/150x200?text=Capa"} />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-serif text-white/90 text-sm leading-tight group-hover:text-orange-200 transition-colors line-clamp-2">
                                {livro.titulo}
                            </h4>
                            <span className="text-[10px] text-white/40 mt-1 font-mono">
                                {livro.ano}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </aside>
    </div>
  );
};

// ==================================================================================
// 2. COMPONENTE LÓGICO (CONTAINER)
// Responsável pelos DADOS e ESTADO. Só monta a View quando estiver tudo pronto.
// ==================================================================================
export default function Autores() {
  const { user } = useAuth(); // Se der erro aqui, verifique se está dentro do AuthProvider no App.js
  
  const [autores, setAutores] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wikiData, setWikiData] = useState(null);
  const [loadingWiki, setLoadingWiki] = useState(false);

  // --- BUSCA DADOS FIREBASE ---
  useEffect(() => {
    // Proteção: Se não tiver user, para de carregar e retorna.
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);

    // Variável para evitar atualização de estado se o componente desmontar
    let isMounted = true; 

    const q = query(collection(db, "livros"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;

        const livros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const defaultImage = "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop"; 

        const grupos = livros.reduce((acc, livro) => {
            const nomeAutor = livro.autor?.trim() || "Autor Desconhecido";
            if (!acc[nomeAutor]) {
                acc[nomeAutor] = {
                    id: nomeAutor,
                    nome: nomeAutor,
                    anos: "", 
                    local: "",
                    bio: `Autor catalogado em sua coleção pessoal com ${1} obra(s).`,
                    imagem: defaultImage,
                    citacao: `Autor de "${livro.titulo}"`,
                    livros: []
                };
            } else {
                acc[nomeAutor].bio = `Autor catalogado em sua coleção pessoal com ${acc[nomeAutor].livros.length + 1} obras.`;
            }
            acc[nomeAutor].livros.push({
                id: livro.id,
                titulo: livro.titulo,
                ano: livro.totalPaginas ? `${livro.totalPaginas} págs` : "N/A",
                capa: livro.urlCapa || defaultImage
            });
            return acc;
        }, {});

        const listaAutores = Object.values(grupos).sort((a, b) => a.nome.localeCompare(b.nome));
        setAutores(listaAutores);
        
        if (listaAutores.length > 0) {
            setSelecionado(prev => {
                const existe = listaAutores.find(a => a.id === prev?.id);
                return existe ? existe : listaAutores[0];
            });
        }
        setLoading(false);
    }, (error) => {
        console.error("Erro Firebase:", error);
        if (isMounted) setLoading(false);
    });

    return () => {
        isMounted = false;
        unsubscribe();
    };
  }, [user]);

  // --- BUSCA WIKIPEDIA ---
  useEffect(() => {
    if (!selecionado) return;
    let isMounted = true;

    const fetchWikipediaData = async () => {
      setLoadingWiki(true);
      if (isMounted) setWikiData(null); 

      try {
        const response = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selecionado.nome)}`);
        if (response.ok && isMounted) {
          const data = await response.json();
          if (data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
             setWikiData({
               bio: data.extract,
               imagem: data.originalimage?.source || data.thumbnail?.source,
               anos: data.description ? data.description.charAt(0).toUpperCase() + data.description.slice(1) : "Escritor(a)", 
               local: "Via Wikipédia"
             });
          }
        }
      } catch (error) {
        console.error("Erro wiki:", error);
      } finally {
        if (isMounted) setLoadingWiki(false);
      }
    };

    fetchWikipediaData();
    return () => { isMounted = false; };
  }, [selecionado?.id]);

  // --- RENDERIZAÇÃO CONDICIONAL SEGURA (LÓGICA) ---
  // Aqui podemos usar returns condicionais à vontade, pois não estamos dentro do componente visual que tem hooks 3D.

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white/50 font-serif">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-xs uppercase tracking-widest">Carregando Acervo...</p>
        </div>
    );
  }

  if (!user) {
     return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
            <h2 className="font-serif text-3xl text-white/80">Faça login para ver sua galeria</h2>
            <Button onClick={() => window.location.href='/login'} className="bg-white text-black hover:bg-gray-200">Ir para Login</Button>
        </div>
     );
  }

  if (autores.length === 0) {
     return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
            <h2 className="font-serif text-3xl text-white/80">Sua galeria está vazia</h2>
            <div className="flex flex-col items-center gap-2 text-white/50 mb-4">
                <Book size={48} />
                <p>Nenhum autor encontrado nos seus livros.</p>
            </div>
            <Button onClick={() => window.location.href='/adicionar'} className="bg-white text-black hover:bg-gray-200">Adicionar Primeiro Livro</Button>
        </div>
     );
  }

  // Se passou por tudo, monta a View 3D com dados seguros
  return (
    <AutoresView 
        autores={autores} 
        selecionado={selecionado} 
        setSelecionado={setSelecionado} 
        wikiData={wikiData} 
        loadingWiki={loadingWiki} 
    />
  );
}